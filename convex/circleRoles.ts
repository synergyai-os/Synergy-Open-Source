import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { captureCreate, captureUpdate, captureArchive, captureRestore } from './orgVersionHistory';
import { requireQuickEditPermission } from './orgChartPermissions';
import {
	countLeadRoles,
	hasDuplicateRoleName,
	isLeadRequiredForCircleType,
	isLeadTemplate
} from './core/roles';

/**
 * Circle Roles represent organizational accountabilities within circles
 * Examples: "Circle Lead", "Dev Lead", "Facilitator"
 *
 * NOTE: These are NOT RBAC permissions (access control), but organizational
 * roles that define who does what work. Action items are assigned to roles,
 * not people directly.
 */

async function ensureWorkspaceMembership(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		throw new Error('You do not have access to this workspace');
	}
}

async function ensureCircleExists(
	ctx: QueryCtx | MutationCtx,
	circleId: Id<'circles'>
): Promise<{ circleId: Id<'circles'>; workspaceId: Id<'workspaces'> }> {
	const circle = await ctx.db.get(circleId);
	if (!circle) {
		throw new Error('Circle not found');
	}
	return { circleId: circle._id, workspaceId: circle.workspaceId };
}

/**
 * Check if a role is a Lead role
 * Lead role = role with templateId pointing to template with isRequired: true
 */
async function isLeadRole(
	ctx: QueryCtx | MutationCtx,
	roleId: Id<'circleRoles'>
): Promise<boolean> {
	const role = await ctx.db.get(roleId);
	if (!role || !role.templateId) {
		return false;
	}

	const template = await ctx.db.get(role.templateId);
	return isLeadTemplate(template);
}

/**
 * Check if user is workspace admin or owner
 */
async function isWorkspaceAdmin(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<boolean> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		return false;
	}

	return membership.role === 'owner' || membership.role === 'admin';
}

/**
 * Count active Lead roles in a circle
 */
async function countLeadRolesInCircle(
	ctx: QueryCtx | MutationCtx,
	circleId: Id<'circles'>
): Promise<number> {
	const roles = await ctx.db
		.query('circleRoles')
		.withIndex('by_circle_archived', (q) => q.eq('circleId', circleId).eq('archivedAt', undefined))
		.collect();

	// Fetch templates once to avoid redundant lookups
	const templateIds = Array.from(
		new Set(roles.map((role) => role.templateId).filter((id): id is Id<'roleTemplates'> => !!id))
	);

	const templates = await Promise.all(
		templateIds.map(async (templateId) => ({
			templateId,
			template: await ctx.db.get(templateId)
		}))
	);

	const templateMap = new Map<Id<'roleTemplates'>, Doc<'roleTemplates'> | null>(
		templates.map(({ templateId, template }) => [templateId, template])
	);

	return countLeadRoles(roles, (templateId) => templateMap.get(templateId));
}

/**
 * List all roles in a circle
 * By default, excludes archived roles. Set includeArchived=true to include them.
 */
export const listByCircle = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const { workspaceId } = await ensureCircleExists(ctx, args.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		// Get roles - exclude archived by default
		const roles = args.includeArchived
			? await ctx.db
					.query('circleRoles')
					.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
					.collect()
			: await ctx.db
					.query('circleRoles')
					.withIndex('by_circle_archived', (q) =>
						q.eq('circleId', args.circleId).eq('archivedAt', undefined)
					)
					.collect();

		// Get filler count and scope for each role (active assignments only)
		const rolesWithFillers = await Promise.all(
			roles.map(async (role) => {
				const assignments = args.includeArchived
					? await ctx.db
							.query('userCircleRoles')
							.withIndex('by_role', (q) => q.eq('circleRoleId', role._id))
							.collect()
					: await ctx.db
							.query('userCircleRoles')
							.withIndex('by_role_archived', (q) =>
								q.eq('circleRoleId', role._id).eq('archivedAt', undefined)
							)
							.collect();

				// Extract scope from assignments
				// If single filler, use their scope; if multiple, aggregate or show first
				const scopes = assignments
					.map((assignment) => assignment.scope)
					.filter(
						(scope): scope is string => scope !== undefined && scope !== null && scope !== ''
					);

				let scope: string | undefined;
				if (scopes.length === 1) {
					// Single filler with scope - show it
					scope = scopes[0];
				} else if (scopes.length > 1) {
					// Multiple fillers with scopes - show first (or could aggregate)
					scope = scopes[0];
				}
				// If no scopes, scope remains undefined

				return {
					roleId: role._id,
					circleId: role.circleId,
					name: role.name,
					purpose: role.purpose,
					scope,
					fillerCount: assignments.length,
					createdAt: role.createdAt
				};
			})
		);

		return rolesWithFillers;
	}
});

/**
 * List all roles for all circles in a workspace
 * Optimized for preloading roles to avoid N+1 queries
 * Returns roles grouped by circleId for efficient lookup
 */
export const listByWorkspace = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// Get all circles in workspace (1 query with index)
		const circles = await ctx.db
			.query('circles')
			.withIndex('by_workspace_archived', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('archivedAt', undefined)
			)
			.collect();

		if (circles.length === 0) {
			return [];
		}

		const circleIds = circles.map((c) => c._id);

		// OPTIMIZATION: Fetch all roles for all circles in parallel
		// Convex executes Promise.all queries efficiently (not sequential)
		const rolesByCirclePromises = circleIds.map(async (circleId) => {
			const roles = args.includeArchived
				? await ctx.db
						.query('circleRoles')
						.withIndex('by_circle', (q) => q.eq('circleId', circleId))
						.collect()
				: await ctx.db
						.query('circleRoles')
						.withIndex('by_circle_archived', (q) =>
							q.eq('circleId', circleId).eq('archivedAt', undefined)
						)
						.collect();
			return { circleId, roles };
		});

		const rolesByCircleData = await Promise.all(rolesByCirclePromises);

		// Flatten to get all roleIds for assignment lookup
		const allRoleIds = new Set<Id<'circleRoles'>>();
		for (const { roles } of rolesByCircleData) {
			for (const role of roles) {
				allRoleIds.add(role._id);
			}
		}

		// OPTIMIZATION: Fetch assignments for all roles in parallel
		// Use Promise.all for efficient parallel execution
		const assignmentPromises = Array.from(allRoleIds).map(async (roleId) => {
			const assignments = args.includeArchived
				? await ctx.db
						.query('userCircleRoles')
						.withIndex('by_role', (q) => q.eq('circleRoleId', roleId))
						.collect()
				: await ctx.db
						.query('userCircleRoles')
						.withIndex('by_role_archived', (q) =>
							q.eq('circleRoleId', roleId).eq('archivedAt', undefined)
						)
						.collect();
			return { roleId, assignments };
		});

		const assignmentsByRoleData = await Promise.all(assignmentPromises);

		// Build assignments map for O(1) lookup
		const assignmentsByRole = new Map<
			Id<'circleRoles'>,
			(typeof assignmentsByRoleData)[0]['assignments']
		>();
		for (const { roleId, assignments } of assignmentsByRoleData) {
			assignmentsByRole.set(roleId, assignments);
		}

		// Build result: Map roles to circles with full data
		const result: Array<{
			circleId: Id<'circles'>;
			roles: Array<{
				roleId: Id<'circleRoles'>;
				circleId: Id<'circles'>;
				name: string;
				purpose?: string;
				templateId?: Id<'roleTemplates'>;
				scope?: string;
				status: 'draft' | 'active';
				isHiring: boolean;
				fillerCount: number;
				createdAt: number;
			}>;
		}> = [];

		for (const { circleId, roles } of rolesByCircleData) {
			const rolesWithData = roles.map((role) => {
				const assignments = assignmentsByRole.get(role._id) ?? [];
				const scopes = assignments
					.map((a) => a.scope)
					.filter(
						(scope): scope is string => scope !== undefined && scope !== null && scope !== ''
					);

				return {
					roleId: role._id,
					circleId: role.circleId,
					name: role.name,
					purpose: role.purpose,
					templateId: role.templateId,
					scope: scopes.length > 0 ? scopes[0] : undefined,
					status: role.status,
					isHiring: role.isHiring,
					fillerCount: assignments.length,
					createdAt: role.createdAt
				};
			});

			if (rolesWithData.length > 0) {
				result.push({ circleId, roles: rolesWithData });
			}
		}

		return result;
	}
});

/**
 * Get a single role by ID
 */
export const get = query({
	args: {
		sessionId: v.string(),
		roleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const role = await ctx.db.get(args.roleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		// Get circle name for context
		const circle = await ctx.db.get(role.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}

		// Get active filler count only
		const assignments = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_role_archived', (q) =>
				q.eq('circleRoleId', args.roleId).eq('archivedAt', undefined)
			)
			.collect();

		// Check if this is a Lead role (template with isRequired: true)
		let isLeadRole = false;
		if (role.templateId) {
			const template = await ctx.db.get(role.templateId);
			isLeadRole = template?.isRequired === true;
		}

		return {
			roleId: role._id,
			name: role.name,
			purpose: role.purpose,
			circleId: role.circleId,
			circleName: circle.name,
			workspaceId,
			fillerCount: assignments.length,
			createdAt: role.createdAt,
			templateId: role.templateId,
			isLeadRole,
			representsToParent: role.representsToParent ?? false
		};
	}
});

/**
 * Get all roles assigned to a user
 * By default, excludes archived assignments. Set includeArchived=true to include them.
 */
export const getUserRoles = query({
	args: {
		sessionId: v.string(),
		userId: v.id('users'),
		circleId: v.optional(v.id('circles')), // Optional: filter by circle
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get user's role assignments - exclude archived by default
		const assignments = args.includeArchived
			? await ctx.db
					.query('userCircleRoles')
					.withIndex('by_user', (q) => q.eq('userId', args.userId))
					.collect()
			: await ctx.db
					.query('userCircleRoles')
					.withIndex('by_user_archived', (q) =>
						q.eq('userId', args.userId).eq('archivedAt', undefined)
					)
					.collect();

		// Get role details and verify access
		const roles = await Promise.all(
			assignments.map(async (assignment) => {
				const role = await ctx.db.get(assignment.circleRoleId);
				if (!role) return null;

				// If filtering by circle, skip roles from other circles
				if (args.circleId && role.circleId !== args.circleId) {
					return null;
				}

				const circle = await ctx.db.get(role.circleId);
				if (!circle) return null;

				// Verify acting user has access to this workspace
				try {
					await ensureWorkspaceMembership(ctx, circle.workspaceId, actingUserId);
				} catch {
					return null; // Skip roles the acting user can't access
				}

				return {
					roleId: role._id,
					roleName: role.name,
					rolePurpose: role.purpose,
					circleId: role.circleId,
					circleName: circle.name,
					workspaceId: circle.workspaceId,
					assignedAt: assignment.assignedAt
				};
			})
		);

		return roles.filter((role): role is NonNullable<typeof role> => role !== null);
	}
});

/**
 * Get all users who fill a specific role
 * By default, excludes archived assignments. Set includeArchived=true to include them.
 */
export const getRoleFillers = query({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		// Get assignments - exclude archived by default
		const assignments = args.includeArchived
			? await ctx.db
					.query('userCircleRoles')
					.withIndex('by_role', (q) => q.eq('circleRoleId', args.circleRoleId))
					.collect()
			: await ctx.db
					.query('userCircleRoles')
					.withIndex('by_role_archived', (q) =>
						q.eq('circleRoleId', args.circleRoleId).eq('archivedAt', undefined)
					)
					.collect();

		const fillers = await Promise.all(
			assignments.map(async (assignment) => {
				const user = await ctx.db.get(assignment.userId);
				if (!user) return null;

				const assignedByUser = await ctx.db.get(assignment.assignedBy);

				return {
					userId: assignment.userId,
					email: (user as unknown as { email?: string } | undefined)?.email ?? '',
					name: (user as unknown as { name?: string } | undefined)?.name ?? '',
					assignedAt: assignment.assignedAt,
					assignedBy: assignment.assignedBy,
					assignedByName:
						(assignedByUser as unknown as { name?: string } | undefined)?.name ?? 'Unknown'
				};
			})
		);

		return fillers.filter((filler): filler is NonNullable<typeof filler> => filler !== null);
	}
});

/**
 * Get members of a circle who are not assigned to any role
 * Returns circle members who have no active role assignments in any role within the circle
 */
export const getMembersWithoutRoles = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const circle = await ctx.db.get(args.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}

		// Verify user has access to this workspace
		await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

		// Get all active roles in this circle
		const roles = args.includeArchived
			? await ctx.db
					.query('circleRoles')
					.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
					.collect()
			: await ctx.db
					.query('circleRoles')
					.withIndex('by_circle_archived', (q) =>
						q.eq('circleId', args.circleId).eq('archivedAt', undefined)
					)
					.collect();

		const roleIds = roles.map((r) => r._id);

		// Get all circle members
		const memberships = args.includeArchived
			? await ctx.db
					.query('circleMembers')
					.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
					.collect()
			: await ctx.db
					.query('circleMembers')
					.withIndex('by_circle_archived', (q) =>
						q.eq('circleId', args.circleId).eq('archivedAt', undefined)
					)
					.collect();

		// If no roles exist, all members are "without roles"
		if (roleIds.length === 0) {
			const members = await Promise.all(
				memberships.map(async (membership) => {
					const user = await ctx.db.get(membership.userId);
					if (!user) return null;

					return {
						userId: membership.userId,
						email: (user as unknown as { email?: string } | undefined)?.email ?? '',
						name: (user as unknown as { name?: string } | undefined)?.name ?? '',
						joinedAt: membership.joinedAt
					};
				})
			);
			return members.filter((member): member is NonNullable<typeof member> => member !== null);
		}

		// Get all active role assignments for roles in this circle
		const allAssignments = await Promise.all(
			roleIds.map(async (roleId) => {
				const assignments = args.includeArchived
					? await ctx.db
							.query('userCircleRoles')
							.withIndex('by_role', (q) => q.eq('circleRoleId', roleId))
							.collect()
					: await ctx.db
							.query('userCircleRoles')
							.withIndex('by_role_archived', (q) =>
								q.eq('circleRoleId', roleId).eq('archivedAt', undefined)
							)
							.collect();
				return assignments;
			})
		);

		// Flatten and get set of userIds who have role assignments
		const userIdsWithRoles = new Set<Id<'users'>>();
		for (const assignments of allAssignments) {
			for (const assignment of assignments) {
				userIdsWithRoles.add(assignment.userId);
			}
		}

		// Filter members to only those without role assignments
		const membersWithoutRoles = memberships.filter(
			(membership) => !userIdsWithRoles.has(membership.userId)
		);

		// Fetch user data for members without roles
		const members = await Promise.all(
			membersWithoutRoles.map(async (membership) => {
				const user = await ctx.db.get(membership.userId);
				if (!user) return null;

				return {
					userId: membership.userId,
					email: (user as unknown as { email?: string } | undefined)?.email ?? '',
					name: (user as unknown as { name?: string } | undefined)?.name ?? '',
					joinedAt: membership.joinedAt
				};
			})
		);

		return members.filter((member): member is NonNullable<typeof member> => member !== null);
	}
});

/**
 * Create a new role in a circle
 */
export const create = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		name: v.string(),
		purpose: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const { workspaceId } = await ensureCircleExists(ctx, args.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		const trimmedName = args.name.trim();
		if (!trimmedName) {
			throw new Error('Role name is required');
		}

		// Check for duplicate role name in circle
	const existingRoles = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
			.collect();

	if (hasDuplicateRoleName(trimmedName, existingRoles)) {
			throw new Error('A role with this name already exists in this circle');
		}

		const roleId = await ctx.db.insert('circleRoles', {
			circleId: args.circleId,
			workspaceId,
			name: trimmedName,
			purpose: args.purpose,
			status: 'active',
			isHiring: false,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			updatedBy: userId
		});

		// Capture version history
		const newRole = await ctx.db.get(roleId);
		if (newRole) {
			await captureCreate(ctx, 'circleRole', newRole);
		}

		return { roleId };
	}
});

/**
 * Update a role
 */
export const update = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		name: v.optional(v.string()),
		purpose: v.optional(v.string()),
		representsToParent: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		// Block direct edits to Lead roles - only workspace admin can edit via template
		const roleIsLead = await isLeadRole(ctx, args.circleRoleId);
		if (roleIsLead) {
			const userIsAdmin = await isWorkspaceAdmin(ctx, workspaceId, userId);
			if (!userIsAdmin) {
				throw new Error(
					'Circle roles created from Lead template cannot be edited directly. Only workspace admins can edit Lead roles via the role template.'
				);
			}
			// Even workspace admin shouldn't edit Lead roles directly - they should edit the template
			// This ensures consistency across all circles
			throw new Error(
				'Lead roles cannot be edited directly. Edit the Lead role template instead to update all Lead roles across all circles.'
			);
		}

		const updates: {
			name?: string;
			purpose?: string;
			representsToParent?: boolean;
			updatedAt: number;
			updatedBy: Id<'users'>;
		} = {
			updatedAt: Date.now(),
			updatedBy: userId
		};

		if (args.name !== undefined) {
			const trimmedName = args.name.trim();
			if (!trimmedName) {
				throw new Error('Role name cannot be empty');
			}

			// Check for duplicate role name in circle (excluding current role)
			const existingRoles = await ctx.db
				.query('circleRoles')
				.withIndex('by_circle', (q) => q.eq('circleId', role.circleId))
				.collect();

			if (hasDuplicateRoleName(trimmedName, existingRoles, args.circleRoleId)) {
				throw new Error('A role with this name already exists in this circle');
			}

			updates.name = trimmedName;
		}

		if (args.purpose !== undefined) {
			updates.purpose = args.purpose;
		}

		if (args.representsToParent !== undefined) {
			updates.representsToParent = args.representsToParent;
		}

		await ctx.db.patch(args.circleRoleId, updates);

		// Capture version history
		const updatedRole = await ctx.db.get(args.circleRoleId);
		if (updatedRole) {
			await captureUpdate(ctx, 'circleRole', role, updatedRole);
		}

		return { success: true };
	}
});

/**
 * Quick update a role (inline editing with auto-save)
 * Requires: Org Designer role + allowQuickChanges workspace setting
 * PHASE 2: Simplified permission check (circle type checks deferred to Phase 3)
 */
export const quickUpdate = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		updates: v.object({
			name: v.optional(v.string()),
			purpose: v.optional(v.string()),
			representsToParent: v.optional(v.boolean())
		})
	},
	handler: async (ctx, args) => {
		// 1. Validate session
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get role and its circle
		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const circle = await ctx.db.get(role.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}

		// 3. Check quick edit permission (RBAC + workspace setting)
		await requireQuickEditPermission(ctx, userId, circle);

		// Block quick edits to Lead roles - only workspace admin can edit via template
		const roleIsLead = await isLeadRole(ctx, args.circleRoleId);
		if (roleIsLead) {
			throw new Error(
				'Lead roles cannot be edited directly. Edit the Lead role template instead to update all Lead roles across all circles.'
			);
		}

		// 4. Capture before state
		const beforeDoc = { ...role };

		// 5. Apply updates
		const updateData: Partial<Doc<'circleRoles'>> = {
			updatedAt: Date.now(),
			updatedBy: userId
		};

		if (args.updates.name !== undefined) {
			const trimmedName = args.updates.name.trim();
			if (!trimmedName) {
				throw new Error('Role name cannot be empty');
			}

			// Check for duplicate role name in circle (excluding current role)
			const existingRoles = await ctx.db
				.query('circleRoles')
				.withIndex('by_circle', (q) => q.eq('circleId', role.circleId))
				.collect();

			if (hasDuplicateRoleName(trimmedName, existingRoles, args.circleRoleId)) {
				throw new Error('A role with this name already exists in this circle');
			}

			updateData.name = trimmedName;
		}

		if (args.updates.purpose !== undefined) {
			updateData.purpose = args.updates.purpose;
		}

		if (args.updates.representsToParent !== undefined) {
			updateData.representsToParent = args.updates.representsToParent;
		}

		await ctx.db.patch(args.circleRoleId, updateData);

		// 6. Capture version history
		const afterDoc = await ctx.db.get(args.circleRoleId);
		if (afterDoc) {
			await captureUpdate(ctx, 'circleRole', beforeDoc, afterDoc);
		}

		return { success: true };
	}
});

/**
 * Helper function to archive a role and cascade to assignments
 * Used internally by archiveRole mutation and circles.archive cascade
 */
async function archiveRoleHelper(
	ctx: MutationCtx,
	roleId: Id<'circleRoles'>,
	userId: Id<'users'>,
	reason: 'direct' | 'cascade' = 'direct'
): Promise<void> {
	const role = await ctx.db.get(roleId);
	if (!role) {
		throw new Error('Role not found');
	}

	// Check if role is already archived
	if (role.archivedAt !== undefined) {
		return; // Already archived, skip
	}

	// Circle Lead Protection: Block archiving last Lead role (unless cascading from circle archive)
	// SYOS-674: Only block for hierarchy and hybrid circles (empowered_team and guild can operate without Lead)
	if (reason === 'direct' && role.templateId) {
		const template = await ctx.db.get(role.templateId);
		if (isLeadTemplate(template)) {
			// Get circle to check circle type
			const circle = await ctx.db.get(role.circleId);
			if (!circle) {
				throw new Error('Circle not found');
			}

			// Get workspace org settings to check Lead requirement
			const orgSettings = await ctx.db
				.query('workspaceOrgSettings')
				.withIndex('by_workspace', (q) => q.eq('workspaceId', circle.workspaceId))
				.first();

			// Determine if Lead is required for this circle type
			const circleType = circle.circleType ?? 'hierarchy'; // Default to hierarchy for backward compat
			const leadRequired = isLeadRequiredForCircleType(
				circleType,
				orgSettings?.leadRequirementByCircleType
			);

			// Only block archiving if Lead is required for this circle type
			if (leadRequired) {
				// Check if this is the last Lead role in the circle
				const leadCount = await countLeadRolesInCircle(ctx, role.circleId);
				if (leadCount <= 1) {
					throw new Error(
						`ERR_CIRCLE_LEAD_REQUIRED: Cannot archive the last Lead role in a ${circleType} circle. ${circleType} circles require at least one Lead role.`
					);
				}
				// If there are multiple Lead roles, allow archiving (but warn that at least one must remain)
			}
			// If Lead is not required for this circle type, allow archiving without restriction
		}
	}

	const now = Date.now();

	// 1. Archive the role
	await ctx.db.patch(roleId, {
		archivedAt: now,
		archivedBy: userId,
		updatedAt: now,
		updatedBy: userId
	});

	// Capture version history for role archive
	const archivedRole = await ctx.db.get(roleId);
	if (archivedRole) {
		await captureArchive(ctx, 'circleRole', role, archivedRole);
	}

	// 2. CASCADE: Archive all user assignments to this role
	const assignments = await ctx.db
		.query('userCircleRoles')
		.withIndex('by_role_archived', (q) => q.eq('circleRoleId', roleId).eq('archivedAt', undefined))
		.collect();

	for (const assignment of assignments) {
		await ctx.db.patch(assignment._id, {
			archivedAt: now,
			archivedBy: userId,
			updatedAt: now,
			updatedBy: userId
		});

		// Revoke auto-assigned RBAC permissions for this circleRole
		await handleUserCircleRoleRemoved(ctx, assignment._id);
	}
}

/**
 * Archive a role (soft delete)
 * CASCADE: When a role is archived, all user assignments to that role are also archived.
 */
export const archiveRole = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		await archiveRoleHelper(ctx, args.circleRoleId, userId, 'direct');

		return { success: true };
	}
});

/**
 * Delete a role (soft delete via archive)
 * DEPRECATED: Use archiveRole instead. This function now calls archiveRole for consistency.
 */
export const deleteRole = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		// Use archiveRole instead of hard delete
		await archiveRoleHelper(ctx, args.circleRoleId, userId, 'direct');

		return { success: true };
	}
});

/**
 * Auto-assign RBAC permissions when a user is assigned to a CircleRole
 * This function handles the side effect of granting RBAC roles based on the role template's rbacPermissions
 */
async function handleUserCircleRoleCreated(
	ctx: MutationCtx,
	userCircleRole: {
		_id: Id<'userCircleRoles'>;
		userId: Id<'users'>;
		circleRoleId: Id<'circleRoles'>;
		assignedBy: Id<'users'>;
	},
	circleRole: {
		templateId?: Id<'roleTemplates'>;
		circleId: Id<'circles'>;
		workspaceId: Id<'workspaces'>;
	}
): Promise<void> {
	// If no template, nothing to do
	if (!circleRole.templateId) {
		return;
	}

	// Get template with RBAC permissions
	const template = await ctx.db.get(circleRole.templateId);
	if (!template?.rbacPermissions?.length) {
		return;
	}

	// CircleRole → RBAC is ALWAYS enabled (default behavior)
	// This is independent of Quick Edit Mode

	// Auto-assign RBAC permissions for this role
	for (const perm of template.rbacPermissions) {
		// Find permission by slug
		const permission = await ctx.db
			.query('permissions')
			.withIndex('by_slug', (q) => q.eq('slug', perm.permissionSlug))
			.first();

		if (!permission) {
			// Permission doesn't exist, skip
			continue;
		}

		// Find all RBAC roles that grant this permission
		const rolePermissions = await ctx.db
			.query('rolePermissions')
			.withIndex('by_permission', (q) => q.eq('permissionId', permission._id))
			.collect();

		// For each role that grants this permission, assign it to the user
		for (const rolePerm of rolePermissions) {
			// Get the role details
			const rbacRole = await ctx.db.get(rolePerm.roleId);
			if (!rbacRole) {
				continue;
			}

			// Check if user already has this RBAC role with this circle scope
			const existingRole = await ctx.db
				.query('userRoles')
				.withIndex('by_user_role', (q) =>
					q.eq('userId', userCircleRole.userId).eq('roleId', rbacRole._id)
				)
				.filter((q) =>
					q.and(
						q.eq(q.field('circleId'), circleRole.circleId),
						q.eq(q.field('revokedAt'), undefined)
					)
				)
				.first();

			if (!existingRole) {
				// Auto-assign RBAC role with circle scope
				// Track sourceCircleRoleId for precise cleanup when user is removed
				await ctx.db.insert('userRoles', {
					userId: userCircleRole.userId,
					roleId: rbacRole._id,
					workspaceId: circleRole.workspaceId,
					circleId: circleRole.circleId,
					sourceCircleRoleId: userCircleRole._id, // Track source for cleanup
					assignedBy: userCircleRole.assignedBy,
					assignedAt: Date.now()
				});
			}
		}
	}
}

/**
 * Revoke RBAC permissions when a user is removed from a CircleRole
 * This function revokes ONLY the RBAC roles that were auto-assigned from this specific circleRole
 * Uses sourceCircleRoleId for precise cleanup
 */
async function handleUserCircleRoleRemoved(
	ctx: MutationCtx,
	userCircleRoleId: Id<'userCircleRoles'>
): Promise<void> {
	// Find ONLY the RBAC roles that were auto-assigned from THIS circleRole
	// This prevents over-revoking if user has multiple roles in same circle
	const autoAssignedRoles = await ctx.db
		.query('userRoles')
		.withIndex('by_source_circle_role', (q) => q.eq('sourceCircleRoleId', userCircleRoleId))
		.filter((q) => q.eq(q.field('revokedAt'), undefined))
		.collect();

	// Revoke only the roles that came from this specific circleRole
	for (const ur of autoAssignedRoles) {
		await ctx.db.patch(ur._id, { revokedAt: Date.now() });
	}
}

/**
 * Restore RBAC permissions when a user is restored to a CircleRole
 * This function un-revokes ONLY the RBAC roles that were auto-assigned from this specific circleRole
 */
async function handleUserCircleRoleRestored(
	ctx: MutationCtx,
	userCircleRoleId: Id<'userCircleRoles'>
): Promise<void> {
	// Find revoked RBAC roles that were auto-assigned from THIS circleRole
	const revokedRoles = await ctx.db
		.query('userRoles')
		.withIndex('by_source_circle_role', (q) => q.eq('sourceCircleRoleId', userCircleRoleId))
		.filter((q) => q.neq(q.field('revokedAt'), undefined))
		.collect();

	// Un-revoke the roles that came from this specific circleRole
	for (const ur of revokedRoles) {
		await ctx.db.patch(ur._id, { revokedAt: undefined });
	}

	// Also ensure RBAC roles are assigned (in case they were deleted, not just revoked)
	// Get the userCircleRole and circleRole to re-run auto-assignment
	const userCircleRole = await ctx.db.get(userCircleRoleId);
	if (!userCircleRole) {
		return;
	}

	const circleRole = await ctx.db.get(userCircleRole.circleRoleId);
	if (!circleRole) {
		return;
	}

	const circle = await ctx.db.get(circleRole.circleId);
	if (!circle) {
		return;
	}

	// Re-run auto-assignment (will skip if roles already exist)
	await handleUserCircleRoleCreated(
		ctx,
		{
			_id: userCircleRoleId,
			userId: userCircleRole.userId,
			circleRoleId: userCircleRole.circleRoleId,
			assignedBy: userCircleRole.assignedBy
		},
		{
			templateId: circleRole.templateId,
			circleId: circleRole.circleId,
			workspaceId: circle.workspaceId
		}
	);
}

/**
 * Assign a user to a role
 */
export const assignUser = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const actingUserId = await getAuthUserId(ctx, args.sessionId);
		if (!actingUserId) {
			throw new Error('Not authenticated');
		}

		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);

		// Verify acting user has access
		await ensureWorkspaceMembership(ctx, workspaceId, actingUserId);

		// Verify target user has access
		await ensureWorkspaceMembership(ctx, workspaceId, args.userId);

		// Check if already assigned
		const existingAssignment = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_user_role', (q) =>
				q.eq('userId', args.userId).eq('circleRoleId', args.circleRoleId)
			)
			.first();

		if (existingAssignment) {
			throw new Error('User is already assigned to this role');
		}

		const now = Date.now();
		const userCircleRoleId = await ctx.db.insert('userCircleRoles', {
			userId: args.userId,
			circleRoleId: args.circleRoleId,
			assignedAt: now,
			assignedBy: actingUserId,
			updatedAt: now
		});

		// Auto-assign RBAC permissions if template has rbacPermissions configured
		await handleUserCircleRoleCreated(
			ctx,
			{
				_id: userCircleRoleId,
				userId: args.userId,
				circleRoleId: args.circleRoleId,
				assignedBy: actingUserId
			},
			{
				templateId: role.templateId,
				circleId: role.circleId,
				workspaceId
			}
		);

		return { success: true };
	}
});

/**
 * Remove a user from a role (soft delete via archive)
 */
export const removeUser = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const actingUserId = await getAuthUserId(ctx, args.sessionId);
		if (!actingUserId) {
			throw new Error('Not authenticated');
		}

		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, actingUserId);

		// Find assignment (only active assignments)
		const assignment = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_user_role', (q) =>
				q.eq('userId', args.userId).eq('circleRoleId', args.circleRoleId)
			)
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.first();

		if (!assignment) {
			throw new Error('User is not assigned to this role');
		}

		// Archive the assignment (soft delete)
		const now = Date.now();
		await ctx.db.patch(assignment._id, {
			archivedAt: now,
			archivedBy: actingUserId,
			updatedAt: now,
			updatedBy: actingUserId
		});

		// Revoke auto-assigned RBAC permissions for this circleRole
		await handleUserCircleRoleRemoved(ctx, assignment._id);

		return { success: true };
	}
});

/**
 * Restore a role (un-archive)
 * Validates that circle is not archived before restoring.
 * Clears templateId reference if template no longer exists.
 */
export const restoreRole = mutation({
	args: {
		sessionId: v.string(),
		roleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const role = await ctx.db.get(args.roleId);
		if (!role) {
			throw new Error('Role not found');
		}

		// Check if role is archived
		if (!role.archivedAt) {
			throw new Error('Role is not archived');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		// Validation: Check circle
		const circle = await ctx.db.get(role.circleId);
		if (!circle) {
			throw new Error('ERR_CIRCLE_DELETED: Circle no longer exists');
		}
		if (circle.archivedAt) {
			throw new Error(
				'ERR_CIRCLE_ARCHIVED: Cannot restore role while circle is archived. Restore circle first.'
			);
		}

		const now = Date.now();
		const oldRole = { ...role };

		// Clear templateId if template no longer exists
		let templateId = role.templateId;
		if (templateId) {
			const template = await ctx.db.get(templateId);
			if (!template || template.archivedAt) {
				templateId = undefined;
			}
		}

		// Restore the role
		await ctx.db.patch(args.roleId, {
			archivedAt: undefined,
			archivedBy: undefined,
			templateId,
			updatedAt: now,
			updatedBy: userId
		});

		// Capture version history for role restore
		const restoredRole = await ctx.db.get(args.roleId);
		if (restoredRole) {
			await captureRestore(ctx, 'circleRole', oldRole, restoredRole);
		}

		return { success: true };
	}
});

/**
 * Restore a user-role assignment (un-archive)
 * Validates that role is not archived, user is still in workspace, and no duplicate assignment exists.
 */
export const restoreAssignment = mutation({
	args: {
		sessionId: v.string(),
		assignmentId: v.id('userCircleRoles')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const assignment = await ctx.db.get(args.assignmentId);
		if (!assignment) {
			throw new Error('Assignment not found');
		}

		// Check if assignment is archived
		if (!assignment.archivedAt) {
			throw new Error('Assignment is not archived');
		}

		// Validation: Check role
		const role = await ctx.db.get(assignment.circleRoleId);
		if (!role) {
			throw new Error('ERR_ROLE_DELETED: Role no longer exists');
		}
		if (role.archivedAt) {
			throw new Error('ERR_ROLE_ARCHIVED: Cannot restore assignment while role is archived');
		}

		// Get workspaceId from circle
		const circle = await ctx.db.get(role.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}

		// Verify acting user has access to this workspace
		await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

		// Validation: Check user still in workspace
		const membership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', circle.workspaceId).eq('userId', assignment.userId)
			)
			.first();

		if (!membership) {
			throw new Error('ERR_USER_NOT_MEMBER: User is no longer a workspace member');
		}

		// Validation: Check user doesn't already have this role (active assignment)
		const existingActive = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_user_role', (q) =>
				q.eq('userId', assignment.userId).eq('circleRoleId', assignment.circleRoleId)
			)
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.first();

		if (existingActive) {
			throw new Error('ERR_ALREADY_ASSIGNED: User already has this role assigned');
		}

		const now = Date.now();
		const oldAssignment = { ...assignment };

		// Restore the assignment
		await ctx.db.patch(args.assignmentId, {
			archivedAt: undefined,
			archivedBy: undefined,
			updatedAt: now,
			updatedBy: userId
		});

		// Restore auto-assigned RBAC permissions for this circleRole
		await handleUserCircleRoleRestored(ctx, args.assignmentId);

		// Capture version history for assignment restore
		const restoredAssignment = await ctx.db.get(args.assignmentId);
		if (restoredAssignment) {
			await captureRestore(ctx, 'userCircleRole', oldAssignment, restoredAssignment);
		}

		return { success: true };
	}
});

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { captureCreate, captureUpdate, captureArchive, captureRestore } from './orgVersionHistory';

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
				scope?: string;
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
					scope: scopes.length > 0 ? scopes[0] : undefined,
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

		return {
			roleId: role._id,
			name: role.name,
			purpose: role.purpose,
			circleId: role.circleId,
			circleName: circle.name,
			workspaceId,
			fillerCount: assignments.length,
			createdAt: role.createdAt
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
		const existingRole = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
			.collect();

		if (existingRole.some((role) => role.name.toLowerCase() === trimmedName.toLowerCase())) {
			throw new Error('A role with this name already exists in this circle');
		}

		const roleId = await ctx.db.insert('circleRoles', {
			circleId: args.circleId,
			name: trimmedName,
			purpose: args.purpose,
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
		purpose: v.optional(v.string())
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

		const updates: { name?: string; purpose?: string } = {};

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

			const duplicate = existingRoles.find(
				(r) => r._id !== args.circleRoleId && r.name.toLowerCase() === trimmedName.toLowerCase()
			);

			if (duplicate) {
				throw new Error('A role with this name already exists in this circle');
			}

			updates.name = trimmedName;
		}

		if (args.purpose !== undefined) {
			updates.purpose = args.purpose;
		}

		updates.updatedAt = Date.now();
		updates.updatedBy = userId;

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

	// Circle Lead Protection: Block archiving required roles (unless cascading from circle archive)
	if (reason === 'direct' && role.templateId) {
		const template = await ctx.db.get(role.templateId);
		if (template?.isRequired) {
			throw new Error('ERR_CIRCLE_LEAD_REQUIRED: Cannot archive required role (Circle Lead)');
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

		await ctx.db.insert('userCircleRoles', {
			userId: args.userId,
			circleRoleId: args.circleRoleId,
			assignedAt: Date.now(),
			assignedBy: actingUserId
		});

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

		// Capture version history for assignment restore
		const restoredAssignment = await ctx.db.get(args.assignmentId);
		if (restoredAssignment) {
			await captureRestore(ctx, 'userCircleRole', oldAssignment, restoredAssignment);
		}

		return { success: true };
	}
});

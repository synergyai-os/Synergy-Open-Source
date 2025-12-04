import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { captureCreate, captureUpdate, captureArchive, captureRestore } from './orgVersionHistory';

/**
 * Circles represent work workspace units (not people grouping)
 * Examples: value streams, functions, coordination contexts
 * Circles can be nested (parent-child relationships)
 */

function slugifyName(name: string): string {
	return (
		name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '')
			.slice(0, 48) || 'circle'
	);
}

async function ensureUniqueCircleSlug(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	baseSlug: string
): Promise<string> {
	const existingCircles = await ctx.db
		.query('circles')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	const existingSlugs = new Set(existingCircles.map((circle) => circle.slug));
	let slug = baseSlug;
	let suffix = 1;

	while (existingSlugs.has(slug)) {
		slug = `${baseSlug}-${suffix++}`;
	}

	return slug;
}

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

/**
 * Create core roles for a circle based on core role templates
 *
 * This function:
 * 1. Queries system-level core templates (workspaceId = undefined, isCore = true)
 * 2. Queries workspace-level core templates (workspaceId = workspaceId, isCore = true)
 * 3. Creates roles from templates, skipping duplicates (idempotent)
 * 4. Links roles to templates via templateId
 * 5. Captures version history for each role created
 *
 * Design decisions:
 * - Skip silently if role with same name already exists (idempotent)
 * - Only active templates are used (archived templates are skipped)
 * - Template description becomes role purpose if available
 * - Roles are "stamped out" from templates (blueprint pattern - no auto-sync)
 *
 * @export - Exported for use in workspace creation and other circle creation flows
 */
export async function createCoreRolesForCircle(
	ctx: MutationCtx,
	circleId: Id<'circles'>,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<void> {
	const now = Date.now();

	// 1. Query system-level core templates (workspaceId = undefined, isCore = true)
	const systemCoreTemplates = await ctx.db
		.query('roleTemplates')
		.withIndex('by_core', (q) => q.eq('workspaceId', undefined).eq('isCore', true))
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.collect();

	// 2. Query workspace-level core templates (workspaceId = workspaceId, isCore = true)
	const workspaceCoreTemplates = await ctx.db
		.query('roleTemplates')
		.withIndex('by_core', (q) => q.eq('workspaceId', workspaceId).eq('isCore', true))
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.collect();

	// Combine all core templates
	const allCoreTemplates = [...systemCoreTemplates, ...workspaceCoreTemplates];

	if (allCoreTemplates.length === 0) {
		// No core templates to create - this is fine
		return;
	}

	// Get existing roles in circle (for duplicate checking)
	const existingRoles = await ctx.db
		.query('circleRoles')
		.withIndex('by_circle_archived', (q) => q.eq('circleId', circleId).eq('archivedAt', undefined))
		.collect();

	// Create a case-insensitive set of existing role names
	const existingRoleNames = new Set(existingRoles.map((role) => role.name.toLowerCase().trim()));

	// 3. Create roles from templates
	for (const template of allCoreTemplates) {
		const templateNameLower = template.name.toLowerCase().trim();

		// Skip if role with same name already exists (idempotent behavior)
		if (existingRoleNames.has(templateNameLower)) {
			// Role already exists - skip silently
			continue;
		}

		// Create role from template
		const roleId = await ctx.db.insert('circleRoles', {
			circleId,
			workspaceId,
			name: template.name,
			purpose: template.description, // Template description becomes role purpose
			templateId: template._id, // Link role to template
			status: 'active',
			isHiring: false,
			createdAt: now,
			updatedAt: now,
			updatedBy: userId
		});

		// Capture version history for role creation
		const newRole = await ctx.db.get(roleId);
		if (newRole) {
			await captureCreate(ctx, 'circleRole', newRole);
		}
	}
}

/**
 * List all circles in an workspace
 * By default, excludes archived circles. Set includeArchived=true to include them.
 */
export const list = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to this workspace
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// Get circles - exclude archived by default
		const circles = args.includeArchived
			? await ctx.db
					.query('circles')
					.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
					.collect()
			: await ctx.db
					.query('circles')
					.withIndex('by_workspace_archived', (q) =>
						q.eq('workspaceId', args.workspaceId).eq('archivedAt', undefined)
					)
					.collect();

		// Get member counts and roles for each circle
		const results = await Promise.all(
			circles.map(async (circle) => {
				// Get active members only (unless includeArchived is true)
				const members = args.includeArchived
					? await ctx.db
							.query('circleMembers')
							.withIndex('by_circle', (q) => q.eq('circleId', circle._id))
							.collect()
					: await ctx.db
							.query('circleMembers')
							.withIndex('by_circle_archived', (q) =>
								q.eq('circleId', circle._id).eq('archivedAt', undefined)
							)
							.collect();

				// Get active roles only (unless includeArchived is true)
				const roles = args.includeArchived
					? await ctx.db
							.query('circleRoles')
							.withIndex('by_circle', (q) => q.eq('circleId', circle._id))
							.collect()
					: await ctx.db
							.query('circleRoles')
							.withIndex('by_circle_archived', (q) =>
								q.eq('circleId', circle._id).eq('archivedAt', undefined)
							)
							.collect();

				// Get parent circle name if it exists
				let parentName: string | null = null;
				if (circle.parentCircleId) {
					const parent = await ctx.db.get(circle.parentCircleId);
					parentName = parent?.name ?? null;
				}

				return {
					circleId: circle._id,
					workspaceId: circle.workspaceId,
					name: circle.name,
					slug: circle.slug,
					purpose: circle.purpose,
					parentCircleId: circle.parentCircleId,
					parentName,
					memberCount: members.length,
					roleCount: roles.length,
					roles: roles.map((r) => ({
						roleId: r._id,
						name: r.name,
						status: r.status,
						isHiring: r.isHiring
					})),
					createdAt: circle.createdAt,
					updatedAt: circle.updatedAt,
					archivedAt: circle.archivedAt
				};
			})
		);

		return results;
	}
});

/**
 * Get a single circle by ID
 */
export const get = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const circle = await ctx.db.get(args.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}

		// Verify user has access to this workspace
		await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

		// Get active member count only
		const members = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle_archived', (q) =>
				q.eq('circleId', args.circleId).eq('archivedAt', undefined)
			)
			.collect();

		// Get parent circle name if it exists
		let parentName: string | null = null;
		if (circle.parentCircleId) {
			const parent = await ctx.db.get(circle.parentCircleId);
			parentName = parent?.name ?? null;
		}

		return {
			circleId: circle._id,
			workspaceId: circle.workspaceId,
			name: circle.name,
			slug: circle.slug,
			purpose: circle.purpose,
			parentCircleId: circle.parentCircleId,
			parentName,
			memberCount: members.length,
			createdAt: circle.createdAt,
			updatedAt: circle.updatedAt,
			archivedAt: circle.archivedAt
		};
	}
});

/**
 * Get members of a circle
 * By default, excludes archived members. Set includeArchived=true to include them.
 */
export const getMembers = query({
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

		// Get members - exclude archived by default
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
});

/**
 * Create a new circle
 */
export const create = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		name: v.string(),
		purpose: v.optional(v.string()),
		parentCircleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Verify user has access to this workspace
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		const trimmedName = args.name.trim();
		if (!trimmedName) {
			throw new Error('Circle name is required');
		}

		// If creating a root circle (parentCircleId === undefined), validate only one exists
		if (args.parentCircleId === undefined) {
			const allCircles = await ctx.db
				.query('circles')
				.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
				.collect();

			// Check if any circle has parentCircleId === undefined (root circle)
			const existingRoot = allCircles.find((circle) => circle.parentCircleId === undefined);

			if (existingRoot) {
				throw new Error('ERR_ROOT_EXISTS: Workspace already has a root circle');
			}
		}

		// If parent circle is specified, validate it exists and belongs to same org
		if (args.parentCircleId) {
			const parentCircle = await ctx.db.get(args.parentCircleId);
			if (!parentCircle) {
				throw new Error('Parent circle not found');
			}
			if (parentCircle.workspaceId !== args.workspaceId) {
				throw new Error('Parent circle must belong to the same workspace');
			}
		}

		const slugBase = slugifyName(trimmedName);
		const slug = await ensureUniqueCircleSlug(ctx, args.workspaceId, slugBase);
		const now = Date.now();

		const circleId = await ctx.db.insert('circles', {
			workspaceId: args.workspaceId,
			name: trimmedName,
			slug,
			purpose: args.purpose,
			parentCircleId: args.parentCircleId,
			status: 'active',
			createdAt: now,
			updatedAt: now,
			updatedBy: userId
		});

		// Capture version history
		const newCircle = await ctx.db.get(circleId);
		if (newCircle) {
			await captureCreate(ctx, 'circle', newCircle);
		}

		// Auto-create core roles from templates
		await createCoreRolesForCircle(ctx, circleId, args.workspaceId, userId);

		return {
			circleId,
			slug
		};
	}
});

/**
 * Update a circle
 */
export const update = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		name: v.optional(v.string()),
		purpose: v.optional(v.string()),
		parentCircleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const circle = await ctx.db.get(args.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}

		// Verify user has access to this workspace
		await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

		const updates: Partial<Doc<'circles'>> = {
			updatedAt: Date.now(),
			updatedBy: userId
		};

		if (args.name !== undefined) {
			const trimmedName = args.name.trim();
			if (!trimmedName) {
				throw new Error('Circle name cannot be empty');
			}
			updates.name = trimmedName;

			const slugBase = slugifyName(trimmedName);
			updates.slug = await ensureUniqueCircleSlug(ctx, circle.workspaceId, slugBase);
		}

		if (args.purpose !== undefined) {
			updates.purpose = args.purpose;
		}

		if (args.parentCircleId !== undefined) {
			// Validate parent circle
			if (args.parentCircleId) {
				const parentCircle = await ctx.db.get(args.parentCircleId);
				if (!parentCircle) {
					throw new Error('Parent circle not found');
				}
				if (parentCircle.workspaceId !== circle.workspaceId) {
					throw new Error('Parent circle must belong to the same workspace');
				}
				// Prevent circular references
				if (args.parentCircleId === args.circleId) {
					throw new Error('Circle cannot be its own parent');
				}
			}
			updates.parentCircleId = args.parentCircleId;
		}

		await ctx.db.patch(args.circleId, updates);

		// Capture version history
		const updatedCircle = await ctx.db.get(args.circleId);
		if (updatedCircle) {
			await captureUpdate(ctx, 'circle', circle, updatedCircle);
		}

		return { success: true };
	}
});

/**
 * Archive a circle (soft delete)
 * CASCADE: When a circle is archived, all roles in that circle are also archived.
 * NOTE: Members are NOT cascaded - they can belong to multiple circles.
 */
export const archive = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const circle = await ctx.db.get(args.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}

		// Protect root circle: cannot be archived
		// Root circle is identified by parentCircleId === undefined
		if (circle.parentCircleId === undefined) {
			throw new Error('ERR_ROOT_CIRCLE_PROTECTED: Root circle cannot be archived');
		}

		// Verify user has access to this workspace
		await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

		const now = Date.now();

		// 1. Archive the circle
		await ctx.db.patch(args.circleId, {
			archivedAt: now,
			archivedBy: userId,
			updatedAt: now,
			updatedBy: userId
		});

		// Capture version history for circle archive
		const archivedCircle = await ctx.db.get(args.circleId);
		if (archivedCircle) {
			await captureArchive(ctx, 'circle', circle, archivedCircle);
		}

		// 2. CASCADE: Archive all roles in this circle
		// Note: When cascading from circle archive, we bypass Circle Lead protection
		// (required roles can be archived when their parent circle is archived)
		const roles = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle_archived', (q) =>
				q.eq('circleId', args.circleId).eq('archivedAt', undefined)
			)
			.collect();

		for (const role of roles) {
			// Archive the role (bypassing Circle Lead protection for cascade)
			await ctx.db.patch(role._id, {
				archivedAt: now,
				archivedBy: userId,
				updatedAt: now,
				updatedBy: userId
			});

			// CASCADE: Archive all user assignments to this role
			const assignments = await ctx.db
				.query('userCircleRoles')
				.withIndex('by_role_archived', (q) =>
					q.eq('circleRoleId', role._id).eq('archivedAt', undefined)
				)
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

		// Note: Members are NOT cascaded - they can belong to multiple circles

		return { success: true };
	}
});

/**
 * Restore a circle (un-archive)
 * Validates that parent circle is not archived before restoring.
 * NOTE: Does NOT auto-restore child roles - user should restore individually.
 */
export const restore = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const circle = await ctx.db.get(args.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}

		// Check if circle is archived
		if (!circle.archivedAt) {
			throw new Error('Circle is not archived');
		}

		// Verify user has access to this workspace
		await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

		// Validation: Check parent circle (if not root)
		if (circle.parentCircleId) {
			const parent = await ctx.db.get(circle.parentCircleId);
			if (!parent) {
				throw new Error('ERR_PARENT_DELETED: Parent circle no longer exists');
			}
			if (parent.archivedAt) {
				throw new Error(
					'ERR_PARENT_ARCHIVED: Cannot restore circle while parent circle is archived'
				);
			}
		}
		// Note: Root circles cannot be archived, so this check is not needed for root circles

		const now = Date.now();
		const oldCircle = { ...circle };

		// Restore the circle
		await ctx.db.patch(args.circleId, {
			archivedAt: undefined,
			archivedBy: undefined,
			updatedAt: now,
			updatedBy: userId
		});

		// Capture version history for circle restore
		const restoredCircle = await ctx.db.get(args.circleId);
		if (restoredCircle) {
			await captureRestore(ctx, 'circle', oldCircle, restoredCircle);
		}

		// Note: Do NOT auto-restore child roles - user should restore individually

		return { success: true };
	}
});

/**
 * Add a member to a circle
 */
export const addMember = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const actingUserId = await getAuthUserId(ctx, args.sessionId);
		if (!actingUserId) {
			throw new Error('Not authenticated');
		}

		const circle = await ctx.db.get(args.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}

		// Verify acting user has access to this workspace
		await ensureWorkspaceMembership(ctx, circle.workspaceId, actingUserId);

		// Verify target user has access to this workspace
		await ensureWorkspaceMembership(ctx, circle.workspaceId, args.userId);

		// Check if already a member
		const existingMembership = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle_user', (q) => q.eq('circleId', args.circleId).eq('userId', args.userId))
			.first();

		if (existingMembership) {
			throw new Error('User is already a member of this circle');
		}

		await ctx.db.insert('circleMembers', {
			circleId: args.circleId,
			userId: args.userId,
			joinedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Remove a member from a circle
 */
export const removeMember = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const actingUserId = await getAuthUserId(ctx, args.sessionId);
		if (!actingUserId) {
			throw new Error('Not authenticated');
		}

		const circle = await ctx.db.get(args.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}

		// Verify acting user has access to this workspace
		await ensureWorkspaceMembership(ctx, circle.workspaceId, actingUserId);

		// Find membership
		const membership = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle_user', (q) => q.eq('circleId', args.circleId).eq('userId', args.userId))
			.first();

		if (!membership) {
			throw new Error('User is not a member of this circle');
		}

		await ctx.db.delete(membership._id);

		return { success: true };
	}
});

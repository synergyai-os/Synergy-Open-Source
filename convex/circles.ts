import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';

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
 * List all circles in an workspace
 */
export const list = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to this workspace
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		// Get all circles (including archived)
		const circles = await ctx.db
			.query('circles')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();

		// Get member counts and roles for each circle
		const results = await Promise.all(
			circles.map(async (circle) => {
				const members = await ctx.db
					.query('circleMembers')
					.withIndex('by_circle', (q) => q.eq('circleId', circle._id))
					.collect();

				// Get roles for this circle
				const roles = await ctx.db
					.query('circleRoles')
					.withIndex('by_circle', (q) => q.eq('circleId', circle._id))
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
						name: r.name
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

		// Get member count
		const members = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
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
 */
export const getMembers = query({
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

		const memberships = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
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
			createdAt: now,
			updatedAt: now,
			updatedBy: userId
		});

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

		return { success: true };
	}
});

/**
 * Archive a circle (soft delete)
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

		// Verify user has access to this workspace
		await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

		await ctx.db.patch(args.circleId, {
			archivedAt: Date.now(),
			archivedBy: userId,
			updatedAt: Date.now(),
			updatedBy: userId
		});

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

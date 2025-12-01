import { query, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from './sessionValidation';

/**
 * Get workspace alias by slug
 * Used to resolve old slugs to current workspace
 */
export const getBySlug = query({
	args: {
		slug: v.string(),
		sessionId: v.string() // Session validation (derives userId securely)
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Find alias by slug
		const alias = await ctx.db
			.query('workspaceAliases')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.first();

		if (!alias) {
			return null;
		}

		// Verify user has access to the workspace
		const membership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', alias.workspaceId).eq('userId', userId)
			)
			.first();

		if (!membership) {
			// User doesn't have access - return null (don't leak workspace existence)
			return null;
		}

		return {
			workspaceId: alias.workspaceId,
			slug: alias.slug,
			createdAt: alias.createdAt
		};
	}
});

/**
 * Create a workspace alias (internal mutation)
 * Called when workspace slug is updated to preserve old slug
 */
export const createAlias = internalMutation({
	args: {
		workspaceId: v.id('workspaces'),
		slug: v.string() // Old slug to preserve
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// Check if alias already exists (idempotent)
		const existing = await ctx.db
			.query('workspaceAliases')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.first();

		if (existing) {
			// Alias already exists, return existing ID
			return existing._id;
		}

		// Create new alias
		const aliasId = await ctx.db.insert('workspaceAliases', {
			workspaceId: args.workspaceId,
			slug: args.slug,
			createdAt: now
		});

		return aliasId;
	}
});

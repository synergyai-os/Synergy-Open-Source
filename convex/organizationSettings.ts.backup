/**
 * Organization Settings Queries and Mutations
 *
 * Handles org-owned settings (Claude API key, etc.)
 * Only admins/owners can edit organization settings
 */

import { query, mutation, action, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';

/**
 * Helper: Check if user is admin or owner of organization
 */
async function isOrganizationAdmin(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	organizationId: Id<'organizations'>
): Promise<boolean> {
	const membership = await ctx.db
		.query('organizationMembers')
		.withIndex('by_organization_user', (q) =>
			q.eq('organizationId', organizationId).eq('userId', userId)
		)
		.first();

	if (!membership) {
		return false;
	}

	return membership.role === 'owner' || membership.role === 'admin';
}

/**
 * Query: Get organization settings
 * Returns settings with encrypted keys (shows hasKey flags only)
 */
export const getOrganizationSettings = query({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			return null;
		}

		// Verify user is member of org
		const membership = await ctx.db
			.query('organizationMembers')
			.withIndex('by_organization_user', (q) =>
				q.eq('organizationId', args.organizationId).eq('userId', userId)
			)
			.first();

		if (!membership) {
			return null;
		}

		const settings = await ctx.db
			.query('organizationSettings')
			.withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
			.first();

		if (!settings) {
			return {
				_id: null,
				organizationId: args.organizationId,
				hasClaudeKey: false,
				isAdmin: membership.role === 'owner' || membership.role === 'admin'
			};
		}

		return {
			_id: settings._id,
			organizationId: settings.organizationId,
			hasClaudeKey: !!settings.claudeApiKey,
			isAdmin: membership.role === 'owner' || membership.role === 'admin'
		};
	}
});

/**
 * Action: Update organization Claude API key
 * Validates key via HTTP, only admins can update
 */
export const updateOrganizationClaudeApiKey = action({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations'),
		apiKey: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await ctx.runQuery(internal.settings.getUserIdFromSessionId, {
			sessionId: args.sessionId
		});
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Verify user is admin (actions can't access db, need to run query)
		const settings = await ctx.runQuery(internal.organizationSettings.checkAdminAccess, {
			userId: userId,
			organizationId: args.organizationId
		});
		if (!settings?.isAdmin) {
			throw new Error('Only organization admins can update settings');
		}

		// Validate API key by making a test request to Claude
		const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': args.apiKey,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: 'claude-3-haiku-20240307',
				max_tokens: 10,
				messages: [{ role: 'user', content: 'test' }]
			})
		});

		if (!testResponse.ok) {
			const error = await testResponse.text();
			throw new Error(`Invalid API key: ${error}`);
		}

		// Key is valid, save it
		await ctx.runMutation(internal.organizationSettings.saveClaudeApiKey, {
			organizationId: args.organizationId,
			apiKey: args.apiKey
		});

		return args.organizationId;
	}
});

/**
 * Internal query: Check if user is admin of organization
 */
export const checkAdminAccess = internalQuery({
	args: {
		userId: v.id('users'),
		organizationId: v.id('organizations')
	},
	handler: async (ctx, args) => {
		const isAdmin = await isOrganizationAdmin(ctx, args.userId, args.organizationId);
		return { isAdmin };
	}
});

/**
 * Internal mutation: Save Claude API key to database
 */
export const saveClaudeApiKey = internalMutation({
	args: {
		organizationId: v.id('organizations'),
		apiKey: v.string()
	},
	handler: async (ctx, args) => {
		// Internal mutation - no auth check needed (called by authenticated action)

		// Find existing settings
		const existing = await ctx.db
			.query('organizationSettings')
			.withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
			.first();

		if (existing) {
			// Update existing
			await ctx.db.patch(existing._id, {
				claudeApiKey: args.apiKey,
				updatedAt: Date.now()
			});
			return existing._id;
		} else {
			// Create new
			return await ctx.db.insert('organizationSettings', {
				organizationId: args.organizationId,
				claudeApiKey: args.apiKey,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		}
	}
});

/**
 * Mutation: Delete organization Claude API key
 * Only admins can delete
 */
export const deleteOrganizationClaudeApiKey = mutation({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// Verify user is admin
		const isAdmin = await isOrganizationAdmin(ctx, userId, args.organizationId);
		if (!isAdmin) {
			throw new Error('Only organization admins can delete settings');
		}

		const settings = await ctx.db
			.query('organizationSettings')
			.withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
			.first();

		if (settings) {
			await ctx.db.patch(settings._id, {
				claudeApiKey: undefined,
				updatedAt: Date.now()
			});
			return settings._id;
		}

		return null;
	}
});

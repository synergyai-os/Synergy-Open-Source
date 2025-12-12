/**
 * Organization Settings Queries and Mutations
 *
 * Handles org-owned settings (Claude API key, etc.)
 * Only admins/owners can edit workspace settings
 */

import { query, mutation, action, internalMutation, internalQuery } from '../../_generated/server';
import { internal } from '../../_generated/api';
import { v } from 'convex/values';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import type { QueryCtx, MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';

/**
 * Helper: Check if user is admin or owner of workspace
 */
async function isWorkspaceAdmin(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	workspaceId: Id<'workspaces'>
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
 * Query: Get workspace settings
 * Returns settings with encrypted keys (shows hasKey flags only)
 */
export const getOrganizationSettings = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user is member of org
		const membership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!membership) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'You do not have access to this workspace'
			);
		}

		const settings = await ctx.db
			.query('workspaceSettings')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.first();

		if (!settings) {
			return {
				_id: null,
				workspaceId: args.workspaceId,
				hasClaudeKey: false,
				isAdmin: membership.role === 'owner' || membership.role === 'admin'
			};
		}

		return {
			_id: settings._id,
			workspaceId: settings.workspaceId,
			hasClaudeKey: !!settings.claudeApiKey,
			isAdmin: membership.role === 'owner' || membership.role === 'admin'
		};
	}
});

/**
 * Action: Update workspace Claude API key
 * Validates key via HTTP, only admins can update
 */
export const updateOrganizationClaudeApiKey = action({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		apiKey: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user is admin (actions can't access db, need to run query)
		const settings = await ctx.runQuery(internal.workspaceSettings.checkAdminAccess, {
			userId: userId,
			workspaceId: args.workspaceId
		});
		if (!settings?.isAdmin) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'Only workspace admins can update settings'
			);
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
			throw createError(ErrorCodes.VALIDATION_INVALID_FORMAT, `Invalid API key: ${error}`);
		}

		// Key is valid, save it
		await ctx.runMutation(internal.workspaceSettings.saveClaudeApiKey, {
			workspaceId: args.workspaceId,
			apiKey: args.apiKey
		});

		return args.workspaceId;
	}
});

/**
 * Internal query: Check if user is admin of workspace
 */
export const checkAdminAccess = internalQuery({
	args: {
		userId: v.id('users'),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const isAdmin = await isWorkspaceAdmin(ctx, args.userId, args.workspaceId);
		return { isAdmin };
	}
});

/**
 * Internal mutation: Save Claude API key to database
 */
export const saveClaudeApiKey = internalMutation({
	args: {
		workspaceId: v.id('workspaces'),
		apiKey: v.string()
	},
	handler: async (ctx, args) => {
		// Internal mutation - no auth check needed (called by authenticated action)

		// Find existing settings
		const existing = await ctx.db
			.query('workspaceSettings')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
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
			return await ctx.db.insert('workspaceSettings', {
				workspaceId: args.workspaceId,
				claudeApiKey: args.apiKey,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		}
	}
});

/**
 * Mutation: Delete workspace Claude API key
 * Only admins can delete
 */
export const deleteOrganizationClaudeApiKey = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user is admin
		const isAdmin = await isWorkspaceAdmin(ctx, userId, args.workspaceId);
		if (!isAdmin) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'Only workspace admins can delete settings'
			);
		}

		const settings = await ctx.db
			.query('workspaceSettings')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
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

/**
 * Query: Get workspace org chart settings
 * Returns org chart settings (allowQuickChanges, requireCircleLeadRole, etc.)
 */
export const getOrgSettings = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user is member of workspace
		const membership = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace_user', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!membership) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'You do not have access to this workspace'
			);
		}

		const orgSettings = await ctx.db
			.query('workspaceOrgSettings')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.first();

		// Return defaults if no settings exist
		if (!orgSettings) {
			// Default Lead requirement by circle type (SYOS-674)
			const defaultLeadRequirement = {
				hierarchy: true,
				empowered_team: false,
				guild: false,
				hybrid: true
			};

			return {
				workspaceId: args.workspaceId,
				requireCircleLeadRole: true, // Deprecated, kept for backward compat
				leadRequirementByCircleType: defaultLeadRequirement,
				coreRoleTemplateIds: [],
				allowQuickChanges: false,
				isAdmin: membership.role === 'owner' || membership.role === 'admin'
			};
		}

		// Ensure leadRequirementByCircleType exists (migration support)
		const leadRequirementByCircleType = orgSettings.leadRequirementByCircleType ?? {
			hierarchy: orgSettings.requireCircleLeadRole ?? true,
			empowered_team: false,
			guild: false,
			hybrid: orgSettings.requireCircleLeadRole ?? true
		};

		return {
			...orgSettings,
			leadRequirementByCircleType,
			isAdmin: membership.role === 'owner' || membership.role === 'admin'
		};
	}
});

/**
 * Mutation: Update workspace org chart settings
 * Only admins/owners can update
 */
export const updateOrgSettings = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		allowQuickChanges: v.optional(v.boolean()),
		requireCircleLeadRole: v.optional(v.boolean()), // Deprecated, kept for backward compat
		leadRequirementByCircleType: v.optional(
			v.object({
				hierarchy: v.boolean(),
				empowered_team: v.boolean(),
				guild: v.boolean(),
				hybrid: v.boolean()
			})
		),
		coreRoleTemplateIds: v.optional(v.array(v.id('roleTemplates')))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user is admin
		const isAdmin = await isWorkspaceAdmin(ctx, userId, args.workspaceId);
		if (!isAdmin) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'Only workspace admins can update org chart settings'
			);
		}

		// Find existing settings
		const existing = await ctx.db
			.query('workspaceOrgSettings')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.first();

		const now = Date.now();
		const updateData: {
			allowQuickChanges?: boolean;
			requireCircleLeadRole?: boolean;
			leadRequirementByCircleType?: {
				hierarchy: boolean;
				empowered_team: boolean;
				guild: boolean;
				hybrid: boolean;
			};
			coreRoleTemplateIds?: Id<'roleTemplates'>[];
			updatedAt: number;
		} = {
			updatedAt: now
		};

		if (args.allowQuickChanges !== undefined) {
			updateData.allowQuickChanges = args.allowQuickChanges;
		}
		if (args.requireCircleLeadRole !== undefined) {
			updateData.requireCircleLeadRole = args.requireCircleLeadRole;
		}
		if (args.leadRequirementByCircleType !== undefined) {
			updateData.leadRequirementByCircleType = args.leadRequirementByCircleType;
		}
		if (args.coreRoleTemplateIds !== undefined) {
			updateData.coreRoleTemplateIds = args.coreRoleTemplateIds;
		}

		// Default Lead requirement by circle type
		const defaultLeadRequirement = {
			hierarchy: true,
			empowered_team: false,
			guild: false,
			hybrid: true
		};

		if (existing) {
			// Update existing
			await ctx.db.patch(existing._id, updateData);
			return existing._id;
		} else {
			// Create new with defaults
			return await ctx.db.insert('workspaceOrgSettings', {
				workspaceId: args.workspaceId,
				requireCircleLeadRole: args.requireCircleLeadRole ?? true,
				leadRequirementByCircleType: args.leadRequirementByCircleType ?? defaultLeadRequirement,
				coreRoleTemplateIds: args.coreRoleTemplateIds ?? [],
				allowQuickChanges: args.allowQuickChanges ?? false,
				createdAt: now,
				updatedAt: now
			});
		}
	}
});

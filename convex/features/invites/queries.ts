import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Doc } from '../../_generated/dataModel';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { requireCanInviteMembers } from '../../core/workspaces/access';
import { findActiveInviteByCode, getInvitePreview, listWorkspaceInvitesForOrg } from './helpers';

/**
 * Find invite by code (for invite acceptance page)
 */
export const findInviteByCode = query({
	args: {
		sessionId: v.string(),
		code: v.string()
	},
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);
		const invite = await findActiveInviteByCode(ctx, args.code);
		if (!invite) return null;

		return getInvitePreview(ctx, invite);
	}
});

/**
 * Get all invites for a workspace (admin view)
 */
export const getWorkspaceInvites = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await requireCanInviteMembers(ctx, args.workspaceId, userId);
		return listWorkspaceInvitesForOrg(ctx, args.workspaceId);
	}
});

/**
 * List all pending invites for the current user
 */
export const listWorkspaceInvites = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args): Promise<Doc<'workspaceInvites'>[]> => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		// listInvitesForUser returns enriched details, but this API expects raw invites
		// For backwards compatibility, return raw invites from the DB
		const rawInvites = await ctx.db
			.query('workspaceInvites')
			.withIndex('by_user', (q) => q.eq('invitedUserId', userId))
			.collect();
		return rawInvites ?? [];
	}
});

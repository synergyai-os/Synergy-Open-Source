import { internalMutation, mutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { requireCanInviteMembers } from '../../core/workspaces/access';
import {
	acceptWorkspaceInvite,
	createWorkspaceInviteRecord,
	declineWorkspaceInvite,
	resendInviteEmail
} from './helpers';

/**
 * Create a new workspace invite
 */
export const createWorkspaceInvite = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		email: v.optional(v.string()),
		inviteeUserId: v.optional(v.id('users')),
		role: v.optional(v.union(v.literal('owner'), v.literal('admin'), v.literal('member')))
	},
	handler: async (ctx, args): Promise<Id<'workspaceInvites'>> => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const person = await requireCanInviteMembers(ctx, args.workspaceId, userId);
		const result = await createWorkspaceInviteRecord(ctx, {
			workspaceId: args.workspaceId,
			email: args.email,
			invitedUserId: args.inviteeUserId,
			role: args.role,
			personId: person._id
		});
		return result.inviteId;
	}
});

/**
 * Accept a workspace invite (user-facing)
 */
export const acceptOrganizationInvite = mutation({
	args: {
		sessionId: v.string(),
		code: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return acceptWorkspaceInvite(ctx, args.code, userId, { markAccepted: false });
	}
});

/**
 * Accept a workspace invite (internal, marks as accepted)
 */
export const acceptOrganizationInviteInternal = internalMutation({
	args: {
		userId: v.id('users'),
		code: v.string()
	},
	handler: async (ctx, args) => {
		return acceptWorkspaceInvite(ctx, args.code, args.userId, { markAccepted: true });
	}
});

/**
 * Decline a workspace invite
 */
export const declineOrganizationInvite = mutation({
	args: {
		sessionId: v.string(),
		inviteId: v.id('workspaceInvites')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return declineWorkspaceInvite(ctx, args.inviteId, userId);
	}
});

/**
 * Resend an invite email
 */
export const resendOrganizationInvite = mutation({
	args: {
		sessionId: v.string(),
		inviteId: v.id('workspaceInvites')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return resendInviteEmail(ctx, args.inviteId, userId);
	}
});

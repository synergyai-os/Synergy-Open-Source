import { internalMutation, mutation, query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from '../../_generated/dataModel';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { requireCanInviteMembers } from './access';
import { getInvitePreview, listInvitesForUser, listWorkspaceInvitesForOrg } from './inviteDetails';
import {
	acceptWorkspaceInvite,
	createWorkspaceInviteRecord,
	declineWorkspaceInvite,
	findActiveInviteByCode,
	resendInviteEmail
} from './inviteOperations';

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
		return createWorkspaceInviteRecord(ctx, {
			workspaceId: args.workspaceId,
			email: args.email,
			invitedUserId: args.inviteeUserId,
			role: args.role,
			userId
		});
	}
});

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

export const acceptOrganizationInviteInternal = internalMutation({
	args: {
		userId: v.id('users'),
		code: v.string()
	},
	handler: async (ctx, args) => {
		return acceptWorkspaceInvite(ctx, args.code, args.userId, { markAccepted: true });
	}
});

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

export const listWorkspaceInvites = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args): Promise<Doc<'workspaceInvites'>[]> => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const invites = await listInvitesForUser(ctx, userId);
		return invites ?? [];
	}
});

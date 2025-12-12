import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import { mutation, query } from '../../_generated/server';
import {
	checkPersonInvited,
	createInvitation as createInvitationHelper,
	createInvitationArgs,
	isPersonInvitedArgs,
	listInvitationsByMeetingArgs,
	listInvitationsByMeeting,
	removeInvitation as removeInvitationHelper,
	removeInvitationArgs,
	updateInvitationAcceptArgs,
	updateInvitationAccept,
	updateInvitationDeclineArgs,
	updateInvitationDecline,
	updateInvitationResendArgs,
	updateInvitationResend
} from './helpers/invitations';

export const listByMeeting = query({
	args: {
		sessionId: v.string(),
		...listInvitationsByMeetingArgs
	},
	handler: (ctx, args): Promise<unknown[]> => listInvitationsByMeeting(ctx, args)
});

export const isPersonInvited = query({
	args: {
		sessionId: v.string(),
		...isPersonInvitedArgs
	},
	handler: async (ctx, args): Promise<boolean> => {
		const result: boolean = await checkPersonInvited(ctx, args);
		return result;
	}
});

export const createInvitation = mutation({
	args: {
		sessionId: v.string(),
		...createInvitationArgs
	},
	handler: (ctx, args): Promise<{ invitationId: Id<'meetingInvitations'> }> =>
		createInvitationHelper(ctx, args)
});

export const removeInvitation = mutation({
	args: {
		sessionId: v.string(),
		...removeInvitationArgs
	},
	handler: (ctx, args) => removeInvitationHelper(ctx, args)
});

export const updateInvitationAcceptMutation = mutation({
	args: {
		sessionId: v.string(),
		...updateInvitationAcceptArgs
	},
	handler: (ctx, args): Promise<{ success: true }> => updateInvitationAccept(ctx, args)
});

export const updateInvitationDeclineMutation = mutation({
	args: {
		sessionId: v.string(),
		...updateInvitationDeclineArgs
	},
	handler: (ctx, args): Promise<{ success: true }> => updateInvitationDecline(ctx, args)
});

export const updateInvitationResendMutation = mutation({
	args: {
		sessionId: v.string(),
		...updateInvitationResendArgs
	},
	handler: (ctx, args): Promise<{ success: true }> => updateInvitationResend(ctx, args)
});

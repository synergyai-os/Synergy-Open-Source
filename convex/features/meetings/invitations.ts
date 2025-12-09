import type { Id } from '../../_generated/dataModel';
import { mutation, query } from '../../_generated/server';
import {
	checkUserInvited,
	createInvitation as createInvitationHelper,
	createInvitationArgs,
	isUserInvitedArgs,
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
	args: listInvitationsByMeetingArgs,
	handler: (ctx, args): Promise<unknown[]> => listInvitationsByMeeting(ctx, args)
});

export const isUserInvited = query({
	args: isUserInvitedArgs,
	handler: async (ctx, args): Promise<boolean> => {
		const result: boolean = await checkUserInvited(ctx, args);
		return result;
	}
});

export const createInvitation = mutation({
	args: createInvitationArgs,
	handler: (ctx, args): Promise<{ invitationId: Id<'meetingInvitations'> }> =>
		createInvitationHelper(ctx, args)
});

export const removeInvitation = mutation({
	args: removeInvitationArgs,
	handler: (ctx, args) => removeInvitationHelper(ctx, args)
});

export const updateInvitationAcceptMutation = mutation({
	args: updateInvitationAcceptArgs,
	handler: (ctx, args): Promise<{ success: true }> => updateInvitationAccept(ctx, args)
});

export const updateInvitationDeclineMutation = mutation({
	args: updateInvitationDeclineArgs,
	handler: (ctx, args): Promise<{ success: true }> => updateInvitationDecline(ctx, args)
});

export const updateInvitationResendMutation = mutation({
	args: updateInvitationResendArgs,
	handler: (ctx, args): Promise<{ success: true }> => updateInvitationResend(ctx, args)
});

import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { MutationCtx } from '../../../../_generated/server';
import { createError, ErrorCodes } from '../../../../infrastructure/errors/codes';
import {
	ensureWorkspaceMembership,
	requireMeeting,
	requireWorkspacePersonFromSession
} from '../access';

type CreateInvitationArgs = {
	sessionId: string;
	meetingId: Id<'meetings'>;
	invitationType: 'user' | 'circle';
	personId?: Id<'people'>;
	circleId?: Id<'circles'>;
};
type RemoveInvitationArgs = { sessionId: string; invitationId: Id<'meetingInvitations'> };
type UpdateInvitationArgs = { sessionId: string; invitationId: Id<'meetingInvitations'> };

export const createInvitationArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings'),
	invitationType: v.union(v.literal('user'), v.literal('circle')),
	personId: v.optional(v.id('people')),
	circleId: v.optional(v.id('circles'))
};

export async function createInvitation(
	ctx: MutationCtx,
	args: CreateInvitationArgs
): Promise<{ invitationId: Id<'meetingInvitations'> }> {
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.MEETING_NOT_FOUND);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);

	if (args.invitationType === 'user' && !args.personId) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			'personId is required when invitationType is "user"'
		);
	}
	if (args.invitationType === 'circle' && !args.circleId) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			'circleId is required when invitationType is "circle"'
		);
	}

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId);

	if (args.invitationType === 'user' && args.personId) {
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, args.personId);
	}
	if (args.invitationType === 'circle' && args.circleId) {
		const circle = await ctx.db.get(args.circleId);
		if (!circle) throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		if (circle.workspaceId !== meeting.workspaceId) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'Circle does not belong to this workspace'
			);
		}
	}

	const invitationId = await ctx.db.insert('meetingInvitations', {
		meetingId: args.meetingId,
		invitationType: args.invitationType,
		personId: args.personId,
		circleId: args.circleId,
		status: 'pending',
		respondedAt: undefined,
		lastSentAt: Date.now(),
		createdAt: Date.now(),
		createdByPersonId: personId
	});

	return { invitationId };
}

export const removeInvitationArgs = {
	sessionId: v.string(),
	invitationId: v.id('meetingInvitations')
};

export async function removeInvitation(
	ctx: MutationCtx,
	args: RemoveInvitationArgs
): Promise<{ success: true }> {
	const invitation = await ctx.db.get(args.invitationId);
	if (!invitation) {
		throw createError(ErrorCodes.MEETING_INVITATION_NOT_FOUND, 'Invitation not found');
	}

	const meeting = await requireMeeting(ctx, invitation.meetingId, ErrorCodes.MEETING_NOT_FOUND);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId);

	await ctx.db.delete(args.invitationId);
	return { success: true };
}

export const updateInvitationAcceptArgs = {
	sessionId: v.string(),
	invitationId: v.id('meetingInvitations')
};

export async function updateInvitationAccept(
	ctx: MutationCtx,
	args: UpdateInvitationArgs
): Promise<{ success: true }> {
	const invitation = await ctx.db.get(args.invitationId);
	if (!invitation) {
		throw createError(ErrorCodes.MEETING_INVITATION_NOT_FOUND, 'Invitation not found');
	}

	if (invitation.invitationType !== 'user') {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Only user invitations can be accepted');
	}

	const meeting = await requireMeeting(ctx, invitation.meetingId, ErrorCodes.MEETING_NOT_FOUND);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);

	if (invitation.personId !== personId) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Only the invited user can accept this invitation');
	}

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId);

	if (invitation.status === 'accepted') {
		return { success: true };
	}

	const existingAttendee = await ctx.db
		.query('meetingAttendees')
		.withIndex('by_meeting_person', (q) =>
			q.eq('meetingId', invitation.meetingId).eq('personId', personId)
		)
		.first();

	if (!existingAttendee) {
		await ctx.db.insert('meetingAttendees', {
			meetingId: invitation.meetingId,
			personId,
			joinedAt: Date.now()
		});
	}

	await ctx.db.patch(args.invitationId, {
		status: 'accepted',
		respondedAt: Date.now()
	});

	return { success: true };
}

export const updateInvitationDeclineArgs = {
	sessionId: v.string(),
	invitationId: v.id('meetingInvitations')
};

export async function updateInvitationDecline(
	ctx: MutationCtx,
	args: UpdateInvitationArgs
): Promise<{ success: true }> {
	const invitation = await ctx.db.get(args.invitationId);
	if (!invitation) {
		throw createError(ErrorCodes.MEETING_INVITATION_NOT_FOUND, 'Invitation not found');
	}

	if (invitation.invitationType !== 'user') {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Only user invitations can be declined');
	}

	const meeting = await requireMeeting(ctx, invitation.meetingId, ErrorCodes.MEETING_NOT_FOUND);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);

	if (invitation.personId !== personId) {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			'Only the invited user can decline this invitation'
		);
	}

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId);

	if (invitation.status === 'declined') {
		return { success: true };
	}

	if (invitation.status === 'accepted') {
		const attendee = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting_person', (q) =>
				q.eq('meetingId', invitation.meetingId).eq('personId', personId)
			)
			.first();
		if (attendee) {
			await ctx.db.delete(attendee._id);
		}
	}

	await ctx.db.patch(args.invitationId, {
		status: 'declined',
		respondedAt: Date.now()
	});

	return { success: true };
}

export const updateInvitationResendArgs = {
	sessionId: v.string(),
	invitationId: v.id('meetingInvitations')
};

export async function updateInvitationResend(
	ctx: MutationCtx,
	args: UpdateInvitationArgs
): Promise<{ success: true }> {
	const invitation = await ctx.db.get(args.invitationId);
	if (!invitation) {
		throw createError(ErrorCodes.MEETING_INVITATION_NOT_FOUND, 'Invitation not found');
	}

	const meeting = await requireMeeting(ctx, invitation.meetingId, ErrorCodes.MEETING_NOT_FOUND);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId);

	if (meeting.createdByPersonId !== personId && invitation.createdByPersonId !== personId) {
		throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, 'Not allowed to resend this invitation');
	}

	await ctx.db.patch(args.invitationId, {
		status: 'pending',
		respondedAt: undefined,
		lastSentAt: Date.now()
	});

	return { success: true };
}

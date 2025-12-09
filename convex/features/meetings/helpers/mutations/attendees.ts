import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { MutationCtx } from '../../../../_generated/server';
import { createError, ErrorCodes } from '../../../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../../../infrastructure/sessionValidation';
import { ensureWorkspaceMembership, requireMeeting } from '../access';

type AddAttendeeArgs = { sessionId: string; meetingId: Id<'meetings'>; userId: Id<'users'> };
type RemoveAttendeeArgs = { sessionId: string; attendeeId: Id<'meetingAttendees'> };

export const addAttendeeArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings'),
	userId: v.id('users')
};

export async function addAttendeeToMeeting(
	ctx: MutationCtx,
	args: AddAttendeeArgs
): Promise<{ attendeeId: Id<'meetingAttendees'> }> {
	const { userId: currentUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.GENERIC_ERROR);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, currentUserId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, args.userId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	const existingAttendee = await ctx.db
		.query('meetingAttendees')
		.withIndex('by_meeting_user', (q) =>
			q.eq('meetingId', args.meetingId).eq('userId', args.userId)
		)
		.first();

	if (existingAttendee) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'User is already an attendee');
	}

	if (meeting.visibility === 'private') {
		const invitations = await ctx.db
			.query('meetingInvitations')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		const directInvitation = invitations.find(
			(inv) => inv.invitationType === 'user' && inv.userId === args.userId
		);

		const userCircleMemberships = await ctx.db
			.query('circleMembers')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.collect();
		const userCircleIds = new Set(userCircleMemberships.map((m) => m.circleId));

		const circleInvitation = invitations.find(
			(inv) => inv.invitationType === 'circle' && inv.circleId && userCircleIds.has(inv.circleId)
		);

		const circleLinked = meeting.circleId && userCircleIds.has(meeting.circleId);

		if (!directInvitation && !circleInvitation && !circleLinked) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'User is not invited to this private meeting');
		}
	}

	const attendeeId = await ctx.db.insert('meetingAttendees', {
		meetingId: args.meetingId,
		userId: args.userId,
		joinedAt: Date.now()
	});

	return { attendeeId };
}

export const removeAttendeeArgs = {
	sessionId: v.string(),
	attendeeId: v.id('meetingAttendees')
};

export async function removeAttendeeFromMeeting(
	ctx: MutationCtx,
	args: RemoveAttendeeArgs
): Promise<{ success: true }> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const attendee = await ctx.db.get(args.attendeeId);
	if (!attendee) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Attendee not found');
	}

	const meeting = await requireMeeting(ctx, attendee.meetingId, ErrorCodes.GENERIC_ERROR);
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	await ctx.db.delete(args.attendeeId);
	return { success: true };
}

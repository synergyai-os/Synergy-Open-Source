import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { MutationCtx } from '../../../../_generated/server';
import { createError, ErrorCodes } from '../../../../infrastructure/errors/codes';
import {
	ensureWorkspaceMembership,
	requireMeeting,
	requireWorkspacePersonFromSession
} from '../access';

type AddAttendeeArgs = { sessionId: string; meetingId: Id<'meetings'>; personId: Id<'people'> };
type RemoveAttendeeArgs = { sessionId: string; attendeeId: Id<'meetingAttendees'> };

export const addAttendeeArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings'),
	personId: v.id('people')
};

export async function addAttendeeToMeeting(
	ctx: MutationCtx,
	args: AddAttendeeArgs
): Promise<{ attendeeId: Id<'meetingAttendees'> }> {
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.GENERIC_ERROR);
	const { personId: actorPersonId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId,
		{
			errorCode: ErrorCodes.GENERIC_ERROR,
			message: 'Workspace membership required'
		}
	);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, actorPersonId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, args.personId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	const existingAttendee = await ctx.db
		.query('meetingAttendees')
		.withIndex('by_meeting_person', (q) =>
			q.eq('meetingId', args.meetingId).eq('personId', args.personId)
		)
		.first();

	if (existingAttendee) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Person is already an attendee');
	}

	if (meeting.visibility === 'private') {
		const invitations = await ctx.db
			.query('meetingInvitations')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		const directInvitation = invitations.find(
			(inv) => inv.invitationType === 'user' && inv.personId === args.personId
		);

		const personCircleMemberships = await ctx.db
			.query('circleMembers')
			.withIndex('by_person', (q) => q.eq('personId', args.personId))
			.collect();
		const personCircleIds = new Set(personCircleMemberships.map((m) => m.circleId));

		const circleInvitation = invitations.find(
			(inv) => inv.invitationType === 'circle' && inv.circleId && personCircleIds.has(inv.circleId)
		);

		const circleLinked = meeting.circleId && personCircleIds.has(meeting.circleId);

		if (!directInvitation && !circleInvitation && !circleLinked) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Person is not invited to this private meeting');
		}
	}

	const attendeeId = await ctx.db.insert('meetingAttendees', {
		meetingId: args.meetingId,
		personId: args.personId,
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
	const attendee = await ctx.db.get(args.attendeeId);
	if (!attendee) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Attendee not found');
	}

	const meeting = await requireMeeting(ctx, attendee.meetingId, ErrorCodes.GENERIC_ERROR);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId,
		{
			errorCode: ErrorCodes.GENERIC_ERROR,
			message: 'Workspace membership required'
		}
	);
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	await ctx.db.delete(args.attendeeId);
	return { success: true };
}

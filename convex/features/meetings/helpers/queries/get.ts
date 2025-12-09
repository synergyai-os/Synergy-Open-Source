import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { ErrorCodes } from '../../../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../../../infrastructure/sessionValidation';
import { ensureWorkspaceMembership } from '../access';
import { loadMeetingOrThrow } from './shared';

type GetArgs = { sessionId: string; meetingId: Id<'meetings'> };

export const getMeetingArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings')
};

export async function getMeeting(ctx: QueryCtx, args: GetArgs) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const meeting = await loadMeetingOrThrow(ctx, args.meetingId);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	const attendees = await resolveAttendees(ctx, meeting._id);
	return { ...meeting, attendees };
}

async function resolveAttendees(ctx: QueryCtx, meetingId: Id<'meetings'>) {
	const attendees = await ctx.db
		.query('meetingAttendees')
		.withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
		.collect();

	return Promise.all(
		attendees.map(async (attendee) => {
			const person = await ctx.db.get(attendee.userId);
			return {
				...attendee,
				userName: person?.name ?? person?.email ?? 'Unknown person'
			};
		})
	);
}

import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { ErrorCodes } from '../../../../infrastructure/errors/codes';
import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from '../access';
import { loadMeetingOrThrow } from './shared';

type GetArgs = { sessionId: string; meetingId: Id<'meetings'> };

export const getMeetingArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings')
};

export async function getMeeting(ctx: QueryCtx, args: GetArgs) {
	const meeting = await loadMeetingOrThrow(ctx, args.meetingId);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	const attendees = await resolveAttendees(ctx, meeting._id);
	return { ...meeting, attendees, viewerPersonId: personId };
}

async function resolveAttendees(ctx: QueryCtx, meetingId: Id<'meetings'>) {
	const attendees = await ctx.db
		.query('meetingAttendees')
		.withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
		.collect();

	return Promise.all(
		attendees.map(async (attendee) => {
			const person = await ctx.db.get(attendee.personId);
			return {
				...attendee,
				personName: person?.displayName ?? person?.email ?? 'Unknown person'
			};
		})
	);
}

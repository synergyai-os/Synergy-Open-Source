import { createError, ErrorCodes } from '../../../../infrastructure/errors/codes';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import {
	ensureWorkspaceMembership,
	requireCircle,
	requireMeeting,
	requireWorkspacePersonFromSession
} from '../access';

type WorkspaceAccessArgs = { sessionId: string; workspaceId: Id<'workspaces'> };

export async function requireWorkspaceMember(
	ctx: QueryCtx,
	args: WorkspaceAccessArgs,
	overrides?: { errorCode?: ErrorCodes; message?: string }
) {
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		args.workspaceId,
		{
			errorCode: overrides?.errorCode ?? ErrorCodes.GENERIC_ERROR,
			message: overrides?.message ?? 'Workspace membership required'
		}
	);
	return { personId };
}

export async function fetchMeetingsByWorkspace(ctx: QueryCtx, workspaceId: Id<'workspaces'>) {
	const meetings = await ctx.db
		.query('meetings')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();
	return meetings.filter((meeting) => !meeting.deletedAt);
}

export async function fetchAttendeeCounts(ctx: QueryCtx, meetingIds: Id<'meetings'>[]) {
	if (!meetingIds.length) return new Map<Id<'meetings'>, number>();

	const allAttendees: Array<{ meetingId: Id<'meetings'> }> = [];
	for (const meetingId of meetingIds) {
		const attendees = await ctx.db
			.query('meetingAttendees')
			.withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
			.collect();
		allAttendees.push(...attendees);
	}

	const counts = new Map<Id<'meetings'>, number>();
	for (const attendee of allAttendees) {
		const nextCount = (counts.get(attendee.meetingId) ?? 0) + 1;
		counts.set(attendee.meetingId, nextCount);
	}

	return counts;
}

export async function loadMeetingOrThrow(ctx: QueryCtx, meetingId: Id<'meetings'>) {
	const meeting = await requireMeeting(ctx, meetingId, ErrorCodes.GENERIC_ERROR);
	if (meeting.deletedAt) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Meeting not found');
	}
	return meeting;
}

export async function ensureCircleMembership(
	ctx: QueryCtx,
	circleId: Id<'circles'>,
	personId: Id<'people'>
) {
	const circle = await requireCircle(ctx, circleId, ErrorCodes.GENERIC_ERROR);
	await ensureWorkspaceMembership(ctx, circle.workspaceId, personId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});
	return circle;
}

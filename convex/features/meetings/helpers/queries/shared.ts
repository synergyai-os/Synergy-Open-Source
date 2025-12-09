import { createError, ErrorCodes } from '../../../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../../../infrastructure/sessionValidation';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { ensureWorkspaceMembership, requireCircle, requireMeeting } from '../access';

type WorkspaceAccessArgs = { sessionId: string; workspaceId: Id<'workspaces'> };

export async function requireWorkspaceMember(
	ctx: QueryCtx,
	args: WorkspaceAccessArgs,
	overrides?: { errorCode?: ErrorCodes; message?: string }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	await ensureWorkspaceMembership(ctx, args.workspaceId, userId, {
		errorCode: overrides?.errorCode ?? ErrorCodes.GENERIC_ERROR,
		message: overrides?.message ?? 'Workspace membership required'
	});
	return { userId };
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

	const allAttendees = await ctx.db
		.query('meetingAttendees')
		.withIndex('by_meeting', (q) => q.in('meetingId', meetingIds))
		.collect();

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
	userId: Id<'users'>
) {
	const circle = await requireCircle(ctx, circleId, ErrorCodes.GENERIC_ERROR);
	await ensureWorkspaceMembership(ctx, circle.workspaceId, userId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});
	return circle;
}

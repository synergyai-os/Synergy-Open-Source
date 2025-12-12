import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { createError, ErrorCodes } from '../../../../infrastructure/errors/codes';
import {
	ensureWorkspaceMembership,
	requireMeeting,
	requireWorkspacePersonFromSession
} from '../access';
import {
	fetchCircleMembersByMeeting,
	getInvitationsByMeetingMap,
	getInvitedUsersForMeeting
} from './invitedUsersUtils';

type GetInvitedUsersArgs = { sessionId: string; meetingId: Id<'meetings'> };

export const getInvitedUsersArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings')
};

export async function getInvitedUsersQuery(ctx: QueryCtx, args: GetInvitedUsersArgs) {
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.GENERIC_ERROR);

	if (meeting.deletedAt) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Meeting not found');
	}

	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	const invitations = await ctx.db
		.query('meetingInvitations')
		.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
		.collect();

	const circleMembersByCircle = await fetchCircleMembersByMeeting(
		ctx,
		meeting.circleId,
		args.meetingId
	);

	return getInvitedUsersForMeeting(
		ctx,
		args.meetingId,
		meeting.circleId,
		getInvitationsByMeetingMap(invitations),
		circleMembersByCircle
	);
}

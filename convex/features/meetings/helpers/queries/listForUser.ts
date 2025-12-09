import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { ErrorCodes } from '../../../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../../../infrastructure/sessionValidation';
import { ensureWorkspaceMembership } from '../access';
import {
	getInvitationsByMeetingMap,
	getInvitedUsersForMeeting,
	isUserInvitedToMeeting
} from './invitedUsersUtils';

type ListForUserArgs = { sessionId: string; workspaceId: Id<'workspaces'> };
type MeetingWithInvitedUsers = {
	invitedUsers: Array<{ userId: string; name: string }>;
	_id: Id<'meetings'>;
	visibility: 'public' | 'private';
	circleId?: Id<'circles'>;
	workspaceId: Id<'workspaces'>;
};

export const listMeetingsForUserArgs = {
	sessionId: v.string(),
	workspaceId: v.id('workspaces')
};

export async function listMeetingsForUser(
	ctx: QueryCtx,
	args: ListForUserArgs
): Promise<MeetingWithInvitedUsers[]> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	await ensureWorkspaceMembership(ctx, args.workspaceId, userId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	const meetings = await fetchWorkspaceMeetings(ctx, args.workspaceId);
	const invitations = await fetchInvitationsForMeetings(
		ctx,
		meetings.map((meeting) => meeting._id)
	);
	const circleMembersByCircle = await fetchCircleMembersForMeetings(ctx, meetings, invitations);
	const invitationsByMeeting = getInvitationsByMeetingMap(invitations);

	return filterAccessibleMeetings(
		ctx,
		meetings,
		userId,
		invitationsByMeeting,
		circleMembersByCircle
	);
}

async function fetchWorkspaceMeetings(ctx: QueryCtx, workspaceId: Id<'workspaces'>) {
	const meetings = await ctx.db
		.query('meetings')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	return meetings.filter((meeting) => !meeting.deletedAt);
}

async function fetchInvitationsForMeetings(ctx: QueryCtx, meetingIds: Id<'meetings'>[]) {
	if (!meetingIds.length) return [];
	return ctx.db
		.query('meetingInvitations')
		.withIndex('by_meeting', (q) => q.in('meetingId', meetingIds))
		.collect();
}

async function fetchCircleMembersForMeetings(
	ctx: QueryCtx,
	meetings: Array<{ circleId?: Id<'circles'> }>,
	invitations: Array<{ invitationType: 'user' | 'circle'; circleId?: Id<'circles'> }>
) {
	const circleIds = new Set<Id<'circles'>>();
	for (const meeting of meetings) {
		if (meeting.circleId) circleIds.add(meeting.circleId);
	}
	for (const invitation of invitations) {
		if (invitation.invitationType === 'circle' && invitation.circleId) {
			circleIds.add(invitation.circleId);
		}
	}

	if (!circleIds.size) return new Map<Id<'circles'>, Array<{ userId: Id<'users'> }>>();

	const circleMembers = await ctx.db
		.query('circleMembers')
		.withIndex('by_circle_user', (q) => q.in('circleId', Array.from(circleIds)))
		.collect();

	const map = new Map<Id<'circles'>, Array<{ userId: Id<'users'> }>>();
	for (const member of circleMembers) {
		const existing = map.get(member.circleId) ?? [];
		existing.push({ userId: member.userId });
		map.set(member.circleId, existing);
	}
	return map;
}

async function filterAccessibleMeetings(
	ctx: QueryCtx,
	meetings: MeetingWithInvitedUsers[],
	userId: Id<'users'>,
	invitationsByMeeting: Map<
		Id<'meetings'>,
		Array<{ invitationType: 'user' | 'circle'; userId?: Id<'users'>; circleId?: Id<'circles'> }>
	>,
	circleMembersByCircle: Map<Id<'circles'>, Array<{ userId: Id<'users'> }>>
) {
	const accessible: MeetingWithInvitedUsers[] = [];
	for (const meeting of meetings) {
		const hasAccess =
			meeting.visibility === 'public' ||
			(await isUserInvitedToMeeting(
				ctx,
				meeting,
				userId,
				invitationsByMeeting,
				circleMembersByCircle
			));

		if (!hasAccess) continue;

		const invitedUsers = await getInvitedUsersForMeeting(
			ctx,
			meeting._id,
			meeting.circleId,
			invitationsByMeeting,
			circleMembersByCircle
		);

		accessible.push({ ...meeting, invitedUsers });
	}
	return accessible;
}

import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { ErrorCodes } from '../../../../infrastructure/errors/codes';
import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from '../access';
import {
	getInvitationsByMeetingMap,
	getInvitedUsersForMeeting,
	isPersonInvitedToMeeting
} from './invitedUsersUtils';

type ListForUserArgs = { sessionId: string; workspaceId: Id<'workspaces'> };
type MeetingWithInvitedUsers = {
	invitedUsers: Array<{ personId: string; name: string }>;
	_id: Id<'meetings'>;
	visibility: 'public' | 'private';
	circleId?: Id<'circles'>;
	workspaceId: Id<'workspaces'>;
	viewerPersonId: Id<'people'>;
};

export const listMeetingsForUserArgs = {
	sessionId: v.string(),
	workspaceId: v.id('workspaces')
};

export async function listMeetingsForUser(
	ctx: QueryCtx,
	args: ListForUserArgs
): Promise<MeetingWithInvitedUsers[]> {
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		args.workspaceId,
		{
			errorCode: ErrorCodes.GENERIC_ERROR,
			message: 'Workspace membership required'
		}
	);
	await ensureWorkspaceMembership(ctx, args.workspaceId, personId, {
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
		personId,
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
	const invitations = [];
	for (const meetingId of meetingIds) {
		const meetingInvitations = await ctx.db
			.query('meetingInvitations')
			.withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
			.collect();
		invitations.push(...meetingInvitations);
	}
	return invitations;
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

	if (!circleIds.size) return new Map<Id<'circles'>, Array<{ personId: Id<'people'> }>>();

	const circleMembers: Array<{ circleId: Id<'circles'>; personId: Id<'people'> }> = [];
	for (const circleId of circleIds) {
		const members = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle_person', (q) => q.eq('circleId', circleId))
			.collect();
		circleMembers.push(...members);
	}

	const map = new Map<Id<'circles'>, Array<{ personId: Id<'people'> }>>();
	for (const member of circleMembers) {
		const existing = map.get(member.circleId) ?? [];
		existing.push({ personId: member.personId });
		map.set(member.circleId, existing);
	}
	return map;
}

async function filterAccessibleMeetings(
	ctx: QueryCtx,
	meetings: MeetingWithInvitedUsers[],
	personId: Id<'people'>,
	invitationsByMeeting: Map<
		Id<'meetings'>,
		Array<{ invitationType: 'user' | 'circle'; personId?: Id<'people'>; circleId?: Id<'circles'> }>
	>,
	circleMembersByCircle: Map<Id<'circles'>, Array<{ personId: Id<'people'> }>>
) {
	const accessible: MeetingWithInvitedUsers[] = [];
	for (const meeting of meetings) {
		const hasAccess =
			meeting.visibility === 'public' ||
			(await isPersonInvitedToMeeting(
				ctx,
				meeting,
				personId,
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

		accessible.push({ ...meeting, invitedUsers, viewerPersonId: personId });
	}
	return accessible;
}

import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';

export function getInvitationsByMeetingMap(
	invitations: Array<{
		meetingId: Id<'meetings'>;
		invitationType: 'user' | 'circle';
		userId?: Id<'users'>;
		circleId?: Id<'circles'>;
		status?: 'pending' | 'accepted' | 'declined';
	}>
) {
	const map = new Map<
		Id<'meetings'>,
		Array<{ invitationType: 'user' | 'circle'; userId?: Id<'users'>; circleId?: Id<'circles'> }>
	>();
	for (const invitation of invitations) {
		if (invitation.invitationType === 'user' && invitation.status === 'declined') {
			continue;
		}
		const existing = map.get(invitation.meetingId) ?? [];
		existing.push(invitation);
		map.set(invitation.meetingId, existing);
	}
	return map;
}

export async function fetchCircleMembersByMeeting(
	ctx: QueryCtx,
	meetingCircleId: Id<'circles'> | undefined,
	meetingId: Id<'meetings'>
) {
	const circleIds: Id<'circles'>[] = [];
	if (meetingCircleId) circleIds.push(meetingCircleId);
	const circleInvitations = await ctx.db
		.query('meetingInvitations')
		.withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
		.collect();
	for (const inv of circleInvitations) {
		if (inv.circleId) circleIds.push(inv.circleId);
	}

	const circleMembers = await ctx.db
		.query('circleMembers')
		.withIndex('by_circle_user', (q) => q.in('circleId', circleIds))
		.collect();

	const map = new Map<Id<'circles'>, Array<{ userId: Id<'users'> }>>();
	for (const member of circleMembers) {
		const existing = map.get(member.circleId) ?? [];
		existing.push({ userId: member.userId });
		map.set(member.circleId, existing);
	}
	return map;
}

export async function isUserInvitedToMeeting(
	ctx: QueryCtx,
	meeting: { _id: Id<'meetings'>; circleId?: Id<'circles'>; visibility: 'public' | 'private' },
	userId: Id<'users'>,
	invitationsByMeeting: Map<
		Id<'meetings'>,
		Array<{ invitationType: 'user' | 'circle'; userId?: Id<'users'>; circleId?: Id<'circles'> }>
	>,
	circleMembersByCircle: Map<Id<'circles'>, Array<{ userId: Id<'users'> }>>
) {
	if (meeting.visibility === 'public') return true;

	const invitations = invitationsByMeeting.get(meeting._id) ?? [];
	const directInvitation = invitations.find(
		(invitation) => invitation.invitationType === 'user' && invitation.userId === userId
	);
	if (directInvitation) return true;

	const circleInvitations = invitations.filter(
		(invitation) => invitation.invitationType === 'circle' && invitation.circleId
	);
	for (const invitation of circleInvitations) {
		const members = invitation.circleId
			? (circleMembersByCircle.get(invitation.circleId) ?? [])
			: [];
		if (members.some((member) => member.userId === userId)) return true;
	}

	if (meeting.circleId) {
		const members = circleMembersByCircle.get(meeting.circleId) ?? [];
		if (members.some((member) => member.userId === userId)) return true;
	}

	return false;
}

export async function getInvitedUsersForMeeting(
	ctx: QueryCtx,
	meetingId: Id<'meetings'>,
	circleId: Id<'circles'> | undefined,
	invitationsByMeeting: Map<
		Id<'meetings'>,
		Array<{ invitationType: 'user' | 'circle'; userId?: Id<'users'>; circleId?: Id<'circles'> }>
	>,
	circleMembersByCircle: Map<Id<'circles'>, Array<{ userId: Id<'users'> }>>
) {
	const invitedUserIds = new Set<string>();
	const invitations = invitationsByMeeting.get(meetingId) ?? [];

	for (const invitation of invitations) {
		if (invitation.invitationType === 'user' && invitation.userId) {
			invitedUserIds.add(invitation.userId);
		}
	}

	for (const invitation of invitations) {
		if (invitation.invitationType === 'circle' && invitation.circleId) {
			const members = circleMembersByCircle.get(invitation.circleId) ?? [];
			for (const member of members) {
				invitedUserIds.add(member.userId);
			}
		}
	}

	if (circleId) {
		const members = circleMembersByCircle.get(circleId) ?? [];
		for (const member of members) {
			invitedUserIds.add(member.userId);
		}
	}

	const userIdsArray = Array.from(invitedUserIds).slice(0, 10);
	const users = await Promise.all(
		userIdsArray.map(async (userId) => {
			const person = await ctx.db.get(userId as Id<'users'>);
			return {
				userId,
				name: person?.name ?? person?.email ?? 'Unknown person'
			};
		})
	);

	return users;
}

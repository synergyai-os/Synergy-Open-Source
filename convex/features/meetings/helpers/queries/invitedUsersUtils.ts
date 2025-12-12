import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';

export function getInvitationsByMeetingMap(
	invitations: Array<{
		meetingId: Id<'meetings'>;
		invitationType: 'user' | 'circle';
		personId?: Id<'people'>;
		circleId?: Id<'circles'>;
		status?: 'pending' | 'accepted' | 'declined';
	}>
) {
	const map = new Map<
		Id<'meetings'>,
		Array<{ invitationType: 'user' | 'circle'; personId?: Id<'people'>; circleId?: Id<'circles'> }>
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

export async function isPersonInvitedToMeeting(
	ctx: QueryCtx,
	meeting: { _id: Id<'meetings'>; circleId?: Id<'circles'>; visibility: 'public' | 'private' },
	personId: Id<'people'>,
	invitationsByMeeting: Map<
		Id<'meetings'>,
		Array<{ invitationType: 'user' | 'circle'; personId?: Id<'people'>; circleId?: Id<'circles'> }>
	>,
	circleMembersByCircle: Map<Id<'circles'>, Array<{ personId: Id<'people'> }>>
) {
	if (meeting.visibility === 'public') return true;

	const invitations = invitationsByMeeting.get(meeting._id) ?? [];
	const directInvitation = invitations.find(
		(invitation) => invitation.invitationType === 'user' && invitation.personId === personId
	);
	if (directInvitation) return true;

	const circleInvitations = invitations.filter(
		(invitation) => invitation.invitationType === 'circle' && invitation.circleId
	);
	for (const invitation of circleInvitations) {
		const members = invitation.circleId
			? (circleMembersByCircle.get(invitation.circleId) ?? [])
			: [];
		if (members.some((member) => member.personId === personId)) return true;
	}

	if (meeting.circleId) {
		const members = circleMembersByCircle.get(meeting.circleId) ?? [];
		if (members.some((member) => member.personId === personId)) return true;
	}

	return false;
}

export async function getInvitedUsersForMeeting(
	ctx: QueryCtx,
	meetingId: Id<'meetings'>,
	circleId: Id<'circles'> | undefined,
	invitationsByMeeting: Map<
		Id<'meetings'>,
		Array<{ invitationType: 'user' | 'circle'; personId?: Id<'people'>; circleId?: Id<'circles'> }>
	>,
	circleMembersByCircle: Map<Id<'circles'>, Array<{ personId: Id<'people'> }>>
) {
	const invitedPersonIds = new Set<string>();
	const invitations = invitationsByMeeting.get(meetingId) ?? [];

	for (const invitation of invitations) {
		if (invitation.invitationType === 'user' && invitation.personId) {
			invitedPersonIds.add(invitation.personId);
		}
	}

	for (const invitation of invitations) {
		if (invitation.invitationType === 'circle' && invitation.circleId) {
			const members = circleMembersByCircle.get(invitation.circleId) ?? [];
			for (const member of members) {
				invitedPersonIds.add(member.personId);
			}
		}
	}

	if (circleId) {
		const members = circleMembersByCircle.get(circleId) ?? [];
		for (const member of members) {
			invitedPersonIds.add(member.personId);
		}
	}

	const personIdsArray = Array.from(invitedPersonIds).slice(0, 10);
	const people = await Promise.all(
		personIdsArray.map(async (personId) => {
			const person = await ctx.db.get(personId as Id<'people'>);
			return {
				personId,
				name: person?.displayName ?? person?.email ?? 'Unknown person'
			};
		})
	);

	return people;
}

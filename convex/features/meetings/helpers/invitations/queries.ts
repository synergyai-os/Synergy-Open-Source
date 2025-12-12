import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { ErrorCodes } from '../../../../infrastructure/errors/codes';
import {
	ensureWorkspaceMembership,
	requireMeeting,
	requireWorkspacePersonFromSession
} from '../access';

type ListByMeetingArgs = { sessionId: string; meetingId: Id<'meetings'> };
type IsPersonInvitedArgs = { sessionId: string; meetingId: Id<'meetings'>; personId: Id<'people'> };

export const listInvitationsByMeetingArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings')
};

export async function listInvitationsByMeeting(ctx: QueryCtx, args: ListByMeetingArgs) {
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.MEETING_NOT_FOUND);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId);

	const invitations = await ctx.db
		.query('meetingInvitations')
		.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
		.collect();

	const filteredInvitations = invitations.filter((invitation) => invitation.status !== 'declined');

	return Promise.all(
		filteredInvitations.map(async (invitation) => {
			if (invitation.invitationType === 'user' && invitation.personId) {
				const person = await ctx.db.get(invitation.personId);
				return {
					...invitation,
					personName: person?.displayName ?? person?.email ?? 'Unknown person'
				};
			}

			if (invitation.invitationType === 'circle' && invitation.circleId) {
				const circle = await ctx.db.get(invitation.circleId);
				return {
					...invitation,
					circleName: circle?.name ?? 'Unknown Circle'
				};
			}

			return invitation;
		})
	);
}

export const isPersonInvitedArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings'),
	personId: v.id('people')
};

export async function checkPersonInvited(
	ctx: QueryCtx,
	args: IsPersonInvitedArgs
): Promise<boolean> {
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.MEETING_NOT_FOUND);
	const { personId: currentPersonId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, currentPersonId);

	if (meeting.visibility === 'public') return true;

	const invitations = await ctx.db
		.query('meetingInvitations')
		.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
		.collect();

	const directInvitation = invitations.find(
		(invitation) =>
			invitation.invitationType === 'user' &&
			invitation.personId === args.personId &&
			invitation.status !== 'declined'
	);
	if (directInvitation) return true;

	const circleInvitations = invitations.filter(
		(invitation) => invitation.invitationType === 'circle' && invitation.circleId
	);

	for (const circleInvitation of circleInvitations) {
		if (!circleInvitation.circleId) continue;
		const membership = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle_person', (q) =>
				q.eq('circleId', circleInvitation.circleId).eq('personId', args.personId)
			)
			.first();
		if (membership) return true;
	}

	if (meeting.circleId) {
		const circleMembership = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle_person', (q) =>
				q.eq('circleId', meeting.circleId).eq('personId', args.personId)
			)
			.first();
		if (circleMembership) return true;
	}

	return false;
}

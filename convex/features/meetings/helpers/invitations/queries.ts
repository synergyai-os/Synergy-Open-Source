import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { ErrorCodes } from '../../../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../../../infrastructure/sessionValidation';
import { ensureWorkspaceMembership, requireMeeting } from '../access';

type ListByMeetingArgs = { sessionId: string; meetingId: Id<'meetings'> };
type IsUserInvitedArgs = { sessionId: string; meetingId: Id<'meetings'>; userId: Id<'users'> };

export const listInvitationsByMeetingArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings')
};

export async function listInvitationsByMeeting(ctx: QueryCtx, args: ListByMeetingArgs) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.MEETING_NOT_FOUND);
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

	const invitations = await ctx.db
		.query('meetingInvitations')
		.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
		.collect();

	const filteredInvitations = invitations.filter((invitation) => invitation.status !== 'declined');

	return Promise.all(
		filteredInvitations.map(async (invitation) => {
			if (invitation.invitationType === 'user' && invitation.userId) {
				const person = await ctx.db.get(invitation.userId);
				return {
					...invitation,
					userName: person?.name ?? person?.email ?? 'Unknown person'
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

export const isUserInvitedArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings'),
	userId: v.id('users')
};

export async function checkUserInvited(ctx: QueryCtx, args: IsUserInvitedArgs): Promise<boolean> {
	const { userId: currentUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.MEETING_NOT_FOUND);
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, currentUserId);

	if (meeting.visibility === 'public') return true;

	const invitations = await ctx.db
		.query('meetingInvitations')
		.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
		.collect();

	const directInvitation = invitations.find(
		(invitation) =>
			invitation.invitationType === 'user' &&
			invitation.userId === args.userId &&
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
			.withIndex('by_circle_user', (q) =>
				q.eq('circleId', circleInvitation.circleId).eq('userId', args.userId)
			)
			.first();
		if (membership) return true;
	}

	if (meeting.circleId) {
		const circleMembership = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle_user', (q) =>
				q.eq('circleId', meeting.circleId).eq('userId', args.userId)
			)
			.first();
		if (circleMembership) return true;
	}

	return false;
}

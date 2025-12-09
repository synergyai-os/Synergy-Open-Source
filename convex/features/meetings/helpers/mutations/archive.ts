import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { MutationCtx } from '../../../../_generated/server';
import { createError, ErrorCodes } from '../../../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../../../infrastructure/sessionValidation';
import { ensureWorkspaceMembership, requireMeeting } from '../access';

type ArchiveArgs = { sessionId: string; meetingId: Id<'meetings'> };

export const archiveMeetingArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings')
};

export async function archiveMeetingMutation(
	ctx: MutationCtx,
	args: ArchiveArgs
): Promise<{ success: true }> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.GENERIC_ERROR);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	if (meeting.deletedAt) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Meeting already deleted');
	}

	const now = Date.now();

	await ctx.db
		.query('meetingAgendaItems')
		.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
		.collect();

	await ctx.db.patch(args.meetingId, {
		deletedAt: now,
		updatedAt: now
	});

	return { success: true };
}

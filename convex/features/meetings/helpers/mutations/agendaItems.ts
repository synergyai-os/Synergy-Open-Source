import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { MutationCtx } from '../../../../_generated/server';
import { ErrorCodes } from '../../../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../../../infrastructure/sessionValidation';
import { ensureWorkspaceMembership, requireMeeting } from '../access';

type CreateAgendaItemArgs = { sessionId: string; meetingId: Id<'meetings'>; title: string };

export const createAgendaItemArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings'),
	title: v.string()
};

export async function createAgendaItemMutation(
	ctx: MutationCtx,
	args: CreateAgendaItemArgs
): Promise<{ itemId: Id<'meetingAgendaItems'> }> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.GENERIC_ERROR);

	await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	const existingItems = await ctx.db
		.query('meetingAgendaItems')
		.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
		.collect();

	const maxOrder = existingItems.length > 0 ? Math.max(...existingItems.map((i) => i.order)) : 0;

	const itemId = await ctx.db.insert('meetingAgendaItems', {
		meetingId: args.meetingId,
		title: args.title,
		order: maxOrder + 1,
		status: 'todo',
		createdBy: userId,
		createdAt: Date.now()
	});

	return { itemId };
}

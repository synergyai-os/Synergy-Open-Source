import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { ErrorCodes } from '../../../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../../../infrastructure/sessionValidation';
import { ensureWorkspaceMembership, requireMeeting } from '../access';

type GetAgendaItemsArgs = { sessionId: string; meetingId: Id<'meetings'> };

export const getAgendaItemsArgs = {
	sessionId: v.string(),
	meetingId: v.id('meetings')
};

export async function getAgendaItemsQuery(ctx: QueryCtx, args: GetAgendaItemsArgs) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const meeting = await requireMeeting(ctx, args.meetingId, ErrorCodes.GENERIC_ERROR);
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId, {
		errorCode: ErrorCodes.GENERIC_ERROR,
		message: 'Workspace membership required'
	});

	const items = await ctx.db
		.query('meetingAgendaItems')
		.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
		.collect();

	const itemsWithCreators = await Promise.all(
		items.map(async (item) => {
			const creator = await ctx.db.get(item.createdBy);
			return {
				...item,
				creatorName: creator?.name ?? creator?.email ?? 'Unknown person'
			};
		})
	);

	return itemsWithCreators.sort((a, b) => a.order - b.order);
}

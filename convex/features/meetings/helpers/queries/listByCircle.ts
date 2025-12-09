import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { validateSessionAndGetUserId } from '../../../../infrastructure/sessionValidation';
import { ensureCircleMembership } from './shared';

type ListByCircleArgs = { sessionId: string; circleId: Id<'circles'> };

export const listMeetingsByCircleArgs = {
	sessionId: v.string(),
	circleId: v.id('circles')
};

export async function listMeetingsByCircle(ctx: QueryCtx, args: ListByCircleArgs) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	await ensureCircleMembership(ctx, args.circleId, userId);

	const meetings = await ctx.db
		.query('meetings')
		.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
		.collect();

	return meetings.filter((meeting) => !meeting.deletedAt);
}

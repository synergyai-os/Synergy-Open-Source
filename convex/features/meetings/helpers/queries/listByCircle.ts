import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { ErrorCodes } from '../../../../infrastructure/errors/codes';
import { ensureCircleMembership } from './shared';
import { requireCircle, requireWorkspacePersonFromSession } from '../access';

type ListByCircleArgs = { sessionId: string; circleId: Id<'circles'> };

export const listMeetingsByCircleArgs = {
	sessionId: v.string(),
	circleId: v.id('circles')
};

export async function listMeetingsByCircle(ctx: QueryCtx, args: ListByCircleArgs) {
	const circle = await requireCircle(ctx, args.circleId, ErrorCodes.CIRCLE_NOT_FOUND);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);
	await ensureCircleMembership(ctx, args.circleId, personId);

	const meetings = await ctx.db
		.query('meetings')
		.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
		.collect();

	return meetings.filter((meeting) => !meeting.deletedAt);
}

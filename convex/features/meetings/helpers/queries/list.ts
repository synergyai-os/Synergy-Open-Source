import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { requireWorkspaceMember, fetchAttendeeCounts, fetchMeetingsByWorkspace } from './shared';

type ListArgs = { sessionId: string; workspaceId: Id<'workspaces'> };

export const getMeetingsListArgs = {
	sessionId: v.string(),
	workspaceId: v.id('workspaces')
};

export async function listMeetings(ctx: QueryCtx, args: ListArgs) {
	await requireWorkspaceMember(ctx, args);
	const meetings = await fetchMeetingsByWorkspace(ctx, args.workspaceId);
	if (!meetings.length) return [];

	const attendeeCounts = await fetchAttendeeCounts(
		ctx,
		meetings.map((meeting) => meeting._id)
	);

	return meetings.map((meeting) => ({
		...meeting,
		attendeeCount: attendeeCounts.get(meeting._id) ?? 0
	}));
}

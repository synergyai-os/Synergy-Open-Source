import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { requireWorkspaceMember } from './shared';

type ListByTemplateArgs = {
	sessionId: string;
	workspaceId: Id<'workspaces'>;
	templateId: Id<'meetingTemplates'>;
	startDate?: number;
	endDate?: number;
};

export const listMeetingsByTemplateArgs = {
	sessionId: v.string(),
	workspaceId: v.id('workspaces'),
	templateId: v.id('meetingTemplates'),
	startDate: v.optional(v.number()),
	endDate: v.optional(v.number())
};

export async function listMeetingsByTemplate(ctx: QueryCtx, args: ListByTemplateArgs) {
	await requireWorkspaceMember(ctx, {
		sessionId: args.sessionId,
		workspaceId: args.workspaceId
	});

	const meetings =
		args.startDate || args.endDate
			? await listByDateRange(ctx, args)
			: await listByTemplate(ctx, args);
	return meetings.filter((meeting) => !meeting.deletedAt);
}

async function listByDateRange(ctx: QueryCtx, args: ListByTemplateArgs) {
	return ctx.db
		.query('meetings')
		.withIndex('by_start_time', (q) => {
			let query = q.eq('workspaceId', args.workspaceId);
			if (args.startDate) query = query.gte('startTime', args.startDate);
			if (args.endDate) query = query.lte('startTime', args.endDate);
			return query;
		})
		.collect()
		.then((items) => items.filter((meeting) => meeting.templateId === args.templateId));
}

async function listByTemplate(ctx: QueryCtx, args: ListByTemplateArgs) {
	return ctx.db
		.query('meetings')
		.withIndex('by_template', (q) =>
			q.eq('workspaceId', args.workspaceId).eq('templateId', args.templateId)
		)
		.collect();
}

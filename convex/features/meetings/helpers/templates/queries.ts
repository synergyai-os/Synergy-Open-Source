import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import { validateSessionAndGetUserId } from '../../../../infrastructure/sessionValidation';
import { ensureWorkspaceMembership, requireTemplate } from '../access';

type ListTemplatesArgs = { sessionId: string; workspaceId: Id<'workspaces'> };
type GetTemplateArgs = { sessionId: string; templateId: Id<'meetingTemplates'> };

export const listTemplatesArgs = {
	sessionId: v.string(),
	workspaceId: v.id('workspaces')
};

export async function listTemplates(ctx: QueryCtx, args: ListTemplatesArgs): Promise<unknown[]> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

	const templates = await ctx.db
		.query('meetingTemplates')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
		.collect();

	return appendStepCounts(ctx, templates);
}

export const getTemplateArgs = {
	sessionId: v.string(),
	templateId: v.id('meetingTemplates')
};

export async function getTemplate(ctx: QueryCtx, args: GetTemplateArgs) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const template = await requireTemplate(ctx, args.templateId);
	await ensureWorkspaceMembership(ctx, template.workspaceId, userId);
	return template;
}

export const getTemplateStepsArgs = {
	sessionId: v.string(),
	templateId: v.id('meetingTemplates')
};

export async function getTemplateSteps(ctx: QueryCtx, args: GetTemplateArgs): Promise<unknown[]> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const template = await requireTemplate(ctx, args.templateId);
	await ensureWorkspaceMembership(ctx, template.workspaceId, userId);

	const steps = await ctx.db
		.query('meetingTemplateSteps')
		.withIndex('by_template', (q) => q.eq('templateId', args.templateId))
		.collect();

	return steps.sort((a, b) => a.orderIndex - b.orderIndex);
}

async function appendStepCounts(
	ctx: QueryCtx,
	templates: Array<{ _id: Id<'meetingTemplates'> }>
): Promise<unknown[]> {
	return Promise.all(
		templates.map(async (template) => {
			const steps = await ctx.db
				.query('meetingTemplateSteps')
				.withIndex('by_template', (q) => q.eq('templateId', template._id))
				.collect();

			return { ...template, stepCount: steps.length };
		})
	);
}

import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { QueryCtx } from '../../../../_generated/server';
import {
	ensureWorkspaceMembership,
	requireTemplate,
	requireWorkspacePersonFromSession
} from '../access';

type ListTemplatesArgs = { sessionId: string; workspaceId: Id<'workspaces'> };
type GetTemplateArgs = { sessionId: string; templateId: Id<'meetingTemplates'> };

export const listTemplatesArgs = {
	sessionId: v.string(),
	workspaceId: v.id('workspaces')
};

export async function listTemplates(ctx: QueryCtx, args: ListTemplatesArgs): Promise<unknown[]> {
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		args.workspaceId
	);
	await ensureWorkspaceMembership(ctx, args.workspaceId, personId);

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
	const template = await requireTemplate(ctx, args.templateId);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		template.workspaceId
	);
	await ensureWorkspaceMembership(ctx, template.workspaceId, personId);
	return template;
}

export const getTemplateStepsArgs = {
	sessionId: v.string(),
	templateId: v.id('meetingTemplates')
};

export async function getTemplateSteps(ctx: QueryCtx, args: GetTemplateArgs): Promise<unknown[]> {
	const template = await requireTemplate(ctx, args.templateId);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		template.workspaceId
	);
	await ensureWorkspaceMembership(ctx, template.workspaceId, personId);

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

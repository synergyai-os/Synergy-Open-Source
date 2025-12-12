import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { MutationCtx } from '../../../../_generated/server';
import {
	ensureWorkspaceMembership,
	requireTemplate,
	requireWorkspacePersonFromSession
} from '../access';

type CreateTemplateArgs = {
	sessionId: string;
	workspaceId: Id<'workspaces'>;
	name: string;
	description?: string;
};

type UpdateTemplateArgs = {
	sessionId: string;
	templateId: Id<'meetingTemplates'>;
	name?: string;
	description?: string;
};

type ArchiveTemplateArgs = { sessionId: string; templateId: Id<'meetingTemplates'> };

export const createTemplateArgs = {
	sessionId: v.string(),
	workspaceId: v.id('workspaces'),
	name: v.string(),
	description: v.optional(v.string())
};

export async function createTemplate(
	ctx: MutationCtx,
	args: CreateTemplateArgs
): Promise<{ templateId: Id<'meetingTemplates'> }> {
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		args.workspaceId
	);
	await ensureWorkspaceMembership(ctx, args.workspaceId, personId);

	const templateId = await ctx.db.insert('meetingTemplates', {
		workspaceId: args.workspaceId,
		name: args.name,
		description: args.description,
		createdAt: Date.now(),
		createdByPersonId: personId
	});

	return { templateId };
}

export const updateTemplateArgs = {
	sessionId: v.string(),
	templateId: v.id('meetingTemplates'),
	name: v.optional(v.string()),
	description: v.optional(v.string())
};

export async function updateTemplate(
	ctx: MutationCtx,
	args: UpdateTemplateArgs
): Promise<{ success: true }> {
	const template = await requireTemplate(ctx, args.templateId);
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		template.workspaceId
	);
	await ensureWorkspaceMembership(ctx, template.workspaceId, personId);

	const updates: Partial<{ name: string; description?: string }> = {};
	if (args.name !== undefined) updates.name = args.name;
	if (args.description !== undefined) updates.description = args.description;

	await ctx.db.patch(args.templateId, updates);
	return { success: true };
}

export const archiveTemplateArgs = {
	sessionId: v.string(),
	templateId: v.id('meetingTemplates')
};

export async function archiveTemplateMutation(
	ctx: MutationCtx,
	args: ArchiveTemplateArgs
): Promise<{ success: true }> {
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

	for (const step of steps) {
		await ctx.db.delete(step._id);
	}

	await ctx.db.delete(args.templateId);
	return { success: true };
}

import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { MutationCtx } from '../../../../_generated/server';
import { createError, ErrorCodes } from '../../../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../../../infrastructure/sessionValidation';
import { ensureWorkspaceMembership, requireTemplate } from '../access';

type AddStepArgs = {
	sessionId: string;
	templateId: Id<'meetingTemplates'>;
	stepType: 'check-in' | 'agenda' | 'metrics' | 'projects' | 'closing' | 'custom';
	title: string;
	description?: string;
	timebox?: number;
	orderIndex: number;
};

type RemoveStepArgs = { sessionId: string; stepId: Id<'meetingTemplateSteps'> };
type ReorderStepsArgs = {
	sessionId: string;
	templateId: Id<'meetingTemplates'>;
	stepIds: Id<'meetingTemplateSteps'>[];
};

export const addTemplateStepArgs = {
	sessionId: v.string(),
	templateId: v.id('meetingTemplates'),
	stepType: v.union(
		v.literal('check-in'),
		v.literal('agenda'),
		v.literal('metrics'),
		v.literal('projects'),
		v.literal('closing'),
		v.literal('custom')
	),
	title: v.string(),
	description: v.optional(v.string()),
	timebox: v.optional(v.number()),
	orderIndex: v.number()
};

export async function addTemplateStep(
	ctx: MutationCtx,
	args: AddStepArgs
): Promise<{ stepId: Id<'meetingTemplateSteps'> }> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const template = await requireTemplate(ctx, args.templateId);
	await ensureWorkspaceMembership(ctx, template.workspaceId, userId);

	const stepId = await ctx.db.insert('meetingTemplateSteps', {
		templateId: args.templateId,
		stepType: args.stepType,
		title: args.title,
		description: args.description,
		orderIndex: args.orderIndex,
		timebox: args.timebox,
		createdAt: Date.now()
	});

	return { stepId };
}

export const removeTemplateStepArgs = {
	sessionId: v.string(),
	stepId: v.id('meetingTemplateSteps')
};

export async function removeTemplateStep(
	ctx: MutationCtx,
	args: RemoveStepArgs
): Promise<{ success: true }> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const step = await ctx.db.get(args.stepId);
	if (!step) throw createError(ErrorCodes.TEMPLATE_STEP_NOT_FOUND, 'Step not found');

	const template = await requireTemplate(ctx, step.templateId);
	await ensureWorkspaceMembership(ctx, template.workspaceId, userId);

	await ctx.db.delete(args.stepId);
	return { success: true };
}

export const reorderTemplateStepsArgs = {
	sessionId: v.string(),
	templateId: v.id('meetingTemplates'),
	stepIds: v.array(v.id('meetingTemplateSteps'))
};

export async function reorderTemplateSteps(
	ctx: MutationCtx,
	args: ReorderStepsArgs
): Promise<{ success: true }> {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const template = await requireTemplate(ctx, args.templateId);
	await ensureWorkspaceMembership(ctx, template.workspaceId, userId);

	for (let i = 0; i < args.stepIds.length; i++) {
		const stepId = args.stepIds[i];
		const step = await ctx.db.get(stepId);
		if (!step || step.templateId !== args.templateId) {
			throw createError(
				ErrorCodes.TEMPLATE_STEP_NOT_FOUND,
				`Step ${stepId} not found or does not belong to template`
			);
		}
		await ctx.db.patch(stepId, { orderIndex: i });
	}

	return { success: true };
}

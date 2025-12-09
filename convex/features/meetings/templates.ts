import type { Id } from '../../_generated/dataModel';
import { internalMutation, mutation, query } from '../../_generated/server';
import {
	addTemplateStepArgs,
	archiveTemplateArgs,
	createTemplateArgs,
	getTemplateArgs,
	getTemplateStepsArgs,
	listTemplatesArgs,
	removeTemplateStepArgs,
	reorderTemplateStepsArgs,
	seedTemplatesArgs,
	seedTemplatesInternalArgs,
	updateTemplateArgs
} from './helpers/templates';
import {
	addTemplateStep,
	archiveTemplateMutation,
	createTemplate,
	getTemplate,
	getTemplateSteps,
	listTemplates,
	removeTemplateStep,
	reorderTemplateSteps,
	seedDefaultTemplates as seedDefaultTemplatesHelper,
	seedDefaultTemplatesInternal as seedDefaultTemplatesInternalHelper,
	updateTemplate
} from './helpers/templates';

export const list = query({
	args: listTemplatesArgs,
	handler: (ctx, args): Promise<unknown[]> => listTemplates(ctx, args)
});

export const get = query({
	args: getTemplateArgs,
	handler: (ctx, args) => getTemplate(ctx, args)
});

export const getSteps = query({
	args: getTemplateStepsArgs,
	handler: (ctx, args): Promise<unknown[]> => getTemplateSteps(ctx, args)
});

export const create = mutation({
	args: createTemplateArgs,
	handler: (ctx, args): Promise<{ templateId: Id<'meetingTemplates'> }> => createTemplate(ctx, args)
});

export const update = mutation({
	args: updateTemplateArgs,
	handler: (ctx, args) => updateTemplate(ctx, args)
});

export const archiveTemplate = mutation({
	args: archiveTemplateArgs,
	handler: (ctx, args) => archiveTemplateMutation(ctx, args)
});

export const addStep = mutation({
	args: addTemplateStepArgs,
	handler: (ctx, args) => addTemplateStep(ctx, args)
});

export const removeStep = mutation({
	args: removeTemplateStepArgs,
	handler: (ctx, args) => removeTemplateStep(ctx, args)
});

export const reorderSteps = mutation({
	args: reorderTemplateStepsArgs,
	handler: (ctx, args) => reorderTemplateSteps(ctx, args)
});

export const seedDefaultTemplates = mutation({
	args: seedTemplatesArgs,
	handler: (ctx, args) => seedDefaultTemplatesHelper(ctx, args)
});

export const seedDefaultTemplatesInternal = internalMutation({
	args: seedTemplatesInternalArgs,
	handler: (ctx, args) => seedDefaultTemplatesInternalHelper(ctx, args)
});

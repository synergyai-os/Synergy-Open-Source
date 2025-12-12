import { v } from 'convex/values';
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
	args: {
		sessionId: v.string(),
		...listTemplatesArgs
	},
	handler: (ctx, args): Promise<unknown[]> => listTemplates(ctx, args)
});

export const get = query({
	args: {
		sessionId: v.string(),
		...getTemplateArgs
	},
	handler: (ctx, args) => getTemplate(ctx, args)
});

export const getSteps = query({
	args: {
		sessionId: v.string(),
		...getTemplateStepsArgs
	},
	handler: (ctx, args): Promise<unknown[]> => getTemplateSteps(ctx, args)
});

export const create = mutation({
	args: {
		sessionId: v.string(),
		...createTemplateArgs
	},
	handler: (ctx, args): Promise<{ templateId: Id<'meetingTemplates'> }> => createTemplate(ctx, args)
});

export const update = mutation({
	args: {
		sessionId: v.string(),
		...updateTemplateArgs
	},
	handler: (ctx, args) => updateTemplate(ctx, args)
});

export const archiveTemplate = mutation({
	args: {
		sessionId: v.string(),
		...archiveTemplateArgs
	},
	handler: (ctx, args) => archiveTemplateMutation(ctx, args)
});

export const addStep = mutation({
	args: {
		sessionId: v.string(),
		...addTemplateStepArgs
	},
	handler: (ctx, args) => addTemplateStep(ctx, args)
});

export const removeStep = mutation({
	args: {
		sessionId: v.string(),
		...removeTemplateStepArgs
	},
	handler: (ctx, args) => removeTemplateStep(ctx, args)
});

export const reorderSteps = mutation({
	args: {
		sessionId: v.string(),
		...reorderTemplateStepsArgs
	},
	handler: (ctx, args) => reorderTemplateSteps(ctx, args)
});

export const seedDefaultTemplates = mutation({
	args: {
		sessionId: v.string(),
		...seedTemplatesArgs
	},
	handler: (ctx, args) => seedDefaultTemplatesHelper(ctx, args)
});

export const seedDefaultTemplatesInternal = internalMutation({
	args: seedTemplatesInternalArgs,
	handler: (ctx, args) => seedDefaultTemplatesInternalHelper(ctx, args)
});

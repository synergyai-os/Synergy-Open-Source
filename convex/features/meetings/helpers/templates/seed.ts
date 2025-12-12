import { v } from 'convex/values';
import type { Id } from '../../../../_generated/dataModel';
import type { MutationCtx } from '../../../../_generated/server';
import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from '../access';

type SeedArgs = { sessionId: string; workspaceId: Id<'workspaces'> };
type SeedInternalArgs = { workspaceId: Id<'workspaces'>; personId: Id<'people'> };

export const seedTemplatesArgs = {
	sessionId: v.string(),
	workspaceId: v.id('workspaces')
};

export async function seedDefaultTemplates(
	ctx: MutationCtx,
	args: SeedArgs
): Promise<{ governanceId: Id<'meetingTemplates'>; tacticalId: Id<'meetingTemplates'> }> {
	const { personId } = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		args.workspaceId
	);
	await ensureWorkspaceMembership(ctx, args.workspaceId, personId);
	return seedTemplates(ctx, { workspaceId: args.workspaceId, personId });
}

export const seedTemplatesInternalArgs = {
	workspaceId: v.id('workspaces'),
	personId: v.id('people')
};

export async function seedDefaultTemplatesInternal(
	ctx: MutationCtx,
	args: SeedInternalArgs
): Promise<{ governanceId: Id<'meetingTemplates'>; tacticalId: Id<'meetingTemplates'> }> {
	return seedTemplates(ctx, args);
}

async function seedTemplates(
	ctx: MutationCtx,
	args: { workspaceId: Id<'workspaces'>; personId: Id<'people'> }
): Promise<{ governanceId: Id<'meetingTemplates'>; tacticalId: Id<'meetingTemplates'> }> {
	const now = Date.now();

	const governanceId = await ctx.db.insert('meetingTemplates', {
		workspaceId: args.workspaceId,
		name: 'Governance',
		description: 'Holacracy governance meeting for role and policy updates',
		createdAt: now,
		createdByPersonId: args.personId
	});

	await ctx.db.insert('meetingTemplateSteps', {
		templateId: governanceId,
		stepType: 'check-in',
		title: 'Check-in Round',
		description: 'Opening round to center the circle',
		orderIndex: 0,
		timebox: 5,
		createdAt: now
	});

	await ctx.db.insert('meetingTemplateSteps', {
		templateId: governanceId,
		stepType: 'agenda',
		title: 'Agenda Building',
		description: 'Build agenda with tensions to process',
		orderIndex: 1,
		createdAt: now
	});

	await ctx.db.insert('meetingTemplateSteps', {
		templateId: governanceId,
		stepType: 'closing',
		title: 'Closing Round',
		description: 'Reflections and closing',
		orderIndex: 2,
		timebox: 5,
		createdAt: now
	});

	const tacticalId = await ctx.db.insert('meetingTemplates', {
		workspaceId: args.workspaceId,
		name: 'Weekly Tactical',
		description: 'Weekly tactical meeting for operational updates and coordination',
		createdAt: now,
		createdByPersonId: args.personId
	});

	await ctx.db.insert('meetingTemplateSteps', {
		templateId: tacticalId,
		stepType: 'check-in',
		title: 'Check-in Round',
		description: 'Opening round to center the circle',
		orderIndex: 0,
		timebox: 5,
		createdAt: now
	});

	await ctx.db.insert('meetingTemplateSteps', {
		templateId: tacticalId,
		stepType: 'custom',
		title: 'Checklists',
		description: 'Review recurring checklist items',
		orderIndex: 1,
		timebox: 10,
		createdAt: now
	});

	await ctx.db.insert('meetingTemplateSteps', {
		templateId: tacticalId,
		stepType: 'metrics',
		title: 'Metrics Review',
		description: 'Review key metrics and trends',
		orderIndex: 2,
		timebox: 10,
		createdAt: now
	});

	await ctx.db.insert('meetingTemplateSteps', {
		templateId: tacticalId,
		stepType: 'projects',
		title: 'Project Updates',
		description: 'Share updates on active projects',
		orderIndex: 3,
		timebox: 15,
		createdAt: now
	});

	await ctx.db.insert('meetingTemplateSteps', {
		templateId: tacticalId,
		stepType: 'agenda',
		title: 'Agenda Items',
		description: 'Process open agenda items and tensions',
		orderIndex: 4,
		createdAt: now
	});

	await ctx.db.insert('meetingTemplateSteps', {
		templateId: tacticalId,
		stepType: 'closing',
		title: 'Closing Round',
		description: 'Reflections and closing',
		orderIndex: 5,
		timebox: 5,
		createdAt: now
	});

	return { governanceId, tacticalId };
}

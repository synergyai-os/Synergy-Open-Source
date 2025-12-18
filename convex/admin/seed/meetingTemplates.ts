/**
 * Meeting Templates Seeding
 *
 * Creates default meeting templates for a workspace:
 * - Governance template (3 steps: check-in, agenda, closing)
 * - Weekly Tactical template (6 steps: check-in, checklists, metrics, projects, agenda, closing)
 *
 * These templates are generic and work for any circle type.
 * Seeded when workspace setup is complete (after root circle is created with type).
 */

import type { MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';

/**
 * Seed default meeting templates for a workspace
 *
 * Creates two templates:
 * - Governance: For role and policy updates
 * - Weekly Tactical: For operational updates and coordination
 *
 * Idempotent - checks for existing templates before creating.
 *
 * @param ctx - Mutation context
 * @param workspaceId - Workspace to seed templates for
 * @param personId - Person creating the templates (workspace creator)
 * @returns Template IDs created
 */
export async function seedMeetingTemplates(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	personId: Id<'people'>
): Promise<{ governanceId: Id<'meetingTemplates'>; tacticalId: Id<'meetingTemplates'> }> {
	const now = Date.now();

	// Check if templates already exist (idempotency)
	const existingTemplates = await ctx.db
		.query('meetingTemplates')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	const existingGovernance = existingTemplates.find((t) => t.name === 'Governance');
	const existingTactical = existingTemplates.find((t) => t.name === 'Weekly Tactical');

	// Create Governance template if it doesn't exist
	let governanceId: Id<'meetingTemplates'>;
	if (existingGovernance) {
		governanceId = existingGovernance._id;
	} else {
		governanceId = await ctx.db.insert('meetingTemplates', {
			workspaceId,
			name: 'Governance',
			description: 'Holacracy governance meeting for role and policy updates',
			createdAt: now,
			createdByPersonId: personId
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
	}

	// Create Weekly Tactical template if it doesn't exist
	let tacticalId: Id<'meetingTemplates'>;
	if (existingTactical) {
		tacticalId = existingTactical._id;
	} else {
		tacticalId = await ctx.db.insert('meetingTemplates', {
			workspaceId,
			name: 'Weekly Tactical',
			description: 'Weekly tactical meeting for operational updates and coordination',
			createdAt: now,
			createdByPersonId: personId
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
	}

	return { governanceId, tacticalId };
}

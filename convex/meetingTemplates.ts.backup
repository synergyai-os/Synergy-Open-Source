/**
 * Meeting Templates Module - Reusable meeting structures with predefined agenda steps
 *
 * Supports:
 * - Organization-level templates
 * - Ordered agenda steps (check-in, agenda, metrics, projects, closing, custom)
 * - Default templates (Governance, Weekly Tactical)
 */

import { v } from 'convex/values';
import {
	mutation,
	query,
	internalMutation,
	type QueryCtx,
	type MutationCtx
} from './_generated/server';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';

/**
 * Helper: Verify user has access to organization
 */
async function ensureOrganizationMembership(
	ctx: QueryCtx | MutationCtx,
	organizationId: Id<'organizations'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('organizationMembers')
		.withIndex('by_organization_user', (q) =>
			q.eq('organizationId', organizationId).eq('userId', userId)
		)
		.first();

	if (!membership) {
		throw new Error('User is not a member of this organization');
	}
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all templates for an organization
 */
export const list = query({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to this organization
		await ensureOrganizationMembership(ctx, args.organizationId, userId);

		// Get all templates
		const templates = await ctx.db
			.query('meetingTemplates')
			.withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
			.collect();

		// Get step counts for each template
		const results = await Promise.all(
			templates.map(async (template) => {
				const steps = await ctx.db
					.query('meetingTemplateSteps')
					.withIndex('by_template', (q) => q.eq('templateId', template._id))
					.collect();

				return {
					...template,
					stepCount: steps.length
				};
			})
		);

		return results;
	}
});

/**
 * Get a single template by ID
 */
export const get = query({
	args: {
		sessionId: v.string(),
		templateId: v.id('meetingTemplates')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const template = await ctx.db.get(args.templateId);

		if (!template) {
			throw new Error('Template not found');
		}

		// Verify user has access to the organization
		await ensureOrganizationMembership(ctx, template.organizationId, userId);

		return template;
	}
});

/**
 * Get ordered steps for a template
 */
export const getSteps = query({
	args: {
		sessionId: v.string(),
		templateId: v.id('meetingTemplates')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const template = await ctx.db.get(args.templateId);

		if (!template) {
			throw new Error('Template not found');
		}

		// Verify user has access to the organization
		await ensureOrganizationMembership(ctx, template.organizationId, userId);

		// Get steps ordered by orderIndex
		const steps = await ctx.db
			.query('meetingTemplateSteps')
			.withIndex('by_template', (q) => q.eq('templateId', args.templateId))
			.collect();

		// Sort by orderIndex
		return steps.sort((a, b) => a.orderIndex - b.orderIndex);
	}
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new meeting template
 */
export const create = mutation({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations'),
		name: v.string(),
		description: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, args.organizationId, userId);

		// Create template
		const templateId = await ctx.db.insert('meetingTemplates', {
			organizationId: args.organizationId,
			name: args.name,
			description: args.description,
			createdAt: Date.now(),
			createdBy: userId
		});

		return { templateId };
	}
});

/**
 * Update an existing template
 */
export const update = mutation({
	args: {
		sessionId: v.string(),
		templateId: v.id('meetingTemplates'),
		name: v.optional(v.string()),
		description: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const template = await ctx.db.get(args.templateId);

		if (!template) {
			throw new Error('Template not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, template.organizationId, userId);

		// Build update object
		const updates: Partial<{
			name: string;
			description: string | undefined;
		}> = {};

		if (args.name !== undefined) updates.name = args.name;
		if (args.description !== undefined) updates.description = args.description;

		await ctx.db.patch(args.templateId, updates);

		return { success: true };
	}
});

/**
 * Delete a template (cascades to steps)
 */
export const deleteTemplate = mutation({
	args: {
		sessionId: v.string(),
		templateId: v.id('meetingTemplates')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const template = await ctx.db.get(args.templateId);

		if (!template) {
			throw new Error('Template not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, template.organizationId, userId);

		// Delete all steps first
		const steps = await ctx.db
			.query('meetingTemplateSteps')
			.withIndex('by_template', (q) => q.eq('templateId', args.templateId))
			.collect();

		for (const step of steps) {
			await ctx.db.delete(step._id);
		}

		// Delete template
		await ctx.db.delete(args.templateId);

		return { success: true };
	}
});

/**
 * Add a step to a template
 */
export const addStep = mutation({
	args: {
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
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const template = await ctx.db.get(args.templateId);

		if (!template) {
			throw new Error('Template not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, template.organizationId, userId);

		// Create step
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
});

/**
 * Remove a step from a template
 */
export const removeStep = mutation({
	args: {
		sessionId: v.string(),
		stepId: v.id('meetingTemplateSteps')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const step = await ctx.db.get(args.stepId);

		if (!step) {
			throw new Error('Step not found');
		}

		// Get template to verify organization access
		const template = await ctx.db.get(step.templateId);

		if (!template) {
			throw new Error('Template not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, template.organizationId, userId);

		// Delete step
		await ctx.db.delete(args.stepId);

		return { success: true };
	}
});

/**
 * Reorder steps in a template
 */
export const reorderSteps = mutation({
	args: {
		sessionId: v.string(),
		templateId: v.id('meetingTemplates'),
		stepIds: v.array(v.id('meetingTemplateSteps'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const template = await ctx.db.get(args.templateId);

		if (!template) {
			throw new Error('Template not found');
		}

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, template.organizationId, userId);

		// Update orderIndex for each step
		for (let i = 0; i < args.stepIds.length; i++) {
			const stepId = args.stepIds[i];
			const step = await ctx.db.get(stepId);

			if (!step || step.templateId !== args.templateId) {
				throw new Error(`Step ${stepId} not found or does not belong to template`);
			}

			await ctx.db.patch(stepId, {
				orderIndex: i
			});
		}

		return { success: true };
	}
});

/**
 * Seed default templates (Governance, Weekly Tactical)
 */
export const seedDefaultTemplates = mutation({
	args: {
		sessionId: v.string(),
		organizationId: v.id('organizations')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Verify user has access to organization
		await ensureOrganizationMembership(ctx, args.organizationId, userId);

		const now = Date.now();

		// 1. Governance Template
		const governanceId = await ctx.db.insert('meetingTemplates', {
			organizationId: args.organizationId,
			name: 'Governance',
			description: 'Holacracy governance meeting for role and policy updates',
			createdAt: now,
			createdBy: userId
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

		// 2. Weekly Tactical Template
		const tacticalId = await ctx.db.insert('meetingTemplates', {
			organizationId: args.organizationId,
			name: 'Weekly Tactical',
			description: 'Weekly tactical meeting for operational updates and coordination',
			createdAt: now,
			createdBy: userId
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

		return {
			governanceId,
			tacticalId
		};
	}
});

/**
 * Internal mutation: Seed default templates for new organization
 * Called by scheduler from organizations.create mutation
 */
export const seedDefaultTemplatesInternal = internalMutation({
	args: {
		organizationId: v.id('organizations'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// 1. Governance Template
		const governanceId = await ctx.db.insert('meetingTemplates', {
			organizationId: args.organizationId,
			name: 'Governance',
			description: 'Holacracy governance meeting for role and policy updates',
			createdAt: now,
			createdBy: args.userId
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

		// 2. Weekly Tactical Template
		const tacticalId = await ctx.db.insert('meetingTemplates', {
			organizationId: args.organizationId,
			name: 'Weekly Tactical',
			description: 'Weekly operational meeting for metrics, projects, and agenda',
			createdAt: now,
			createdBy: args.userId
		});

		await ctx.db.insert('meetingTemplateSteps', {
			templateId: tacticalId,
			stepType: 'check-in',
			title: 'Check-in Round',
			description: 'Opening round to center the team',
			orderIndex: 0,
			timebox: 5,
			createdAt: now
		});

		await ctx.db.insert('meetingTemplateSteps', {
			templateId: tacticalId,
			stepType: 'metrics',
			title: 'Metrics Review',
			description: 'Review key metrics and KPIs',
			orderIndex: 1,
			timebox: 10,
			createdAt: now
		});

		await ctx.db.insert('meetingTemplateSteps', {
			templateId: tacticalId,
			stepType: 'custom',
			title: 'Checklist Review',
			description: 'Review recurring action items',
			orderIndex: 2,
			timebox: 5,
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

		return {
			governanceId,
			tacticalId
		};
	}
});

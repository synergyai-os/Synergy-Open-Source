/**
 * Meeting Decisions Module - CRUD operations for decisions
 *
 * SYOS-220: Backend CRUD for decisions linked to agenda items
 *
 * Supports:
 * - Creating decisions with markdown description
 * - Updating decision title/description
 * - Deleting decisions
 * - Querying decisions by meeting, agenda item, or circle
 * - Permission checks (user must be org member)
 */

import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';
import type { QueryCtx, MutationCtx } from './_generated/server';

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
 * List all decisions (with optional filters)
 */
export const list = query({
	args: {
		sessionId: v.string(),
		meetingId: v.optional(v.id('meetings')),
		agendaItemId: v.optional(v.id('meetingAgendaItems')),
		circleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Build query based on filters
		let decisions;

		if (args.meetingId !== undefined) {
			decisions = await ctx.db
				.query('meetingDecisions')
				.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId!))
				.collect();
		} else if (args.agendaItemId !== undefined) {
			decisions = await ctx.db
				.query('meetingDecisions')
				.withIndex('by_agenda_item', (q) => q.eq('agendaItemId', args.agendaItemId!))
				.collect();
		} else if (args.circleId !== undefined) {
			decisions = await ctx.db
				.query('meetingDecisions')
				.withIndex('by_circle', (q) => q.eq('circleId', args.circleId!))
				.collect();
		} else {
			decisions = await ctx.db.query('meetingDecisions').collect();
		}

		// Verify user has access to at least one decision's organization
		if (decisions.length > 0) {
			const firstDecision = decisions[0];
			const meeting = await ctx.db.get(firstDecision.meetingId);

			if (!meeting) {
				throw new Error('Meeting not found');
			}

			// Meeting always has organizationId (required in schema)
			const meetingOrganizationId = (meeting as { organizationId: Id<'organizations'> })
				.organizationId;

			await ensureOrganizationMembership(ctx, meetingOrganizationId, userId);
		}

		return decisions;
	}
});

/**
 * List all decisions for a specific meeting
 */
export const listByMeeting = query({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get meeting to verify organization access
		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		const meetingOrganizationId = (meeting as { organizationId: Id<'organizations'> })
			.organizationId;
		await ensureOrganizationMembership(ctx, meetingOrganizationId, userId);

		// Get all decisions for meeting
		const decisions = await ctx.db
			.query('meetingDecisions')
			.withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
			.collect();

		return decisions;
	}
});

/**
 * List all decisions for a specific agenda item
 */
export const listByAgendaItem = query({
	args: {
		sessionId: v.string(),
		agendaItemId: v.id('meetingAgendaItems')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get agenda item to find meeting
		const agendaItem = await ctx.db.get(args.agendaItemId);

		if (!agendaItem) {
			throw new Error('Agenda item not found');
		}

		// Get meeting to verify organization access
		const meeting = await ctx.db.get(agendaItem.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		const meetingOrganizationId = (meeting as { organizationId: Id<'organizations'> })
			.organizationId;
		await ensureOrganizationMembership(ctx, meetingOrganizationId, userId);

		// Get all decisions for agenda item
		const decisions = await ctx.db
			.query('meetingDecisions')
			.withIndex('by_agenda_item', (q) => q.eq('agendaItemId', args.agendaItemId))
			.collect();

		return decisions;
	}
});

/**
 * Get a single decision by ID
 */
export const get = query({
	args: {
		sessionId: v.string(),
		decisionId: v.id('meetingDecisions')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get decision
		const decision = await ctx.db.get(args.decisionId);

		if (!decision) {
			throw new Error('Decision not found');
		}

		// Get meeting to verify organization access
		const meeting = await ctx.db.get(decision.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		const meetingOrganizationId = (meeting as { organizationId: Id<'organizations'> })
			.organizationId;
		await ensureOrganizationMembership(ctx, meetingOrganizationId, userId);

		return decision;
	}
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new decision
 */
export const create = mutation({
	args: {
		sessionId: v.string(),
		meetingId: v.id('meetings'),
		agendaItemId: v.id('meetingAgendaItems'),
		title: v.string(),
		description: v.string(), // Markdown
		circleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get meeting to verify organization access
		const meeting = await ctx.db.get(args.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		const meetingOrganizationId = (meeting as { organizationId: Id<'organizations'> })
			.organizationId;
		await ensureOrganizationMembership(ctx, meetingOrganizationId, userId);

		// Verify agenda item belongs to this meeting
		const agendaItem = await ctx.db.get(args.agendaItemId);

		if (!agendaItem) {
			throw new Error('Agenda item not found');
		}

		if (agendaItem.meetingId !== args.meetingId) {
			throw new Error('Agenda item does not belong to this meeting');
		}

		// Create decision
		const decisionId = await ctx.db.insert('meetingDecisions', {
			meetingId: args.meetingId,
			agendaItemId: args.agendaItemId,
			circleId: args.circleId,
			title: args.title,
			description: args.description,
			decidedAt: Date.now(),
			createdBy: userId
		});

		return { decisionId };
	}
});

/**
 * Update a decision (title/description)
 */
export const update = mutation({
	args: {
		sessionId: v.string(),
		decisionId: v.id('meetingDecisions'),
		title: v.optional(v.string()),
		description: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get decision
		const decision = await ctx.db.get(args.decisionId);

		if (!decision) {
			throw new Error('Decision not found');
		}

		// Get meeting to verify organization access
		const meeting = await ctx.db.get(decision.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		const meetingOrganizationId = (meeting as { organizationId: Id<'organizations'> })
			.organizationId;
		await ensureOrganizationMembership(ctx, meetingOrganizationId, userId);

		// Build update object (only update provided fields)
		const updates: {
			title?: string;
			description?: string;
			updatedAt: number;
		} = {
			updatedAt: Date.now()
		};

		if (args.title !== undefined) {
			updates.title = args.title;
		}

		if (args.description !== undefined) {
			updates.description = args.description;
		}

		// Update decision
		await ctx.db.patch(args.decisionId, updates);

		return { success: true };
	}
});

/**
 * Delete a decision
 */
export const remove = mutation({
	args: {
		sessionId: v.string(),
		decisionId: v.id('meetingDecisions')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get decision
		const decision = await ctx.db.get(args.decisionId);

		if (!decision) {
			throw new Error('Decision not found');
		}

		// Get meeting to verify organization access
		const meeting = await ctx.db.get(decision.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to organization
		const meetingOrganizationId = (meeting as { organizationId: Id<'organizations'> })
			.organizationId;
		await ensureOrganizationMembership(ctx, meetingOrganizationId, userId);

		// Delete decision
		await ctx.db.delete(args.decisionId);

		return { success: true };
	}
});

/**
 * Meeting Agenda Items Module - Notes and processing state
 *
 * SYOS-218: Add ability to take notes on agenda items and mark them as processed
 *
 * Supports:
 * - Updating notes (markdown) on agenda items
 * - Marking items as processed/unprocessed
 * - Permission checks (user must be org member)
 */

import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';

/**
 * Helper: Verify user has access to organization
 */
async function ensureOrganizationMembership(
	ctx: MutationCtx,
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
// MUTATIONS
// ============================================================================

/**
 * Update notes on an agenda item
 */
export const updateNotes = mutation({
	args: {
		sessionId: v.string(),
		agendaItemId: v.id('meetingAgendaItems'),
		notes: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get agenda item
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
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Update notes
		await ctx.db.patch(args.agendaItemId, {
			notes: args.notes
		});

		return { success: true };
	}
});

/**
 * Mark agenda item as processed or unprocessed
 */
export const markProcessed = mutation({
	args: {
		sessionId: v.string(),
		agendaItemId: v.id('meetingAgendaItems'),
		isProcessed: v.boolean()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get agenda item
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
		await ensureOrganizationMembership(ctx, meeting.organizationId, userId);

		// Update processed state
		await ctx.db.patch(args.agendaItemId, {
			isProcessed: args.isProcessed
		});

		return { success: true };
	}
});

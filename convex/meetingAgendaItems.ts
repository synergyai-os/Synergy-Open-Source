/**
 * Meeting Agenda Items Module - Notes and status management
 *
 * Supports:
 * - Updating notes (markdown) on agenda items
 * - Marking items with status enum (todo, processed, rejected)
 * - Permission checks (user must be workspace member)
 * - Status locking after meeting closes
 */

import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';

/**
 * Helper: Verify user has access to workspace
 */
async function ensureWorkspaceMembership(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		throw new Error('User is not a member of this workspace');
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

		// Get meeting to verify workspace access
		const meeting = await ctx.db.get(agendaItem.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Update notes
		await ctx.db.patch(args.agendaItemId, {
			notes: args.notes
		});

		return { success: true };
	}
});

/**
 * Mark agenda item status (todo, processed, rejected)
 * Status can be changed during meeting, but is locked after meeting closes
 */
export const markStatus = mutation({
	args: {
		sessionId: v.string(),
		agendaItemId: v.id('meetingAgendaItems'),
		status: v.union(v.literal('todo'), v.literal('processed'), v.literal('rejected'))
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get agenda item
		const agendaItem = await ctx.db.get(args.agendaItemId);

		if (!agendaItem) {
			throw new Error('Agenda item not found');
		}

		// Get meeting to verify workspace access and check if closed
		const meeting = await ctx.db.get(agendaItem.meetingId);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		// Verify user has access to workspace
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, userId);

		// Status is locked after meeting closes
		if (meeting.closedAt) {
			throw new Error('Cannot change agenda item status after meeting is closed');
		}

		// Update status
		await ctx.db.patch(args.agendaItemId, {
			status: args.status
		});

		// Business rule: If marking active item as processed/rejected, clear activeAgendaItemId
		if (
			meeting.activeAgendaItemId === args.agendaItemId &&
			(args.status === 'processed' || args.status === 'rejected')
		) {
			await ctx.db.patch(meeting._id, {
				activeAgendaItemId: undefined
			});
		}

		return { success: true };
	}
});

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
import { mutation } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import type { Doc } from '../../_generated/dataModel';
import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from './helpers/access';

type AgendaDeps = {
	requireWorkspacePersonFromSession: typeof requireWorkspacePersonFromSession;
	getAgendaItem: (
		ctx: MutationCtx,
		agendaItemId: Id<'meetingAgendaItems'>
	) => Promise<Doc<'meetingAgendaItems'> | null>;
	getMeeting: (ctx: MutationCtx, meetingId: Id<'meetings'>) => Promise<Doc<'meetings'> | null>;
};

const defaultAgendaDeps: AgendaDeps = {
	requireWorkspacePersonFromSession,
	getAgendaItem: (ctx, agendaItemId) => ctx.db.get(agendaItemId),
	getMeeting: (ctx, meetingId) => ctx.db.get(meetingId)
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update notes on an agenda item
 */
export async function handleUpdateNotes(
	ctx: MutationCtx,
	args: { sessionId: string; agendaItemId: Id<'meetingAgendaItems'>; notes: string },
	deps: AgendaDeps = defaultAgendaDeps
): Promise<{ success: true }> {
	// Get agenda item
	const agendaItem = await deps.getAgendaItem(ctx, args.agendaItemId);

	if (!agendaItem) {
		throw createError(ErrorCodes.AGENDA_ITEM_NOT_FOUND, 'Agenda item not found');
	}

	// Get meeting to verify workspace access
	const meeting = await deps.getMeeting(ctx, agendaItem.meetingId);

	if (!meeting) {
		throw createError(ErrorCodes.MEETING_NOT_FOUND, 'Meeting not found');
	}

	const { personId } = await deps.requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		meeting.workspaceId
	);

	// Verify user has access to workspace
	await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId);

	// Update notes
	await ctx.db.patch(args.agendaItemId, {
		notes: args.notes
	});

	return { success: true };
}

export const updateNotes = mutation({
	args: {
		sessionId: v.string(),
		agendaItemId: v.id('meetingAgendaItems'),
		notes: v.string()
	},
	handler: (ctx, args) => handleUpdateNotes(ctx, args)
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
		// Get agenda item
		const agendaItem = await ctx.db.get(args.agendaItemId);

		if (!agendaItem) {
			throw createError(ErrorCodes.AGENDA_ITEM_NOT_FOUND, 'Agenda item not found');
		}

		// Get meeting to verify workspace access and check if closed
		const meeting = await ctx.db.get(agendaItem.meetingId);

		if (!meeting) {
			throw createError(ErrorCodes.MEETING_NOT_FOUND, 'Meeting not found');
		}

		// Verify user has access to workspace
		const { personId } = await requireWorkspacePersonFromSession(
			ctx,
			args.sessionId,
			meeting.workspaceId
		);
		await ensureWorkspaceMembership(ctx, meeting.workspaceId, personId);

		// Status is locked after meeting closes
		if (meeting.closedAt) {
			throw createError(
				ErrorCodes.GENERIC_ERROR,
				'Cannot change agenda item status after meeting is closed'
			);
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

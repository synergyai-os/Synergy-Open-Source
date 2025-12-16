/**
 * Proposal business rules and validation
 *
 * Pure and contextual business rules for the proposals domain.
 */

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';
import {
	PROPOSAL_STATUSES,
	TERMINAL_STATUSES,
	VALID_TRANSITIONS,
	type ProposalStatus
} from './constants';
import { ensureUniqueSlug } from '../circles/slug';
import { requireActivePerson } from '../people/rules';

// ============================================================================
// Proposal Lookup
// ============================================================================

export async function requireProposal(
	ctx: QueryCtx | MutationCtx,
	proposalId: Id<'circleProposals'>
): Promise<Doc<'circleProposals'>> {
	const proposal = await ctx.db.get(proposalId);
	if (!proposal) {
		throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, `Proposal ${proposalId} not found`);
	}
	return proposal;
}

// ============================================================================
// State Machine Rules
// ============================================================================

export function isProposalStatus(value: string): value is ProposalStatus {
	return (PROPOSAL_STATUSES as string[]).includes(value);
}

export function isTerminalState(status: ProposalStatus | string): boolean {
	return TERMINAL_STATUSES.includes(status as ProposalStatus);
}

export function canTransition(
	current: ProposalStatus | string,
	next: ProposalStatus | string
): boolean {
	if (!isProposalStatus(current) || !isProposalStatus(next)) return false;
	return VALID_TRANSITIONS[current]?.includes(next) ?? false;
}

export function assertTransition(
	current: ProposalStatus | string,
	next: ProposalStatus,
	context: string,
	errorMessage?: string
): asserts current is ProposalStatus {
	if (!isProposalStatus(current)) {
		throw createError(ErrorCodes.PROPOSAL_INVALID_STATE, `Invalid proposal status: ${current}`);
	}

	if (!canTransition(current, next)) {
		throw createError(
			ErrorCodes.PROPOSAL_INVALID_STATE,
			errorMessage ?? `Invalid proposal status transition (${context}): ${current} -> ${next}`
		);
	}
}

// ============================================================================
// Validation Rules
// ============================================================================

export function assertHasEvolutions(evolutionCount: number, context = 'proposal'): void {
	if (evolutionCount <= 0) {
		throw createError(
			ErrorCodes.VALIDATION_REQUIRED_FIELD,
			`${context} must have at least one proposed change`
		);
	}
}

export function assertNotTerminal(status: ProposalStatus | string, errorMessage?: string): void {
	if (isTerminalState(status)) {
		throw createError(
			ErrorCodes.PROPOSAL_INVALID_STATE,
			errorMessage ?? 'Proposal is already finalized'
		);
	}
}

// ============================================================================
// Access Control Rules
// ============================================================================

export async function ensureWorkspaceMembership(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	personId: Id<'people'>
): Promise<void> {
	const person = await requireActivePerson(ctx, personId);
	if (person.workspaceId !== workspaceId) {
		throw createError(
			ErrorCodes.WORKSPACE_ACCESS_DENIED,
			'You do not have access to this workspace'
		);
	}
}

export async function ensureUniqueCircleSlug(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	baseSlug: string
): Promise<string> {
	const existingCircles = await ctx.db
		.query('circles')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	const existingSlugs = new Set(existingCircles.map((circle) => circle.slug));
	return ensureUniqueSlug(baseSlug, existingSlugs);
}

export async function getNextAgendaOrder(
	ctx: MutationCtx,
	meetingId: Id<'meetings'>
): Promise<number> {
	const existingItems = await ctx.db
		.query('meetingAgendaItems')
		.withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
		.collect();

	return existingItems.length > 0 ? Math.max(...existingItems.map((i) => i.order)) + 1 : 1;
}

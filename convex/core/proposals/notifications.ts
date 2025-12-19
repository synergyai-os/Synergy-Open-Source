/**
 * Proposal notification placeholders
 * 
 * When proposals are created or auto-approved, affected parties should be notified.
 * For MVP, this is just a placeholder that will be replaced with real inbox items later.
 */

import type { MutationCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';

export async function notifyProposalCreated(
	ctx: MutationCtx,
	proposalId: Id<'circleProposals'>
): Promise<void> {
	// Placeholder - will be inbox items
	console.log(`[PLACEHOLDER] Proposal created: ${proposalId}`);
	console.log(`[PLACEHOLDER] Notify circle members`);
	console.log(`[PLACEHOLDER] Notify circle lead for review`);
}

export async function notifyProposalApproved(
	ctx: MutationCtx,
	proposalId: Id<'circleProposals'>
): Promise<void> {
	// Placeholder - will be inbox items
	console.log(`[PLACEHOLDER] Proposal approved: ${proposalId}`);
	console.log(`[PLACEHOLDER] Notify proposal creator`);
	console.log(`[PLACEHOLDER] Notify affected role holders`);
}

export async function notifyProposalRejected(
	ctx: MutationCtx,
	proposalId: Id<'circleProposals'>
): Promise<void> {
	// Placeholder - will be inbox items
	console.log(`[PLACEHOLDER] Proposal rejected: ${proposalId}`);
	console.log(`[PLACEHOLDER] Notify proposal creator`);
}


/**
 * Proposals business rules and validation.
 */

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';

export * from './stateMachine';
export * from './validation';

export async function requireProposal(
	ctx: QueryCtx | MutationCtx,
	proposalId: Id<'proposals'>
): Promise<Doc<'proposals'>> {
	const proposal = await ctx.db.get(proposalId);
	if (!proposal) {
		throw createError(ErrorCodes.PROPOSAL_NOT_FOUND, `Proposal ${proposalId} not found`);
	}
	return proposal;
}

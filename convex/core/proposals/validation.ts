/**
 * Proposal Validation Helpers (pure)
 *
 * Stateless predicates and assertions used by the application layer.
 */

import { isTerminalState, type ProposalStatus } from './stateMachine';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

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

/**
 * Proposal Validation Helpers (pure)
 *
 * Stateless predicates and assertions used by the application layer.
 */

import { isTerminalState, type ProposalStatus } from './stateMachine';

export function assertHasEvolutions(evolutionCount: number, context = 'proposal'): void {
	if (evolutionCount <= 0) {
		throw new Error(`${context} must have at least one proposed change`);
	}
}

export function assertNotTerminal(status: ProposalStatus | string, errorMessage?: string): void {
	if (isTerminalState(status)) {
		throw new Error(errorMessage ?? 'Proposal is already finalized');
	}
}



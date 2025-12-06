/**
 * Proposal State Machine
 *
 * Pure, explicit state transition map for circle proposals.
 * No side effects; suitable for unit testing.
 */

export type ProposalStatus =
	| 'draft'
	| 'submitted'
	| 'in_meeting'
	| 'objections'
	| 'integrated'
	| 'approved'
	| 'rejected'
	| 'withdrawn';

export const PROPOSAL_STATUSES: ProposalStatus[] = [
	'draft',
	'submitted',
	'in_meeting',
	'objections',
	'integrated',
	'approved',
	'rejected',
	'withdrawn'
];

export const TERMINAL_STATUSES: ProposalStatus[] = ['approved', 'rejected', 'withdrawn'];

export const VALID_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
	draft: ['submitted', 'withdrawn'],
	submitted: ['in_meeting', 'withdrawn'],
	in_meeting: ['objections', 'integrated', 'approved', 'rejected', 'withdrawn'],
	objections: ['integrated', 'rejected', 'withdrawn'],
	integrated: ['approved', 'rejected', 'withdrawn'],
	approved: [],
	rejected: [],
	withdrawn: []
};

export function isProposalStatus(value: string): value is ProposalStatus {
	return (PROPOSAL_STATUSES as string[]).includes(value);
}

export function isTerminalState(status: ProposalStatus | string): boolean {
	return TERMINAL_STATUSES.includes(status as ProposalStatus);
}

export function canTransition(current: ProposalStatus | string, next: ProposalStatus | string): boolean {
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
		throw new Error(`Invalid proposal status: ${current}`);
	}

	if (!canTransition(current, next)) {
		throw new Error(
			errorMessage ?? `Invalid proposal status transition (${context}): ${current} -> ${next}`
		);
	}
}



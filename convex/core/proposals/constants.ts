/**
 * Proposal domain constants
 */

export const PROPOSAL_STATUSES = {
	DRAFT: 'draft',
	SUBMITTED: 'submitted',
	IN_MEETING: 'in_meeting',
	OBJECTIONS: 'objections',
	INTEGRATED: 'integrated',
	APPROVED: 'approved',
	REJECTED: 'rejected',
	WITHDRAWN: 'withdrawn'
} as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[keyof typeof PROPOSAL_STATUSES];

// State machine constants
export const TERMINAL_STATUSES: ProposalStatus[] = [
	PROPOSAL_STATUSES.APPROVED,
	PROPOSAL_STATUSES.REJECTED,
	PROPOSAL_STATUSES.WITHDRAWN
];

// Valid state transitions
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

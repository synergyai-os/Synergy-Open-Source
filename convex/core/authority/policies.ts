import { LEAD_AUTHORITY, type LeadAuthority } from '../circles';
import type { CirclePolicy } from './types';

/**
 * Policy lookup table for each lead authority level.
 * Defines governance rules based on organizational model.
 *
 * SIMPLIFIED from 4 circle types to 3 lead authority levels:
 * - `decides`: Lead has full decision authority
 * - `facilitates`: Lead facilitates, team decides via consent
 * - `convenes`: Lead schedules only, advisory decisions
 */
export const circlePolicies: Record<LeadAuthority, CirclePolicy> = {
	[LEAD_AUTHORITY.DECIDES]: {
		leadRequired: true,
		leadLabel: 'Circle Lead',
		canLeadApproveUnilaterally: true,
		canLeadAssignRoles: true,
		coreRoles: ['Circle Lead', 'Secretary']
	},
	[LEAD_AUTHORITY.FACILITATES]: {
		leadRequired: false,
		leadLabel: 'Coordinator',
		canLeadApproveUnilaterally: false,
		canLeadAssignRoles: false,
		coreRoles: ['Facilitator', 'Secretary']
	},
	[LEAD_AUTHORITY.CONVENES]: {
		leadRequired: false,
		leadLabel: 'Steward',
		canLeadApproveUnilaterally: false,
		canLeadAssignRoles: false,
		coreRoles: ['Steward']
	}
};

/**
 * Get the policy configuration for a lead authority level.
 */
export function getPolicy(leadAuthority: LeadAuthority): CirclePolicy {
	return circlePolicies[leadAuthority];
}

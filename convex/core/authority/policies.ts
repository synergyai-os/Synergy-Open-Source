import type { CircleType } from '../circles';
import type { CirclePolicy } from './types';

/**
 * Policy lookup table for each circle type.
 * Defines governance rules based on organizational model.
 */
export const circlePolicies: Record<CircleType, CirclePolicy> = {
	hierarchy: {
		leadRequired: true,
		leadLabel: 'Circle Lead',
		decisionModel: 'lead_decides',
		canLeadApproveUnilaterally: true,
		canLeadAssignRoles: true,
		coreRoles: ['Circle Lead', 'Secretary']
	},
	empowered_team: {
		leadRequired: false,
		leadLabel: 'Coordinator',
		decisionModel: 'consent',
		canLeadApproveUnilaterally: false,
		canLeadAssignRoles: false,
		coreRoles: ['Facilitator', 'Secretary']
	},
	guild: {
		leadRequired: false,
		leadLabel: 'Steward',
		decisionModel: 'consensus',
		canLeadApproveUnilaterally: false,
		canLeadAssignRoles: false,
		coreRoles: ['Steward']
	},
	hybrid: {
		leadRequired: true,
		leadLabel: 'Circle Lead',
		decisionModel: 'consent',
		canLeadApproveUnilaterally: false,
		canLeadAssignRoles: true,
		coreRoles: ['Circle Lead', 'Facilitator', 'Secretary']
	}
};

/**
 * Get the policy configuration for a circle type.
 */
export function getPolicy(circleType: CircleType): CirclePolicy {
	return circlePolicies[circleType];
}

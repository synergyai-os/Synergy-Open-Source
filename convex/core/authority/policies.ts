import { CIRCLE_TYPES, type CircleType } from '../circles';
import type { CirclePolicy } from './types';

/**
 * Policy lookup table for each circle type.
 * Defines governance rules based on organizational model.
 */
export const circlePolicies: Record<CircleType, CirclePolicy> = {
	[CIRCLE_TYPES.HIERARCHY]: {
		leadRequired: true,
		leadLabel: 'Circle Lead',
		decisionModel: 'lead_decides',
		canLeadApproveUnilaterally: true,
		canLeadAssignRoles: true,
		coreRoles: ['Circle Lead', 'Secretary']
	},
	[CIRCLE_TYPES.EMPOWERED_TEAM]: {
		leadRequired: false,
		leadLabel: 'Coordinator',
		decisionModel: 'consent',
		canLeadApproveUnilaterally: false,
		canLeadAssignRoles: false,
		coreRoles: ['Facilitator', 'Secretary']
	},
	[CIRCLE_TYPES.GUILD]: {
		leadRequired: false,
		leadLabel: 'Steward',
		decisionModel: 'consensus',
		canLeadApproveUnilaterally: false,
		canLeadAssignRoles: false,
		coreRoles: ['Steward']
	},
	[CIRCLE_TYPES.HYBRID]: {
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

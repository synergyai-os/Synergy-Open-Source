import type { Id } from '../../_generated/dataModel';
import type { CircleType } from '../circles';

/**
 * Assignment represents a person filling a role in a circle.
 * Used to build AuthorityContext for authority calculations.
 */
export interface Assignment {
	personId: Id<'people'>;
	circleId: Id<'circles'>;
	roleId: Id<'circleRoles'>;
	roleName: string;
	roleType: 'lead' | 'core' | 'custom';
}

/**
 * Context object passed to authority calculation functions.
 * Built by callers from database queries, consumed by pure functions.
 */
export interface AuthorityContext {
	personId: Id<'people'>;
	circleId: Id<'circles'>;
	circleType: CircleType;
	assignments: Assignment[];
}

/**
 * Result of calculateAuthority() — what a person can do in a circle.
 */
export interface Authority {
	canApproveProposals: boolean;
	canAssignRoles: boolean;
	canModifyCircleStructure: boolean;
	canRaiseObjections: boolean;
	canFacilitate: boolean;
}

/**
 * Policy configuration for a circle type.
 * Defines governance rules based on organizational model.
 */
export interface CirclePolicy {
	leadRequired: boolean;
	leadLabel: string;
	decisionModel: 'lead_decides' | 'consent' | 'consensus';
	canLeadApproveUnilaterally: boolean;
	canLeadAssignRoles: boolean;
	coreRoles: string[];
}

// Re-export CircleType from circles domain (canonical source)
export type { CircleType } from '../circles';

/**
 * Authority level for different organizational contexts.
 */
export type AuthorityLevel = 'authority' | 'facilitative' | 'convening';

import type { Id } from '../../_generated/dataModel';
import type { LeadAuthority } from '../circles';

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
	leadAuthority: LeadAuthority;
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
 * Policy configuration for a lead authority level.
 * Defines governance rules based on organizational model.
 *
 * SIMPLIFIED: `decisionModel` has been removed as the redundant field
 * was the source of UI/logic mismatches. The `leadAuthority` value itself
 * IS the decision model now.
 */
export interface CirclePolicy {
	leadRequired: boolean;
	leadLabel: string;
	canLeadApproveUnilaterally: boolean;
	canLeadAssignRoles: boolean;
	coreRoles: string[];
}

// Re-export LeadAuthority from circles domain (canonical source)
export type { LeadAuthority } from '../circles';

/**
 * Authority level for different organizational contexts.
 *
 * ALIGNED with LeadAuthority: Since leadAuthority IS the authority level,
 * these values are now identical. Consider using LeadAuthority directly.
 */
export type AuthorityLevel = 'decides' | 'facilitates' | 'convenes';

// Types
export type {
	Assignment,
	AuthorityContext,
	Authority,
	CirclePolicy,
	AuthorityLevel
} from './types';

// Re-export LeadAuthority from canonical source
export type { LeadAuthority } from '../circles';

// Policies
export { circlePolicies, getPolicy } from './policies';

// Rules (pure primitives)
export { isCircleLead, isCircleMember, hasRole, isFacilitator } from './rules';

// Calculator helpers
export {
	getAuthorityLevel,
	calculateAuthorityLevel, // @deprecated - use getAuthorityLevel instead
	calculateAuthority,
	hasDirectApprovalAuthority,
	requiresConsentProcess,
	hasConveningAuthority
} from './calculator';

// Context loaders
export { getAuthorityContext, getAuthorityContextFromAssignments } from './context';

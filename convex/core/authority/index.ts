// Types
export type {
	Assignment,
	AuthorityContext,
	Authority,
	CirclePolicy,
	AuthorityLevel
} from './types';

// Re-export CircleType from canonical source
export type { CircleType } from '../circles';

// Policies
export { circlePolicies, getPolicy } from './policies';

// Rules (pure primitives)
export { isCircleLead, isCircleMember, hasRole, isFacilitator } from './rules';

// Calculator helpers
export {
	calculateAuthorityLevel,
	calculateAuthority,
	hasDirectApprovalAuthority,
	requiresConsentProcess,
	hasConveningAuthority
} from './calculator';

// Context loaders
export { getAuthorityContext, getAuthorityContextFromAssignments } from './context';

/**
 * Authority Calculator
 *
 * Pure functions for calculating authority levels from lead authority values.
 * These functions have no side effects and are easily testable in isolation.
 *
 * SYOS-692: Extracted from the org chart permission helpers (now in rbac/orgChart.ts)
 * to enable isolated testing and clear separation of concerns.
 *
 * SYOS-1070: Simplified — leadAuthority IS the authority level, no mapping needed.
 */

import { LEAD_AUTHORITY, type LeadAuthority } from '../circles';
import { getPolicy } from './policies';
import { isCircleLead, isCircleMember, isFacilitator } from './rules';
import type { Authority, AuthorityContext, AuthorityLevel, CirclePolicy } from './types';

/**
 * Get authority level from lead authority value.
 * Pure function - no side effects, easily testable.
 *
 * SIMPLIFIED: Since leadAuthority IS the authority level, this is now an
 * identity function with default handling. The mapping complexity from
 * the old circleType → AuthorityLevel has been eliminated.
 *
 * Values:
 * - decides: Lead has full decision authority
 * - facilitates: Lead facilitates, team decides via consent
 * - convenes: Lead schedules only, advisory decisions
 *
 * @param leadAuthority - The circle's lead authority level
 * @returns The authority level (same as leadAuthority, or default)
 */
export function getAuthorityLevel(leadAuthority: LeadAuthority | null | undefined): AuthorityLevel {
	return leadAuthority ?? LEAD_AUTHORITY.DECIDES;
}

/**
 * @deprecated Use getAuthorityLevel() instead. This alias exists for backwards compatibility.
 */
export const calculateAuthorityLevel = getAuthorityLevel;

/**
 * Check if Lead role has direct approval authority
 *
 * @param leadAuthority - The circle's lead authority level
 * @returns true if Lead can approve proposals directly (decides)
 */
export function hasDirectApprovalAuthority(
	leadAuthority: LeadAuthority | null | undefined
): boolean {
	return getAuthorityLevel(leadAuthority) === LEAD_AUTHORITY.DECIDES;
}

/**
 * Check if circle requires consent process
 *
 * @param leadAuthority - The circle's lead authority level
 * @returns true if circle uses facilitative authority (consent process)
 */
export function requiresConsentProcess(leadAuthority: LeadAuthority | null | undefined): boolean {
	return getAuthorityLevel(leadAuthority) === LEAD_AUTHORITY.FACILITATES;
}

/**
 * Check if circle has convening authority (no approval authority)
 *
 * @param leadAuthority - The circle's lead authority level
 * @returns true if circle has convening authority (coordination only)
 */
export function hasConveningAuthority(leadAuthority: LeadAuthority | null | undefined): boolean {
	return getAuthorityLevel(leadAuthority) === LEAD_AUTHORITY.CONVENES;
}

/**
 * Calculate complete authority for a person in a circle context.
 *
 * This is the main entry point — features call this to determine
 * what a person can do.
 *
 * Pure function — no database access, no side effects.
 *
 * @param ctx - The authority context (user, circle, assignments)
 * @returns Authority object with all permission flags
 */
export function calculateAuthority(ctx: AuthorityContext): Authority {
	if (ctx.assignments.length === 0) {
		return {
			canApproveProposals: false,
			canAssignRoles: false,
			canModifyCircleStructure: false,
			canRaiseObjections: false,
			canFacilitate: false
		};
	}

	const policy = getPolicy(ctx.leadAuthority);
	const isLead = isCircleLead(ctx);
	const isMember = isCircleMember(ctx);

	// Members can raise objections in circles where the lead doesn't decide alone
	// (facilitates = consent process, convenes = advisory/consensus)
	const allowsObjections = ctx.leadAuthority !== LEAD_AUTHORITY.DECIDES;

	return {
		canApproveProposals: hasApprovalAuthority(isLead, policy),
		canRaiseObjections: isMember && allowsObjections,
		canAssignRoles: isLead && policy.canLeadAssignRoles,
		canModifyCircleStructure: isLead,
		canFacilitate: isFacilitator(ctx)
	};
}

/**
 * Check if user has proposal approval authority based on lead authority policy.
 *
 * Internal helper — not exported.
 * Returns true only for leads in circles where unilateral approval is allowed.
 * Consent/consensus circles: approval comes from process, not individual authority.
 */
function hasApprovalAuthority(isLead: boolean, policy: CirclePolicy): boolean {
	if (policy.canLeadApproveUnilaterally) {
		return isLead;
	}

	return false;
}

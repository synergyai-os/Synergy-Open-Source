/**
 * Authority Calculator
 *
 * Pure functions for calculating authority levels from circle types.
 * These functions have no side effects and are easily testable in isolation.
 *
 * SYOS-692: Extracted from the org chart permission helpers (now in rbac/orgChart.ts)
 * to enable isolated testing and clear separation of concerns.
 */

import { CIRCLE_TYPES, type CircleType } from '../circles';
import { getPolicy } from './policies';
import { isCircleLead, isCircleMember, isFacilitator } from './rules';
import type { Authority, AuthorityContext, AuthorityLevel, CirclePolicy } from './types';

/**
 * Calculate authority level from circle type
 * Pure function - no side effects, easily testable
 *
 * Mapping:
 * - hierarchy → authority (Lead decides directly)
 * - empowered_team → facilitative (Team consensus, Lead facilitates)
 * - guild → convening (No authority, coordination only)
 * - hybrid → authority (Lead decides, same as hierarchy)
 *
 * @param circleType - The circle's operating mode
 * @returns Authority level for the Lead role in this circle
 */
export function calculateAuthorityLevel(circleType: CircleType | null | undefined): AuthorityLevel {
	const effectiveType = circleType ?? CIRCLE_TYPES.HIERARCHY;

	const mapping: Record<CircleType, AuthorityLevel> = {
		[CIRCLE_TYPES.HIERARCHY]: 'authority', // Lead decides directly
		[CIRCLE_TYPES.EMPOWERED_TEAM]: 'facilitative', // Team consensus, Lead facilitates
		[CIRCLE_TYPES.GUILD]: 'convening', // No authority, coordination only
		[CIRCLE_TYPES.HYBRID]: 'authority' // Lead decides (same as hierarchy)
	};

	return mapping[effectiveType];
}

/**
 * Check if Lead role has direct approval authority
 *
 * @param circleType - The circle's operating mode
 * @returns true if Lead can approve proposals directly (authority level)
 */
export function hasDirectApprovalAuthority(circleType: CircleType | null | undefined): boolean {
	return calculateAuthorityLevel(circleType) === 'authority';
}

/**
 * Check if circle requires consent process
 *
 * @param circleType - The circle's operating mode
 * @returns true if circle uses facilitative authority (consent process)
 */
export function requiresConsentProcess(circleType: CircleType | null | undefined): boolean {
	return calculateAuthorityLevel(circleType) === 'facilitative';
}

/**
 * Check if circle has convening authority (no approval authority)
 *
 * @param circleType - The circle's operating mode
 * @returns true if circle has convening authority (coordination only)
 */
export function hasConveningAuthority(circleType: CircleType | null | undefined): boolean {
	return calculateAuthorityLevel(circleType) === 'convening';
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

	const policy = getPolicy(ctx.circleType);
	const isLead = isCircleLead(ctx);
	const isMember = isCircleMember(ctx);

	return {
		canApproveProposals: hasApprovalAuthority(isLead, policy),
		canRaiseObjections: isMember && policy.decisionModel !== 'lead_decides',
		canAssignRoles: isLead && policy.canLeadAssignRoles,
		canModifyCircleStructure: isLead,
		canFacilitate: isFacilitator(ctx)
	};
}

/**
 * Check if user has proposal approval authority based on circle type policy.
 *
 * Internal helper — not exported.
 * Returns true only for leads in hierarchy circles where unilateral approval is allowed.
 * Consent/consensus circles: approval comes from process, not individual authority.
 */
function hasApprovalAuthority(isLead: boolean, policy: CirclePolicy): boolean {
	if (policy.canLeadApproveUnilaterally) {
		return isLead;
	}

	return false;
}

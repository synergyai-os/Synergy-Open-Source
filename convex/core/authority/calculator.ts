/**
 * Authority Calculator
 *
 * Pure functions for calculating authority levels from circle types.
 * These functions have no side effects and are easily testable in isolation.
 *
 * SYOS-692: Extracted from orgChartPermissions.ts to enable isolated testing
 * and clear separation of concerns.
 */

export type CircleType = 'hierarchy' | 'empowered_team' | 'guild' | 'hybrid';
export type AuthorityLevel = 'authority' | 'facilitative' | 'convening';

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
	const effectiveType = circleType ?? 'hierarchy';

	const mapping: Record<CircleType, AuthorityLevel> = {
		hierarchy: 'authority', // Lead decides directly
		empowered_team: 'facilitative', // Team consensus, Lead facilitates
		guild: 'convening', // No authority, coordination only
		hybrid: 'authority' // Lead decides (same as hierarchy)
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

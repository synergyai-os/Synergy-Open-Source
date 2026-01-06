/**
 * Lead Authority Constants
 *
 * SINGLE SOURCE OF TRUTH for lead authority values.
 *
 * These constants are used throughout the codebase:
 * - Backend: Schema validation, business logic, queries
 * - Frontend: UI components, type definitions
 *
 * IMPORTANT: If you need to add/modify values:
 * 1. Update constants here
 * 2. Update Convex schema (tables.ts)
 * 3. Update frontend constants (src/lib/infrastructure/organizational-model/constants.ts)
 * 4. Run type check to ensure compatibility
 *
 * @example
 * ```typescript
 * import { LEAD_AUTHORITY, type LeadAuthority } from './constants';
 *
 * const leadAuthority: LeadAuthority = LEAD_AUTHORITY.DECIDES;
 * ```
 */

// ============================================================================
// Lead Authority
// ============================================================================

export const LEAD_AUTHORITY = {
	DECIDES: 'decides',
	FACILITATES: 'facilitates',
	CONVENES: 'convenes'
} as const;

export type LeadAuthority = (typeof LEAD_AUTHORITY)[keyof typeof LEAD_AUTHORITY];

/**
 * Default lead authority value for new circles
 */
export const DEFAULT_LEAD_AUTHORITY: LeadAuthority = LEAD_AUTHORITY.DECIDES;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard: Check if value is a valid LeadAuthority
 */
export function isLeadAuthority(value: string): value is LeadAuthority {
	return Object.values(LEAD_AUTHORITY).includes(value as LeadAuthority);
}

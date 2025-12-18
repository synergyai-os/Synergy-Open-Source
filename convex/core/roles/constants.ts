/**
 * Role Type Constants
 *
 * SINGLE SOURCE OF TRUTH for role types.
 *
 * These constants are used throughout the codebase:
 * - Backend: Schema validation, business logic, queries
 * - Frontend: Type definitions, UI components
 *
 * IMPORTANT: If you need to add/modify values:
 * 1. Update constants here
 * 2. Update Convex schema (tables.ts)
 * 3. Update frontend constants if needed
 * 4. Run type check to ensure compatibility
 *
 * @example
 * ```typescript
 * import { ROLE_TYPES, type RoleType } from './constants';
 *
 * const roleType: RoleType = ROLE_TYPES.CIRCLE_LEAD;
 * ```
 */

// ============================================================================
// Role Types
// ============================================================================

export const ROLE_TYPES = {
	CIRCLE_LEAD: 'circle_lead',
	STRUCTURAL: 'structural',
	CUSTOM: 'custom'
} as const;

export type RoleType = (typeof ROLE_TYPES)[keyof typeof ROLE_TYPES];

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard: Check if value is a valid RoleType
 */
export function isRoleType(value: string): value is RoleType {
	return Object.values(ROLE_TYPES).includes(value as RoleType);
}

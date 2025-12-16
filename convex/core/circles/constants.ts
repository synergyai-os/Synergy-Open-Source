/**
 * Circle Type & Decision Model Constants
 *
 * SINGLE SOURCE OF TRUTH for circle types and decision models.
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
 * import { CIRCLE_TYPES, type CircleType } from './constants';
 *
 * const circleType: CircleType = CIRCLE_TYPES.HIERARCHY;
 * ```
 */

// ============================================================================
// Circle Types
// ============================================================================

export const CIRCLE_TYPES = {
	HIERARCHY: 'hierarchy',
	EMPOWERED_TEAM: 'empowered_team',
	GUILD: 'guild',
	HYBRID: 'hybrid'
} as const;

export type CircleType = (typeof CIRCLE_TYPES)[keyof typeof CIRCLE_TYPES];

// ============================================================================
// Decision Models
// ============================================================================

export const DECISION_MODELS = {
	MANAGER_DECIDES: 'manager_decides',
	TEAM_CONSENSUS: 'team_consensus',
	CONSENT: 'consent',
	COORDINATION_ONLY: 'coordination_only'
} as const;

export type DecisionModel = (typeof DECISION_MODELS)[keyof typeof DECISION_MODELS];

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard: Check if value is a valid CircleType
 */
export function isCircleType(value: string): value is CircleType {
	return Object.values(CIRCLE_TYPES).includes(value as CircleType);
}

/**
 * Type guard: Check if value is a valid DecisionModel
 */
export function isDecisionModel(value: string): value is DecisionModel {
	return Object.values(DECISION_MODELS).includes(value as DecisionModel);
}

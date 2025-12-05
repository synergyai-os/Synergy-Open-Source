/**
 * Operating Mode Constants
 *
 * System-defined values that must remain fixed for type safety and permission logic.
 * Labels are customizable per workspace via workspaceOrgSettings.
 *
 * Location: Infrastructure layer (core organizational model data)
 * - Used in backend: schema, permissions, mutations
 * - Used in infrastructure: types (CircleSummary)
 * - Used in modules: org-chart visualization UI (one consumer)
 *
 * Pattern: Similar to feature flags - constants defined here, used throughout codebase.
 * Values are hardcoded (like RBAC permissions), labels are customizable (like role templates).
 *
 * @example
 * ```typescript
 * import { CIRCLE_TYPES, DEFAULT_CIRCLE_TYPE_LABELS } from '$lib/infrastructure/organizational-model/constants';
 *
 * const circleType = CIRCLE_TYPES.HIERARCHY;
 * const label = DEFAULT_CIRCLE_TYPE_LABELS[CIRCLE_TYPES.HIERARCHY]; // "Hierarchy"
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

// Default labels (used when workspace labels not configured)
export const DEFAULT_CIRCLE_TYPE_LABELS: Record<CircleType, string> = {
	[CIRCLE_TYPES.HIERARCHY]: 'Hierarchy',
	[CIRCLE_TYPES.EMPOWERED_TEAM]: 'Empowered Team',
	[CIRCLE_TYPES.GUILD]: 'Guild',
	[CIRCLE_TYPES.HYBRID]: 'Hybrid'
} as const;

export const DEFAULT_CIRCLE_TYPE_DESCRIPTIONS: Record<CircleType, string> = {
	[CIRCLE_TYPES.HIERARCHY]: 'Traditional: manager decides',
	[CIRCLE_TYPES.EMPOWERED_TEAM]: 'Agile: team consensus',
	[CIRCLE_TYPES.GUILD]: 'Coordination only, no authority',
	[CIRCLE_TYPES.HYBRID]: 'Mixed: depends on decision type'
} as const;

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

// Default labels (used when workspace labels not configured)
export const DEFAULT_DECISION_MODEL_LABELS: Record<DecisionModel, string> = {
	[DECISION_MODELS.MANAGER_DECIDES]: 'Manager Decides',
	[DECISION_MODELS.TEAM_CONSENSUS]: 'Team Consensus',
	[DECISION_MODELS.CONSENT]: 'Consent',
	[DECISION_MODELS.COORDINATION_ONLY]: 'Coordination Only'
} as const;

export const DEFAULT_DECISION_MODEL_DESCRIPTIONS: Record<DecisionModel, string> = {
	[DECISION_MODELS.MANAGER_DECIDES]: 'Single approver (manager/lead)',
	[DECISION_MODELS.TEAM_CONSENSUS]: 'All members must agree',
	[DECISION_MODELS.CONSENT]: 'No valid objections (IDM)',
	[DECISION_MODELS.COORDINATION_ONLY]: 'Guild: must approve in home circle'
} as const;

// ============================================================================
// Circle Item Categories
// ============================================================================

/**
 * Default category names created automatically for each workspace.
 * These are system defaults - workspace admins can add custom categories.
 *
 * Note: Categories are workspace-specific and customizable, but these are
 * the default names that are created on workspace creation.
 */
export const DEFAULT_CIRCLE_CATEGORY_NAMES = {
	PURPOSE: 'Purpose',
	DOMAINS: 'Domains',
	ACCOUNTABILITIES: 'Accountabilities',
	POLICIES: 'Policies',
	DECISION_RIGHTS: 'Decision Rights',
	NOTES: 'Notes'
} as const;

export const DEFAULT_ROLE_CATEGORY_NAMES = {
	PURPOSE: 'Purpose',
	DOMAINS: 'Domains',
	ACCOUNTABILITIES: 'Accountabilities',
	POLICIES: 'Policies',
	DECISION_RIGHTS: 'Decision Rights',
	NOTES: 'Notes'
} as const;

/**
 * Categories that should be displayed as single text fields (not multiple items)
 */
export const SINGLE_FIELD_CATEGORIES = [
	DEFAULT_CIRCLE_CATEGORY_NAMES.PURPOSE,
	DEFAULT_CIRCLE_CATEGORY_NAMES.NOTES
] as const;

/**
 * Categories that support multiple items (each item is separate)
 */
export const MULTIPLE_ITEM_CATEGORIES = [
	DEFAULT_CIRCLE_CATEGORY_NAMES.DOMAINS,
	DEFAULT_CIRCLE_CATEGORY_NAMES.ACCOUNTABILITIES,
	DEFAULT_CIRCLE_CATEGORY_NAMES.POLICIES,
	DEFAULT_CIRCLE_CATEGORY_NAMES.DECISION_RIGHTS
] as const;

/**
 * Check if a category name should be displayed as a single field
 */
export function isSingleFieldCategory(categoryName: string): boolean {
	return (SINGLE_FIELD_CATEGORIES as readonly string[]).includes(categoryName);
}

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

// ============================================================================
// Authority Levels (SYOS-670: Circle Lead Authority)
// ============================================================================

/**
 * System-defined authority levels for Lead roles.
 * Authority is computed at runtime from circle type, not stored on roles.
 */
export const AUTHORITY_LEVELS = {
	AUTHORITY: 'authority',
	FACILITATIVE: 'facilitative',
	CONVENING: 'convening'
} as const;

export type AuthorityLevel = (typeof AUTHORITY_LEVELS)[keyof typeof AUTHORITY_LEVELS];

/**
 * Circle Type → Authority Level Mapping (system behavior)
 * Lead authority adapts to circle type using hard-coded defaults.
 */
export const CIRCLE_TYPE_LEAD_AUTHORITY: Record<CircleType, AuthorityLevel> = {
	[CIRCLE_TYPES.HIERARCHY]: AUTHORITY_LEVELS.AUTHORITY,
	[CIRCLE_TYPES.EMPOWERED_TEAM]: AUTHORITY_LEVELS.FACILITATIVE,
	[CIRCLE_TYPES.GUILD]: AUTHORITY_LEVELS.CONVENING,
	[CIRCLE_TYPES.HYBRID]: AUTHORITY_LEVELS.AUTHORITY
} as const;

/**
 * Lead Requirement by Circle Type (system behavior)
 * Determines if a Lead role is required when creating a circle.
 */
export const DEFAULT_LEAD_REQUIRED: Record<CircleType, boolean> = {
	[CIRCLE_TYPES.HIERARCHY]: true,
	[CIRCLE_TYPES.EMPOWERED_TEAM]: false,
	[CIRCLE_TYPES.GUILD]: false,
	[CIRCLE_TYPES.HYBRID]: true
} as const;

// ============================================================================
// Default Labels (Fallback when workspace doesn't customize)
// ============================================================================

/**
 * Default Lead role labels by circle type
 * MVP: Returns default label
 * Phase 4+: Will check workspaceOrgSettings.leadLabelByCircleType first
 */
export const DEFAULT_LEAD_LABELS: Record<CircleType, string> = {
	[CIRCLE_TYPES.HIERARCHY]: 'Manager',
	[CIRCLE_TYPES.EMPOWERED_TEAM]: 'Coordinator',
	[CIRCLE_TYPES.GUILD]: 'Steward',
	[CIRCLE_TYPES.HYBRID]: 'Lead'
} as const;

/**
 * Default Lead role descriptions by circle type
 * MVP: Returns default description
 * Phase 4+: Will check workspaceOrgSettings first
 */
export const DEFAULT_LEAD_DESCRIPTIONS: Record<CircleType, string> = {
	[CIRCLE_TYPES.HIERARCHY]: 'Makes final decisions for this circle',
	[CIRCLE_TYPES.EMPOWERED_TEAM]: 'Coordinates the team. Team decides together using consent.',
	[CIRCLE_TYPES.GUILD]: 'Organizes gatherings. Decisions are made in home circles.',
	[CIRCLE_TYPES.HYBRID]: 'Authority varies by decision type'
} as const;

/**
 * UI configuration for authority levels (emoji + badge text)
 */
export const AUTHORITY_LEVEL_UI: Record<AuthorityLevel, { emoji: string; badge: string }> = {
	[AUTHORITY_LEVELS.AUTHORITY]: { emoji: '👔', badge: 'Authority Role' },
	[AUTHORITY_LEVELS.FACILITATIVE]: { emoji: '🤝', badge: 'Facilitative Role' },
	[AUTHORITY_LEVELS.CONVENING]: { emoji: '🌱', badge: 'Convening Role' }
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get Lead authority level for a circle type
 * @returns System-defined authority level (constant lookup, no DB query)
 */
export function getLeadAuthorityLevel(circleType: CircleType | null | undefined): AuthorityLevel {
	return CIRCLE_TYPE_LEAD_AUTHORITY[circleType ?? CIRCLE_TYPES.HIERARCHY];
}

/**
 * Get Lead label for display in UI
 * MVP: Returns default label
 * Phase 4+: Will check workspaceOrgSettings.leadLabelByCircleType first
 */
export function getLeadLabel(
	circleType: CircleType | null | undefined,
	_workspaceLabels?: Record<CircleType, string> // Unused in MVP, ready for Phase 4+
): string {
	// MVP: Just return default
	return DEFAULT_LEAD_LABELS[circleType ?? CIRCLE_TYPES.HIERARCHY];

	// Phase 4+: Uncomment to enable workspace customization
	// const customLabel = workspaceLabels?.[circleType ?? CIRCLE_TYPES.HIERARCHY];
	// return customLabel ?? DEFAULT_LEAD_LABELS[circleType ?? CIRCLE_TYPES.HIERARCHY];
}

/**
 * Get Lead description for display in UI
 * MVP: Returns default description
 * Phase 4+: Will check workspaceOrgSettings first
 */
export function getLeadDescription(
	circleType: CircleType | null | undefined,
	_workspaceDescriptions?: Record<CircleType, string> // Unused in MVP, ready for Phase 4+
): string {
	return DEFAULT_LEAD_DESCRIPTIONS[circleType ?? CIRCLE_TYPES.HIERARCHY];
}

/**
 * Get UI config (emoji, badge) for authority level
 */
export function getAuthorityUI(authorityLevel: AuthorityLevel): { emoji: string; badge: string } {
	return AUTHORITY_LEVEL_UI[authorityLevel];
}

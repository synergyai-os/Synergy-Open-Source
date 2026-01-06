/**
 * Lead Authority Constants
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
 * import { LEAD_AUTHORITY, DEFAULT_LEAD_AUTHORITY_LABELS } from '$lib/infrastructure/organizational-model/constants';
 *
 * const leadAuthority = LEAD_AUTHORITY.DECIDES;
 * const label = DEFAULT_LEAD_AUTHORITY_LABELS[LEAD_AUTHORITY.DECIDES]; // "Decides"
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

// Default labels (used when workspace labels not configured)
export const DEFAULT_LEAD_AUTHORITY_LABELS: Record<LeadAuthority, string> = {
	[LEAD_AUTHORITY.DECIDES]: 'Decides',
	[LEAD_AUTHORITY.FACILITATES]: 'Facilitates',
	[LEAD_AUTHORITY.CONVENES]: 'Convenes'
} as const;

export const DEFAULT_LEAD_AUTHORITY_DESCRIPTIONS: Record<LeadAuthority, string> = {
	[LEAD_AUTHORITY.DECIDES]: 'Lead makes decisions for the circle',
	[LEAD_AUTHORITY.FACILITATES]: 'Lead facilitates team decisions',
	[LEAD_AUTHORITY.CONVENES]: 'Lead convenes gatherings, no decision authority'
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
 * Type guard: Check if value is a valid LeadAuthority
 */
export function isLeadAuthority(value: string): value is LeadAuthority {
	return Object.values(LEAD_AUTHORITY).includes(value as LeadAuthority);
}

// ============================================================================
// Authority Levels (SYOS-670: Circle Lead Authority)
// ============================================================================

/**
 * System-defined authority levels for Lead roles.
 * Note: LeadAuthority values directly map to authority levels (no conversion needed).
 */
export const AUTHORITY_LEVELS = {
	DECIDES: 'decides',
	FACILITATES: 'facilitates',
	CONVENES: 'convenes'
} as const;

export type AuthorityLevel = (typeof AUTHORITY_LEVELS)[keyof typeof AUTHORITY_LEVELS];

/**
 * Lead Requirement by Lead Authority (system behavior)
 * Determines if a Lead role is required when creating a circle.
 */
export const DEFAULT_LEAD_REQUIRED: Record<LeadAuthority, boolean> = {
	[LEAD_AUTHORITY.DECIDES]: true,
	[LEAD_AUTHORITY.FACILITATES]: false,
	[LEAD_AUTHORITY.CONVENES]: false
} as const;

// ============================================================================
// Default Labels (Fallback when workspace doesn't customize)
// ============================================================================

/**
 * Default Lead role labels by lead authority
 * MVP: Returns default label
 * Phase 4+: Will check workspaceOrgSettings.leadLabelByAuthority first
 */
export const DEFAULT_LEAD_LABELS: Record<LeadAuthority, string> = {
	[LEAD_AUTHORITY.DECIDES]: 'Manager',
	[LEAD_AUTHORITY.FACILITATES]: 'Coordinator',
	[LEAD_AUTHORITY.CONVENES]: 'Steward'
} as const;

/**
 * Default Lead role descriptions by lead authority
 * MVP: Returns default description
 * Phase 4+: Will check workspaceOrgSettings first
 */
export const DEFAULT_LEAD_DESCRIPTIONS: Record<LeadAuthority, string> = {
	[LEAD_AUTHORITY.DECIDES]: 'Makes final decisions for this circle',
	[LEAD_AUTHORITY.FACILITATES]: 'Coordinates the team. Team decides together using consent.',
	[LEAD_AUTHORITY.CONVENES]: 'Organizes gatherings. Decisions are made in home circles.'
} as const;

/**
 * UI configuration for authority levels (emoji + badge text)
 */
export const AUTHORITY_LEVEL_UI: Record<AuthorityLevel, { emoji: string; badge: string }> = {
	[AUTHORITY_LEVELS.DECIDES]: { emoji: '👔', badge: 'Decides' },
	[AUTHORITY_LEVELS.FACILITATES]: { emoji: '🤝', badge: 'Facilitates' },
	[AUTHORITY_LEVELS.CONVENES]: { emoji: '🌱', badge: 'Convenes' }
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get Lead authority level from leadAuthority value
 * Note: Since leadAuthority IS the authority level, this is an identity function
 * @returns The leadAuthority value as an AuthorityLevel
 */
export function getLeadAuthorityLevel(
	leadAuthority: LeadAuthority | null | undefined
): AuthorityLevel {
	return (leadAuthority ?? LEAD_AUTHORITY.DECIDES) as AuthorityLevel;
}

/**
 * Get Lead label for display in UI
 * MVP: Returns default label
 * Phase 4+: Will check workspaceOrgSettings.leadLabelByAuthority first
 */
export function getLeadLabel(
	leadAuthority: LeadAuthority | null | undefined,
	_workspaceLabels?: Record<LeadAuthority, string> // Unused in MVP, ready for Phase 4+
): string {
	// MVP: Just return default
	return DEFAULT_LEAD_LABELS[leadAuthority ?? LEAD_AUTHORITY.DECIDES];

	// Phase 4+: Uncomment to enable workspace customization
	// const customLabel = workspaceLabels?.[leadAuthority ?? LEAD_AUTHORITY.DECIDES];
	// return customLabel ?? DEFAULT_LEAD_LABELS[leadAuthority ?? LEAD_AUTHORITY.DECIDES];
}

/**
 * Get Lead description for display in UI
 * MVP: Returns default description
 * Phase 4+: Will check workspaceOrgSettings first
 */
export function getLeadDescription(
	leadAuthority: LeadAuthority | null | undefined,
	_workspaceDescriptions?: Record<LeadAuthority, string> // Unused in MVP, ready for Phase 4+
): string {
	return DEFAULT_LEAD_DESCRIPTIONS[leadAuthority ?? LEAD_AUTHORITY.DECIDES];
}

/**
 * Get UI config (emoji, badge) for authority level
 */
export function getAuthorityUI(authorityLevel: AuthorityLevel): { emoji: string; badge: string } {
	return AUTHORITY_LEVEL_UI[authorityLevel];
}

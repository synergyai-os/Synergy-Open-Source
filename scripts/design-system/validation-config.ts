/**
 * Token Validation Configuration
 *
 * This config MUST match design-system.md Section 2.4 (Token Consumption Patterns).
 * If you need to change this, update the documentation FIRST.
 *
 * CRITICAL: This config is the single source of truth for validation.
 * Modifying the validation script to pass tests is an ARCHITECTURE VIOLATION.
 *
 * @see dev-docs/master-docs/design-system.md Section 2.4
 */

/**
 * Tokens consumed via direct var() - no utilities needed
 *
 * These tokens are used directly in JavaScript/CSS and don't require
 * @utility definitions. See design-system.md Section 2.4 for rationale.
 */
export const DIRECT_VAR_CONSUMED = {
	/**
	 * Breakpoints used in JavaScript for responsive logic
	 * Example: var(--breakpoint-md)
	 */
	breakpoints: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],

	/**
	 * Opacity values used dynamically with colors
	 * Example: var(--opacity-50)
	 */
	opacity: [
		'0',
		'5',
		'10',
		'15',
		'20',
		'25',
		'30',
		'40',
		'50',
		'60',
		'70',
		'75',
		'80',
		'90',
		'95',
		'100',
		'disabled'
	],

	/**
	 * Syntax highlighting colors used in code blocks
	 * Example: var(--color-syntax-keyword)
	 * Note: Handles both --color-syntax-keyword and --color-syntax-keyword-light/dark variants
	 */
	syntax: ['keyword', 'string', 'comment', 'function', 'variable', 'operator', 'number']
} as const;

/**
 * Token categories that MUST be consumed via utility classes
 *
 * These categories require @utility definitions in src/styles/utilities/*.css.
 * If a token in these categories doesn't have a utility, validation fails.
 *
 * Note: We don't list individual tokens here because:
 * 1. The list would be too long and hard to maintain
 * 2. Validation checks for @utility definitions dynamically
 * 3. This serves as documentation of expected consumption patterns
 */
export const UTILITY_CONSUMED_CATEGORIES = {
	/**
	 * Semantic color tokens consumed via utility classes
	 * Examples: bg-surface, text-primary, border-default
	 * Pattern: bg-{token}, text-{token}, border-{token}
	 */
	colors: 'semantic color tokens (bg-*, text-*, border-*)',

	/**
	 * Spacing tokens consumed via utility classes
	 * Examples: px-button, py-input, gap-section
	 * Pattern: px-{token}, py-{token}, gap-{token}
	 */
	spacing: 'spacing tokens (px-*, py-*, gap-*)',

	/**
	 * Typography tokens consumed via utility classes
	 * Examples: text-h1, text-body, text-label
	 * Pattern: text-{token}
	 */
	typography: 'typography tokens (text-*)',

	/**
	 * Border radius tokens consumed via utility classes
	 * Examples: rounded-button, rounded-card, rounded-input
	 * Pattern: rounded-{token}
	 */
	radius: 'border radius tokens (rounded-*)',

	/**
	 * Shadow tokens consumed via utility classes
	 * Examples: shadow-card, shadow-modal, shadow-dropdown
	 * Pattern: shadow-{token}
	 */
	shadows: 'shadow tokens (shadow-*)'
} as const;

/**
 * Base tokens that are intentionally unused
 *
 * These tokens are only valid if referenced by semantic tokens.
 * They should never be consumed directly in components.
 */
export const BASE_ONLY_CATEGORIES = {
	/**
	 * Base neutral color scale (0-1000)
	 * Only valid if referenced by semantic tokens
	 */
	neutral: 'base neutral colors (0-1000)',

	/**
	 * Base brand colors
	 * Only valid if referenced by semantic tokens
	 */
	brand: 'base brand colors (primary, secondary, etc.)',

	/**
	 * Base status colors
	 * Only valid if referenced by semantic tokens
	 */
	status: 'base status colors (error, warning, success, info)'
} as const;

/**
 * Validation configuration export
 */
export const VALIDATION_CONFIG = {
	directVarConsumed: DIRECT_VAR_CONSUMED,
	utilityConsumedCategories: UTILITY_CONSUMED_CATEGORIES,
	baseOnlyCategories: BASE_ONLY_CATEGORIES
} as const;

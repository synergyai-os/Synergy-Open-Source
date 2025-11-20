/**
 * Feature Flag Constants
 *
 * Central registry for system-level feature flags.
 * Module-specific flags are in their respective module folders.
 *
 * Naming Convention: <AREA>_<FEATURE>_<STATUS>
 * - AREA: notes, inbox, sync, etc.
 * - FEATURE: What it does
 * - STATUS: beta, dev, rollout, etc.
 *
 * @example
 * ```typescript
 * import { FeatureFlags } from '$lib/infrastructure/feature-flags';
 * const enabled = await checkFlag(FeatureFlags.NOTES_PROSEMIRROR_BETA, userId);
 * ```
 */

export const FeatureFlags = {
	// === Notes Module ===
	/**
	 * Example: New ProseMirror-based notes editor
	 * Status: Not yet implemented
	 */
	NOTES_PROSEMIRROR_BETA: 'notes_prosemirror_beta'
} as const;

/**
 * Type for feature flag keys
 */
export type FeatureFlagKey = (typeof FeatureFlags)[keyof typeof FeatureFlags];

/**
 * Flag descriptions map - extracted from JSDoc comments
 * Used as fallback when DB doesn't have a description
 */
export const FlagDescriptions: Record<FeatureFlagKey, string> = {
	[FeatureFlags.NOTES_PROSEMIRROR_BETA]:
		'ProseMirror Notes Editor - Replaces the current notes editor with a ProseMirror-based rich text editor featuring improved formatting, collaboration, and performance.'
};

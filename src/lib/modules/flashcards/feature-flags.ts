/**
 * Flashcards Module Feature Flags
 *
 * Feature flags specific to the flashcards module.
 * System-level flags are in `$lib/infrastructure/feature-flags`.
 *
 * Currently no module-specific flags.
 */

export const FlashcardsFeatureFlags = {} as const;

export type FlashcardsFeatureFlagKey =
	(typeof FlashcardsFeatureFlags)[keyof typeof FlashcardsFeatureFlags];

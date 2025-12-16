/**
 * Feature Flag Constants
 *
 * All feature flags have been removed - core features are always enabled.
 * This file is kept for backward compatibility but exports empty objects.
 */

export const FeatureFlags = {} as const;

/**
 * Type for feature flag keys
 */
export type FeatureFlagKey = (typeof FeatureFlags)[keyof typeof FeatureFlags];

/**
 * Flag descriptions map - empty since all flags removed
 */
export const FlagDescriptions: Record<string, string> = {};

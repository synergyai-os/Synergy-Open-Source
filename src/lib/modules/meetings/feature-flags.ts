/**
 * Meetings Module Feature Flags
 *
 * All feature flags have been removed - meetings is a core feature, always enabled.
 * This file is kept for backward compatibility but exports empty objects.
 */

export const MeetingsFeatureFlags = {} as const;

export type MeetingsFeatureFlagKey =
	(typeof MeetingsFeatureFlags)[keyof typeof MeetingsFeatureFlags];

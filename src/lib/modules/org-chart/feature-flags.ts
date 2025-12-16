/**
 * Org Chart Module Feature Flags
 *
 * All feature flags have been removed - org chart is a core feature, always enabled.
 * This file is kept for backward compatibility but exports empty objects.
 */

export const OrgChartFeatureFlags = {} as const;

export type OrgChartFeatureFlagKey =
	(typeof OrgChartFeatureFlags)[keyof typeof OrgChartFeatureFlags];

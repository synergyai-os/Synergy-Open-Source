/**
 * Org Chart Module Feature Flags
 *
 * Feature flags specific to the org-chart module.
 * System-level flags are in `$lib/infrastructure/feature-flags`.
 */

export const OrgChartFeatureFlags = {
	/**
	 * Organization Module Beta
	 * Status: Phase 1 - Always visible (100% rollout)
	 * Controls: Org creation, org settings, team management
	 * Note: May be deprecated in favor of default organization features.
	 */
	ORG_MODULE_BETA: 'org_module_beta'
} as const;

export type OrgChartFeatureFlagKey =
	(typeof OrgChartFeatureFlags)[keyof typeof OrgChartFeatureFlags];

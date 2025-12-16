/**
 * Projects Module Feature Flags
 *
 * All feature flags have been removed - projects will be a core feature when implemented.
 * This file is kept for backward compatibility but exports empty objects.
 */

export const ProjectsFeatureFlags = {} as const;

export type ProjectsFeatureFlagKey =
	(typeof ProjectsFeatureFlags)[keyof typeof ProjectsFeatureFlags];

/**
 * Projects Module Feature Flags
 *
 * Feature flags specific to the projects module.
 * System-level flags are in `$lib/infrastructure/feature-flags`.
 */

export const ProjectsFeatureFlags = {
	/**
	 * Projects Module
	 * Status: 🚧 Planned (not yet implemented)
	 * Controls: Full projects module access (projects routes + dashboard)
	 */
	PROJECTS_MODULE: 'projects-module'
} as const;

export type ProjectsFeatureFlagKey =
	(typeof ProjectsFeatureFlags)[keyof typeof ProjectsFeatureFlags];

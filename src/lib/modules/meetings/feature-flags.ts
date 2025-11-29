/**
 * Meetings Module Feature Flags
 *
 * Feature flags specific to the meetings module.
 * System-level flags are in `$lib/infrastructure/feature-flags`.
 */

export const MeetingsFeatureFlags = {
	/**
	 * Meeting Module Beta
	 * Status: Phase 2 - Progressive rollout (starts with Randy only)
	 * Controls: Meeting creation, meeting list, meeting details
	 * Note: Legacy flag, replaced by MEETINGS_MODULE flag. Consider removing if no longer needed.
	 */
	MEETING_MODULE_BETA: 'meeting_module_beta',

	/**
	 * Meeting Integrations Beta
	 * Status: Phase 3 - Disabled (future rollout)
	 * Controls: Calendar sync, video call integration
	 */
	MEETING_INTEGRATIONS_BETA: 'meeting_integrations_beta',

	/**
	 * Meetings Module (SYOS-226)
	 * Status: Enabled for specific workspaces
	 * Controls: Full meetings module access (meetings routes + dashboard)
	 */
	MEETINGS_MODULE: 'meetings-module'
} as const;

export type MeetingsFeatureFlagKey =
	(typeof MeetingsFeatureFlags)[keyof typeof MeetingsFeatureFlags];

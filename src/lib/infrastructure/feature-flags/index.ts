/**
 * Feature Flags Infrastructure
 *
 * Central export point for feature flags infrastructure.
 * Module-specific flags are in their respective module folders.
 *
 * @example
 * ```typescript
 * import { FeatureFlags, useFeatureFlag, getFlagDescription } from '$lib/infrastructure/feature-flags';
 * ```
 */

// Constants (exported individually, combined export below)
export {
	FeatureFlags as SystemFeatureFlags,
	FlagDescriptions as SystemFlagDescriptions
} from './constants';
export type { FeatureFlagKey as SystemFeatureFlagKey } from './constants';

// Types
export type { FeatureFlagConfig, FeatureFlagRule } from './types';

// Composable
export { useFeatureFlag } from './composables/useFeatureFlag.svelte';

// Utilities
export { getFlagDescription, getUserRolloutBucket, isInRollout, isAllowedDomain } from './utils';

// Combined FeatureFlags export (includes all module flags for backward compatibility)
import {
	FeatureFlags as SystemFlags,
	FlagDescriptions as SystemFlagDescriptions
} from './constants';
import { InboxFeatureFlags } from '../../modules/inbox/feature-flags';
import { MeetingsFeatureFlags } from '../../modules/meetings/feature-flags';
import { OrgChartFeatureFlags } from '../../modules/org-chart/feature-flags';

/**
 * Combined FeatureFlags object including all system and module flags.
 * For backward compatibility - prefer importing from specific modules.
 *
 * @deprecated Use module-specific flag exports when possible:
 * - System flags: `$lib/infrastructure/feature-flags`
 * - Inbox flags: `$lib/modules/inbox/feature-flags`
 * - Meetings flags: `$lib/modules/meetings/feature-flags`
 * - Org Chart flags: `$lib/modules/org-chart/feature-flags`
 */
export const FeatureFlags = {
	...SystemFlags,
	...InboxFeatureFlags,
	...MeetingsFeatureFlags,
	...OrgChartFeatureFlags
} as const;

/**
 * Combined FeatureFlagKey type including all system and module flags.
 */
export type FeatureFlagKey = (typeof FeatureFlags)[keyof typeof FeatureFlags];

/**
 * Combined FlagDescriptions including all system and module flag descriptions.
 * Used as fallback when DB doesn't have a description.
 */
export const FlagDescriptions: Record<string, string> = {
	...SystemFlagDescriptions,
	// Inbox module flags
	[InboxFeatureFlags.INBOX_BATCH_ACTIONS_DEV]:
		'Inbox Batch Actions - Enables multi-select functionality in the inbox: select multiple items, bulk archive, bulk delete, bulk tag, and bulk move to folders.',
	[InboxFeatureFlags.SYNC_READWISE_V2_ROLLOUT]:
		'Readwise Sync v2 - Upgrades Readwise integration with improved error handling, retry logic, and sync reliability. Automatically handles failed syncs and provides better status reporting.',
	// Meetings module flags
	[MeetingsFeatureFlags.MEETING_MODULE_BETA]:
		'Meeting Module Beta - Legacy flag for meeting features. Note: Replaced by MEETINGS_MODULE flag. Consider removing if no longer needed.',
	[MeetingsFeatureFlags.MEETING_INTEGRATIONS_BETA]:
		'Meeting Integrations Beta - Enables calendar synchronization (import/export meetings) and video call platform integrations (Zoom, Google Meet, etc.).',
	[MeetingsFeatureFlags.MEETINGS_MODULE]:
		'Meetings Module - Grants access to the meetings feature set: /meetings page (list, create, edit meetings), /dashboard (upcoming meetings), and meeting-related navigation. Users without this flag are redirected away from meetings pages.',
	// Org Chart module flags
	[OrgChartFeatureFlags.ORG_MODULE_BETA]:
		'Organization Module Beta - Enables workspace creation, workspace settings, and team management features. Note: May be deprecated in favor of default workspace features.'
};

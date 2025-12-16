/**
 * Feature Flags Infrastructure
 *
 * All feature flags have been removed - core features are always enabled.
 * This file is kept for backward compatibility but exports empty objects.
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
 * Empty since all flags have been removed.
 *
 * @deprecated All feature flags have been removed - core features are always enabled.
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
 * Empty since all flags have been removed.
 */
export const FlagDescriptions: Record<string, string> = {
	...SystemFlagDescriptions
};

/**
 * Feature Flag System
 *
 * Central registry for all feature flags in the application.
 * Use these constants instead of hard-coded strings to ensure type safety.
 *
 * Naming Convention: <AREA>_<FEATURE>_<STATUS>
 * - AREA: notes, inbox, sync, etc.
 * - FEATURE: What it does
 * - STATUS: beta, dev, rollout, etc.
 *
 * @example
 * ```typescript
 * import { FeatureFlags } from '$lib/featureFlags';
 * const enabled = await checkFlag(FeatureFlags.NOTES_PROSEMIRROR_BETA, userId);
 * ```
 */

export const FeatureFlags = {
	// === Organization & Meeting Modules (SYOS-169) ===
	/**
	 * Organization Module Beta
	 * Status: Phase 1 - Always visible (100% rollout)
	 * Controls: Org creation, org settings, team management
	 */
	ORG_MODULE_BETA: 'org_module_beta',

	/**
	 * Meeting Module Beta
	 * Status: Phase 2 - Progressive rollout (starts with Randy only)
	 * Controls: Meeting creation, meeting list, meeting details
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
	 * Status: Enabled for specific organizations
	 * Controls: Full meetings module access (meetings routes + dashboard)
	 */
	MEETINGS_MODULE: 'meetings-module',

	// === Examples (Not Yet Implemented) ===
	/**
	 * Example: New ProseMirror-based notes editor
	 * Status: Not yet implemented
	 */
	NOTES_PROSEMIRROR_BETA: 'notes_prosemirror_beta',

	/**
	 * Example: Batch actions in inbox (select multiple, archive all, etc.)
	 * Status: Not yet implemented
	 */
	INBOX_BATCH_ACTIONS_DEV: 'inbox_batch_actions_dev',

	/**
	 * Example: Readwise sync v2 with improved error handling
	 * Status: Not yet implemented
	 */
	SYNC_READWISE_V2_ROLLOUT: 'sync_readwise_v2_rollout'
} as const;

/**
 * Type for feature flag keys
 */
export type FeatureFlagKey = (typeof FeatureFlags)[keyof typeof FeatureFlags];

/**
 * Flag descriptions map - extracted from JSDoc comments
 * Used as fallback when DB doesn't have a description
 */
export const FlagDescriptions: Record<FeatureFlagKey, string> = {
	[FeatureFlags.ORG_MODULE_BETA]:
		'Organization Module Beta - Controls org creation, org settings, and team management',
	[FeatureFlags.MEETING_MODULE_BETA]:
		'Meeting Module Beta - Controls meeting creation, meeting list, and meeting details',
	[FeatureFlags.MEETING_INTEGRATIONS_BETA]:
		'Meeting Integrations Beta - Controls calendar sync and video call integration',
	[FeatureFlags.MEETINGS_MODULE]:
		'Meetings Module - Full meetings module access including meetings routes and dashboard',
	[FeatureFlags.NOTES_PROSEMIRROR_BETA]:
		'New ProseMirror-based notes editor - Modern rich text editing experience',
	[FeatureFlags.INBOX_BATCH_ACTIONS_DEV]:
		'Batch actions in inbox - Select multiple items, archive all, etc.',
	[FeatureFlags.SYNC_READWISE_V2_ROLLOUT]:
		'Readwise sync v2 - Improved error handling and sync reliability'
};

/**
 * Get description for a flag (from DB or fallback to constants)
 */
export function getFlagDescription(flag: string, dbDescription?: string | null): string {
	if (dbDescription) return dbDescription;
	return FlagDescriptions[flag as FeatureFlagKey] || 'No description available';
}

/**
 * Feature flag configuration
 */
export interface FeatureFlagConfig {
	/** Unique flag identifier */
	flag: FeatureFlagKey;
	/** User ID to check flag for */
	userId?: string;
	/** User email for domain-based checks */
	userEmail?: string;
	/** Check if user is team member */
	isTeamMember?: boolean;
}

/**
 * Feature flag targeting rules
 */
export interface FeatureFlagRule {
	/** Flag identifier */
	flag: FeatureFlagKey;
	/** Is flag globally enabled? */
	enabled: boolean;
	/** Percentage of users to show (0-100) */
	rolloutPercentage?: number;
	/** Specific user IDs that should see this */
	allowedUserIds?: string[];
	/** Specific organization IDs that should see this (all members) */
	allowedOrganizationIds?: string[];
	/** Email domains that should see this (e.g., "@yourcompany.com") */
	allowedDomains?: string[];
	/** Created timestamp */
	createdAt?: number;
	/** Last updated timestamp */
	updatedAt?: number;
}

/**
 * Client-side feature flag hook
 * Use this in Svelte components to check flags
 * Automatically tracks flag checks to PostHog
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useFeatureFlag } from '$lib/featureFlags';
 *   import { FeatureFlags } from '$lib/featureFlags';
 *   import { useCurrentUser } from '$lib/composables/useCurrentUser';
 *
 *   const user = useCurrentUser();
 *   const showNewEditor = useFeatureFlag(FeatureFlags.NOTES_PROSEMIRROR_BETA, () => user()?._id);
 * </script>
 *
 * {#if $showNewEditor}
 *   <NewEditor />
 * {:else}
 *   <OldEditor />
 * {/if}
 * ```
 */
export function useFeatureFlag(
	flag: FeatureFlagKey,
	getUserId: () => string | undefined
): {
	subscribe: (handler: (value: boolean) => void) => () => void;
} {
	// Dynamic import to avoid SSR issues
	if (typeof window === 'undefined') {
		return {
			subscribe: (handler: (value: boolean) => void) => {
				handler(false);
				return () => {};
			}
		};
	}

	// Use dynamic import for client-only code
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { useQuery } = require('convex-svelte');
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { api } = require('$lib/convex');
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { reportFeatureFlagCheck } = require('$lib/utils/errorReporting');

	const userId = getUserId();
	const flagQuery = useQuery(api.featureFlags.checkFlag, () =>
		userId ? { flag, userId } : 'skip'
	);

	let lastValue: boolean | undefined = undefined;

	return {
		subscribe: (handler: (value: boolean) => void) => {
			const unsubscribe = flagQuery.subscribe((queryResult) => {
				const enabled = queryResult?.data ?? false;

				// Track to PostHog when value changes
				if (lastValue !== enabled && userId) {
					reportFeatureFlagCheck(flag, enabled, userId, {
						rollout_percentage: undefined, // Could fetch from flag config if needed
						evaluation_method: 'client_query'
					});
					lastValue = enabled;
				}

				handler(enabled);
			});

			return unsubscribe;
		}
	};
}

/**
 * Hash function for consistent percentage-based rollouts
 * Same user + same flag = same result every time
 *
 * @param userId - User identifier
 * @param flag - Feature flag name
 * @returns Number between 0 and 99 (for percentage comparison)
 */
export function getUserRolloutBucket(userId: string, flag: string): number {
	let hash = 0;
	const str = `${userId}:${flag}`;

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	return Math.abs(hash) % 100;
}

/**
 * Check if user is in rollout percentage
 *
 * @example
 * ```typescript
 * // User will consistently be in or out based on their ID
 * const inRollout = isInRollout(userId, flagName, 10); // 10% rollout
 * ```
 */
export function isInRollout(userId: string, flag: string, percentage: number): boolean {
	if (percentage >= 100) return true;
	if (percentage <= 0) return false;

	const bucket = getUserRolloutBucket(userId, flag);
	return bucket < percentage;
}

/**
 * Check if email matches allowed domains
 *
 * @example
 * ```typescript
 * isAllowedDomain('user@acme.com', ['@acme.com']) // true
 * isAllowedDomain('user@gmail.com', ['@acme.com']) // false
 * ```
 */
export function isAllowedDomain(email: string, allowedDomains: string[]): boolean {
	return allowedDomains.some((domain) => email.endsWith(domain));
}

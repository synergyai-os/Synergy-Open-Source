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
	SYNC_READWISE_V2_ROLLOUT: 'sync_readwise_v2_rollout',
} as const;

/**
 * Type for feature flag keys
 */
export type FeatureFlagKey = (typeof FeatureFlags)[keyof typeof FeatureFlags];

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
 * 
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useFeatureFlag } from '$lib/featureFlags';
 *   import { FeatureFlags } from '$lib/featureFlags';
 *   
 *   const showNewEditor = useFeatureFlag(FeatureFlags.NOTES_PROSEMIRROR_BETA);
 * </script>
 * 
 * {#if $showNewEditor}
 *   <NewEditor />
 * {:else}
 *   <OldEditor />
 * {/if}
 * ```
 */
export function useFeatureFlag(flag: FeatureFlagKey) {
	// This is a placeholder - actual implementation will use Convex query
	// Will be implemented with: useQuery(api.featureFlags.checkFlag, () => ({ flag, userId }))
	return {
		subscribe: (handler: (value: boolean) => void) => {
			// Placeholder: always return false until Convex integration is complete
			handler(false);
			return () => {};
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
	return allowedDomains.some(domain => email.endsWith(domain));
}


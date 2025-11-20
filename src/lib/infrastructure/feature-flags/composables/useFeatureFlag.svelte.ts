import type { FeatureFlagKey } from '../index';

/**
 * Client-side feature flag hook
 * Use this in Svelte components to check flags
 * Automatically tracks flag checks to PostHog
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useFeatureFlag } from '$lib/infrastructure/feature-flags';
 *   import { FeatureFlags } from '$lib/infrastructure/feature-flags';
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

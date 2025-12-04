/**
 * Composable for checking quick edit permission
 *
 * Provides reactive permission checking for quick edit mode.
 * Follows Svelte 5 composable patterns with function parameters for reactivity.
 *
 * Pattern matches usePermissions.svelte.ts - uses function parameters for reactive inputs
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api } from '$lib/convex';
import type { CircleSummary } from '../types';

export interface UseQuickEditPermissionParams {
	circle: () => CircleSummary | null;
	sessionId: () => string | undefined;
	/** Pre-loaded workspace setting - if false, skip backend check entirely */
	allowQuickChanges?: () => boolean;
}

export interface UseQuickEditPermissionReturn {
	get canEdit(): boolean;
	get editReason(): string | undefined;
	get isLoading(): boolean;
	get error(): unknown;
}

/**
 * Hook to check quick edit permission reactively
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useQuickEditPermission } from '$lib/modules/org-chart/composables/useQuickEditPermission.svelte';
 *
 *   const permission = useQuickEditPermission({
 *     circle: () => orgChart?.selectedCircle ?? null,
 *     sessionId: () => $page.data.sessionId
 *   });
 * </script>
 *
 * {#if permission.canEdit}
 *   <InlineEditText ... />
 * {/if}
 * ```
 */
export function useQuickEditPermission(
	params: UseQuickEditPermissionParams
): UseQuickEditPermissionReturn {
	// Fast path: If allowQuickChanges is provided and false, skip backend check entirely
	// This provides instant "no edit" determination without any network delay
	const quickCheckDisabled = $derived(
		params.allowQuickChanges !== undefined && params.allowQuickChanges() === false
	);

	// Query permission check from Convex
	// CRITICAL: Wrap in $derived to make query creation reactive!
	// Only create query if quick edits are allowed at workspace level
	const canEditQuery = $derived(
		browser && !quickCheckDisabled && params.circle() && params.sessionId()
			? useQuery(api.orgChartPermissions.canQuickEditQuery, () => {
					const circle = params.circle();
					const sessionId = params.sessionId();
					if (!circle || !sessionId) {
						throw new Error('Circle and sessionId required');
					}
					return {
						sessionId,
						circleId: circle.circleId
					};
				})
			: null
	);

	// Derived values (using different names to avoid conflict with getters)
	// Fast path: If quick edits disabled at workspace level, canEdit is always false
	const canEditValue = $derived(
		quickCheckDisabled
			? false
			: canEditQuery?.error
				? false
				: (canEditQuery?.data?.allowed ?? false)
	);
	const editReasonValue = $derived(
		quickCheckDisabled
			? 'Quick edits disabled. Use "Edit circle" to create a proposal.'
			: canEditQuery?.error
				? undefined
				: canEditQuery?.data?.reason
	);
	// Not loading if we already know quick edits are disabled
	const isLoadingValue = $derived(quickCheckDisabled ? false : (canEditQuery?.isLoading ?? false));
	const errorValue = $derived(canEditQuery?.error ?? null);

	// Return with getters for reactivity
	return {
		get canEdit() {
			return canEditValue;
		},
		get editReason() {
			return editReasonValue;
		},
		get isLoading() {
			return isLoadingValue;
		},
		get error() {
			return errorValue;
		}
	};
}

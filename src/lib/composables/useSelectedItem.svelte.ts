/**
 * Composable for selected item logic
 * Extracted from inbox +page.svelte to improve maintainability
 */

import { browser } from '$app/environment';
import type { ConvexClient, InboxApi, InboxItemWithDetails } from '$lib/types/convex';

export interface UseSelectedItemReturn {
	get selectedItemId(): string | null;
	get selectedItem(): InboxItemWithDetails | null;
	selectItem: (itemId: string) => void;
	clearSelection: () => void;
}

export function useSelectedItem(
	convexClient: ConvexClient | null,
	inboxApi: InboxApi | null,
	getSessionId: () => string | undefined
): UseSelectedItemReturn {
	// Selected item state
	const state = $state({
		selectedItemId: null as string | null,
		selectedItem: null as InboxItemWithDetails | null
	});

	// Query tracking for race condition prevention
	let currentQueryId: string | null = null;

	// Load selected item details with proper cleanup to prevent race conditions
	// Uses query tracking to ignore stale results when selectedItemId changes
	$effect(() => {
		if (!browser || !convexClient || !inboxApi || !state.selectedItemId) {
			state.selectedItem = null;
			currentQueryId = null;
			return;
		}

		const sessionId = getSessionId();
		if (!sessionId) {
			state.selectedItem = null;
			currentQueryId = null;
			return;
		}

		// Generate unique ID for this query
		const queryId = state.selectedItemId;
		currentQueryId = queryId;

		// Load item details
		convexClient
			.query(inboxApi.getInboxItemWithDetails, {
				sessionId,
				inboxItemId: state.selectedItemId
			})
			.then((result) => {
				// Only update if this is still the current query (prevent race conditions)
				if (currentQueryId === queryId) {
					state.selectedItem = result as InboxItemWithDetails | null;
				}
			})
			.catch((error) => {
				// Only handle error if this is still the current query
				if (currentQueryId === queryId) {
					console.error('Failed to load item details:', error);
					state.selectedItem = null;
				}
			});

		// Cleanup function: mark query as stale when effect re-runs or component unmounts
		return () => {
			if (currentQueryId === queryId) {
				currentQueryId = null;
			}
		};
	});

	// Functions
	function selectItem(itemId: string) {
		state.selectedItemId = itemId;
	}

	function clearSelection() {
		state.selectedItemId = null;
		state.selectedItem = null;
	}

	// Return state and functions using getters for reactivity
	return {
		// State - getters ensure reactivity is tracked
		get selectedItemId() {
			return state.selectedItemId;
		},
		get selectedItem() {
			return state.selectedItem;
		},
		// Functions
		selectItem,
		clearSelection
	};
}

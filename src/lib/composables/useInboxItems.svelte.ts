/**
 * Composable for inbox items data fetching
 * Extracted from inbox +page.svelte to improve maintainability
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api } from '$lib/convex';
import type { InboxItem } from '$lib/composables/useKeyboardNavigation.svelte';

type InboxItemType = 'readwise_highlight' | 'photo_note' | 'manual_text';

export interface UseInboxItemsReturn {
	get filterType(): InboxItemType | 'all';
	get inboxItems(): InboxItem[];
	get isLoading(): boolean;
	get queryError(): unknown;
	get filteredItems(): InboxItem[];
	setFilter: (type: InboxItemType | 'all', onClearSelection?: () => void) => void;
}

export function useInboxItems(): UseInboxItemsReturn {
	// Filter state
	const state = $state({
		filterType: 'all' as InboxItemType | 'all'
	});

	// Use reactive query for real-time inbox items updates
	// This automatically subscribes to changes and updates when new items are added during sync
	const inboxQuery = browser ? useQuery(
		api.inbox.listInboxItems,
		() => state.filterType === 'all' 
			? { processed: false } 
			: { filterType: state.filterType, processed: false }
	) : null;

	// Derived state from query
	const inboxItems = $derived((inboxQuery?.data ?? []) as InboxItem[]);
	const isLoading = $derived(inboxQuery?.isLoading ?? false);
	const queryError = $derived(inboxQuery?.error ?? null);
	
	// Filtered items (currently just returns all items since filtering is done in query)
	const filteredItems = $derived(inboxItems);

	// Functions
	function setFilter(type: InboxItemType | 'all', onClearSelection?: () => void) {
		state.filterType = type;
		// Clear selection when changing filters (if callback provided)
		if (onClearSelection) {
			onClearSelection();
		}
	}

	// Return state and functions using getters for reactivity
	return {
		// State - getters ensure reactivity is tracked
		get filterType() { return state.filterType; },
		get inboxItems() { return inboxItems; },
		get isLoading() { return isLoading; },
		get queryError() { return queryError; },
		get filteredItems() { return filteredItems; },
		// Functions
		setFilter,
	};
}


/**
 * Composable for keyboard navigation logic
 * Extracted from inbox +page.svelte to improve maintainability
 */

import { browser } from '$app/environment';

// Type for inbox items - matches what InboxCard expects
// This is a flexible type that accepts the full structure from Convex queries
export type InboxItem = {
	_id: string;
	type: 'readwise_highlight' | 'photo_note' | 'manual_text';
	personId: string;
	workspaceId?: string | null;
	circleId?: string | null;
	processed: boolean;
	processedAt?: number;
	createdAt: number;
	title: string;
	snippet: string;
	tags: string[];
	// Type-specific fields (optional, as they depend on item.type)
	highlightId?: string;
	imageFileId?: string;
	text?: string;
	// Allow additional properties from Convex queries
	[key: string]: unknown;
};

export interface UseKeyboardNavigationReturn {
	navigateItems: (direction: 'up' | 'down') => void;
	getCurrentItemIndex: () => number;
	handleNextItem: () => void;
	handlePreviousItem: () => void;
}

export function useKeyboardNavigation(
	filteredItems: () => InboxItem[],
	selectedItemId: () => string | null,
	onSelectItem: (itemId: string) => void
): UseKeyboardNavigationReturn {
	// Navigate through inbox items (for keyboard navigation)
	function navigateItems(direction: 'up' | 'down') {
		const items = filteredItems();
		if (items.length === 0) return;

		const currentId = selectedItemId();
		const currentIndex = currentId ? items.findIndex((item) => item._id === currentId) : -1;

		let newIndex: number;

		if (currentIndex === -1) {
			// No item selected, select first or last
			newIndex = direction === 'down' ? 0 : items.length - 1;
		} else {
			// Move up or down
			if (direction === 'down') {
				newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0; // Wrap to start
			} else {
				newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1; // Wrap to end
			}
		}

		const newItem = items[newIndex];
		if (newItem) {
			// Clear any active hover states by blurring all items first
			document.querySelectorAll('[data-inbox-item-id]').forEach((el) => {
				if (el instanceof HTMLElement) {
					el.blur();
				}
			});

			onSelectItem(newItem._id);
			// Scroll item into view
			setTimeout(() => {
				const itemElement = document.querySelector(`[data-inbox-item-id="${newItem._id}"]`);
				itemElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}, 0);
		}
	}

	// Navigation helpers for detail view
	function getCurrentItemIndex(): number {
		const items = filteredItems();
		const currentId = selectedItemId();
		if (!currentId || items.length === 0) return -1;
		return items.findIndex((item) => item._id === currentId);
	}

	function handleNextItem() {
		navigateItems('down');
	}

	function handlePreviousItem() {
		navigateItems('up');
	}

	// Setup keyboard event listeners
	if (browser) {
		$effect(() => {
			// Keyboard navigation (J/K for down/up)
			function handleKeyDown(event: KeyboardEvent) {
				// Ignore if user is typing in input/textarea
				const activeElement = document.activeElement;
				const isInputFocused =
					activeElement?.tagName === 'INPUT' ||
					activeElement?.tagName === 'TEXTAREA' ||
					(activeElement instanceof HTMLElement && activeElement.isContentEditable);

				if (isInputFocused) return;

				// Handle J (down/next) and K (up/previous)
				if (event.key === 'j' || event.key === 'J') {
					event.preventDefault();
					navigateItems('down');
				} else if (event.key === 'k' || event.key === 'K') {
					event.preventDefault();
					navigateItems('up');
				}
			}

			window.addEventListener('keydown', handleKeyDown);

			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		});
	}

	// Return functions
	return {
		navigateItems,
		getCurrentItemIndex,
		handleNextItem,
		handlePreviousItem
	};
}

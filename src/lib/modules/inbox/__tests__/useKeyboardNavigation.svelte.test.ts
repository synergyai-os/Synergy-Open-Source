/**
 * Unit Tests for useKeyboardNavigation Composable
 *
 * Tests J/K navigation, wrapping behavior, and input focus detection.
 */

// Import mocks first (must be before other imports)
import '$tests/composables/test-utils/setupMocks.svelte';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InboxTestComponent from '$tests/composables/fixtures/InboxTestComponent.svelte';
import { setupBrowserMocks } from '$tests/composables/test-utils/mockBrowser.svelte';
import { setupPostHogMock } from '$tests/composables/test-utils/mockPostHog.svelte';
import { setupContextMocks } from '$tests/composables/test-utils/mockContext.svelte';
import type { UseKeyboardNavigationReturn } from '../composables/useKeyboardNavigation.svelte';
import type { InboxItem } from '../composables/useKeyboardNavigation.svelte';

// Helper type to access exported functions from Svelte component
type TestComponentInstance = {
	getKeyboardNavigationInstance: () => UseKeyboardNavigationReturn;
};

describe('useKeyboardNavigation - J/K Navigation', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setupBrowserMocks();
		setupPostHogMock();
		setupContextMocks();
	});

	it('should navigate down with J key', async () => {
		const mockItems: InboxItem[] = [
			{
				_id: 'item-1',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 1',
				snippet: 'Snippet 1',
				tags: []
			},
			{
				_id: 'item-2',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 2',
				snippet: 'Snippet 2',
				tags: []
			},
			{
				_id: 'item-3',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 3',
				snippet: 'Snippet 3',
				tags: []
			}
		];

		const onSelectItem = vi.fn();

		render(InboxTestComponent, {
			filteredItems: () => mockItems,
			selectedItemId: () => null,
			onSelectItem
		});

		// Simulate J key press
		const event = new KeyboardEvent('keydown', { key: 'j' });
		window.dispatchEvent(event);

		// Wait for event handler
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Should have selected first item
		expect(onSelectItem).toHaveBeenCalledWith('item-1');
	});

	it('should navigate up with K key', async () => {
		const mockItems: InboxItem[] = [
			{
				_id: 'item-1',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 1',
				snippet: 'Snippet 1',
				tags: []
			},
			{
				_id: 'item-2',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 2',
				snippet: 'Snippet 2',
				tags: []
			},
			{
				_id: 'item-3',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 3',
				snippet: 'Snippet 3',
				tags: []
			}
		];

		const onSelectItem = vi.fn();

		render(InboxTestComponent, {
			filteredItems: () => mockItems,
			selectedItemId: () => 'item-2',
			onSelectItem
		});

		// Simulate K key press
		const event = new KeyboardEvent('keydown', { key: 'k' });
		window.dispatchEvent(event);

		// Wait for event handler
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Should have selected previous item
		expect(onSelectItem).toHaveBeenCalledWith('item-1');
	});

	it('should not navigate when input is focused', async () => {
		const mockItems: InboxItem[] = [
			{
				_id: 'item-1',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 1',
				snippet: 'Snippet 1',
				tags: []
			},
			{
				_id: 'item-2',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 2',
				snippet: 'Snippet 2',
				tags: []
			}
		];

		const onSelectItem = vi.fn();

		render(InboxTestComponent, {
			filteredItems: () => mockItems,
			selectedItemId: () => null,
			onSelectItem
		});

		// Create and focus an input element
		const input = document.createElement('input');
		document.body.appendChild(input);
		input.focus();

		// Simulate J key press
		const event = new KeyboardEvent('keydown', { key: 'j' });
		window.dispatchEvent(event);

		// Wait for event handler
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Should not have navigated (input is focused)
		expect(onSelectItem).not.toHaveBeenCalled();

		// Cleanup
		document.body.removeChild(input);
	});

	it('should not navigate when textarea is focused', async () => {
		const mockItems: InboxItem[] = [
			{
				_id: 'item-1',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 1',
				snippet: 'Snippet 1',
				tags: []
			}
		];

		const onSelectItem = vi.fn();

		render(InboxTestComponent, {
			filteredItems: () => mockItems,
			selectedItemId: () => null,
			onSelectItem
		});

		// Create and focus a textarea element
		const textarea = document.createElement('textarea');
		document.body.appendChild(textarea);
		textarea.focus();

		// Simulate J key press
		const event = new KeyboardEvent('keydown', { key: 'j' });
		window.dispatchEvent(event);

		// Wait for event handler
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Should not have navigated (textarea is focused)
		expect(onSelectItem).not.toHaveBeenCalled();

		// Cleanup
		document.body.removeChild(textarea);
	});
});

describe('useKeyboardNavigation - Wrapping Behavior', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setupBrowserMocks();
		setupPostHogMock();
		setupContextMocks();
	});

	it('should wrap to first item when navigating down from last item', async () => {
		const mockItems: InboxItem[] = [
			{
				_id: 'item-1',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 1',
				snippet: 'Snippet 1',
				tags: []
			},
			{
				_id: 'item-2',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 2',
				snippet: 'Snippet 2',
				tags: []
			},
			{
				_id: 'item-3',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 3',
				snippet: 'Snippet 3',
				tags: []
			}
		];

		const onSelectItem = vi.fn();

		const screen = render(InboxTestComponent, {
			filteredItems: () => mockItems,
			selectedItemId: () => 'item-3',
			onSelectItem
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getKeyboardNavigationInstance();

		// Navigate down from last item
		composable.handleNextItem();

		// Wait for navigation
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Should wrap to first item
		expect(onSelectItem).toHaveBeenCalledWith('item-1');
	});

	it('should wrap to last item when navigating up from first item', async () => {
		const mockItems: InboxItem[] = [
			{
				_id: 'item-1',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 1',
				snippet: 'Snippet 1',
				tags: []
			},
			{
				_id: 'item-2',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 2',
				snippet: 'Snippet 2',
				tags: []
			},
			{
				_id: 'item-3',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 3',
				snippet: 'Snippet 3',
				tags: []
			}
		];

		const onSelectItem = vi.fn();

		const screen = render(InboxTestComponent, {
			filteredItems: () => mockItems,
			selectedItemId: () => 'item-1',
			onSelectItem
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getKeyboardNavigationInstance();

		// Navigate up from first item
		composable.handlePreviousItem();

		// Wait for navigation
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Should wrap to last item
		expect(onSelectItem).toHaveBeenCalledWith('item-3');
	});

	it('should select first item when navigating down with no selection', async () => {
		const mockItems: InboxItem[] = [
			{
				_id: 'item-1',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 1',
				snippet: 'Snippet 1',
				tags: []
			},
			{
				_id: 'item-2',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 2',
				snippet: 'Snippet 2',
				tags: []
			}
		];

		const onSelectItem = vi.fn();

		const screen = render(InboxTestComponent, {
			filteredItems: () => mockItems,
			selectedItemId: () => null,
			onSelectItem
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getKeyboardNavigationInstance();

		// Navigate down with no selection
		composable.handleNextItem();

		// Wait for navigation
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Should select first item
		expect(onSelectItem).toHaveBeenCalledWith('item-1');
	});

	it('should select last item when navigating up with no selection', async () => {
		const mockItems: InboxItem[] = [
			{
				_id: 'item-1',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 1',
				snippet: 'Snippet 1',
				tags: []
			},
			{
				_id: 'item-2',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 2',
				snippet: 'Snippet 2',
				tags: []
			}
		];

		const onSelectItem = vi.fn();

		const screen = render(InboxTestComponent, {
			filteredItems: () => mockItems,
			selectedItemId: () => null,
			onSelectItem
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getKeyboardNavigationInstance();

		// Navigate up with no selection
		composable.handlePreviousItem();

		// Wait for navigation
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Should select last item
		expect(onSelectItem).toHaveBeenCalledWith('item-2');
	});
});

describe('useKeyboardNavigation - Navigation Helpers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setupBrowserMocks();
		setupPostHogMock();
		setupContextMocks();
	});

	it('should return current item index', () => {
		const mockItems: InboxItem[] = [
			{
				_id: 'item-1',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 1',
				snippet: 'Snippet 1',
				tags: []
			},
			{
				_id: 'item-2',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 2',
				snippet: 'Snippet 2',
				tags: []
			},
			{
				_id: 'item-3',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 3',
				snippet: 'Snippet 3',
				tags: []
			}
		];

		const screen = render(InboxTestComponent, {
			filteredItems: () => mockItems,
			selectedItemId: () => 'item-2',
			onSelectItem: () => {}
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getKeyboardNavigationInstance();

		expect(composable.getCurrentItemIndex()).toBe(1);
	});

	it('should return -1 when no item is selected', () => {
		const mockItems: InboxItem[] = [
			{
				_id: 'item-1',
				type: 'readwise_highlight',
				personId: 'user-1',
				processed: false,
				createdAt: Date.now(),
				title: 'Item 1',
				snippet: 'Snippet 1',
				tags: []
			}
		];

		const screen = render(InboxTestComponent, {
			filteredItems: () => mockItems,
			selectedItemId: () => null,
			onSelectItem: () => {}
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getKeyboardNavigationInstance();

		expect(composable.getCurrentItemIndex()).toBe(-1);
	});

	it('should return -1 when items list is empty', () => {
		const mockItems: InboxItem[] = [];

		const screen = render(InboxTestComponent, {
			filteredItems: () => mockItems,
			selectedItemId: () => 'item-1',
			onSelectItem: () => {}
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getKeyboardNavigationInstance();

		expect(composable.getCurrentItemIndex()).toBe(-1);
	});

	it('should not navigate when items list is empty', async () => {
		const mockItems: InboxItem[] = [];

		const onSelectItem = vi.fn();

		const screen = render(InboxTestComponent, {
			filteredItems: () => mockItems,
			selectedItemId: () => null,
			onSelectItem
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getKeyboardNavigationInstance();

		// Try to navigate
		composable.handleNextItem();

		// Wait a bit
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Should not have called onSelectItem
		expect(onSelectItem).not.toHaveBeenCalled();
	});
});

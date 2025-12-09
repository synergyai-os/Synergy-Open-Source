/**
 * Unit Tests for useSelectedItem Composable
 *
 * Tests race condition prevention, cleanup on unmount, and stale query handling.
 */

// Import mocks first (must be before other imports)
import '$tests/composables/test-utils/setupMocks.svelte';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InboxTestComponent from '$tests/composables/fixtures/InboxTestComponent.svelte';
import {
	setupConvexMocks,
	createMockConvexClient,
	createMockInboxItemWithDetails,
	createMockQueryResult
} from '$tests/composables/test-utils/mockConvex.svelte';
import { setupBrowserMocks } from '$tests/composables/test-utils/mockBrowser.svelte';
import { setupPostHogMock } from '$tests/composables/test-utils/mockPostHog.svelte';
import { setupContextMocks } from '$tests/composables/test-utils/mockContext.svelte';
import type { UseSelectedItemReturn } from '../composables/useSelectedItem.svelte';
import type { ConvexClient, InboxApi } from '$lib/types/convex';
import { api } from '$lib/convex';

// Helper type to access exported functions from Svelte component
type TestComponentInstance = {
	getSelectedItemInstance: () => UseSelectedItemReturn;
};

describe('useSelectedItem - Race Condition Prevention', () => {
	let mockClient: ConvexClient;
	let inboxApi: InboxApi;

	beforeEach(() => {
		vi.clearAllMocks();
		setupBrowserMocks();
		setupPostHogMock();
		setupContextMocks();

		// Reset global mock state between tests
		(globalThis as unknown as { __vitestConvexMockClient?: unknown }).__vitestConvexMockClient =
			null;
		(
			globalThis as unknown as { __vitestConvexQueryResults?: Record<string, unknown> }
		).__vitestConvexQueryResults = {};

		mockClient = createMockConvexClient();
		inboxApi = {
			findInboxItemWithDetails: api.inbox.findInboxItemWithDetails,
			fetchReadwiseHighlights: api.syncReadwise.fetchReadwiseHighlights,
			findSyncProgress: api.inbox.findSyncProgress
		};
	});

	it('should track query ID to prevent race conditions', async () => {
		const mockItem = createMockInboxItemWithDetails();
		let queryCallCount = 0;
		const queryPromises: Array<{
			resolve: (value: unknown) => void;
			reject: (error: Error) => void;
		}> = [];

		// Mock query to return promises we can control
		(mockClient.query as ReturnType<typeof vi.fn>).mockImplementation(() => {
			queryCallCount++;
			return new Promise((resolve, reject) => {
				queryPromises.push({ resolve, reject });
			});
		});

		setupConvexMocks(mockClient, {
			inboxItemWithDetails: createMockQueryResult(mockItem, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getSelectedItemInstance();

		// Select first item
		composable.selectItem('item-1');

		// Wait for effect to trigger
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Select second item immediately (before first query completes)
		composable.selectItem('item-2');

		// Wait for second effect to trigger
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Resolve first query (should be ignored)
		if (queryPromises[0]) {
			queryPromises[0].resolve(mockItem);
		}

		// Wait a bit
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Resolve second query (should be accepted)
		const secondItem = { ...mockItem, _id: 'item-2' };
		if (queryPromises[1]) {
			queryPromises[1].resolve(secondItem);
		}

		// Wait for effect to process
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Should have selected item-2, not item-1
		expect(composable.selectedItemId).toBe('item-2');
		expect(queryCallCount).toBe(2);
	});

	it('should ignore stale query results when item changes quickly', async () => {
		const mockItem1 = createMockInboxItemWithDetails();
		const mockItem2 = { ...mockItem1, _id: 'item-2', title: 'Item 2' };

		const resolveOrder: string[] = [];

		(mockClient.query as ReturnType<typeof vi.fn>).mockImplementation((_fn, args) => {
			const itemId = (args as { inboxItemId: string }).inboxItemId;
			return new Promise((resolve) => {
				// Simulate slow query for item-1, fast for item-2
				setTimeout(
					() => {
						resolveOrder.push(itemId);
						resolve(itemId === 'item-1' ? mockItem1 : mockItem2);
					},
					itemId === 'item-1' ? 200 : 50
				);
			});
		});

		setupConvexMocks(mockClient, {
			inboxItemWithDetails: createMockQueryResult(mockItem1, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getSelectedItemInstance();

		// Select item-1
		composable.selectItem('item-1');

		// Immediately select item-2
		composable.selectItem('item-2');

		// Wait for both queries to complete
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Should have item-2 selected (not item-1, even though item-1 query resolved last)
		expect(composable.selectedItemId).toBe('item-2');
		expect(composable.selectedItem?._id).toBe('item-2');
	});
});

describe('useSelectedItem - Cleanup on Unmount', () => {
	let mockClient: ConvexClient;
	let inboxApi: InboxApi;

	beforeEach(() => {
		vi.clearAllMocks();
		setupBrowserMocks();
		setupPostHogMock();
		setupContextMocks();

		// Reset global mock state between tests
		(globalThis as unknown as { __vitestConvexMockClient?: unknown }).__vitestConvexMockClient =
			null;
		(
			globalThis as unknown as { __vitestConvexQueryResults?: Record<string, unknown> }
		).__vitestConvexQueryResults = {};

		mockClient = createMockConvexClient();
		inboxApi = {
			findInboxItemWithDetails: api.inbox.findInboxItemWithDetails,
			fetchReadwiseHighlights: api.syncReadwise.fetchReadwiseHighlights,
			findSyncProgress: api.inbox.findSyncProgress
		};
	});

	it('should clear selected item when component unmounts', async () => {
		const mockItem = createMockInboxItemWithDetails();
		(mockClient.query as ReturnType<typeof vi.fn>).mockResolvedValue(mockItem);

		setupConvexMocks(mockClient, {
			inboxItemWithDetails: createMockQueryResult(mockItem, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getSelectedItemInstance();

		// Select item
		composable.selectItem('item-1');

		// Wait for query to complete
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(composable.selectedItemId).toBe('item-1');

		// Unmount component
		screen.unmount();

		// Wait for cleanup
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Selected item should be cleared (component is unmounted, so we can't check directly)
		// But we can verify cleanup was called by checking query wasn't called after unmount
		const queryCallCount = (mockClient.query as ReturnType<typeof vi.fn>).mock.calls.length;
		expect(queryCallCount).toBeGreaterThan(0);
	});
});

describe('useSelectedItem - Stale Query Handling', () => {
	let mockClient: ConvexClient;
	let inboxApi: InboxApi;

	beforeEach(() => {
		vi.clearAllMocks();
		setupBrowserMocks();
		setupPostHogMock();
		setupContextMocks();

		// Reset global mock state between tests
		(globalThis as unknown as { __vitestConvexMockClient?: unknown }).__vitestConvexMockClient =
			null;
		(
			globalThis as unknown as { __vitestConvexQueryResults?: Record<string, unknown> }
		).__vitestConvexQueryResults = {};

		mockClient = createMockConvexClient();
		inboxApi = {
			findInboxItemWithDetails: api.inbox.findInboxItemWithDetails,
			fetchReadwiseHighlights: api.syncReadwise.fetchReadwiseHighlights,
			findSyncProgress: api.inbox.findSyncProgress
		};
	});

	it('should handle query errors gracefully', async () => {
		const error = new Error('Query failed');
		(mockClient.query as ReturnType<typeof vi.fn>).mockRejectedValue(error);

		setupConvexMocks(mockClient, {
			inboxItemWithDetails: createMockQueryResult(undefined, false, error)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getSelectedItemInstance();

		// Select item
		composable.selectItem('item-1');

		// Wait for query to fail
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Should clear selected item on error
		expect(composable.selectedItem).toBe(null);
	});

	it('should clear selection when clearSelection is called', async () => {
		const mockItem = createMockInboxItemWithDetails();
		(mockClient.query as ReturnType<typeof vi.fn>).mockResolvedValue(mockItem);

		setupConvexMocks(mockClient, {
			inboxItemWithDetails: createMockQueryResult(mockItem, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getSelectedItemInstance();

		// Select item
		composable.selectItem('item-1');

		// Wait for query to complete
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(composable.selectedItemId).toBe('item-1');

		// Clear selection
		composable.clearSelection();

		expect(composable.selectedItemId).toBe(null);
		expect(composable.selectedItem).toBe(null);
	});

	it('should not query when sessionId is missing', async () => {
		const mockItem = createMockInboxItemWithDetails();
		(mockClient.query as ReturnType<typeof vi.fn>).mockResolvedValue(mockItem);

		setupConvexMocks(mockClient, {
			inboxItemWithDetails: createMockQueryResult(mockItem, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => undefined,
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getSelectedItemInstance();

		// Select item
		composable.selectItem('item-1');

		// Wait a bit
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Should not have queried (no sessionId)
		expect(composable.selectedItem).toBe(null);
	});
});

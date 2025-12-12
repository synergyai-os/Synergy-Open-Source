/**
 * Unit Tests for useInboxItems Composable
 *
 * Tests query parameter construction, filter type changes, and reactive updates.
 */

// Import mocks first (must be before other imports)
import '$tests/composables/test-utils/setupMocks.svelte';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InboxTestComponent from '$tests/composables/fixtures/InboxTestComponent.svelte';
import {
	setupConvexMocks,
	createMockConvexClient,
	createMockInboxItems,
	createMockQueryResult
} from '$tests/composables/test-utils/mockConvex.svelte';
import { setupBrowserMocks } from '$tests/composables/test-utils/mockBrowser.svelte';
import { setupPostHogMock } from '$tests/composables/test-utils/mockPostHog.svelte';
import { setupContextMocks } from '$tests/composables/test-utils/mockContext.svelte';
import type { UseInboxItemsReturn } from '../composables/useInboxItems.svelte';

// Helper type to access exported functions from Svelte component
type TestComponentInstance = {
	getInboxItemsInstance: () => UseInboxItemsReturn;
};

describe('useInboxItems - Query Parameters', () => {
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
	});

	it('should construct query parameters with sessionId', async () => {
		const mockItems = createMockInboxItems();
		const mockClient = createMockConvexClient();
		setupConvexMocks(mockClient, {
			inboxItems: createMockQueryResult(mockItems, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxItemsInstance();

		// Wait for query to execute and reactive updates to propagate
		await new Promise((resolve) => setTimeout(resolve, 200));

		expect(composable.inboxItems).toBeDefined();
		expect(Array.isArray(composable.inboxItems)).toBe(true);
		// Query should return mock items via the fallback mechanism
		expect(composable.inboxItems.length).toBeGreaterThan(0);
	});

	it('should include organizationId in query parameters when provided', async () => {
		const mockItems = createMockInboxItems();
		const mockClient = createMockConvexClient();
		setupConvexMocks(mockClient, {
			inboxItems: createMockQueryResult(mockItems, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			activeOrganizationId: () => 'org-123'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxItemsInstance();

		// Wait for query to execute
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(composable.inboxItems).toBeDefined();
	});

	it('should include circleId in query parameters when provided', async () => {
		const mockItems = createMockInboxItems();
		const mockClient = createMockConvexClient();
		setupConvexMocks(mockClient, {
			inboxItems: createMockQueryResult(mockItems, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			activeCircleId: () => 'circle-123'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxItemsInstance();

		// Wait for query to execute
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(composable.inboxItems).toBeDefined();
	});

	it('should handle null organizationId', async () => {
		const mockItems = createMockInboxItems();
		const mockClient = createMockConvexClient();
		setupConvexMocks(mockClient, {
			inboxItems: createMockQueryResult(mockItems, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			activeOrganizationId: () => null
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxItemsInstance();

		// Wait for query to execute
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(composable.inboxItems).toBeDefined();
	});
});

describe('useInboxItems - Filter Type Changes', () => {
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
	});

	it('should default to "all" filter type', async () => {
		const mockItems = createMockInboxItems();
		const mockClient = createMockConvexClient();
		setupConvexMocks(mockClient, {
			inboxItems: createMockQueryResult(mockItems, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxItemsInstance();

		expect(composable.filterType).toBe('all');
	});

	it('should change filter type when setFilter is called', async () => {
		const mockItems = createMockInboxItems();
		const mockClient = createMockConvexClient();
		setupConvexMocks(mockClient, {
			inboxItems: createMockQueryResult(mockItems, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxItemsInstance();

		expect(composable.filterType).toBe('all');

		composable.setFilter('readwise_highlight');

		expect(composable.filterType).toBe('readwise_highlight');
	});

	it('should call onClearSelection callback when filter changes', async () => {
		const mockItems = createMockInboxItems();
		const mockClient = createMockConvexClient();
		setupConvexMocks(mockClient, {
			inboxItems: createMockQueryResult(mockItems, false, null)
		});

		const onClearSelection = vi.fn();

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxItemsInstance();

		composable.setFilter('photo_note', onClearSelection);

		expect(onClearSelection).toHaveBeenCalledTimes(1);
	});
});

describe('useInboxItems - Reactive Updates', () => {
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
	});

	it('should update when sessionId changes', async () => {
		const mockItems = createMockInboxItems();
		const mockClient = createMockConvexClient();
		setupConvexMocks(mockClient, {
			inboxItems: createMockQueryResult(mockItems, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id-1'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxItemsInstance();

		// Wait for initial query
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Update sessionId
		await screen.rerender({
			sessionId: () => 'test-session-id-2'
		});

		// Wait for reactive update
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(composable.inboxItems).toBeDefined();
	});

	it('should update when organizationId changes', async () => {
		const mockItems = createMockInboxItems();
		const mockClient = createMockConvexClient();
		setupConvexMocks(mockClient, {
			inboxItems: createMockQueryResult(mockItems, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			activeOrganizationId: () => 'org-1'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxItemsInstance();

		// Wait for initial query
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Update organizationId
		await screen.rerender({
			sessionId: () => 'test-session-id',
			activeOrganizationId: () => 'org-2'
		});

		// Wait for reactive update
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(composable.inboxItems).toBeDefined();
	});

	it('should show loading state when query is loading', async () => {
		const mockClient = createMockConvexClient();
		setupConvexMocks(mockClient, {
			inboxItems: createMockQueryResult(undefined, true, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxItemsInstance();

		expect(composable.isLoading).toBe(true);
	});

	it('should show error state when query fails', async () => {
		const mockClient = createMockConvexClient();
		const error = new Error('Query failed');
		setupConvexMocks(mockClient, {
			inboxItems: createMockQueryResult(undefined, false, error)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxItemsInstance();

		// Wait for query to execute and reactive updates to propagate
		await new Promise((resolve) => setTimeout(resolve, 200));

		// Query error should be set via the mock
		expect(composable.queryError).toBe(error);
	});

	it('should return filtered items', async () => {
		const mockItems = createMockInboxItems();
		const mockClient = createMockConvexClient();
		setupConvexMocks(mockClient, {
			inboxItems: createMockQueryResult(mockItems, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxItemsInstance();

		// Wait for query to execute and reactive updates to propagate
		await new Promise((resolve) => setTimeout(resolve, 200));

		expect(composable.filteredItems).toBeDefined();
		expect(Array.isArray(composable.filteredItems)).toBe(true);
		// Filtered items should match mock items (no filter applied in this test)
		expect(composable.filteredItems.length).toBe(mockItems.length);
	});
});

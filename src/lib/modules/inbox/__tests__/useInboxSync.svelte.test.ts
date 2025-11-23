/**
 * Unit Tests for useInboxSync Composable
 *
 * Tests polling logic, error handling, progress updates, and activity tracking.
 */

// Import mocks first (must be before other imports)
import '$tests/composables/test-utils/setupMocks.svelte';

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InboxTestComponent from '$tests/composables/fixtures/InboxTestComponent.svelte';
import {
	setupConvexMocks,
	createMockConvexClient,
	createMockSyncProgress,
	createMockQueryResult
} from '$tests/composables/test-utils/mockConvex.svelte';
import { setupBrowserMocks } from '$tests/composables/test-utils/mockBrowser.svelte';
import { setupPostHogMock } from '$tests/composables/test-utils/mockPostHog.svelte';
import { setupContextMocks } from '$tests/composables/test-utils/mockContext.svelte';
import type { UseInboxSyncReturn } from '../composables/useInboxSync.svelte';
import type { ConvexClient, InboxApi, SyncReadwiseResult } from '$lib/types/convex';
import { api } from '$lib/convex';

// Helper type to access exported functions from Svelte component
type TestComponentInstance = {
	getInboxSyncInstance: () => UseInboxSyncReturn;
};

describe('useInboxSync - Polling Logic', () => {
	let mockClient: ConvexClient;
	let inboxApi: InboxApi;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
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
			getInboxItemWithDetails: api.inbox.getInboxItemWithDetails,
			syncReadwiseHighlights: api.syncReadwise.syncReadwiseHighlights,
			getSyncProgress: api.inbox.getSyncProgress
		};
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should start polling when sync starts', async () => {
		const mockProgress = createMockSyncProgress();
		(mockClient.query as ReturnType<typeof vi.fn>).mockResolvedValue(mockProgress);
		(mockClient.action as ReturnType<typeof vi.fn>).mockResolvedValue({
			success: true,
			newCount: 5,
			skippedCount: 0
		} as SyncReadwiseResult);

		setupConvexMocks(mockClient, {
			syncProgress: createMockQueryResult(mockProgress, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxSyncInstance();

		// Start sync
		await composable.handleImport({ quantity: 10 });

		// Advance timer to trigger polling
		vi.advanceTimersByTime(500);

		// Should have called query for progress
		expect(mockClient.query).toHaveBeenCalled();
	});

	it('should stop polling when sync completes', async () => {
		const mockProgress = createMockSyncProgress();
		(mockClient.query as ReturnType<typeof vi.fn>).mockResolvedValue(mockProgress);
		(mockClient.action as ReturnType<typeof vi.fn>).mockResolvedValue({
			success: true,
			newCount: 5,
			skippedCount: 0
		} as SyncReadwiseResult);

		setupConvexMocks(mockClient, {
			syncProgress: createMockQueryResult(mockProgress, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxSyncInstance();

		// Start sync
		await composable.handleImport({ quantity: 10 });

		// Wait for action to complete
		await vi.runAllTimersAsync();

		// Advance timer past completion
		vi.advanceTimersByTime(3000);

		// Get initial query call count
		const initialQueryCalls = (mockClient.query as ReturnType<typeof vi.fn>).mock.calls.length;

		// Advance timer more (should not poll after completion)
		vi.advanceTimersByTime(1000);

		// Query should not have been called again after completion
		const finalQueryCalls = (mockClient.query as ReturnType<typeof vi.fn>).mock.calls.length;
		expect(finalQueryCalls).toBe(initialQueryCalls);
	});

	it('should stop polling when sync is cancelled', async () => {
		const mockProgress = createMockSyncProgress();
		(mockClient.query as ReturnType<typeof vi.fn>).mockResolvedValue(mockProgress);
		(mockClient.action as ReturnType<typeof vi.fn>).mockImplementation(
			() =>
				new Promise((resolve) => {
					// Never resolve (simulating ongoing sync)
					setTimeout(() => {
						resolve({
							success: true,
							newCount: 5,
							skippedCount: 0
						});
					}, 10000);
				})
		);

		setupConvexMocks(mockClient, {
			syncProgress: createMockQueryResult(mockProgress, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxSyncInstance();

		// Start sync
		composable.handleImport({ quantity: 10 });

		// Advance timer to trigger polling
		vi.advanceTimersByTime(500);

		// Get initial query call count
		const initialQueryCalls = (mockClient.query as ReturnType<typeof vi.fn>).mock.calls.length;

		// Cancel sync
		composable.handleCancelSync();

		// Advance timer more (should not poll after cancel)
		vi.advanceTimersByTime(1000);

		// Query should not have been called again after cancel
		const finalQueryCalls = (mockClient.query as ReturnType<typeof vi.fn>).mock.calls.length;
		expect(finalQueryCalls).toBe(initialQueryCalls);
	});
});

describe('useInboxSync - Error Handling', () => {
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
			getInboxItemWithDetails: api.inbox.getInboxItemWithDetails,
			syncReadwiseHighlights: api.syncReadwise.syncReadwiseHighlights,
			getSyncProgress: api.inbox.getSyncProgress
		};
	});

	it('should handle sync action errors', async () => {
		const error = new Error('Sync failed');
		(mockClient.action as ReturnType<typeof vi.fn>).mockRejectedValue(error);

		setupConvexMocks(mockClient, {
			syncProgress: createMockQueryResult(null, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxSyncInstance();

		// Start sync
		await composable.handleImport({ quantity: 10 });

		// Wait for error
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(composable.syncError).toBe('Sync failed');
		expect(composable.isSyncing).toBe(false);
	});

	it('should handle polling errors gracefully', async () => {
		const error = new Error('Polling failed');
		(mockClient.query as ReturnType<typeof vi.fn>).mockRejectedValue(error);
		(mockClient.action as ReturnType<typeof vi.fn>).mockResolvedValue({
			success: true,
			newCount: 5,
			skippedCount: 0
		} as SyncReadwiseResult);

		setupConvexMocks(mockClient, {
			syncProgress: createMockQueryResult(null, false, error)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxSyncInstance();

		// Start sync
		await composable.handleImport({ quantity: 10 });

		// Wait for polling error
		await new Promise((resolve) => setTimeout(resolve, 600));

		// Should still be syncing (polling error doesn't stop sync)
		expect(composable.isSyncing).toBe(true);
	});
});

describe('useInboxSync - Progress Updates', () => {
	let mockClient: ConvexClient;
	let inboxApi: InboxApi;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
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
			getInboxItemWithDetails: api.inbox.getInboxItemWithDetails,
			syncReadwiseHighlights: api.syncReadwise.syncReadwiseHighlights,
			getSyncProgress: api.inbox.getSyncProgress
		};
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should update progress from polling', async () => {
		const mockProgress = createMockSyncProgress();
		(mockClient.query as ReturnType<typeof vi.fn>).mockResolvedValue(mockProgress);
		(mockClient.action as ReturnType<typeof vi.fn>).mockResolvedValue({
			success: true,
			newCount: 5,
			skippedCount: 0
		} as SyncReadwiseResult);

		setupConvexMocks(mockClient, {
			syncProgress: createMockQueryResult(mockProgress, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxSyncInstance();

		// Start sync
		await composable.handleImport({ quantity: 10 });

		// Advance timer to trigger polling
		vi.advanceTimersByTime(500);

		// Wait for progress update
		await vi.runAllTimersAsync();

		expect(composable.syncProgress).toBeDefined();
		if (composable.syncProgress) {
			expect(composable.syncProgress.step).toBe(mockProgress.step);
			expect(composable.syncProgress.current).toBe(mockProgress.current);
		}
	});

	it('should show sync success when new items imported', async () => {
		// Use real timers for this test since it involves async operations
		vi.useRealTimers();

		// Mock query to return null (no progress) - this simulates completed sync
		(mockClient.query as ReturnType<typeof vi.fn>).mockResolvedValue(null);
		// Mock action to return success with new items
		(mockClient.action as ReturnType<typeof vi.fn>).mockResolvedValue({
			success: true,
			newCount: 5,
			skippedCount: 0
		} as SyncReadwiseResult);

		setupConvexMocks(mockClient, {
			syncProgress: createMockQueryResult(null, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxSyncInstance();

		// Start sync - this should complete immediately since action resolves
		await composable.handleImport({ quantity: 10 });

		// Wait for syncSuccess to be set (happens immediately after action completes)
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(composable.syncSuccess).toBe(true);

		// isSyncing is set to false after 2 seconds (see composable line 281-284)
		// Wait for the timeout to complete
		await new Promise((resolve) => setTimeout(resolve, 2100));

		expect(composable.isSyncing).toBe(false);

		// Restore fake timers for other tests
		vi.useFakeTimers();
	}, 20000);

	it('should handle "already imported" case', async () => {
		// Use real timers for this test since it involves async operations
		vi.useRealTimers();

		// Mock query to return null (no progress) - this simulates completed sync
		(mockClient.query as ReturnType<typeof vi.fn>).mockResolvedValue(null);
		// Mock action to return success with no new items (all skipped)
		(mockClient.action as ReturnType<typeof vi.fn>).mockResolvedValue({
			success: true,
			newCount: 0,
			skippedCount: 10
		} as SyncReadwiseResult);

		setupConvexMocks(mockClient, {
			syncProgress: createMockQueryResult(null, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxSyncInstance();

		// Start sync - this should complete immediately since action resolves
		await composable.handleImport({ quantity: 10 });

		// Wait for reactive updates to propagate
		await new Promise((resolve) => setTimeout(resolve, 300));

		expect(composable.syncSuccess).toBe(true);

		// Restore fake timers for other tests
		vi.useFakeTimers();
		expect(composable.syncProgress?.message).toContain('already in your inbox');
	});
});

describe('useInboxSync - Activity Tracking', () => {
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
			getInboxItemWithDetails: api.inbox.getInboxItemWithDetails,
			syncReadwiseHighlights: api.syncReadwise.syncReadwiseHighlights,
			getSyncProgress: api.inbox.getSyncProgress
		};
	});

	it('should show sync config panel when handleSyncClick is called', async () => {
		setupConvexMocks(mockClient, {
			syncProgress: createMockQueryResult(null, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxSyncInstance();

		expect(composable.showSyncConfig).toBe(false);

		composable.handleSyncClick();

		expect(composable.showSyncConfig).toBe(true);
	});

	it('should clear selection when opening sync config', async () => {
		const onClearSelection = vi.fn();

		setupConvexMocks(mockClient, {
			syncProgress: createMockQueryResult(null, false, null)
		});

		const screen = render(InboxTestComponent, {
			sessionId: () => 'test-session-id',
			convexClient: mockClient,
			inboxApi,
			onClearSelection
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getInboxSyncInstance();

		composable.handleSyncClick();

		expect(onClearSelection).toHaveBeenCalledTimes(1);
	});
});

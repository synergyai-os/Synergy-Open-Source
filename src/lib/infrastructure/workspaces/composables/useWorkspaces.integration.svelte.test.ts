/**
 * Integration Tests for useWorkspaces Composable
 *
 * These tests verify integration with Svelte context and reactive behavior:
 * - Context usage (loading overlay)
 * - Reactive behavior with Svelte components
 * - Multiple component instances
 *
 * Purpose: Document current behavior to prevent regressions during refactoring.
 */

// Import mocks first (must be before other imports)
import '$tests/composables/test-utils/setupMocks.svelte';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TestComponent from '$tests/composables/fixtures/TestComponent.svelte';
import {
	setupConvexMocks,
	createMockConvexClient,
	createMockOrganizations,
	createMockQueryResult
} from '$tests/composables/test-utils/mockConvex.svelte';
import { setupBrowserMocks } from '$tests/composables/test-utils/mockBrowser.svelte';
import { setupPostHogMock } from '$tests/composables/test-utils/mockPostHog.svelte';
import {
	setupContextMocks,
	createMockLoadingOverlay
} from '$tests/composables/test-utils/mockContext.svelte';
import type { UseOrganizations, WorkspaceSummary } from './useWorkspaces.svelte';

// Helper type to access exported functions from Svelte component
type TestComponentInstance = {
	getComposableInstance: () => UseOrganizations;
};

describe('useWorkspaces - Integration Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setupPostHogMock();
	});

	describe('Svelte Context Integration', () => {
		it('should use loading overlay context when creating workspace', async () => {
			const mockOrgs = createMockOrganizations();

			// Mock the mutation - use a catch-all to handle any function reference format
			const mockClient = createMockConvexClient({
				'*': async () => ({
					workspaceId: 'org-new',
					slug: 'new-org'
				})
			});

			setupConvexMocks(mockClient, {
				workspaces: createMockQueryResult(mockOrgs, false, null)
			});
			setupBrowserMocks();

			const mockLoadingOverlay = createMockLoadingOverlay();
			setupContextMocks({ loadingOverlay: mockLoadingOverlay });

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id',
				initialOrganizations: mockOrgs
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for initial setup
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Create workspace
			await composable.createWorkspace({ name: 'New Organization' });

			// Wait for async operations (mutation + overlay hide delay)
			await new Promise((resolve) => setTimeout(resolve, 600));

			// Verify loading overlay was accessed
			// The overlay is shown before mutation, so it should be called even if mutation fails
			expect(mockLoadingOverlay.showOverlay).toHaveBeenCalled();
		});

		it('should handle missing loading overlay context gracefully', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient({
				'workspaces:createWorkspace': async () => ({
					workspaceId: 'org-new',
					slug: 'new-org'
				})
			});
			setupConvexMocks(mockClient, {
				workspaces: createMockQueryResult(mockOrgs, false, null)
			});
			setupBrowserMocks();

			// No loading overlay context
			setupContextMocks({ loadingOverlay: null });

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id'
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for initial setup
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Create workspace should not throw
			await expect(composable.createWorkspace({ name: 'New Organization' })).resolves.not.toThrow();
		});
	});

	describe('Reactive Behavior', () => {
		it('should show loading state when query data is undefined', async () => {
			const mockClient = createMockConvexClient();

			// Start with loading state (no initial data)
			setupConvexMocks(mockClient, {
				workspaces: createMockQueryResult<WorkspaceSummary[]>(undefined, true, null)
			});
			setupBrowserMocks();

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id'
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for initial setup
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should be loading when query data is undefined
			expect(composable.isLoading).toBe(true);
		});

		it('should reactively update active workspace when setActiveWorkspace is called', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				workspaces: createMockQueryResult(mockOrgs, false, null)
			});
			setupBrowserMocks();

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id'
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for initial setup
			await new Promise((resolve) => setTimeout(resolve, 100));

			const initialOrgId = composable.activeWorkspaceId;

			// Switch workspace
			composable.setActiveWorkspace('org-2');

			// Wait for reactivity
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should have updated
			expect(composable.activeWorkspaceId).toBe('org-2');
			expect(composable.activeWorkspaceId).not.toBe(initialOrgId);
			expect(composable.activeWorkspace?.workspaceId).toBe('org-2');
		});

		// Note: Modal state management has been moved to individual components using StandardDialog
		// Modal tests are no longer needed as modals are handled locally
	});

	describe('Multiple Component Instances', () => {
		it('should maintain independent state across multiple component instances', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				workspaces: createMockQueryResult(mockOrgs, false, null)
			});
			setupBrowserMocks();

			const screen1 = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id',
				initialOrganizations: mockOrgs
			});

			const composable1 = (
				screen1.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for initial setup
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Switch workspace in first instance
			composable1.setActiveWorkspace('org-2');

			// Wait for localStorage update
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Create second instance - it should read from localStorage
			const screen2 = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id',
				initialOrganizations: mockOrgs
			});

			const composable2 = (
				screen2.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for second instance to initialize and read from localStorage
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Both should reflect the change (shared state via localStorage)
			expect(composable1.activeWorkspaceId).toBe('org-2');
			expect(composable2.activeWorkspaceId).toBe('org-2');
		});
	});

	describe('Initial Data Handling', () => {
		it('should use initialOrganizations for instant rendering', async () => {
			const initialOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();

			// Start with loading state (no query data yet)
			setupConvexMocks(mockClient, {
				workspaces: createMockQueryResult<WorkspaceSummary[]>(undefined, true, null)
			});
			setupBrowserMocks();

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id',
				initialOrganizations: initialOrgs
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Should have initial data immediately (before query loads)
			expect(composable.workspaces.length).toBe(initialOrgs.length);
			expect(composable.workspaces[0].workspaceId).toBe(initialOrgs[0].workspaceId);
		});

		it('should prefer query data over initial data when available', async () => {
			const initialOrgs = createMockOrganizations();
			const queryOrgs = [
				...createMockOrganizations(),
				{
					workspaceId: 'org-3',
					name: 'Query Organization',
					initials: 'QO',
					slug: 'query-org',
					plan: 'free',
					role: 'owner' as const,
					joinedAt: Date.now(),
					memberCount: 1,
					teamCount: 0
				}
			];

			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				workspaces: createMockQueryResult(queryOrgs, false, null)
			});
			setupBrowserMocks();

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id',
				initialOrganizations: initialOrgs
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for query to load
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should use query data (has more workspaces)
			expect(composable.workspaces.length).toBe(queryOrgs.length);
			expect(composable.workspaces.some((org) => org.workspaceId === 'org-3')).toBe(true);
		});
	});
});

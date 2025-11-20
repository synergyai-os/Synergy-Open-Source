/**
 * Integration Tests for useOrganizations Composable
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
import type { UseOrganizations, OrganizationSummary } from './useOrganizations.svelte';

// Helper type to access exported functions from Svelte component
type TestComponentInstance = {
	getComposableInstance: () => UseOrganizations;
};

describe('useOrganizations - Integration Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setupPostHogMock();
	});

	describe('Svelte Context Integration', () => {
		it('should use loading overlay context when creating organization', async () => {
			const mockOrgs = createMockOrganizations();

			// Mock the mutation - use a catch-all to handle any function reference format
			const mockClient = createMockConvexClient({
				'*': async () => ({
					organizationId: 'org-new',
					slug: 'new-org'
				})
			});

			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
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

			// Create organization
			await composable.createOrganization({ name: 'New Organization' });

			// Wait for async operations (mutation + overlay hide delay)
			await new Promise((resolve) => setTimeout(resolve, 600));

			// Verify loading overlay was accessed
			// The overlay is shown before mutation, so it should be called even if mutation fails
			expect(mockLoadingOverlay.showOverlay).toHaveBeenCalled();
		});

		it('should handle missing loading overlay context gracefully', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient({
				'organizations:createOrganization': async () => ({
					organizationId: 'org-new',
					slug: 'new-org'
				})
			});
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
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

			// Create organization should not throw
			await expect(
				composable.createOrganization({ name: 'New Organization' })
			).resolves.not.toThrow();
		});
	});

	describe('Reactive Behavior', () => {
		it('should show loading state when query data is undefined', async () => {
			const mockClient = createMockConvexClient();

			// Start with loading state (no initial data)
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult<OrganizationSummary[]>(undefined, true, null)
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

		it('should reactively update active organization when setActiveOrganization is called', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
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

			const initialOrgId = composable.activeOrganizationId;

			// Switch organization
			composable.setActiveOrganization('org-2');

			// Wait for reactivity
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should have updated
			expect(composable.activeOrganizationId).toBe('org-2');
			expect(composable.activeOrganizationId).not.toBe(initialOrgId);
			expect(composable.activeOrganization?.organizationId).toBe('org-2');
		});

		it('should reactively update modals when openModal/closeModal is called', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
			});
			setupBrowserMocks();

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id'
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Initially closed
			expect(composable.modals.createOrganization).toBe(false);

			// Open modal
			composable.openModal('createOrganization');

			// Wait for reactivity
			await new Promise((resolve) => setTimeout(resolve, 50));

			expect(composable.modals.createOrganization).toBe(true);

			// Close modal
			composable.closeModal('createOrganization');

			// Wait for reactivity
			await new Promise((resolve) => setTimeout(resolve, 50));

			expect(composable.modals.createOrganization).toBe(false);
		});
	});

	describe('Multiple Component Instances', () => {
		it('should maintain independent state across multiple component instances', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
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

			// Switch organization in first instance
			composable1.setActiveOrganization('org-2');

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
			expect(composable1.activeOrganizationId).toBe('org-2');
			expect(composable2.activeOrganizationId).toBe('org-2');
		});
	});

	describe('Initial Data Handling', () => {
		it('should use initialOrganizations for instant rendering', async () => {
			const initialOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();

			// Start with loading state (no query data yet)
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult<OrganizationSummary[]>(undefined, true, null)
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
			expect(composable.organizations.length).toBe(initialOrgs.length);
			expect(composable.organizations[0].organizationId).toBe(initialOrgs[0].organizationId);
		});

		it('should prefer query data over initial data when available', async () => {
			const initialOrgs = createMockOrganizations();
			const queryOrgs = [
				...createMockOrganizations(),
				{
					organizationId: 'org-3',
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
				organizations: createMockQueryResult(queryOrgs, false, null)
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

			// Should use query data (has more organizations)
			expect(composable.organizations.length).toBe(queryOrgs.length);
			expect(composable.organizations.some((org) => org.organizationId === 'org-3')).toBe(true);
		});
	});
});

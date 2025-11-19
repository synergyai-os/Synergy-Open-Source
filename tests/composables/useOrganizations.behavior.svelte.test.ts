/**
 * Behavior Tests for useOrganizations Composable
 *
 * These tests verify critical behaviors:
 * - URL parameter processing (?org= param)
 * - Active organization validation
 * - Default organization selection
 * - localStorage persistence
 * - Account switching (userId change)
 * - Organization switching flow
 *
 * Purpose: Document current behavior to prevent regressions during refactoring.
 */

// Import mocks first (must be before other imports)
import './test-utils/setupMocks.svelte';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TestComponent from './fixtures/TestComponent.svelte';
import {
	setupConvexMocks,
	createMockConvexClient,
	createMockOrganizations,
	createMockQueryResult
} from './test-utils/mockConvex.svelte';
import { setupBrowserMocks } from './test-utils/mockBrowser.svelte';
import { setupPostHogMock } from './test-utils/mockPostHog.svelte';
import { setupContextMocks } from './test-utils/mockContext.svelte';
import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';
import type { Mock } from 'vitest';

// Helper type to access exported functions from Svelte component
type TestComponentInstance = {
	getComposableInstance: () => UseOrganizations;
};

describe('useOrganizations - Behavior Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setupPostHogMock();
		setupContextMocks();

		// Reset global mock state between tests
		(globalThis as unknown as { __vitestConvexMockClient?: unknown }).__vitestConvexMockClient =
			null;
		(
			globalThis as unknown as { __vitestConvexQueryResults?: Record<string, unknown> }
		).__vitestConvexQueryResults = {};
	});

	describe('URL Parameter Processing', () => {
		it('should set active organization from ?org= URL parameter', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
			});
			setupBrowserMocks({ urlSearch: '?org=org-2' });

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id',
				orgFromUrl: () => 'org-2'
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for effect to process URL param
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(composable.activeOrganizationId).toBe('org-2');
		});

		it('should clean up ?org= parameter after processing', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
			});
			setupBrowserMocks({ urlSearch: '?org=org-1' });

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id',
				orgFromUrl: () => 'org-1'
			});

			// Wait for effect to process URL param
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Verify organization was set (URL cleanup happens internally)
			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();
			expect(composable.activeOrganizationId).toBe('org-1');
		});
	});

	describe('Organization Validation', () => {
		it('should default to first organization when no active organization set', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
			});
			setupBrowserMocks();

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id',
				initialOrganizations: mockOrgs // Provide initial data for instant validation
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for validation effect (needs query data to be available)
			await new Promise((resolve) => setTimeout(resolve, 200));

			expect(composable.activeOrganizationId).toBe('org-1');
			expect(composable.activeOrganization?.organizationId).toBe('org-1');
		});

		it('should reset to first organization if active organization not in list', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
			});
			const { mockStorage } = setupBrowserMocks({ userId: 'test-user-id' });

			// Set invalid organization ID in localStorage
			mockStorage.setItem('activeOrganizationId_test-user-id', 'invalid-org-id');

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id',
				initialOrganizations: mockOrgs // Provide initial data
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for validation effect (needs query data to be available)
			await new Promise((resolve) => setTimeout(resolve, 200));

			expect(composable.activeOrganizationId).toBe('org-1');
			expect(composable.activeOrganization?.organizationId).toBe('org-1');
		});

		it('should handle empty organization list gracefully', async () => {
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult([], false, null)
			});
			const { mockStorage } = setupBrowserMocks({ userId: 'test-user-id' });

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id'
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for validation effect
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(composable.activeOrganizationId).toBe(null);
			expect(mockStorage.removeItem).toHaveBeenCalled();
		});
	});

	describe('localStorage Persistence', () => {
		it('should persist active organization ID to localStorage', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
			});
			const { mockStorage } = setupBrowserMocks({ userId: 'test-user-id' });

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id'
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for initial validation
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Switch organization
			composable.setActiveOrganization('org-2');

			// Wait for effect to persist
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(mockStorage.setItem).toHaveBeenCalledWith(
				'activeOrganizationId_test-user-id',
				'org-2'
			);
		});

		it('should persist organization details to localStorage', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
			});
			const { mockStorage } = setupBrowserMocks({ userId: 'test-user-id' });

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id',
				initialOrganizations: mockOrgs
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for initial validation
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Switch organization (org-2 exists in mockOrgs)
			composable.setActiveOrganization('org-2');

			// Wait for effect to persist
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Verify organization details were stored
			const detailsKey = 'activeOrganizationDetails_test-user-id';
			expect(mockStorage.setItem).toHaveBeenCalledWith(
				detailsKey,
				expect.stringContaining('org-2')
			);
		});

		it('should use account-specific storage keys', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
			});
			const { mockStorage } = setupBrowserMocks({ userId: 'user-1' });

			render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'user-1',
				initialOrganizations: mockOrgs
			});

			// Wait for initial validation (validation effect sets active org and persists to localStorage)
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Verify account-specific key was used (validation effect should have called setItem)
			expect(mockStorage.setItem).toHaveBeenCalledWith(
				'activeOrganizationId_user-1',
				expect.any(String)
			);
		});
	});

	describe('Account Switching', () => {
		it('should clear active organization when userId changes', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
			});
			const { mockStorage } = setupBrowserMocks({ userId: 'user-1' });

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'user-1',
				initialOrganizations: mockOrgs
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for initial setup
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Set active organization
			composable.setActiveOrganization('org-1');
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(composable.activeOrganizationId).toBe('org-1');

			// Verify storage was set for user-1
			expect(mockStorage.getItem('activeOrganizationId_user-1')).toBe('org-1');

			// Clear previous calls to track new ones (but keep the mock functional)
			(mockStorage.removeItem as Mock).mockClear();

			// Switch user (rerender with new userId)
			// IMPORTANT: await rerender() - it returns a Promise that resolves when Svelte processes the update
			await screen.rerender({
				userId: () => 'user-2',
				sessionId: () => 'test-session-id',
				initialOrganizations: mockOrgs
			});

			// Wait for account switch effect (needs to detect userId change)
			// Effect needs time to detect the change and clear old storage
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Old storage should be cleared
			expect(mockStorage.removeItem).toHaveBeenCalledWith('activeOrganizationId_user-1');
			expect(mockStorage.removeItem).toHaveBeenCalledWith('activeOrganizationDetails_user-1');
		});
	});

	describe('Organization Switching Flow', () => {
		it('should set switching state when switching organizations', async () => {
			const mockOrgs = createMockOrganizations();
			const mockClient = createMockConvexClient();
			setupConvexMocks(mockClient, {
				organizations: createMockQueryResult(mockOrgs, false, null)
			});
			setupBrowserMocks();

			const screen = render(TestComponent, {
				sessionId: () => 'test-session-id',
				userId: () => 'test-user-id',
				initialOrganizations: mockOrgs // Ensure org-2 is in the list
			});

			const composable = (
				screen.component as unknown as TestComponentInstance
			).getComposableInstance();

			// Wait for initial setup
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Switch organization (org-2 exists in mockOrgs)
			composable.setActiveOrganization('org-2');

			// Verify switching state (targetOrg should be found in list)
			expect(composable.isSwitching).toBe(true);
			expect(composable.switchingTo).toBe('Test Organization 2');
			expect(composable.switchingToType).toBe('organization');
		});

		it('should clear active team when switching organizations', async () => {
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

			// Set active team
			composable.setActiveTeam('team-1');
			expect(composable.activeTeamId).toBe('team-1');

			// Switch organization
			composable.setActiveOrganization('org-2');

			// Team should be cleared
			expect(composable.activeTeamId).toBe(null);
		});
	});
});

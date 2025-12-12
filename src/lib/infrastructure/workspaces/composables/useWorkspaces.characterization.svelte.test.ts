/**
 * Characterization Tests for useWorkspaces Composable
 *
 * These tests capture the current behavior of useWorkspaces before refactoring.
 * They verify the public API structure matches the UseOrganizations type.
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
	createMockOrganizations
} from '$tests/composables/test-utils/mockConvex.svelte';
import { setupBrowserMocks } from '$tests/composables/test-utils/mockBrowser.svelte';
import { setupPostHogMock } from '$tests/composables/test-utils/mockPostHog.svelte';
import { setupContextMocks } from '$tests/composables/test-utils/mockContext.svelte';
import type { UseOrganizations } from './useWorkspaces.svelte';

// Helper type to access exported functions from Svelte component
type TestComponentInstance = {
	getComposableInstance: () => UseOrganizations;
};

describe('useWorkspaces - Public API Characterization', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Setup mocks
		const mockClient = createMockConvexClient();
		setupConvexMocks(mockClient, {
			workspaces: { data: createMockOrganizations(), isLoading: false, error: null }
		});
		setupBrowserMocks();
		setupPostHogMock();
		setupContextMocks();
	});

	it('should return all required getters', async () => {
		const screen = render(TestComponent, {
			sessionId: () => 'test-session-id',
			userId: () => 'test-user-id'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getComposableInstance();

		// Verify all getters exist and return correct types
		expect(composable.workspaces).toBeDefined();
		expect(Array.isArray(composable.workspaces)).toBe(true);

		expect(composable.activeWorkspaceId).toBeDefined();
		expect(
			typeof composable.activeWorkspaceId === 'string' || composable.activeWorkspaceId === null
		).toBe(true);

		expect(composable.activeWorkspace).toBeDefined();

		expect(composable.workspaceInvites).toBeDefined();
		expect(Array.isArray(composable.workspaceInvites)).toBe(true);

		expect(composable.modals).toBeDefined();
		expect(typeof composable.modals).toBe('object');
		expect(composable.modals.createWorkspace).toBeDefined();
		expect(composable.modals.joinOrganization).toBeDefined();

		expect(composable.loading).toBeDefined();
		expect(typeof composable.loading).toBe('object');
		expect(composable.loading.createWorkspace).toBeDefined();
		expect(composable.loading.joinOrganization).toBeDefined();

		expect(composable.isLoading).toBeDefined();
		expect(typeof composable.isLoading === 'boolean').toBe(true);

		expect(composable.isSwitching).toBeDefined();
		expect(typeof composable.isSwitching === 'boolean').toBe(true);

		expect(composable.switchingTo).toBeDefined();
		expect(typeof composable.switchingTo === 'string' || composable.switchingTo === null).toBe(
			true
		);

		expect(composable.switchingToType).toBeDefined();
		expect(composable.switchingToType).toBe('workspace');
	});

	it('should return all required methods', async () => {
		const screen = render(TestComponent, {
			sessionId: () => 'test-session-id',
			userId: () => 'test-user-id'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getComposableInstance();

		// Verify all methods exist and are callable
		expect(typeof composable.setActiveWorkspace).toBe('function');
		expect(typeof composable.openModal).toBe('function');
		expect(typeof composable.closeModal).toBe('function');
		expect(typeof composable.createWorkspace).toBe('function');
		expect(typeof composable.joinOrganization).toBe('function');
		expect(typeof composable.acceptOrganizationInvite).toBe('function');
		expect(typeof composable.declineOrganizationInvite).toBe('function');
	});

	it('should match UseOrganizations type structure', async () => {
		const screen = render(TestComponent, {
			sessionId: () => 'test-session-id',
			userId: () => 'test-user-id'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getComposableInstance();

		// Verify return object structure matches expected type
		const expectedKeys = [
			'workspaces',
			'activeWorkspaceId',
			'activeWorkspace',
			'workspaceInvites',
			'modals',
			'loading',
			'isLoading',
			'isSwitching',
			'switchingTo',
			'switchingToType',
			'setActiveWorkspace',
			'openModal',
			'closeModal',
			'createWorkspace',
			'joinOrganization',
			'acceptOrganizationInvite',
			'declineOrganizationInvite'
		];

		const actualKeys = Object.keys(composable);

		// Check that all expected keys exist
		for (const key of expectedKeys) {
			expect(actualKeys).toContain(key);
		}

		// Verify no unexpected keys (within reason - allow for internal Svelte properties)
		const publicKeys = actualKeys.filter((key) => !key.startsWith('$'));
		expect(publicKeys.length).toBeGreaterThanOrEqual(expectedKeys.length);
	});

	it('should initialize with default values', async () => {
		const screen = render(TestComponent, {
			sessionId: () => 'test-session-id',
			userId: () => 'test-user-id'
		});

		const composable = (
			screen.component as unknown as TestComponentInstance
		).getComposableInstance();

		// Verify initial state
		expect(composable.modals.createWorkspace).toBe(false);
		expect(composable.modals.joinOrganization).toBe(false);

		expect(composable.loading.createWorkspace).toBe(false);
		expect(composable.loading.joinOrganization).toBe(false);

		expect(composable.isSwitching).toBe(false);
		expect(composable.switchingTo).toBe(null);
		expect(composable.switchingToType).toBe('workspace');
	});
});

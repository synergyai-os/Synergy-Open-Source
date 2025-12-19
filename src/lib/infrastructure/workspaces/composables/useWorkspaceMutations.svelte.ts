/**
 * Organization Mutations Composable
 *
 * Extracted from useWorkspaces for testability and maintainability.
 * Handles all CRUD operations for workspaces.
 *
 * Part of SYOS-255 refactoring effort.
 */

import { browser } from '$app/environment';
import { getContext } from 'svelte';
import { api } from '$lib/convex';
import { AnalyticsEventName } from '$lib/infrastructure/analytics/events';
import posthog from 'posthog-js';
import { toast } from '$lib/utils/toast';
import type { UseLoadingOverlayReturn } from '$lib/modules/core/composables/useLoadingOverlay.svelte';
import type { Id } from '$lib/convex';
import type { ConvexClient } from 'convex/browser';
import { invariant } from '$lib/utils/invariant';

export interface UseOrganizationMutationsOptions {
	convexClient: ConvexClient | null;
	getSessionId: () => string | undefined;
	getUserId: () => string | undefined;
	activeWorkspaceId: () => string | null; // Reactive function to get active org ID
	setActiveWorkspace: (workspaceId: string | null) => void;
	closeModal: () => void; // No-op callback for backward compatibility
}

export interface UseOrganizationMutationsReturn {
	createWorkspace: (payload: { name: string }) => Promise<void>;
	joinOrganization: (payload: { code: string }) => Promise<void>;
	acceptOrganizationInvite: (code: string) => Promise<void>;
	declineOrganizationInvite: (inviteId: string) => Promise<void>;
	get loading(): {
		createWorkspace: boolean;
		joinOrganization: boolean;
	};
}

export function useWorkspaceMutations(
	options: UseOrganizationMutationsOptions
): UseOrganizationMutationsReturn {
	const {
		convexClient,
		getSessionId,
		getUserId,
		activeWorkspaceId: _activeOrganizationId,
		setActiveWorkspace,
		closeModal
	} = options;

	// Loading state for each mutation
	const loadingState = $state({
		createWorkspace: false,
		joinOrganization: false
	});

	async function createWorkspace(payload: { name: string }) {
		if (!convexClient) return;
		const trimmed = payload.name.trim();
		if (!trimmed) return;

		const userId = getUserId();
		invariant(userId, 'User ID is required. Please log in again.');

		loadingState.createWorkspace = true;

		// Show loading overlay
		let loadingOverlay: UseLoadingOverlayReturn | null = null;
		try {
			loadingOverlay = getContext<UseLoadingOverlayReturn>('loadingOverlay');
			if (loadingOverlay) {
				loadingOverlay.showOverlay({
					flow: 'workspace-creation',
					subtitle: trimmed
				});
			}
		} catch {
			// Context not available, continue without overlay
		}

		try {
			// Get sessionId
			const sessionId = getSessionId();
			invariant(sessionId, 'Session ID not available');

			const result = await convexClient.mutation(api.core.workspaces.index.createWorkspace, {
				name: trimmed,
				sessionId
			});

			if (result?.workspaceId) {
				// Switch to new workspace (overlay will persist during switch)
				setActiveWorkspace(result.workspaceId);

				// Show success toast
				if (browser) {
					toast.success(`${trimmed} created successfully!`);

					// Track analytics
					if (posthog) {
						posthog.capture(AnalyticsEventName.ORGANIZATION_CREATED, {
							workspaceId: result.workspaceId,
							organizationName: trimmed
						});
					}
				}

				// Modal is now handled locally by components, no need to close here

				// Hide overlay after a short delay (workspace switch overlay will take over)
				if (loadingOverlay && browser) {
					setTimeout(() => {
						loadingOverlay?.hideOverlay();
					}, 500);
				}
			}
		} catch (error) {
			console.error('Failed to create workspace:', error);

			// Hide overlay on error
			if (loadingOverlay) {
				loadingOverlay.hideOverlay();
			}

			// Show error toast (only in browser context, e.g., when called from modal)
			// When called from onboarding page, the page will handle error display
			if (browser) {
				toast.error('Failed to create workspace. Please try again.');
			}

			// Keep modal open on error so user can retry
			// Re-throw error so callers (like onboarding page) can catch and handle it
			throw error;
		} finally {
			loadingState.createWorkspace = false;
		}
	}

	async function joinOrganization(payload: { code: string }) {
		if (!convexClient) return;
		const sessionId = getSessionId();
		if (!sessionId) return;
		const trimmed = payload.code.trim();
		if (!trimmed) return;

		try {
			const result = await convexClient.mutation(
				api.features.invites.mutations.acceptOrganizationInvite,
				{
					sessionId,
					code: trimmed
				}
			);
			if (result?.workspaceId) {
				setActiveWorkspace(result.workspaceId);
			}
		} finally {
			closeModal(); // Modal is now handled locally by components
		}
	}

	async function acceptOrganizationInvite(code: string) {
		if (!convexClient) return;
		const sessionId = getSessionId();
		if (!sessionId) return;
		const trimmed = code.trim();
		if (!trimmed) return;

		const result = await convexClient.mutation(
			api.features.invites.mutations.acceptOrganizationInvite,
			{
				sessionId,
				code: trimmed
			}
		);
		if (result?.workspaceId) {
			setActiveWorkspace(result.workspaceId);
		}
	}

	async function declineOrganizationInvite(inviteId: string) {
		if (!convexClient) return;
		const sessionId = getSessionId();
		if (!sessionId) return;
		await convexClient.mutation(api.features.invites.mutations.declineOrganizationInvite, {
			sessionId,
			inviteId: inviteId as Id<'workspaceInvites'>
		});
	}

	return {
		createWorkspace,
		joinOrganization,
		acceptOrganizationInvite,
		declineOrganizationInvite,
		get loading() {
			return {
				createWorkspace: loadingState.createWorkspace,
				joinOrganization: loadingState.joinOrganization
			};
		}
	};
}

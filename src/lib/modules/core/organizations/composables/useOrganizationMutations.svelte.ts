/**
 * Organization Mutations Composable
 *
 * Extracted from useOrganizations for testability and maintainability.
 * Handles all CRUD operations for organizations.
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

export type ModalKey = 'createOrganization' | 'joinOrganization';

export interface UseOrganizationMutationsOptions {
	convexClient: ConvexClient | null;
	getSessionId: () => string | undefined;
	getUserId: () => string | undefined;
	activeOrganizationId: () => string | null; // Reactive function to get active org ID
	setActiveOrganization: (organizationId: string | null) => void;
	closeModal: (key: ModalKey) => void;
}

export interface UseOrganizationMutationsReturn {
	createOrganization: (payload: { name: string }) => Promise<void>;
	joinOrganization: (payload: { code: string }) => Promise<void>;
	acceptOrganizationInvite: (code: string) => Promise<void>;
	declineOrganizationInvite: (inviteId: string) => Promise<void>;
	get loading(): {
		createOrganization: boolean;
		joinOrganization: boolean;
	};
}

export function useOrganizationMutations(
	options: UseOrganizationMutationsOptions
): UseOrganizationMutationsReturn {
	const {
		convexClient,
		getSessionId,
		getUserId,
		activeOrganizationId: _activeOrganizationId,
		setActiveOrganization,
		closeModal
	} = options;

	// Loading state for each mutation
	const loadingState = $state({
		createOrganization: false,
		joinOrganization: false
	});

	async function createOrganization(payload: { name: string }) {
		if (!convexClient) return;
		const trimmed = payload.name.trim();
		if (!trimmed) return;

		const userId = getUserId();
		if (!userId) {
			throw new Error('User ID is required. Please log in again.');
		}

		loadingState.createOrganization = true;

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
			if (!sessionId) {
				throw new Error('Session ID not available');
			}

			const result = await convexClient.mutation(api.organizations.createOrganization, {
				name: trimmed,
				sessionId
			});

			if (result?.organizationId) {
				// Switch to new organization (overlay will persist during switch)
				setActiveOrganization(result.organizationId);

				// Show success toast
				if (browser) {
					toast.success(`${trimmed} created successfully!`);

					// Track analytics
					if (posthog) {
						posthog.capture(AnalyticsEventName.ORGANIZATION_CREATED, {
							organizationId: result.organizationId,
							organizationName: trimmed
						});
					}
				}

				// Close modal on success
				closeModal('createOrganization');

				// Hide overlay after a short delay (workspace switch overlay will take over)
				if (loadingOverlay && browser) {
					setTimeout(() => {
						loadingOverlay?.hideOverlay();
					}, 500);
				}
			}
		} catch (_error) {
			console.error('Failed to create organization:', _error);

			// Show error toast
			if (browser) {
				toast.error('Failed to create organization. Please try again.');
			}

			// Hide overlay on error
			if (loadingOverlay) {
				loadingOverlay.hideOverlay();
			}

			// Keep modal open on error so user can retry
		} finally {
			loadingState.createOrganization = false;
		}
	}

	async function joinOrganization(payload: { code: string }) {
		if (!convexClient) return;
		const sessionId = getSessionId();
		if (!sessionId) return;
		const trimmed = payload.code.trim();
		if (!trimmed) return;

		try {
			const result = await convexClient.mutation(api.organizations.acceptOrganizationInvite, {
				sessionId,
				code: trimmed
			});
			if (result?.organizationId) {
				setActiveOrganization(result.organizationId);
			}
		} finally {
			closeModal('joinOrganization');
		}
	}

	async function acceptOrganizationInvite(code: string) {
		if (!convexClient) return;
		const sessionId = getSessionId();
		if (!sessionId) return;
		const trimmed = code.trim();
		if (!trimmed) return;

		const result = await convexClient.mutation(api.organizations.acceptOrganizationInvite, {
			sessionId,
			code: trimmed
		});
		if (result?.organizationId) {
			setActiveOrganization(result.organizationId);
		}
	}

	async function declineOrganizationInvite(inviteId: string) {
		if (!convexClient) return;
		const sessionId = getSessionId();
		if (!sessionId) return;
		await convexClient.mutation(api.organizations.declineOrganizationInvite, {
			sessionId,
			inviteId: inviteId as Id<'organizationInvites'>
		});
	}

	return {
		createOrganization,
		joinOrganization,
		acceptOrganizationInvite,
		declineOrganizationInvite,
		get loading() {
			return {
				createOrganization: loadingState.createOrganization,
				joinOrganization: loadingState.joinOrganization
			};
		}
	};
}

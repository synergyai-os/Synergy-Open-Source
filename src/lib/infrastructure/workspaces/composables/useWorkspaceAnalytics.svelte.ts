/**
 * Organization Analytics Composable
 *
 * Extracted from useWorkspaces for testability and maintainability.
 * Handles analytics tracking for workspace switches (Convex + PostHog).
 *
 * Part of SYOS-255 refactoring effort.
 */

import { browser } from '$app/environment';
import { api } from '$lib/convex';
import { AnalyticsEventName } from '$lib/infrastructure/analytics/events';
import posthog from 'posthog-js';
import type { Id } from '$lib/convex';
import type { ConvexClient } from 'convex/browser';
import type { WorkspaceSummary } from './useWorkspaces.svelte';

export interface UseOrganizationAnalyticsOptions {
	convexClient: ConvexClient | null;
	getUserId: () => string | undefined;
	getSessionId: () => string | undefined;
	workspaces: () => WorkspaceSummary[]; // Reactive function to get workspaces list
	setActiveWorkspace: (workspaceId: string | null) => void; // State composable function
	getCurrentOrganizationId: () => string | null; // Reactive function to get current org ID (captures before change)
}

export interface UseOrganizationAnalyticsReturn {
	setActiveWorkspace: (workspaceId: string | null) => void;
}

/**
 * Analytics Composable
 *
 * Wraps setActiveWorkspace with analytics tracking (Convex mutation + PostHog).
 * Tracks workspace switches for product analytics.
 */
export function useWorkspaceAnalytics(
	options: UseOrganizationAnalyticsOptions
): UseOrganizationAnalyticsReturn {
	const {
		convexClient,
		getUserId,
		getSessionId,
		workspaces,
		setActiveWorkspace: setActiveOrgState,
		getCurrentOrganizationId
	} = options;

	function setActiveWorkspace(workspaceId: string | null) {
		// Capture previous org ID BEFORE calling setActiveOrgState
		const previousOrganizationId = getCurrentOrganizationId();

		// Use state composable to set workspace (handles state, storage, validation)
		setActiveOrgState(workspaceId);

		// Get target org for analytics
		const list = workspaces();
		const targetOrgId = workspaceId || (list.length > 0 ? list[0].workspaceId : null);
		if (!targetOrgId) return;

		const targetOrg = list.find((org) => org.workspaceId === targetOrgId);
		const availableCircleCount = targetOrg?.teamCount ?? 0; // TODO: Replace teamCount with circleCount when available

		// Analytics tracking (non-critical, skip if not ready)
		if (convexClient) {
			const currentUserId = getUserId();
			if (!currentUserId) {
				console.debug('⏭️ Skipping workspace switch tracking - user not authenticated yet');
				return;
			}
			const sessionId = getSessionId();
			if (!sessionId) {
				console.debug('⏭️ Skipping workspace switch tracking - missing sessionId');
				return;
			}

			const mutationArgs: {
				sessionId: string;
				fromOrganizationId?: Id<'workspaces'>;
				toOrganizationId: Id<'workspaces'>;
				availableCircleCount: number;
			} = {
				sessionId,
				toOrganizationId: targetOrgId as Id<'workspaces'>,
				availableCircleCount
			};

			if (previousOrganizationId) {
				mutationArgs.fromOrganizationId = previousOrganizationId as Id<'workspaces'>;
			}

			convexClient
				.mutation(api.core.workspaces.index.recordOrganizationSwitch, mutationArgs)
				.catch((_error) => {
					console.warn('Failed to record workspace switch', _error);
				});
		}

		// TEMPORARY: Client-side PostHog capture for testing
		// TODO: Remove once server-side analytics via HTTP action bridge is implemented
		if (browser && typeof posthog !== 'undefined') {
			try {
				const properties: Record<string, unknown> = {
					scope: 'workspace',
					toOrganizationId: targetOrgId,
					availableCircleCount
				};

				if (previousOrganizationId) {
					properties.fromOrganizationId = previousOrganizationId;
				}

				posthog.capture(AnalyticsEventName.ORGANIZATION_SWITCHED, properties);
				console.log(
					'📊 [TEST] PostHog event captured:',
					AnalyticsEventName.ORGANIZATION_SWITCHED,
					properties
				);
			} catch (_error) {
				console.warn('Failed to capture PostHog event', _error);
			}
		}
	}

	return {
		setActiveWorkspace
	};
}

/**
 * Organization Analytics Composable
 *
 * Extracted from useOrganizations for testability and maintainability.
 * Handles analytics tracking for organization switches (Convex + PostHog).
 *
 * Part of SYOS-255 refactoring effort.
 */

import { browser } from '$app/environment';
import { api } from '$lib/convex';
import { AnalyticsEventName } from '$lib/infrastructure/analytics/events';
import posthog from 'posthog-js';
import type { Id } from '$lib/convex';
import type { ConvexClient } from 'convex/browser';
import type { OrganizationSummary } from './useOrganizations.svelte';

export interface UseOrganizationAnalyticsOptions {
	convexClient: ConvexClient | null;
	getUserId: () => string | undefined;
	organizations: () => OrganizationSummary[]; // Reactive function to get organizations list
	setActiveOrganization: (organizationId: string | null) => void; // State composable function
	getCurrentOrganizationId: () => string | null; // Reactive function to get current org ID (captures before change)
}

export interface UseOrganizationAnalyticsReturn {
	setActiveOrganization: (organizationId: string | null) => void;
}

/**
 * Analytics Composable
 *
 * Wraps setActiveOrganization with analytics tracking (Convex mutation + PostHog).
 * Tracks organization switches for product analytics.
 */
export function useOrganizationAnalytics(
	options: UseOrganizationAnalyticsOptions
): UseOrganizationAnalyticsReturn {
	const {
		convexClient,
		getUserId,
		organizations,
		setActiveOrganization: setActiveOrgState,
		getCurrentOrganizationId
	} = options;

	function setActiveOrganization(organizationId: string | null) {
		// Capture previous org ID BEFORE calling setActiveOrgState
		const previousOrganizationId = getCurrentOrganizationId();

		// Use state composable to set organization (handles state, storage, validation)
		setActiveOrgState(organizationId);

		// Get target org for analytics
		const list = organizations();
		const targetOrgId = organizationId || (list.length > 0 ? list[0].organizationId : null);
		if (!targetOrgId) return;

		const targetOrg = list.find((org) => org.organizationId === targetOrgId);
		const availableCircleCount = targetOrg?.teamCount ?? 0; // TODO: Replace teamCount with circleCount when available

		// Analytics tracking (non-critical, skip if not ready)
		if (convexClient) {
			const currentUserId = getUserId();
			if (!currentUserId) {
				console.debug('⏭️ Skipping organization switch tracking - user not authenticated yet');
				return;
			}

			const mutationArgs: {
				fromOrganizationId?: Id<'organizations'>;
				toOrganizationId: Id<'organizations'>;
				availableCircleCount: number;
			} = {
				toOrganizationId: targetOrgId as Id<'organizations'>,
				availableCircleCount
			};

			if (previousOrganizationId) {
				mutationArgs.fromOrganizationId = previousOrganizationId as Id<'organizations'>;
			}

			convexClient
				.mutation(api.organizations.recordOrganizationSwitch, mutationArgs)
				.catch((_error) => {
					console.warn('Failed to record organization switch', _error);
				});
		}

		// TEMPORARY: Client-side PostHog capture for testing
		// TODO: Remove once server-side analytics via HTTP action bridge is implemented
		if (browser && typeof posthog !== 'undefined') {
			try {
				const properties: Record<string, unknown> = {
					scope: 'organization',
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
		setActiveOrganization
	};
}

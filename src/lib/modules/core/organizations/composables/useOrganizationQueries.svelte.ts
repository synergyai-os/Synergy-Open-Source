/**
 * Organization Queries Composable
 *
 * Extracted from useOrganizations for testability and maintainability.
 * Handles all Convex query subscriptions for organizations and invites.
 *
 * Part of SYOS-255 refactoring effort.
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api } from '$lib/convex';
import type { OrganizationSummary, OrganizationInvite } from './useOrganizations.svelte';

export interface UseOrganizationQueriesOptions {
	getSessionId: () => string | undefined;
	activeOrganizationId: () => string | null; // Reactive function to get active org ID
	initialOrganizations?: OrganizationSummary[];
	initialOrganizationInvites?: OrganizationInvite[];
}

export interface UseOrganizationQueriesReturn {
	get organizations(): OrganizationSummary[];
	get organizationInvites(): OrganizationInvite[];
	get isLoading(): boolean;
	organizationsQuery: ReturnType<typeof useQuery> | null;
}

export function useOrganizationQueries(
	options: UseOrganizationQueriesOptions
): UseOrganizationQueriesReturn {
	const {
		getSessionId,
		activeOrganizationId: _activeOrganizationId,
		initialOrganizations,
		initialOrganizationInvites
	} = options;

	// Organizations query
	const organizationsQuery =
		browser && getSessionId()
			? useQuery(api.organizations.listOrganizations, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check
					return { sessionId };
				})
			: null;

	// Organization invites query
	const organizationInvitesQuery =
		browser && getSessionId()
			? useQuery(api.organizations.listOrganizationInvites, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required');
					return { sessionId };
				})
			: null;

	// Loading state
	const isLoading = $derived(organizationsQuery ? organizationsQuery.data === undefined : false);

	// Derived data: Use server-side initial data immediately, then use query data when available (more up-to-date)
	const organizations = $derived((): OrganizationSummary[] => {
		// If query has data, use it (more up-to-date)
		if (organizationsQuery?.data !== undefined) {
			return (
				organizationsQuery.data as unknown as Array<{
					organizationId: string;
					name: string;
					initials: string;
					slug: string;
					plan: string;
					role: 'owner' | 'admin' | 'member';
					joinedAt: number;
					memberCount: number;
				}>
			).map((org) => ({
				organizationId: org.organizationId,
				name: org.name,
				initials: org.initials,
				slug: org.slug,
				plan: org.plan,
				role: org.role,
				joinedAt: org.joinedAt,
				memberCount: org.memberCount,
				teamCount: 0 // Teams removed - always 0
			}));
		}
		// Otherwise use server-side initial data for instant rendering
		return initialOrganizations ?? [];
	});

	const organizationInvites = $derived((): OrganizationInvite[] => {
		// If query has data, use it (more up-to-date)
		if (organizationInvitesQuery?.data !== undefined) {
			return organizationInvitesQuery.data as OrganizationInvite[];
		}
		// Otherwise use server-side initial data for instant rendering
		return initialOrganizationInvites ?? [];
	});

	return {
		get organizations() {
			return organizations();
		},
		get organizationInvites() {
			return organizationInvites();
		},
		get isLoading() {
			return isLoading;
		},
		organizationsQuery
	};
}

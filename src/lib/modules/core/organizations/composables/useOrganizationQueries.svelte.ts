/**
 * Organization Queries Composable
 *
 * Extracted from useOrganizations for testability and maintainability.
 * Handles all Convex query subscriptions for organizations, invites, and teams.
 *
 * Part of SYOS-255 refactoring effort.
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';
import type {
	OrganizationSummary,
	OrganizationInvite,
	TeamInvite,
	TeamSummary
} from './useOrganizations.svelte';

export interface UseOrganizationQueriesOptions {
	getSessionId: () => string | undefined;
	activeOrganizationId: () => string | null; // Reactive function to get active org ID
	initialOrganizations?: OrganizationSummary[];
	initialOrganizationInvites?: OrganizationInvite[];
	initialTeamInvites?: TeamInvite[];
	initialTeams?: TeamSummary[];
}

export interface UseOrganizationQueriesReturn {
	get organizations(): OrganizationSummary[];
	get organizationInvites(): OrganizationInvite[];
	get teamInvites(): TeamInvite[];
	get teams(): TeamSummary[];
	get isLoading(): boolean;
	organizationsQuery: ReturnType<typeof useQuery> | null;
}

export function useOrganizationQueries(
	options: UseOrganizationQueriesOptions
): UseOrganizationQueriesReturn {
	const {
		getSessionId,
		activeOrganizationId,
		initialOrganizations,
		initialOrganizationInvites,
		initialTeamInvites,
		initialTeams
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

	// Team invites query
	const teamInvitesQuery =
		browser && getSessionId()
			? useQuery(api.teams.listTeamInvites, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required');
					return { sessionId };
				})
			: null;

	// Teams query - depends on activeOrganizationId
	const teamsQuery =
		browser && getSessionId()
			? useQuery(api.teams.listTeams, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check

					const organizationId = activeOrganizationId();
					return {
						sessionId,
						...(organizationId ? { organizationId: organizationId as Id<'organizations'> } : {})
					};
				})
			: null;

	// Loading state
	const isLoading = $derived(organizationsQuery ? organizationsQuery.data === undefined : false);

	// Derived data: Use server-side initial data immediately, then use query data when available (more up-to-date)
	const organizations = $derived((): OrganizationSummary[] => {
		// If query has data, use it (more up-to-date)
		if (organizationsQuery?.data !== undefined) {
			return (organizationsQuery.data as OrganizationSummary[]).map((org: OrganizationSummary) => ({
				organizationId: org.organizationId,
				name: org.name,
				initials: org.initials,
				slug: org.slug,
				plan: org.plan,
				role: org.role,
				joinedAt: org.joinedAt,
				memberCount: org.memberCount,
				teamCount: org.teamCount
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

	const teamInvites = $derived((): TeamInvite[] => {
		// If query has data, use it (more up-to-date)
		if (teamInvitesQuery?.data !== undefined) {
			return teamInvitesQuery.data as TeamInvite[];
		}
		// Otherwise use server-side initial data for instant rendering
		return initialTeamInvites ?? [];
	});

	const teams = $derived((): TeamSummary[] => {
		// If query has data, use it (more up-to-date)
		if (teamsQuery?.data !== undefined) {
			return (teamsQuery.data as TeamSummary[]).map((team: TeamSummary) => ({
				teamId: team.teamId,
				organizationId: team.organizationId,
				name: team.name,
				slug: team.slug,
				memberCount: team.memberCount,
				role: team.role,
				joinedAt: team.joinedAt
			}));
		}
		// Otherwise use server-side initial data for instant rendering
		return initialTeams ?? [];
	});

	return {
		get organizations() {
			return organizations();
		},
		get organizationInvites() {
			return organizationInvites();
		},
		get teamInvites() {
			return teamInvites();
		},
		get teams() {
			return teams();
		},
		get isLoading() {
			return isLoading;
		},
		organizationsQuery
	};
}

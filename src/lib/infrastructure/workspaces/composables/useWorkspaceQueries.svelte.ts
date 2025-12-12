/**
 * Organization Queries Composable
 *
 * Extracted from useWorkspaces for testability and maintainability.
 * Handles all Convex query subscriptions for workspaces and invites.
 *
 * Part of SYOS-255 refactoring effort.
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api } from '$lib/convex';
import type { WorkspaceSummary, WorkspaceInvite } from './useWorkspaces.svelte';
import { invariant } from '$lib/utils/invariant';

export interface UseOrganizationQueriesOptions {
	getSessionId: () => string | undefined;
	activeWorkspaceId: () => string | null; // Reactive function to get active org ID
	initialOrganizations?: WorkspaceSummary[];
	initialOrganizationInvites?: WorkspaceInvite[];
}

export interface UseOrganizationQueriesReturn {
	get workspaces(): WorkspaceSummary[];
	get workspaceInvites(): WorkspaceInvite[];
	get isLoading(): boolean;
	organizationsQuery: ReturnType<typeof useQuery> | null;
}

export function useWorkspaceQueries(
	options: UseOrganizationQueriesOptions
): UseOrganizationQueriesReturn {
	const {
		getSessionId,
		activeWorkspaceId: _activeOrganizationId,
		initialOrganizations,
		initialOrganizationInvites
	} = options;

	// Organizations query
	const organizationsQuery =
		browser && getSessionId()
			? useQuery(api.core.workspaces.index.listWorkspaces, () => {
					const sessionId = getSessionId();
					invariant(sessionId, 'sessionId required'); // Should not happen due to outer check
					return { sessionId };
				})
			: null;

	// Organization invites query
	const organizationInvitesQuery =
		browser && getSessionId()
			? useQuery(api.core.workspaces.index.listWorkspaceInvites, () => {
					const sessionId = getSessionId();
					invariant(sessionId, 'sessionId required');
					return { sessionId };
				})
			: null;

	// Loading state
	const isLoading = $derived(organizationsQuery ? organizationsQuery.data === undefined : false);

	// Derived data: Use server-side initial data immediately, then use query data when available (more up-to-date)
	const workspaces = $derived((): WorkspaceSummary[] => {
		// If query has data, use it (more up-to-date)
		if (organizationsQuery?.data !== undefined) {
			return (
				organizationsQuery.data as unknown as Array<{
					workspaceId: string;
					name: string;
					initials: string;
					slug: string;
					plan: string;
					role: 'owner' | 'admin' | 'member';
					joinedAt: number;
					memberCount: number;
				}>
			).map((org) => ({
				workspaceId: org.workspaceId,
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

	const workspaceInvites = $derived((): WorkspaceInvite[] => {
		// If query has data, use it (more up-to-date)
		if (organizationInvitesQuery?.data !== undefined) {
			return organizationInvitesQuery.data as WorkspaceInvite[];
		}
		// Otherwise use server-side initial data for instant rendering
		return initialOrganizationInvites ?? [];
	});

	return {
		get workspaces() {
			return workspaces();
		},
		get workspaceInvites() {
			return workspaceInvites();
		},
		get isLoading() {
			return isLoading;
		},
		organizationsQuery
	};
}

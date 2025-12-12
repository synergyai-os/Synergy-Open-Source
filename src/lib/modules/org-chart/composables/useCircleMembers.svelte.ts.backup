import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import type { CircleMember } from './useCircles.svelte';

export type UseCircleMembers = ReturnType<typeof useCircleMembers>;

/**
 * Composable for managing circle members queries
 * Extracted from CircleMembersPanel.svelte to fix separation of concerns
 */
export function useCircleMembers(options: {
	sessionId: () => string | undefined;
	organizationId: () => string | undefined;
	members: () => CircleMember[];
}) {
	const getSessionId = options.sessionId;
	const getOrganizationId = options.organizationId;
	const getMembers = options.members;

	// Query organization members to show in dropdown
	const orgMembersQuery =
		browser && getSessionId() && getOrganizationId()
			? useQuery(api.organizations.getMembers, () => {
					const sessionId = getSessionId();
					const organizationId = getOrganizationId();
					if (!sessionId || !organizationId)
						throw new Error('sessionId and organizationId required');
					return { sessionId, organizationId: organizationId as Id<'organizations'> };
				})
			: null;

	const orgMembers = $derived(orgMembersQuery?.data ?? []);

	// Filter out users who are already members
	const availableUsers = $derived(
		orgMembers.filter((user) => !getMembers().some((m) => m.userId === user.userId))
	);

	return {
		get orgMembers() {
			return orgMembers;
		},
		get members() {
			return getMembers();
		},
		get availableUsers() {
			return availableUsers;
		}
	};
}

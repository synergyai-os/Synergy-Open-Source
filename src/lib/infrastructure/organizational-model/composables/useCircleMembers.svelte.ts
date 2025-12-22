import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import type { CircleMember } from './useCircles.svelte';
import { invariant } from '$lib/utils/invariant';

export type UseCircleMembers = ReturnType<typeof useCircleMembers>;

/**
 * Composable for managing circle members queries
 * Extracted from CircleMembersPanel.svelte to fix separation of concerns
 */
export function useCircleMembers(options: {
	sessionId: () => string | undefined;
	workspaceId: () => string | undefined;
	members: () => CircleMember[];
}) {
	const getSessionId = options.sessionId;
	const getWorkspaceId = options.workspaceId;
	const getMembers = options.members;

	// Query workspace members to show in dropdown
	const orgMembersQuery =
		browser && getSessionId() && getWorkspaceId()
			? useQuery(api.core.workspaces.index.listMembers, () => {
					const sessionId = getSessionId();
					const workspaceId = getWorkspaceId();
					invariant(sessionId && workspaceId, 'sessionId and workspaceId required');
					return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
				})
			: null;

	const orgMembers = $derived(orgMembersQuery?.data ?? []);

	// Filter out people who are already members
	const availablePersons = $derived(
		orgMembers.filter(
			(member) => member.personId && !getMembers().some((m) => m.personId === member.personId)
		)
	);

	return {
		get orgMembers() {
			return orgMembers;
		},
		get members() {
			return getMembers();
		},
		get availablePersons() {
			return availablePersons;
		}
	};
}

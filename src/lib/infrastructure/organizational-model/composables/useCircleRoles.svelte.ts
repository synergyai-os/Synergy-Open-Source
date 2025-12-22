import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import type { CircleMember } from './useCircles.svelte';
import { invariant } from '$lib/utils/invariant';

export type UseCircleRoles = ReturnType<typeof useCircleRoles>;

/**
 * Composable for managing circle roles queries
 * Extracted from CircleRolesPanel.svelte to fix separation of concerns
 */
export function useCircleRoles(options: {
	sessionId: () => string | undefined;
	expandedRoleId: () => string | null;
	members: () => CircleMember[];
}) {
	const getSessionId = options.sessionId;
	const getExpandedRoleId = options.expandedRoleId;
	const getMembers = options.members;

	// Query role fillers when a role is expanded
	// We use $derived to make the query reactive to expandedRoleId changes
	const fillersQuery = $derived.by(() => {
		if (!browser || !getSessionId() || !getExpandedRoleId()) return null;

		return useQuery(api.core.roles.index.getRoleFillers, () => {
			const sessionId = getSessionId();
			const roleId = getExpandedRoleId();
			invariant(sessionId && roleId, 'sessionId and roleId required');
			return { sessionId, circleRoleId: roleId as Id<'circleRoles'> };
		});
	});

	const roleFillers = $derived(fillersQuery?.data ?? []);

	// Filter out people who are already assigned to this role
	const availablePersons = $derived(
		getMembers().filter((member) => !roleFillers.some((f) => f.personId === member.personId))
	);

	return {
		get roleFillers() {
			return roleFillers;
		},
		get availablePersons() {
			return availablePersons;
		}
	};
}

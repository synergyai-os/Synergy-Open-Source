import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import type { CircleMember, RoleFiller } from './useCircles.svelte';

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

		return useQuery(api.circleRoles.getRoleFillers, () => {
			const sessionId = getSessionId();
			const roleId = getExpandedRoleId();
			if (!sessionId || !roleId) throw new Error('sessionId and roleId required');
			return { sessionId, circleRoleId: roleId as Id<'circleRoles'> };
		});
	});

	const roleFillers = $derived(fillersQuery?.data ?? []);

	// Filter out users who are already assigned to this role
	const availableUsers = $derived(
		getMembers().filter((member) => !roleFillers.some((f) => f.userId === member.userId))
	);

	return {
		get roleFillers() {
			return roleFillers;
		},
		get availableUsers() {
			return availableUsers;
		}
	};
}

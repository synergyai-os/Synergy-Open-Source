import { browser } from '$app/environment';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { toast } from '$lib/utils/toast';

export type OrganizationMember = {
	userId: Id<'users'>;
	email: string;
	name: string;
	role: 'owner' | 'admin' | 'member';
	joinedAt: number;
};

export type UseOrganizationMembers = ReturnType<typeof useOrganizationMembers>;

export function useOrganizationMembers(options: {
	sessionId: () => string | undefined;
	organizationId: () => string | undefined;
}) {
	const convexClient = browser ? useConvexClient() : null;
	const getSessionId = options.sessionId;
	const getOrganizationId = options.organizationId;

	const state = $state({
		loading: {
			remove: false
		}
	});

	// Query organization members
	const membersQuery =
		browser && getSessionId() && getOrganizationId()
			? useQuery(api.organizations.getMembers, () => {
					const sessionId = getSessionId();
					const organizationId = getOrganizationId();
					if (!sessionId || !organizationId)
						throw new Error('sessionId and organizationId required');
					return { sessionId, organizationId: organizationId as Id<'organizations'> };
				})
			: null;

	return {
		// Getters - reactive access
		get members() {
			return membersQuery?.data ?? [];
		},
		get loading() {
			return state.loading;
		},

		// Mutations
		removeMember: async (args: { organizationId: string; userId: string }) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			if (!sessionId) throw new Error('sessionId required');

			state.loading.remove = true;
			try {
				await convexClient.mutation(api.organizations.removeOrganizationMember, {
					sessionId,
					organizationId: args.organizationId as Id<'organizations'>,
					targetUserId: args.userId as Id<'users'>
				});

				toast.success('Member removed');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to remove member';
				toast.error(message);
				throw error;
			} finally {
				state.loading.remove = false;
			}
		}
	};
}

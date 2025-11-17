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
			remove: false,
			invite: false,
			resend: false
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

	// Query organization invites
	const invitesQuery =
		browser && getSessionId() && getOrganizationId()
			? useQuery(api.organizations.getOrganizationInvites, () => {
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
		get invites() {
			return invitesQuery?.data ?? [];
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
		},

		inviteMember: async (email: string) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			const organizationId = getOrganizationId();
			if (!sessionId || !organizationId) throw new Error('sessionId and organizationId required');

			state.loading.invite = true;
			try {
				const result = await convexClient.mutation(api.organizations.createOrganizationInvite, {
					sessionId,
					organizationId: organizationId as Id<'organizations'>,
					email
				});
				return result.code;
			} catch (error) {
				let message = 'Failed to create invite';
				if (error instanceof Error) {
					// Make error messages more user-friendly
					if (error.message.includes('already exists')) {
						message = 'This user has already been invited';
					} else if (error.message.includes('Invalid email')) {
						message = 'Please enter a valid email address';
					} else {
						message = error.message;
					}
				}
				toast.error(message);
				throw error;
			} finally {
				state.loading.invite = false;
			}
		},

		resendInvite: async (inviteId: string) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			if (!sessionId) throw new Error('sessionId required');

			state.loading.resend = true;
			try {
				await convexClient.mutation(api.organizations.resendOrganizationInvite, {
					sessionId,
					inviteId: inviteId as Id<'organizationInvites'>
				});

				toast.success('Invite email resent');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to resend invite';
				toast.error(message);
				throw error;
			} finally {
				state.loading.resend = false;
			}
		}
	};
}

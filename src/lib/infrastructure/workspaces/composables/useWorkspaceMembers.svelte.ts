import { browser } from '$app/environment';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { toast } from '$lib/utils/toast';
import { invariant } from '$lib/utils/invariant';

export type WorkspaceMember = {
	userId: Id<'users'>;
	email: string;
	name: string;
	role: 'owner' | 'admin' | 'member';
	joinedAt: number;
};

export type UseOrganizationMembers = ReturnType<typeof useWorkspaceMembers>;

export function useWorkspaceMembers(options: {
	sessionId: () => string | undefined;
	workspaceId: () => string | undefined;
}) {
	const convexClient = browser ? useConvexClient() : null;
	const getSessionId = options.sessionId;
	const getWorkspaceId = options.workspaceId;

	const state = $state({
		loading: {
			remove: false,
			invite: false,
			resend: false
		}
	});

	// Query workspace members
	const membersQuery =
		browser && getSessionId() && getWorkspaceId()
			? useQuery(api.workspaces.listMembers, () => {
					const sessionId = getSessionId();
					const workspaceId = getWorkspaceId();
					invariant(sessionId && workspaceId, 'sessionId and workspaceId required');
					return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
				})
			: null;

	// Query workspace invites
	const invitesQuery =
		browser && getSessionId() && getWorkspaceId()
			? useQuery(api.workspaces.getWorkspaceInvites, () => {
					const sessionId = getSessionId();
					const workspaceId = getWorkspaceId();
					invariant(sessionId && workspaceId, 'sessionId and workspaceId required');
					return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
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
		removeMember: async (args: { workspaceId: string; userId: string }) => {
			invariant(convexClient, 'Convex client not available');
			const sessionId = getSessionId();
			invariant(sessionId, 'sessionId required');

			state.loading.remove = true;
			try {
				await convexClient.mutation(api.workspaces.removeOrganizationMember, {
					sessionId,
					workspaceId: args.workspaceId as Id<'workspaces'>,
					userId: args.userId as Id<'users'>
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
			invariant(convexClient, 'Convex client not available');
			const sessionId = getSessionId();
			const workspaceId = getWorkspaceId();
			invariant(sessionId && workspaceId, 'sessionId and workspaceId required');

			state.loading.invite = true;
			try {
				const result = await convexClient.mutation(api.workspaces.createWorkspaceInvite, {
					sessionId,
					workspaceId: workspaceId as Id<'workspaces'>,
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
			invariant(convexClient, 'Convex client not available');
			const sessionId = getSessionId();
			invariant(sessionId, 'sessionId required');

			state.loading.resend = true;
			try {
				await convexClient.mutation(api.workspaces.resendOrganizationInvite, {
					sessionId,
					inviteId: inviteId as Id<'workspaceInvites'>
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

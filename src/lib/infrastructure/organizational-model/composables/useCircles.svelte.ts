import { browser } from '$app/environment';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { toast } from '$lib/utils/toast';

export type CircleSummary = {
	circleId: Id<'circles'>;
	workspaceId: Id<'workspaces'>;
	name: string;
	slug: string;
	purpose?: string;
	parentCircleId?: Id<'circles'>;
	parentName?: string | null;
	memberCount: number;
	circleType?: 'hierarchy' | 'empowered_team' | 'guild' | 'hybrid';
	decisionModel?: 'manager_decides' | 'team_consensus' | 'consent' | 'coordination_only';
	createdAt: number;
	updatedAt: number;
	archivedAt?: number;
};

export type CircleMember = {
	userId: Id<'users'>;
	email: string;
	name: string;
	joinedAt: number;
};

export type CircleRole = {
	roleId: Id<'circleRoles'>;
	circleId: Id<'circles'>;
	name: string;
	purpose?: string;
	fillerCount: number;
	createdAt: number;
};

export type RoleFiller = {
	userId: Id<'users'>;
	email: string;
	name: string;
	assignedAt: number;
	assignedBy: Id<'users'>;
	assignedByName: string;
};

type ModalKey = 'createCircle' | 'createRole';

export type UseCircles = ReturnType<typeof useCircles>;

export function useCircles(options: {
	sessionId: () => string | undefined;
	workspaceId: () => string | undefined;
	circleId?: () => string | undefined;
}) {
	const convexClient = browser ? useConvexClient() : null;
	const getSessionId = options.sessionId;
	const getWorkspaceId = options.workspaceId;
	const getCircleId = options.circleId;

	const state = $state({
		modals: {
			createCircle: false,
			createRole: false
		},
		loading: {
			createCircle: false,
			updateCircle: false,
			addMember: false,
			removeMember: false,
			createRole: false,
			updateRole: false,
			deleteRole: false,
			assignUser: false,
			removeUser: false
		}
	});

	// Query circles list
	const circlesQuery =
		browser && getSessionId() && getWorkspaceId()
			? useQuery(api.circles.list, () => {
					const sessionId = getSessionId();
					const workspaceId = getWorkspaceId();
					if (!sessionId || !workspaceId) throw new Error('sessionId and workspaceId required');
					return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
				})
			: null;

	// Query single circle
	const circleQuery =
		browser && getSessionId() && getCircleId && getCircleId()
			? useQuery(api.circles.get, () => {
					const sessionId = getSessionId();
					const circleId = getCircleId?.();
					if (!sessionId || !circleId) throw new Error('sessionId and circleId required');
					return { sessionId, circleId: circleId as Id<'circles'> };
				})
			: null;

	// Query circle members
	const membersQuery =
		browser && getSessionId() && getCircleId && getCircleId()
			? useQuery(api.circles.getMembers, () => {
					const sessionId = getSessionId();
					const circleId = getCircleId?.();
					if (!sessionId || !circleId) throw new Error('sessionId and circleId required');
					return { sessionId, circleId: circleId as Id<'circles'> };
				})
			: null;

	// Query circle roles
	const rolesQuery =
		browser && getSessionId() && getCircleId && getCircleId()
			? useQuery(api.circleRoles.listByCircle, () => {
					const sessionId = getSessionId();
					const circleId = getCircleId?.();
					if (!sessionId || !circleId) throw new Error('sessionId and circleId required');
					return { sessionId, circleId: circleId as Id<'circles'> };
				})
			: null;

	return {
		// Getters - reactive access
		get circles() {
			return circlesQuery?.data ?? [];
		},
		get circle() {
			return circleQuery?.data ?? null;
		},
		get members() {
			return membersQuery?.data ?? [];
		},
		get roles() {
			return rolesQuery?.data ?? [];
		},
		get modals() {
			return state.modals;
		},
		get loading() {
			return state.loading;
		},

		// Modal management
		openModal: (modal: ModalKey) => {
			state.modals[modal] = true;
		},
		closeModal: (modal: ModalKey) => {
			state.modals[modal] = false;
		},

		// Mutations
		createCircle: async (args: { name: string; purpose?: string; parentCircleId?: string }) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			const workspaceId = getWorkspaceId();
			if (!sessionId || !workspaceId) throw new Error('sessionId and workspaceId required');

			state.loading.createCircle = true;
			try {
				const result = await convexClient.mutation(api.circles.create, {
					sessionId,
					workspaceId: workspaceId as Id<'workspaces'>,
					name: args.name,
					purpose: args.purpose,
					parentCircleId: args.parentCircleId as Id<'circles'> | undefined
				});

				toast.success(`Circle "${args.name}" created`);
				state.modals.createCircle = false;
				return result;
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to create circle';
				toast.error(message);
				throw error;
			} finally {
				state.loading.createCircle = false;
			}
		},

		updateCircle: async (args: {
			circleId: string;
			name?: string;
			purpose?: string;
			parentCircleId?: string;
		}) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			if (!sessionId) throw new Error('sessionId required');

			state.loading.updateCircle = true;
			try {
				await convexClient.mutation(api.circles.update, {
					sessionId,
					circleId: args.circleId as Id<'circles'>,
					name: args.name,
					purpose: args.purpose,
					parentCircleId: args.parentCircleId as Id<'circles'> | undefined
				});

				toast.success('Circle updated');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to update circle';
				toast.error(message);
				throw error;
			} finally {
				state.loading.updateCircle = false;
			}
		},

		addMember: async (args: { circleId: string; userId: string }) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			if (!sessionId) throw new Error('sessionId required');

			state.loading.addMember = true;
			try {
				await convexClient.mutation(api.circles.addMember, {
					sessionId,
					circleId: args.circleId as Id<'circles'>,
					userId: args.userId as Id<'users'>
				});

				toast.success('Member added');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to add member';
				toast.error(message);
				throw error;
			} finally {
				state.loading.addMember = false;
			}
		},

		removeMember: async (args: { circleId: string; userId: string }) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			if (!sessionId) throw new Error('sessionId required');

			state.loading.removeMember = true;
			try {
				await convexClient.mutation(api.circles.removeMember, {
					sessionId,
					circleId: args.circleId as Id<'circles'>,
					userId: args.userId as Id<'users'>
				});

				toast.success('Member removed');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to remove member';
				toast.error(message);
				throw error;
			} finally {
				state.loading.removeMember = false;
			}
		},

		createRole: async (args: { circleId: string; name: string; purpose?: string }) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			if (!sessionId) throw new Error('sessionId required');

			state.loading.createRole = true;
			try {
				const result = await convexClient.mutation(api.circleRoles.create, {
					sessionId,
					circleId: args.circleId as Id<'circles'>,
					name: args.name,
					purpose: args.purpose
				});

				toast.success(`Role "${args.name}" created`);
				state.modals.createRole = false;
				return result;
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to create role';
				toast.error(message);
				throw error;
			} finally {
				state.loading.createRole = false;
			}
		},

		updateRole: async (args: { circleRoleId: string; name?: string; purpose?: string }) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			if (!sessionId) throw new Error('sessionId required');

			state.loading.updateRole = true;
			try {
				await convexClient.mutation(api.circleRoles.update, {
					sessionId,
					circleRoleId: args.circleRoleId as Id<'circleRoles'>,
					name: args.name,
					purpose: args.purpose
				});

				toast.success('Role updated');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to update role';
				toast.error(message);
				throw error;
			} finally {
				state.loading.updateRole = false;
			}
		},

		deleteRole: async (args: { circleRoleId: string }) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			if (!sessionId) throw new Error('sessionId required');

			state.loading.deleteRole = true;
			try {
				await convexClient.mutation(api.circleRoles.deleteRole, {
					sessionId,
					circleRoleId: args.circleRoleId as Id<'circleRoles'>
				});

				toast.success('Role deleted');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to delete role';
				toast.error(message);
				throw error;
			} finally {
				state.loading.deleteRole = false;
			}
		},

		assignUserToRole: async (args: { circleRoleId: string; userId: string }) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			if (!sessionId) throw new Error('sessionId required');

			state.loading.assignUser = true;
			try {
				await convexClient.mutation(api.circleRoles.assignUser, {
					sessionId,
					circleRoleId: args.circleRoleId as Id<'circleRoles'>,
					userId: args.userId as Id<'users'>
				});

				toast.success('User assigned to role');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to assign user';
				toast.error(message);
				throw error;
			} finally {
				state.loading.assignUser = false;
			}
		},

		removeUserFromRole: async (args: { circleRoleId: string; userId: string }) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			if (!sessionId) throw new Error('sessionId required');

			state.loading.removeUser = true;
			try {
				await convexClient.mutation(api.circleRoles.removeUser, {
					sessionId,
					circleRoleId: args.circleRoleId as Id<'circleRoles'>,
					userId: args.userId as Id<'users'>
				});

				toast.success('User removed from role');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to remove user';
				toast.error(message);
				throw error;
			} finally {
				state.loading.removeUser = false;
			}
		}
	};
}

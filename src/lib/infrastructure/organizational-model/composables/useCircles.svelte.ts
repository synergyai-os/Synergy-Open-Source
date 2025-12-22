import { browser } from '$app/environment';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { toast } from '$lib/utils/toast';
import { invariant } from '$lib/utils/invariant';
import type { CircleType, DecisionModel } from '../constants';

export type CircleSummary = {
	circleId: Id<'circles'>;
	workspaceId: Id<'workspaces'>;
	name: string;
	slug: string;
	purpose?: string;
	parentCircleId?: Id<'circles'>;
	parentName?: string | null;
	memberCount: number;
	circleType?: CircleType;
	decisionModel?: DecisionModel;
	createdAt: number;
	updatedAt: number;
	archivedAt?: number;
};

export type CircleMember = {
	personId: Id<'people'>;
	email: string;
	displayName: string;
	status?: string;
	addedAt?: number;
	joinedAt?: number;
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
	personId: Id<'people'>;
	email: string;
	displayName: string;
	assignedAt: number;
	assignedByPersonId?: Id<'people'>;
	assignedByDisplayName?: string;
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
			archiveRole: false,
			assignPerson: false,
			removePerson: false
		}
	});

	// Query circles list
	const circlesQuery =
		browser && getSessionId() && getWorkspaceId()
			? useQuery(api.core.circles.index.list, () => {
					const sessionId = getSessionId();
					const workspaceId = getWorkspaceId();
					invariant(sessionId && workspaceId, 'sessionId and workspaceId required');
					return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
				})
			: null;

	// Query single circle
	const circleQuery =
		browser && getSessionId() && getCircleId && getCircleId()
			? useQuery(api.core.circles.index.get, () => {
					const sessionId = getSessionId();
					const circleId = getCircleId?.();
					invariant(sessionId && circleId, 'sessionId and circleId required');
					return { sessionId, circleId: circleId as Id<'circles'> };
				})
			: null;

	// Query circle members
	const membersQuery =
		browser && getSessionId() && getCircleId && getCircleId()
			? useQuery(api.core.circles.index.getMembers, () => {
					const sessionId = getSessionId();
					const circleId = getCircleId?.();
					invariant(sessionId && circleId, 'sessionId and circleId required');
					return { sessionId, circleId: circleId as Id<'circles'> };
				})
			: null;

	// Query circle roles
	const rolesQuery =
		browser && getSessionId() && getCircleId && getCircleId()
			? useQuery(api.core.roles.index.listByCircle, () => {
					const sessionId = getSessionId();
					const circleId = getCircleId?.();
					invariant(sessionId && circleId, 'sessionId and circleId required');
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
			invariant(convexClient, 'Convex client not available');
			const sessionId = getSessionId();
			const workspaceId = getWorkspaceId();
			invariant(sessionId && workspaceId, 'sessionId and workspaceId required');

			state.loading.createCircle = true;
			try {
				const result = await convexClient.mutation(api.core.circles.index.create, {
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
			invariant(convexClient, 'Convex client not available');
			const sessionId = getSessionId();
			invariant(sessionId, 'sessionId required');

			state.loading.updateCircle = true;
			try {
				await convexClient.mutation(api.core.circles.index.update, {
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

		addMember: async (args: { circleId: string; memberPersonId: string }) => {
			invariant(convexClient, 'Convex client not available');
			const sessionId = getSessionId();
			invariant(sessionId, 'sessionId required');

			state.loading.addMember = true;
			try {
				await convexClient.mutation(api.core.circles.index.addMember, {
					sessionId,
					circleId: args.circleId as Id<'circles'>,
					memberPersonId: args.memberPersonId as Id<'people'>
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

		removeMember: async (args: { circleId: string; memberPersonId: string }) => {
			invariant(convexClient, 'Convex client not available');
			const sessionId = getSessionId();
			invariant(sessionId, 'sessionId required');

			state.loading.removeMember = true;
			try {
				await convexClient.mutation(api.core.circles.index.removeMember, {
					sessionId,
					circleId: args.circleId as Id<'circles'>,
					memberPersonId: args.memberPersonId as Id<'people'>
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
			invariant(convexClient, 'Convex client not available');
			const sessionId = getSessionId();
			invariant(sessionId, 'sessionId required');

			state.loading.createRole = true;
			try {
				// Convert purpose to fieldValues format (SYOS-960)
				const fieldValues = args.purpose
					? [
							{
								systemKey: 'purpose',
								values: [args.purpose]
							}
						]
					: undefined;

				const result = await convexClient.mutation(api.core.roles.index.create, {
					sessionId,
					circleId: args.circleId as Id<'circles'>,
					name: args.name,
					fieldValues
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
			invariant(convexClient, 'Convex client not available');
			const sessionId = getSessionId();
			invariant(sessionId, 'sessionId required');

			state.loading.updateRole = true;
			try {
				await convexClient.mutation(api.core.roles.index.update, {
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

		archiveRole: async (args: { circleRoleId: string }) => {
			invariant(convexClient, 'Convex client not available');
			const sessionId = getSessionId();
			invariant(sessionId, 'sessionId required');

			state.loading.archiveRole = true;
			try {
				await convexClient.mutation(api.core.roles.index.archiveRole, {
					sessionId,
					circleRoleId: args.circleRoleId as Id<'circleRoles'>
				});

				toast.success('Role archived');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to archive role';
				toast.error(message);
				throw error;
			} finally {
				state.loading.archiveRole = false;
			}
		},

		assignPersonToRole: async (args: { circleRoleId: string; assigneePersonId: string }) => {
			invariant(convexClient, 'Convex client not available');
			const sessionId = getSessionId();
			invariant(sessionId, 'sessionId required');

			state.loading.assignPerson = true;
			try {
				await convexClient.mutation(api.core.roles.index.assignPerson, {
					sessionId,
					circleRoleId: args.circleRoleId as Id<'circleRoles'>,
					assigneePersonId: args.assigneePersonId as Id<'people'>
				});

				toast.success('Person assigned to role');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to assign person';
				toast.error(message);
				throw error;
			} finally {
				state.loading.assignPerson = false;
			}
		},

		removePersonFromRole: async (args: { circleRoleId: string; assigneePersonId: string }) => {
			invariant(convexClient, 'Convex client not available');
			const sessionId = getSessionId();
			invariant(sessionId, 'sessionId required');

			state.loading.removePerson = true;
			try {
				await convexClient.mutation(api.core.roles.index.removePerson, {
					sessionId,
					circleRoleId: args.circleRoleId as Id<'circleRoles'>,
					assigneePersonId: args.assigneePersonId as Id<'people'>
				});

				toast.success('Person removed from role');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to remove person';
				toast.error(message);
				throw error;
			} finally {
				state.loading.removePerson = false;
			}
		}
	};
}

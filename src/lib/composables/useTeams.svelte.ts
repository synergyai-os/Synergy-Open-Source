import { browser } from '$app/environment';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { toast } from '$lib/utils/toast';

export type TeamSummary = {
	teamId: Id<'teams'>;
	organizationId: Id<'organizations'>;
	name: string;
	slug: string;
	createdAt: number;
	memberCount: number;
	role: 'admin' | 'member' | null;
	joinedAt: number | null;
};

export type TeamMember = {
	userId: Id<'users'>;
	email: string;
	name: string;
	role: 'admin' | 'member';
	joinedAt: number;
};

export type Team = {
	teamId: Id<'teams'>;
	organizationId: Id<'organizations'>;
	name: string;
	slug: string;
	createdAt: number;
	updatedAt: number;
	members: TeamMember[];
};

type ModalKey = 'createTeam';

export type UseTeams = ReturnType<typeof useTeams>;

export function useTeams(options: {
	sessionId: () => string | undefined;
	organizationId: () => string | undefined;
	teamId?: () => string | undefined;
}) {
	const convexClient = browser ? useConvexClient() : null;
	const getSessionId = options.sessionId;
	const getOrganizationId = options.organizationId;
	const getTeamId = options.teamId;

	const state = $state({
		modals: {
			createTeam: false
		},
		loading: {
			createTeam: false
		}
	});

	// Query teams list - wait for org context before querying
	const teamsQuery =
		browser && getSessionId() && getOrganizationId()
			? useQuery(api.teams.listTeams, () => {
					const sessionId = getSessionId();
					const organizationId = getOrganizationId();
					if (!sessionId || !organizationId)
						throw new Error('sessionId and organizationId required');
					return { sessionId, organizationId: organizationId as Id<'organizations'> };
				})
			: null;

	// Query single team by ID - wait for org context before querying
	const teamQuery =
		browser && getSessionId() && getOrganizationId() && getTeamId && getTeamId()
			? useQuery(api.teams.getTeamById, () => {
					const sessionId = getSessionId();
					const organizationId = getOrganizationId();
					const teamId = getTeamId?.();
					if (!sessionId || !organizationId || !teamId)
						throw new Error('sessionId, organizationId, and teamId required');
					return {
						sessionId,
						organizationId: organizationId as Id<'organizations'>,
						teamId: teamId as Id<'teams'>
					};
				})
			: null;

	return {
		// Getters - reactive access
		get teams() {
			return teamsQuery?.data ?? [];
		},
		get team() {
			return teamQuery?.data ?? null;
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
		createTeam: async (name: string) => {
			if (!convexClient) throw new Error('Convex client not available');
			const sessionId = getSessionId();
			const organizationId = getOrganizationId();
			if (!sessionId || !organizationId) throw new Error('sessionId and organizationId required');

			state.loading.createTeam = true;
			try {
				const result = await convexClient.mutation(api.teams.createTeam, {
					sessionId,
					organizationId: organizationId as Id<'organizations'>,
					name
				});

				toast.success(`Team "${name}" created`);
				return result;
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to create team';
				toast.error(message);
				throw error;
			} finally {
				state.loading.createTeam = false;
			}
		}
	};
}

import { browser } from '$app/environment';
import { useConvexClient } from 'convex-svelte';
import {
	getStorageKey,
	getStorageDetailsKey,
	getStoredActiveId,
	loadCachedOrg
} from './organizationStorage';
import { useOrganizationState } from './useOrganizationState.svelte';
import { useOrganizationQueries } from './useOrganizationQueries.svelte';
import { useOrganizationMutations } from './useOrganizationMutations.svelte';
import { useOrganizationUrlSync } from './useOrganizationUrlSync.svelte';
import { useOrganizationAnalytics } from './useOrganizationAnalytics.svelte';
import type { OrganizationsModuleAPI } from '../api';

// Re-export API interface for convenience (other modules can import from here or from api.ts)
export type { OrganizationsModuleAPI } from '../api';

export type OrganizationRole = 'owner' | 'admin' | 'member';

export type OrganizationSummary = {
	organizationId: string;
	name: string;
	initials: string;
	slug: string;
	plan: string;
	role: OrganizationRole;
	joinedAt: number;
	memberCount: number;
	teamCount: number;
};

export type TeamSummary = {
	teamId: string;
	organizationId: string;
	name: string;
	slug: string;
	memberCount: number;
	role: 'admin' | 'member' | null;
	joinedAt: number | null;
};

export type OrganizationInvite = {
	inviteId: string;
	organizationId: string;
	organizationName: string;
	role: OrganizationRole;
	invitedBy: string;
	invitedByName: string;
	code: string;
	createdAt: number;
};

export type TeamInvite = {
	inviteId: string;
	teamId: string;
	teamName: string;
	organizationId: string;
	organizationName: string;
	role: 'admin' | 'member';
	invitedBy: string;
	invitedByName: string;
	code: string;
	createdAt: number;
};

type ModalKey = 'createOrganization' | 'joinOrganization' | 'createTeam' | 'joinTeam';

export type UseOrganizations = ReturnType<typeof useOrganizations>;

const _SENTINEL_ORGANIZATION_ID = '000000000000000000000000';

export function useOrganizations(options?: {
	userId?: () => string | undefined;
	sessionId?: () => string | undefined;
	orgFromUrl?: () => string | null; // Reactive URL parameter (deprecated - handled by URL sync)
	initialOrganizations?: OrganizationSummary[]; // Server-side preloaded data for instant rendering
	initialOrganizationInvites?: OrganizationInvite[]; // Server-side preloaded data
	initialTeamInvites?: TeamInvite[]; // Server-side preloaded data
	initialTeams?: TeamSummary[]; // Server-side preloaded teams for active organization
}) {
	const convexClient = browser ? useConvexClient() : null;
	const getUserId = options?.userId || (() => undefined);
	const getSessionId = options?.sessionId || (() => undefined);

	// Get account-specific storage keys
	const currentUserId = browser ? getUserId() : undefined;
	const storageKey = getStorageKey(currentUserId);
	const storageDetailsKey = getStorageDetailsKey(currentUserId);

	// Load stored active organization ID and cached details
	const initialActiveId = browser ? getStoredActiveId(storageKey) : null;
	const cachedOrgDetails = browser && initialActiveId ? loadCachedOrg(storageDetailsKey) : null;

	// Modal state (simple local state, no need to extract)
	const state = $state({
		modals: {
			createOrganization: false,
			joinOrganization: false,
			createTeam: false,
			joinTeam: false
		}
	});

	// Initialize organization state composable first (needs initial data)
	// orgState will access queries reactively via functions, so we can initialize it first
	let orgState: ReturnType<typeof useOrganizationState>;

	// Initialize orgState with initial data (will be recreated with queries after queries initialize)
	orgState = useOrganizationState({
		userId: getUserId,
		organizationsData: () => options?.initialOrganizations ?? [], // Use initial data
		teamsData: () => options?.initialTeams ?? [], // Use initial data
		organizationsQuery: null, // Will be set after queries initialize (only used for loading check)
		initialActiveId,
		initialCachedOrg: cachedOrgDetails
	});

	// Initialize queries composable (teams query needs activeOrganizationId from orgState)
	// useQuery is reactive, so it will update when orgState.activeOrganizationId changes
	const queries = useOrganizationQueries({
		getSessionId,
		activeOrganizationId: () => orgState.activeOrganizationId, // Reactive function
		initialOrganizations: options?.initialOrganizations,
		initialOrganizationInvites: options?.initialOrganizationInvites,
		initialTeamInvites: options?.initialTeamInvites,
		initialTeams: options?.initialTeams
	});

	// Recreate orgState with queries reference (needed for loading state check)
	// orgState accesses queries reactively via functions, but needs organizationsQuery for loading check
	const orgStateWithQueries = useOrganizationState({
		userId: getUserId,
		organizationsData: () => queries.organizations, // Reactive getter
		teamsData: () => queries.teams, // Reactive getter
		organizationsQuery: queries.organizationsQuery,
		initialActiveId,
		initialCachedOrg: cachedOrgDetails
	});
	orgState = orgStateWithQueries;

	// Initialize analytics composable (wraps setActiveOrganization with tracking)
	const analytics = useOrganizationAnalytics({
		convexClient,
		getUserId,
		organizations: () => queries.organizations, // Reactive getter
		setActiveOrganization: orgState.setActiveOrganization,
		getCurrentOrganizationId: () => orgState.activeOrganizationId // Reactive getter (captures before change)
	});

	// Initialize URL sync composable (handles ?org=, ?create=organization, ?join=organization)
	useOrganizationUrlSync({
		setActiveOrganization: analytics.setActiveOrganization, // Use analytics wrapper
		openModal: (key: 'createOrganization' | 'joinOrganization') => {
			state.modals[key] = true;
		},
		activeOrganizationId: () => orgState.activeOrganizationId, // Reactive getter
		organizations: () => queries.organizations // Reactive getter
	});

	function setActiveOrganization(organizationId: string | null) {
		// Use analytics wrapper (includes tracking)
		analytics.setActiveOrganization(organizationId);
	}

	function setActiveTeam(teamId: string | null) {
		orgState.setActiveTeam(teamId);
	}

	function openModal(key: ModalKey) {
		state.modals[key] = true;
	}

	function closeModal(key: ModalKey) {
		state.modals[key] = false;
	}

	// Initialize mutations composable
	const mutations = useOrganizationMutations({
		convexClient,
		getSessionId,
		getUserId,
		activeOrganizationId: () => orgState.activeOrganizationId,
		setActiveOrganization,
		setActiveTeam,
		closeModal
	});

	// Return value implements OrganizationsModuleAPI interface
	// This enables loose coupling - other modules depend on the interface, not internal implementation
	const api: OrganizationsModuleAPI = {
		get organizations() {
			return queries.organizations;
		},
		get activeOrganizationId() {
			return orgState.activeOrganizationId;
		},
		get activeOrganization() {
			const list = queries.organizations;
			const realOrg = list.find((org) => org.organizationId === orgState.activeOrganizationId);

			// If we have real data, return it (prefer real over cached)
			if (realOrg) {
				return realOrg;
			}

			// While loading, return cached organization if available
			if (queries.isLoading && orgState.cachedOrganization) {
				return orgState.cachedOrganization;
			}

			return null;
		},
		get organizationInvites() {
			return queries.organizationInvites;
		},
		get teamInvites() {
			return queries.teamInvites;
		},
		get teams() {
			return queries.teams;
		},
		get activeTeamId() {
			return orgState.activeTeamId;
		},
		get modals() {
			return state.modals;
		},
		get loading() {
			return mutations.loading;
		},
		get isLoading() {
			return queries.isLoading;
		},
		get isSwitching() {
			return orgState.isSwitching;
		},
		get switchingTo() {
			return orgState.switchingTo;
		},
		get switchingToType() {
			return orgState.switchingToType;
		},
		setActiveOrganization,
		setActiveTeam,
		openModal,
		closeModal,
		createOrganization: mutations.createOrganization,
		joinOrganization: mutations.joinOrganization,
		createTeam: mutations.createTeam,
		joinTeam: mutations.joinTeam,
		acceptOrganizationInvite: mutations.acceptOrganizationInvite,
		declineOrganizationInvite: mutations.declineOrganizationInvite,
		acceptTeamInvite: mutations.acceptTeamInvite,
		declineTeamInvite: mutations.declineTeamInvite
	};

	return api;
}

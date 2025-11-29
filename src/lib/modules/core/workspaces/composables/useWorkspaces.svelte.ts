import { browser } from '$app/environment';
import { useConvexClient } from 'convex-svelte';
import {
	getStorageKey,
	getStorageDetailsKey,
	getStoredActiveId,
	loadCachedOrg
} from './workspaceStorage';
import { useWorkspaceState } from './useWorkspaceState.svelte';
import { useWorkspaceQueries } from './useWorkspaceQueries.svelte';
import { useWorkspaceMutations } from './useWorkspaceMutations.svelte';
import { useWorkspaceUrlSync } from './useWorkspaceUrlSync.svelte';
import { useWorkspaceAnalytics } from './useWorkspaceAnalytics.svelte';
import type { WorkspacesModuleAPI } from '../api';

// Re-export API interface for convenience (other modules can import from here or from api.ts)
export type { WorkspacesModuleAPI } from '../api';

export type OrganizationRole = 'owner' | 'admin' | 'member';

export type WorkspaceSummary = {
	workspaceId: string;
	name: string;
	initials: string;
	slug: string;
	plan: string;
	role: OrganizationRole;
	joinedAt: number;
	memberCount: number;
	teamCount: number;
};

export type WorkspaceInvite = {
	inviteId: string;
	workspaceId: string;
	organizationName: string;
	role: OrganizationRole;
	invitedBy: string;
	invitedByName: string;
	code: string;
	createdAt: number;
};

type ModalKey = 'createWorkspace' | 'joinOrganization';

export type UseOrganizations = ReturnType<typeof useWorkspaces>;

const _SENTINEL_ORGANIZATION_ID = '000000000000000000000000';

export function useWorkspaces(options?: {
	userId?: () => string | undefined;
	sessionId?: () => string | undefined;
	orgFromUrl?: () => string | null; // Reactive URL parameter (deprecated - handled by URL sync)
	initialOrganizations?: WorkspaceSummary[]; // Server-side preloaded data for instant rendering
	initialOrganizationInvites?: WorkspaceInvite[]; // Server-side preloaded data
}) {
	const convexClient = browser ? useConvexClient() : null;
	const getUserId = options?.userId || (() => undefined);
	const getSessionId = options?.sessionId || (() => undefined);

	// Get account-specific storage keys
	const currentUserId = browser ? getUserId() : undefined;
	const storageKey = getStorageKey(currentUserId);
	const storageDetailsKey = getStorageDetailsKey(currentUserId);

	// Load stored active workspace ID and cached details
	const initialActiveId = browser ? getStoredActiveId(storageKey) : null;
	const cachedOrgDetails = browser && initialActiveId ? loadCachedOrg(storageDetailsKey) : null;

	// Modal state (simple local state, no need to extract)
	const state = $state({
		modals: {
			createWorkspace: false,
			joinOrganization: false
		}
	});

	// Initialize workspace state composable first (needs initial data)
	// orgState will access queries reactively via functions, so we can initialize it first
	let orgState: ReturnType<typeof useWorkspaceState>;

	// Initialize orgState with initial data (will be recreated with queries after queries initialize)
	orgState = useWorkspaceState({
		userId: getUserId,
		organizationsData: () => options?.initialOrganizations ?? [], // Use initial data
		organizationsQuery: null, // Will be set after queries initialize (only used for loading check)
		initialActiveId,
		initialCachedOrg: cachedOrgDetails
	});

	// Initialize queries composable
	// useQuery is reactive, so it will update when orgState.activeWorkspaceId changes
	const queries = useWorkspaceQueries({
		getSessionId,
		activeWorkspaceId: () => orgState.activeWorkspaceId, // Reactive function
		initialOrganizations: options?.initialOrganizations,
		initialOrganizationInvites: options?.initialOrganizationInvites
	});

	// Recreate orgState with queries reference (needed for loading state check)
	// orgState accesses queries reactively via functions, but needs organizationsQuery for loading check
	const orgStateWithQueries = useWorkspaceState({
		userId: getUserId,
		organizationsData: () => queries.workspaces, // Reactive getter
		organizationsQuery: queries.organizationsQuery,
		initialActiveId,
		initialCachedOrg: cachedOrgDetails
	});
	orgState = orgStateWithQueries;

	// Initialize analytics composable (wraps setActiveWorkspace with tracking)
	const analytics = useWorkspaceAnalytics({
		convexClient,
		getUserId,
		workspaces: () => queries.workspaces, // Reactive getter
		setActiveWorkspace: orgState.setActiveWorkspace,
		getCurrentOrganizationId: () => orgState.activeWorkspaceId // Reactive getter (captures before change)
	});

	// Initialize URL sync composable (handles ?org=, ?create=workspace, ?join=workspace)
	useWorkspaceUrlSync({
		setActiveWorkspace: analytics.setActiveWorkspace, // Use analytics wrapper
		openModal: (key: 'createWorkspace' | 'joinOrganization') => {
			state.modals[key] = true;
		},
		activeWorkspaceId: () => orgState.activeWorkspaceId, // Reactive getter
		workspaces: () => queries.workspaces // Reactive getter
	});

	function setActiveWorkspace(workspaceId: string | null) {
		// Use analytics wrapper (includes tracking)
		analytics.setActiveWorkspace(workspaceId);
	}

	function openModal(key: ModalKey) {
		state.modals[key] = true;
	}

	function closeModal(key: ModalKey) {
		state.modals[key] = false;
	}

	// Initialize mutations composable
	const mutations = useWorkspaceMutations({
		convexClient,
		getSessionId,
		getUserId,
		activeWorkspaceId: () => orgState.activeWorkspaceId,
		setActiveWorkspace,
		closeModal
	});

	// Return value implements WorkspacesModuleAPI interface
	// This enables loose coupling - other modules depend on the interface, not internal implementation
	const api: WorkspacesModuleAPI = {
		get workspaces() {
			return queries.workspaces;
		},
		get activeWorkspaceId() {
			return orgState.activeWorkspaceId;
		},
		get activeWorkspace() {
			const list = queries.workspaces;
			const realOrg = list.find((org) => org.workspaceId === orgState.activeWorkspaceId);

			// If we have real data, return it (prefer real over cached)
			if (realOrg) {
				return realOrg;
			}

			// While loading, return cached workspace if available
			if (queries.isLoading && orgState.cachedOrganization) {
				return orgState.cachedOrganization;
			}

			return null;
		},
		get workspaceInvites() {
			return queries.workspaceInvites;
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
		setActiveWorkspace,
		openModal,
		closeModal,
		createWorkspace: mutations.createWorkspace,
		joinOrganization: mutations.joinOrganization,
		acceptOrganizationInvite: mutations.acceptOrganizationInvite,
		declineOrganizationInvite: mutations.declineOrganizationInvite
	};

	return api;
}

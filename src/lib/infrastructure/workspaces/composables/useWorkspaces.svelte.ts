import { browser } from '$app/environment';
import { goto } from '$app/navigation';
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
import { resolveRoute } from '$lib/utils/navigation';
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

	// Navigate to workspace-scoped route when workspace changes (but not from URL sync)
	// Track last navigated slug to prevent loops
	let lastNavigatedSlug = $state<string | null>(null);
	let isNavigating = $state(false);
	let lastActiveWorkspaceId = $state<string | null>(null);

	$effect(() => {
		if (!browser) return;
		if (isNavigating) return; // Prevent multiple navigations

		const activeId = orgState.activeWorkspaceId;

		// Skip if workspace hasn't actually changed (prevents running on every render)
		if (activeId === lastActiveWorkspaceId) return;

		// Update tracking
		lastActiveWorkspaceId = activeId;

		if (!activeId) return;

		// Wait for workspace list to be loaded
		if (queries.organizationsQuery?.isLoading) {
			console.debug('⏳ [WORKSPACE NAV] Waiting for workspace list to load...');
			return;
		}
		if (!queries.workspaces || queries.workspaces.length === 0) {
			console.debug('⏳ [WORKSPACE NAV] Workspace list not ready yet...');
			return;
		}

		const activeWorkspace = queries.workspaces.find((w) => w.workspaceId === activeId);
		if (!activeWorkspace?.slug) {
			console.warn('⚠️ [WORKSPACE NAV] Active workspace not found in list or missing slug:', {
				activeId,
				availableWorkspaces: queries.workspaces.map((w) => ({
					id: w.workspaceId,
					slug: w.slug,
					name: w.name
				}))
			});
			return;
		}

		// Skip if we just navigated to this slug (prevents loop)
		if (lastNavigatedSlug === activeWorkspace.slug) {
			console.debug('⏭️ [WORKSPACE NAV] Already navigated to this slug, skipping');
			return;
		}

		// Check if we're on a workspace-scoped route
		const pathname = window.location.pathname;
		const workspacePathMatch = pathname.match(/^\/w\/([^/]+)(.*)$/);

		if (workspacePathMatch) {
			const currentSlug = workspacePathMatch[1];
			const restOfPath = workspacePathMatch[2] || '';

			// If slug changed, navigate to same route with new slug
			if (currentSlug !== activeWorkspace.slug) {
				console.log('🔄 [WORKSPACE SWITCH] Navigating to new workspace:', {
					from: currentSlug,
					to: activeWorkspace.slug,
					path: restOfPath,
					workspaceId: activeId,
					workspaceName: activeWorkspace.name
				});
				isNavigating = true;
				lastNavigatedSlug = activeWorkspace.slug;
				const newPath = `/w/${activeWorkspace.slug}${restOfPath}`;
				// Remove ?org= param if present
				const searchParams = new URLSearchParams(window.location.search);
				searchParams.delete('org');
				const search = searchParams.toString();
				const resolvedPath = resolveRoute(newPath + (search ? `?${search}` : ''));
				console.log('🚀 [WORKSPACE SWITCH] Navigating to:', resolvedPath);
				// Use SvelteKit's goto for client-side navigation without reload
				goto(resolvedPath, {
					replaceState: true, // Replace history entry instead of adding new one
					noScroll: false, // Allow scroll to top
					keepFocus: false // Reset focus
				})
					.then(() => {
						// Reset flag after navigation completes
						isNavigating = false;
					})
					.catch((error) => {
						console.error('Navigation failed:', error);
						isNavigating = false;
					});
			} else {
				console.debug('✅ [WORKSPACE NAV] URL already matches active workspace');
			}
		} else {
			// Not on workspace route - redirect to inbox of new workspace
			// This handles workspace switching from non-workspace routes
			// Skip if we're on a non-workspace route that shouldn't redirect (like /account)
			if (!pathname.startsWith('/account') && !pathname.startsWith('/login')) {
				console.log('🔄 [WORKSPACE SWITCH] Redirecting to workspace inbox:', {
					slug: activeWorkspace.slug,
					currentPath: pathname,
					workspaceId: activeId,
					workspaceName: activeWorkspace.name
				});
				isNavigating = true;
				lastNavigatedSlug = activeWorkspace.slug;
				const newPath = `/w/${activeWorkspace.slug}/inbox`;
				const resolvedPath = resolveRoute(newPath);
				console.log('🚀 [WORKSPACE SWITCH] Navigating to:', resolvedPath);
				// Use SvelteKit's goto for client-side navigation without reload
				goto(resolvedPath, {
					replaceState: true,
					noScroll: false,
					keepFocus: false
				})
					.then(() => {
						// Reset flag after navigation completes
						isNavigating = false;
					})
					.catch((error) => {
						console.error('Navigation failed:', error);
						isNavigating = false;
					});
			}
		}
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

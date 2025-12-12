/**
 * Organization State Management Composable
 *
 * Extracted from useWorkspaces for testability and maintainability.
 * Handles active workspace selection, validation, caching, and account switching logic.
 *
 * Part of SYOS-255 refactoring effort.
 */

import { browser } from '$app/environment';
import { untrack } from 'svelte';
import type { WorkspaceSummary } from './useWorkspaces.svelte';
import { getStorageKey, getStorageDetailsKey, saveCachedOrg } from './workspaceStorage';

export interface UseOrganizationStateOptions {
	userId?: () => string | undefined;
	organizationsData: () => WorkspaceSummary[]; // Reactive function to get workspaces list
	organizationsQuery?: { data: WorkspaceSummary[] | undefined } | null; // Query for loading state
	initialActiveId?: string | null; // Initial active org ID from localStorage
	initialCachedOrg?: WorkspaceSummary | null; // Initial cached org from localStorage
}

export interface UseOrganizationStateReturn {
	get activeWorkspaceId(): string | null;
	get cachedOrganization(): WorkspaceSummary | null;
	get isSwitching(): boolean;
	get switchingTo(): string | null;
	get switchingToType(): 'workspace';
	setActiveWorkspace: (workspaceId: string | null) => void;
}

export function useWorkspaceState(
	options: UseOrganizationStateOptions
): UseOrganizationStateReturn {
	const getUserId = options.userId || (() => undefined);
	const organizationsData = options.organizationsData;
	const organizationsQuery = options.organizationsQuery;

	// Initialize state
	const state = $state({
		activeWorkspaceId: options.initialActiveId ?? null,
		cachedOrganization: options.initialCachedOrg ?? null,
		lastUserId: undefined as string | undefined,
		isSwitching: false,
		switchingTo: null as string | null,
		switchingToType: 'workspace' as const,
		switchStartTime: null as number | null
	});

	// Organization validation effect
	// Validates active workspace against loaded data and sets defaults
	$effect(() => {
		if (!browser) return;

		// Wait until query has loaded before applying validation logic
		// This prevents resetting activeWorkspaceId during initial loading state
		if (organizationsQuery && organizationsQuery.data === undefined) {
			return;
		}

		const currentUserId = getUserId();
		const storageKey = getStorageKey(currentUserId);
		const storageDetailsKey = getStorageDetailsKey(currentUserId);

		const list = organizationsData();
		// Server-side enforcement redirects users with no workspaces to /onboarding
		// This should never happen, but handle gracefully
		if (!list || list.length === 0) {
			state.activeWorkspaceId = null;
			if (browser) {
				localStorage.removeItem(storageKey);
				localStorage.removeItem(storageDetailsKey);
			}
			return;
		}

		// If we have an active org ID, validate it against loaded data
		if (state.activeWorkspaceId) {
			const activeOrg = list.find((org) => org.workspaceId === state.activeWorkspaceId);

			if (activeOrg) {
				// Active org found in loaded data - ensure cache is populated
				if (
					!state.cachedOrganization ||
					state.cachedOrganization.workspaceId !== activeOrg.workspaceId
				) {
					state.cachedOrganization = activeOrg;
					if (browser) {
						saveCachedOrg(storageKey, storageDetailsKey, activeOrg.workspaceId, activeOrg);
					}
				}
				return; // Active org is valid and cached
			}

			// Active org not found in list - default to first org
			const firstOrg = list[0];
			state.activeWorkspaceId = firstOrg.workspaceId;
			state.cachedOrganization = firstOrg;
			if (browser) {
				saveCachedOrg(storageKey, storageDetailsKey, firstOrg.workspaceId, firstOrg);
			}
			return;
		}

		// No active org - default to first workspace
		// Users are required to have at least one workspace (enforced server-side)
		const firstOrg = list[0];
		state.activeWorkspaceId = firstOrg.workspaceId;
		state.cachedOrganization = firstOrg;
		if (browser) {
			saveCachedOrg(storageKey, storageDetailsKey, firstOrg.workspaceId, firstOrg);
		}
	});

	// Account switching effect - Clear active workspace when userId changes
	$effect(() => {
		if (!browser) return;

		// Call getUserId() directly - the effect will re-run when the function reference changes
		// (Svelte tracks function props reactively)
		const userId = getUserId();

		// If userId changes, clear active workspace to prevent showing wrong account's orgs
		// This will be set correctly by the URL param or validation logic
		if (userId !== undefined) {
			// Store previous userId to detect changes
			const prevUserId = untrack(() => state.lastUserId);

			// Always update tracked userId (even if unchanged)
			// This ensures we track the initial userId
			untrack(() => {
				state.lastUserId = userId;
			});

			// Only clear if userId actually changed (and we had a previous value)
			if (prevUserId !== undefined && prevUserId !== userId) {
				// User switched accounts - clear active org and let validation logic set it correctly
				state.activeWorkspaceId = null;
				state.cachedOrganization = null;

				// Clear storage for old account
				const oldStorageKey = getStorageKey(prevUserId);
				const oldStorageDetailsKey = getStorageDetailsKey(prevUserId);
				localStorage.removeItem(oldStorageKey);
				localStorage.removeItem(oldStorageDetailsKey);
			}
		}
	});

	// Track switching completion - clear switching state when queries settle
	$effect(() => {
		if (!state.isSwitching || !browser) return;

		// Check if queries have settled (not loading)
		const queriesSettled = organizationsQuery?.data !== undefined;

		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		if (queriesSettled && state.switchStartTime) {
			const elapsed = Date.now() - state.switchStartTime;
			const minimumDuration = 3000; // Reduced from 5s - combined with account switch for smoother UX

			console.log('⏱️ [ORG SWITCH] Checking completion', {
				elapsed,
				minimumDuration,
				canComplete: elapsed >= minimumDuration,
				queriesSettled
			});

			if (elapsed >= minimumDuration) {
				// Clear switching state immediately
				console.log('✅ [ORG SWITCH] Completing immediately (duration met)');
				state.isSwitching = false;
				state.switchingTo = null;
				state.switchingToType = 'workspace';
				state.switchStartTime = null;
			} else {
				// Wait for remaining time to reach minimum duration
				const remaining = minimumDuration - elapsed;
				console.log('⏳ [ORG SWITCH] Waiting for minimum duration', {
					remaining,
					willCompleteAt: Date.now() + remaining
				});
				timeoutId = setTimeout(() => {
					console.log('✅ [ORG SWITCH] Completing after timeout');
					state.isSwitching = false;
					state.switchingTo = null;
					state.switchingToType = 'workspace';
					state.switchStartTime = null;
				}, remaining);
			}
		} else {
			if (state.isSwitching) {
				console.log('⏸️ [ORG SWITCH] Not ready to complete', {
					queriesSettled,
					hasStartTime: !!state.switchStartTime,
					isSwitching: state.isSwitching
				});
			}
		}

		// Cleanup: clear timeout if effect re-runs or component unmounts
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});

	function setActiveWorkspace(workspaceId: string | null) {
		// Users are required to have at least one workspace (enforced server-side)
		// If null is passed, default to first workspace
		const list = organizationsData();
		const targetOrgId = workspaceId || (list.length > 0 ? list[0].workspaceId : null);

		if (!targetOrgId) {
			// Should never happen due to server-side enforcement, but handle gracefully
			console.warn('setActiveWorkspace called with null and no workspaces available');
			return;
		}

		// Set switching state before changing workspace
		console.log('🚀 [ORG SWITCH] Starting workspace switch', {
			workspaceId: targetOrgId,
			organizationName: list.find((org) => org.workspaceId === targetOrgId)?.name,
			availableOrgs: list.length
		});

		state.isSwitching = true;
		state.switchStartTime = browser ? Date.now() : null;

		// Determine target workspace name and type for display
		const targetOrg = list.find((org) => org.workspaceId === targetOrgId);
		state.switchingTo = targetOrg?.name ?? 'workspace';
		state.switchingToType = 'workspace';

		console.log('🔄 [ORG SWITCH] State set', {
			isSwitching: state.isSwitching,
			switchingTo: state.switchingTo,
			switchStartTime: state.switchStartTime
		});

		state.activeWorkspaceId = targetOrgId;

		const currentUserId = getUserId();
		const storageKey = getStorageKey(currentUserId);
		const storageDetailsKey = getStorageDetailsKey(currentUserId);

		// Find and cache workspace details for optimistic UI
		const summary = targetOrg;

		if (summary) {
			state.cachedOrganization = summary;
			if (browser) {
				saveCachedOrg(storageKey, storageDetailsKey, targetOrgId, summary);
			}
		} else if (browser) {
			saveCachedOrg(storageKey, storageDetailsKey, targetOrgId, null);
		}
	}

	return {
		get activeWorkspaceId() {
			return state.activeWorkspaceId;
		},
		get cachedOrganization() {
			return state.cachedOrganization;
		},
		get isSwitching() {
			return state.isSwitching;
		},
		get switchingTo() {
			return state.switchingTo;
		},
		get switchingToType() {
			return state.switchingToType;
		},
		setActiveWorkspace
	};
}

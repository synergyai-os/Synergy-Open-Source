import { browser } from '$app/environment';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '$lib/convex';
import { AnalyticsEventName } from '$lib/analytics/events';
import posthog from 'posthog-js';
import { toast } from '$lib/utils/toast';
import { untrack } from 'svelte';
import { replaceState } from '$app/navigation';
import { getContext } from 'svelte';
import type { UseLoadingOverlayReturn } from '$lib/composables/useLoadingOverlay.svelte';

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

const STORAGE_KEY_PREFIX = 'activeOrganizationId';
const STORAGE_DETAILS_KEY_PREFIX = 'activeOrganizationDetails';
const SENTINEL_ORGANIZATION_ID = '000000000000000000000000';
const PERSONAL_SENTINEL = '__personal__';

// Module-level tracking for URL param processing (pattern #L700 - plain variable, not $state)
let lastProcessedOrgParam: string | null = null;

// Get account-specific storage keys
function getStorageKey(userId: string | undefined): string {
	return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

function getStorageDetailsKey(userId: string | undefined): string {
	return userId ? `${STORAGE_DETAILS_KEY_PREFIX}_${userId}` : STORAGE_DETAILS_KEY_PREFIX;
}

export function useOrganizations(options?: {
	userId?: () => string | undefined;
	orgFromUrl?: () => string | null; // Reactive URL parameter
}) {
	const convexClient = browser ? useConvexClient() : null;
	const getUserId = options?.userId || (() => undefined);
	const getOrgFromUrl = options?.orgFromUrl || (() => null);

	// Get account-specific storage keys
	const currentUserId = browser ? getUserId() : undefined;
	const storageKey = getStorageKey(currentUserId);
	const storageDetailsKey = getStorageDetailsKey(currentUserId);

	const storedActiveId = browser ? localStorage.getItem(storageKey) : null;
	const initialActiveId = storedActiveId === PERSONAL_SENTINEL ? null : storedActiveId;

	// Load cached organization details for optimistic UI
	let cachedOrgDetails: OrganizationSummary | null = null;
	if (browser && initialActiveId) {
		try {
			const stored = localStorage.getItem(storageDetailsKey);
			if (stored) {
				cachedOrgDetails = JSON.parse(stored);
			}
		} catch (e) {
			console.warn('Failed to parse cached organization details', e);
		}
	}

	const state = $state({
		activeOrganizationId: initialActiveId,
		activeTeamId: null as string | null,
		cachedOrganization: cachedOrgDetails,
		lastUserId: undefined as string | undefined,
		isSwitching: false,
		switchingTo: null as string | null,
		switchingToType: 'personal' as 'personal' | 'organization',
		switchStartTime: null as number | null,
		modals: {
			createOrganization: false,
			joinOrganization: false,
			createTeam: false,
			joinTeam: false
		},
		loading: {
			createOrganization: false,
			joinOrganization: false,
			createTeam: false,
			joinTeam: false
		}
	});

	const organizationsQuery = browser && getSessionId()
		? useQuery(api.organizations.listOrganizations, () => {
				const sessionId = getSessionId();
				if (!sessionId) return null; // Skip query if sessionId not available
				return { sessionId };
			})
		: null;
	const organizationInvitesQuery = browser
		? useQuery(api.organizations.listOrganizationInvites, () => ({ userId: getUserId() as any }))
		: null;
	const teamInvitesQuery = browser
		? useQuery(api.teams.listTeamInvites, () => ({ userId: getUserId() as any }))
		: null;

	// Query teams - pass organizationId if we have one, undefined if in personal workspace mode
	// The Convex function now accepts optional organizationId and returns [] when undefined
const teamsQuery = browser && getUserId()
	? useQuery(api.teams.listTeams, () => {
			const userId = getUserId();
			if (!userId) return null; // Skip query if userId not available
			
			const organizationId = state.activeOrganizationId;
			return {
				userId,
				...(organizationId ? { organizationId } : {})
			};
		})
	: null;

	const isLoading = $derived(organizationsQuery ? organizationsQuery.data === undefined : false);

	const organizationsData = $derived((): OrganizationSummary[] =>
		((organizationsQuery?.data ?? []) as OrganizationSummary[]).map((org: OrganizationSummary) => ({
			organizationId: org.organizationId,
			name: org.name,
			initials: org.initials,
			slug: org.slug,
			plan: org.plan,
			role: org.role,
			joinedAt: org.joinedAt,
			memberCount: org.memberCount,
			teamCount: org.teamCount
		}))
	);

	const organizationInvites = $derived(
		(): OrganizationInvite[] => (organizationInvitesQuery?.data ?? []) as OrganizationInvite[]
	);

	const teamInvitesData = $derived(
		(): TeamInvite[] => (teamInvitesQuery?.data ?? []) as TeamInvite[]
	);

	const teamsData = $derived((): TeamSummary[] =>
		((teamsQuery?.data ?? []) as TeamSummary[]).map((team: TeamSummary) => ({
			teamId: team.teamId,
			organizationId: team.organizationId,
			name: team.name,
			slug: team.slug,
			memberCount: team.memberCount,
			role: team.role,
			joinedAt: team.joinedAt
		}))
	);

	$effect(() => {
		if (!browser) return;

		// Check for modal trigger URL parameters
		const urlParams = new URLSearchParams(window.location.search);
		const createParam = urlParams.get('create');
		const joinParam = urlParams.get('join');
		
		if (createParam === 'organization') {
			state.modals.createOrganization = true;
			// Clean up URL param
			urlParams.delete('create');
			const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
			replaceState(newUrl, {});
		} else if (joinParam === 'organization') {
			state.modals.joinOrganization = true;
			// Clean up URL param
			urlParams.delete('join');
			const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
			replaceState(newUrl, {});
		}

		// Priority 1: URL parameter (from account/workspace switching)
		// Call function to get reactive value from parent
		const urlOrgParam = getOrgFromUrl();

		// Skip if already processed (pattern #L700 - untrack prevents reactive dependency)
		if (
			untrack(
				() =>
					urlOrgParam === lastProcessedOrgParam && urlOrgParam === state.activeOrganizationId
			)
		) {
			return;
		}

		if (urlOrgParam && urlOrgParam !== state.activeOrganizationId) {
			console.log('🔗 Setting organization from URL param:', urlOrgParam);

			// Update tracking without triggering re-run (pattern #L700)
			untrack(() => {
				lastProcessedOrgParam = urlOrgParam;
			});

		state.activeOrganizationId = urlOrgParam;

		// Clean up URL param immediately (inbox pattern - prevents reprocessing)
		// Guard for initial page load when router isn't initialized yet
		try {
			const url = new URL(window.location.href);
			url.searchParams.delete('org');
			replaceState(url.pathname + url.search, {});
		} catch (e) {
			// Router not ready on initial load - URL will persist but won't cause reprocessing
			// because lastProcessedOrgParam tracking prevents the effect from running again
			console.debug('Router not ready, deferring URL cleanup');
		}

			return; // Stop here, let validation handle the rest
		}

		// Reset tracking if URL param removed
		if (!urlOrgParam && lastProcessedOrgParam) {
			untrack(() => {
				lastProcessedOrgParam = null;
			});
		}

		// Priority 2: Wait until query has loaded before applying validation logic
		// This prevents resetting activeOrganizationId during initial loading state
		if (organizationsQuery && organizationsQuery.data === undefined) {
			return;
		}

		const currentUserId = getUserId();
		const storageKey = getStorageKey(currentUserId);
		const storageDetailsKey = getStorageDetailsKey(currentUserId);

		const list = organizationsData();
		if (!list || list.length === 0) {
			state.activeOrganizationId = null;
			if (browser) {
				localStorage.setItem(storageKey, PERSONAL_SENTINEL);
				localStorage.removeItem(storageDetailsKey);
			}
			return;
		}

		// If we have an active org ID, validate it against loaded data
		if (state.activeOrganizationId) {
			const activeOrg = list.find((org) => org.organizationId === state.activeOrganizationId);

			if (activeOrg) {
				// Active org found in loaded data - ensure cache is populated
				if (
					!state.cachedOrganization ||
					state.cachedOrganization.organizationId !== activeOrg.organizationId
				) {
					state.cachedOrganization = activeOrg;
					if (browser) {
						localStorage.setItem(storageDetailsKey, JSON.stringify(activeOrg));
					}
				}
				return; // Active org is valid and cached
			}

			// Active org not found in list - fallback to personal workspace (not first org!)
			state.activeOrganizationId = null;
			if (browser) {
				localStorage.setItem(storageKey, PERSONAL_SENTINEL);
				localStorage.removeItem(storageDetailsKey);
				state.cachedOrganization = null;
			}
			return;
		}

		// No active org - check if user wants personal workspace
		if (browser) {
			const stored = localStorage.getItem(storageKey);
			if (stored === PERSONAL_SENTINEL) {
				return;
			}
		}

		// Default to personal workspace (not first org!)
		// This ensures new accounts start on their personal workspace
		state.activeOrganizationId = null;
		if (browser) {
			localStorage.setItem(storageKey, PERSONAL_SENTINEL);
		}
	});

	$effect(() => {
		const list = teamsData();
		if (state.activeTeamId && list.every((team) => team.teamId !== state.activeTeamId)) {
			state.activeTeamId = null;
		}
	});

	// Clear active organization when userId changes (account switch)
	$effect(() => {
		if (!browser) return;

		const currentUserId = getUserId();

		// If userId changes, clear active organization to prevent showing wrong account's orgs
		// This will be set correctly by the URL param or validation logic
		if (currentUserId !== undefined) {
			// Store previous userId to detect changes
			const prevUserId = untrack(() => state.lastUserId);

			if (prevUserId !== undefined && prevUserId !== currentUserId) {
				// User switched accounts - clear active org and let validation logic set it correctly
				state.activeOrganizationId = null;
				state.cachedOrganization = null;

				// Clear storage for old account
				const oldStorageKey = getStorageKey(prevUserId);
				const oldStorageDetailsKey = getStorageDetailsKey(prevUserId);
				localStorage.removeItem(oldStorageKey);
				localStorage.removeItem(oldStorageDetailsKey);
			}

			// Update tracked userId
			untrack(() => {
				state.lastUserId = currentUserId;
			});
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
			const minimumDuration = 5000; // Minimum 5 seconds for delightful experience
			
			if (elapsed >= minimumDuration) {
				// Clear switching state immediately
				state.isSwitching = false;
				state.switchingTo = null;
				state.switchingToType = 'personal';
				state.switchStartTime = null;
			} else {
				// Wait for remaining time to reach minimum duration
				const remaining = minimumDuration - elapsed;
				timeoutId = setTimeout(() => {
					state.isSwitching = false;
					state.switchingTo = null;
					state.switchingToType = 'personal';
					state.switchStartTime = null;
				}, remaining);
			}
		}
		
		// Cleanup: clear timeout if effect re-runs or component unmounts
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});

	function setActiveOrganization(organizationId: string | null) {
		const previousOrganizationId = state.activeOrganizationId;
		
		// Set switching state before changing organization
		state.isSwitching = true;
		state.switchStartTime = browser ? Date.now() : null;
		
		// Determine target organization name and type for display
		if (organizationId) {
			const targetOrg = organizationsData().find((org) => org.organizationId === organizationId);
			state.switchingTo = targetOrg?.name ?? 'organization';
			state.switchingToType = 'organization';
		} else {
			state.switchingTo = 'Personal workspace';
			state.switchingToType = 'personal';
		}
		
		state.activeOrganizationId = organizationId;
		state.activeTeamId = null;

		const currentUserId = getUserId();
		const storageKey = getStorageKey(currentUserId);
		const storageDetailsKey = getStorageDetailsKey(currentUserId);

		if (!organizationId) {
			// Switching to personal workspace - clear cached org details
			state.cachedOrganization = null;
			if (browser) {
				localStorage.setItem(storageKey, PERSONAL_SENTINEL);
				localStorage.removeItem(storageDetailsKey);
			}
			return;
		}

		// Find and cache organization details for optimistic UI
		const summary = organizationsData().find((org) => org.organizationId === organizationId);
		const availableTeamCount = summary?.teamCount ?? 0;

		if (summary) {
			state.cachedOrganization = summary;
			if (browser) {
				localStorage.setItem(storageKey, organizationId);
				localStorage.setItem(storageDetailsKey, JSON.stringify(summary));
			}
		} else if (browser) {
			localStorage.setItem(storageKey, organizationId);
		}

		if (convexClient) {
			const currentUserId = getUserId();
			
			// Only record organization switch if user is authenticated
			// Analytics tracking is non-critical, so skip if not ready
			if (!currentUserId) {
				console.debug('⏭️ Skipping organization switch tracking - user not authenticated yet');
				return;
			}
			
			const mutationArgs: any = {
				toOrganizationId: organizationId,
				availableTeamCount
			};

			if (previousOrganizationId) {
				mutationArgs.fromOrganizationId = previousOrganizationId;
			}

			convexClient
				.mutation(api.organizations.recordOrganizationSwitch, mutationArgs)
				.catch((error) => {
					console.warn('Failed to record organization switch', error);
				});
		}

		// TEMPORARY: Client-side PostHog capture for testing
		// TODO: Remove once server-side analytics via HTTP action bridge is implemented
		if (browser && typeof posthog !== 'undefined') {
			try {
				const properties: any = {
					scope: 'organization',
					toOrganizationId: organizationId,
					availableTeamCount
				};

				if (previousOrganizationId) {
					properties.fromOrganizationId = previousOrganizationId;
				}

				posthog.capture(AnalyticsEventName.ORGANIZATION_SWITCHED, properties);
				console.log(
					'📊 [TEST] PostHog event captured:',
					AnalyticsEventName.ORGANIZATION_SWITCHED,
					properties
				);
			} catch (error) {
				console.warn('Failed to capture PostHog event', error);
			}
		}
	}

	function setActiveTeam(teamId: string | null) {
		state.activeTeamId = teamId;
	}

	function openModal(key: ModalKey) {
		state.modals[key] = true;
	}

	function closeModal(key: ModalKey) {
		state.modals[key] = false;
	}

	async function createOrganization(payload: { name: string }) {
		if (!convexClient) return;
		const trimmed = payload.name.trim();
		if (!trimmed) return;

		const userId = getUserId();
		if (!userId) {
			throw new Error('User ID is required. Please log in again.');
		}

		state.loading.createOrganization = true;

		// Show loading overlay
		let loadingOverlay: UseLoadingOverlayReturn | null = null;
		try {
			loadingOverlay = getContext<UseLoadingOverlayReturn>('loadingOverlay');
			if (loadingOverlay) {
				loadingOverlay.showOverlay({
					flow: 'workspace-creation',
					subtitle: trimmed
				});
			}
		} catch {
			// Context not available, continue without overlay
		}

		try {
		// Get sessionId
		const sessionId = getSessionId();
		if (!sessionId) {
			throw new Error('Session ID not available');
		}
		
		const result = await convexClient.mutation(api.organizations.createOrganization, {
			name: trimmed,
			sessionId
		});

			if (result?.organizationId) {
				// Switch to new organization (overlay will persist during switch)
				setActiveOrganization(result.organizationId);

				// Show success toast
				if (browser) {
					toast.success(`${trimmed} created successfully!`);

					// Track analytics
					if (posthog) {
						posthog.capture(AnalyticsEventName.ORGANIZATION_CREATED, {
							organizationId: result.organizationId,
							organizationName: trimmed
						});
					}
				}

				// Close modal on success
				closeModal('createOrganization');
				
				// Hide overlay after a short delay (workspace switch overlay will take over)
				if (loadingOverlay && browser) {
					setTimeout(() => {
						loadingOverlay?.hideOverlay();
					}, 500);
				}
			}
		} catch (error) {
			console.error('Failed to create organization:', error);

			// Show error toast
			if (browser) {
				toast.error('Failed to create organization. Please try again.');
			}

			// Hide overlay on error
			if (loadingOverlay) {
				loadingOverlay.hideOverlay();
			}

			// Keep modal open on error so user can retry
		} finally {
			state.loading.createOrganization = false;
		}
	}

	async function joinOrganization(payload: { code: string }) {
		if (!convexClient) return;
		const trimmed = payload.code.trim();
		if (!trimmed) return;

		try {
			const result = await convexClient.mutation(api.organizations.acceptOrganizationInvite, {
				code: trimmed
			});
			if (result?.organizationId) {
				setActiveOrganization(result.organizationId);
			}
		} finally {
			closeModal('joinOrganization');
		}
	}

	async function createTeam(payload: { name: string }) {
		if (!convexClient || !state.activeOrganizationId) return;
		const trimmed = payload.name.trim();
		if (!trimmed) return;

		try {
			const result = await convexClient.mutation(api.teams.createTeam, {
				organizationId: state.activeOrganizationId as any,
				name: trimmed
			});
			if (result?.teamId) {
				setActiveTeam(result.teamId);
			}
		} finally {
			closeModal('createTeam');
		}
	}

	async function joinTeam(payload: { code: string }) {
		if (!convexClient) return;
		const trimmed = payload.code.trim();
		if (!trimmed) return;

		try {
			const result = await convexClient.mutation(api.teams.acceptTeamInvite, {
				code: trimmed
			});
			if (result?.organizationId) {
				setActiveOrganization(result.organizationId);
			}
			if (result?.teamId) {
				setActiveTeam(result.teamId);
			}
		} finally {
			closeModal('joinTeam');
		}
	}

	async function acceptOrganizationInvite(code: string) {
		if (!convexClient) return;
		const trimmed = code.trim();
		if (!trimmed) return;

		const result = await convexClient.mutation(api.organizations.acceptOrganizationInvite, {
			code: trimmed
		});
		if (result?.organizationId) {
			setActiveOrganization(result.organizationId);
		}
	}

	async function declineOrganizationInvite(inviteId: string) {
		if (!convexClient) return;
		await convexClient.mutation(api.organizations.declineOrganizationInvite, {
			inviteId: inviteId as any
		});
	}

	async function acceptTeamInvite(code: string) {
		if (!convexClient) return;
		const trimmed = code.trim();
		if (!trimmed) return;

		const result = await convexClient.mutation(api.teams.acceptTeamInvite, {
			code: trimmed
		});
		if (result?.organizationId) {
			setActiveOrganization(result.organizationId);
		}
		if (result?.teamId) {
			setActiveTeam(result.teamId);
		}
	}

	async function declineTeamInvite(inviteId: string) {
		if (!convexClient) return;
		await convexClient.mutation(api.teams.declineTeamInvite, {
			inviteId: inviteId as any
		});
	}

	return {
		get organizations() {
			return organizationsData();
		},
		get activeOrganizationId() {
			return state.activeOrganizationId;
		},
		get activeOrganization() {
			const list = organizationsData();
			const realOrg = list.find((org) => org.organizationId === state.activeOrganizationId);

			// If we have real data, return it (prefer real over cached)
			if (realOrg) {
				return realOrg;
			}

			// While loading, return cached organization if available
			if (isLoading && state.cachedOrganization) {
				return state.cachedOrganization;
			}

			return null;
		},
		get organizationInvites() {
			return organizationInvites();
		},
		get teamInvites() {
			return teamInvitesData();
		},
		get teams() {
			return teamsData();
		},
		get activeTeamId() {
			return state.activeTeamId;
		},
		get modals() {
			return state.modals;
		},
		get loading() {
			return state.loading;
		},
		get isLoading() {
			return isLoading;
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
		setActiveOrganization,
		setActiveTeam,
		openModal,
		closeModal,
		createOrganization,
		joinOrganization,
		createTeam,
		joinTeam,
		acceptOrganizationInvite,
		declineOrganizationInvite,
		acceptTeamInvite,
		declineTeamInvite
	} as const;
}

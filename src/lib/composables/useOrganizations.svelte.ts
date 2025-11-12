import { browser } from '$app/environment';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '$lib/convex';
import { AnalyticsEventName } from '$lib/analytics/events';
import posthog from 'posthog-js';
import { toast } from '$lib/utils/toast';

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

	const organizationsQuery = browser && getUserId()
		? useQuery(api.organizations.listOrganizations, () => {
				const userId = getUserId();
				if (!userId) return null; // Skip query if userId not available
				return { userId };
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
		// Priority 1: URL parameter (from account/workspace switching)
		// Call function to get reactive value from parent
		const urlOrgParam = getOrgFromUrl();
		if (urlOrgParam && urlOrgParam !== state.activeOrganizationId) {
			console.log('🔗 Setting organization from URL param:', urlOrgParam);
			state.activeOrganizationId = urlOrgParam;
			return; // Stop here, let validation handle the rest
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

	function setActiveOrganization(organizationId: string | null) {
		const previousOrganizationId = state.activeOrganizationId;
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

		try {
			const result = await convexClient.mutation(api.organizations.createOrganization, {
				name: trimmed,
				userId
			});

			if (result?.organizationId) {
				// Switch to new organization
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
			}
		} catch (error) {
			console.error('Failed to create organization:', error);

			// Show error toast
			if (browser) {
				toast.error('Failed to create organization. Please try again.');
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

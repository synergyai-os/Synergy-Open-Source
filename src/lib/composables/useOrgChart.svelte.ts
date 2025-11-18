import { browser } from '$app/environment';
import { useQuery, useConvexClient } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import type { CircleNode } from '$lib/utils/orgChartTransform';

export type UseOrgChart = ReturnType<typeof useOrgChart>;

/**
 * Composable for managing org chart state and interactions
 */
export function useOrgChart(options: {
	sessionId: () => string | undefined;
	organizationId: () => string | undefined;
}) {
	const getSessionId = options.sessionId;
	const getOrganizationId = options.organizationId;

	const state = $state({
		// Selected circle for detail panel
		selectedCircleId: null as Id<'circles'> | null,
		// Selected role for detail panel
		selectedRoleId: null as Id<'circleRoles'> | null,
		// Source of role selection (for panel stacking)
		selectionSource: null as 'chart' | 'circle-panel' | null,
		// Zoom level
		zoomLevel: 1,
		// Pan offset
		panOffset: { x: 0, y: 0 },
		// Hover state
		hoveredCircleId: null as Id<'circles'> | null,
		// Query results (loaded via $effect)
		selectedCircle: null as any,
		selectedCircleMembers: [] as any[],
		selectedRole: null as any,
		selectedRoleFillers: [] as any[],
		// Loading states
		selectedCircleIsLoading: false,
		selectedCircleMembersIsLoading: false,
		selectedRoleIsLoading: false,
		selectedRoleFillersIsLoading: false,
		// Error states
		selectedCircleError: null as unknown | null,
		selectedCircleMembersError: null as unknown | null,
		selectedRoleError: null as unknown | null,
		selectedRoleFillersError: null as unknown | null
	});

	// Convex client for manual queries
	const convexClient = browser ? useConvexClient() : null;

	// Query tracking for race condition prevention
	let currentCircleQueryId: Id<'circles'> | null = null;
	let currentCircleMembersQueryId: Id<'circles'> | null = null;
	let currentRoleQueryId: Id<'circleRoles'> | null = null;
	let currentRoleFillersQueryId: Id<'circleRoles'> | null = null;

	// Query circles list - wait for org context before querying
	const circlesQuery =
		browser && getSessionId() && getOrganizationId()
			? useQuery(api.circles.list, () => {
					const sessionId = getSessionId();
					const organizationId = getOrganizationId();
					if (!sessionId || !organizationId)
						throw new Error('sessionId and organizationId required');
					return { sessionId, organizationId: organizationId as Id<'organizations'> };
				})
			: null;

	// Load selected circle details with $effect pattern (proven pattern from useSelectedItem)
	$effect(() => {
		if (!browser || !convexClient || !state.selectedCircleId) {
			state.selectedCircle = null;
			state.selectedCircleIsLoading = false;
			state.selectedCircleError = null;
			currentCircleQueryId = null;
			return;
		}

		const sessionId = getSessionId();
		if (!sessionId) {
			state.selectedCircle = null;
			state.selectedCircleIsLoading = false;
			state.selectedCircleError = null;
			currentCircleQueryId = null;
			return;
		}

		// Generate unique ID for this query
		const queryId = state.selectedCircleId;
		currentCircleQueryId = queryId;
		state.selectedCircleIsLoading = true;
		state.selectedCircleError = null;

		// Load circle details
		convexClient
			.query(api.circles.get, {
				sessionId,
				circleId: state.selectedCircleId
			})
			.then((result) => {
				// Only update if this is still the current query (prevent race conditions)
				if (currentCircleQueryId === queryId) {
					state.selectedCircle = result;
					state.selectedCircleIsLoading = false;
					state.selectedCircleError = null;
				}
			})
			.catch((error) => {
				// Only handle error if this is still the current query
				if (currentCircleQueryId === queryId) {
					console.error('[useOrgChart] Failed to load circle:', error);
					state.selectedCircle = null;
					state.selectedCircleIsLoading = false;
					state.selectedCircleError = error;
				}
			});

		// Cleanup function: mark query as stale when effect re-runs or component unmounts
		return () => {
			if (currentCircleQueryId === queryId) {
				currentCircleQueryId = null;
			}
		};
	});

	// Load selected circle members with $effect pattern
	$effect(() => {
		if (!browser || !convexClient || !state.selectedCircleId) {
			state.selectedCircleMembers = [];
			state.selectedCircleMembersIsLoading = false;
			state.selectedCircleMembersError = null;
			currentCircleMembersQueryId = null;
			return;
		}

		const sessionId = getSessionId();
		if (!sessionId) {
			state.selectedCircleMembers = [];
			state.selectedCircleMembersIsLoading = false;
			state.selectedCircleMembersError = null;
			currentCircleMembersQueryId = null;
			return;
		}

		// Generate unique ID for this query
		const queryId = state.selectedCircleId;
		currentCircleMembersQueryId = queryId;
		state.selectedCircleMembersIsLoading = true;
		state.selectedCircleMembersError = null;

		// Load circle members
		convexClient
			.query(api.circles.getMembers, {
				sessionId,
				circleId: state.selectedCircleId
			})
			.then((result) => {
				// Only update if this is still the current query (prevent race conditions)
				if (currentCircleMembersQueryId === queryId) {
					state.selectedCircleMembers = result;
					state.selectedCircleMembersIsLoading = false;
					state.selectedCircleMembersError = null;
				}
			})
			.catch((error) => {
				// Only handle error if this is still the current query
				if (currentCircleMembersQueryId === queryId) {
					console.error('[useOrgChart] Failed to load circle members:', error);
					state.selectedCircleMembers = [];
					state.selectedCircleMembersIsLoading = false;
					state.selectedCircleMembersError = error;
				}
			});

		// Cleanup function: mark query as stale when effect re-runs or component unmounts
		return () => {
			if (currentCircleMembersQueryId === queryId) {
				currentCircleMembersQueryId = null;
			}
		};
	});

	// Load selected role details with $effect pattern (proven pattern from useSelectedItem)
	$effect(() => {
		if (!browser || !convexClient || !state.selectedRoleId) {
			state.selectedRole = null;
			state.selectedRoleIsLoading = false;
			state.selectedRoleError = null;
			currentRoleQueryId = null;
			return;
		}

		const sessionId = getSessionId();
		if (!sessionId) {
			state.selectedRole = null;
			state.selectedRoleIsLoading = false;
			state.selectedRoleError = null;
			currentRoleQueryId = null;
			return;
		}

		// Generate unique ID for this query
		const queryId = state.selectedRoleId;
		currentRoleQueryId = queryId;
		state.selectedRoleIsLoading = true;
		state.selectedRoleError = null;

		// Load role details
		convexClient
			.query(api.circleRoles.get, {
				sessionId,
				roleId: state.selectedRoleId
			})
			.then((result) => {
				// Only update if this is still the current query (prevent race conditions)
				if (currentRoleQueryId === queryId) {
					state.selectedRole = result;
					state.selectedRoleIsLoading = false;
					state.selectedRoleError = null;
				}
			})
			.catch((error) => {
				// Only handle error if this is still the current query
				if (currentRoleQueryId === queryId) {
					console.error('[useOrgChart] Failed to load role:', error);
					state.selectedRole = null;
					state.selectedRoleIsLoading = false;
					state.selectedRoleError = error;
				}
			});

		// Cleanup function: mark query as stale when effect re-runs or component unmounts
		return () => {
			if (currentRoleQueryId === queryId) {
				currentRoleQueryId = null;
			}
		};
	});

	// Load selected role fillers with $effect pattern
	$effect(() => {
		if (!browser || !convexClient || !state.selectedRoleId) {
			state.selectedRoleFillers = [];
			state.selectedRoleFillersIsLoading = false;
			state.selectedRoleFillersError = null;
			currentRoleFillersQueryId = null;
			return;
		}

		const sessionId = getSessionId();
		if (!sessionId) {
			state.selectedRoleFillers = [];
			state.selectedRoleFillersIsLoading = false;
			state.selectedRoleFillersError = null;
			currentRoleFillersQueryId = null;
			return;
		}

		// Generate unique ID for this query
		const queryId = state.selectedRoleId;
		currentRoleFillersQueryId = queryId;
		state.selectedRoleFillersIsLoading = true;
		state.selectedRoleFillersError = null;

		// Load role fillers
		convexClient
			.query(api.circleRoles.getRoleFillers, {
				sessionId,
				circleRoleId: state.selectedRoleId
			})
			.then((result) => {
				// Only update if this is still the current query (prevent race conditions)
				if (currentRoleFillersQueryId === queryId) {
					state.selectedRoleFillers = result;
					state.selectedRoleFillersIsLoading = false;
					state.selectedRoleFillersError = null;
				}
			})
			.catch((error) => {
				// Only handle error if this is still the current query
				if (currentRoleFillersQueryId === queryId) {
					console.error('[useOrgChart] Failed to load role fillers:', error);
					state.selectedRoleFillers = [];
					state.selectedRoleFillersIsLoading = false;
					state.selectedRoleFillersError = error;
				}
			});

		// Cleanup function: mark query as stale when effect re-runs or component unmounts
		return () => {
			if (currentRoleFillersQueryId === queryId) {
				currentRoleFillersQueryId = null;
			}
		};
	});

	return {
		// Getters - reactive access
		get circles(): CircleNode[] {
			return circlesQuery?.data ?? [];
		},
		get selectedCircle() {
			return state.selectedCircle;
		},
		get selectedCircleError() {
			return state.selectedCircleError;
		},
		get selectedCircleIsLoading() {
			return state.selectedCircleIsLoading;
		},
		get selectedCircleMembers() {
			return state.selectedCircleMembers;
		},
		get selectedCircleId() {
			return state.selectedCircleId;
		},
		get selectedRole() {
			return state.selectedRole;
		},
		get selectedRoleError() {
			return state.selectedRoleError;
		},
		get selectedRoleIsLoading() {
			return state.selectedRoleIsLoading;
		},
		get selectedRoleFillers() {
			return state.selectedRoleFillers;
		},
		get selectedRoleId() {
			return state.selectedRoleId;
		},
		get selectionSource() {
			return state.selectionSource;
		},
		get zoomLevel() {
			return state.zoomLevel;
		},
		get panOffset() {
			return state.panOffset;
		},
		get hoveredCircleId() {
			return state.hoveredCircleId;
		},
		get isLoading() {
			return !browser || circlesQuery?.data === undefined;
		},

		// Actions
		selectCircle: (circleId: Id<'circles'> | null) => {
			state.selectedCircleId = circleId;
		},
		selectRole: (roleId: Id<'circleRoles'> | null, source: 'chart' | 'circle-panel' | null) => {
			state.selectedRoleId = roleId;
			state.selectionSource = source;
			// When role opens from chart, hide circle panel
			// When role opens from circle panel, keep circle panel visible
			if (source === 'chart' && roleId !== null) {
				state.selectedCircleId = null;
			}
		},
		setZoom: (level: number) => {
			state.zoomLevel = Math.max(0.5, Math.min(3, level));
		},
		setPan: (offset: { x: number; y: number }) => {
			state.panOffset = offset;
		},
		setHover: (circleId: Id<'circles'> | null) => {
			state.hoveredCircleId = circleId;
		},
		resetView: () => {
			state.zoomLevel = 1;
			state.panOffset = { x: 0, y: 0 };
		}
	};
}

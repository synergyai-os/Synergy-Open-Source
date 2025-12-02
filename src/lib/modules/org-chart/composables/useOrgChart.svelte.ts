import { browser } from '$app/environment';
import { useQuery, useConvexClient } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import type { CircleNode } from '$lib/utils/orgChartTransform';
import { useNavigationStack } from '$lib/modules/core/composables/useNavigationStack.svelte';
import type {
	CircleSummary,
	CircleMember,
	RoleFiller
} from '$lib/infrastructure/organizational-model';

export type UseOrgChart = ReturnType<typeof useOrgChart>;

// Type for role returned by api.circleRoles.get
type CircleRoleDetail = {
	roleId: Id<'circleRoles'>;
	name: string;
	purpose?: string;
	circleId: Id<'circles'>;
	circleName: string;
	workspaceId: Id<'workspaces'>;
	fillerCount: number;
	createdAt: number;
};

/**
 * Composable for managing org chart state and interactions
 */
export function useOrgChart(options: {
	sessionId: () => string | undefined;
	workspaceId: () => string | undefined;
}) {
	const getSessionId = options.sessionId;
	const getWorkspaceId = options.workspaceId;

	// Navigation stack for hierarchical panel navigation
	const navigationStack = useNavigationStack();

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
		selectedCircle: null as CircleSummary | null,
		selectedCircleMembers: [] as CircleMember[],
		selectedRole: null as CircleRoleDetail | null,
		selectedRoleFillers: [] as RoleFiller[],
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
		browser && getSessionId() && getWorkspaceId()
			? useQuery(api.circles.list, () => {
					const sessionId = getSessionId();
					const workspaceId = getWorkspaceId();
					if (!sessionId || !workspaceId) throw new Error('sessionId and workspaceId required');
					return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
				})
			: null;

	// Query roles for all circles in workspace (preload for instant display)
	const rolesByWorkspaceQuery =
		browser && getSessionId() && getWorkspaceId()
			? useQuery(api.circleRoles.listByWorkspace, () => {
					const sessionId = getSessionId();
					const workspaceId = getWorkspaceId();
					if (!sessionId || !workspaceId) throw new Error('sessionId and workspaceId required');
					return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
				})
			: null;

	// Store roles in Map for O(1) lookup by circleId
	const rolesByCircle = $derived.by(() => {
		const data = rolesByWorkspaceQuery?.data ?? [];
		const map = new Map<
			Id<'circles'>,
			Array<{
				roleId: Id<'circleRoles'>;
				circleId: Id<'circles'>;
				name: string;
				purpose?: string;
				scope?: string;
				fillerCount: number;
				createdAt: number;
			}>
		>();
		for (const { circleId, roles } of data) {
			map.set(circleId, roles);
		}
		return map;
	});

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

		// Get roles for a specific circle (from preloaded data)
		getRolesForCircle: (circleId: Id<'circles'>) => {
			return rolesByCircle.get(circleId) ?? null;
		},

		// Navigation stack - hierarchical panel navigation
		get navigationStack() {
			return navigationStack;
		},

		// Actions
		selectCircle: (circleId: Id<'circles'> | null, options?: { skipStackPush?: boolean }) => {
			state.selectedCircleId = circleId;

			// Update navigation stack (unless explicitly skipped for breadcrumb navigation)
			if (circleId && !options?.skipStackPush) {
				// Find circle name for breadcrumb
				const circle = circlesQuery?.data?.find((c) => c.circleId === circleId);
				const circleName = circle?.name || 'Unknown';

				// Add to navigation stack
				navigationStack.push({
					type: 'circle',
					id: circleId,
					name: circleName
				});
			}
		},

		selectRole: (
			roleId: Id<'circleRoles'> | null,
			source: 'chart' | 'circle-panel' | null,
			options?: { skipStackPush?: boolean }
		) => {
			state.selectedRoleId = roleId;
			state.selectionSource = source;

			// Update navigation stack (unless explicitly skipped for breadcrumb navigation)
			if (roleId && !options?.skipStackPush) {
				// Role name will be loaded asynchronously
				// For now, use placeholder (will update when role data loads)
				navigationStack.push({
					type: 'role',
					id: roleId,
					name: 'Loading...'
				});
			}

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

import { browser } from '$app/environment';
import { useQuery, useConvexClient } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { SvelteMap } from 'svelte/reactivity';
import type { CircleNode } from '../utils/orgChartTransform';
import { getContext } from 'svelte';
import { invariant } from '$lib/utils/invariant';
import type {
	CircleSummary,
	CircleMember,
	RoleFiller
} from '$lib/infrastructure/organizational-model';
import type { CoreModuleAPI } from '$lib/modules/core/api';
import { useOrgChartViewport } from './useOrgChartViewport.svelte';

export type UseOrgChart = ReturnType<typeof useOrgChart>;

// Type for role returned by api.core.roles.index.get
type CircleRoleDetail = {
	roleId: Id<'circleRoles'>;
	name: string;
	purpose?: string;
	circleId: Id<'circles'>;
	circleName: string;
	workspaceId: Id<'workspaces'>;
	fillerCount: number;
	createdAt: number;
	templateId?: Id<'roleTemplates'>;
	isLeadRole: boolean;
};

/**
 * Composable for managing org chart state and interactions
 *
 * **Composition Pattern**: This composable composes smaller, focused composables:
 * - `useOrgChartViewport` - Viewport state (zoom, pan, hover)
 * - `useNavigationStack` (from core module) - Panel navigation breadcrumbs
 *
 * **Query Patterns Used**:
 * - Pattern A (Direct ternary): Static workspace-scoped queries that never re-create
 *   - `circlesQuery`, `rolesByWorkspaceQuery`, `roleTemplatesQuery`
 * - Pattern B ($derived wrapper): Conditional queries that re-create when dependencies change
 *   - `selectedRoleQuery` (re-creates when selectedRoleId changes)
 * - Pattern C (Manual convexClient in $effect): Complex queries with race condition handling
 *   - `selectedCircle`, `selectedCircleMembers`, `selectedCircleMembersWithoutRoles`, `selectedRoleFillers`
 *
 * Each pattern serves a specific purpose. See validation in SYOS-946.
 */
export function useOrgChart(options: {
	sessionId: () => string | undefined;
	workspaceId: () => string | undefined;
}) {
	const getSessionId = options.sessionId;
	const getWorkspaceId = options.workspaceId;

	const coreAPI = getContext<CoreModuleAPI | undefined>('core-api');
	invariant(coreAPI?.useNavigationStack, 'Core navigation stack API unavailable');

	// Navigation stack for hierarchical panel navigation
	const navigationStack = coreAPI.useNavigationStack();

	// Viewport state (zoom, pan, hover) - extracted for clarity
	const viewport = useOrgChartViewport();

	const state = $state({
		// Selected circle for detail panel
		selectedCircleId: null as Id<'circles'> | null,
		// Selected role for detail panel
		selectedRoleId: null as Id<'circleRoles'> | null,
		// Source of role selection (for panel stacking)
		selectionSource: null as 'chart' | 'circle-panel' | null,
		// Query results (loaded via $effect)
		selectedCircle: null as CircleSummary | null,
		selectedCircleMembers: [] as CircleMember[],
		selectedCircleMembersWithoutRoles: [] as CircleMember[],
		selectedRole: null as CircleRoleDetail | null,
		selectedRoleFillers: [] as RoleFiller[],
		// Loading states
		selectedCircleIsLoading: false,
		selectedCircleMembersIsLoading: false,
		selectedCircleMembersWithoutRolesIsLoading: false,
		selectedRoleIsLoading: false,
		selectedRoleFillersIsLoading: false,
		// Error states
		selectedCircleError: null as unknown | null,
		selectedCircleMembersError: null as unknown | null,
		selectedCircleMembersWithoutRolesError: null as unknown | null,
		selectedRoleError: null as unknown | null,
		selectedRoleFillersError: null as unknown | null
	});

	// Convex client for manual queries
	const convexClient = browser ? useConvexClient() : null;

	// Query tracking for race condition prevention
	let currentCircleQueryId: Id<'circles'> | null = null;
	let currentCircleMembersQueryId: Id<'circles'> | null = null;
	let currentCircleMembersWithoutRolesQueryId: Id<'circles'> | null = null;
	let currentRoleFillersQueryId: Id<'circleRoles'> | null = null;

	// Query circles list - wait for org context before querying
	// CRITICAL: Always call useQuery when browser is true to ensure reactivity
	// The query function is reactive, so it will retry when workspaceId becomes available
	// Pattern matches useCircles.svelte.ts (throws error when params not ready)
	const circlesQuery = browser
		? useQuery(api.core.circles.index.list, () => {
				const sessionId = getSessionId();
				const workspaceId = getWorkspaceId();
				// Throw error when dependencies aren't ready - Convex handles this gracefully
				// Query will retry reactively when workspaceId becomes available
				invariant(sessionId && workspaceId, 'sessionId and workspaceId required');
				return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
			})
		: null;

	// Query roles for all circles in workspace (preload for instant display)
	// CRITICAL: Always call useQuery when browser is true to ensure reactivity
	// The query function is reactive, so it will retry when workspaceId becomes available
	// Pattern matches useCircles.svelte.ts (throws error when params not ready)
	const rolesByWorkspaceQuery = browser
		? useQuery(api.core.roles.index.listByWorkspace, () => {
				const sessionId = getSessionId();
				const workspaceId = getWorkspaceId();
				// Throw error when dependencies aren't ready - Convex handles this gracefully
				// Query will retry reactively when workspaceId becomes available
				invariant(sessionId && workspaceId, 'sessionId and workspaceId required');
				return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
			})
		: null;

	// Query role templates to determine which roles are "core"
	// CRITICAL: Always call useQuery when browser is true to ensure reactivity
	// This prevents hydration errors - query throws when params not ready, Convex retries
	const roleTemplatesQuery = browser
		? useQuery(api.core.roles.templates.queries.list, () => {
				const sessionId = getSessionId();
				const workspaceId = getWorkspaceId();
				// Throw error when dependencies aren't ready - Convex handles this gracefully
				// Query will retry reactively when workspaceId becomes available
				invariant(sessionId && workspaceId, 'sessionId and workspaceId required');
				return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
			})
		: null;

	// Store roles in Map for O(1) lookup by circleId
	const rolesByCircle = $derived.by(() => {
		const data = rolesByWorkspaceQuery?.data ?? [];
		const map = new SvelteMap<
			Id<'circles'>,
			Array<{
				roleId: Id<'circleRoles'>;
				circleId: Id<'circles'>;
				name: string;
				purpose?: string;
				templateId?: Id<'roleTemplates'>;
				scope?: string;
				status: 'draft' | 'active';
				isHiring: boolean;
				fillerCount: number;
				createdAt: number;
			}>
		>();
		for (const { circleId, roles } of data) {
			map.set(circleId, roles);
		}
		return map;
	});

	// Store role templates in Map for O(1) lookup by templateId
	// Used to determine which roles are "core" based on their template
	const templatesMap = $derived.by(() => {
		const data = roleTemplatesQuery?.data;
		if (!data) return new SvelteMap<Id<'roleTemplates'>, { isCore: boolean }>();

		const map = new SvelteMap<Id<'roleTemplates'>, { isCore: boolean }>();
		// Add system templates
		for (const template of data.system ?? []) {
			map.set(template._id, { isCore: template.isCore });
		}
		// Add workspace templates
		for (const template of data.workspace ?? []) {
			map.set(template._id, { isCore: template.isCore });
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
			.query(api.core.circles.index.get, {
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
			.query(api.core.circles.index.getMembers, {
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

	// Load selected circle members without roles with $effect pattern
	$effect(() => {
		if (!browser || !convexClient || !state.selectedCircleId) {
			state.selectedCircleMembersWithoutRoles = [];
			state.selectedCircleMembersWithoutRolesIsLoading = false;
			state.selectedCircleMembersWithoutRolesError = null;
			currentCircleMembersWithoutRolesQueryId = null;
			return;
		}

		const sessionId = getSessionId();
		if (!sessionId) {
			state.selectedCircleMembersWithoutRoles = [];
			state.selectedCircleMembersWithoutRolesIsLoading = false;
			state.selectedCircleMembersWithoutRolesError = null;
			currentCircleMembersWithoutRolesQueryId = null;
			return;
		}

		// Generate unique ID for this query
		const queryId = state.selectedCircleId;
		currentCircleMembersWithoutRolesQueryId = queryId;
		state.selectedCircleMembersWithoutRolesIsLoading = true;
		state.selectedCircleMembersWithoutRolesError = null;

		// Load circle members without roles
		convexClient
			.query(api.core.roles.index.getMembersWithoutRoles, {
				sessionId,
				circleId: state.selectedCircleId
			})
			.then((result) => {
				// Only update if this is still the current query (prevent race conditions)
				if (currentCircleMembersWithoutRolesQueryId === queryId) {
					state.selectedCircleMembersWithoutRoles = result;
					state.selectedCircleMembersWithoutRolesIsLoading = false;
					state.selectedCircleMembersWithoutRolesError = null;
				}
			})
			.catch((error) => {
				// Only handle error if this is still the current query
				if (currentCircleMembersWithoutRolesQueryId === queryId) {
					console.error('[useOrgChart] Failed to load members without roles:', error);
					state.selectedCircleMembersWithoutRoles = [];
					state.selectedCircleMembersWithoutRolesIsLoading = false;
					state.selectedCircleMembersWithoutRolesError = error;
				}
			});

		// Cleanup function: mark query as stale when effect re-runs or component unmounts
		return () => {
			if (currentCircleMembersWithoutRolesQueryId === queryId) {
				currentCircleMembersWithoutRolesQueryId = null;
			}
		};
	});

	// Load selected role details with reactive useQuery (matches CircleDetailPanel pattern)
	// CRITICAL: Use $derived to make query creation reactive - when selectedRoleId changes, query re-creates
	const selectedRoleQuery = $derived(
		browser && state.selectedRoleId && getSessionId()
			? useQuery(api.core.roles.index.get, () => {
					const sessionId = getSessionId();
					invariant(sessionId && state.selectedRoleId, 'sessionId and selectedRoleId required');
					return { sessionId, roleId: state.selectedRoleId };
				})
			: null
	);

	// Update state from reactive query (derived values update automatically)
	$effect(() => {
		if (selectedRoleQuery) {
			state.selectedRole = selectedRoleQuery.data ?? null;
			state.selectedRoleIsLoading = selectedRoleQuery.data === undefined;
			state.selectedRoleError = selectedRoleQuery.error ?? null;
		} else {
			state.selectedRole = null;
			state.selectedRoleIsLoading = false;
			state.selectedRoleError = null;
		}
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
			.query(api.core.roles.index.getRoleFillers, {
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
		get selectedCircleMembersWithoutRoles() {
			return state.selectedCircleMembersWithoutRoles;
		},
		get selectedCircleMembersWithoutRolesIsLoading() {
			return state.selectedCircleMembersWithoutRolesIsLoading;
		},
		get selectedCircleMembersWithoutRolesError() {
			return state.selectedCircleMembersWithoutRolesError;
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
		// Viewport state (delegated to viewport composable)
		get zoomLevel() {
			return viewport.zoomLevel;
		},
		get panOffset() {
			return viewport.panOffset;
		},
		get hoveredCircleId() {
			return viewport.hoveredCircleId;
		},
		get isLoading() {
			// If not in browser, always loading
			if (!browser) return true;
			// If query doesn't exist, we're loading
			if (!circlesQuery) return true;
			// If query is skipped (params not ready), we're loading
			// Check if we're waiting for workspaceId to become available
			if (!getSessionId() || !getWorkspaceId()) return true;
			// Otherwise, check if data is loaded
			return circlesQuery.data === undefined;
		},

		// Get roles for a specific circle (from preloaded data)
		getRolesForCircle: (circleId: Id<'circles'>) => {
			return rolesByCircle.get(circleId) ?? null;
		},

		// Get core roles for a specific circle (roles with isCore template)
		getCoreRolesForCircle: (circleId: Id<'circles'>) => {
			const roles = rolesByCircle.get(circleId) ?? [];
			return roles.filter((role) => {
				if (!role.templateId) return false;
				const template = templatesMap.get(role.templateId);
				return template?.isCore === true;
			});
		},

		// Get regular (non-core) roles for a specific circle
		getRegularRolesForCircle: (circleId: Id<'circles'>) => {
			const roles = rolesByCircle.get(circleId) ?? [];
			return roles.filter((role) => {
				if (!role.templateId) return true; // Roles without templateId are regular
				const template = templatesMap.get(role.templateId);
				return template?.isCore !== true;
			});
		},

		// Check if a role is a core role (based on its template)
		isRoleCore: (templateId: Id<'roleTemplates'> | undefined) => {
			if (!templateId) return false;
			const template = templatesMap.get(templateId);
			return template?.isCore === true;
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

		// Edit panel navigation methods
		openEditCircle: (circleId: Id<'circles'>) => {
			const circle = circlesQuery?.data?.find((c) => c.circleId === circleId);
			const circleName = circle?.name || 'Unknown';
			navigationStack.push({
				type: 'edit-circle',
				id: circleId,
				name: `Edit ${circleName}`
			});
		},

		openEditRole: (roleId: Id<'circleRoles'>) => {
			// Role name will be loaded asynchronously, use placeholder for now
			navigationStack.push({
				type: 'edit-role',
				id: roleId,
				name: 'Edit Role' // Will update when role data loads
			});
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

		// Viewport actions (delegated to viewport composable)
		setZoom: viewport.setZoom,
		setPan: viewport.setPan,
		setHover: viewport.setHover,
		resetView: viewport.resetView
	};
}

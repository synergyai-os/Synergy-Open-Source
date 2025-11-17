import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
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
		hoveredCircleId: null as Id<'circles'> | null
	});

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

	// Query selected circle details (if selected)
	const selectedCircleQuery =
		browser && getSessionId() && state.selectedCircleId
			? useQuery(api.circles.get, () => {
					const sessionId = getSessionId();
					const circleId = state.selectedCircleId;
					if (!sessionId || !circleId) throw new Error('sessionId and circleId required');
					return { sessionId, circleId };
				})
			: null;

	// Query members for selected circle
	const selectedCircleMembersQuery =
		browser && getSessionId() && state.selectedCircleId
			? useQuery(api.circles.getMembers, () => {
					const sessionId = getSessionId();
					const circleId = state.selectedCircleId;
					if (!sessionId || !circleId) throw new Error('sessionId and circleId required');
					return { sessionId, circleId };
				})
			: null;

	// Query selected role details (if selected)
	const selectedRoleQuery =
		browser && getSessionId() && state.selectedRoleId
			? useQuery(api.circleRoles.get, () => {
					const sessionId = getSessionId();
					const roleId = state.selectedRoleId;
					if (!sessionId || !roleId) throw new Error('sessionId and roleId required');
					return { sessionId, roleId };
				})
			: null;

	// Query fillers for selected role
	const selectedRoleFillersQuery =
		browser && getSessionId() && state.selectedRoleId
			? useQuery(api.circleRoles.getRoleFillers, () => {
					const sessionId = getSessionId();
					const circleRoleId = state.selectedRoleId;
					if (!sessionId || !circleRoleId) throw new Error('sessionId and circleRoleId required');
					return { sessionId, circleRoleId };
				})
			: null;

	return {
		// Getters - reactive access
		get circles(): CircleNode[] {
			return circlesQuery?.data ?? [];
		},
		get selectedCircle() {
			return selectedCircleQuery?.data ?? null;
		},
		get selectedCircleMembers() {
			return selectedCircleMembersQuery?.data ?? [];
		},
		get selectedCircleId() {
			return state.selectedCircleId;
		},
		get selectedRole() {
			return selectedRoleQuery?.data ?? null;
		},
		get selectedRoleFillers() {
			return selectedRoleFillersQuery?.data ?? [];
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

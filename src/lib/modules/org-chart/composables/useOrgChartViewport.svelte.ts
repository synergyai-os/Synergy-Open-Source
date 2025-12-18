import type { Id } from '$lib/convex';

/**
 * Composable for managing org chart viewport state (zoom, pan, hover)
 *
 * Extracted from useOrgChart to improve separation of concerns.
 * This composable is completely independent - no coupling with circle/role selection or navigation.
 *
 * **Usage Pattern**: Viewport state that's only needed by the chart visualization itself
 * and D3 zoom integration (useOrgChartZoom). No other panels or components need this state.
 *
 * @see useOrgChart - Main composable that composes this viewport state
 * @see useOrgChartZoom - D3 zoom integration that syncs with this state
 *
 * @example
 * ```typescript
 * const viewport = useOrgChartViewport();
 *
 * // Set zoom level
 * viewport.setZoom(1.5);
 *
 * // Check current pan
 * console.log(viewport.panOffset); // { x: 0, y: 0 }
 *
 * // Set hover state
 * viewport.setHover(circleId);
 * ```
 */
export function useOrgChartViewport() {
	const state = $state({
		// Zoom level (scale factor)
		zoomLevel: 1,
		// Pan offset (x, y translation)
		panOffset: { x: 0, y: 0 },
		// Hovered circle ID (for visual feedback)
		hoveredCircleId: null as Id<'circles'> | null
	});

	return {
		// Getters - reactive access to state
		get zoomLevel() {
			return state.zoomLevel;
		},
		get panOffset() {
			return state.panOffset;
		},
		get hoveredCircleId() {
			return state.hoveredCircleId;
		},

		// Actions - mutate state
		setZoom: (level: number) => {
			// Clamp zoom level between 0.5x and 3x
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

export type UseOrgChartViewport = ReturnType<typeof useOrgChartViewport>;

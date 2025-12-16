import { zoom as d3Zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import { select } from 'd3-selection';
import { interpolateZoom } from 'd3-interpolate';
import { transition } from 'd3-transition';
import type { CircleHierarchyNode } from '../utils/orgChartTransform';
import { calculateBounds } from '../utils/orgChartLayout';
import { isSyntheticRoot } from '../utils/orgChartTransform';
import type { UseOrgChart } from './useOrgChart.svelte';
import { ORG_CHART } from '../constants/orgChartConstants';

/**
 * Composable for managing org chart zoom and pan behavior
 *
 * Extracts D3 zoom integration logic from OrgChart component
 * Following Svelte 5 pattern: single $state object with getters
 */
export function useOrgChartZoom(
	svgElement: () => SVGSVGElement | undefined,
	gElement: () => SVGGElement | undefined,
	visibleNodes: () => CircleHierarchyNode[],
	width: () => number,
	height: () => number,
	orgChart: UseOrgChart
) {
	// Internal state using Svelte 5 $state rune
	const state = $state({
		currentView: [0, 0, 1000] as [number, number, number],
		currentZoomLevel: ORG_CHART.ZOOM_INITIAL_LEVEL,
		focusNode: null as CircleHierarchyNode | null,
		zoomBehavior: null as ZoomBehavior<SVGSVGElement, unknown> | null
	});

	/**
	 * Smooth zoom to a specific node using interpolateZoom
	 */
	function zoomToNode(node: CircleHierarchyNode, duration = ORG_CHART.ANIMATION_DURATION_MS) {
		try {
			const svg = svgElement();
			const g = gElement();
			const w = width();
			const h = height();

			if (!svg || !g || !state.zoomBehavior) return;

			// Calculate viewWidth to fit circle with padding in BOTH dimensions
			// This ensures the full circle is visible with padding on all sides
			const diameter = node.r * 2;
			const padding = ORG_CHART.ZOOM_PADDING;
			const maxRenderedDiameter = Math.min(w, h) - padding;
			const viewWidth = (w * diameter) / maxRenderedDiameter;

			const targetView: [number, number, number] = [node.x, node.y, viewWidth];
			const interpolator = interpolateZoom(state.currentView, targetView);
			const t = transition()
				.duration(duration)
				.ease((t) => t * (2 - t)); // easeOutQuad

			t.tween('zoom', () => {
				return (t: number) => {
					const view = interpolator(t);
					state.currentView = view;
					const k = w / view[2];

					// Update zoom level for label visibility
					state.currentZoomLevel = k;

					// Calculate transform
					const transform = zoomIdentity
						.translate(w / 2, h / 2)
						.scale(k)
						.translate(-view[0], -view[1]);

					// Update transform on group element
					if (g) {
						select(g).attr('transform', transform.toString());
					}

					// Sync D3 zoom behavior state
					if (svg && state.zoomBehavior) {
						select(svg).call(state.zoomBehavior.transform, transform);
					}
				};
			});

			// Update focus node (triggers reactive label visibility and role visibility)
			// Don't call selectCircle() to avoid opening the modal - focusNode handles visual active state
			state.focusNode = node;
		} catch (error) {
			console.error('[OrgChart] Failed to zoom to node:', error);
		}
	}

	/**
	 * Zoom out to show full chart (root view)
	 */
	function zoomToRoot(duration = ORG_CHART.ANIMATION_DURATION_MS) {
		try {
			const svg = svgElement();
			const g = gElement();
			const nodes = visibleNodes();
			const w = width();
			const h = height();

			if (!svg || !g || !state.zoomBehavior || nodes.length === 0) return;

			const bounds = calculateBounds(nodes, w, h);
			const targetView: [number, number, number] = bounds;
			const interpolator = interpolateZoom(state.currentView, targetView);
			const t = transition()
				.duration(duration)
				.ease((t) => t * (2 - t)); // easeOutQuad

			t.tween('zoom', () => {
				return (t: number) => {
					const view = interpolator(t);
					state.currentView = view;
					const k = w / view[2];

					// Update zoom level for label visibility
					state.currentZoomLevel = k;

					// Calculate transform
					const transform = zoomIdentity
						.translate(w / 2, h / 2)
						.scale(k)
						.translate(-view[0], -view[1]);

					// Update transform on group element
					if (g) {
						select(g).attr('transform', transform.toString());
					}

					// Sync D3 zoom behavior state
					if (svg && state.zoomBehavior) {
						select(svg).call(state.zoomBehavior.transform, transform);
					}
				};
			});

			// Find root circle and set as focus
			const rootNode = nodes.find((node) => node.depth === 0);
			if (rootNode && !isSyntheticRoot(rootNode.data.circleId)) {
				state.focusNode = rootNode;
				// Don't call selectCircle() to avoid opening the modal
			}
		} catch (error) {
			console.error('[OrgChart] Failed to zoom to root:', error);
		}
	}

	/**
	 * Zoom in by a fixed factor
	 */
	function zoomIn() {
		const svg = svgElement();
		if (svg && state.zoomBehavior) {
			select(svg).call(state.zoomBehavior.scaleBy, ORG_CHART.ZOOM_SCALE_BY_FACTOR);
		}
	}

	/**
	 * Zoom out by a fixed factor
	 */
	function zoomOut() {
		const svg = svgElement();
		if (svg && state.zoomBehavior) {
			select(svg).call(state.zoomBehavior.scaleBy, 1 / ORG_CHART.ZOOM_SCALE_BY_FACTOR);
		}
	}

	/**
	 * Initialize D3 zoom behavior and set initial view
	 * Should be called from onMount in the component
	 */
	function initializeZoom() {
		try {
			const svg = svgElement();
			const g = gElement();
			const nodes = visibleNodes();
			const w = width();
			const h = height();

			if (!svg || !g) return;

			// Create D3 zoom behavior
			state.zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
				.scaleExtent([ORG_CHART.ZOOM_SCALE_MIN, ORG_CHART.ZOOM_SCALE_MAX])
				.on('zoom', (event) => {
					// Apply transform to group element
					if (g) {
						const transform = event.transform;
						select(g).attr('transform', transform.toString());
						// Update zoom level for label visibility
						state.currentZoomLevel = transform.k;
						orgChart.setZoom(transform.k);
						orgChart.setPan({ x: transform.x, y: transform.y });
					}
				});

			// Apply zoom to SVG
			// Prevent browser zoom takeover when reaching scale limits (Option 1 from D3 docs)
			select(svg)
				.call(state.zoomBehavior)
				.on('wheel', (event) => event.preventDefault());

			// Initial zoom to fit entire chart (synchronous, no setTimeout)
			// Use visibleNodes which already has roles extracted and filtered
			if (nodes.length > 0) {
				// Find the root circle (depth 0, first visible node)
				const rootNode = nodes.find((node) => node.depth === 0);
				if (rootNode && !isSyntheticRoot(rootNode.data.circleId)) {
					// Calculate bounds of all visible nodes to fit entire chart
					state.currentView = calculateBounds(nodes, w, h);
					state.focusNode = rootNode;
					state.currentZoomLevel = ORG_CHART.ZOOM_INITIAL_LEVEL;

					// Don't call selectCircle() - panel should not auto-open on initial load
					// focusNode is set for visual active state only

					// Apply initial transform
					if (g) {
						const k = w / state.currentView[2];
						const initialTransform = zoomIdentity
							.translate(w / 2, h / 2)
							.scale(k)
							.translate(-state.currentView[0], -state.currentView[1]);

						select(g).attr('transform', initialTransform.toString());
						// Sync D3 zoom state (use transform method correctly)
						if (state.zoomBehavior) {
							select(svg).call(state.zoomBehavior.transform, initialTransform);
						}
					}
				}
			}
		} catch (error) {
			console.error('[OrgChart] Failed to initialize zoom:', error);
			// Component still renders, just no zoom functionality
		}
	}

	// Return public API following Svelte 5 pattern (getters for reactive state)
	return {
		// Reactive getters for state
		get currentView() {
			return state.currentView;
		},
		get currentZoomLevel() {
			return state.currentZoomLevel;
		},
		get focusNode() {
			return state.focusNode;
		},
		get zoomBehavior() {
			return state.zoomBehavior;
		},

		// Methods
		zoomToNode,
		zoomToRoot,
		zoomIn,
		zoomOut,
		initializeZoom,

		// Internal state setter (for reactive initialization effect)
		setFocusNode: (node: CircleHierarchyNode | null) => {
			state.focusNode = node;
		},
		setCurrentView: (view: [number, number, number]) => {
			state.currentView = view;
		},
		setCurrentZoomLevel: (level: number) => {
			state.currentZoomLevel = level;
		}
	};
}

export type UseOrgChartZoom = ReturnType<typeof useOrgChartZoom>;

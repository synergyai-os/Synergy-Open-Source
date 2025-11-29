/**
 * Org Chart Module API Contract
 *
 * Public interface for the Org Chart module. This enables loose coupling
 * between modules by providing a stable API contract that other modules can
 * depend on, without coupling to internal implementation details.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import { useOrgChart as useOrgChartComposable } from './composables/useOrgChart.svelte';
import type { UseOrgChart } from './composables/useOrgChart.svelte';
import { useCircles as useCirclesComposable } from './composables/useCircles.svelte';
import type { UseCircles } from './composables/useCircles.svelte';

/**
 * Options for useOrgChart composable
 */
export interface UseOrgChartOptions {
	/**
	 * Function returning session ID for authentication
	 */
	sessionId: () => string | undefined;

	/**
	 * Function returning workspace ID for org chart context
	 */
	workspaceId: () => string | undefined;
}

/**
 * Options for useCircles composable
 */
export interface UseCirclesOptions {
	/**
	 * Function returning session ID for authentication
	 */
	sessionId: () => string | undefined;

	/**
	 * Function returning workspace ID for circles context
	 */
	workspaceId: () => string | undefined;

	/**
	 * Optional function returning circle ID for single circle queries
	 */
	circleId?: () => string | undefined;
}

/**
 * Public API contract for the Org Chart module
 *
 * This interface defines the public surface that other modules can depend on.
 * Internal implementation details are hidden behind this contract, enabling
 * safe refactoring without breaking dependent modules.
 *
 * **Public Composables:**
 * - `useOrgChart` - Factory function for org chart state management
 *   - Returns: `UseOrgChart` interface (reactive org chart state and actions)
 * - `useCircles` - Factory function for circles state management
 *   - Returns: `UseCircles` interface (reactive circles state and actions)
 *
 * **Usage Pattern (Dependency Injection):**
 * ```typescript
 * import type { OrgChartModuleAPI } from '$lib/modules/org-chart/api';
 * import { getContext } from 'svelte';
 *
 * // Get org chart API from context
 * const orgChartAPI = getContext<OrgChartModuleAPI | undefined>('org-chart-api');
 *
 * // Composable usage:
 * const orgChart = orgChartAPI?.useOrgChart({
 *   sessionId: getSessionId,
 *   workspaceId: getWorkspaceId
 * });
 * ```
 *
 * **Migration Path:**
 * - Phase 1 (Current): Direct import still works (backward compatible)
 * - Phase 2 (Future): Use dependency injection via context
 * - Phase 3 (Future): Module registry provides APIs
 */
export interface OrgChartModuleAPI {
	/**
	 * Composable for managing org chart state and interactions
	 *
	 * Provides reactive access to circles, roles, navigation stack, and
	 * selection state for org chart visualization and detail panels.
	 *
	 * @param options - Configuration options
	 * @returns Reactive org chart data and actions
	 */
	useOrgChart(options: UseOrgChartOptions): UseOrgChart;

	/**
	 * Composable for managing circles state and interactions
	 *
	 * Provides reactive access to circles list, single circle details,
	 * members, roles, and circle/role mutations.
	 *
	 * @param options - Configuration options
	 * @returns Reactive circles data and actions
	 */
	useCircles(options: UseCirclesOptions): UseCircles;
}

/**
 * Factory function to create OrgChartModuleAPI implementation
 *
 * This function creates and returns the OrgChartModuleAPI implementation,
 * which can be provided via context to other modules.
 *
 * @returns OrgChartModuleAPI implementation
 *
 * @example
 * ```typescript
 * import { createOrgChartModuleAPI } from '$lib/modules/org-chart/api';
 * import { setContext } from 'svelte';
 *
 * const orgChartAPI = createOrgChartModuleAPI();
 * setContext('org-chart-api', orgChartAPI);
 * ```
 */
export function createOrgChartModuleAPI(): OrgChartModuleAPI {
	return {
		// Expose useOrgChart composable
		useOrgChart: useOrgChartComposable,
		// Expose useCircles composable
		useCircles: useCirclesComposable
	};
}

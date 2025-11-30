/**
 * Org Chart Module API Contract
 *
 * Public interface for the Org Chart module (visualization only).
 * This module provides org chart visualization features.
 *
 * **Core data** (circles, members, roles) is now in infrastructure:
 * @see $lib/infrastructure/organizational-model
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import { useOrgChart as useOrgChartComposable } from './composables/useOrgChart.svelte';
import type { UseOrgChart } from './composables/useOrgChart.svelte';

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
 * Public API contract for the Org Chart module
 *
 * This interface defines the public surface that other modules can depend on.
 * Internal implementation details are hidden behind this contract, enabling
 * safe refactoring without breaking dependent modules.
 *
 * **Public Composables:**
 * - `useOrgChart` - Factory function for org chart visualization state management
 *   - Returns: `UseOrgChart` interface (reactive org chart visualization state and actions)
 *
 * **Note:** Core data composables (useCircles, useCircleMembers, useCircleRoles) are now
 * in `$lib/infrastructure/organizational-model` and are not behind feature flags.
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
	 * Composable for managing org chart visualization state and interactions
	 *
	 * Provides reactive access to navigation stack, selection state, zoom/pan,
	 * and detail panel state for org chart visualization.
	 *
	 * **Note:** For core data (circles, members, roles), use:
	 * `$lib/infrastructure/organizational-model`
	 *
	 * @param options - Configuration options
	 * @returns Reactive org chart visualization state and actions
	 */
	useOrgChart(options: UseOrgChartOptions): UseOrgChart;
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
		// Expose useOrgChart composable (visualization only)
		useOrgChart: useOrgChartComposable
	};
}

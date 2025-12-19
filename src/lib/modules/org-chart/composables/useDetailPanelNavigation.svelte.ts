import type { UseOrgChart } from './useOrgChart.svelte';
import type { Id } from '$lib/convex';

/**
 * Parameters for useDetailPanelNavigation composable
 */
export interface UseDetailPanelNavigationParams {
	/**
	 * Getter for orgChart composable instance
	 * Must be a function to allow reactive access
	 */
	orgChart: () => UseOrgChart | null;

	/**
	 * Getter for edit mode state
	 * Returns true if currently in edit mode
	 */
	isEditMode: () => boolean;

	/**
	 * Getter for dirty state (unsaved changes)
	 * Returns true if there are unsaved changes
	 */
	isDirty: () => boolean;

	/**
	 * Callback to show discard dialog
	 * Called when user tries to navigate with unsaved changes
	 */
	onShowDiscardDialog: () => void;

	/**
	 * Callback to reset edit mode
	 * Called when exiting edit mode without saving
	 */
	resetEditMode: () => void;
}

/**
 * Return type for useDetailPanelNavigation composable
 */
export interface UseDetailPanelNavigationReturn {
	/**
	 * Handle close action (ESC key or close button)
	 * - Checks for unsaved changes
	 * - Exits edit mode if active
	 * - Navigates back one level in navigation stack
	 */
	handleClose: () => void;

	/**
	 * Handle breadcrumb click action
	 * - Checks for unsaved changes
	 * - Exits edit mode if active
	 * - Jumps to specific layer in navigation stack
	 *
	 * @param index - 0-based index of target layer
	 */
	handleBreadcrumbClick: (index: number) => void;
}

/**
 * Composable for managing detail panel navigation with edit mode handling
 *
 * **Purpose**: Extracts duplicated navigation logic from CircleDetailPanel and RoleDetailPanel
 * into a single reusable composable. Handles unsaved changes, edit mode, and navigation stack
 * manipulation.
 *
 * **Responsibilities**:
 * - Check for unsaved changes before navigation
 * - Exit edit mode when navigating
 * - Coordinate with navigation stack (pop, jumpTo)
 * - Route to correct panel based on layer type (circle vs role)
 *
 * **Pattern**: Pure logic composable (no reactive state - delegates to parent components)
 * - Uses function parameters for reactive values (isEditMode, isDirty)
 * - Returns plain functions (handleClose, handleBreadcrumbClick)
 * - All state management delegated to orgChart and parent component
 *
 * @example
 * ```typescript
 * const navigation = useDetailPanelNavigation({
 *   orgChart: () => orgChart,
 *   isEditMode: () => isEditMode,
 *   isDirty: () => editCircle.isDirty,
 *   onShowDiscardDialog: () => { showDiscardDialog = true; },
 *   resetEditMode: () => {
 *     isEditMode = false;
 *     editCircle.reset();
 *   }
 * });
 *
 * // Use in component
 * <StackedPanel onClose={navigation.handleClose} onBreadcrumbClick={navigation.handleBreadcrumbClick} />
 * ```
 */
export function useDetailPanelNavigation(
	params: UseDetailPanelNavigationParams
): UseDetailPanelNavigationReturn {
	const { orgChart, isEditMode, isDirty, onShowDiscardDialog, resetEditMode } = params;

	/**
	 * Handle close action (ESC key or close button)
	 * Goes back one level in navigation stack
	 */
	function handleClose() {
		const chart = orgChart();
		if (!chart) return;

		// Check if in edit mode with unsaved changes
		if (isEditMode() && isDirty()) {
			onShowDiscardDialog();
			return;
		}

		// Exit edit mode if active
		if (isEditMode()) {
			resetEditMode();
		}

		// ESC goes back one level (not all the way)
		const previousLayer = chart.navigationStack.previousLayer;

		if (previousLayer) {
			// Pop current layer
			chart.navigationStack.pop();

			// Navigate to previous layer WITHOUT pushing (we're already there after pop)
			if (previousLayer.type === 'circle') {
				chart.selectCircle(previousLayer.id as Id<'circles'>, { skipStackPush: true });
			} else if (previousLayer.type === 'role') {
				chart.selectRole(previousLayer.id as Id<'circleRoles'>, 'circle-panel', {
					skipStackPush: true
				});
			}
		} else {
			// No previous layer - close everything
			chart.navigationStack.pop();
			chart.selectCircle(null);
		}
	}

	/**
	 * Handle breadcrumb click action
	 * Jumps to specific layer in navigation stack
	 *
	 * @param index - 0-based index of target layer
	 */
	function handleBreadcrumbClick(index: number) {
		const chart = orgChart();
		if (!chart) return;

		// Check if in edit mode with unsaved changes
		if (isEditMode() && isDirty()) {
			onShowDiscardDialog();
			return;
		}

		// Exit edit mode if active
		if (isEditMode()) {
			resetEditMode();
		}

		// Get the target layer to navigate to
		const targetLayer = chart.navigationStack.getLayer(index);
		if (!targetLayer) return;

		// Jump to that layer in the stack (this already positions us at the right layer)
		chart.navigationStack.jumpTo(index);

		// Re-open the panel for that layer WITHOUT pushing to stack (we're already there)
		if (targetLayer.type === 'circle') {
			chart.selectCircle(targetLayer.id as Id<'circles'>, { skipStackPush: true });
		} else if (targetLayer.type === 'role') {
			chart.selectRole(targetLayer.id as Id<'circleRoles'>, 'circle-panel', {
				skipStackPush: true
			});
		}
	}

	return {
		handleClose,
		handleBreadcrumbClick
	};
}

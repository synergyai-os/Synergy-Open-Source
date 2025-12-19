/**
 * CircleDetailContext - Shared context for CircleDetailPanel and tab components
 *
 * This context provides shared state (circle data, composables, handlers, permissions)
 * to extracted tab components, eliminating prop drilling.
 *
 * Pattern: Svelte's context API for component composition
 * Reference: architecture.md → "Frontend Patterns (Svelte 5)" → "Composables Pattern"
 */

import type { Id } from '$lib/convex';
import type { UseCustomFieldsReturn } from '../composables/useCustomFields.svelte';
import type { UseEditCircleReturn } from '../composables/useEditCircle.svelte';
import type { CircleType, DecisionModel } from '$lib/infrastructure/organizational-model/constants';

/**
 * Circle data from orgChart composable (selectedCircle)
 */
export interface CircleData {
	circleId: Id<'circles'>;
	workspaceId: Id<'workspaces'>;
	name: string;
	purpose: string | null;
	circleType: CircleType;
	decisionModel: DecisionModel;
	parentCircleId: Id<'circles'> | null;
	status: 'active' | 'draft' | 'archived';
	createdAt: number;
	updatedAt: number;
}

/**
 * Context interface for CircleDetailPanel
 * Provides all data, composables, permissions, and handlers needed by tab components
 */
export interface CircleDetailContext {
	// ==========================================
	// Core Data (reactive getters)
	// ==========================================
	circle: () => CircleData | null;

	// ==========================================
	// Composables (already reactive internally)
	// ==========================================
	customFields: UseCustomFieldsReturn;
	editCircle: UseEditCircleReturn;

	// ==========================================
	// Permissions
	// ==========================================
	canEdit: () => boolean;
	editReason: () => string | undefined;
	isEditMode: () => boolean;
	isDesignPhase: () => boolean;
	isCircleLead: () => boolean;

	// ==========================================
	// Handlers for child components to call
	// ==========================================

	/**
	 * Quick update circle name/purpose (inline editing)
	 */
	handleQuickUpdateCircle: (updates: { name?: string; purpose?: string }) => Promise<void>;

	/**
	 * Add item to multi-item field (Domains, Accountabilities, etc.)
	 */
	handleAddMultiItemField: (categoryName: string, content: string) => Promise<void>;

	/**
	 * Update item in multi-item field
	 */
	handleUpdateMultiItemField: (
		categoryName: string,
		itemId: Id<'circleItems'>,
		content: string
	) => Promise<void>;

	/**
	 * Delete item from multi-item field
	 */
	handleDeleteMultiItemField: (categoryName: string, itemId: Id<'circleItems'>) => Promise<void>;

	/**
	 * Update single-value field (Notes)
	 */
	handleUpdateSingleField: (categoryName: string, content: string) => Promise<void>;

	// ==========================================
	// Helper Functions
	// ==========================================

	/**
	 * Get field value as array (for multi-item fields like Domains, Accountabilities)
	 */
	getFieldValueAsArray: (systemKey: string) => string[];

	/**
	 * Get field value as string (for single-value fields like Purpose, Notes)
	 */
	getFieldValueAsString: (systemKey: string) => string;

	/**
	 * Get items for category in CircleItem format (for CategoryItemsList component)
	 */
	getItemsForCategory: (categoryName: string) => Array<{
		itemId: Id<'circleItems'>;
		content: string;
		order: number;
		createdAt: number;
		updatedAt: number;
	}>;
}

/**
 * Symbol key for context access
 * Used with Svelte's getContext/setContext API
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { getContext } from 'svelte';
 *   import { CIRCLE_DETAIL_KEY, type CircleDetailContext } from './CircleDetailContext.svelte';
 *
 *   const ctx = getContext<CircleDetailContext>(CIRCLE_DETAIL_KEY);
 * </script>
 * ```
 */
export const CIRCLE_DETAIL_KEY = Symbol('circle-detail');

/**
 * Core Module API Contract
 *
 * Public interface for the Core module. This enables loose coupling
 * between modules by providing a stable API contract that other modules can
 * depend on, without coupling to internal implementation details.
 *
 * The Core module provides foundational functionality that other modules depend on:
 * - Shared UI components (TagSelector)
 * - Organizations (via OrganizationsModuleAPI)
 * - Authentication context
 * - Shared utilities and types
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { Id } from '$lib/convex';

/**
 * Tag type used by TagSelector component
 */
export type Tag = {
	_id: Id<'tags'>;
	displayName: string;
	color: string;
	parentId?: Id<'tags'>;
	level?: number;
};

/**
 * TagSelector component props
 */
export type TagSelectorProps = {
	selectedTagIds: Id<'tags'>[];
	availableTags: Tag[];
	onTagsChange: (tagIds: Id<'tags'>[]) => void;
	onCreateTag?: (displayName: string, color: string) => Promise<Id<'tags'>>;
	onCreateTagWithColor?: (
		displayName: string,
		color: string,
		parentId?: Id<'tags'>
	) => Promise<Id<'tags'>>;
	tagInputRef?: HTMLElement | null;
	comboboxOpen?: boolean;
	showLabel?: boolean;
	inline?: boolean;
};

/**
 * Public API contract for the Core module
 *
 * This interface defines the public surface that other modules can depend on.
 * Internal implementation details are hidden behind this contract, enabling
 * safe refactoring without breaking dependent modules.
 *
 * **Public Components:**
 * - `TagSelector` - Component for selecting and managing tags
 *   - Props: See `TagSelectorProps` type
 *
 * **Usage Pattern (Dependency Injection):**
 * ```typescript
 * import type { CoreModuleAPI } from '$lib/modules/core/api';
 * import { getContext } from 'svelte';
 *
 * // Get core API from context
 * const coreAPI = getContext<CoreModuleAPI | undefined>('core-api');
 * const TagSelector = coreAPI?.TagSelector;
 *
 * // Component usage:
 * {#if TagSelector}
 *   <TagSelector
 *     selectedTagIds={selectedIds}
 *     availableTags={tags}
 *     onTagsChange={handleChange}
 *   />
 * {/if}
 * ```
 *
 * **Migration Path:**
 * - Phase 1 (Current): Direct import still works (backward compatible)
 * - Phase 2 (Current): Use dependency injection via context ✅
 * - Phase 3 (Future): Module registry provides APIs
 */
export interface CoreModuleAPI {
	/**
	 * TagSelector component for selecting and managing tags
	 *
	 * Exposed via module API to enable loose coupling between modules.
	 * Other modules (flashcards, quick-create, meetings) can use this component
	 * without directly importing from a specific module.
	 */
	TagSelector: typeof import('$lib/modules/core/components/TagSelector.svelte').default;
}

import TagSelectorComponent from '$lib/modules/core/components/TagSelector.svelte';

/**
 * Factory function to create CoreModuleAPI implementation
 *
 * This function creates and returns the CoreModuleAPI implementation,
 * which can be provided via context to other modules.
 *
 * @returns CoreModuleAPI implementation
 *
 * @example
 * ```typescript
 * import { createCoreModuleAPI } from '$lib/modules/core/api';
 * import { setContext } from 'svelte';
 *
 * const coreAPI = createCoreModuleAPI();
 * setContext('core-api', coreAPI);
 * ```
 */
export function createCoreModuleAPI(): CoreModuleAPI {
	return {
		// Expose TagSelector component
		TagSelector: TagSelectorComponent
	};
}

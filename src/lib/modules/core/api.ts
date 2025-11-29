/**
 * Core Module API Contract
 *
 * Public interface for the Core module. This enables loose coupling
 * between modules by providing a stable API contract that other modules can
 * depend on, without coupling to internal implementation details.
 *
 * The Core module provides foundational functionality that other modules depend on:
 * - Shared UI components (TagSelector)
 * - Tagging functionality (via useTagging composable)
 * - Organizations (via WorkspacesModuleAPI)
 * - Authentication context
 * - Shared utilities and types
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { Id } from '$lib/convex';
import { useTagging as useTaggingComposable } from './composables/useTagging.svelte';
import { useGlobalShortcuts as useGlobalShortcutsComposable } from './composables/useGlobalShortcuts.svelte';

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
 * Tagging API interface (return type of useTagging composable)
 *
 * Provides reactive state and actions for tagging entities.
 */
export interface TaggingAPI {
	/**
	 * Whether tags are currently being assigned
	 */
	get isAssigning(): boolean;

	/**
	 * Error message if tagging operation failed (null if no error)
	 */
	get error(): string | null;

	/**
	 * Assign tags to an entity (replaces existing tags)
	 * @param entityId - Entity ID (highlight, flashcard, or inbox item)
	 * @param tagIds - Array of tag IDs to assign
	 */
	assignTags(
		entityId: Id<'highlights'> | Id<'flashcards'> | Id<'inboxItems'>,
		tagIds: Id<'tags'>[]
	): Promise<void>;

	/**
	 * Create a new tag with color and optional parent
	 * @param displayName - Tag display name
	 * @param color - Tag color (hex code)
	 * @param parentId - Optional parent tag ID for hierarchical tags
	 * @returns Promise resolving to the created tag ID
	 */
	createTag(displayName: string, color: string, parentId?: Id<'tags'>): Promise<Id<'tags'>>;
}

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
 * - `QuickCreateModal` - Global quick create modal component
 * - `Sidebar` - Global sidebar navigation component
 * - `AppTopBar` - Global top bar component
 * - `GlobalActivityTracker` - Global activity tracker component
 *
 * **Public Composables:**
 * - `useTagging` - Factory function for tagging API
 *   - Returns: `TaggingAPI` interface
 * - `useGlobalShortcuts` - Factory function for global keyboard shortcuts
 *   - Returns: Global shortcuts API with register/unregister/enable/disable methods
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
 *
 * // Composable usage:
 * const tagging = coreAPI?.useTagging('flashcard', getUserId, getSessionId, getOrgId);
 * await tagging?.assignTags(flashcardId, [tag1Id, tag2Id]);
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

	/**
	 * QuickCreateModal component for global quick create functionality
	 *
	 * Exposed via module API to enable loose coupling. Used by layout for
	 * global quick create modal triggered by keyboard shortcuts.
	 */
	QuickCreateModal: typeof import('$lib/modules/core/components/QuickCreateModal.svelte').default;

	/**
	 * Sidebar component for global navigation
	 *
	 * Exposed via module API to enable loose coupling. Used by layout for
	 * global sidebar navigation.
	 */
	Sidebar: typeof import('$lib/modules/core/components/Sidebar.svelte').default;

	/**
	 * AppTopBar component for global top bar
	 *
	 * Exposed via module API to enable loose coupling. Used by layout for
	 * global top bar with account/workspace switching.
	 */
	AppTopBar: typeof import('$lib/modules/core/components/AppTopBar.svelte').default;

	/**
	 * GlobalActivityTracker component for global activity tracking
	 *
	 * Exposed via module API to enable loose coupling. Used by layout for
	 * global activity tracking display.
	 */
	GlobalActivityTracker: typeof import('$lib/modules/core/components/GlobalActivityTracker.svelte').default;

	/**
	 * Tagging API factory function
	 *
	 * Creates a tagging API instance for a specific entity type.
	 * This is the public interface for the useTagging composable.
	 *
	 * **Parameters:**
	 * - `entityType`: Entity type ('highlight' | 'flashcard' | 'note' | 'source')
	 * - `getUserId`: Function returning user ID
	 * - `getSessionId`: Function returning session ID
	 * - `getWorkspaceId`: Optional function returning workspace ID
	 *
	 * **Returns:** TaggingAPI instance with reactive state and actions
	 */
	useTagging: (
		entityType: 'highlight' | 'flashcard' | 'note' | 'source',
		getUserId: () => string | undefined,
		getSessionId: () => string | null | undefined,
		getWorkspaceId?: () => string | null | undefined
	) => TaggingAPI;

	/**
	 * Global shortcuts API factory function
	 *
	 * Creates a global shortcuts API instance for managing application-wide
	 * keyboard shortcuts. Used by layout for global keyboard shortcuts.
	 *
	 * **Returns:** Global shortcuts API with register/unregister/enable/disable methods
	 */
	useGlobalShortcuts: typeof useGlobalShortcutsComposable;
}

import TagSelectorComponent from '$lib/modules/core/components/TagSelector.svelte';
import QuickCreateModalComponent from '$lib/modules/core/components/QuickCreateModal.svelte';
import SidebarComponent from '$lib/modules/core/components/Sidebar.svelte';
import AppTopBarComponent from '$lib/modules/core/components/AppTopBar.svelte';
import GlobalActivityTrackerComponent from '$lib/modules/core/components/GlobalActivityTracker.svelte';

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
		TagSelector: TagSelectorComponent,
		// Expose global components
		QuickCreateModal: QuickCreateModalComponent,
		Sidebar: SidebarComponent,
		AppTopBar: AppTopBarComponent,
		GlobalActivityTracker: GlobalActivityTrackerComponent,
		// Expose useTagging composable
		useTagging: useTaggingComposable,
		// Expose useGlobalShortcuts composable
		useGlobalShortcuts: useGlobalShortcutsComposable
	};
}

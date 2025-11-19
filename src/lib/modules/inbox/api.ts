/**
 * Inbox Module API Contract
 *
 * Public interface for the Inbox module. This enables loose coupling
 * between modules by providing a stable API contract that other modules can
 * depend on, without coupling to internal implementation details.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { Id } from '$lib/convex';
import { useTagging as useTaggingComposable } from '$lib/composables/useTagging.svelte';

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
 * Public API contract for the Inbox module
 *
 * This interface defines the public surface that other modules can depend on.
 * Internal implementation details are hidden behind this contract, enabling
 * safe refactoring without breaking dependent modules.
 *
 * **Public Composables:**
 * - `useTagging` - Factory function for tagging API
 *   - Returns: `TaggingAPI` interface
 *
 * **Usage Pattern (Dependency Injection):**
 * ```typescript
 * import type { InboxModuleAPI } from '$lib/modules/inbox/api';
 * import { getContext } from 'svelte';
 *
 * // Get inbox API from context
 * const inboxAPI = getContext<InboxModuleAPI | undefined>('inbox-api');
 *
 * // Composable usage:
 * const tagging = inboxAPI?.useTagging('flashcard', getUserId, getSessionId, getOrgId);
 * await tagging?.assignTags(flashcardId, [tag1Id, tag2Id]);
 * ```
 *
 * **Migration Path:**
 * - Phase 1 (Current): Direct import still works (backward compatible)
 * - Phase 2 (Current): Use dependency injection via context ✅
 * - Phase 3 (Future): Module registry provides APIs
 */
export interface InboxModuleAPI {
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
	 * - `getOrganizationId`: Optional function returning organization ID
	 *
	 * **Returns:** TaggingAPI instance with reactive state and actions
	 */
	useTagging: (
		entityType: 'highlight' | 'flashcard' | 'note' | 'source',
		getUserId: () => string | undefined,
		getSessionId: () => string | null | undefined,
		getOrganizationId?: () => string | null | undefined
	) => TaggingAPI;
}

/**
 * Factory function to create InboxModuleAPI implementation
 *
 * This function creates and returns the InboxModuleAPI implementation,
 * which can be provided via context to other modules.
 *
 * @returns InboxModuleAPI implementation
 *
 * @example
 * ```typescript
 * import { createInboxModuleAPI } from '$lib/modules/inbox/api';
 * import { setContext } from 'svelte';
 *
 * const inboxAPI = createInboxModuleAPI();
 * setContext('inbox-api', inboxAPI);
 * ```
 */
export function createInboxModuleAPI(): InboxModuleAPI {
	return {
		// Expose useTagging composable
		useTagging: useTaggingComposable
	};
}

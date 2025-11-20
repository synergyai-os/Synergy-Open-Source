/**
 * Flashcards Module API Contract
 *
 * Public interface for the Flashcards module. This enables loose coupling
 * between modules by providing a stable API contract that other modules can
 * depend on, without coupling to internal implementation details.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import { useStudySession as useStudySessionComposable } from './composables/useStudySession.svelte';
import type { UseStudySessionReturn } from './composables/useStudySession.svelte';

/**
 * Options for useStudySession composable
 */
export interface UseStudySessionOptions {
	/**
	 * Function returning session ID for authentication
	 */
	sessionId: () => string | undefined;
}

/**
 * Public API contract for the Flashcards module
 *
 * This interface defines the public surface that other modules can depend on.
 * Internal implementation details are hidden behind this contract, enabling
 * safe refactoring without breaking dependent modules.
 *
 * **Public Composables:**
 * - `useStudySession` - Factory function for study session state management
 *   - Returns: `UseStudySessionReturn` interface (reactive study session state and actions)
 *
 * **Usage Pattern (Dependency Injection):**
 * ```typescript
 * import type { FlashcardsModuleAPI } from '$lib/modules/flashcards/api';
 * import { getContext } from 'svelte';
 *
 * // Get flashcards API from context
 * const flashcardsAPI = getContext<FlashcardsModuleAPI | undefined>('flashcards-api');
 *
 * // Composable usage:
 * const study = flashcardsAPI?.useStudySession({
 *   sessionId: getSessionId
 * });
 * ```
 *
 * **Migration Path:**
 * - Phase 1 (Current): Direct import still works (backward compatible)
 * - Phase 2 (Future): Use dependency injection via context
 * - Phase 3 (Future): Module registry provides APIs
 */
export interface FlashcardsModuleAPI {
	/**
	 * Composable for managing study session state and interactions
	 *
	 * Provides reactive access to review queue, current card, progress, and
	 * rating actions for flashcard study sessions.
	 *
	 * @param options - Configuration options
	 * @returns Reactive study session data and actions
	 */
	useStudySession(options: UseStudySessionOptions): UseStudySessionReturn;
}

/**
 * Factory function to create FlashcardsModuleAPI implementation
 *
 * This function creates and returns the FlashcardsModuleAPI implementation,
 * which can be provided via context to other modules.
 *
 * @returns FlashcardsModuleAPI implementation
 *
 * @example
 * ```typescript
 * import { createFlashcardsModuleAPI } from '$lib/modules/flashcards/api';
 * import { setContext } from 'svelte';
 *
 * const flashcardsAPI = createFlashcardsModuleAPI();
 * setContext('flashcards-api', flashcardsAPI);
 * ```
 */
export function createFlashcardsModuleAPI(): FlashcardsModuleAPI {
	return {
		// Expose useStudySession composable
		useStudySession: (options) => useStudySessionComposable(options.sessionId)
	};
}

// Re-export types for convenience
export type {
	StudyFlashcard,
	FlashcardRating,
	UseStudySessionReturn
} from './composables/useStudySession.svelte';

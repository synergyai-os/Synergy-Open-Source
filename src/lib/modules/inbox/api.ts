/**
 * Inbox Module API Contract
 *
 * Public interface for the Inbox module. This enables loose coupling
 * between modules by providing a stable API contract that other modules can
 * depend on, without coupling to internal implementation details.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

/**
 * Public API contract for the Inbox module
 *
 * This interface defines the public surface that other modules can depend on.
 * Internal implementation details are hidden behind this contract, enabling
 * safe refactoring without breaking dependent modules.
 *
 * **Usage Pattern (Dependency Injection):**
 * ```typescript
 * import type { InboxModuleAPI } from '$lib/modules/inbox/api';
 * import { getContext } from 'svelte';
 *
 * // Get inbox API from context
 * const inboxAPI = getContext<InboxModuleAPI | undefined>('inbox-api');
 * ```
 *
 * **Migration Path:**
 * - Phase 1 (Current): Direct import still works (backward compatible)
 * - Phase 2 (Current): Use dependency injection via context ✅
 * - Phase 3 (Future): Module registry provides APIs
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InboxModuleAPI {
	// Inbox module API (currently minimal, ready for future expansion)
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
		// Inbox module API (currently minimal, ready for future expansion)
	};
}

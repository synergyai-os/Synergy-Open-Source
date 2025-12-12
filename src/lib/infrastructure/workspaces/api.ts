/**
 * Organizations Module API Contract
 *
 * Public interface for the Organizations module. This enables loose coupling
 * between modules by providing a stable API contract that other modules can
 * depend on, without coupling to internal implementation details.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type { WorkspaceSummary, WorkspaceInvite } from './composables/useWorkspaces.svelte';

/**
 * Modal keys for workspace modals
 */
export type ModalKey = 'createWorkspace' | 'joinOrganization';

/**
 * Modal state object
 */
export type ModalState = {
	createWorkspace: boolean;
	joinOrganization: boolean;
};

/**
 * Public API contract for the Organizations module
 *
 * This interface defines the public surface that other modules can depend on.
 * Internal implementation details are hidden behind this contract, enabling
 * safe refactoring without breaking dependent modules.
 *
 * **Usage Pattern:**
 * ```typescript
 * import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/api';
 *
 * // In component:
 * const workspaces = getContext<WorkspacesModuleAPI>('workspaces');
 * const activeOrg = workspaces.activeWorkspace;
 * ```
 *
 * **Migration Path:**
 * - Phase 1 (Current): Direct import still works (backward compatible)
 * - Phase 2 (Future): Use dependency injection via context
 * - Phase 3 (Future): Module registry provides APIs
 */
export interface WorkspacesModuleAPI {
	// ===== Reactive Properties (Getters) =====

	/**
	 * List of all workspaces the user belongs to
	 */
	get workspaces(): WorkspaceSummary[];

	/**
	 * Currently active workspace ID (null if no workspace selected)
	 */
	get activeWorkspaceId(): string | null;

	/**
	 * Currently active workspace object (null if no workspace selected or loading)
	 * Returns cached workspace while loading for instant UI updates
	 */
	get activeWorkspace(): WorkspaceSummary | null;

	/**
	 * List of pending workspace invites for the user
	 */
	get workspaceInvites(): WorkspaceInvite[];

	/**
	 * Modal state (which modals are open)
	 */
	get modals(): ModalState;

	/**
	 * Loading state for each mutation operation
	 */
	get loading(): {
		createWorkspace: boolean;
		joinOrganization: boolean;
	};

	/**
	 * Whether queries are currently loading
	 */
	get isLoading(): boolean;

	/**
	 * Whether workspace switching is in progress
	 */
	get isSwitching(): boolean;

	/**
	 * Organization ID being switched to (during switch)
	 */
	get switchingTo(): string | null;

	/**
	 * Type of entity being switched to
	 *
	 * **Values:**
	 * - `'workspace'` - Switching between workspaces/workspaces within the same account
	 * - `null` - Not currently switching
	 *
	 * **Note:** `'personal'` is reserved for account switching (switching between different user accounts),
	 * which is handled separately in the layout component, not by this module.
	 * The Organizations module only handles workspace switching, so this will always be `'workspace'` when switching.
	 */
	get switchingToType(): 'workspace' | null;

	// ===== Actions (Methods) =====

	/**
	 * Switch to a different workspace
	 * @param workspaceId - Organization ID to switch to, or null to default to first workspace
	 *
	 * **Note:** Users are required to have at least one workspace (enforced server-side).
	 * Passing `null` will default to the first workspace in the list, not a personal workspace.
	 */
	setActiveWorkspace(workspaceId: string | null): void;

	/**
	 * Open a modal dialog
	 * @param key - Modal key to open
	 */
	openModal(key: ModalKey): void;

	/**
	 * Close a modal dialog
	 * @param key - Modal key to close
	 */
	closeModal(key: ModalKey): void;

	/**
	 * Create a new workspace
	 * @param payload - Organization creation payload
	 * @param payload.name - Organization name
	 */
	createWorkspace(payload: { name: string }): Promise<void>;

	/**
	 * Join an workspace by invite code
	 * @param payload - Join workspace payload
	 * @param payload.code - Invite code
	 */
	joinOrganization(payload: { code: string }): Promise<void>;

	/**
	 * Accept an workspace invite
	 * @param inviteId - Invite ID
	 */
	acceptOrganizationInvite(inviteId: string): Promise<void>;

	/**
	 * Decline an workspace invite
	 * @param inviteId - Invite ID
	 */
	declineOrganizationInvite(inviteId: string): Promise<void>;
}

/**
 * Organizations Module API Contract
 *
 * Public interface for the Organizations module. This enables loose coupling
 * between modules by providing a stable API contract that other modules can
 * depend on, without coupling to internal implementation details.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 */

import type {
	OrganizationSummary,
	OrganizationInvite
} from './composables/useOrganizations.svelte';

/**
 * Modal keys for organization modals
 */
export type ModalKey = 'createOrganization' | 'joinOrganization';

/**
 * Modal state object
 */
export type ModalState = {
	createOrganization: boolean;
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
 * import type { OrganizationsModuleAPI } from '$lib/modules/core/organizations/api';
 *
 * // In component:
 * const organizations = getContext<OrganizationsModuleAPI>('organizations');
 * const activeOrg = organizations.activeOrganization;
 * ```
 *
 * **Migration Path:**
 * - Phase 1 (Current): Direct import still works (backward compatible)
 * - Phase 2 (Future): Use dependency injection via context
 * - Phase 3 (Future): Module registry provides APIs
 */
export interface OrganizationsModuleAPI {
	// ===== Reactive Properties (Getters) =====

	/**
	 * List of all organizations the user belongs to
	 */
	get organizations(): OrganizationSummary[];

	/**
	 * Currently active organization ID (null if no organization selected)
	 */
	get activeOrganizationId(): string | null;

	/**
	 * Currently active organization object (null if no organization selected or loading)
	 * Returns cached organization while loading for instant UI updates
	 */
	get activeOrganization(): OrganizationSummary | null;

	/**
	 * List of pending organization invites for the user
	 */
	get organizationInvites(): OrganizationInvite[];

	/**
	 * Modal state (which modals are open)
	 */
	get modals(): ModalState;

	/**
	 * Loading state for each mutation operation
	 */
	get loading(): {
		createOrganization: boolean;
		joinOrganization: boolean;
	};

	/**
	 * Whether queries are currently loading
	 */
	get isLoading(): boolean;

	/**
	 * Whether organization switching is in progress
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
	 * - `'organization'` - Switching between organizations/workspaces within the same account
	 * - `null` - Not currently switching
	 *
	 * **Note:** `'personal'` is reserved for account switching (switching between different user accounts),
	 * which is handled separately in the layout component, not by this module.
	 * The Organizations module only handles organization switching, so this will always be `'organization'` when switching.
	 */
	get switchingToType(): 'organization' | null;

	// ===== Actions (Methods) =====

	/**
	 * Switch to a different organization
	 * @param organizationId - Organization ID to switch to, or null to default to first organization
	 *
	 * **Note:** Users are required to have at least one organization (enforced server-side).
	 * Passing `null` will default to the first organization in the list, not a personal workspace.
	 */
	setActiveOrganization(organizationId: string | null): void;

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
	 * Create a new organization
	 * @param payload - Organization creation payload
	 * @param payload.name - Organization name
	 */
	createOrganization(payload: { name: string }): Promise<void>;

	/**
	 * Join an organization by invite code
	 * @param payload - Join organization payload
	 * @param payload.code - Invite code
	 */
	joinOrganization(payload: { code: string }): Promise<void>;

	/**
	 * Accept an organization invite
	 * @param inviteId - Invite ID
	 */
	acceptOrganizationInvite(inviteId: string): Promise<void>;

	/**
	 * Decline an organization invite
	 * @param inviteId - Invite ID
	 */
	declineOrganizationInvite(inviteId: string): Promise<void>;
}

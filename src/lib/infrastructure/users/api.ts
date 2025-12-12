/**
 * Users Infrastructure API Contract
 *
 * Public interface for the Users infrastructure module. This enables loose coupling
 * between modules by providing a stable API contract that other modules can depend on,
 * without coupling to internal implementation details.
 *
 * Part of SYOS-609: Create Users Infrastructure
 */

import type { Id } from '$lib/convex';

/**
 * User profile data structure
 */
export type UserProfile = {
	userId: Id<'users'>;
	workosId: string;
	email: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	profileImageUrl?: string;
	emailVerified: boolean;
	createdAt: number;
	updatedAt: number;
	lastLoginAt?: number;
};

/**
 * Linked account information
 */
export type LinkedAccount = {
	userId: Id<'users'>;
	email: string | null;
	name: string | null;
	firstName: string | null;
	lastName: string | null;
	linkType: string | null;
	verifiedAt: number;
};

/**
 * Public API contract for the Users infrastructure
 *
 * This interface defines the public surface that other modules can depend on.
 * Internal implementation details are hidden behind this contract, enabling
 * safe refactoring without breaking dependent modules.
 *
 * **Usage Pattern:**
 * ```typescript
 * import { useUsers } from '$lib/infrastructure/users/composables/useUsers.svelte';
 *
 * // In component:
 * const users = useUsers({
 *   sessionId: () => authSession.user?.userId ? 'current' : undefined
 * });
 * const currentUser = users.currentUser;
 * ```
 */
export interface UsersInfrastructureAPI {
	// ===== Reactive Properties (Getters) =====

	/**
	 * Current authenticated user (null if not authenticated or loading)
	 */
	get currentUser(): UserProfile | null;

	/**
	 * User by ID (null if not found or loading)
	 */
	getUserById(userId: Id<'users'>): UserProfile | null;

	/**
	 * List of linked accounts for the current user
	 */
	get linkedAccounts(): LinkedAccount[];

	/**
	 * Whether queries are currently loading
	 */
	get isLoading(): boolean;

	// ===== Actions (Methods) =====

	/**
	 * Update user profile
	 * @param userId - Target user ID (must be current user or admin)
	 * @param updates - Profile updates
	 * @param updates.firstName - Optional first name
	 * @param updates.lastName - Optional last name
	 * @param updates.profileImageUrl - Optional profile image URL
	 */
	updateProfile(
		userId: Id<'users'>,
		updates: {
			firstName?: string;
			lastName?: string;
			profileImageUrl?: string;
		}
	): Promise<void>;

	/**
	 * Refresh user data (re-fetch from backend)
	 */
	refresh(): Promise<void>;
}

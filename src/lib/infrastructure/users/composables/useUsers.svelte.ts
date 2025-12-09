/**
 * Users Infrastructure Composable
 *
 * Main composable for user management (CRUD operations).
 * Combines queries and mutations for a complete user API.
 *
 * Part of SYOS-609: Create Users Infrastructure
 */

import { browser } from '$app/environment';
import { useConvexClient } from 'convex-svelte';
import { api } from '$lib/convex';
import { toast } from '$lib/utils/toast';
import type { Id } from '$lib/convex';
import type { UsersInfrastructureAPI } from '../api';
import { useUserQueries } from './useUserQueries.svelte';
import { invariant } from '$lib/utils/invariant';

export type UseUsersOptions = {
	getSessionId: () => string | undefined;
};

export type UseUsers = ReturnType<typeof useUsers>;

/**
 * Main composable for user management
 *
 * Provides:
 * - Current user query
 * - User profile updates
 * - Linked accounts
 *
 * @example
 * ```typescript
 * const users = useUsers({
 *   getSessionId: () => authSession.user?.userId ? 'current' : undefined
 * });
 *
 * // Access current user
 * $effect(() => {
 *   console.log('Current user:', users.currentUser);
 * });
 *
 * // Update profile
 * await users.updateProfile(userId, {
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * ```
 */
export function useUsers(options: UseUsersOptions): UsersInfrastructureAPI {
	const { getSessionId } = options;
	const convexClient = browser ? useConvexClient() : null;

	// Initialize queries composable
	const queries = useUserQueries({
		getSessionId
	});

	// Loading state for mutations
	const loadingState = $state({
		updateProfile: false
	});

	/**
	 * Update user profile
	 */
	async function updateProfile(
		userId: Id<'users'>,
		updates: {
			firstName?: string;
			lastName?: string;
			profileImageUrl?: string;
		}
	): Promise<void> {
		invariant(convexClient, 'Convex client not available');
		const sessionId = getSessionId();
		invariant(sessionId, 'Session ID not available');

		loadingState.updateProfile = true;

		try {
			await convexClient.mutation(api.users.updateUserProfile, {
				sessionId,
				targetUserId: userId,
				firstName: updates.firstName,
				lastName: updates.lastName,
				profileImageUrl: updates.profileImageUrl
			});

			toast.success('Profile updated successfully');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to update profile';
			toast.error(message);
			throw error;
		} finally {
			loadingState.updateProfile = false;
		}
	}

	/**
	 * Refresh user data
	 */
	async function refresh(): Promise<void> {
		// Queries are reactive, so they'll automatically refresh
		// This is a no-op for now, but provides a consistent API
		// In the future, we could add explicit refresh logic if needed
	}

	// Return value implements UsersInfrastructureAPI interface
	const usersApi: UsersInfrastructureAPI = {
		get currentUser() {
			return queries.currentUser;
		},
		getUserById(userId: Id<'users'>) {
			return queries.getUserById(userId);
		},
		get linkedAccounts() {
			return queries.linkedAccounts;
		},
		get isLoading() {
			return queries.isLoading;
		},
		updateProfile,
		refresh
	};

	return usersApi;
}

// Re-export API interface for convenience
export type { UsersInfrastructureAPI, UserProfile, LinkedAccount } from '../api';

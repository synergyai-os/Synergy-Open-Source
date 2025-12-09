/**
 * User Queries Composable
 *
 * Handles all Convex query subscriptions for users.
 * Extracted for testability and maintainability.
 *
 * Part of SYOS-609: Create Users Infrastructure
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';
import type { UserProfile, LinkedAccount } from '../api';
import { invariant } from '$lib/utils/invariant';

export interface UseUserQueriesOptions {
	getSessionId: () => string | undefined;
}

export interface UseUserQueriesReturn {
	get currentUser(): UserProfile | null;
	getUserById(userId: Id<'users'>): UserProfile | null;
	get linkedAccounts(): LinkedAccount[];
	get isLoading(): boolean;
	currentUserQuery: ReturnType<typeof useQuery> | null;
}

/**
 * Composable for user queries
 *
 * Provides reactive queries for:
 * - Current authenticated user
 * - User by ID (via separate query)
 * - Linked accounts
 *
 * @example
 * ```typescript
 * const queries = useUserQueries({
 *   getSessionId: () => authSession.user?.userId ? 'current' : undefined
 * });
 *
 * // Access current user reactively
 * $effect(() => {
 *   console.log('Current user:', queries.currentUser);
 * });
 * ```
 */
export function useUserQueries(options: UseUserQueriesOptions): UseUserQueriesReturn {
	const { getSessionId } = options;

	// Current user query
	const currentUserQuery =
		browser && getSessionId()
			? useQuery(api.users.getCurrentUser, () => {
					const sessionId = getSessionId();
					invariant(sessionId, 'sessionId required');
					return { sessionId };
				})
			: null;

	// Linked accounts query
	const linkedAccountsQuery =
		browser && getSessionId()
			? useQuery(api.users.listLinkedAccounts, () => {
					const sessionId = getSessionId();
					invariant(sessionId, 'sessionId required');
					return { sessionId };
				})
			: null;

	// Loading state
	const isLoading = $derived(currentUserQuery ? currentUserQuery.data === undefined : false);

	// Derived: Current user
	const currentUser = $derived((): UserProfile | null => {
		if (currentUserQuery?.data !== undefined) {
			const user = currentUserQuery.data as UserProfile | null;
			return user;
		}
		return null;
	});

	// Derived: Linked accounts
	const linkedAccounts = $derived((): LinkedAccount[] => {
		if (linkedAccountsQuery?.data !== undefined) {
			return linkedAccountsQuery.data as LinkedAccount[];
		}
		return [];
	});

	/**
	 * Get user by ID
	 * Note: This is a simple implementation that uses the current user if it matches.
	 * For a full implementation, we'd need to add a separate query or use a cache.
	 */
	function getUserById(userId: Id<'users'>): UserProfile | null {
		const current = currentUser();
		if (current && current.userId === userId) {
			return current;
		}
		// TODO: Add separate query for getUserById if needed
		return null;
	}

	return {
		get currentUser() {
			return currentUser();
		},
		getUserById,
		get linkedAccounts() {
			return linkedAccounts();
		},
		get isLoading() {
			return isLoading;
		},
		currentUserQuery
	};
}

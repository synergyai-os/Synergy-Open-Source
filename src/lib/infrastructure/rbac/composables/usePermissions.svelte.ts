/**
 * Composable for checking user permissions
 *
 * Provides reactive permission checking based on RBAC system.
 * Follows Svelte 5 composable patterns:
 * - Single $state object for reactivity
 * - Getters for reactive returns
 * - Function parameters for reactive inputs
 *
 * @see dev-docs/2-areas/patterns/svelte-reactivity.md - Pattern #L10, #L80
 * @see dev-docs/2-areas/rbac/rbac-architecture.md - Permission system architecture
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';

export interface UsePermissionsParams {
	sessionId: () => string | null;
	userId?: () => Id<'users'> | null;
	workspaceId?: () => Id<'workspaces'> | null;
	circleId?: () => Id<'circles'> | null;
	initialPermissions?: Array<{
		permissionSlug: string;
		scope: string;
		roleSlug: string;
		roleName: string;
	}>; // Server-side preloaded permissions
}

export interface UsePermissionsReturn {
	get permissions(): string[];
	get isLoading(): boolean;
	get error(): unknown;
	can: (action: string) => boolean;
	cannot: (action: string) => boolean;
}

/**
 * Hook to check user permissions reactively
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { usePermissions } from '$lib/infrastructure/rbac/composables/usePermissions.svelte';
 *
 *   const permissions = usePermissions({
 *     sessionId: () => $page.data.sessionId,
 *     workspaceId: () => $activeWorkspaceId
 *   });
 * </script>
 *
 * {#if permissions.can('teams.create')}
 *   <button>Create Team</button>
 * {/if}
 * ```
 */
export function usePermissions(params: UsePermissionsParams): UsePermissionsReturn {
	// Query user permissions from Convex
	const permissionsQuery =
		browser && params.sessionId()
			? useQuery(api.rbac.permissions.getUserPermissionsQuery, () => {
					const sessionId = params.sessionId();
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check

					const args: {
						sessionId: string;
						workspaceId?: Id<'workspaces'>;
						circleId?: Id<'circles'>;
					} = { sessionId };

					// Add context filters
					const orgId = params.workspaceId?.();
					const circleId = params.circleId?.();

					if (orgId !== undefined && orgId !== null) {
						args.workspaceId = orgId;
					}
					if (circleId !== undefined && circleId !== null) {
						args.circleId = circleId;
					}

					return args;
				})
			: null;

	// Use server-side initial data immediately, then use query data when available (more up-to-date)
	const permissionsData = $derived(
		permissionsQuery?.data !== undefined
			? (permissionsQuery.data as Array<{
					permissionSlug?: string;
					slug?: string;
					scope?: string;
					roleSlug?: string;
					roleName?: string;
				}>)
			: (params.initialPermissions ?? [])
	);
	const permissionSlugs = $derived(
		permissionsData.map(
			(p: { permissionSlug?: string; slug?: string }) => p.permissionSlug ?? p.slug ?? ''
		)
	);

	const isLoading = $derived(permissionsQuery?.isLoading ?? false);
	const error = $derived(permissionsQuery?.error ?? null);

	/**
	 * Check if user has a specific permission
	 *
	 * @param action - Permission slug (e.g., "teams.create")
	 * @returns true if user has the permission
	 */
	function can(action: string): boolean {
		return permissionSlugs.includes(action);
	}

	/**
	 * Check if user does NOT have a specific permission
	 *
	 * @param action - Permission slug (e.g., "teams.create")
	 * @returns true if user lacks the permission
	 */
	function cannot(action: string): boolean {
		return !can(action);
	}

	// Return with getters for reactivity
	return {
		get permissions() {
			return permissionSlugs;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		can,
		cannot
	};
}

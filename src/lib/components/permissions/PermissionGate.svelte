<script lang="ts">
	/**
	 * Permission Gate Component
	 * 
	 * Conditionally renders children based on user permissions.
	 * Uses design tokens for loading/error states.
	 * 
	 * @see dev-docs/rbac-architecture.md - Permission system architecture
	 * @see dev-docs/2-areas/design-tokens.md - Design token reference
	 * 
	 * @example
	 * ```svelte
	 * <PermissionGate 
	 *   can="teams.create" 
	 *   {permissions}
	 *   fallback="You don't have permission to create teams"
	 * >
	 *   <button>Create Team</button>
	 * </PermissionGate>
	 * ```
	 */

	import type { UsePermissionsReturn } from '$lib/composables/usePermissions.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Permission to check (e.g., "teams.create") */
		can: string;
		/** Permissions object from usePermissions composable */
		permissions: UsePermissionsReturn;
		/** Content to render when permission is granted */
		children: Snippet;
		/** Optional fallback message when permission is denied */
		fallback?: string;
		/** Optional custom fallback content snippet */
		fallbackSnippet?: Snippet;
		/** Whether to show loading state (default: true) */
		showLoading?: boolean;
	}

	let { can, permissions, children, fallback, fallbackSnippet, showLoading = true }: Props =
		$props();

	const hasPermission = $derived(permissions.can(can));
</script>

{#if permissions.isLoading && showLoading}
	<!-- Loading state with design tokens -->
	<div class="px-nav-item py-nav-item text-secondary text-sm">Loading permissions...</div>
{:else if permissions.error}
	<!-- Error state with design tokens -->
	<div class="px-nav-item py-nav-item text-sm text-error">
		Error loading permissions
	</div>
{:else if hasPermission}
	<!-- Render children if user has permission -->
	{@render children()}
{:else if fallbackSnippet}
	<!-- Render custom fallback snippet -->
	{@render fallbackSnippet()}
{:else if fallback}
	<!-- Render fallback message with design tokens -->
	<div class="px-nav-item py-nav-item text-secondary text-sm">
		{fallback}
	</div>
{/if}


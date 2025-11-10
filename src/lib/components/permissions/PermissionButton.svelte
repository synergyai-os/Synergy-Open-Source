<script lang="ts">
	/**
	 * Permission Button Component
	 * 
	 * Button that automatically disables based on user permissions.
	 * Uses design tokens for consistent styling.
	 * 
	 * @see dev-docs/rbac-architecture.md - Permission system architecture
	 * @see dev-docs/2-areas/design-tokens.md - Design token reference (Button spacing tokens)
	 * 
	 * @example
	 * ```svelte
	 * <PermissionButton 
	 *   requires="teams.create" 
	 *   {permissions}
	 *   variant="primary"
	 *   onclick={handleCreate}
	 * >
	 *   Create Team
	 * </PermissionButton>
	 * ```
	 */

	import type { UsePermissionsReturn } from '$lib/composables/usePermissions.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Permission required to enable button (e.g., "teams.create") */
		requires: string;
		/** Permissions object from usePermissions composable */
		permissions: UsePermissionsReturn;
		/** Button variant */
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		/** Click handler */
		onclick?: (event: MouseEvent) => void;
		/** Button type */
		type?: 'button' | 'submit' | 'reset';
		/** Additional CSS classes */
		class?: string;
		/** Disabled regardless of permissions */
		disabled?: boolean;
		/** Custom title when disabled due to permissions */
		permissionDeniedTitle?: string;
		/** Button content */
		children: Snippet;
	}

	let {
		requires,
		permissions,
		variant = 'secondary',
		onclick,
		type = 'button',
		class: className = '',
		disabled = false,
		permissionDeniedTitle = 'You do not have permission for this action',
		children
	}: Props = $props();

	const hasPermission = $derived(permissions.can(requires));
	const isDisabled = $derived(disabled || !hasPermission);
	const title = $derived(
		!hasPermission && !disabled ? permissionDeniedTitle : undefined
	);

	// Button styles using design tokens
	const baseClasses = 'px-button-x py-button-y rounded-button text-sm font-medium transition-colors';
	
	const variantClasses = $derived({
		primary: 'bg-accent-primary text-white hover:bg-accent-primary/90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed',
		secondary: 'bg-surface border border-base text-primary hover:bg-surface-hover disabled:bg-surface disabled:text-secondary disabled:cursor-not-allowed',
		ghost: 'text-primary hover:bg-surface-hover disabled:text-secondary disabled:cursor-not-allowed',
		danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'
	}[variant]);
</script>

<button
	{type}
	disabled={isDisabled}
	{title}
	class="{baseClasses} {variantClasses} {className}"
	{onclick}
>
	{@render children()}
</button>


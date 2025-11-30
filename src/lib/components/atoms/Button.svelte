<script lang="ts">
	import { Button as BitsButton } from 'bits-ui';
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { buttonRecipe, type ButtonVariantProps } from '$lib/design-system/recipes';

	type Props = WithElementRef<
		ButtonVariantProps & {
			iconOnly?: boolean;
			ariaLabel?: string;
			href?: string;
			onclick?: (e?: MouseEvent) => void;
			children: Snippet;
			class?: string;
			type?: 'button' | 'submit' | 'reset';
			disabled?: boolean;
			title?: string; // Native HTML title attribute for tooltips
		},
		HTMLButtonElement
	>;

	let {
		variant = 'primary',
		size = 'md',
		iconOnly = false,
		ariaLabel = undefined,
		href = undefined,
		onclick = undefined,
		children,
		class: className = '',
		type = 'button',
		disabled = false,
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// Dev warning: ariaLabel required when iconOnly=true
	if (iconOnly && !ariaLabel && import.meta.env.DEV) {
		console.warn('Button: ariaLabel required when iconOnly=true for accessibility');
	}

	// Use recipe system for variant and size
	// Note: When iconOnly=true with ghost/solid variants, recipe applies simplified styles
	// (no typography, shadows, or lift effects - optimized for icon-only buttons)
	const recipeClasses = $derived(buttonRecipe({ variant, size }));

	// Handle iconOnly: override padding when iconOnly is true
	// Icon-only buttons use square padding instead of x/y padding
	const iconOnlySizeClasses = $derived(
		iconOnly
			? {
					sm: 'px-button-sm py-button-sm',
					md: 'button-icon',
					lg: 'button-icon'
				}[size]
			: undefined
	);

	// Combine recipe classes with iconOnly size override and custom className
	// Array syntax handles empty strings/undefined automatically
	const buttonClasses = $derived([recipeClasses, iconOnlySizeClasses, className]);
</script>

{#if href}
	<BitsButton.Root
		{href}
		class={buttonClasses}
		{disabled}
		aria-label={iconOnly ? ariaLabel : undefined}
		{...rest}
		bind:ref
	>
		{@render children()}
	</BitsButton.Root>
{:else}
	<BitsButton.Root
		{onclick}
		class={buttonClasses}
		{type}
		{disabled}
		aria-label={iconOnly ? ariaLabel : undefined}
		{...rest}
		bind:ref
	>
		{@render children()}
	</BitsButton.Root>
{/if}

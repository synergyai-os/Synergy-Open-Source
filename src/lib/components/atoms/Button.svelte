<script lang="ts">
	import { Button as BitsButton } from 'bits-ui';
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { ButtonVariant, ButtonSize } from '../types';
	import { buttonRecipe } from '$lib/design-system/recipes';

	type Props = WithElementRef<
		{
			variant?: ButtonVariant;
			size?: ButtonSize;
			iconOnly?: boolean;
			ariaLabel?: string;
			href?: string;
			onclick?: () => void;
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
	// Note: When iconOnly=true, recipe still applies default size='md' padding,
	// but iconOnly padding classes will override due to CSS specificity
	const recipeClasses = $derived(buttonRecipe({ variant, size }));

	// Handle iconOnly: override padding when iconOnly is true
	// Icon-only buttons use square padding instead of x/y padding
	const iconOnlySizeClasses = $derived(
		iconOnly
			? {
					sm: 'p-nav-item',
					md: 'p-button-icon',
					lg: 'p-button-icon'
				}[size]
			: ''
	);

	// Combine recipe classes with iconOnly size override and custom className
	const buttonClasses = $derived(
		`${recipeClasses} ${iconOnlySizeClasses} ${className}`.trim()
	);
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

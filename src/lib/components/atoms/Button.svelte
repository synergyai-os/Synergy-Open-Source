<script lang="ts">
	import { Button as BitsButton } from 'bits-ui';
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { ButtonVariant, ButtonSize } from '../types';

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

	// Base classes using design tokens
	const baseClasses =
		'font-body inline-flex items-center justify-center rounded-button transition-colors-token';

	// Variant-specific classes using design tokens
	const variantClasses = {
		primary: 'bg-accent-primary text-primary hover:bg-accent-hover disabled:opacity-50',
		secondary:
			'bg-elevated border border-base text-primary hover:border-accent-primary disabled:opacity-50',
		outline:
			'border border-base text-primary hover:bg-hover-solid disabled:opacity-50 disabled:hover:bg-elevated'
	};

	// Size-specific classes using design tokens (conditional based on iconOnly)
	const sizeClasses = iconOnly
		? {
				sm: 'p-nav-item',
				md: 'p-button-icon',
				lg: 'p-button-icon'
			}
		: {
				sm: 'px-nav-item py-nav-item gap-icon text-small',
				md: 'px-button-x py-button-y gap-icon text-button',
				lg: 'px-button-x py-button-y gap-icon text-body'
			};

	const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
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

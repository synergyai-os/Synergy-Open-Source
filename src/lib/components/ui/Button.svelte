<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'primary',
		href = undefined,
		onclick = undefined,
		children,
		class: className = '',
		...rest
	}: {
		variant?: 'primary' | 'secondary';
		href?: string;
		onclick?: () => void;
		children: Snippet;
		class?: string;
	} & Record<string, unknown> = $props();

	// Base classes using design tokens
	const baseClasses =
		'inline-flex items-center justify-center gap-icon px-button-x py-button-y rounded-button text-sm font-semibold transition-all duration-150';

	// Variant-specific classes
	const variantClasses = {
		primary: 'bg-accent-primary text-white hover:bg-accent-hover',
		secondary: 'bg-elevated border border-base text-primary hover:border-accent-primary'
	};

	const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
</script>

{#if href}
	<a {href} class={buttonClasses} {...rest}>
		{@render children()}
	</a>
{:else}
	<button {onclick} class={buttonClasses} type="button" {...rest}>
		{@render children()}
	</button>
{/if}

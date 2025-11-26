<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { TextVariant, TextSize } from '../types';
	import { textRecipe } from '$lib/design-system/recipes';

	type Props = WithElementRef<
		{
			variant?: TextVariant;
			size?: TextSize;
			color?: 'default' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'success' | 'info';
			as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
			children: Snippet;
			class?: string;
		},
		HTMLParagraphElement | HTMLSpanElement | HTMLDivElement | HTMLHeadingElement
	>;

	let {
		variant = 'body',
		size = 'base',
		color = 'default',
		as = 'p',
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// Apply design tokens using recipe system
	const textClasses = $derived(
		textRecipe({ variant, size, color }) + (className ? ` ${className}` : '')
	);
</script>

{#if as === 'p'}
	<p bind:this={ref} class={textClasses} {...rest}>{@render children()}</p>
{:else if as === 'span'}
	<span bind:this={ref} class={textClasses} {...rest}>{@render children()}</span>
{:else if as === 'h1'}
	<h1 bind:this={ref} class={textClasses} {...rest}>{@render children()}</h1>
{:else if as === 'h2'}
	<h2 bind:this={ref} class={textClasses} {...rest}>{@render children()}</h2>
{:else if as === 'h3'}
	<h3 bind:this={ref} class={textClasses} {...rest}>{@render children()}</h3>
{:else if as === 'h4'}
	<h4 bind:this={ref} class={textClasses} {...rest}>{@render children()}</h4>
{:else if as === 'h5'}
	<h5 bind:this={ref} class={textClasses} {...rest}>{@render children()}</h5>
{:else if as === 'h6'}
	<h6 bind:this={ref} class={textClasses} {...rest}>{@render children()}</h6>
{:else}
	<div bind:this={ref} class={textClasses} {...rest}>{@render children()}</div>
{/if}

<!--
	Text Component - Typography with Design Tokens
	
	Uses Recipe System (CVA) for type-safe variant management.
	See: src/lib/design-system/recipes/text.recipe.ts
	
	Usage:
	<Text variant="body" size="base">Regular body text</Text>
	<Text variant="label" size="sm">Small label text</Text>
	<Text variant="caption" size="sm" as="span">Caption text</Text>
	
	Design Tokens (via Recipe):
	- Variant body: text-primary (main text color)
	- Variant label: text-[0.625rem] text-secondary (10px label styling)
	- Variant caption: text-[0.625rem] text-tertiary (10px muted text)
	- Size sm: text-sm (14px)
	- Size base: text-base (16px)
	- Size lg: text-lg (18px)
	- Colors adapt to light/dark mode automatically
-->

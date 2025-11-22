<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { TextVariant, TextSize } from '../types';

	type Props = WithElementRef<
		{
			variant?: TextVariant;
			size?: TextSize;
			as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
			children: Snippet;
			class?: string;
		},
		HTMLParagraphElement | HTMLSpanElement | HTMLDivElement | HTMLHeadingElement
	>;

	let {
		variant = 'body',
		size = 'base',
		as = 'p',
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// Apply design tokens based on variant and size
	const variantClasses: Record<TextVariant, string> = {
		body: 'text-primary',
		label: 'text-label text-secondary',
		caption: 'text-label text-tertiary'
	};

	const sizeClasses: Record<TextSize, string> = {
		sm: 'text-small',
		base: 'text-body',
		lg: 'text-h4'
	};

	const textClasses = `${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
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
	
	Usage:
	<Text variant="body" size="base">Regular body text</Text>
	<Text variant="label" size="sm">Small label text</Text>
	<Text variant="caption" size="sm" as="span">Caption text</Text>
	
	Design Tokens:
	- Variant body: text-primary (main text color)
	- Variant label: text-label + text-secondary (label styling)
	- Variant caption: text-label + text-tertiary (muted text)
	- Size sm: text-small (14px)
	- Size base: text-body (16px)
	- Size lg: text-h4 (18px)
	- Colors adapt to light/dark mode automatically
-->

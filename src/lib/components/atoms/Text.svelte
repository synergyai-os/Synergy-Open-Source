<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { TextVariant, TextSize } from '../types';
	import { textRecipe } from '$lib/design-system/recipes';

	type Props = WithElementRef<
		{
			variant?: TextVariant;
			size?: TextSize;
			color?:
				| 'default'
				| 'inherit'
				| 'secondary'
				| 'tertiary'
				| 'error'
				| 'warning'
				| 'success'
				| 'info';
			weight?: 'normal' | 'medium' | 'semibold' | 'bold';
			lineHeight?: 'normal' | 'compact';
			as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
			children: Snippet;
		},
		HTMLParagraphElement | HTMLSpanElement | HTMLDivElement | HTMLHeadingElement
	>;

	let {
		variant = 'body',
		size = 'base',
		color = 'default',
		weight = 'normal',
		lineHeight = 'normal',
		as = 'p',
		children,
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// Apply design tokens using recipe system
	const textClasses = $derived(textRecipe({ variant, size, color, weight, lineHeight }));
</script>

<svelte:element this={as} bind:this={ref} class={textClasses} {...rest}>
	{@render children()}
</svelte:element>

<!--
	Text Component - Typography with Design Tokens
	
	Uses Recipe System (CVA) for type-safe variant management.
	See: src/lib/design-system/recipes/text.recipe.ts
	
	Usage:
	<Text variant="body" size="base" color="default">Regular body text</Text>
	<Text variant="label" size="sm" color="secondary">Small label text</Text>
	<Text variant="caption" size="sm" color="tertiary" as="span">Caption text</Text>
	<Text variant="body" size="sm" color="inherit">Inherit parent color</Text>
	
	Design Tokens (via Recipe):
	- Variant: Controls typography only (font size for label/caption)
	- Size: Controls font size (sm: 14px, base: 16px, lg: 18px)
	- Color: Always separate from variant (default: text-primary, inherit: inherit from parent)
	- Clean separation: Variants = typography, Color = color
-->

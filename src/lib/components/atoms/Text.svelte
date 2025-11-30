<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { textRecipe, type TextVariantProps } from '$lib/design-system/recipes';

	type Props = WithElementRef<
		TextVariantProps & {
			as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
			children: Snippet;
		},
		HTMLParagraphElement | HTMLSpanElement | HTMLDivElement | HTMLHeadingElement
	>;

	let {
		variant = 'body',
		size = 'md',
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
	<Text variant="body" size="md" color="default">Regular body text</Text>
	<Text variant="label" size="sm" color="secondary">Small label text</Text>
	<Text variant="caption" size="sm" color="tertiary" as="span">Caption text</Text>
	<Text variant="body" size="sm" color="inherit">Inherit parent color</Text>
	
	Design Tokens (via Recipe):
	- Variant: Controls typography only (font size for label/caption)
	- Size: Controls font size (sm: 12px, md: 14px, lg: 18px)
	- Color: Always separate from variant (default: text-primary, inherit: inherit from parent)
	- Clean separation: Variants = typography, Color = color
-->

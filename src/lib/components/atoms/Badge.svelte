<script lang="ts">
	import { badgeRecipe, type BadgeVariantProps } from '$lib/design-system/recipes';

	/**
	 * Badge Component
	 *
	 * Displays a badge with semantic variants using design tokens.
	 * Used for status indicators, labels, and tags.
	 *
	 * Variants: default, primary, success, warning, error
	 * Sizes: sm, md, lg
	 */

	type Props = BadgeVariantProps & {
		children: import('svelte').Snippet;
		class?: string;
	};

	let { variant = 'default', size = 'md', children, class: customClass = '' }: Props = $props();

	const classes = $derived(badgeRecipe({ variant, size }));
</script>

<span class="{classes} {customClass}">
	{@render children()}
</span>

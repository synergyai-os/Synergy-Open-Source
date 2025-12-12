<script lang="ts">
	/**
	 * Chip Component
	 *
	 * Material UI-style removable filter pills.
	 * Used for interactive labels/tags with optional delete functionality.
	 * Separate from Badge (static status indicators).
	 *
	 * @see SYOS-393 - Create Chip Component
	 *
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/chip.recipe.ts
	 */

	import type { Snippet } from 'svelte';
	import {
		chipRecipe,
		chipCloseButtonRecipe,
		type ChipVariantProps
	} from '$lib/design-system/recipes';

	type Props = ChipVariantProps & {
		label?: string;
		onDelete?: () => void;
		children?: Snippet;
		class?: string;
	};

	let {
		variant = 'default',
		label = '',
		onDelete = undefined,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	// Apply recipe for chip styling
	const chipClasses = $derived([chipRecipe({ variant }), className]);

	// Apply recipe for close button styling
	const removeClasses = $derived(chipCloseButtonRecipe());
</script>

<span class={chipClasses} {...rest}>
	{#if children}
		{@render children()}
	{:else}
		<span>{label}</span>
	{/if}

	{#if onDelete}
		<button
			type="button"
			class={removeClasses}
			onclick={onDelete}
			aria-label={`Remove ${label || 'chip'}`}
		>
			<!-- Close icon - smaller for compact design -->
			<svg class="icon-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	{/if}
</span>

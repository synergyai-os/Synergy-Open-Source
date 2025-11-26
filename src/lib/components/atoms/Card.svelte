<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { CardVariant } from '../types';
	import { cardRecipe, type CardVariantProps } from '$lib/design-system/recipes';

	type Props = WithElementRef<
		{
			variant?: CardVariant;
			padding?: CardVariantProps['padding'];
			clickable?: boolean;
			onclick?: ((e: MouseEvent) => void) | (() => void);
			children: Snippet;
			class?: string;
			[key: `data-${string}`]: string | undefined;
		},
		HTMLDivElement
	>;

	let {
		variant = 'default',
		padding = 'md',
		clickable = false,
		onclick = undefined,
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// Use recipe for default/elevated/outlined variants
	// Handle 'noPadding' separately (legacy support)
	const recipeClasses = $derived(
		variant === 'noPadding'
			? 'rounded-card bg-elevated'
			: cardRecipe({ variant: variant as 'default' | 'elevated' | 'outlined', padding })
	);

	// Clickable styles: cursor, hover, transitions
	// Focus ring handled via CSS (focus-visible) for keyboard navigation only
	const clickableClasses = clickable ? 'cursor-pointer transition-all hover:shadow-card-hover' : '';

	// Use $derived to ensure cardClasses updates when className prop changes
	const cardClasses = $derived(
		`${recipeClasses} ${clickableClasses} ${clickable ? 'clickable-card' : ''} ${className}`
	);

	// Handle keyboard events for clickable cards
	function handleKeyDown(e: KeyboardEvent) {
		// Don't capture J/K keys - let page-level handlers work
		if (e.key === 'j' || e.key === 'J' || e.key === 'k' || e.key === 'K') {
			return; // Let event bubble to window handler
		}

		if (clickable && onclick && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			// Call onclick - it may accept MouseEvent or no args, but keyboard events don't need mouse event
			if (onclick.length > 0) {
				// onclick expects MouseEvent, create synthetic event
				const syntheticEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
				onclick(syntheticEvent as unknown as MouseEvent);
			} else {
				// onclick expects no args
				(onclick as () => void)();
			}
		}
	}
</script>

{#if clickable}
	<div
		bind:this={ref}
		class={cardClasses}
		role="button"
		tabindex="0"
		{onclick}
		onkeydown={handleKeyDown}
		{...rest}
	>
		{@render children()}
	</div>
{:else}
	<div bind:this={ref} class={cardClasses} {...rest}>
		{@render children()}
	</div>
{/if}

{#if clickable}
	<style>
		:global(.clickable-card:focus-visible) {
			outline: 2px solid var(--color-accent-primary);
			outline-offset: 2px;
		}

		:global(.clickable-card:focus:not(:focus-visible)) {
			outline: none;
		}
	</style>
{/if}

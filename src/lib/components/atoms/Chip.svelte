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
	 * DESIGN SYSTEM EXCEPTION: Chip spacing and border radius (SYOS-585)
	 *
	 * Chip uses non-standard values that don't fit the base scale:
	 * - spacing.chip.y = 0.125rem (2px) - optimal for compact design
	 * - spacing.chip.close.padding = 0.125rem (2px) - compact close button
	 * - borderRadius.chip = 9999px (full) - pill shape
	 *
	 * These values are hardcoded because they don't reference base tokens.
	 * See: dev-docs/2-areas/design/token-file-split-exception-mapping.md
	 */

	import type { Snippet } from 'svelte';

	type ChipVariant = 'default' | 'primary';

	type Props = {
		label?: string;
		variant?: ChipVariant;
		onDelete?: () => void;
		children?: Snippet;
		class?: string;
	};

	let {
		label = '',
		variant = 'default',
		onDelete = undefined,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	// Base classes using design tokens - compact Linear-style design
	// Use chip gap token for proper spacing between label and close button
	const baseClasses =
		'inline-flex items-center gap-chip rounded-full text-chip transition-colors-token';

	// Variant-specific classes using design tokens - subtle, less prominent
	const variantClasses: Record<ChipVariant, string> = {
		default: 'bg-tag/50 text-tag border border-base/50',
		primary: 'bg-accent-primary/80 text-primary'
	};

	const chipClasses = `${baseClasses} ${variantClasses[variant]} px-chip py-[0.125rem] ${className}`;

	// Remove button - compact but still accessible
	// Use chip close padding token, ensure proper alignment with flex centering
	const removeClasses =
		'p-[0.125rem] rounded-full transition-colors-token hover:bg-hover-solid focus:outline-none focus:ring-1 focus:ring-accent-primary flex items-center justify-center -mr-chip-close';
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

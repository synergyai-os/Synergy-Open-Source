<script lang="ts">
	/**
	 * Toggle Switch Component (Linear-style)
	 *
	 * Molecule component for on/off switches
	 * Uses design tokens and recipe system for styling
	 *
	 * Sizing tokens (compact, Linear-inspired):
	 * - --sizing-toggle-height: 20px (was 24px)
	 * - --sizing-toggle-width: 36px (was 44px)
	 * - --sizing-toggle-thumb: 12px (was 16px)
	 */

	import { Text } from '$lib/components/atoms';
	import { toggleSwitchRecipe, toggleSwitchThumbRecipe } from '$lib/design-system/recipes';

	type Props = {
		checked: boolean;
		onChange?: (checked: boolean) => void;
		label?: string;
		disabled?: boolean;
	};

	let { checked = false, onChange, label, disabled = false }: Props = $props();

	// Compute classes using recipe
	const switchClasses = $derived([toggleSwitchRecipe({ checked, disabled })]);

	// Thumb uses sizing token (12px) - inline style for dimensions
	const thumbClasses = $derived([toggleSwitchThumbRecipe({ checked })]);

	// Switch dimensions from design tokens
	// Background color uses CSS variable (utilities don't exist for component-specific colors)
	const switchStyle = $derived(
		`background-color: var(--color-component-toggle-${checked ? 'on' : 'off'}); 
		 height: var(--sizing-toggle-height); 
		 width: var(--sizing-toggle-width);
		 ${disabled ? 'opacity: var(--opacity-50);' : ''}`
	);

	// Thumb dimensions and transform
	// Unchecked: 2px from left edge
	// Checked: width - thumb - 2px = 36px - 12px - 2px = 22px
	const thumbStyle = $derived(
		`width: var(--sizing-toggle-thumb); 
		 height: var(--sizing-toggle-thumb);
		 transform: translateX(${checked ? 'calc(var(--sizing-toggle-width) - var(--sizing-toggle-thumb) - 2px)' : '2px'});`
	);
</script>

<label class="inline-flex cursor-pointer items-center gap-fieldGroup">
	{#if label}
		<Text variant="body" size="sm" color="secondary" as="span" class="font-medium">
			{label}
		</Text>
	{/if}
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-label={label || 'Toggle'}
		{disabled}
		class={switchClasses}
		style={switchStyle}
		onclick={() => !disabled && onChange?.(!checked)}
	>
		<span class={thumbClasses} style={thumbStyle}></span>
	</button>
</label>

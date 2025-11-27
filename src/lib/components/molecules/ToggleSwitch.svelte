<script lang="ts">
	/**
	 * Toggle Switch Component (Linear-style)
	 *
	 * Molecule component for on/off switches
	 * Uses design tokens and recipe system for styling
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

	const thumbClasses = $derived([toggleSwitchThumbRecipe({ checked }), 'size-icon-sm']);

	// Inline styles for background colors (utilities don't exist)
	// WORKAROUND: bg-component-toggle-off/on utilities missing - see missing-styles.md
	const switchStyle = $derived(
		`background-color: var(--color-component-toggle-${checked ? 'on' : 'off'}); height: 1.5rem; width: 2.75rem;${disabled ? ' opacity: var(--opacity-50);' : ''}`
	);

	// Thumb transform: translate-x-6 when checked, translate-x-1 when unchecked
	// Using spacing tokens: spacing-6 = 1.5rem (24px), spacing-1 = 0.25rem (4px)
	const thumbTransform = $derived(
		checked
			? 'transform: translateX(1.5rem);' // translate-x-6 = 24px = spacing-6
			: 'transform: translateX(0.25rem);' // translate-x-1 = 4px = spacing-1
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
		<span class={thumbClasses} style={thumbTransform}></span>
	</button>
</label>

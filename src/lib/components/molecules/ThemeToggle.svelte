<script lang="ts">
	/**
	 * ThemeToggle Component (Molecule)
	 *
	 * Reusable component for switching between light/dark modes.
	 * Composes Icon and Text atoms following atomic design principles.
	 *
	 * Usage:
	 *   <ThemeToggle /> - Icon only (for navbar)
	 *   <ThemeToggle showLabel={true} /> - With label (for settings)
	 */

	import { Icon } from '$lib/components/atoms';
	import { Text } from '$lib/components/atoms';
	import { themeToggleRecipe } from '$lib/design-system/recipes';
	import { toggleTheme, isDark } from '$lib/stores/theme.svelte';

	interface Props {
		showLabel?: boolean;
		class?: string;
	}

	let { showLabel = false, class: className = '' }: Props = $props();

	// Determine variant based on showLabel prop
	const variant = $derived(showLabel ? 'withLabel' : 'iconOnly');

	// Apply recipe for styling
	const classes = $derived([themeToggleRecipe({ variant }), className]);

	// Get current icon type (opposite of current theme - shows what clicking will switch TO)
	const iconType = $derived(isDark() ? 'sun' : 'moon');

	// Get label text (shows what clicking will switch TO)
	const labelText = $derived(isDark() ? 'Light mode' : 'Dark mode');
</script>

<button
	type="button"
	class={classes}
	aria-label="Toggle theme"
	title={isDark() ? 'Switch to light mode' : 'Switch to dark mode'}
	onclick={toggleTheme}
>
	<Icon type={iconType} size="md" />

	{#if showLabel}
		<Text variant="body" size="sm" color="default" as="span">
			{labelText}
		</Text>
	{/if}
</button>

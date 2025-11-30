<script lang="ts">
	import { browser } from '$app/environment';
	import {
		keyboardShortcutRecipe,
		keyboardShortcutKeyRecipe,
		keyboardShortcutSeparatorRecipe,
		type KeyboardShortcutKeyVariantProps
	} from '$lib/design-system/recipes';

	/**
	 * Reusable Keyboard Shortcut Badge Component
	 *
	 * Displays keyboard shortcuts in a consistent, branded style.
	 * Automatically detects platform (macOS = CMD, Windows/Linux = Ctrl).
	 * Uses Recipe System (CVA) for type-safe variant management.
	 * See: src/lib/design-system/recipes/keyboardShortcut.recipe.ts
	 *
	 * Examples:
	 * - <KeyboardShortcut keys="C" />
	 * - <KeyboardShortcut keys={['Cmd', 'K']} /> (auto-detects platform)
	 * - <KeyboardShortcut keys={['Shift', 'Enter']} />
	 * - <KeyboardShortcut keys={['Meta', '1']} /> (for CMD+1, auto-detects platform)
	 */

	type Props = KeyboardShortcutKeyVariantProps & {
		keys: string | string[]; // Single key 'C' or multiple ['Cmd', 'K'] or ['Meta', '1']
	};

	let { keys, size = 'sm' }: Props = $props();

	// Detect platform for modifier key display
	const isMac = browser && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	const modKeyDisplay = isMac ? '⌘' : 'Ctrl';

	// Normalize keys array and replace platform-specific modifiers
	const keysArray = Array.isArray(keys) ? keys : [keys];
	const normalizedKeys = keysArray.map((key) => {
		// Replace common modifier key names with platform-specific symbols
		if (key.toLowerCase() === 'cmd' || key.toLowerCase() === 'meta') {
			return modKeyDisplay;
		}
		if (key.toLowerCase() === 'ctrl') {
			return 'Ctrl';
		}
		if (key.toLowerCase() === 'shift') {
			return '⇧';
		}
		if (key.toLowerCase() === 'alt' || key.toLowerCase() === 'option') {
			return '⌥';
		}
		return key;
	});

	// Apply recipes for styling
	const containerClasses = $derived(keyboardShortcutRecipe());
	const keyClasses = $derived(keyboardShortcutKeyRecipe({ size }));
	const separatorClasses = $derived(keyboardShortcutSeparatorRecipe());
</script>

<div class={containerClasses}>
	{#each normalizedKeys as key, i (`${i}-${key}`)}
		<kbd class={keyClasses}>
			{key}
		</kbd>
		{#if i < normalizedKeys.length - 1}
			<span class={separatorClasses}>+</span>
		{/if}
	{/each}
</div>

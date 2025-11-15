<script lang="ts">
	import { browser } from '$app/environment';

	/**
	 * Reusable Keyboard Shortcut Badge Component
	 *
	 * Displays keyboard shortcuts in a consistent, branded style.
	 * Automatically detects platform (macOS = CMD, Windows/Linux = Ctrl).
	 * When shortcut changes (e.g., 'N' → 'A + B'), updates everywhere automatically.
	 *
	 * Examples:
	 * - <KeyboardShortcut keys="C" />
	 * - <KeyboardShortcut keys={['Cmd', 'K']} /> (auto-detects platform)
	 * - <KeyboardShortcut keys={['Shift', 'Enter']} />
	 * - <KeyboardShortcut keys={['Meta', '1']} /> (for CMD+1, auto-detects platform)
	 */

	type Props = {
		keys: string | string[]; // Single key 'C' or multiple ['Cmd', 'K'] or ['Meta', '1']
		size?: 'sm' | 'md';
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

	const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';
</script>

<div class="inline-flex items-center gap-1">
	{#each normalizedKeys as key, i (`${i}-${key}`)}
		<kbd class="bg-base/50 rounded font-mono text-tertiary {sizeClasses}">
			{key}
		</kbd>
		{#if i < normalizedKeys.length - 1}
			<span class="text-xs text-tertiary">+</span>
		{/if}
	{/each}
</div>

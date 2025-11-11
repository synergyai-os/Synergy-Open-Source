<script lang="ts">
	/**
	 * Reusable Keyboard Shortcut Badge Component
	 *
	 * Displays keyboard shortcuts in a consistent, branded style.
	 * When shortcut changes (e.g., 'N' → 'A + B'), updates everywhere automatically.
	 *
	 * Examples:
	 * - <KeyboardShortcut keys="C" />
	 * - <KeyboardShortcut keys={['Cmd', 'K']} />
	 * - <KeyboardShortcut keys={['Shift', 'Enter']} />
	 */

	type Props = {
		keys: string | string[]; // Single key 'C' or multiple ['Cmd', 'K']
		size?: 'sm' | 'md';
	};

	let { keys, size = 'sm' }: Props = $props();

	const keysArray = Array.isArray(keys) ? keys : [keys];
	const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';
</script>

<div class="inline-flex items-center gap-1">
	{#each keysArray as key, i}
		<kbd class="bg-base/50 rounded font-mono text-tertiary {sizeClasses}">
			{key}
		</kbd>
		{#if i < keysArray.length - 1}
			<span class="text-xs text-tertiary">+</span>
		{/if}
	{/each}
</div>

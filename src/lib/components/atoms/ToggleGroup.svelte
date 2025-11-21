<script lang="ts" module>
	import { ToggleGroup as BitsToggleGroup } from 'bits-ui';

	/**
	 * ToggleGroup Root Component
	 * Wraps Bits UI ToggleGroup.Root with design tokens
	 * Usage: <ToggleGroup.Root type="multiple" bind:value={selectedDays}>
	 */
	export const Root = BitsToggleGroup.Root;

	/**
	 * ToggleGroup Item Component
	 * Wraps Bits UI ToggleGroup.Item with design tokens
	 * Usage: <ToggleGroup.Item value="mon">Mon</ToggleGroup.Item>
	 */
	export const Item = BitsToggleGroup.Item;
</script>

<!-- Global styles for ToggleGroup items using design tokens -->
<style>
	/* Root container - horizontal flex, single line */
	:global([data-toggle-group-root]),
	:global([data-toggle-group]) {
		display: inline-flex;
		flex-wrap: nowrap;
		gap: var(--spacing-icon, 0.5rem);
		align-items: center;
	}

	/* Item base styles - small size, compact, matches original button style */
	:global(.toggle-group-day),
	:global([data-toggle-group-item]),
	:global(button[data-toggle-group-item]) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding-inline: var(--spacing-nav-item-x, 0.5rem);
		padding-block: var(--spacing-nav-item-y, 0.375rem);
		border-radius: var(--border-radius-button, 0.5rem);
		font-size: var(--font-size-sm, 0.875rem);
		font-weight: 500;
		border: 1px solid var(--color-border-base);
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease;
		cursor: pointer;
		background-color: var(--color-bg-surface);
		color: var(--color-text-secondary);
		white-space: nowrap;
		min-width: fit-content;
	}

	/* Selected state (on) - blue background with white text */
	:global(.toggle-group-day[data-state='on']),
	:global([data-toggle-group-item][data-state='on']),
	:global(button[data-toggle-group-item][data-state='on']) {
		background-color: var(--color-accent-primary) !important;
		border-color: var(--color-accent-primary) !important;
		color: var(--color-text-primary) !important;
	}

	/* Unselected state (off) */
	:global(.toggle-group-day[data-state='off']),
	:global([data-toggle-group-item][data-state='off']),
	:global(button[data-toggle-group-item][data-state='off']) {
		background-color: var(--color-bg-surface);
		border-color: var(--color-border-base);
		color: var(--color-text-secondary);
	}

	/* Hover state for unselected items */
	:global(.toggle-group-day[data-state='off']:hover),
	:global([data-toggle-group-item][data-state='off']:hover),
	:global(button[data-toggle-group-item][data-state='off']:hover) {
		background-color: var(--color-bg-surface-hover);
	}

	/* Disabled state */
	:global(.toggle-group-day[data-disabled]),
	:global([data-toggle-group-item][data-disabled]),
	:global(button[data-toggle-group-item][data-disabled]) {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>

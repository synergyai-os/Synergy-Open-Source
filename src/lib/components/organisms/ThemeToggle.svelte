<script lang="ts">
	/**
	 * Theme Toggle Component (Svelte 5 Runes)
	 *
	 * Reusable component for switching between light/dark modes
	 * Uses Svelte 5 theme store with runes
	 *
	 * Usage:
	 *   <ThemeToggle /> - Icon only (for navbar)
	 *   <ThemeToggle showLabel={true} /> - With label (for settings)
	 */

	import { getTheme, toggleTheme, isDark } from '$lib/stores/theme.svelte';

	interface Props {
		showLabel?: boolean;
	}

	let { showLabel = false }: Props = $props();
</script>

<button
	type="button"
	class="icon-xl text-secondary hover:bg-hover-solid hover:text-primary flex items-center justify-center rounded-button transition-colors"
	aria-label="Toggle theme"
	title={isDark() ? 'Switch to light mode' : 'Switch to dark mode'}
	onclick={toggleTheme}
>
	{#if isDark()}
		<!-- Sun icon (show in dark mode - clicking switches to light) -->
		<svg
			class="icon-md"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
			/>
		</svg>
	{:else}
		<!-- Moon icon (show in light mode - clicking switches to dark) -->
		<svg
			class="icon-md"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
			/>
		</svg>
	{/if}

	{#if showLabel}
		<span class="text-button ml-icon-gap">{isDark() ? 'Light mode' : 'Dark mode'}</span>
	{/if}
</button>

/**
 * Global theme management store (Svelte 5 Runes)
 *
 * Handles dark/light mode theming with:
 * - Reactive state using $state rune
 * - Computed values using $derived rune
 * - Side effects handled in setTheme/toggleTheme (can't use $effect at module level)
 * - localStorage persistence
 * - Future: Convex integration for cross-device sync when logged in
 */

import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

/**
 * Initialize theme from localStorage or default to light
 */
function getInitialTheme(): Theme {
	if (!browser) return 'light';

	try {
		const stored = localStorage.getItem('synergyos-theme');
		if (stored === 'light' || stored === 'dark') {
			return stored;
		}
	} catch (error) {
		console.warn('Failed to load theme from localStorage:', error);
	}

	// Default to light mode
	return 'light';
}

/**
 * Reactive theme state
 */
const currentTheme = $state<{ value: Theme }>({
	value: getInitialTheme()
});

/**
 * Get current theme value
 */
export function getTheme(): Theme {
	return currentTheme.value;
}

/**
 * Check if dark mode is active (computed)
 */
export function isDark(): boolean {
	return currentTheme.value === 'dark';
}

/**
 * Set theme (triggers reactivity, applies to DOM, persists to localStorage)
 * Note: $effect can't be used at module level, so we handle side effects here
 */
export function setTheme(newTheme: Theme): void {
	currentTheme.value = newTheme;
	
	// Apply to DOM immediately
	if (browser) {
		applyTheme(newTheme);
		
		// Persist to localStorage
		try {
			localStorage.setItem('synergyos-theme', newTheme);
		} catch (error) {
			console.warn('Failed to save theme to localStorage:', error);
		}
	}
}

/**
 * Toggle between light and dark
 */
export function toggleTheme(): void {
	const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark';
	setTheme(newTheme);
}

/**
 * Apply initial theme on module load (before any components mount)
 */
if (browser) {
	applyTheme(currentTheme.value);
}

/**
 * Apply theme class to HTML element
 */
function applyTheme(theme: Theme): void {
	if (!browser) return;

	const html = document.documentElement;
	if (theme === 'dark') {
		html.classList.add('dark');
		html.classList.remove('light');
	} else {
		html.classList.add('light');
		html.classList.remove('dark');
	}
}

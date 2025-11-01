/**
 * Global theme management store
 * 
 * Handles dark/light mode theming with:
 * - localStorage persistence for immediate persistence
 * - Future: Convex integration for cross-device sync when logged in
 */

import { writable, derived } from 'svelte/store';

export type Theme = 'light' | 'dark';

/**
 * Initialize theme from localStorage or system preference
 */
function getInitialTheme(): Theme {
	if (typeof window === 'undefined') return 'dark';

	try {
		const stored = localStorage.getItem('axon-theme');
		if (stored === 'light' || stored === 'dark') {
			return stored;
		}
	} catch (error) {
		console.warn('Failed to load theme from localStorage:', error);
	}

	// Default to system preference
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'dark' : 'light';
}

/**
 * Apply theme class to HTML element
 */
function applyTheme(theme: Theme): void {
	if (typeof document === 'undefined') return;

	const html = document.documentElement;
	if (theme === 'dark') {
		html.classList.add('dark');
		html.classList.remove('light');
	} else {
		html.classList.add('light');
		html.classList.remove('dark');
	}
}

// Initialize and apply theme immediately
const initialTheme = getInitialTheme();
if (typeof document !== 'undefined') {
	applyTheme(initialTheme);
}

// Create the writable store
const _themeStore = writable<Theme>(initialTheme);

// Subscribe to changes and apply theme + save to localStorage
_themeStore.subscribe((theme: Theme) => {
	applyTheme(theme);
	try {
		if (typeof window !== 'undefined') {
			localStorage.setItem('axon-theme', theme);
		}
	} catch (error) {
		console.warn('Failed to save theme to localStorage:', error);
	}
	// TODO: Sync to Convex userSettings when authenticated
});

// Derived store for isDark boolean
export const isDark = derived<typeof _themeStore, boolean>(
	_themeStore,
	($theme) => $theme === 'dark'
);

// Custom store with setTheme and toggleTheme methods
export const theme = {
	subscribe: _themeStore.subscribe,
	setTheme: (newTheme: Theme) => _themeStore.set(newTheme),
	toggleTheme: () => {
		_themeStore.update((current: Theme) => (current === 'dark' ? 'light' : 'dark'));
	}
};

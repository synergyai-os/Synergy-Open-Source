/**
 * Composable for inbox layout state management
 * Extracted from inbox +page.svelte to improve maintainability
 */

import { browser } from '$app/environment';

const STORAGE_KEY = 'inboxWidth';
const DEFAULT_WIDTH_TOKEN = '--spacing-96';
const MIN_WIDTH_TOKEN = '--spacing-44';

function spacingValue(token: string, fallback: number) {
	if (typeof window === 'undefined') return fallback;
	const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
	const numeric = Number.parseFloat(raw);
	if (!Number.isFinite(numeric)) return fallback;
	return raw.endsWith('rem') ? numeric * 16 : numeric;
}

// Fallbacks rely on token resolution; 0 keeps SSR safe without hardcoded pixels
const defaultWidth = spacingValue(DEFAULT_WIDTH_TOKEN, 0);
const minWidth = spacingValue(MIN_WIDTH_TOKEN, 0);

export interface UseInboxLayoutReturn {
	get inboxWidth(): number;
	handleInboxWidthChange: (width: number) => void;
	handleClose: () => void;
}

export function useInboxLayout(): UseInboxLayoutReturn {
	// Layout state
	const state = $state({
		inboxWidth: defaultWidth
	});

	// Initialize from localStorage or defaults
	if (browser) {
		$effect(() => {
			const savedInboxWidth = parseInt(localStorage.getItem(STORAGE_KEY) || String(defaultWidth));
			state.inboxWidth = savedInboxWidth;
		});
	}

	// Handle width change and persist to localStorage
	function handleInboxWidthChange(width: number) {
		state.inboxWidth = width;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, width.toString());
		}
	}

	// Handle close (collapse to minimum width)
	function handleClose() {
		handleInboxWidthChange(minWidth);
	}

	// Return state and functions using getters for reactivity
	return {
		// State - getters ensure reactivity is tracked
		get inboxWidth() {
			return state.inboxWidth;
		},
		// Functions
		handleInboxWidthChange,
		handleClose
	};
}

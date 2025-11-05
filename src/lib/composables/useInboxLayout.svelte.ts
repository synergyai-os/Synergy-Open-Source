/**
 * Composable for inbox layout state management
 * Extracted from inbox +page.svelte to improve maintainability
 */

import { browser } from '$app/environment';

const STORAGE_KEY = 'inboxWidth';
const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 175;

export function useInboxLayout() {
	// Layout state
	const state = $state({
		inboxWidth: DEFAULT_WIDTH
	});

	// Initialize from localStorage or defaults
	if (browser) {
		$effect(() => {
			const savedInboxWidth = parseInt(localStorage.getItem(STORAGE_KEY) || String(DEFAULT_WIDTH));
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
		handleInboxWidthChange(MIN_WIDTH);
	}

	// Return state and functions using getters for reactivity
	return {
		// State - getters ensure reactivity is tracked
		get inboxWidth() { return state.inboxWidth; },
		// Functions
		handleInboxWidthChange,
		handleClose,
	};
}


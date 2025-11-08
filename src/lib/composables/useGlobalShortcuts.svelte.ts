/**
 * Global Keyboard Shortcuts Composable
 * 
 * Manages application-wide keyboard shortcuts
 * Following Svelte 5 composables pattern
 */

import { browser } from '$app/environment';

export type ShortcutHandler = () => void;

export type ShortcutConfig = {
	key: string;
	ctrl?: boolean;
	meta?: boolean;
	shift?: boolean;
	alt?: boolean;
	handler: ShortcutHandler;
	description?: string;
	preventDefault?: boolean;
};

export function useGlobalShortcuts() {
	// Internal state using single $state object pattern
	const state = $state({
		shortcuts: new Map<string, ShortcutConfig>(),
		isEnabled: true,
	});

	/**
	 * Register a keyboard shortcut
	 */
	function register(config: ShortcutConfig) {
		const key = getShortcutKey(config);
		state.shortcuts.set(key, config);
	}

	/**
	 * Unregister a keyboard shortcut
	 */
	function unregister(key: string, modifiers?: {
		ctrl?: boolean;
		meta?: boolean;
		shift?: boolean;
		alt?: boolean;
	}) {
		const shortcutKey = modifiers ? getShortcutKey({ key, ...modifiers } as ShortcutConfig) : key;
		state.shortcuts.delete(shortcutKey);
	}

	/**
	 * Enable shortcuts
	 */
	function enable() {
		state.isEnabled = true;
	}

	/**
	 * Disable shortcuts (useful when modals are open)
	 */
	function disable() {
		state.isEnabled = false;
	}

	/**
	 * Generate unique key for shortcut map
	 */
	function getShortcutKey(config: Omit<ShortcutConfig, 'handler'>): string {
		const parts = [];
		if (config.ctrl) parts.push('ctrl');
		if (config.meta) parts.push('meta');
		if (config.shift) parts.push('shift');
		if (config.alt) parts.push('alt');
		parts.push(config.key.toLowerCase());
		return parts.join('+');
	}

	/**
	 * Handle keyboard event
	 */
	function handleKeyDown(e: KeyboardEvent) {
		if (!state.isEnabled) return;

		// Don't trigger shortcuts when typing in input fields
		const target = e.target as HTMLElement;
		const isEditing =
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.contentEditable === 'true' ||
			target.closest('[contenteditable="true"]');

		// Allow some shortcuts even when editing (like Escape)
		const allowedWhenEditing = ['escape', 'esc'];
		if (isEditing && !allowedWhenEditing.includes(e.key.toLowerCase())) {
			return;
		}

		// Build shortcut key from event
		const key = getShortcutKey({
			key: e.key,
			ctrl: e.ctrlKey,
			meta: e.metaKey,
			shift: e.shiftKey,
			alt: e.altKey,
		} as ShortcutConfig);

		const shortcut = state.shortcuts.get(key);

		if (shortcut) {
			if (shortcut.preventDefault !== false) {
				e.preventDefault();
			}
			shortcut.handler();
		}
	}

	// Set up global event listener (only runs in browser due to $effect)
	$effect(() => {
		if (!browser) return;
		
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Return public API with getters (Svelte 5 pattern)
	return {
		get isEnabled() {
			return state.isEnabled;
		},
		get shortcuts() {
			return Array.from(state.shortcuts.values());
		},
		register,
		unregister,
		enable,
		disable,
	};
}

/**
 * Common keyboard shortcuts for the app
 */
export const SHORTCUTS = {
	CREATE: 'c',
	COMMAND_PALETTE: 'k',
	SEARCH: '/',
	ESCAPE: 'escape',
	SAVE: 's',
} as const;


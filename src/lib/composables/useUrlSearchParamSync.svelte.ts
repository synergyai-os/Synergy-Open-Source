import { browser } from '$app/environment';
import { pushState, replaceState } from '$app/navigation';
import { untrack } from 'svelte';
import { SvelteURL } from 'svelte/reactivity';

type HistoryMode = 'push' | 'replace';

export type UrlSearchParamSyncOptions<T> = {
	/**
	 * Query param name to read/write (e.g. "circleTab")
	 */
	param: string;
	/**
	 * Called to read the current in-app state value (reactive dependencies should be read inside this).
	 */
	getValue: () => T;
	/**
	 * Called to set the in-app state value when URL is the source of truth.
	 */
	setValue: (value: T) => void;
	/**
	 * Convert raw query param value to the in-app state value.
	 * Return null to indicate "ignore / not applicable".
	 */
	parse: (raw: string | null) => T | null;
	/**
	 * Convert the in-app state value to a query param value.
	 * Return null to remove the param from the URL.
	 */
	serialize: (value: T) => string | null;
	/**
	 * Optional readiness gate (useful when parse depends on data that loads later).
	 * If omitted, sync runs immediately.
	 */
	isReady?: () => boolean;
	/**
	 * Whether URL updates should create a new history entry or update the current one.
	 * Default: "replace" (tabs generally shouldn't spam history).
	 */
	historyMode?: HistoryMode;
};

/**
 * Bidirectionally sync a single URL query parameter with arbitrary app state.
 *
 * - Initial load: URL -> state (once ready)
 * - State changes: state -> URL
 * - Back/forward: URL -> state (via popstate + $page store)
 *
 * This is intentionally small and generic so it can be reused beyond tabs.
 */
export function useUrlSearchParamSync<T>(options: UrlSearchParamSyncOptions<T>): void {
	const { param, getValue, setValue, parse, serialize, isReady, historyMode = 'replace' } = options;

	const state = $state({
		syncingFromUrl: false,
		initialRestoreDone: false,
		prevSerialized: null as string | null
	});

	function buildUrlWithParam(baseUrl: SvelteURL, serialized: string | null): SvelteURL {
		const next = new SvelteURL(baseUrl);
		if (serialized) {
			next.searchParams.set(param, serialized);
		} else {
			next.searchParams.delete(param);
		}
		return next;
	}

	function toRelativeUrl(url: SvelteURL): string {
		return `${url.pathname}${url.search}${url.hash}`;
	}

	function restoreFromUrl(clearFirst: boolean): void {
		const raw = new SvelteURL(window.location.href).searchParams.get(param);
		const parsed = parse(raw);
		if (parsed === null) return;

		state.syncingFromUrl = true;
		try {
			// "clearFirst" is included for parity with other URL sync patterns;
			// for generic state we just overwrite with the parsed value.
			void clearFirst;
			setValue(parsed);
		} finally {
			state.syncingFromUrl = false;
		}
	}

	function updateUrl(mode: HistoryMode): void {
		if (!browser || state.syncingFromUrl) return;

		// Use window.location as the source of truth so we don't accidentally drop
		// query params managed by other URL sync layers (e.g. stacked navigation `nav`).
		const currentUrl = new SvelteURL(window.location.href);
		const serialized = serialize(getValue());

		// Avoid redundant updates (and infinite loops with SvelteKit store updates)
		if (serialized === state.prevSerialized) return;
		state.prevSerialized = serialized;

		const nextUrl = buildUrlWithParam(currentUrl, serialized);
		if (nextUrl.href === currentUrl.href) return;

		if (mode === 'push') {
			pushState(toRelativeUrl(nextUrl), {});
		} else {
			replaceState(toRelativeUrl(nextUrl), {});
		}
	}

	// Initial restore (once ready)
	$effect(() => {
		const ready = isReady?.() ?? true;
		if (!browser || !ready || state.initialRestoreDone) return;

		untrack(() => {
			restoreFromUrl(false);
			state.initialRestoreDone = true;
			// Seed prevSerialized so the first state->URL sync doesn't immediately re-write the same value
			const currentUrl = new SvelteURL(window.location.href);
			state.prevSerialized = currentUrl.searchParams.get(param);
		});
	});

	// State -> URL sync
	$effect(() => {
		// Track reactive deps
		const value = getValue();
		void value;
		if (!browser || !state.initialRestoreDone) return;
		updateUrl(historyMode);
	});

	// Back/forward: URL -> state sync
	$effect(() => {
		if (!browser) return;

		const handlePopstate = () => {
			// Let SvelteKit update $page store first
			setTimeout(() => restoreFromUrl(true), 0);
		};

		window.addEventListener('popstate', handlePopstate);
		return () => window.removeEventListener('popstate', handlePopstate);
	});
}

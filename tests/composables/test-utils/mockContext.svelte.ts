/**
 * Test Utilities for Mocking Svelte Context
 *
 * Mocks getContext for composable tests
 */

import { vi } from 'vitest';
import type { UseLoadingOverlayReturn } from '$lib/composables/useLoadingOverlay.svelte';

/**
 * Create a mock loading overlay context
 */
export function createMockLoadingOverlay(): UseLoadingOverlayReturn {
	return {
		get show() {
			return false;
		},
		get flow() {
			return 'custom' as const;
		},
		get title() {
			return '';
		},
		get subtitle() {
			return '';
		},
		get customStages() {
			return [];
		},
		showOverlay: vi.fn(),
		hideOverlay: vi.fn()
	};
}

/**
 * Setup context mocks
 * Note: This updates the global mock state, not creating a new mock
 * (setupMocks.svelte.ts already mocks svelte module-level)
 */
export function setupContextMocks(
	options: {
		loadingOverlay?: UseLoadingOverlayReturn | null;
	} = {}
) {
	const { loadingOverlay = createMockLoadingOverlay() } = options;

	// Update global mock state (setupMocks.svelte.ts reads from this)
	const svelteContext =
		(globalThis as unknown as { __vitestSvelteContext?: Record<string, unknown> })
			.__vitestSvelteContext || {};
	svelteContext['loadingOverlay'] = loadingOverlay;
	(
		globalThis as unknown as { __vitestSvelteContext: Record<string, unknown> }
	).__vitestSvelteContext = svelteContext;

	return { loadingOverlay };
}

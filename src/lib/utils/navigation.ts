/**
 * Navigation utilities for SvelteKit routes
 *
 * Re-exports SvelteKit's resolveRoute to ensure consistent route resolution
 * that respects base paths and enables proper prefetching.
 *
 * @see https://kit.svelte.dev/docs/kit/routing#resolveRoute
 */

export { resolveRoute } from '$app/paths';

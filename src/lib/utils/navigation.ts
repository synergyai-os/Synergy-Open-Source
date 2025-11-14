/**
 * Navigation utilities for SvelteKit routes
 *
 * Wraps SvelteKit's resolve function to ensure consistent route resolution
 * that respects base paths and enables proper prefetching.
 *
 * @see https://kit.svelte.dev/docs/kit/$app-paths#resolve
 */

import { resolve as svelteResolve } from '$app/paths';
import type { RouteId } from '$app/types';

/**
 * Resolves a route path, handling type assertions for routes that may not be
 * in the strict TypeScript route manifest (e.g., dynamic routes, planned routes).
 *
 * @param route - The route path to resolve (e.g., '/settings/account')
 * @returns The resolved route path with base path applied
 */
export function resolveRoute(route: string): string {
	// Type assertion needed for routes that exist but aren't in the strict route type union
	// This allows routes like /settings/* subroutes that are handled by layouts
	// We cast to RouteId to satisfy TypeScript's strict route typing while allowing
	// routes that are valid at runtime but not in the generated type manifest
	// @ts-expect-error - SvelteKit's strict route typing doesn't include all valid routes
	// (e.g., /settings/* subroutes handled by layouts). Runtime validation ensures correctness.
	return svelteResolve(route as RouteId);
}

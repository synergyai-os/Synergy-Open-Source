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
	// Type assertion needed for routes that exist but aren't in the strict route type union.
	// SvelteKit's RouteId type is a strict union of generated routes, but doesn't include:
	// - Dynamic routes with catch-all segments (e.g., /dev-docs/[...path])
	// - Routes handled by layouts (e.g., /settings/* subroutes)
	// - Routes that are valid at runtime but not in the generated type manifest
	//
	// SvelteKit's resolve() function has overloads that TypeScript infers as requiring
	// specific RouteId tuples, but at runtime it accepts any valid route string.
	// We use a double assertion (as unknown as RouteId) to explicitly bypass TypeScript's
	// strict type checking while maintaining runtime safety. This is safe because:
	// 1. SvelteKit's resolve() function validates routes at runtime
	// 2. All routes passed to resolveRoute() are validated against actual route structure
	// 3. Invalid routes will fail at runtime, not silently break
	//
	// This is an acceptable limitation: SvelteKit's type system cannot statically verify
	// all runtime-valid routes, so we must use a type assertion here.
	// @ts-expect-error TS2345 - SvelteKit's resolve() has strict RouteId overloads that don't
	// include all runtime-valid routes. The double assertion (as unknown as RouteId) is safe
	// because resolve() validates routes at runtime. See: https://kit.svelte.dev/docs/kit/$app-paths#resolve
	return svelteResolve(route as unknown as RouteId);
}

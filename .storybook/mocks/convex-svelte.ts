/**
 * Mock convex-svelte hooks for Storybook
 * Returns no-op hooks that return empty data
 */

export function useQuery() {
	return {
		data: undefined,
		error: undefined,
		isLoading: false,
		isStale: false
	};
}

export function useConvexClient() {
	return null;
}

export function setupConvex() {
	// No-op for Storybook - Convex is mocked
}

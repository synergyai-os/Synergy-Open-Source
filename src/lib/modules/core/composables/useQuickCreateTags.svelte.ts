/**
 * useQuickCreateTags Composable - Tag query and creation for QuickCreateModal
 *
 * Extracts tag-related logic from QuickCreateModal component following separation of concerns.
 * Provides tag query and creation functionality for quick create workflows.
 *
 * Usage:
 * ```typescript
 * const tags = useQuickCreateTags(
 *   () => sessionId,
 *   () => workspaceId,
 *   initialTags
 * );
 * const availableTags = tags.availableTags;
 * await tags.createTag('New Tag', '#3b82f6');
 * ```
 *
 * @see dev-docs/2-areas/design/component-architecture.md#L377 - Separation of concerns pattern
 * @see dev-docs/2-areas/patterns/svelte-reactivity.md#L10 - Composables pattern
 */

import { browser } from '$app/environment';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';
import { toast } from 'svelte-sonner';

// Type matches TagWithHierarchy from convex/tags.ts and Tag type from TagSelector
export type Tag = {
	_id: Id<'tags'>;
	displayName: string;
	color: string;
	parentId?: Id<'tags'>;
	level?: number;
	children?: Tag[];
};

export function useQuickCreateTags(
	getSessionId: () => string | null | undefined,
	getWorkspaceId: () => string | null | undefined,
	initialTags: unknown[] = []
) {
	// Svelte 5 pattern: Single $state object with getters
	const state = $state({
		error: null as string | null
	});

	// Get Convex client (only in browser)
	const convexClient = browser ? useConvexClient() : null;

	// Query all available tags - use server-side initial data immediately, then use query data when available
	const allTagsQuery =
		browser && getSessionId()
			? useQuery(api.tags.listAllTags, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check
					const workspaceId = getWorkspaceId();
					return {
						sessionId,
						...(workspaceId ? { workspaceId: workspaceId as Id<'workspaces'> } : {})
					};
				})
			: null;

	// Available tags: use query data when available, fallback to initial tags
	const availableTags = $derived(
		allTagsQuery?.data !== undefined ? (allTagsQuery.data as Tag[]) : ((initialTags ?? []) as Tag[])
	);

	/**
	 * Create a new tag with color and optional parent
	 * If workspaceId is available, creates as workspace tag
	 * Otherwise, creates as user tag (visible across all orgs)
	 */
	async function createTag(
		displayName: string,
		color: string,
		parentId?: Id<'tags'>
	): Promise<Id<'tags'>> {
		if (!convexClient) {
			throw new Error('Convex client not available');
		}

		state.error = null;

		try {
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			const workspaceId = getWorkspaceId();

			// If workspaceId is available, create as workspace tag
			// Otherwise, create as user tag (visible across all orgs)
			const tagId = await convexClient.mutation(api.tags.createTag, {
				sessionId,
				displayName,
				color,
				parentId,
				...(workspaceId
					? {
							ownership: 'workspace' as const,
							workspaceId: workspaceId as Id<'workspaces'>
						}
					: {})
			});

			return tagId;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create tag';
			state.error = errorMessage;
			toast.error(errorMessage);
			throw error;
		}
	}

	// Return getters (Svelte 5 pattern) and action functions
	return {
		// Getters for reactive state
		get availableTags() {
			return availableTags;
		},
		get error() {
			return state.error;
		},

		// Action functions
		createTag
	};
}

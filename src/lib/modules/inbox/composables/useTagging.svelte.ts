/**
 * Composable for tag operations (query, create, assign)
 * Extracted from ReadwiseDetail.svelte to improve separation of concerns
 * Follows pattern #L95: Components should only handle UI rendering
 */

import { browser } from '$app/environment';
import { useQuery, useConvexClient } from 'convex-svelte';
import { api } from '$lib/convex';
import { makeFunctionReference } from 'convex/server';
import type { FunctionReference } from 'convex/server';
import type { Id } from '$lib/convex';
import { invariant } from '$lib/utils/invariant';

// Import TagWithHierarchy type from Convex (matches convex/tags.ts)
export type TagWithHierarchy = {
	_id: Id<'tags'>;
	personId: Id<'people'>;
	workspaceId: Id<'workspaces'>;
	circleId?: Id<'circles'>;
	ownershipType?: 'user' | 'workspace' | 'circle';
	name: string;
	displayName: string;
	color: string;
	parentId: Id<'tags'> | undefined;
	externalId: number | undefined;
	createdAt: number;
	level: number; // Depth in hierarchy (0 = root level)
	children?: TagWithHierarchy[];
};

export interface UseTaggingParams {
	sessionId: () => string | undefined; // Required: Function returning sessionId from authenticated session
	activeWorkspaceId?: () => string | null; // Function for reactivity (optional - tags can be user or org-scoped)
}

export interface UseTaggingReturn {
	get allTags(): TagWithHierarchy[] | undefined;
	get isLoading(): boolean;
	createTag: (displayName: string, color: string, parentId?: Id<'tags'>) => Promise<Id<'tags'>>;
	assignTags: (highlightId: Id<'highlights'>, tagIds: Id<'tags'>[]) => Promise<void>;
}

export function useTagging(params?: UseTaggingParams): UseTaggingReturn {
	const convexClient = browser ? useConvexClient() : null;

	// Tag APIs (only if tags module exists in API)
	// Note: These will be null if Convex hasn't regenerated the API yet
	let createTagApi: FunctionReference<
		'mutation',
		'public',
		{
			sessionId: string;
			displayName: string;
			color: string;
			parentId?: Id<'tags'>;
			ownership?: 'user' | 'workspace' | 'circle';
			workspaceId?: Id<'workspaces'>;
			circleId?: Id<'circles'>;
		},
		Id<'tags'>
	> | null = null;
	let assignTagsApi: FunctionReference<
		'mutation',
		'public',
		{ sessionId: string; highlightId: Id<'highlights'>; tagIds: Id<'tags'>[] },
		void
	> | null = null;

	if (
		browser &&
		api.features.tags.index?.createTag &&
		api.features.tags.index?.updateHighlightTagAssignments
	) {
		try {
			createTagApi = makeFunctionReference('tags:createTag') as FunctionReference<
				'mutation',
				'public',
				{
					sessionId: string;
					displayName: string;
					color: string;
					parentId?: Id<'tags'>;
					ownership?: 'user' | 'workspace' | 'circle';
					workspaceId?: Id<'workspaces'>;
					circleId?: Id<'circles'>;
				},
				Id<'tags'>
			>;
			assignTagsApi = makeFunctionReference(
				'tags:updateHighlightTagAssignments'
			) as FunctionReference<
				'mutation',
				'public',
				{ sessionId: string; highlightId: Id<'highlights'>; tagIds: Id<'tags'>[] },
				void
			>;
		} catch (e) {
			// Tags API not available yet - composable will work without tags feature
			console.warn('Tags API not available:', e);
		}
	}

	// Query all tags for user (with error handling if API not generated yet)
	const allTagsQuery =
		browser && api.features.tags.index?.listAllTags && params?.sessionId
			? useQuery(api.features.tags.index.listAllTags, () => {
					const sessionId = params.sessionId(); // Get current sessionId (reactive)
					invariant(sessionId, 'sessionId required'); // ✅ Modern Convex pattern (outer check ensures it exists)
					const orgId = params.activeWorkspaceId?.();
					return {
						sessionId,
						...(orgId ? { workspaceId: orgId as Id<'workspaces'> } : {})
					};
				})
			: null;

	// Extract data from useQuery result (which returns {data, isLoading, error, isStale})
	const allTags = $derived.by(() => {
		if (allTagsQuery && typeof allTagsQuery === 'object' && 'data' in allTagsQuery) {
			return allTagsQuery.data as TagWithHierarchy[] | undefined;
		}
		return undefined;
	});

	const isLoading = $derived(allTagsQuery?.isLoading ?? false);

	// Functions
	async function createTag(
		displayName: string,
		color: string,
		parentId?: Id<'tags'>
	): Promise<Id<'tags'>> {
		invariant(convexClient && createTagApi, 'Convex client not available');

		try {
			const sessionId = params?.sessionId();
			invariant(sessionId, 'Session ID is required');

			const orgId = params?.activeWorkspaceId?.();
			const tagId = await convexClient.mutation(createTagApi, {
				sessionId,
				displayName,
				color,
				parentId,
				...(orgId
					? { ownership: 'workspace' as const, workspaceId: orgId as Id<'workspaces'> }
					: {})
			});
			return tagId;
		} catch (error) {
			console.error('Failed to create tag:', error);
			throw error;
		}
	}

	async function assignTags(highlightId: Id<'highlights'>, tagIds: Id<'tags'>[]): Promise<void> {
		invariant(convexClient && assignTagsApi, 'Convex client not available');

		try {
			const sessionId = params?.sessionId();
			invariant(sessionId, 'Session ID is required');

			await convexClient.mutation(assignTagsApi, {
				sessionId,
				highlightId,
				tagIds
			});
		} catch (error) {
			console.error('Failed to assign tags:', error);
			throw error;
		}
	}

	// Return state and functions using getters for reactivity
	return {
		// State - getters ensure reactivity is tracked
		get allTags() {
			return allTags;
		},
		get isLoading() {
			return isLoading;
		},
		// Functions
		createTag,
		assignTags
	};
}

/**
 * useTagging Composable - Generic tagging system for any entity
 *
 * Provides reusable tagging functionality for highlights, flashcards, and other entities.
 * Follows Svelte 5 composables pattern with single $state object and getters.
 *
 * Usage:
 * ```typescript
 * const tagging = useTagging('highlight');
 * await tagging.assignTags(highlightId, [tag1Id, tag2Id]);
 * ```
 *
 * @see dev-docs/2-areas/patterns/svelte-reactivity.md#L10 - Composables pattern
 * @see dev-docs/4-archive/TAGGING_SYSTEM_ANALYSIS.md - Architecture and design decisions
 */

import { browser } from '$app/environment';
import { useConvexClient } from 'convex-svelte';
import { makeFunctionReference } from 'convex/server';
import type { FunctionReference } from 'convex/server';
import type { Id } from '$lib/convex';

type EntityType = 'highlight' | 'flashcard' | 'note' | 'source';

/**
 * Capitalize first letter for function name generation
 */
function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generic tagging composable - works for any entity type
 */
export function useTagging(
	entityType: EntityType,
	getUserId: () => string | undefined,
	getSessionId: () => string | null | undefined,
	getWorkspaceId?: () => string | null | undefined
) {
	// Svelte 5 pattern: Single $state object with getters
	const state = $state({
		isAssigning: false,
		error: null as string | null
	});

	// Get Convex client (only in browser)
	const convexClient = browser ? useConvexClient() : null;

	// Dynamic mutation reference based on entity type
	// Example: 'highlight' -> 'tags:assignTagsToHighlight'
	// Use FunctionReference type assertion for type safety (pattern #L1300)
	const assignTagsMutation = browser
		? (makeFunctionReference(`tags:assignTagsTo${capitalize(entityType)}`) as FunctionReference<
				'mutation',
				'public',
				{
					sessionId: string;
					highlightId?: Id<'highlights'>;
					flashcardId?: Id<'flashcards'>;
					tagIds: Id<'tags'>[];
				},
				Id<'tags'>[]
			>)
		: null;

	const createTagMutation = browser
		? (makeFunctionReference('tags:createTag') as FunctionReference<
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
			>)
		: null;

	/**
	 * Assign tags to an entity (replaces existing tags)
	 */
	async function assignTags(
		entityId: Id<'highlights'> | Id<'flashcards'> | Id<'inboxItems'>,
		tagIds: Id<'tags'>[]
	): Promise<void> {
		if (!convexClient || !assignTagsMutation) {
			throw new Error('Convex client not available (server-side rendering?)');
		}

		state.isAssigning = true;
		state.error = null;

		try {
			const userId = getUserId();
			if (!userId) {
				throw new Error('User ID is required');
			}

			// Build args dynamically: { sessionId, highlightId: ..., tagIds: ... }
			// Note: assignTagsToHighlight uses highlightId, assignTagsToFlashcard uses flashcardId
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			const args =
				entityType === 'highlight'
					? { sessionId, highlightId: entityId as Id<'highlights'>, tagIds }
					: entityType === 'flashcard'
						? { sessionId, flashcardId: entityId as Id<'flashcards'>, tagIds }
						: { sessionId, tagIds }; // Fallback for other types

			await convexClient.mutation(assignTagsMutation, args);
		} catch (error) {
			state.error = error instanceof Error ? error.message : 'Failed to assign tags';
			throw error;
		} finally {
			state.isAssigning = false;
		}
	}

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
		if (!convexClient || !createTagMutation) {
			throw new Error('Convex client not available (server-side rendering?)');
		}

		state.error = null;

		try {
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			const orgId = getWorkspaceId?.();
			const tagId = await convexClient.mutation(createTagMutation, {
				sessionId,
				displayName,
				color,
				parentId,
				...(orgId
					? { ownership: 'workspace' as const, workspaceId: orgId as Id<'workspaces'> }
					: {})
			});

			return tagId as Id<'tags'>;
		} catch (error) {
			state.error = error instanceof Error ? error.message : 'Failed to create tag';
			throw error;
		}
	}

	// Return getters (Svelte 5 pattern) and action functions
	return {
		// Getters for reactive state
		get isAssigning() {
			return state.isAssigning;
		},
		get error() {
			return state.error;
		},

		// Action functions
		assignTags,
		createTag
	};
}

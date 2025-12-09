/**
 * Composable for managing circle items (domains, accountabilities, etc.)
 *
 * Provides reactive queries and mutations for circle/role items.
 * Supports both single-field categories (Notes) and multiple-item categories (Domains, Accountabilities).
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { useConvexClient } from 'convex-svelte';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex/_generated/dataModel';
import { invariant } from '$lib/utils/invariant';

export interface CircleItem {
	itemId: Id<'circleItems'>;
	content: string;
	order: number;
	createdAt: number;
	updatedAt: number;
}

export interface UseCircleItemsOptions {
	sessionId: () => string | undefined;
	entityType: () => 'circle' | 'role' | null;
	entityId: () => string | null;
}

export interface UseCircleItemsReturn {
	// Queries
	getItemsByCategory: (categoryName: string) => CircleItem[];
	isLoading: boolean;
	error: unknown;

	// Mutations
	createItem: (categoryName: string, content: string) => Promise<void>;
	updateItem: (itemId: Id<'circleItems'>, content: string) => Promise<void>;
	deleteItem: (itemId: Id<'circleItems'>) => Promise<void>;
}

/**
 * Hook to manage circle items reactively
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useCircleItems } from '$lib/modules/org-chart/composables/useCircleItems.svelte';
 *
 *   const circleItems = useCircleItems({
 *     sessionId: () => $page.data.sessionId,
 *     entityType: () => 'circle',
 *     entityId: () => circle?.circleId ?? null
 *   });
 *
 *   const domains = $derived(circleItems.getItemsByCategory('Domains'));
 * </script>
 * ```
 */
export function useCircleItems(options: UseCircleItemsOptions): UseCircleItemsReturn {
	const convexClient = browser ? useConvexClient() : null;
	const getSessionId = options.sessionId;
	const getEntityType = options.entityType;
	const getEntityId = options.entityId;

	// Query: Get all items for entity (all categories)
	const itemsQuery = $derived(
		browser && getSessionId() && getEntityType() && getEntityId()
			? useQuery(api.circleItems.listByEntity, () => {
					const sessionId = getSessionId();
					const entityType = getEntityType();
					const entityId = getEntityId();
					invariant(sessionId && entityType && entityId, 'sessionId, entityType, and entityId required');
					return {
						sessionId,
						entityType: entityType as 'circle' | 'role',
						entityId
					};
				})
			: null
	);

	// Helper: Get items for a specific category
	function getItemsByCategory(categoryName: string): CircleItem[] {
		if (!itemsQuery?.data) return [];

		const category = itemsQuery.data.find((c) => c.categoryName === categoryName);
		return category?.items ?? [];
	}

	// Mutations
	async function createItem(categoryName: string, content: string): Promise<void> {
		invariant(convexClient, 'Convex client not available');
		const sessionId = getSessionId();
		const entityType = getEntityType();
		const entityId = getEntityId();

		invariant(sessionId && entityType && entityId, 'sessionId, entityType, and entityId required');

		await convexClient.mutation(api.circleItems.create, {
			sessionId,
			entityType: entityType as 'circle' | 'role',
			entityId,
			categoryName,
			content
		});
	}

	async function updateItem(itemId: Id<'circleItems'>, content: string): Promise<void> {
		invariant(convexClient, 'Convex client not available');
		const sessionId = getSessionId();

		invariant(sessionId, 'sessionId required');

		await convexClient.mutation(api.circleItems.update, {
			sessionId,
			circleItemId: itemId,
			content
		});
	}

	async function deleteItem(itemId: Id<'circleItems'>): Promise<void> {
		invariant(convexClient, 'Convex client not available');
		const sessionId = getSessionId();

		invariant(sessionId, 'sessionId required');

		await convexClient.mutation(api.circleItems.deleteItem, {
			sessionId,
			circleItemId: itemId
		});
	}

	return {
		getItemsByCategory,
		get isLoading() {
			return itemsQuery?.isLoading ?? false;
		},
		get error() {
			return itemsQuery?.error ?? null;
		},
		createItem,
		updateItem,
		deleteItem
	};
}

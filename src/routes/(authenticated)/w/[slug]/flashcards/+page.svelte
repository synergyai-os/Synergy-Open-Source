<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { Button } from 'bits-ui';
	import TagFilter from '$lib/modules/core/components/TagFilter.svelte';
	import FlashcardCollectionCard from '$lib/modules/flashcards/components/FlashcardCollectionCard.svelte';
	import FlashcardDetailModal from '$lib/modules/flashcards/components/FlashcardDetailModal.svelte';
	import { api } from '$lib/convex';
	import type { Doc, Id } from '$convex/_generated/dataModel';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { resolveRoute } from '$lib/utils/navigation';

	const convexClient = browser ? useConvexClient() : null;

	// Tag filtering state
	let selectedTagIds = $state<Id<'tags'>[]>([]);

	// Modal state
	let modalOpen = $state(false);
	let modalFlashcards = $state<Array<Doc<'flashcards'>>>([]);
	let modalCollectionName = $state('');
	let modalInitialIndex = $state(0);

	// Get sessionId from page data
	const getSessionId = () => $page.data.sessionId;

	// Get workspace context
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const activeWorkspaceId = $derived(() => workspaces?.activeWorkspaceId ?? null);

	// Query all tags for filtering (filtered by active workspace)
	const allTagsQuery =
		browser && getSessionId()
			? useQuery(api.tags.listAllTags, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check
					const orgId = activeWorkspaceId();
					return {
						sessionId,
						...(orgId ? { workspaceId: orgId as Id<'workspaces'> } : {})
					};
				})
			: null;
	const allTags = $derived(allTagsQuery?.data ?? []);

	// Query collections
	const collectionsQuery =
		browser && getSessionId()
			? useQuery(api.flashcards.getFlashcardsByCollection, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check
					return { sessionId };
				})
			: null;
	const collections = $derived(collectionsQuery?.data ?? []);

	// Query all flashcards (for "All Cards" collection)
	const allFlashcardsQuery =
		browser && getSessionId()
			? useQuery(api.flashcards.getUserFlashcards, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check
					return {
						sessionId,
						tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined
					};
				})
			: null;

	const allFlashcards = $derived(allFlashcardsQuery?.data ?? []);

	// Filter collections by selected tags
	const filteredCollections = $derived(
		selectedTagIds.length === 0
			? collections
			: collections.filter((c: { tagId: Id<'tags'> | 'all' }) =>
					selectedTagIds.includes(c.tagId as Id<'tags'>)
				)
	);

	// Build "All Cards" collection
	const allCardsCollection = $derived({
		tagId: 'all' as const,
		name: 'All Cards',
		color: undefined,
		count: allFlashcards.length,
		dueCount: allFlashcards.filter(
			(f: { fsrsDue?: number }) => f.fsrsDue && f.fsrsDue <= Date.now()
		).length
	});

	// Combined collections (All Cards + filtered collections)
	const displayCollections = $derived.by(() => {
		const result: Array<{
			tagId: Id<'tags'> | 'all';
			name: string;
			color?: string;
			count: number;
			dueCount?: number;
		}> = [allCardsCollection];
		// Add filtered collections, but only if they have cards
		for (const coll of filteredCollections) {
			if (coll.count > 0) {
				result.push(coll);
			}
		}
		return result;
	});

	const isLoading = $derived(
		(collectionsQuery?.isLoading ?? false) || (allFlashcardsQuery?.isLoading ?? false)
	);
	const error = $derived(
		collectionsQuery?.error
			? String(collectionsQuery.error)
			: allFlashcardsQuery?.error
				? String(allFlashcardsQuery.error)
				: null
	);

	function handleTagsChange(tagIds: Id<'tags'>[]) {
		selectedTagIds = tagIds;
	}

	// Query flashcards for each collection when needed
	// We'll query them on-demand when opening a collection
	async function openCollection(collection: { tagId: Id<'tags'> | 'all'; name: string }) {
		if (!browser || !convexClient) return;

		// Get flashcards for this collection
		let flashcards: Array<Doc<'flashcards'>> = [];

		if (collection.tagId === 'all') {
			flashcards = allFlashcards;
		} else {
			// Query flashcards for this specific tag
			try {
				const sessionId = getSessionId();
				if (!sessionId) {
					throw new Error('Session ID is required');
				}

				const result = await convexClient.query(api.flashcards.getUserFlashcards, {
					sessionId,
					tagIds: [collection.tagId as Id<'tags'>]
				});
				flashcards = result ?? [];
			} catch (err) {
				console.error('Failed to load collection flashcards:', err);
				return;
			}
		}

		if (flashcards.length === 0) {
			return;
		}

		modalFlashcards = flashcards;
		modalCollectionName = collection.name;
		modalInitialIndex = 0;
		modalOpen = true;
	}

	function handleCloseModal() {
		modalOpen = false;
		// Refresh queries to get updated data
		// The queries will automatically refresh
	}
</script>

<!-- Main Content -->
<div class="h-full overflow-y-auto bg-base">
	<!-- Header -->
	<div
		class="h-system-header border-base py-system-header sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b bg-base px-page"
	>
		<div class="flex items-center gap-2">
			<svg
				class="size-icon-md flex-shrink-0 text-accent-primary"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
				/>
			</svg>
			<div class="flex items-center gap-2">
				<h2 class="text-small font-normal text-secondary">Flashcards</h2>
				{#if allFlashcards.length > 0}
					<span class="text-small text-secondary">
						({allFlashcards.length} card{allFlashcards.length !== 1 ? 's' : ''}
						• {allFlashcards.filter(
							(f: { fsrsDue?: number }) => f.fsrsDue && f.fsrsDue <= Date.now()
						).length} due)
					</span>
				{/if}
			</div>
		</div>
		{#if allFlashcards.length > 0}
			<Button.Root
				href={resolveRoute('/study')}
				class="py-nav-item text-small flex items-center gap-2 rounded-button bg-accent-primary px-2 font-medium text-primary transition-opacity hover:opacity-90"
			>
				<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
					/>
				</svg>
				Study
			</Button.Root>
		{/if}
	</div>

	<div class="px-page py-page">
		<!-- Tag Filter -->
		{#if allTags.length > 0}
			<div class="mb-inbox-title">
				<TagFilter {selectedTagIds} availableTags={allTags} onTagsChange={handleTagsChange} />
			</div>
		{/if}

		{#if isLoading}
			<div class="text-center" style="padding-block: var(--spacing-8);">
				<p class="text-secondary">Loading flashcards...</p>
			</div>
		{:else if error}
			<div class="text-center" style="padding-block: var(--spacing-8);">
				<p class="mb-form-section font-medium text-primary">Error</p>
				<p class="text-secondary">{error}</p>
			</div>
		{:else if displayCollections.length === 0}
			<div class="text-center" style="padding-block: var(--spacing-8);">
				<p class="text-secondary">
					{selectedTagIds.length > 0
						? 'No collections found with selected tags.'
						: 'No flashcards yet. Generate some from your inbox! 📚'}
				</p>
			</div>
		{:else}
			<!-- Collections Grid -->
			<div class="gap-inbox-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each displayCollections as collection (collection.tagId)}
					<FlashcardCollectionCard {collection} onClick={() => openCollection(collection)} />
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Detail Modal -->
<FlashcardDetailModal
	open={modalOpen}
	flashcards={modalFlashcards}
	initialIndex={modalInitialIndex}
	collectionName={modalCollectionName}
	onClose={handleCloseModal}
/>

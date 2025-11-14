<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { Button } from 'bits-ui';
	import TagFilter from '$lib/components/TagFilter.svelte';
	import FlashcardCollectionCard from '$lib/components/flashcards/FlashcardCollectionCard.svelte';
	import FlashcardDetailModal from '$lib/components/flashcards/FlashcardDetailModal.svelte';
	import { api } from '$lib/convex';
	import type { Id } from '../../../../convex/_generated/dataModel';
	import { resolveRoute } from '$lib/utils/navigation';

	const convexClient = browser ? useConvexClient() : null;

	// Tag filtering state
	let selectedTagIds = $state<Id<'tags'>[]>([]);

	// Modal state
	let modalOpen = $state(false);
	let modalFlashcards = $state<any[]>([]);
	let modalCollectionName = $state('');
	let modalInitialIndex = $state(0);

	// Get sessionId from page data
	const getSessionId = () => $page.data.sessionId;

	// Query all tags for filtering
	const allTagsQuery =
		browser && getSessionId()
			? useQuery(api.tags.listAllTags, () => {
					const sessionId = getSessionId();
					if (!sessionId) throw new Error('sessionId required'); // Should not happen due to outer check
					return { sessionId };
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
	const displayCollections = $derived(() => {
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
		let flashcards: Array<{
			_id: string;
			question: string;
			answer: string;
			tagId?: string;
			userId: string;
			createdAt: number;
		}> = [];

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
		class="sticky top-0 z-10 flex h-system-header flex-shrink-0 items-center justify-between border-b border-base bg-base px-inbox-container py-system-header"
	>
		<div class="flex items-center gap-icon">
			<svg
				class="h-5 w-5 flex-shrink-0 text-accent-primary"
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
			<div class="flex items-center gap-icon">
				<h2 class="text-sm font-normal text-secondary">Flashcards</h2>
				{#if allFlashcards.length > 0}
					<span class="text-sm text-secondary">
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
				class="flex items-center gap-icon rounded-md bg-accent-primary px-nav-item py-nav-item text-sm font-medium text-white transition-opacity hover:opacity-90"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

	<div class="p-inbox-container">
		<!-- Tag Filter -->
		{#if allTags.length > 0}
			<div class="mb-inbox-title">
				<TagFilter {selectedTagIds} availableTags={allTags} onTagsChange={handleTagsChange} />
			</div>
		{/if}

		{#if isLoading}
			<div class="py-readable-quote text-center">
				<p class="text-secondary">Loading flashcards...</p>
			</div>
		{:else if error}
			<div class="py-readable-quote text-center">
				<p class="mb-2 font-medium text-primary">Error</p>
				<p class="text-secondary">{error}</p>
			</div>
		{:else if displayCollections().length === 0}
			<div class="py-readable-quote text-center">
				<p class="text-secondary">
					{selectedTagIds.length > 0
						? 'No collections found with selected tags.'
						: 'No flashcards yet. Generate some from your inbox! 📚'}
				</p>
			</div>
		{:else}
			<!-- Collections Grid -->
			<div class="grid grid-cols-1 gap-inbox-list md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each displayCollections() as collection (collection.tagId)}
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

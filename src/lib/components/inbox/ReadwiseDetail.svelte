<script lang="ts">
	import { Button, DropdownMenu, Tooltip } from 'bits-ui';
	import { browser } from '$app/environment';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';
	import { api } from '$lib/convex';
	import TagSelector from './TagSelector.svelte';
	import type { Id } from '../../../../convex/_generated/dataModel';
	import { DEFAULT_TAG_COLOR } from '$lib/utils/tagConstants';

	type Props = {
		inboxItemId?: string; // Inbox item ID (if using real data)
		item: any; // Item from getInboxItemWithDetails query
		onClose: () => void;
		currentIndex?: number; // Current item index (0-based)
		totalItems?: number; // Total number of items
		onNext?: () => void; // Navigate to next item
		onPrevious?: () => void; // Navigate to previous item
	};

	let { inboxItemId, item, onClose, currentIndex = -1, totalItems = 0, onNext, onPrevious }: Props = $props();
	
	// Derive current position (1-based for display)
	const currentPosition = $derived(currentIndex >= 0 ? currentIndex + 1 : 0);
	const canNavigateNext = $derived(onNext !== undefined && currentIndex < totalItems - 1);
	const canNavigatePrevious = $derived(onPrevious !== undefined && currentIndex > 0);
	
	const convexClient = browser ? useConvexClient() : null;
	const markProcessedApi = browser ? makeFunctionReference('inbox:markProcessed') as any : null;
	
	// Tag APIs (only if tags module exists in API)
	// Note: These will be null if Convex hasn't regenerated the API yet
	let createTagApi: any = null;
	let assignTagsApi: any = null;
	if (browser && (api as any).tags?.createTag && (api as any).tags?.assignTagsToHighlight) {
		try {
			createTagApi = makeFunctionReference('tags:createTag') as any;
			assignTagsApi = makeFunctionReference('tags:assignTagsToHighlight') as any;
		} catch (e) {
			// Tags API not available yet - component will work without tags feature
			console.warn('Tags API not available:', e);
		}
	}

	// Query all tags for user (with error handling if API not generated yet)
	// Note: useQuery returns {data, isLoading, error, isStale} - extract the data property
	const allTagsQuery = useQuery(
		browser && (api as any).tags?.listAllTags ? (api as any).tags.listAllTags : null,
		browser && (api as any).tags?.listAllTags ? {} : null
	);
	
	// Extract data from useQuery result (which returns {data, isLoading, error, isStale})
	const allTags = $derived(() => {
		if (allTagsQuery && typeof allTagsQuery === 'object' && 'data' in allTagsQuery) {
			return allTagsQuery.data;
		}
		return undefined;
	});

	let headerMenuOpen = $state(false);
	let selectedTagIds = $state<Id<'tags'>[]>([]);
	let tagInputRef = $state<HTMLElement | null>(null);
	let tagComboboxOpen = $state(false);


	// Track if we're in the middle of a tag mutation (to prevent race conditions)
	let isUpdatingTags = $state(false);

	// Initialize selected tags from item (when item changes or tags are loaded)
	$effect(() => {
		// Skip sync if we're in the middle of updating tags (preserve optimistic updates)
		if (isUpdatingTags) {
			return;
		}
		
		if (item?.tags && Array.isArray(item.tags) && item.tags.length > 0) {
			const tagIds = item.tags.map((tag: any) => tag._id).filter(Boolean);
			
			// Only update if the tag IDs are different (avoid infinite loops)
			const currentSorted = [...selectedTagIds].sort().join(',');
			const newSorted = [...tagIds].sort().join(',');
			
			if (currentSorted !== newSorted) {
				// Check if selectedTagIds contains tags not in item.tags (optimistic add)
				const selectedSet = new Set(selectedTagIds);
				const itemSet = new Set(tagIds);
				const hasOptimisticAdds = [...selectedSet].some(id => !itemSet.has(id));
				
				if (hasOptimisticAdds) {
					// Skip sync - selectedTagIds has optimistic updates not yet in item.tags
				} else {
					// item.tags is the source of truth (query has refreshed)
					selectedTagIds = tagIds;
				}
			}
		} else if (!item?.tags || (Array.isArray(item.tags) && item.tags.length === 0)) {
			// Don't automatically clear - might be a race condition during optimistic updates
			// Let the mutation result handle clearing when appropriate
		}
	});

	// Get highlight ID from item
	const highlightId = $derived(item?.highlight?._id);
	
	// Reset combobox state when item changes (prevents stale state)
	let lastHighlightId = $state<string | undefined>(undefined);
	$effect(() => {
		const currentHighlightId = highlightId;
		// Only reset if highlightId actually changed (not just on initial load)
		if (lastHighlightId !== undefined && currentHighlightId !== lastHighlightId) {
			tagComboboxOpen = false;
		}
		lastHighlightId = currentHighlightId;
	});

	// Available tags from query (with color) - includes tags from item if available
	// CRITICAL: This must always include ALL user tags from allTags query for global availability
	const availableTags = $derived(() => {
		const tagsData = allTags(); // Call the derived function to get the actual tags data
		const tagsMap = new Map<string, any>();
		
		// Add tags from allTags query (all user tags - should be available everywhere)
		// This is the PRIMARY source - tags should be available globally across all cards
		if (tagsData !== undefined && tagsData !== null) {
			// tagsData can be undefined (loading), null (error), or an array
			if (Array.isArray(tagsData)) {
				// Always process tagsData if it's an array (even if empty - that's fine)
				tagsData.forEach((tag: any) => {
					if (tag?._id) {
						tagsMap.set(tag._id, {
							_id: tag._id,
							displayName: tag.displayName,
							color: tag.color || DEFAULT_TAG_COLOR,
							parentId: tag.parentId,
							level: tag.level || 0,
						});
					}
				});
			}
		}
		
		// Also add tags from item.tags (in case they're not in allTags query yet - fallback only)
		// This ensures we have tags even if allTags hasn't loaded yet
		if (item?.tags && Array.isArray(item.tags)) {
			item.tags.forEach((tag: any) => {
				if (tag?._id && !tagsMap.has(tag._id)) {
					tagsMap.set(tag._id, {
						_id: tag._id,
						displayName: tag.displayName || tag.name,
						color: tag.color || DEFAULT_TAG_COLOR,
						parentId: tag.parentId,
						level: tag.level || 0,
					});
				}
			});
		}
		
		return Array.from(tagsMap.values());
	});

	async function handleTagsChange(tagIds: Id<'tags'>[]) {
		if (!highlightId || !convexClient || !assignTagsApi) return;

		// Mark that we're updating tags (prevents $effect from overwriting optimistic updates)
		isUpdatingTags = true;
		selectedTagIds = tagIds;

		try {
			await convexClient.mutation(assignTagsApi, {
				highlightId: highlightId,
				tagIds: tagIds,
			});
			
			// Reset flag after a short delay to allow query to refresh
			setTimeout(() => {
				isUpdatingTags = false;
			}, 500);
		} catch (error) {
			console.error('Failed to assign tags:', error);
			isUpdatingTags = false;
			// Revert on error
			if (item?.tags) {
				selectedTagIds = item.tags.map((tag: any) => tag._id).filter(Boolean);
			}
		}
	}

	async function handleCreateTag(
		displayName: string,
		color: string,
		parentId?: Id<'tags'>
	): Promise<Id<'tags'>> {
		if (!convexClient || !createTagApi) {
			throw new Error('Convex client not available');
		}

		try {
			const tagId = await convexClient.mutation(createTagApi, {
				displayName,
				color,
				parentId,
			});
			return tagId;
		} catch (error) {
			console.error('Failed to create tag:', error);
			throw error;
		}
	}

	// Keyboard shortcut: 'T' to focus tag selector
	function handleKeyDown(event: KeyboardEvent) {
		// Don't trigger if typing in an input/textarea
		const target = event.target as HTMLElement;
		if (
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.isContentEditable
		) {
			return;
		}

		// Check for 'T' key
		if (event.key === 't' || event.key === 'T') {
			event.preventDefault();
			// Open the combobox - TagSelector's auto-focus effect will handle focusing the input
			tagComboboxOpen = true;
		}
	}

	// Add keyboard event listener
	if (browser) {
		$effect(() => {
			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		});
	}


	async function handleSkip() {
		// Mark as processed without generating flashcard
		if (browser && convexClient && markProcessedApi && inboxItemId) {
			try {
				await convexClient.mutation(markProcessedApi, { inboxItemId: inboxItemId as any });
			} catch (error) {
				console.error('Failed to mark as processed:', error);
			}
		}
		onClose();
	}
</script>

<div class="flex flex-col h-full">
	<!-- Sticky Header - Linear Style -->
	<div
		class="sticky top-0 z-10 bg-surface border-b border-base px-inbox-header py-system-header h-system-header flex items-center justify-between flex-shrink-0"
	>
		<!-- Left: Back Button + Title -->
		<div class="flex items-center gap-icon">
			<button
				type="button"
				class="flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
				onclick={onClose}
				aria-label="Back to inbox"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				<span class="text-sm">Back</span>
			</button>
			<h2 class="text-sm font-normal text-secondary">Readwise Highlight</h2>
		</div>

		<!-- Right: Pagination + Actions Menu -->
		<div class="flex items-center gap-icon">
			<!-- Pagination Control -->
			{#if totalItems > 0 && (onNext || onPrevious)}
				<Tooltip.Provider delayDuration={300}>
					<div class="flex items-center gap-2">
						<!-- Page Counter: Current in primary, slash/total in secondary -->
						<div class="flex items-center gap-0.5">
							<span class="text-sm text-primary font-normal">{currentPosition}</span>
							<span class="text-sm text-secondary font-normal">/</span>
							<span class="text-sm text-secondary font-normal">{totalItems}</span>
						</div>
						
						<!-- Chevron Down (Next) - Primary color when enabled -->
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<button
										{...props}
										type="button"
										class="w-6 h-6 flex items-center justify-center rounded-md hover:bg-hover-solid transition-colors text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
										onclick={() => onNext?.()}
										disabled={!canNavigateNext}
										aria-label="Next item (J)"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</button>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Portal>
								<Tooltip.Content
									class="bg-elevated border border-base rounded-md shadow-lg px-3 py-1.5 flex items-center gap-2 z-50"
									side="bottom"
									sideOffset={6}
								>
									<span class="text-sm text-primary">Navigate down</span>
									<span class="px-1.5 py-0.5 rounded border border-base bg-base text-sm text-primary font-medium min-w-[1.25rem] text-center">
										J
									</span>
								</Tooltip.Content>
							</Tooltip.Portal>
						</Tooltip.Root>
						
						<!-- Chevron Up (Previous) - Secondary color when enabled -->
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<button
										{...props}
										type="button"
										class="w-6 h-6 flex items-center justify-center rounded-md hover:bg-hover-solid transition-colors text-secondary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
										onclick={() => onPrevious?.()}
										disabled={!canNavigatePrevious}
										aria-label="Previous item (K)"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 15l7-7 7 7"
											/>
										</svg>
									</button>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Portal>
								<Tooltip.Content
									class="bg-elevated border border-base rounded-md shadow-lg px-3 py-1.5 flex items-center gap-2 z-50"
									side="bottom"
									sideOffset={6}
								>
									<span class="text-sm text-primary">Navigate up</span>
									<span class="px-1.5 py-0.5 rounded border border-base bg-base text-sm text-primary font-medium min-w-[1.25rem] text-center">
										K
									</span>
								</Tooltip.Content>
							</Tooltip.Portal>
						</Tooltip.Root>
					</div>
				</Tooltip.Provider>
			{/if}
			
			<DropdownMenu.Root bind:open={headerMenuOpen}>
				<DropdownMenu.Trigger
					type="button"
					class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-hover-solid transition-colors text-secondary hover:text-primary"
					aria-label="More options"
				>
					<svg
						class="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
						/>
					</svg>
				</DropdownMenu.Trigger>

				<DropdownMenu.Portal>
					<DropdownMenu.Content
						class="bg-elevated rounded-md shadow-lg border border-base min-w-[180px] py-1 z-50"
						side="bottom"
						align="end"
						sideOffset={4}
					>

						<DropdownMenu.Item
							class="px-menu-item py-menu-item text-sm text-primary hover:bg-hover-solid cursor-pointer flex items-center justify-between focus:bg-hover-solid outline-none"
							textValue="Skip"
							onSelect={() => {
								handleSkip();
								headerMenuOpen = false;
							}}
						>
							<span class="font-normal">⏭️ Skip</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
			</DropdownMenu.Root>
		</div>
	</div>

	<!-- Two-Column Layout: Main Content + Sidebar -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Main Content Area - Hero Highlight Text -->
		<div class="flex-1 overflow-y-auto">
			<!-- Optimal reading width: 65-75 characters per line for ADHD-friendly reading -->
			<div class="max-w-readable mx-auto px-inbox-container py-inbox-container">
				<!-- Hero Highlight Text - Always Visible, Top Priority -->
				{#if item?.highlight}
					<div class="mb-16 mt-8">
						<!-- Quote-style container with subtle background and left accent -->
						<div class="relative pl-inbox-container pr-inbox-container py-readable-quote bg-surface border-l-4 border-accent-primary rounded-lg">
							<!-- Quote mark (decorative, subtle) -->
							<div class="absolute top-6 left-6 text-accent-primary opacity-10">
								<svg class="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
									<path d="M14.017 21v-7.391c0-5.522-4.477-10-10-10v-2.609c0-5.522 4.477-10 10-10h7.017v21h-7.017zm-10 0v-7.391c0-5.522-4.477-10-10-10v-2.609c0-5.522 4.477-10 10-10h7.017v21h-7.017z"/>
								</svg>
							</div>
							<!-- Highlight Text - Hero size, reading optimized for ADHD/focus-challenged -->
							<p class="text-2xl sm:text-3xl text-primary leading-readable font-normal tracking-readable relative z-10 max-w-none">
							{item.highlight.text}
						</p>
						</div>
					</div>
				{/if}

			</div>
		</div>

		<!-- Right Sidebar - Metadata & Actions -->
		<div class="w-64 border-l border-base bg-surface overflow-y-auto flex-shrink-0">
			<div class="p-inbox-container space-y-6">
				<!-- Source Info -->
				{#if item?.source}
					<div>
						<p class="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Source</p>
						<div class="space-y-1">
							<h3 class="text-sm font-semibold text-primary">{item.source.title}</h3>
							{#if item.author}
								<p class="text-xs text-secondary">by {item.author.displayName}</p>
							{:else if item.authors && item.authors.length > 0}
								<p class="text-xs text-secondary">
									by {item.authors.map((a: any) => a?.displayName).filter(Boolean).join(', ')}
								</p>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Tags -->
				{#if highlightId}
					{#if (api as any).tags?.listAllTags}
						<TagSelector
							bind:selectedTagIds
							availableTags={availableTags()}
							onTagsChange={handleTagsChange}
							onCreateTagWithColor={handleCreateTag}
							bind:tagInputRef
							bind:comboboxOpen={tagComboboxOpen}
						/>
					{:else}
						<div>
							<p class="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Tags</p>
							<p class="text-sm text-tertiary">
								Tags API not available yet. Restart Convex dev server to regenerate API.
							</p>
						</div>
					{/if}
				{:else}
					<div>
						<p class="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Tags</p>
						<p class="text-sm text-tertiary">No highlight ID available</p>
					</div>
				{/if}

				<!-- Actions (Sidebar) -->
				<div>
					<p class="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Actions</p>
					<div class="space-y-2">
						<Button.Root
							onclick={handleSkip}
							class="w-full bg-hover-solid text-secondary py-2 px-3 rounded-lg hover:bg-hover transition-all duration-150 text-sm font-medium"
						>
							⏭️ Skip
						</Button.Root>
					</div>
				</div>

				<!-- Note -->
				{#if item?.highlight?.note}
					<div>
						<p class="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Note</p>
						<p class="text-xs text-secondary leading-relaxed">{item.highlight.note}</p>
					</div>
				{/if}

				<!-- External Link -->
				{#if item?.highlight?.externalUrl}
					<div>
						<p class="text-xs font-medium text-secondary uppercase tracking-wider mb-2">Links</p>
						<a
							href={item.highlight.externalUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="text-xs text-primary hover:text-secondary flex items-center gap-icon transition-colors"
						>
							<span>View in Readwise</span>
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								/>
							</svg>
						</a>
					</div>
				{/if}

				<!-- Metadata (Collapsed by default, subtle) -->
				{#if item?.createdAt}
					<div class="pt-6 border-t border-base">
						<div class="flex flex-col gap-1">
							<span class="text-xs text-tertiary">Added {new Date(item.createdAt).toLocaleDateString()}</span>
							{#if item?._id}
								<span class="text-xs text-tertiary font-mono">ID: {item._id}</span>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
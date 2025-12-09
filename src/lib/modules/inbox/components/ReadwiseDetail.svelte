<script lang="ts">
	import { DropdownMenu, Tooltip } from 'bits-ui';
	import { Button } from '$lib/components/atoms';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';
	import { api } from '$lib/convex';
	import type { Id } from '$lib/convex';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import type { CoreModuleAPI } from '$lib/modules/core/api';
	import { DEFAULT_TAG_COLOR } from '$lib/utils/tagConstants';
	import { useTagging } from '../composables/useTagging.svelte';
	import { invariant } from '$lib/utils/invariant';
	// TODO: Re-enable when Doc type is needed
	// import type { Doc } from '$lib/convex';
	import type { FunctionReference } from 'convex/server';

	import type { ReadwiseHighlightWithDetails } from '$lib/types/convex';

	type Props = {
		inboxItemId?: string; // Inbox item ID (if using real data)
		item: ReadwiseHighlightWithDetails; // Item from findInboxItemWithDetails query (narrowed to readwise_highlight)
		onClose: () => void;
		currentIndex?: number; // Current item index (0-based)
		totalItems?: number; // Total number of items
		onNext?: () => void; // Navigate to next item
		onPrevious?: () => void; // Navigate to previous item
	};

	let {
		inboxItemId,
		item,
		onClose,
		currentIndex = -1,
		totalItems = 0,
		onNext,
		onPrevious
	}: Props = $props();

	// Derive current position (1-based for display)
	const currentPosition = $derived(currentIndex >= 0 ? currentIndex + 1 : 0);
	const canNavigateNext = $derived(onNext !== undefined && currentIndex < totalItems - 1);
	const canNavigatePrevious = $derived(onPrevious !== undefined && currentIndex > 0);

	const convexClient = browser ? useConvexClient() : null;
	const getSessionId = () => $page.data.sessionId;

	// Get core module API from context for TagSelector (enables loose coupling - see SYOS-308)
	const coreAPI = getContext<CoreModuleAPI | undefined>('core-api');
	const TagSelector = coreAPI?.TagSelector;

	const markProcessedApi = browser
		? (makeFunctionReference('inbox:updateProcessed') as FunctionReference<
				'mutation',
				'public',
				{ sessionId: string; inboxItemId: Id<'inboxItems'> },
				void
			>)
		: null;

	// Get workspace context for workspace filtering
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const activeWorkspaceId = $derived(() => workspaces?.activeWorkspaceId ?? null);

	// Initialize tagging composable (handles data fetching and tag operations)
	const tagging = useTagging({
		sessionId: getSessionId,
		activeWorkspaceId: activeWorkspaceId
	});

	let headerMenuOpen = $state(false);
	let selectedTagIds = $state<Id<'tags'>[]>([]);
	let tagInputRef = $state<HTMLElement | null>(null);
	let tagComboboxOpen = $state(false);

	// Handle Enter key to activate tag input
	$effect(() => {
		if (!browser) return;

		function handleKeyDown(event: KeyboardEvent) {
			// Only handle Enter when tag combobox is not already open
			if (tagComboboxOpen) return;

			// Check if any input is focused
			const activeElement = document.activeElement;
			const isInputFocused =
				activeElement?.tagName === 'INPUT' ||
				activeElement?.tagName === 'TEXTAREA' ||
				(activeElement instanceof HTMLElement && activeElement.isContentEditable);

			if (isInputFocused) return;

			// Handle Enter key to focus tag input
			if (event.key === 'Enter') {
				event.preventDefault();
				tagComboboxOpen = true;
				// Focus the tag input after a tick
				setTimeout(() => {
					tagInputRef?.focus();
				}, 0);
			}
		}

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Track if we're in the middle of a tag mutation (to prevent race conditions)
	let isUpdatingTags = $state(false);

	// Initialize selected tags from item (when item changes or tags are loaded)
	$effect(() => {
		// Skip sync if we're in the middle of updating tags (preserve optimistic updates)
		if (isUpdatingTags) {
			return;
		}

		if (item?.tags && Array.isArray(item.tags) && item.tags.length > 0) {
			const tagIds = item.tags.map((tag) => tag._id as Id<'tags'>).filter(Boolean) as Id<'tags'>[];

			// Only update if the tag IDs are different (avoid infinite loops)
			const currentSorted = [...selectedTagIds].sort().join(',');
			const newSorted = [...tagIds].sort().join(',');

			if (currentSorted !== newSorted) {
				// Check if selectedTagIds contains tags not in item.tags (optimistic add)
				const selectedSet = new SvelteSet(selectedTagIds);
				const itemSet = new SvelteSet(tagIds);
				const hasOptimisticAdds = [...selectedSet].some((id) => !itemSet.has(id));

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
	// Note: listAllTags returns TagWithHierarchy[] (flattened hierarchical structure)
	const availableTags = $derived(() => {
		const tagsData = tagging.allTags; // Get tags from composable
		const tagsMap = new SvelteMap<
			string,
			{ _id: Id<'tags'>; displayName: string; color: string; parentId?: Id<'tags'>; level?: number }
		>();

		// Add tags from allTags query (all user tags - should be available everywhere)
		// This is the PRIMARY source - tags should be available globally across all cards
		if (tagsData !== undefined && tagsData !== null) {
			// tagsData can be undefined (loading), null (error), or an array
			if (Array.isArray(tagsData)) {
				// Always process tagsData if it's an array (even if empty - that's fine)
				tagsData.forEach((tag) => {
					if (tag?._id) {
						tagsMap.set(tag._id, {
							_id: tag._id,
							displayName: tag.displayName,
							color: tag.color || DEFAULT_TAG_COLOR,
							parentId: tag.parentId,
							level: tag.level || 0
						});
					}
				});
			}
		}

		// Also add tags from item.tags (in case they're not in allTags query yet - fallback only)
		// This ensures we have tags even if allTags hasn't loaded yet
		// Note: item.tags may not have parentId/level (those are from TagWithHierarchy)
		if (item?.tags && Array.isArray(item.tags)) {
			item.tags.forEach((tag) => {
				if (tag?._id && !tagsMap.has(tag._id)) {
					tagsMap.set(tag._id, {
						_id: tag._id as Id<'tags'>,
						displayName: tag.displayName || tag.name,
						color: tag.color || DEFAULT_TAG_COLOR,
						parentId: (tag as { parentId?: Id<'tags'> }).parentId,
						level: (tag as { level?: number }).level || 0
					});
				}
			});
		}

		return Array.from(tagsMap.values());
	});

	async function handleTagsChange(tagIds: Id<'tags'>[]) {
		if (!highlightId) return;

		// Mark that we're updating tags (prevents $effect from overwriting optimistic updates)
		isUpdatingTags = true;
		selectedTagIds = tagIds;

		try {
			await tagging.assignTags(highlightId as Id<'highlights'>, tagIds);

			// Reset flag after a short delay to allow query to refresh
			setTimeout(() => {
				isUpdatingTags = false;
			}, 500);
		} catch (error) {
			console.error('Failed to assign tags:', error);
			isUpdatingTags = false;
			// Revert on error
			if (item?.tags) {
				selectedTagIds = item.tags
					.map((tag) => tag._id as Id<'tags'>)
					.filter(Boolean) as Id<'tags'>[];
			}
		}
	}

	async function handleCreateTag(
		displayName: string,
		color: string,
		parentId?: Id<'tags'>
	): Promise<Id<'tags'>> {
		return await tagging.createTag(displayName, color, parentId);
	}

	// Keyboard shortcut: 'T' to focus tag selector
	function handleKeyDown(event: KeyboardEvent) {
		// Don't trigger if typing in an input/textarea
		const target = event.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
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
				const sessionId = $page.data.sessionId;
				invariant(sessionId, 'Session ID is required');
				await convexClient.mutation(markProcessedApi, {
					sessionId,
					inboxItemId: inboxItemId as Id<'inboxItems'>
				});
			} catch (error) {
				console.error('Failed to mark as processed:', error);
			}
		}
		onClose();
	}
</script>

<div class="flex h-full flex-col">
	<!-- Sticky Header - Linear Style -->
	<div
		class="h-system-header border-base py-system-header sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b bg-surface"
		style="padding-inline: var(--spacing-4);"
	>
		<!-- Left: Back Button + Title -->
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={onClose} ariaLabel="Back to inbox">
				<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				<span class="text-small">Back</span>
			</Button>
			<h2 class="text-small font-normal text-secondary">Readwise Highlight</h2>
		</div>

		<!-- Right: Pagination + Actions Menu -->
		<div class="flex items-center gap-2">
			<!-- Pagination Control -->
			{#if totalItems > 0 && (onNext || onPrevious)}
				<Tooltip.Provider delayDuration={300}>
					<div class="flex items-center gap-2">
						<!-- Page Counter: Current in primary, slash/total in secondary -->
						<div class="flex items-center" style="gap: var(--spacing-1);">
							<span class="text-small font-normal text-primary">{currentPosition}</span>
							<span class="text-small font-normal text-secondary">/</span>
							<span class="text-small font-normal text-secondary">{totalItems}</span>
						</div>

						<!-- Chevron Down (Next) - Primary color when enabled -->
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										iconOnly
										ariaLabel="Next item (J)"
										onclick={() => onNext?.()}
										disabled={!canNavigateNext}
									>
										<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</Button>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Portal>
								<Tooltip.Content
									class="border-base px-inbox-card py-nav-item z-50 flex items-center gap-2 rounded-button border bg-elevated shadow-card"
									side="bottom"
									sideOffset={6}
								>
									<span class="text-small text-primary">Navigate down</span>
									<span
										class="min-w-badge border-base text-small px-badge py-badge rounded border bg-base text-center font-medium text-primary"
									>
										J
									</span>
								</Tooltip.Content>
							</Tooltip.Portal>
						</Tooltip.Root>

						<!-- Chevron Up (Previous) - Secondary color when enabled -->
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										iconOnly
										ariaLabel="Previous item (K)"
										onclick={() => onPrevious?.()}
										disabled={!canNavigatePrevious}
									>
										<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 15l7-7 7 7"
											/>
										</svg>
									</Button>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Portal>
								<Tooltip.Content
									class="border-base px-inbox-card py-nav-item z-50 flex items-center gap-2 rounded-button border bg-elevated shadow-card"
									side="bottom"
									sideOffset={6}
								>
									<span class="text-small text-primary">Navigate up</span>
									<span
										class="min-w-badge border-base text-small px-badge py-badge rounded border bg-base text-center font-medium text-primary"
									>
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
					class="icon-xl hover:bg-hover-solid flex items-center justify-center rounded-button text-secondary transition-colors hover:text-primary"
					aria-label="More options"
				>
					<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
						class="border-base min-w-dropdown py-badge z-50 rounded-button border bg-elevated shadow-card"
						side="bottom"
						align="end"
						sideOffset={4}
					>
						<DropdownMenu.Item
							class="text-small hover:bg-hover-solid focus:bg-hover-solid px-menu-item py-menu-item flex cursor-pointer items-center justify-between text-primary outline-none"
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
			<div class="px-inbox-container py-inbox-container max-w-readable mx-auto">
				<!-- Hero Highlight Text - Always Visible, Top Priority -->
				{#if item?.highlight}
					<div class="mb-marketing-content mt-content-section">
						<!-- Quote-style container with subtle background and left accent -->
						<div
							class="pr-inbox-container pl-inbox-container relative rounded-card border-l-4 border-accent-primary bg-surface"
							style="padding-block: var(--spacing-8);"
						>
							<!-- Quote mark (decorative, subtle) -->
							<div class="absolute top-6 left-6 text-accent-primary opacity-10">
								<svg style="width: 5rem; height: 5rem;" fill="currentColor" viewBox="0 0 24 24">
									<path
										d="M14.017 21v-7.391c0-5.522-4.477-10-10-10v-2.609c0-5.522 4.477-10 10-10h7.017v21h-7.017zm-10 0v-7.391c0-5.522-4.477-10-10-10v-2.609c0-5.522 4.477-10 10-10h7.017v21h-7.017z"
									/>
								</svg>
							</div>
							<!-- Highlight Text - Hero size, reading optimized for ADHD/focus-challenged -->
							<p
								class="text-h1 leading-readable tracking-readable sm:text-h1 relative z-10 max-w-none font-normal text-primary"
							>
								{item.highlight.text}
							</p>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Right Sidebar - Metadata & Actions -->
		<div class="w-sidebar-detail border-base flex-shrink-0 overflow-y-auto border-l bg-surface">
			<div class="px-inbox-container py-inbox-container gap-settings-section flex flex-col">
				<!-- Source Info -->
				{#if item?.source}
					<div>
						<p
							class="mb-marketing-text text-label font-medium tracking-wider text-secondary uppercase"
						>
							Source
						</p>
						<div class="flex flex-col" style="gap: var(--spacing-1);">
							<h3 class="text-small font-semibold text-primary">{item.source.title}</h3>
							{#if item.author}
								<p class="text-label text-secondary">by {item.author.displayName}</p>
							{:else if item.authors && item.authors.length > 0}
								<p class="text-label text-secondary">
									by {item.authors
										.map((a) => a?.displayName)
										.filter(Boolean)
										.join(', ')}
								</p>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Tags -->
				{#if highlightId}
					{#if api.tags?.listAllTags && TagSelector}
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
							<p
								class="mb-marketing-text text-label font-medium tracking-wider text-secondary uppercase"
							>
								Tags
							</p>
							<p class="text-small text-tertiary">
								Tags API not available yet. Restart Convex dev server to regenerate API.
							</p>
						</div>
					{/if}
				{:else}
					<div>
						<p
							class="mb-marketing-text text-label font-medium tracking-wider text-secondary uppercase"
						>
							Tags
						</p>
						<p class="text-small text-tertiary">No highlight ID available</p>
					</div>
				{/if}

				<!-- Actions (Sidebar) -->
				<div>
					<p
						class="mb-marketing-text text-label font-medium tracking-wider text-secondary uppercase"
					>
						Actions
					</p>
					<div class="flex flex-col gap-2">
						<Button variant="outline" onclick={handleSkip}>⏭️ Skip</Button>
					</div>
				</div>

				<!-- Note -->
				{#if item?.highlight?.note}
					<div>
						<p
							class="mb-marketing-text text-label font-medium tracking-wider text-secondary uppercase"
						>
							Note
						</p>
						<p class="text-label leading-relaxed text-secondary">{item.highlight.note}</p>
					</div>
				{/if}

				<!-- External Link -->
				{#if item?.highlight?.externalUrl}
					<div>
						<p
							class="mb-marketing-text text-label font-medium tracking-wider text-secondary uppercase"
						>
							Links
						</p>
						<a
							href={item.highlight.externalUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-2 text-label text-primary transition-colors hover:text-secondary"
						>
							<span>View in Readwise</span>
							<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					<div class="border-base pt-content-section border-t">
						<div class="flex flex-col" style="gap: var(--spacing-1);">
							<span class="text-label text-tertiary"
								>Added {new Date(item.createdAt).toLocaleDateString()}</span
							>
							{#if item?._id}
								<span class="font-code text-label text-tertiary">ID: {item._id}</span>
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

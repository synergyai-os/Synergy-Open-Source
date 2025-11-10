<script lang="ts">
	import { getContext } from 'svelte';
	import { browser } from '$app/environment';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';
	import { api } from '$lib/convex';
	import ReadwiseDetail from '$lib/components/inbox/ReadwiseDetail.svelte';
	import PhotoDetail from '$lib/components/inbox/PhotoDetail.svelte';
	import ManualDetail from '$lib/components/inbox/ManualDetail.svelte';
	import NoteDetail from '$lib/components/inbox/NoteDetail.svelte';
	import InboxCard from '$lib/components/inbox/InboxCard.svelte';
	import InboxHeader from '$lib/components/inbox/InboxHeader.svelte';
	import SyncReadwiseConfig from '$lib/components/inbox/SyncReadwiseConfig.svelte';
	import SyncProgressTracker from '$lib/components/inbox/SyncProgressTracker.svelte';
	import ResizableSplitter from '$lib/components/ResizableSplitter.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import FlashcardFAB from '$lib/components/FlashcardFAB.svelte';
	import FlashcardReviewModal from '$lib/components/inbox/FlashcardReviewModal.svelte';
	import { useInboxSync } from '$lib/composables/useInboxSync.svelte';
	import { useInboxItems } from '$lib/composables/useInboxItems.svelte';
	import { useSelectedItem } from '$lib/composables/useSelectedItem.svelte';
	import { useKeyboardNavigation } from '$lib/composables/useKeyboardNavigation.svelte';
	import { useInboxLayout } from '$lib/composables/useInboxLayout.svelte';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';

	// Get workspace context
	const organizations = getContext<UseOrganizations | undefined>('organizations');
	const activeOrganizationId = $derived(organizations?.activeOrganizationId ?? null);
	const activeTeamId = $derived(organizations?.activeTeamId ?? null);

	// Convex client setup
	const convexClient = browser ? useConvexClient() : null;
	// Store function reference in a stable variable - this ensures the reference never changes
	const inboxApi = browser
		? {
				getInboxItemWithDetails: makeFunctionReference('inbox:getInboxItemWithDetails') as any,
				syncReadwiseHighlights: makeFunctionReference('syncReadwise:syncReadwiseHighlights') as any,
				getSyncProgress: makeFunctionReference('inbox:getSyncProgress') as any
			}
		: null;

	// Initialize inbox items composable with workspace context
	// Pass functions to ensure reactive updates when organization/team changes
	const items = useInboxItems({
		activeOrganizationId: () => activeOrganizationId,
		activeTeamId: () => activeTeamId
	});

	// Initialize selected item composable
	const selected = useSelectedItem(convexClient, inboxApi);

	// Track whether auto-selection should run when items are available
	const autoSelectState = $state({ enabled: true });

	function selectItem(itemId: string) {
		autoSelectState.enabled = true;
		selected.selectItem(itemId);
	}

	function clearSelection(options?: { allowAutoSelect?: boolean }) {
		autoSelectState.enabled = options?.allowAutoSelect ?? false;
		selected.clearSelection();
	}

	// Initialize keyboard navigation composable
	// Pass functions that return reactive values so composable always has current state
	const keyboard = useKeyboardNavigation(
		() => items.filteredItems,
		() => selected.selectedItemId,
		(itemId) => selectItem(itemId)
	);

	// Initialize layout composable
	const layout = useInboxLayout();

	// Get sidebar state from parent layout
	const sidebarContext = getContext<{
		sidebarCollapsed: boolean;
		isMobile: boolean;
		onSidebarToggle: () => void;
	}>('sidebar');

	// Initialize sync composable
	// Note: onItemsReload is no longer needed - useQuery automatically updates when items are added
	const sync = useInboxSync(
		convexClient,
		inboxApi,
		undefined, // onItemsReload not needed - useQuery handles reactivity automatically
		() => clearSelection()
	);

	// Automatically select the first inbox item when none is active
	$effect(() => {
		if (!browser || !autoSelectState.enabled) {
			return;
		}

		if (sync.showSyncConfig || sync.syncProgress || sync.isSyncing) {
			return;
		}

		const currentItems = items.filteredItems;
		if (currentItems.length === 0) {
			return;
		}

		const selectedId = selected.selectedItemId;
		const hasSelectedInList = selectedId
			? currentItems.some((item) => item._id === selectedId)
			: false;

		if (hasSelectedInList) {
			return;
		}

		selectItem(currentItems[0]._id);
	});

	// Derive sidebar state from context
	const sidebarCollapsed = $derived(sidebarContext?.sidebarCollapsed ?? false);
	const isMobile = $derived(sidebarContext?.isMobile ?? false);

	// Selected item logic is now provided by selected composable
	// Keyboard navigation logic is now provided by keyboard composable

	// setFilter is now provided by items composable

	// Header actions
	function handleDeleteAll() {
		console.log('Delete all clicked');
		// TODO: Implement delete all functionality
	}

	function handleDeleteAllRead() {
		console.log('Delete all read clicked');
		// TODO: Implement delete all read functionality
	}

	function handleDeleteAllCompleted() {
		console.log('Delete all completed clicked');
		// TODO: Implement delete all completed functionality
	}

	function handleSortClick() {
		console.log('Sort clicked');
		// TODO: Implement sort menu
	}

	// Flashcard generation state
	let showReviewModal = $state(false);
	let isGenerating = $state(false);
	let generatedFlashcards = $state<Array<{ question: string; answer: string }>>([]);
	let generationError = $state<string | null>(null);
	const sourceContext = $derived(
		!selected.selectedItem
			? undefined
			: selected.selectedItem.type === 'readwise_highlight'
				? (selected.selectedItem as any).source?.title ||
					(selected.selectedItem as any).sourceData?.bookTitle ||
					'Unknown Source'
				: 'Inbox Item'
	);

	// Get text content from selected item
	const sourceText = $derived(() => {
		if (!selected.selectedItem) return '';

		if (selected.selectedItem.type === 'readwise_highlight') {
			const item = selected.selectedItem as any;
			return item.highlight?.text || item.sourceData?.highlightText || '';
		} else if (selected.selectedItem.type === 'manual_text') {
			const item = selected.selectedItem as any;
			return item.text || '';
		} else if (selected.selectedItem.type === 'photo_note') {
			const item = selected.selectedItem as any;
			return item.transcribedText || '';
		}
		return '';
	});

	// Get source metadata for prompt context
	const sourceMetadata = $derived(() => {
		if (!selected.selectedItem) return { title: undefined, author: undefined };

		if (selected.selectedItem.type === 'readwise_highlight') {
			const item = selected.selectedItem as any;
			return {
				title: item.source?.title || item.sourceData?.bookTitle || undefined,
				author: item.author?.displayName || item.sourceData?.author || undefined
			};
		}

		return { title: undefined, author: undefined };
	});

	async function handleGenerateFlashcards() {
		if (!selected.selectedItemId || !selected.selectedItem || !convexClient) return;

		isGenerating = true;
		generationError = null;

		try {
			const text = sourceText();
			if (!text || text.trim().length === 0) {
				throw new Error('No text content available to generate flashcards from');
			}

			// Get source metadata for prompt context
			const metadata = sourceMetadata();

			// Call AI generation with source context
			const result = await convexClient.action(api.flashcards.generateFlashcard, {
				text: text.trim(),
				sourceTitle: metadata.title,
				sourceAuthor: metadata.author
			});

			if (!result.success || !result.flashcards || result.flashcards.length === 0) {
				throw new Error('No flashcards generated');
			}

			generatedFlashcards = result.flashcards;
			showReviewModal = true;
		} catch (error) {
			console.error('Error generating flashcards:', error);
			generationError = error instanceof Error ? error.message : 'Failed to generate flashcards';
		} finally {
			isGenerating = false;
		}
	}

	async function handleApproveAll() {
		if (!convexClient || !selected.selectedItemId) return;

		try {
			// Save all flashcards to database
			const flashcardIds = await convexClient.mutation(api.flashcards.createFlashcards, {
				flashcards: generatedFlashcards,
				sourceInboxItemId: selected.selectedItemId as any,
				sourceType: selected.selectedItem?.type
			});

			// Mark inbox item as processed
			if (selected.selectedItemId) {
				await convexClient.mutation(api.inbox.markProcessed, {
					inboxItemId: selected.selectedItemId as any
				});
			}

			showReviewModal = false;
			generatedFlashcards = [];
		} catch (error) {
			console.error('Error saving flashcards:', error);
			generationError = error instanceof Error ? error.message : 'Failed to save flashcards';
		}
	}

	async function handleApproveSelected(cards: Array<{ question: string; answer: string }>) {
		if (!convexClient || !selected.selectedItemId) return;

		try {
			// Save selected flashcards to database (with any edits applied)
			const flashcardIds = await convexClient.mutation(api.flashcards.createFlashcards, {
				flashcards: cards,
				sourceInboxItemId: selected.selectedItemId as any,
				sourceType: selected.selectedItem?.type
			});

			// Mark inbox item as processed
			if (selected.selectedItemId) {
				await convexClient.mutation(api.inbox.markProcessed, {
					inboxItemId: selected.selectedItemId as any
				});
			}

			showReviewModal = false;
			generatedFlashcards = [];
			generationError = null;
		} catch (error) {
			console.error('Error saving flashcards:', error);
			generationError = error instanceof Error ? error.message : 'Failed to save flashcards';
		}
	}

	function handleRejectAll() {
		showReviewModal = false;
		generatedFlashcards = [];
		generationError = null;
	}

	function handleCloseModal() {
		showReviewModal = false;
		generatedFlashcards = [];
		generationError = null;
	}
</script>

<div class="flex h-full overflow-hidden">
	<!-- Desktop: 3-column layout -->
	{#if !isMobile}
		<!-- Middle Column - Inbox List -->
		<ResizableSplitter
			initialWidth={layout.inboxWidth}
			minWidth={200}
			maxWidth={600}
			onWidthChange={layout.handleInboxWidthChange}
			onClose={layout.handleClose}
		>
			<div class="flex h-full flex-col overflow-hidden border-r border-base bg-surface">
				<!-- Sticky Header -->
				<InboxHeader
					currentFilter={items.filterType}
					onFilterChange={(type) =>
						items.setFilter(type, () => clearSelection({ allowAutoSelect: true }))}
					onDeleteAll={handleDeleteAll}
					onDeleteAllRead={handleDeleteAllRead}
					onDeleteAllCompleted={handleDeleteAllCompleted}
					onSortClick={handleSortClick}
					onSync={sync.handleSyncClick}
					isSyncing={sync.isSyncing}
					{sidebarCollapsed}
					onSidebarToggle={sidebarContext?.onSidebarToggle}
					{isMobile}
					inboxCount={items.filteredItems.length}
				/>

				<!-- Inbox Items List - Scrollable -->
				<div class="flex-1 overflow-y-auto">
					<div class="p-inbox-container">
						{#if items.isLoading}
							<!-- Loading State -->
							<Loading message="Loading inbox items..." />
						{:else if items.queryError}
							<!-- Error State -->
							<div class="py-readable-quote text-center">
								<p class="text-error mb-4">
									Failed to load inbox items: {items.queryError.toString()}
								</p>
								<button
									type="button"
									onclick={() => window.location.reload()}
									class="rounded-md bg-accent-primary px-4 py-2 text-white transition-colors hover:bg-accent-hover"
								>
									Reload Page
								</button>
							</div>
						{:else if items.filteredItems.length === 0}
							<!-- Empty State -->
							<div class="py-readable-quote text-center">
								<p class="mb-4 text-secondary">No items in inbox.</p>
								<button
									type="button"
									onclick={sync.handleSyncClick}
									disabled={sync.isSyncing}
									class="rounded-md bg-accent-primary px-4 py-2 text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
								>
									{sync.isSyncing ? 'Syncing...' : 'Sync Readwise Highlights'}
								</button>
								{#if sync.syncError}
									<p class="text-error mt-2 text-sm">{sync.syncError}</p>
								{/if}
								{#if sync.syncSuccess}
									<p class="text-success mt-2 text-sm">Sync completed successfully!</p>
								{/if}
							</div>
						{:else}
							<!-- Items List -->
							<div class="flex flex-col gap-inbox-list">
								{#each items.filteredItems as item}
									<InboxCard
										{item}
										selected={selected.selectedItemId === item._id}
										onClick={() => selectItem(item._id)}
									/>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</ResizableSplitter>

		<!-- Right Panel - Detail View -->
		<div class="relative flex-1 overflow-y-auto bg-elevated">
			{#if selected.selectedItem && selected.selectedItemId}
				<!-- Dynamic detail view based on type -->
				<!-- Key on selectedItem._id ensures remount only when actual data changes (prevents stale data) -->
				{#key selected.selectedItem._id}
					{#if selected.selectedItem.type === 'readwise_highlight'}
						<ReadwiseDetail
							inboxItemId={selected.selectedItemId}
							item={selected.selectedItem}
							onClose={() => clearSelection()}
							currentIndex={keyboard.getCurrentItemIndex()}
							totalItems={items.filteredItems.length}
							onNext={keyboard.handleNextItem}
							onPrevious={keyboard.handlePreviousItem}
						/>
					{:else if selected.selectedItem.type === 'photo_note'}
						<PhotoDetail item={selected.selectedItem} onClose={() => clearSelection()} />
					{:else if selected.selectedItem.type === 'manual_text'}
						<ManualDetail item={selected.selectedItem} onClose={() => clearSelection()} />
					{/if}
				{/key}

				<!-- Flashcard FAB - Centered at bottom of detail view -->
				{#if browser}
					<FlashcardFAB
						selectedItemId={selected.selectedItemId}
						{isGenerating}
						onClick={handleGenerateFlashcards}
					/>
					{#if generationError}
						<div
							class="absolute bottom-24 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-md bg-red-600 px-menu-item py-menu-item text-center text-sm text-white shadow-lg"
						>
							{generationError}
						</div>
					{/if}
				{/if}
			{:else if sync.showSyncConfig}
				<!-- Sync Config Panel -->
				<SyncReadwiseConfig onImport={sync.handleImport} onCancel={sync.handleCancelSync} />
			{:else if sync.syncProgress}
				<!-- Progress Tracker -->
				<SyncProgressTracker
					step={sync.syncProgress.step}
					current={sync.syncProgress.current}
					total={sync.syncProgress.total}
					message={sync.syncProgress.message}
					onCancel={sync.handleCancelSync}
				/>
			{:else}
				<!-- Empty state -->
				<div class="p-inbox-container py-12 text-center">
					<div class="mb-4 text-6xl">📮</div>
					<p class="text-secondary">Select an item to view details</p>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Mobile: List OR Detail (not both) -->
		{#if selected.selectedItemId}
			<!-- Mobile Detail View - Full Screen -->
			<div class="relative h-full w-full flex-1 overflow-y-auto bg-elevated">
				{#if selected.selectedItem}
					<!-- Key on selectedItem._id ensures remount only when actual data changes (prevents stale data) -->
					{#key selected.selectedItem._id}
						{#if selected.selectedItem.type === 'readwise_highlight'}
							<ReadwiseDetail item={selected.selectedItem} onClose={() => clearSelection()} />
						{:else if selected.selectedItem.type === 'photo_note'}
							<PhotoDetail item={selected.selectedItem} onClose={() => clearSelection()} />
						{:else if selected.selectedItem.type === 'manual_text'}
							<ManualDetail item={selected.selectedItem} onClose={() => clearSelection()} />
						{/if}
					{/key}

					<!-- Flashcard FAB - Centered at bottom of detail view -->
					{#if browser}
						<FlashcardFAB
							selectedItemId={selected.selectedItemId}
							{isGenerating}
							onClick={handleGenerateFlashcards}
						/>
						{#if generationError}
							<div
								class="absolute bottom-24 left-1/2 z-50 max-w-md -translate-x-1/2 rounded-md bg-red-600 px-menu-item py-menu-item text-center text-sm text-white shadow-lg"
							>
								{generationError}
							</div>
						{/if}
					{/if}
				{/if}
			</div>
		{:else}
			<!-- Mobile List View - Full Screen -->
			<div class="flex h-full flex-1 flex-col overflow-hidden bg-surface">
				<!-- Sticky Header -->
				<InboxHeader
					currentFilter={items.filterType}
					onFilterChange={(type) =>
						items.setFilter(type, () => clearSelection({ allowAutoSelect: true }))}
					onDeleteAll={handleDeleteAll}
					onDeleteAllRead={handleDeleteAllRead}
					onDeleteAllCompleted={handleDeleteAllCompleted}
					onSortClick={handleSortClick}
					onSync={sync.handleSyncClick}
					isSyncing={sync.isSyncing}
					{sidebarCollapsed}
					onSidebarToggle={sidebarContext?.onSidebarToggle}
					{isMobile}
					inboxCount={items.filteredItems.length}
				/>

				<!-- Inbox Items List - Scrollable -->
				<div class="flex-1 overflow-y-auto">
					<div class="p-inbox-container">
						{#if items.isLoading}
							<!-- Loading State -->
							<Loading message="Loading inbox items..." />
						{:else if items.queryError}
							<!-- Error State -->
							<div class="py-readable-quote text-center">
								<p class="text-error mb-4">
									Failed to load inbox items: {items.queryError.toString()}
								</p>
								<button
									type="button"
									onclick={() => window.location.reload()}
									class="rounded-md bg-accent-primary px-4 py-2 text-white transition-colors hover:bg-accent-hover"
								>
									Reload Page
								</button>
							</div>
						{:else if items.filteredItems.length === 0}
							<!-- Empty State -->
							<div class="py-readable-quote text-center">
								<p class="mb-4 text-secondary">No items in inbox.</p>
								<button
									type="button"
									onclick={sync.handleSyncClick}
									disabled={sync.isSyncing}
									class="rounded-md bg-accent-primary px-4 py-2 text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
								>
									{sync.isSyncing ? 'Syncing...' : 'Sync Readwise Highlights'}
								</button>
								{#if sync.syncError}
									<p class="text-error mt-2 text-sm">{sync.syncError}</p>
								{/if}
								{#if sync.syncSuccess}
									<p class="text-success mt-2 text-sm">Sync completed successfully!</p>
								{/if}
							</div>
						{:else}
							<!-- Items List -->
							<div class="flex flex-col gap-inbox-list">
								{#each items.filteredItems as item}
									<InboxCard {item} selected={false} onClick={() => selectItem(item._id)} />
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	{/if}

	<!-- Flashcard Review Modal (client-side only) -->
	{#if browser}
		<FlashcardReviewModal
			open={showReviewModal}
			flashcards={generatedFlashcards}
			{sourceContext}
			onClose={handleCloseModal}
			onApproveAll={handleApproveAll}
			onApproveSelected={handleApproveSelected}
			onRejectAll={handleRejectAll}
		/>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>

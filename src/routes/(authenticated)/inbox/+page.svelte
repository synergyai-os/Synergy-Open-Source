<script lang="ts">
	import { getContext } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { replaceState } from '$app/navigation';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';
	import { api } from '$lib/convex';
	import ReadwiseDetail from '$lib/modules/inbox/components/ReadwiseDetail.svelte';
	import PhotoDetail from '$lib/modules/inbox/components/PhotoDetail.svelte';
	import ManualDetail from '$lib/modules/inbox/components/ManualDetail.svelte';
	import NoteDetail from '$lib/modules/inbox/components/NoteDetail.svelte';
	import InboxCard from '$lib/modules/inbox/components/InboxCard.svelte';
	import InboxHeader from '$lib/modules/inbox/components/InboxHeader.svelte';
	import SyncReadwiseConfig from '$lib/modules/inbox/components/SyncReadwiseConfig.svelte';
	import SyncProgressTracker from '$lib/modules/inbox/components/SyncProgressTracker.svelte';
	import ResizableSplitter from '$lib/components/organisms/ResizableSplitter.svelte';
	import Loading from '$lib/components/atoms/Loading.svelte';
	import FlashcardFAB from '$lib/modules/flashcards/components/FlashcardFAB.svelte';
	import FlashcardReviewModal from '$lib/modules/inbox/components/FlashcardReviewModal.svelte';
	import { useInboxSync } from '$lib/modules/inbox/composables/useInboxSync.svelte';
	import { useInboxItems } from '$lib/modules/inbox/composables/useInboxItems.svelte';
	import { useSelectedItem } from '$lib/modules/inbox/composables/useSelectedItem.svelte';
	import { useKeyboardNavigation } from '$lib/modules/inbox/composables/useKeyboardNavigation.svelte';
	import { useInboxLayout } from '$lib/modules/inbox/composables/useInboxLayout.svelte';
	import type { OrganizationsModuleAPI } from '$lib/modules/core/organizations/composables/useOrganizations.svelte';
	import type { FunctionReference } from 'convex/server';
	import type { Id } from '$lib/convex';
	import type { InboxItemWithDetails } from '$lib/types/convex';

	// Get sessionId from page data (provided by authenticated layout)
	const getSessionId = () => $page.data.sessionId;

	// Get workspace context (functions for reactivity)
	const organizations = getContext<OrganizationsModuleAPI | undefined>('organizations');
	const activeOrganizationId = () => organizations?.activeOrganizationId ?? null;
	// Circle context not yet implemented in organizations module
	const activeCircleId = () => null;

	// Convex client setup
	const convexClient = browser ? useConvexClient() : null;
	// Store function reference in a stable variable - this ensures the reference never changes
	// Use FunctionReference type assertions to avoid circular API type references

	const inboxApi = browser
		? {
				getInboxItemWithDetails: makeFunctionReference(
					'inbox:getInboxItemWithDetails'
				) as FunctionReference<
					'query',
					'public',
					{ sessionId: string; inboxItemId: Id<'inboxItems'> },
					InboxItemWithDetails | null
				>,
				syncReadwiseHighlights: makeFunctionReference(
					'syncReadwise:syncReadwiseHighlights'
				) as FunctionReference<
					'action',
					'public',
					{
						sessionId: string;
						dateRange?: '7d' | '30d' | '90d' | '180d' | '365d' | 'all';
						customStartDate?: string;
						customEndDate?: string;
						quantity?: 5 | 10 | 25 | 50 | 100 | 250 | 500 | 1000;
					},
					{
						success: boolean;
						sourcesCount: number;
						highlightsCount: number;
						newCount: number;
						skippedCount: number;
						errorsCount: number;
					}
				>,
				getSyncProgress: makeFunctionReference('inbox:getSyncProgress') as FunctionReference<
					'query',
					'public',
					{ sessionId: string },
					{ step: string; current: number; total?: number; message?: string } | null
				>
			}
		: null;

	// Initialize inbox items composable with workspace context
	const items = useInboxItems({
		sessionId: getSessionId, // Required for session validation - function ensures reactivity
		activeOrganizationId: activeOrganizationId, // Pass function for reactivity
		activeCircleId: activeCircleId // Pass function for reactivity
	});

	// Initialize selected item composable
	const selected = useSelectedItem(convexClient, inboxApi, getSessionId);

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

	// Check for linked account success message
	const showLinkedSuccess = $derived($page.url.searchParams.get('linked') === '1');
	let linkedSuccessTimeout: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (showLinkedSuccess && browser) {
			// Auto-dismiss after 5 seconds
			linkedSuccessTimeout = setTimeout(() => {
				const url = new URL(window.location.href);
				url.searchParams.delete('linked');
				replaceState(url.pathname + url.search, {});
			}, 5000);
		}

		return () => {
			if (linkedSuccessTimeout) {
				clearTimeout(linkedSuccessTimeout);
			}
		};
	});

	// Initialize sync composable
	// Note: onItemsReload is no longer needed - useQuery automatically updates when items are added
	const sync = useInboxSync(
		convexClient,
		inboxApi,
		getSessionId, // Required for session validation
		undefined, // onItemsReload not needed - useQuery handles reactivity automatically
		() => clearSelection()
	);

	// Create local $derived values to ensure proper dependency tracking
	// Accessing getters that return $derived values in $effect can miss dependency tracking
	// Creating local $derived values ensures Svelte tracks the underlying reactive dependencies
	const itemsLoading = $derived(items.isLoading);
	const itemsList = $derived(items.filteredItems);
	const syncConfigVisible = $derived(sync.showSyncConfig);
	const syncProgressState = $derived(sync.syncProgress);
	const syncInProgress = $derived(sync.isSyncing);

	// Derived values for selected item to ensure template reactivity
	const selectedItemId = $derived(selected.selectedItemId);
	const selectedItem = $derived(selected.selectedItem);
	const hasSelectedItem = $derived(selectedItem && selectedItemId);

	// Automatically select the first inbox item when none is active
	$effect(() => {
		if (!browser || !autoSelectState.enabled) {
			return;
		}

		// Access local $derived values to ensure dependency tracking
		// These $derived values track the getters, which track the underlying reactive state
		const isLoading = itemsLoading;
		const currentItems = itemsList;
		const showSyncConfig = syncConfigVisible;
		const syncProgress = syncProgressState;
		const isSyncing = syncInProgress;

		// Don't auto-select if sync UI is showing or syncing
		if (showSyncConfig || syncProgress || isSyncing) {
			return;
		}

		// Wait for items to finish loading
		if (isLoading) {
			return;
		}

		if (currentItems.length === 0) {
			return;
		}

		// Access derived value to ensure reactivity
		const currentSelectedId = selectedItemId;

		// If no item selected, or selected item not in current list, select first item
		if (!currentSelectedId || !currentItems.some((item) => item._id === currentSelectedId)) {
			selectItem(currentItems[0]._id);
		}
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
				? (selected.selectedItem as InboxItemWithDetails & { type: 'readwise_highlight' }).source
						?.title || 'Unknown Source'
				: 'Inbox Item'
	);

	// Get text content from selected item
	const sourceText = $derived(() => {
		if (!selected.selectedItem) return '';

		if (selected.selectedItem.type === 'readwise_highlight') {
			const item = selected.selectedItem as InboxItemWithDetails & { type: 'readwise_highlight' };
			return item.highlight?.text || '';
		} else if (selected.selectedItem.type === 'manual_text') {
			const item = selected.selectedItem as InboxItemWithDetails & { type: 'manual_text' };
			return item.text || '';
		} else if (selected.selectedItem.type === 'photo_note') {
			const item = selected.selectedItem as InboxItemWithDetails & { type: 'photo_note' };
			return (item as { transcribedText?: string }).transcribedText || '';
		}
		return '';
	});

	// Get source metadata for prompt context
	const sourceMetadata = $derived(() => {
		if (!selected.selectedItem) return { title: undefined, author: undefined };

		if (selected.selectedItem.type === 'readwise_highlight') {
			const item = selected.selectedItem as InboxItemWithDetails & { type: 'readwise_highlight' };
			return {
				title: item.source?.title || undefined,
				author: item.author?.displayName || undefined
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

			// Get sessionId for authenticated request
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			// Call AI generation with source context
			const result = await convexClient.action(api.flashcards.generateFlashcard, {
				sessionId,
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
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			// Save all flashcards to database
			const _flashcardIds = await convexClient.mutation(api.flashcards.createFlashcards, {
				sessionId,
				flashcards: generatedFlashcards,
				sourceInboxItemId: selected.selectedItemId as Id<'inboxItems'>,
				sourceType: selected.selectedItem?.type
			});

			// Mark inbox item as processed
			if (selected.selectedItemId) {
				const sessionId = getSessionId();
				if (!sessionId) {
					throw new Error('Session ID is required');
				}

				await convexClient.mutation(api.inbox.markProcessed, {
					sessionId,
					inboxItemId: selected.selectedItemId as Id<'inboxItems'>
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
			const sessionId = getSessionId();
			if (!sessionId) {
				throw new Error('Session ID is required');
			}

			// Save selected flashcards to database (with any edits applied)
			const _flashcardIds = await convexClient.mutation(api.flashcards.createFlashcards, {
				sessionId,
				flashcards: cards,
				sourceInboxItemId: selected.selectedItemId as Id<'inboxItems'>,
				sourceType: selected.selectedItem?.type
			});

			// Mark inbox item as processed
			if (selected.selectedItemId) {
				const sessionId = getSessionId();
				if (!sessionId) {
					throw new Error('Session ID is required');
				}

				await convexClient.mutation(api.inbox.markProcessed, {
					sessionId,
					inboxItemId: selected.selectedItemId as Id<'inboxItems'>
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
	<!-- Success message for linked account -->
	{#if showLinkedSuccess}
		<div
			class="fixed top-content-section right-content-section z-50 flex items-center gap-icon rounded-card border border-accent-primary bg-elevated px-button-x py-inbox-card shadow-card"
		>
			<svg
				class="icon-md flex-shrink-0 text-accent-primary"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span class="text-small font-medium text-primary"
				>Account linked successfully! You can now switch between your accounts.</span
			>
			<button
				onclick={() => {
					const url = new URL(window.location.href);
					url.searchParams.delete('linked');
					replaceState(url.pathname + url.search, {});
				}}
				class="ml-icon text-secondary transition-colors hover:text-primary"
				aria-label="Dismiss"
			>
				<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	{/if}

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
					<div class="px-inbox-container py-inbox-container">
						{#if items.isLoading}
							<!-- Loading State -->
							<Loading message="Loading inbox items..." />
						{:else if items.queryError}
							<!-- Error State -->
							<div class="py-readable-quote text-center">
								<p class="mb-content-section text-error">
									Failed to load inbox items: {items.queryError.toString()}
								</p>
								<button
									type="button"
									onclick={() => window.location.reload()}
									class="rounded-button bg-accent-primary px-button-x py-button-y text-primary transition-colors hover:bg-accent-hover"
								>
									Reload Page
								</button>
							</div>
						{:else if items.filteredItems.length === 0}
							<!-- Empty State -->
							<div class="py-readable-quote text-center">
								<p class="mb-content-section text-secondary">No items in inbox.</p>
								<button
									type="button"
									onclick={sync.handleSyncClick}
									disabled={sync.isSyncing}
									class="rounded-button bg-accent-primary px-button-x py-button-y text-primary transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
								>
									{sync.isSyncing ? 'Syncing...' : 'Sync Readwise Highlights'}
								</button>
								{#if sync.syncError}
									<p class="mt-marketing-text text-small text-error">{sync.syncError}</p>
								{/if}
								{#if sync.syncSuccess}
									<p class="mt-marketing-text text-small text-success">
										Sync completed successfully!
									</p>
								{/if}
							</div>
						{:else}
							<!-- Items List -->
							<div class="flex flex-col gap-inbox-list">
								{#each items.filteredItems as item (item._id)}
									<InboxCard
										{item}
										selected={selectedItemId === item._id}
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
			{#if hasSelectedItem && selectedItem}
				<!-- Dynamic detail view based on type -->
				<!-- Key on selectedItem._id ensures remount only when actual data changes (prevents stale data) -->
				{#key selectedItem._id}
					{#if selectedItem.type === 'readwise_highlight'}
						<ReadwiseDetail
							inboxItemId={selectedItemId ?? undefined}
							item={selectedItem}
							onClose={() => clearSelection()}
							currentIndex={keyboard.getCurrentItemIndex()}
							totalItems={items.filteredItems.length}
							onNext={keyboard.handleNextItem}
							onPrevious={keyboard.handlePreviousItem}
						/>
					{:else if selectedItem.type === 'note'}
						<NoteDetail inboxItem={selectedItem} onClose={() => clearSelection()} />
					{:else if selectedItem.type === 'photo_note'}
						<PhotoDetail item={selectedItem} onClose={() => clearSelection()} />
					{:else if selectedItem.type === 'manual_text'}
						<ManualDetail item={selectedItem} onClose={() => clearSelection()} />
					{/if}
				{/key}

				<!-- Flashcard FAB - Only show for Readwise-synced highlights (not manual highlights) -->
				{#if browser && selectedItem?.type === 'readwise_highlight' && selectedItem?.highlight?.lastSyncedAt}
					<FlashcardFAB {selectedItemId} {isGenerating} onClick={handleGenerateFlashcards} />
					{#if generationError}
						<div
							class="absolute bottom-content-padding left-1/2 z-50 max-w-md -translate-x-1/2 rounded-button bg-error px-menu-item py-menu-item text-center text-small text-primary shadow-card"
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
				<div class="px-inbox-container py-readable-quote text-center">
					<div class="mb-content-section text-h1">📮</div>
					<p class="text-secondary">Select an item to view details</p>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Mobile: List OR Detail (not both) -->
		{#if selectedItemId}
			<!-- Mobile Detail View - Full Screen -->
			<div class="relative h-full w-full flex-1 overflow-y-auto bg-elevated">
				{#if selectedItem}
					<!-- Key on selectedItem._id ensures remount only when actual data changes (prevents stale data) -->
					{#key selectedItem._id}
						{#if selectedItem.type === 'readwise_highlight'}
							<ReadwiseDetail item={selectedItem} onClose={() => clearSelection()} />
						{:else if selectedItem.type === 'note'}
							<NoteDetail inboxItem={selectedItem} onClose={() => clearSelection()} />
						{:else if selectedItem.type === 'photo_note'}
							<PhotoDetail item={selectedItem} onClose={() => clearSelection()} />
						{:else if selectedItem.type === 'manual_text'}
							<ManualDetail item={selectedItem} onClose={() => clearSelection()} />
						{/if}
					{/key}

					<!-- Flashcard FAB - Only show for Readwise-synced highlights (not manual highlights) -->
					{#if browser && selectedItem?.type === 'readwise_highlight' && selectedItem?.highlight?.lastSyncedAt}
						<FlashcardFAB {selectedItemId} {isGenerating} onClick={handleGenerateFlashcards} />
						{#if generationError}
							<div
								class="absolute bottom-content-padding left-1/2 z-50 max-w-md -translate-x-1/2 rounded-button bg-error px-menu-item py-menu-item text-center text-small text-primary shadow-card"
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
					<div class="px-inbox-container py-inbox-container">
						{#if items.isLoading}
							<!-- Loading State -->
							<Loading message="Loading inbox items..." />
						{:else if items.queryError}
							<!-- Error State -->
							<div class="py-readable-quote text-center">
								<p class="mb-content-section text-error">
									Failed to load inbox items: {items.queryError.toString()}
								</p>
								<button
									type="button"
									onclick={() => window.location.reload()}
									class="rounded-button bg-accent-primary px-button-x py-button-y text-primary transition-colors hover:bg-accent-hover"
								>
									Reload Page
								</button>
							</div>
						{:else if items.filteredItems.length === 0}
							<!-- Empty State -->
							<div class="py-readable-quote text-center">
								<p class="mb-content-section text-secondary">No items in inbox.</p>
								<button
									type="button"
									onclick={sync.handleSyncClick}
									disabled={sync.isSyncing}
									class="rounded-button bg-accent-primary px-button-x py-button-y text-primary transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
								>
									{sync.isSyncing ? 'Syncing...' : 'Sync Readwise Highlights'}
								</button>
								{#if sync.syncError}
									<p class="mt-marketing-text text-small text-error">{sync.syncError}</p>
								{/if}
								{#if sync.syncSuccess}
									<p class="mt-marketing-text text-small text-success">
										Sync completed successfully!
									</p>
								{/if}
							</div>
						{:else}
							<!-- Items List -->
							<div class="flex flex-col gap-inbox-list">
								{#each items.filteredItems as item (item._id)}
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

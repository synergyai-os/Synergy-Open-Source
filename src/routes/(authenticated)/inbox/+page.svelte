<script lang="ts">
	import { getContext } from 'svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';
	import ReadwiseDetail from '$lib/components/inbox/ReadwiseDetail.svelte';
	import PhotoDetail from '$lib/components/inbox/PhotoDetail.svelte';
	import ManualDetail from '$lib/components/inbox/ManualDetail.svelte';
	import InboxCard from '$lib/components/inbox/InboxCard.svelte';
	import InboxHeader from '$lib/components/inbox/InboxHeader.svelte';
	import SyncReadwiseConfig from '$lib/components/inbox/SyncReadwiseConfig.svelte';
	import SyncProgressTracker from '$lib/components/inbox/SyncProgressTracker.svelte';
	import ResizableSplitter from '$lib/components/ResizableSplitter.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { useInboxSync } from '$lib/composables/useInboxSync.svelte';
	import { useInboxItems } from '$lib/composables/useInboxItems.svelte';

	// Convex client setup
	const convexClient = browser ? useConvexClient() : null;
	// Store function reference in a stable variable - this ensures the reference never changes
	const inboxApi = browser ? {
		getInboxItemWithDetails: makeFunctionReference('inbox:getInboxItemWithDetails') as any,
		syncReadwiseHighlights: makeFunctionReference('syncReadwise:syncReadwiseHighlights') as any,
		getSyncProgress: makeFunctionReference('inbox:getSyncProgress') as any,
	} : null;
	
	// Initialize inbox items composable
	const items = useInboxItems();

	// Navigate through inbox items (for keyboard navigation)
	function navigateItems(direction: 'up' | 'down') {
		if (items.filteredItems.length === 0) return;
		
		const currentIndex = selectedItemId 
			? items.filteredItems.findIndex(item => item._id === selectedItemId)
			: -1;
		
		let newIndex: number;
		
		if (currentIndex === -1) {
			// No item selected, select first or last
			newIndex = direction === 'down' ? 0 : items.filteredItems.length - 1;
		} else {
			// Move up or down
			if (direction === 'down') {
				newIndex = currentIndex < items.filteredItems.length - 1 ? currentIndex + 1 : 0; // Wrap to start
			} else {
				newIndex = currentIndex > 0 ? currentIndex - 1 : items.filteredItems.length - 1; // Wrap to end
			}
		}
		
		const newItem = items.filteredItems[newIndex];
		if (newItem) {
			// Clear any active hover states by blurring all items first
			document.querySelectorAll('[data-inbox-item-id]').forEach((el) => {
				if (el instanceof HTMLElement) {
					el.blur();
				}
			});
			
			selectItem(newItem._id);
			// Scroll item into view
			setTimeout(() => {
				const itemElement = document.querySelector(`[data-inbox-item-id="${newItem._id}"]`);
				itemElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}, 0);
		}
	}

	onMount(() => {
		// Keyboard navigation (J/K for down/up)
		function handleKeyDown(event: KeyboardEvent) {
			// Ignore if user is typing in input/textarea
			const activeElement = document.activeElement;
			const isInputFocused = activeElement?.tagName === 'INPUT' || 
			                      activeElement?.tagName === 'TEXTAREA' ||
			                      (activeElement instanceof HTMLElement && activeElement.isContentEditable);
			
			if (isInputFocused) return;
			
			// Handle J (down/next) and K (up/previous)
			if (event.key === 'j' || event.key === 'J') {
				event.preventDefault();
				navigateItems('down');
			} else if (event.key === 'k' || event.key === 'K') {
				event.preventDefault();
				navigateItems('up');
			}
		}
		
		window.addEventListener('keydown', handleKeyDown);
		
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Get sidebar state from parent layout
	const sidebarContext = getContext<{
		sidebarCollapsed: boolean;
		isMobile: boolean;
		onSidebarToggle: () => void;
	}>('sidebar');

	// UI State
	let selectedItemId = $state<string | null>(null);
	let inboxWidth = $state(400);

	// Initialize sync composable
	// Note: onItemsReload is no longer needed - useQuery automatically updates when items are added
	const sync = useInboxSync(
		convexClient,
		inboxApi,
		undefined, // onItemsReload not needed - useQuery handles reactivity automatically
		() => {
			selectedItemId = null;
		}
	);

	// Derive sidebar state from context
	const sidebarCollapsed = $derived(sidebarContext?.sidebarCollapsed ?? false);
	const isMobile = $derived(sidebarContext?.isMobile ?? false);

	// Initialize from localStorage or defaults
	function handleInboxWidthChange(width: number) {
		inboxWidth = width;
		if (typeof window !== 'undefined') {
			localStorage.setItem('inboxWidth', width.toString());
		}
	}

	// Initialize inbox width from localStorage
	$effect(() => {
		if (typeof window !== 'undefined') {
			const savedInboxWidth = parseInt(localStorage.getItem('inboxWidth') || '400');
			inboxWidth = savedInboxWidth;
		}
	});

	// Load selected item details with proper cleanup to prevent race conditions
	// Uses query tracking to ignore stale results when selectedItemId changes
	let selectedItem = $state<any>(null);
	let currentQueryId: string | null = null;

	$effect(() => {
		if (!browser || !convexClient || !inboxApi || !selectedItemId) {
			selectedItem = null;
			currentQueryId = null;
			return;
		}

		// Generate unique ID for this query
		const queryId = selectedItemId;
		currentQueryId = queryId;

		// Load item details
		convexClient
			.query(inboxApi.getInboxItemWithDetails, { inboxItemId: selectedItemId })
			.then((result) => {
				// Only update if this is still the current query (prevent race conditions)
				if (currentQueryId === queryId) {
					selectedItem = result;
				}
			})
			.catch((error) => {
				// Only handle error if this is still the current query
				if (currentQueryId === queryId) {
					console.error('Failed to load item details:', error);
					selectedItem = null;
				}
			});

		// Cleanup function: mark query as stale when effect re-runs or component unmounts
		return () => {
			if (currentQueryId === queryId) {
				currentQueryId = null;
			}
		};
	});

	// filteredItems is now provided by items composable

	// Actions
	function selectItem(itemId: string) {
		console.log('selectItem called with:', itemId);
		selectedItemId = itemId as any; // itemId is _id from InboxCard
		console.log('selectedItemId set to:', selectedItemId);
	}
	
	// Navigation helpers for detail view
	function getCurrentItemIndex(): number {
		if (!selectedItemId || items.filteredItems.length === 0) return -1;
		return items.filteredItems.findIndex(item => item._id === selectedItemId);
	}
	
	function handleNextItem() {
		navigateItems('down');
	}
	
	function handlePreviousItem() {
		navigateItems('up');
	}

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
</script>

<div class="h-full flex overflow-hidden">
	<!-- Desktop: 3-column layout -->
	{#if !isMobile}
		<!-- Middle Column - Inbox List -->
		<ResizableSplitter
			initialWidth={inboxWidth}
			minWidth={200}
			maxWidth={600}
			onWidthChange={handleInboxWidthChange}
			onClose={() => (inboxWidth = 175)}
		>
			<div class="bg-surface h-full flex flex-col overflow-hidden border-r border-base">
				<!-- Sticky Header -->
				<InboxHeader
					currentFilter={items.filterType}
					onFilterChange={(type) => items.setFilter(type, () => { selectedItemId = null; })}
					onDeleteAll={handleDeleteAll}
					onDeleteAllRead={handleDeleteAllRead}
					onDeleteAllCompleted={handleDeleteAllCompleted}
					onSortClick={handleSortClick}
					onSync={sync.handleSyncClick}
					isSyncing={sync.isSyncing}
					sidebarCollapsed={sidebarCollapsed}
					onSidebarToggle={sidebarContext?.onSidebarToggle}
					isMobile={isMobile}
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
							<div class="text-center py-readable-quote">
								<p class="text-error mb-4">Failed to load inbox items: {items.queryError.toString()}</p>
								<button
									type="button"
									onclick={() => window.location.reload()}
									class="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover transition-colors"
								>
									Reload Page
								</button>
							</div>
						{:else if items.filteredItems.length === 0}
							<!-- Empty State -->
							<div class="text-center py-readable-quote">
								<p class="text-secondary mb-4">No items in inbox.</p>
								<button
									type="button"
									onclick={sync.handleSyncClick}
									disabled={sync.isSyncing}
									class="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{sync.isSyncing ? 'Syncing...' : 'Sync Readwise Highlights'}
								</button>
								{#if sync.syncError}
									<p class="text-error text-sm mt-2">{sync.syncError}</p>
								{/if}
								{#if sync.syncSuccess}
									<p class="text-success text-sm mt-2">Sync completed successfully!</p>
								{/if}
							</div>
						{:else}
							<!-- Items List -->
							<div class="flex flex-col gap-inbox-list">
								{#each items.filteredItems as item}
									<InboxCard
										item={item}
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
		<div class="flex-1 bg-elevated overflow-y-auto">
			{#if selectedItem && selectedItemId}
				<!-- Dynamic detail view based on type -->
				<!-- Key on selectedItem._id ensures remount only when actual data changes (prevents stale data) -->
				{#key selectedItem._id}
					{#if selectedItem.type === 'readwise_highlight'}
						<ReadwiseDetail
							inboxItemId={selectedItemId}
							item={selectedItem}
							onClose={() => (selectedItemId = null)}
							currentIndex={getCurrentItemIndex()}
							totalItems={items.filteredItems.length}
							onNext={handleNextItem}
							onPrevious={handlePreviousItem}
						/>
					{:else if selectedItem.type === 'photo_note'}
						<PhotoDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
					{:else if selectedItem.type === 'manual_text'}
						<ManualDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
					{/if}
				{/key}
			{:else if sync.showSyncConfig}
				<!-- Sync Config Panel -->
				<SyncReadwiseConfig
					onImport={sync.handleImport}
					onCancel={sync.handleCancelSync}
				/>
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
				<div class="p-inbox-container text-center py-12">
					<div class="text-6xl mb-4">📮</div>
					<p class="text-secondary">Select an item to view details</p>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Mobile: List OR Detail (not both) -->
		{#if selectedItemId}
			<!-- Mobile Detail View - Full Screen -->
			<div class="flex-1 bg-elevated overflow-y-auto h-full w-full">
				{#if selectedItem}
					<!-- Key on selectedItem._id ensures remount only when actual data changes (prevents stale data) -->
					{#key selectedItem._id}
						{#if selectedItem.type === 'readwise_highlight'}
							<ReadwiseDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
						{:else if selectedItem.type === 'photo_note'}
							<PhotoDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
						{:else if selectedItem.type === 'manual_text'}
							<ManualDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
						{/if}
					{/key}
				{/if}
			</div>
		{:else}
			<!-- Mobile List View - Full Screen -->
			<div class="flex-1 bg-surface h-full flex flex-col overflow-hidden">
				<!-- Sticky Header -->
				<InboxHeader
					currentFilter={items.filterType}
					onFilterChange={(type) => items.setFilter(type, () => { selectedItemId = null; })}
					onDeleteAll={handleDeleteAll}
					onDeleteAllRead={handleDeleteAllRead}
					onDeleteAllCompleted={handleDeleteAllCompleted}
					onSortClick={handleSortClick}
					onSync={sync.handleSyncClick}
					isSyncing={sync.isSyncing}
					sidebarCollapsed={sidebarCollapsed}
					onSidebarToggle={sidebarContext?.onSidebarToggle}
					isMobile={isMobile}
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
							<div class="text-center py-readable-quote">
								<p class="text-error mb-4">Failed to load inbox items: {items.queryError.toString()}</p>
								<button
									type="button"
									onclick={() => window.location.reload()}
									class="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover transition-colors"
								>
									Reload Page
								</button>
							</div>
						{:else if items.filteredItems.length === 0}
							<!-- Empty State -->
							<div class="text-center py-readable-quote">
								<p class="text-secondary mb-4">No items in inbox.</p>
								<button
									type="button"
									onclick={sync.handleSyncClick}
									disabled={sync.isSyncing}
									class="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{sync.isSyncing ? 'Syncing...' : 'Sync Readwise Highlights'}
								</button>
								{#if sync.syncError}
									<p class="text-error text-sm mt-2">{sync.syncError}</p>
								{/if}
								{#if sync.syncSuccess}
									<p class="text-success text-sm mt-2">Sync completed successfully!</p>
								{/if}
							</div>
						{:else}
							<!-- Items List -->
							<div class="flex flex-col gap-inbox-list">
								{#each items.filteredItems as item}
									<InboxCard
										item={item}
										selected={false}
										onClick={() => selectItem(item._id)}
									/>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>


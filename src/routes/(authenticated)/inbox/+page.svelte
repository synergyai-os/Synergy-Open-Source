<script lang="ts">
	import { getContext } from 'svelte';
	import { browser } from '$app/environment';
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
	import { useSelectedItem } from '$lib/composables/useSelectedItem.svelte';
	import { useKeyboardNavigation } from '$lib/composables/useKeyboardNavigation.svelte';

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

	// Initialize selected item composable
	const selected = useSelectedItem(convexClient, inboxApi);

	// Initialize keyboard navigation composable
	// Pass functions that return reactive values so composable always has current state
	const keyboard = useKeyboardNavigation(
		() => items.filteredItems,
		() => selected.selectedItemId,
		(itemId) => selected.selectItem(itemId)
	);

	// Get sidebar state from parent layout
	const sidebarContext = getContext<{
		sidebarCollapsed: boolean;
		isMobile: boolean;
		onSidebarToggle: () => void;
	}>('sidebar');

	// UI State
	let inboxWidth = $state(400);

	// Initialize sync composable
	// Note: onItemsReload is no longer needed - useQuery automatically updates when items are added
	const sync = useInboxSync(
		convexClient,
		inboxApi,
		undefined, // onItemsReload not needed - useQuery handles reactivity automatically
		selected.clearSelection
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
					onFilterChange={(type) => items.setFilter(type, selected.clearSelection)}
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
										selected={selected.selectedItemId === item._id}
										onClick={() => selected.selectItem(item._id)}
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
			{#if selected.selectedItem && selected.selectedItemId}
				<!-- Dynamic detail view based on type -->
				<!-- Key on selectedItem._id ensures remount only when actual data changes (prevents stale data) -->
				{#key selected.selectedItem._id}
					{#if selected.selectedItem.type === 'readwise_highlight'}
						<ReadwiseDetail
							inboxItemId={selected.selectedItemId}
							item={selected.selectedItem}
							onClose={selected.clearSelection}
							currentIndex={keyboard.getCurrentItemIndex()}
							totalItems={items.filteredItems.length}
							onNext={keyboard.handleNextItem}
							onPrevious={keyboard.handlePreviousItem}
						/>
					{:else if selected.selectedItem.type === 'photo_note'}
						<PhotoDetail item={selected.selectedItem} onClose={selected.clearSelection} />
					{:else if selected.selectedItem.type === 'manual_text'}
						<ManualDetail item={selected.selectedItem} onClose={selected.clearSelection} />
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
		{#if selected.selectedItemId}
			<!-- Mobile Detail View - Full Screen -->
			<div class="flex-1 bg-elevated overflow-y-auto h-full w-full">
				{#if selected.selectedItem}
					<!-- Key on selectedItem._id ensures remount only when actual data changes (prevents stale data) -->
					{#key selected.selectedItem._id}
						{#if selected.selectedItem.type === 'readwise_highlight'}
							<ReadwiseDetail item={selected.selectedItem} onClose={selected.clearSelection} />
						{:else if selected.selectedItem.type === 'photo_note'}
							<PhotoDetail item={selected.selectedItem} onClose={selected.clearSelection} />
						{:else if selected.selectedItem.type === 'manual_text'}
							<ManualDetail item={selected.selectedItem} onClose={selected.clearSelection} />
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
					onFilterChange={(type) => items.setFilter(type, selected.clearSelection)}
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
										onClick={() => selected.selectItem(item._id)}
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


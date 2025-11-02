<script lang="ts">
	import { getContext } from 'svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { useConvexClient } from 'convex-svelte';
	import { makeFunctionReference } from 'convex/server';
	import { api } from '$lib/convex';
	import ReadwiseDetail from '$lib/components/inbox/ReadwiseDetail.svelte';
	import PhotoDetail from '$lib/components/inbox/PhotoDetail.svelte';
	import ManualDetail from '$lib/components/inbox/ManualDetail.svelte';
	import InboxCard from '$lib/components/inbox/InboxCard.svelte';
	import InboxHeader from '$lib/components/inbox/InboxHeader.svelte';
	import ResizableSplitter from '$lib/components/ResizableSplitter.svelte';

	type InboxItemType = 'readwise_highlight' | 'photo_note' | 'manual_text';

	// Convex client setup
	const convexClient = browser ? useConvexClient() : null;
	const inboxApi = browser ? {
		listInboxItems: makeFunctionReference('inbox:listInboxItems') as any,
		getInboxItemWithDetails: makeFunctionReference('inbox:getInboxItemWithDetails') as any,
		syncReadwiseHighlights: makeFunctionReference('syncReadwise:syncReadwiseHighlights') as any,
	} : null;

	// Fetch inbox items from Convex
	let filterType = $state<InboxItemType | 'all'>('all');
	let inboxItems = $state<any[]>([]);
	let isLoading = $state(true);

	// Sync state
	let isSyncing = $state(false);
	let syncError = $state<string | null>(null);
	let syncSuccess = $state(false);

	// Load inbox items
	const loadItems = async () => {
		if (!browser || !convexClient || !inboxApi) return;

		try {
			const result = await convexClient.query(
				inboxApi.listInboxItems,
				filterType === 'all' ? { processed: false } : { filterType, processed: false }
			);
			inboxItems = result || [];
			isLoading = false;
		} catch (error) {
			console.error('Failed to load inbox items:', error);
			isLoading = false;
		}
	};

	onMount(() => {
		loadItems();
	});

	// Reload when filter changes  
	$effect(() => {
		// Access filterType to track it
		const currentFilter = filterType;
		if (browser) {
			loadItems();
		}
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

	// Selected item details
	let selectedItem = $state<any>(null);

	// Load selected item details
	$effect(() => {
		if (!browser || !convexClient || !inboxApi || !selectedItemId) {
			selectedItem = null;
			return;
		}

		convexClient.query(inboxApi.getInboxItemWithDetails, { inboxItemId: selectedItemId })
			.then((result) => {
				selectedItem = result;
			})
			.catch((error) => {
				console.error('Failed to load item details:', error);
				selectedItem = null;
			});
	});

	const filteredItems = $derived(inboxItems || []);

	// Actions
	function selectItem(itemId: string) {
		selectedItemId = itemId as any; // itemId is _id from InboxCard
	}

	function setFilter(type: InboxItemType | 'all') {
		filterType = type;
		// Clear selection when changing filters
		selectedItemId = null;
	}

	async function handleSync() {
		if (!browser || !convexClient || !inboxApi) return;

		isSyncing = true;
		syncError = null;
		syncSuccess = false;

		try {
			await convexClient.action(inboxApi.syncReadwiseHighlights, {});
			syncSuccess = true;
			// Reload inbox items after successful sync
			await loadItems();
			// Clear success message after 3 seconds
			setTimeout(() => {
				syncSuccess = false;
			}, 3000);
		} catch (error) {
			syncError = error instanceof Error ? error.message : 'Failed to sync';
		} finally {
			isSyncing = false;
		}
	}

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
			<div class="bg-surface h-full flex flex-col overflow-hidden">
				<!-- Sticky Header -->
				<InboxHeader
					currentFilter={filterType}
					onFilterChange={setFilter}
					onDeleteAll={handleDeleteAll}
					onDeleteAllRead={handleDeleteAllRead}
					onDeleteAllCompleted={handleDeleteAllCompleted}
					onSortClick={handleSortClick}
					sidebarCollapsed={sidebarCollapsed}
					onSidebarToggle={sidebarContext?.onSidebarToggle}
					isMobile={isMobile}
				/>

				<!-- Inbox Items List - Scrollable -->
				<div class="flex-1 overflow-y-auto">
					<div class="p-inbox-container">
						<div class="flex flex-col gap-inbox-list">
							{#each filteredItems as item}
								<InboxCard
									item={item}
									selected={selectedItemId === item._id}
									onClick={() => selectItem(item._id)}
								/>
							{/each}
						</div>

						{#if filteredItems.length === 0}
							<div class="text-center py-12 px-6">
								<p class="text-tertiary mb-4">No items in inbox.</p>
								<button
									type="button"
									onclick={handleSync}
									disabled={isSyncing}
									class="px-4 py-2 bg-primary text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{isSyncing ? 'Syncing...' : 'Sync Readwise Highlights'}
								</button>
								{#if syncError}
									<p class="text-error text-sm mt-2">{syncError}</p>
								{/if}
								{#if syncSuccess}
									<p class="text-success text-sm mt-2">Sync completed successfully!</p>
								{/if}
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
				{#if selectedItem.type === 'readwise_highlight'}
					<ReadwiseDetail
						inboxItemId={selectedItemId}
						item={selectedItem}
						onClose={() => (selectedItemId = null)}
					/>
				{:else if selectedItem.type === 'photo_note'}
					<PhotoDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
				{:else if selectedItem.type === 'manual_text'}
					<ManualDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
				{/if}
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
					{#if selectedItem.type === 'readwise_highlight'}
						<ReadwiseDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
					{:else if selectedItem.type === 'photo_note'}
						<PhotoDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
					{:else if selectedItem.type === 'manual_text'}
						<ManualDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
					{/if}
				{/if}
			</div>
		{:else}
			<!-- Mobile List View - Full Screen -->
			<div class="flex-1 bg-surface h-full flex flex-col overflow-hidden">
				<!-- Sticky Header -->
				<InboxHeader
					currentFilter={filterType}
					onFilterChange={setFilter}
					onDeleteAll={handleDeleteAll}
					onDeleteAllRead={handleDeleteAllRead}
					onDeleteAllCompleted={handleDeleteAllCompleted}
					onSortClick={handleSortClick}
					sidebarCollapsed={sidebarCollapsed}
					onSidebarToggle={sidebarContext?.onSidebarToggle}
					isMobile={isMobile}
				/>

				<!-- Inbox Items List - Scrollable -->
				<div class="flex-1 overflow-y-auto">
					<div class="p-inbox-container">
						<div class="flex flex-col gap-inbox-list">
							{#each filteredItems as item}
								<InboxCard
									item={item}
									selected={false}
									onClick={() => selectItem(item.id)}
								/>
							{/each}
						</div>

						{#if filteredItems.length === 0}
							<div class="text-center py-12 px-6">
								<p class="text-tertiary mb-4">No items in inbox.</p>
								<button
									type="button"
									onclick={handleSync}
									disabled={isSyncing}
									class="px-4 py-2 bg-primary text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{isSyncing ? 'Syncing...' : 'Sync Readwise Highlights'}
								</button>
								{#if syncError}
									<p class="text-error text-sm mt-2">{syncError}</p>
								{/if}
								{#if syncSuccess}
									<p class="text-success text-sm mt-2">Sync completed successfully!</p>
								{/if}
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


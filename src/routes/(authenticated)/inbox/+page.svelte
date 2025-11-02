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
	import SyncReadwiseConfig from '$lib/components/inbox/SyncReadwiseConfig.svelte';
	import SyncProgressTracker from '$lib/components/inbox/SyncProgressTracker.svelte';
	import ResizableSplitter from '$lib/components/ResizableSplitter.svelte';
	import { addActivity, updateActivity, removeActivity } from '$lib/stores/activityTracker.svelte';

	type InboxItemType = 'readwise_highlight' | 'photo_note' | 'manual_text';

	// Convex client setup
	const convexClient = browser ? useConvexClient() : null;
	const inboxApi = browser ? {
		listInboxItems: makeFunctionReference('inbox:listInboxItems') as any,
		getInboxItemWithDetails: makeFunctionReference('inbox:getInboxItemWithDetails') as any,
		syncReadwiseHighlights: makeFunctionReference('syncReadwise:syncReadwiseHighlights') as any,
		getSyncProgress: makeFunctionReference('inbox:getSyncProgress') as any,
	} : null;

	// Fetch inbox items from Convex
	let filterType = $state<InboxItemType | 'all'>('all');
	let inboxItems = $state<any[]>([]);
	let isLoading = $state(true);

	// Sync state
	let isSyncing = $state(false);
	let syncError = $state<string | null>(null);
	let syncSuccess = $state(false);
	let showSyncConfig = $state(false);
	let syncProgress = $state<{ step: string; current: number; total?: number; message?: string } | null>(null);
	let progressPollInterval: ReturnType<typeof setInterval> | null = null;
	let syncActivityId: string | null = null; // Track activity ID for global tracker

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

	// Navigate through inbox items (for keyboard navigation)
	function navigateItems(direction: 'up' | 'down') {
		if (filteredItems.length === 0) return;
		
		const currentIndex = selectedItemId 
			? filteredItems.findIndex(item => item._id === selectedItemId || item.id === selectedItemId)
			: -1;
		
		let newIndex: number;
		
		if (currentIndex === -1) {
			// No item selected, select first or last
			newIndex = direction === 'down' ? 0 : filteredItems.length - 1;
		} else {
			// Move up or down
			if (direction === 'down') {
				newIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0; // Wrap to start
			} else {
				newIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1; // Wrap to end
			}
		}
		
		const newItem = filteredItems[newIndex];
		if (newItem) {
			// Clear any active hover states by blurring all items first
			document.querySelectorAll('[data-inbox-item-id]').forEach((el) => {
				if (el instanceof HTMLElement) {
					el.blur();
				}
			});
			
			selectItem(newItem._id || newItem.id);
			// Scroll item into view
			setTimeout(() => {
				const itemElement = document.querySelector(`[data-inbox-item-id="${newItem._id || newItem.id}"]`);
				itemElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}, 0);
		}
	}

	onMount(() => {
		loadItems();
		
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

		console.log('Loading item details for:', selectedItemId);
		convexClient.query(inboxApi.getInboxItemWithDetails, { inboxItemId: selectedItemId })
			.then((result) => {
				console.log('Item details loaded:', result);
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
		console.log('selectItem called with:', itemId);
		selectedItemId = itemId as any; // itemId is _id from InboxCard
		console.log('selectedItemId set to:', selectedItemId);
	}
	
	// Navigation helpers for detail view
	function getCurrentItemIndex(): number {
		if (!selectedItemId || filteredItems.length === 0) return -1;
		return filteredItems.findIndex(item => item._id === selectedItemId || item.id === selectedItemId);
	}
	
	function handleNextItem() {
		navigateItems('down');
	}
	
	function handlePreviousItem() {
		navigateItems('up');
	}

	function setFilter(type: InboxItemType | 'all') {
		filterType = type;
		// Clear selection when changing filters
		selectedItemId = null;
	}

	function handleSyncClick() {
		// Show config panel instead of directly syncing
		showSyncConfig = true;
		selectedItemId = null; // Clear selection to show config panel
	}

	// Poll for sync progress
	const pollSyncProgress = async () => {
		if (!browser || !convexClient || !inboxApi) return;
		
		try {
			const progress = await convexClient.query(inboxApi.getSyncProgress, {});
			if (progress) {
				syncProgress = progress;
				
				// Update global tracker if activity exists
				if (syncActivityId) {
					updateActivity(syncActivityId, {
						status: 'running',
						progress: {
							step: progress.step,
							current: progress.current,
							total: progress.total,
							message: progress.message
						}
					});
				}
			} else {
				// Progress cleared = sync completed
				if (syncProgress) {
					syncSuccess = true;
					await loadItems();
					
					// Update global tracker to completed
					if (syncActivityId) {
						updateActivity(syncActivityId, {
							status: 'completed',
							progress: undefined
						});
						
						// Auto-dismiss after delay
						setTimeout(() => {
							if (syncActivityId) {
								removeActivity(syncActivityId);
								syncActivityId = null;
							}
						}, 3000);
					}
					
					setTimeout(() => {
						syncProgress = null;
						syncSuccess = false;
						isSyncing = false;
						if (progressPollInterval) {
							clearInterval(progressPollInterval);
							progressPollInterval = null;
						}
					}, 2000);
				}
			}
		} catch (error) {
			console.error('Failed to poll sync progress:', error);
			
			// Update global tracker on error
			if (syncActivityId) {
				updateActivity(syncActivityId, {
					status: 'error',
					progress: {
						message: error instanceof Error ? error.message : 'Failed to sync'
					}
				});
			}
		}
	};

	async function handleImport(options: {
		dateRange?: '7d' | '30d' | '90d' | '180d' | '365d' | 'all';
		quantity?: 5 | 10 | 25 | 50 | 100 | 250 | 500 | 1000;
		customStartDate?: string;
		customEndDate?: string;
	}) {
		if (!browser || !convexClient || !inboxApi) return;

		showSyncConfig = false;
		isSyncing = true;
		syncError = null;
		syncSuccess = false;

		// Clear any existing poll interval
		if (progressPollInterval) {
			clearInterval(progressPollInterval);
			progressPollInterval = null;
		}
		
		// Clear any existing activity
		if (syncActivityId) {
			removeActivity(syncActivityId);
			syncActivityId = null;
		}

		// Add activity to global tracker
		syncActivityId = addActivity({
			id: `sync-readwise-${Date.now()}`,
			type: 'sync',
			status: 'running',
			metadata: {
				source: 'readwise',
				operation: 'import'
			},
			progress: {
				step: 'Starting sync...',
				current: 0,
				indeterminate: true
			},
			quickActions: [
				{
					label: 'View Inbox',
					action: () => {
						// Will be handled by dismiss, navigation can happen on dismiss
					}
				}
			],
			onCancel: () => {
				handleCancelSync();
			},
			autoDismiss: true,
			dismissAfter: 5000
		});

		// Start polling for progress updates (every 500ms)
		progressPollInterval = setInterval(pollSyncProgress, 500);
		// Poll immediately
		pollSyncProgress();

		try {
			const result = await convexClient.action(inboxApi.syncReadwiseHighlights, options);
			
			// Final poll to ensure we get the completion state
			await pollSyncProgress();
			
			// Show friendly message if nothing new was imported (quantity-based)
			if (options.quantity && result?.newCount === 0 && result?.skippedCount > 0) {
				syncError = null;
				syncSuccess = true;
				syncProgress = {
					step: 'Already imported',
					current: result.skippedCount,
					total: result.skippedCount,
					message: `All ${result.skippedCount} highlights are already in your inbox. No new items imported.`,
				};
				
				// Update global tracker
				if (syncActivityId) {
					updateActivity(syncActivityId, {
						status: 'completed',
						progress: {
							step: 'Already imported',
							current: result.skippedCount,
							total: result.skippedCount,
							message: `All ${result.skippedCount} highlights are already in your inbox.`
						}
					});
				}
				
				// Reload inbox items
				await loadItems();
				
				// Clear progress after 4 seconds
				setTimeout(() => {
					syncProgress = null;
					syncSuccess = false;
					isSyncing = false;
					if (progressPollInterval) {
						clearInterval(progressPollInterval);
						progressPollInterval = null;
					}
					if (syncActivityId) {
						removeActivity(syncActivityId);
						syncActivityId = null;
					}
				}, 4000);
			} else if (result?.newCount === 0 && result?.skippedCount === 0) {
				// Nothing at all was found/processed
				syncError = null;
				syncSuccess = false;
				syncProgress = null;
				isSyncing = false;
				
				// Update global tracker
				if (syncActivityId) {
					updateActivity(syncActivityId, {
						status: 'completed',
						progress: {
							message: 'No new items to import'
						}
					});
					setTimeout(() => {
						if (syncActivityId) {
							removeActivity(syncActivityId);
							syncActivityId = null;
						}
					}, 3000);
				}
			} else {
				// New items imported
				syncSuccess = true;
				
				// Update global tracker with success message
				if (syncActivityId && result) {
					updateActivity(syncActivityId, {
						status: 'completed',
						progress: {
							message: result.newCount > 0 
								? `Imported ${result.newCount} new highlight${result.newCount === 1 ? '' : 's'}`
								: 'Sync completed'
						}
					});
				}
				
				// Reload inbox items after successful sync
				await loadItems();
				
				// Clear progress after 2 seconds
				setTimeout(() => {
					syncProgress = null;
					syncSuccess = false;
					isSyncing = false;
					if (progressPollInterval) {
						clearInterval(progressPollInterval);
						progressPollInterval = null;
					}
					if (syncActivityId) {
						removeActivity(syncActivityId);
						syncActivityId = null;
					}
				}, 2000);
			}
		} catch (error) {
			syncError = error instanceof Error ? error.message : 'Failed to sync';
			syncProgress = null;
			isSyncing = false;
			
			// Update global tracker with error
			if (syncActivityId) {
				updateActivity(syncActivityId, {
					status: 'error',
					progress: {
						message: syncError
					}
				});
				
				// Keep error visible longer
				setTimeout(() => {
					if (syncActivityId) {
						removeActivity(syncActivityId);
						syncActivityId = null;
					}
				}, 5000);
			}
			
			if (progressPollInterval) {
				clearInterval(progressPollInterval);
				progressPollInterval = null;
			}
		}
	}

	function handleCancelSync() {
		showSyncConfig = false;
		syncProgress = null;
		isSyncing = false;
		syncError = null;
		
		// Remove activity from global tracker
		if (syncActivityId) {
			updateActivity(syncActivityId, {
				status: 'cancelled'
			});
			setTimeout(() => {
				if (syncActivityId) {
					removeActivity(syncActivityId);
					syncActivityId = null;
				}
			}, 1000);
		}
		
		if (progressPollInterval) {
			clearInterval(progressPollInterval);
			progressPollInterval = null;
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
			<div class="bg-surface h-full flex flex-col overflow-hidden border-r border-base">
				<!-- Sticky Header -->
				<InboxHeader
					currentFilter={filterType}
					onFilterChange={setFilter}
					onDeleteAll={handleDeleteAll}
					onDeleteAllRead={handleDeleteAllRead}
					onDeleteAllCompleted={handleDeleteAllCompleted}
					onSortClick={handleSortClick}
					onSync={handleSyncClick}
					isSyncing={isSyncing}
					sidebarCollapsed={sidebarCollapsed}
					onSidebarToggle={sidebarContext?.onSidebarToggle}
					isMobile={isMobile}
					inboxCount={filteredItems.length}
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
									onclick={handleSyncClick}
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
						currentIndex={getCurrentItemIndex()}
						totalItems={filteredItems.length}
						onNext={handleNextItem}
						onPrevious={handlePreviousItem}
					/>
				{:else if selectedItem.type === 'photo_note'}
					<PhotoDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
				{:else if selectedItem.type === 'manual_text'}
					<ManualDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
				{/if}
			{:else if showSyncConfig}
				<!-- Sync Config Panel -->
				<SyncReadwiseConfig
					onImport={handleImport}
					onCancel={handleCancelSync}
				/>
			{:else if syncProgress}
				<!-- Progress Tracker -->
				<SyncProgressTracker
					step={syncProgress.step}
					current={syncProgress.current}
					total={syncProgress.total}
					message={syncProgress.message}
					onCancel={handleCancelSync}
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
					onSync={handleSyncClick}
					isSyncing={isSyncing}
					sidebarCollapsed={sidebarCollapsed}
					onSidebarToggle={sidebarContext?.onSidebarToggle}
					isMobile={isMobile}
					inboxCount={filteredItems.length}
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
									onclick={handleSyncClick}
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


<script lang="ts">
	import ReadwiseDetail from '$lib/components/inbox/ReadwiseDetail.svelte';
	import PhotoDetail from '$lib/components/inbox/PhotoDetail.svelte';
	import ManualDetail from '$lib/components/inbox/ManualDetail.svelte';
	import InboxCard from '$lib/components/inbox/InboxCard.svelte';
	import InboxHeader from '$lib/components/inbox/InboxHeader.svelte';
	import ResizableSplitter from '$lib/components/ResizableSplitter.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	type InboxItemType = 'readwise_highlight' | 'photo_note' | 'manual_text';

	type InboxItem = {
		id: string;
		type: InboxItemType;
		title: string;
		snippet: string;
		sourceData: any; // Type-specific fields
		tags: string[];
		createdAt: Date;
		processed: boolean;
	};

	// Mock data for testing the UI
	const mockInboxItems: InboxItem[] = $state([
		{
			id: '1',
			type: 'readwise_highlight',
			title: 'Build-Measure-Learn Cycle',
			snippet: 'Build-Measure-Learn is the fundamental cycle...',
			tags: ['product', 'startup', 'lean'],
			createdAt: new Date('2024-01-15'),
			processed: false,
			sourceData: {
				bookTitle: 'The Lean Startup',
				author: 'Eric Ries',
				highlightText:
					'Build-Measure-Learn is the fundamental cycle for building products. Start with an MVP, measure customer behavior, and learn what works.',
				readwiseTags: ['Product Development', 'Innovation'],
				note: 'This connects directly to our sprint process'
			}
		},
		{
			id: '2',
			type: 'photo_note',
			title: 'Dual-Track Agile Diagram',
			snippet: 'Discovery track runs parallel to delivery...',
			tags: ['workshop', 'product-discovery', 'agile'],
			createdAt: new Date('2024-01-20'),
			processed: false,
			sourceData: {
				imageUrl: '/api/placeholder/400/300',
				transcribedText:
					'In dual-track agile, the discovery track runs parallel to the delivery track. Discovery focuses on understanding user needs and validating solutions before building.',
				source: 'Product Discovery Workshop'
			}
		},
		{
			id: '3',
			type: 'manual_text',
			title: 'Product Champion Traits',
			snippet: 'Champions combine empathy, vision, and execution...',
			tags: ['leadership', 'product-management'],
			createdAt: new Date('2024-02-01'),
			processed: false,
			sourceData: {
				text: 'Product champions combine deep user empathy, clear product vision, and relentless execution. They bridge the gap between what users need and what we can build.',
				bookTitle: 'Personal Notes',
				pageNumber: null
			}
		},
		{
			id: '4',
			type: 'readwise_highlight',
			title: 'Continuous Discovery',
			snippet: 'Talk to users every week, even if it feels uncomfortable...',
			tags: ['discovery', 'research', 'user-interviews'],
			createdAt: new Date('2024-02-10'),
			processed: false,
			sourceData: {
				bookTitle: 'Continuous Discovery Habits',
				author: 'Teresa Torres',
				highlightText:
					'Talk to at least one customer every week, even when it feels uncomfortable or you think you already know the answer.',
				readwiseTags: ['User Research', 'Product Discovery']
			}
		},
		{
			id: '5',
			type: 'readwise_highlight',
			title: 'The Power of Why',
			snippet: 'Understanding the "why" behind user behavior...',
			tags: ['psychology', 'user-research'],
			createdAt: new Date('2024-02-15'),
			processed: false,
			sourceData: {
				bookTitle: 'Hooked',
				author: 'Nir Eyal',
				highlightText:
					'Understanding the "why" behind user behavior is more valuable than tracking the "what". Focus on motivation and triggers.',
				readwiseTags: ['Behavioral Design', 'Product Psychology']
			}
		},
		{
			id: '6',
			type: 'photo_note',
			title: 'Sprint Retrospective Board',
			snippet: 'Stop, Start, Continue framework from our last sprint...',
			tags: ['retrospective', 'sprint'],
			createdAt: new Date('2024-03-01'),
			processed: false,
			sourceData: {
				imageUrl: '/api/placeholder/400/300',
				transcribedText:
					'Sprint retrospective: Stop doing task switching. Start doing weekly user interviews. Continue daily stand-ups.',
				source: 'Sprint 12 Retro'
			}
		},
		{
			id: '7',
			type: 'manual_text',
			title: 'Technical Debt Definition',
			snippet: 'Technical debt is not a bad thing when managed...',
			tags: ['technical-debt', 'engineering'],
			createdAt: new Date('2024-03-10'),
			processed: false,
			sourceData: {
				text: 'Technical debt is not inherently bad - it represents intentional trade-offs for speed. The key is knowing when and how to pay it back.',
				bookTitle: 'Engineering Team Discussion',
				pageNumber: null
			}
		},
		{
			id: '8',
			type: 'readwise_highlight',
			title: 'Product-Market Fit Signals',
			snippet: 'When customers become your sales team...',
			tags: ['pmf', 'growth'],
			createdAt: new Date('2024-03-20'),
			processed: false,
			sourceData: {
				bookTitle: 'The Mom Test',
				author: 'Rob Fitzpatrick',
				highlightText:
					'Product-market fit signals include customers becoming evangelists, organic growth through word-of-mouth, and difficulty keeping up with demand.',
				readwiseTags: ['Product-Market Fit', 'Early Stage']
			}
		}
	]);

	// UI State
	let selectedItemId = $state<string | null>(null);
	let filterType = $state<InboxItemType | 'all'>('all');
	let sidebarCollapsed = $state(false);
	let sidebarWidth = $state(256); // Default 256px (w-64)
	let inboxWidth = $state(400);
	let isMobile = $state(false);

	// Initialize from localStorage or defaults
	function handleInboxWidthChange(width: number) {
		inboxWidth = width;
		if (typeof window !== 'undefined') {
			localStorage.setItem('inboxWidth', width.toString());
		}
	}

	function handleSidebarWidthChange(width: number) {
		sidebarWidth = width;
		if (typeof window !== 'undefined') {
			localStorage.setItem('sidebarWidth', width.toString());
		}
	}

	// Mobile detection
	function checkMobile() {
		if (typeof window !== 'undefined') {
			isMobile = window.innerWidth < 768;
		}
	}

	// Initialize localStorage and mobile detection on client
	$effect(() => {
		if (typeof window !== 'undefined') {
			// Load saved widths
			const savedInboxWidth = parseInt(localStorage.getItem('inboxWidth') || '400');
			const savedSidebarWidth = parseInt(localStorage.getItem('sidebarWidth') || '256');
			inboxWidth = savedInboxWidth;
			sidebarWidth = savedSidebarWidth;

			// Set up mobile detection
			checkMobile();
			window.addEventListener('resize', checkMobile);

			// Cleanup
			return () => {
				window.removeEventListener('resize', checkMobile);
			};
		}
	});

	// Computed values
	const selectedItem = $derived(
		mockInboxItems.find((item) => item.id === selectedItemId)
	);

	const filteredItems = $derived(
		filterType === 'all'
			? mockInboxItems.filter((item) => !item.processed)
			: mockInboxItems.filter((item) => item.type === filterType && !item.processed)
	);

	const inboxCount = $derived(
		mockInboxItems.filter((item) => !item.processed).length
	);

	// Actions
	function selectItem(itemId: string) {
		selectedItemId = itemId;
	}

	function setFilter(type: InboxItemType | 'all') {
		filterType = type;
		// Clear selection when changing filters
		selectedItemId = null;
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

<div class="h-screen flex overflow-hidden">
	<!-- Reusable Sidebar Component -->
	<Sidebar
		inboxCount={inboxCount}
		isMobile={isMobile}
		sidebarCollapsed={sidebarCollapsed}
		onToggleCollapse={() => (sidebarCollapsed = !sidebarCollapsed)}
		sidebarWidth={sidebarWidth}
		onSidebarWidthChange={handleSidebarWidthChange}
	/>

	<!-- Middle Column - Inbox List -->
	{#if !isMobile}
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
				/>

				<!-- Inbox Items List - Scrollable -->
				<div class="flex-1 overflow-y-auto">
					<div class="p-inbox-container">
						<div class="flex flex-col gap-inbox-list">
							{#each filteredItems as item}
								<InboxCard
									item={item}
									selected={selectedItemId === item.id}
									onClick={() => selectItem(item.id)}
								/>
							{/each}
						</div>

						{#if filteredItems.length === 0}
							<div class="text-center py-12">
								<p class="text-tertiary">No items in inbox. Great job! 🎉</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</ResizableSplitter>
	{/if}

	<!-- Right Panel - Detail View -->
	<div class="flex-1 bg-elevated overflow-y-auto">
		{#if selectedItem}
			<!-- Dynamic detail view based on type -->
			{#if selectedItem.type === 'readwise_highlight'}
				<ReadwiseDetail item={selectedItem} onClose={() => (selectedItemId = null)} />
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
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>


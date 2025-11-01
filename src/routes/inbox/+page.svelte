<script lang="ts">
	import ReadwiseDetail from '$lib/components/inbox/ReadwiseDetail.svelte';
	import PhotoDetail from '$lib/components/inbox/PhotoDetail.svelte';
	import ManualDetail from '$lib/components/inbox/ManualDetail.svelte';
	import ResizableSplitter from '$lib/components/ResizableSplitter.svelte';

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
	let inboxWidth = $state(400);
	let isMobile = $state(false);

	// Initialize from localStorage or defaults
	function handleInboxWidthChange(width: number) {
		inboxWidth = width;
		if (typeof window !== 'undefined') {
			localStorage.setItem('inboxWidth', width.toString());
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
			// Load saved width
			const savedWidth = parseInt(localStorage.getItem('inboxWidth') || '400');
			inboxWidth = savedWidth;

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

	function getTypeIcon(type: InboxItemType): string {
		switch (type) {
			case 'readwise_highlight':
				return '📚';
			case 'photo_note':
				return '📷';
			case 'manual_text':
				return '✍️';
			default:
				return '📝';
		}
	}
</script>

<div class="h-screen flex overflow-hidden">
	<!-- Mobile Hamburger Button (shown when sidebar is collapsed on mobile) -->
	{#if isMobile && sidebarCollapsed}
		<button
			type="button"
			onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
			class="fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
			aria-label="Open navigation"
		>
			☰
		</button>
	{/if}

	<!-- Left Sidebar - Navigation -->
	<aside
		class="bg-gray-900 text-white flex flex-col border-r border-gray-800 transition-all duration-300"
		class:w-64={!sidebarCollapsed && !isMobile}
		class:w-16={isMobile && !sidebarCollapsed}
		class:w-0={sidebarCollapsed && !isMobile}
		class:hidden={isMobile && sidebarCollapsed}
	>
		<!-- Header -->
		<div class="p-4 border-b border-gray-800 flex items-center gap-2">
			<button
				type="button"
				onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
				class="text-gray-400 hover:text-white transition-colors"
				aria-label="Toggle sidebar"
			>
				{sidebarCollapsed ? '☰' : '✕'}
			</button>
			{#if !sidebarCollapsed && !isMobile}
				<div>
					<h1 class="text-xl font-bold">Axon</h1>
					<p class="text-sm text-gray-400">Knowledge Base</p>
				</div>
			{:else if isMobile && !sidebarCollapsed}
				<div>
					<h1 class="text-2xl font-bold">A</h1>
				</div>
			{/if}
		</div>

		<!-- Navigation -->
		{#if !sidebarCollapsed}
			<nav class="flex-1 p-4 space-y-4 overflow-y-auto">
			<!-- Inbox -->
			<div>
			<a
				href="/inbox"
				class="relative flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors"
				class:justify-center={isMobile}
				title={isMobile ? 'Inbox' : ''}
			>
				<span class="text-2xl">📮</span>
				{#if !isMobile}
					<span class="font-medium">Inbox</span>
					<span class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
						{inboxCount}
					</span>
				{:else}
					<span class="absolute top-0 right-0 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
						{inboxCount}
					</span>
				{/if}
			</a>
		</div>

		<!-- Flashcards -->
		<div>
			<a
				href="/flashcards"
				class="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors"
				class:justify-center={isMobile}
				title={isMobile ? 'Flashcards' : ''}
			>
				<span class="text-2xl">🎯</span>
				{#if !isMobile}
					<span class="font-medium">Flashcards</span>
				{/if}
			</a>
		</div>

		<!-- Filter Divider -->
		{#if !isMobile}
		<div class="border-t border-gray-800 pt-4">
			<p class="text-xs font-semibold text-gray-400 uppercase mb-2">Filters</p>
				<div class="space-y-1">
					<button
						type="button"
						class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
						class:bg-blue-600={filterType === 'all'}
						class:hover:bg-blue-700={filterType === 'all'}
						onclick={() => setFilter('all')}
					>
						All
					</button>
					<button
						type="button"
						class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
						class:bg-blue-600={filterType === 'readwise_highlight'}
						class:hover:bg-blue-700={filterType === 'readwise_highlight'}
						onclick={() => setFilter('readwise_highlight')}
					>
						📚 Readwise
					</button>
					<button
						type="button"
						class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
						class:bg-blue-600={filterType === 'photo_note'}
						class:hover:bg-blue-700={filterType === 'photo_note'}
						onclick={() => setFilter('photo_note')}
					>
						📷 Photos
					</button>
					<button
						type="button"
						class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
						class:bg-blue-600={filterType === 'manual_text'}
						class:hover:bg-blue-700={filterType === 'manual_text'}
						onclick={() => setFilter('manual_text')}
					>
						✍️ Manual
					</button>
			</div>
			</div>
		{/if}

		<!-- Categories Section -->
		{#if !isMobile}
		<div class="border-t border-gray-800 pt-4">
			<p class="text-xs font-semibold text-gray-400 uppercase mb-2">Categories</p>
				<div class="space-y-1">
					<button
						type="button"
						class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
					>
						Product Delivery
					</button>
					<button
						type="button"
						class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors ml-4"
					>
						→ Sprint Planning
					</button>
					<button
						type="button"
						class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors ml-4"
					>
						→ Roadmapping
					</button>
					<button
						type="button"
						class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
					>
						Product Discovery
					</button>
					<button
						type="button"
						class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
					>
						Leadership
					</button>
			</div>
		</div>
		{/if}
		</nav>
		{/if}

		<!-- Footer Actions -->
		{#if !sidebarCollapsed}
			{#if !isMobile}
		<div class="p-4 border-t border-gray-800">
			<button
				type="button"
				class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
			>
				+ New Item
			</button>
		</div>
			{/if}
		{/if}
	</aside>

	<!-- Middle Column - Inbox List -->
	{#if !isMobile}
		<ResizableSplitter
			initialWidth={inboxWidth}
			minWidth={175}
			maxWidth={400}
			onWidthChange={handleInboxWidthChange}
		>
			<div class="bg-gray-50 overflow-y-auto h-full">
				<div class="p-4">
					<h2 class="text-xl font-bold text-gray-900 mb-4">
						{filterType === 'all'
							? 'Inbox'
							: filterType.charAt(0).toUpperCase() + filterType.slice(1).replace('_', ' ')}
					</h2>

					<!-- Inbox Items List -->
					<div class="space-y-2">
						{#each filteredItems as item}
							<button
								type="button"
								class="w-full text-left p-3 bg-white rounded-lg border-2 transition-all"
								class:border-blue-600={selectedItemId === item.id}
								class:border-gray-200={selectedItemId !== item.id}
								class:hover:border-gray-400={selectedItemId !== item.id}
								onclick={() => selectItem(item.id)}
							>
								<div class="flex items-start gap-2">
									<!-- Icon -->
									<div class="text-xl">{getTypeIcon(item.type)}</div>

									<!-- Content -->
									<div class="flex-1 min-w-0">
										<h3 class="font-semibold text-gray-900 truncate text-sm">{item.title}</h3>
										<p class="text-xs text-gray-600 mt-1 line-clamp-2">
											{item.snippet}
										</p>
										<div class="flex items-center gap-1 mt-1">
											<!-- Tags -->
											<div class="flex flex-wrap gap-1">
												{#each item.tags.slice(0, 2) as tag}
													<span
														class="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded"
													>
														{tag}
													</span>
												{/each}
											</div>
										</div>
									</div>
								</div>
							</button>
						{/each}
					</div>

					{#if filteredItems.length === 0}
						<div class="text-center py-12">
							<p class="text-gray-500">No items in inbox. Great job! 🎉</p>
						</div>
					{/if}
				</div>
			</div>
		</ResizableSplitter>
	{/if}

	<!-- Right Panel - Detail View -->
	<div class="flex-1 bg-white overflow-y-auto">
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
			<div class="p-8 text-center">
				<div class="text-6xl mb-4">📮</div>
				<p class="text-gray-500">Select an item to view details</p>
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


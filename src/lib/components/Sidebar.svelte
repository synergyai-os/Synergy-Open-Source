<script lang="ts">
	import ResizableSplitter from './ResizableSplitter.svelte';

	type Props = {
		inboxCount: number;
		filterType: any;
		onFilterChange: (type: any) => void;
		isMobile: boolean;
		sidebarCollapsed: boolean;
		onToggleCollapse: () => void;
		sidebarWidth?: number;
		onSidebarWidthChange?: (width: number) => void;
	};

	let {
		inboxCount,
		filterType,
		onFilterChange,
		isMobile,
		sidebarCollapsed,
		onToggleCollapse,
		sidebarWidth = 256,
		onSidebarWidthChange
	}: Props = $props();

	let isPinned = $state(false);
	let isHovered = $state(false);

	// Computed sidebar display width based on state
	const displayWidth = $derived(() => {
		if (isMobile && !sidebarCollapsed) return 64;
		if (sidebarCollapsed && !isMobile && !isPinned && !isHovered) return 0;
		if (isMobile && sidebarCollapsed) return 0;
		return sidebarWidth;
	});

	// Determine if sidebar should use ResizableSplitter (only when expanded and not mobile)
	const useResizable = $derived(!isMobile && !sidebarCollapsed && displayWidth() > 0);
</script>

<!-- Left edge hover zone to reveal sidebar when collapsed on desktop -->
{#if !isMobile && sidebarCollapsed}
	<div
		class="fixed left-0 top-0 bottom-0 w-4 z-40 hover:bg-transparent"
		onmouseenter={() => (isHovered = true)}
		role="presentation"
	></div>
{/if}

<!-- Mobile Hamburger Button (shown when sidebar is collapsed on mobile) -->
{#if isMobile && sidebarCollapsed}
	<button
		type="button"
		onclick={() => onToggleCollapse()}
		class="fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
		aria-label="Open navigation"
	>
		☰
	</button>
{/if}

<!-- Left Sidebar - Navigation -->
{#if useResizable && onSidebarWidthChange}
	<ResizableSplitter
		initialWidth={sidebarWidth}
		minWidth={192}
		maxWidth={384}
		onWidthChange={(w) => onSidebarWidthChange?.(w)}
	>
		<aside
			class="bg-gray-900 text-white flex flex-col border-r border-gray-800 h-full"
			onmouseenter={() => (isHovered = true)}
			onmouseleave={() => (isHovered = false)}
		>
			<!-- Header -->
			<div class="p-4 border-b border-gray-800 flex items-center gap-2">
				<button
					type="button"
					onclick={() => onToggleCollapse()}
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
				{/if}

				<!-- Pin/Unpin button -->
				{#if isHovered}
					<button
						type="button"
						onclick={() => {
							isPinned = !isPinned;
						}}
						class="ml-auto text-gray-400 hover:text-white transition-colors"
						aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
					>
						📌
					</button>
				{/if}
			</div>

			<!-- Navigation -->
			{#if !sidebarCollapsed || isPinned}
				<nav class="flex-1 p-4 space-y-4 overflow-y-auto">
					<!-- Inbox -->
					<div>
						<a
							href="/inbox"
							class="relative flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors"
							title="Inbox"
						>
							<span class="text-2xl">📮</span>
							<span class="font-medium">Inbox</span>
							<span class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
								{inboxCount}
							</span>
						</a>
					</div>

					<!-- Flashcards -->
					<div>
						<a
							href="/flashcards"
							class="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors"
							title="Flashcards"
						>
							<span class="text-2xl">🎯</span>
							<span class="font-medium">Flashcards</span>
						</a>
					</div>

					<!-- Filter Divider -->
					<div class="border-t border-gray-800 pt-4">
						<p class="text-xs font-semibold text-gray-400 uppercase mb-2">Filters</p>
						<div class="space-y-1">
							<button
								type="button"
								class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
								class:bg-blue-600={filterType === 'all'}
								class:hover:bg-blue-700={filterType === 'all'}
								onclick={() => onFilterChange('all')}
							>
								All
							</button>
							<button
								type="button"
								class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
								class:bg-blue-600={filterType === 'readwise_highlight'}
								class:hover:bg-blue-700={filterType === 'readwise_highlight'}
								onclick={() => onFilterChange('readwise_highlight')}
							>
								📚 Readwise
							</button>
							<button
								type="button"
								class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
								class:bg-blue-600={filterType === 'photo_note'}
								class:hover:bg-blue-700={filterType === 'photo_note'}
								onclick={() => onFilterChange('photo_note')}
							>
								📷 Photos
							</button>
							<button
								type="button"
								class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
								class:bg-blue-600={filterType === 'manual_text'}
								class:hover:bg-blue-700={filterType === 'manual_text'}
								onclick={() => onFilterChange('manual_text')}
							>
								✍️ Manual
							</button>
						</div>
					</div>

					<!-- Categories Section -->
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
				</nav>
			{/if}

			<!-- Footer Actions -->
			{#if !sidebarCollapsed || isPinned}
				<div class="p-4 border-t border-gray-800">
					<button
						type="button"
						class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						+ New Item
					</button>
				</div>
			{/if}
		</aside>
	</ResizableSplitter>
{:else}
	<aside
		class="bg-gray-900 text-white flex flex-col border-r border-gray-800 transition-all duration-300"
		style="width: {displayWidth()}px;"
		class:w-16={isMobile && !sidebarCollapsed}
		class:hidden={isMobile && sidebarCollapsed}
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
	>
		<!-- Header -->
		<div class="p-4 border-b border-gray-800 flex items-center gap-2">
			<button
				type="button"
				onclick={() => onToggleCollapse()}
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
						{:else if isMobile && sidebarCollapsed}
							<span class="absolute top-0 right-0 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
								{inboxCount}
							</span>
						{:else}
							<span class="font-medium">Inbox</span>
							<span class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
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
						{#if !isMobile || !sidebarCollapsed}
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
								onclick={() => onFilterChange('all')}
							>
								All
							</button>
							<button
								type="button"
								class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
								class:bg-blue-600={filterType === 'readwise_highlight'}
								class:hover:bg-blue-700={filterType === 'readwise_highlight'}
								onclick={() => onFilterChange('readwise_highlight')}
							>
								📚 Readwise
							</button>
							<button
								type="button"
								class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
								class:bg-blue-600={filterType === 'photo_note'}
								class:hover:bg-blue-700={filterType === 'photo_note'}
								onclick={() => onFilterChange('photo_note')}
							>
								📷 Photos
							</button>
							<button
								type="button"
								class="w-full text-left p-2 rounded-lg hover:bg-gray-800 transition-colors"
								class:bg-blue-600={filterType === 'manual_text'}
								class:hover:bg-blue-700={filterType === 'manual_text'}
								onclick={() => onFilterChange('manual_text')}
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
		{#if !sidebarCollapsed && !isMobile}
			<div class="p-4 border-t border-gray-800">
				<button
					type="button"
					class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
				>
					+ New Item
				</button>
			</div>
		{/if}
	</aside>
{/if}

<style>
	aside {
		position: relative;
	}

	aside:hover {
		z-index: 40;
	}
</style>

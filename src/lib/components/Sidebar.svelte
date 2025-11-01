<script lang="ts">
	import ResizableSplitter from './ResizableSplitter.svelte';
	import SidebarHeader from './sidebar/SidebarHeader.svelte';

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
			class="bg-gray-900 text-white flex flex-col border-r border-gray-800 h-full overflow-hidden"
			onmouseenter={() => (isHovered = true)}
			onmouseleave={() => (isHovered = false)}
		>
			<!-- Sticky Header with Workspace Menu -->
			<SidebarHeader
				workspaceName="Axon"
				sidebarCollapsed={sidebarCollapsed}
				isMobile={isMobile}
				onSettings={() => {
					console.log('Settings clicked');
				}}
				onLogout={() => {
					console.log('Logout clicked');
				}}
			/>

			<!-- Navigation - Scrollable area -->
			{#if !sidebarCollapsed || isPinned}
				<nav class="flex-1 px-2 py-2 overflow-y-auto">
					<!-- Inbox -->
					<a
						href="/inbox"
						class="group relative flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
						title="Inbox"
					>
						<!-- Icon -->
						<svg
							class="w-4 h-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							/>
						</svg>
						<span class="font-normal flex-1 min-w-0">Inbox</span>
						{#if inboxCount > 0}
							<span
								class="bg-gray-700 text-gray-300 text-[10px] font-medium px-1.5 py-0.5 rounded min-w-[18px] text-center flex-shrink-0"
							>
								{inboxCount}
							</span>
						{/if}
					</a>

					<!-- Flashcards -->
					<a
						href="/flashcards"
						class="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
						title="Flashcards"
					>
						<!-- Icon -->
						<svg
							class="w-4 h-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span class="font-normal">Flashcards</span>
					</a>

					<!-- Filter Divider -->
					<div class="border-t border-gray-800/50 my-2"></div>
					<div class="px-2 py-1">
						<p class="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
							Filters
						</p>
						<div class="space-y-0.5">
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
								class:bg-gray-800={filterType === 'all'}
								class:text-white={filterType === 'all'}
								onclick={() => onFilterChange('all')}
							>
								<span class="font-normal">All</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
								class:bg-gray-800={filterType === 'readwise_highlight'}
								class:text-white={filterType === 'readwise_highlight'}
								onclick={() => onFilterChange('readwise_highlight')}
							>
								<!-- Icon -->
								<svg
									class="w-4 h-4 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
									/>
								</svg>
								<span class="font-normal">Readwise</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
								class:bg-gray-800={filterType === 'photo_note'}
								class:text-white={filterType === 'photo_note'}
								onclick={() => onFilterChange('photo_note')}
							>
								<!-- Icon -->
								<svg
									class="w-4 h-4 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								<span class="font-normal">Photos</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
								class:bg-gray-800={filterType === 'manual_text'}
								class:text-white={filterType === 'manual_text'}
								onclick={() => onFilterChange('manual_text')}
							>
								<!-- Icon -->
								<svg
									class="w-4 h-4 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
									/>
								</svg>
								<span class="font-normal">Manual</span>
							</button>
						</div>
					</div>

					<!-- Categories Section -->
					<div class="border-t border-gray-800/50 my-2"></div>
					<div class="px-2 py-1">
						<p class="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
							Categories
						</p>
						<div class="space-y-0.5">
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
							>
								<span class="font-normal">Product Delivery</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white pl-6"
							>
								<span class="font-normal">Sprint Planning</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white pl-6"
							>
								<span class="font-normal">Roadmapping</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
							>
								<span class="font-normal">Product Discovery</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
							>
								<span class="font-normal">Leadership</span>
							</button>
						</div>
					</div>
				</nav>
			{/if}

			<!-- Footer Actions -->
			{#if !sidebarCollapsed || isPinned}
				<div class="px-2 py-2 border-t border-gray-800/50">
					<button
						type="button"
						class="w-full flex items-center justify-center gap-2 bg-gray-800/50 hover:bg-gray-800 text-white py-1.5 px-3 rounded-md transition-all duration-150 text-sm font-normal"
					>
						<svg
							class="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						New Item
					</button>
				</div>
			{/if}
		</aside>
	</ResizableSplitter>
{:else}
	<aside
		class="bg-gray-900 text-white flex flex-col border-r border-gray-800 transition-all duration-300 overflow-hidden"
		style="width: {displayWidth()}px;"
		class:w-16={isMobile && !sidebarCollapsed}
		class:hidden={isMobile && sidebarCollapsed}
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
	>
		<!-- Sticky Header with Workspace Menu -->
		<SidebarHeader
			workspaceName="Axon"
			sidebarCollapsed={sidebarCollapsed}
			isMobile={isMobile}
			onSettings={() => {
				console.log('Settings clicked');
			}}
			onLogout={() => {
				console.log('Logout clicked');
			}}
		/>

		<!-- Navigation -->
		{#if !sidebarCollapsed}
			<nav class="flex-1 px-2 py-2 overflow-y-auto">
				<!-- Inbox -->
				<a
					href="/inbox"
					class="group relative flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
					class:justify-center={isMobile}
					title={isMobile ? 'Inbox' : ''}
				>
					<svg
						class="w-4 h-4 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
						/>
					</svg>
					{#if !isMobile}
						<span class="font-normal flex-1 min-w-0">Inbox</span>
						{#if inboxCount > 0}
							<span
								class="bg-gray-700 text-gray-300 text-[10px] font-medium px-1.5 py-0.5 rounded min-w-[18px] text-center flex-shrink-0"
							>
								{inboxCount}
							</span>
						{/if}
					{:else if isMobile && sidebarCollapsed}
						{#if inboxCount > 0}
							<span
								class="absolute top-0 right-0 bg-gray-700 text-gray-300 text-[10px] font-medium px-1 py-0.5 rounded leading-none"
							>
								{inboxCount}
							</span>
						{/if}
					{:else}
						<span class="font-normal">Inbox</span>
						{#if inboxCount > 0}
							<span
								class="bg-gray-700 text-gray-300 text-[10px] font-medium px-1.5 py-0.5 rounded min-w-[18px] text-center flex-shrink-0"
							>
								{inboxCount}
							</span>
						{/if}
					{/if}
				</a>

				<!-- Flashcards -->
				<a
					href="/flashcards"
					class="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
					class:justify-center={isMobile}
					title={isMobile ? 'Flashcards' : ''}
				>
					<svg
						class="w-4 h-4 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					{#if !isMobile || !sidebarCollapsed}
						<span class="font-normal">Flashcards</span>
					{/if}
				</a>

				<!-- Filter Divider -->
				{#if !isMobile}
					<div class="border-t border-gray-800/50 my-2"></div>
					<div class="px-2 py-1">
						<p class="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
							Filters
						</p>
						<div class="space-y-0.5">
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
								class:bg-gray-800={filterType === 'all'}
								class:text-white={filterType === 'all'}
								onclick={() => onFilterChange('all')}
							>
								<span class="font-normal">All</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
								class:bg-gray-800={filterType === 'readwise_highlight'}
								class:text-white={filterType === 'readwise_highlight'}
								onclick={() => onFilterChange('readwise_highlight')}
							>
								<svg
									class="w-4 h-4 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
									/>
								</svg>
								<span class="font-normal">Readwise</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
								class:bg-gray-800={filterType === 'photo_note'}
								class:text-white={filterType === 'photo_note'}
								onclick={() => onFilterChange('photo_note')}
							>
								<svg
									class="w-4 h-4 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								<span class="font-normal">Photos</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
								class:bg-gray-800={filterType === 'manual_text'}
								class:text-white={filterType === 'manual_text'}
								onclick={() => onFilterChange('manual_text')}
							>
								<svg
									class="w-4 h-4 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
									/>
								</svg>
								<span class="font-normal">Manual</span>
							</button>
						</div>
					</div>
				{/if}

				<!-- Categories Section -->
				{#if !isMobile}
					<div class="border-t border-gray-800/50 my-2"></div>
					<div class="px-2 py-1">
						<p class="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
							Categories
						</p>
						<div class="space-y-0.5">
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
							>
								<span class="font-normal">Product Delivery</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white pl-6"
							>
								<span class="font-normal">Sprint Planning</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white pl-6"
							>
								<span class="font-normal">Roadmapping</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
							>
								<span class="font-normal">Product Discovery</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-800/50 transition-all duration-150 text-sm text-gray-300 hover:text-white"
							>
								<span class="font-normal">Leadership</span>
							</button>
						</div>
					</div>
				{/if}
			</nav>
		{/if}

		<!-- Footer Actions -->
		{#if !sidebarCollapsed && !isMobile}
			<div class="px-2 py-2 border-t border-gray-800/50">
				<button
					type="button"
					class="w-full flex items-center justify-center gap-2 bg-gray-800/50 hover:bg-gray-800 text-white py-1.5 px-3 rounded-md transition-all duration-150 text-sm font-normal"
				>
					<svg
						class="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					New Item
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

<script lang="ts">
	import { goto } from '$app/navigation';
	import ResizableSplitter from './ResizableSplitter.svelte';
	import SidebarHeader from './sidebar/SidebarHeader.svelte';

	type Props = {
		inboxCount: number;
		isMobile: boolean;
		sidebarCollapsed: boolean;
		onToggleCollapse: () => void;
		sidebarWidth?: number;
		onSidebarWidthChange?: (width: number) => void;
	};

	let {
		inboxCount,
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
		onmouseleave={() => (isHovered = false)}
		role="presentation"
	></div>
{/if}

<!-- Mobile Hamburger Button (shown when sidebar is collapsed on mobile) -->
{#if isMobile && sidebarCollapsed}
	<button
		type="button"
		onclick={() => onToggleCollapse()}
		class="fixed top-4 left-4 z-50 bg-sidebar text-sidebar-primary p-2 rounded-lg shadow-lg hover:bg-sidebar-hover-solid transition-colors"
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
			class="bg-sidebar text-sidebar-primary flex flex-col border-r border-sidebar h-full overflow-hidden"
			onmouseenter={() => (isHovered = true)}
			onmouseleave={() => (isHovered = false)}
		>
			<!-- Sticky Header with Workspace Menu -->
			<SidebarHeader
				workspaceName="Axon"
				sidebarCollapsed={sidebarCollapsed}
				isMobile={isMobile}
				isHovered={isHovered}
				onSettings={() => {
					goto('/settings');
				}}
				onLogout={() => {
					console.log('Logout clicked');
				}}
			/>

			<!-- Navigation - Scrollable area -->
			{#if !sidebarCollapsed || isPinned || (isHovered && !isMobile)}
				<nav class="flex-1 px-nav-container py-nav-container overflow-y-auto">
					<!-- Inbox -->
					<a
						href="/inbox"
						class="group relative flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary"
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
								class="bg-sidebar-badge text-sidebar-badge text-label font-medium px-badge py-badge rounded min-w-[18px] text-center flex-shrink-0"
							>
								{inboxCount}
							</span>
						{/if}
					</a>

					<!-- Flashcards -->
					<a
						href="/flashcards"
						class="group flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary"
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

					<!-- Categories Section -->
					<div class="border-t border-sidebar my-2"></div>
					<div class="px-section py-section">
						<p class="text-label font-medium text-sidebar-tertiary uppercase tracking-wider mb-1.5">
							Categories
						</p>
						<div class="space-y-0.5">
							<button
								type="button"
								class="w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary"
							>
								<span class="font-normal">Product Delivery</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary pl-indent"
							>
								<span class="font-normal">Sprint Planning</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary pl-indent"
							>
								<span class="font-normal">Roadmapping</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary"
							>
								<span class="font-normal">Product Discovery</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary"
							>
								<span class="font-normal">Leadership</span>
							</button>
						</div>
					</div>
				</nav>
			{/if}

			<!-- Footer Actions -->
			{#if (!sidebarCollapsed || isPinned || (isHovered && !isMobile)) && !isMobile}
				<div class="px-nav-container py-nav-container border-t border-sidebar">
					<button
						type="button"
						class="w-full flex items-center justify-center gap-icon bg-sidebar-hover hover:bg-sidebar-hover-solid text-sidebar-primary py-nav-item px-header rounded-md transition-all duration-150 text-sm font-normal"
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
		class="bg-sidebar text-sidebar-primary flex flex-col border-r border-sidebar transition-all duration-300 overflow-hidden h-full"
		class:fixed={sidebarCollapsed && !isMobile && isHovered}
		class:z-50={sidebarCollapsed && !isMobile && isHovered}
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
			isHovered={isHovered}
			onSettings={() => {
				if (typeof window !== 'undefined') {
					window.location.href = '/settings';
				}
			}}
			onLogout={() => {
				console.log('Logout clicked');
			}}
		/>

		<!-- Navigation -->
		{#if !sidebarCollapsed || (isHovered && !isMobile)}
			<nav class="flex-1 px-nav-container py-nav-container overflow-y-auto">
				<!-- Inbox -->
				<a
					href="/inbox"
					class="group relative flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary"
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
								class="bg-sidebar-badge text-sidebar-badge text-label font-medium px-badge py-badge rounded min-w-[18px] text-center flex-shrink-0"
							>
								{inboxCount}
							</span>
						{/if}
					{:else if isMobile && sidebarCollapsed}
						{#if inboxCount > 0}
							<span
								class="absolute top-0 right-0 bg-sidebar-badge text-sidebar-badge text-label font-medium px-1 py-0.5 rounded leading-none"
							>
								{inboxCount}
							</span>
						{/if}
					{:else}
						<span class="font-normal">Inbox</span>
						{#if inboxCount > 0}
							<span
								class="bg-sidebar-badge text-sidebar-badge text-label font-medium px-badge py-badge rounded min-w-[18px] text-center flex-shrink-0"
							>
								{inboxCount}
							</span>
						{/if}
					{/if}
				</a>

				<!-- Flashcards -->
				<a
					href="/flashcards"
					class="group flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary"
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

				<!-- Categories Section -->
				{#if !isMobile}
					<div class="border-t border-sidebar my-2"></div>
					<div class="px-section py-section">
						<p class="text-label font-medium text-sidebar-tertiary uppercase tracking-wider mb-1.5">
							Categories
						</p>
						<div class="space-y-0.5">
							<button
								type="button"
								class="w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary"
							>
								<span class="font-normal">Product Delivery</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary pl-indent"
							>
								<span class="font-normal">Sprint Planning</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary pl-indent"
							>
								<span class="font-normal">Roadmapping</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary"
							>
								<span class="font-normal">Product Discovery</span>
							</button>
							<button
								type="button"
								class="w-full flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary"
							>
								<span class="font-normal">Leadership</span>
							</button>
						</div>
					</div>
				{/if}
			</nav>
		{/if}

		<!-- Footer Actions -->
		{#if (!sidebarCollapsed || (isHovered && !isMobile)) && !isMobile}
			<div class="px-nav-container py-nav-container border-t border-sidebar">
				<button
					type="button"
					class="w-full flex items-center justify-center gap-icon bg-sidebar-hover hover:bg-sidebar-hover-solid text-sidebar-primary py-nav-item px-header rounded-md transition-all duration-150 text-sm font-normal"
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

	aside.fixed {
		top: 0;
		left: 0;
		bottom: 0;
		height: 100vh;
	}
</style>

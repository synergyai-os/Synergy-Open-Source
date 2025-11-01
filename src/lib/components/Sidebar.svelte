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
	let hoverTimeoutId: ReturnType<typeof setTimeout> | null = null;
	let hoverZoneTimeoutId: ReturnType<typeof setTimeout> | null = null;

	// Keep sidebar open when interacting with dropdown menus
	function handleDocumentMouseMove(e: MouseEvent) {
		if (!sidebarCollapsed || isMobile || !isHovered) return;
		
		const target = e.target as HTMLElement | null;
		if (target) {
			// Check if mouse is over dropdown menu
			const isOverDropdown = target.closest('[data-radix-portal]') || 
				target.closest('[role="menu"]') || 
				target.closest('[data-radix-dropdown-menu-content]') ||
				target.closest('[data-bits-ui-dropdown-menu-content]');
			
			if (isOverDropdown) {
				// Cancel any pending hide timeout
				if (hoverTimeoutId) {
					clearTimeout(hoverTimeoutId);
					hoverTimeoutId = null;
				}
				isHovered = true;
			}
		}
	}

	// Computed sidebar display width based on state
	const displayWidth = $derived(() => {
		if (isMobile && !sidebarCollapsed) return 64;
		if (sidebarCollapsed && !isMobile && !isPinned && !isHovered) return 0;
		if (isMobile && sidebarCollapsed) return 0;
		return sidebarWidth;
	});

	// Determine if sidebar should use ResizableSplitter (only when expanded and not mobile)
	const useResizable = $derived(!isMobile && !sidebarCollapsed && displayWidth() > 0);

	// Set up document mouse tracking when sidebar is hovered and collapsed
	$effect(() => {
		if (typeof window === 'undefined') return;
		
		if (sidebarCollapsed && !isMobile && isHovered) {
			document.addEventListener('mousemove', handleDocumentMouseMove);
			return () => {
				document.removeEventListener('mousemove', handleDocumentMouseMove);
			};
		}
	});
</script>

<!-- Left edge hover zone to reveal sidebar when collapsed on desktop -->
{#if !isMobile && sidebarCollapsed}
	<div
		class="fixed left-0 top-0 bottom-0 z-40 hover:bg-transparent pointer-events-auto transition-all duration-300"
		style="width: {isHovered ? Math.max(sidebarWidth, 4) + 'px' : '4px'};"
		onmouseenter={() => {
			// Clear any pending hide timeout
			if (hoverZoneTimeoutId) {
				clearTimeout(hoverZoneTimeoutId);
				hoverZoneTimeoutId = null;
			}
			isHovered = true;
		}}
		onmouseleave={() => {
			// Delay hiding to allow mouse to move to sidebar
			hoverZoneTimeoutId = setTimeout(() => {
				// Only hide if mouse isn't over sidebar or dropdown
				if (typeof window !== 'undefined') {
					const dropdownElements = document.querySelectorAll('[data-radix-portal], [role="menu"]');
					const sidebarElement = document.querySelector('aside.fixed');
					if (!dropdownElements.length && !sidebarElement) {
						isHovered = false;
					}
				}
				hoverZoneTimeoutId = null;
			}, 200);
		}}
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
		onmouseenter={() => {
			// Clear any pending hide timeout
			if (hoverTimeoutId) {
				clearTimeout(hoverTimeoutId);
				hoverTimeoutId = null;
			}
			isHovered = true;
		}}
		onmouseleave={(e) => {
			// Only hide if mouse is actually leaving the sidebar area (not just hovering over dropdown)
			const relatedTarget = e.relatedTarget as HTMLElement | null;
			// Check if mouse is moving to a dropdown menu or portal element
			if (relatedTarget && (
				relatedTarget.closest('[data-radix-portal]') ||
				relatedTarget.closest('[role="menu"]') ||
				relatedTarget.closest('[data-radix-dropdown-menu-content]') ||
				relatedTarget.closest('[data-bits-ui-dropdown-menu-content]')
			)) {
				// Don't hide - mouse is going to dropdown
				return;
			}
			// Use a delay to allow moving mouse to dropdown menus or back to hover zone
			hoverTimeoutId = setTimeout(() => {
				// Check if mouse is over dropdown, sidebar, or hover zone
				const mouseX = (e as MouseEvent).clientX;
				const mouseY = (e as MouseEvent).clientY;
				
				const dropdownElements = document.querySelectorAll('[data-radix-portal], [role="menu"], [data-radix-dropdown-menu-content]');
				const isOverDropdown = Array.from(dropdownElements).some(el => {
					const rect = el.getBoundingClientRect();
					return mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;
				});
				
				// Check if mouse is still in hover zone (first 4px or expanded hover zone)
				const isInHoverZone = mouseX <= (sidebarCollapsed ? sidebarWidth : 4);
				
				if (!isOverDropdown && !isInHoverZone) {
					isHovered = false;
				}
				hoverTimeoutId = null;
			}, 300);
		}}
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

<script lang="ts">
	import { goto } from '$app/navigation';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
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
	let isHoveringRightEdge = $state(false); // Track if mouse is near right edge for resize handle
	let hoverTimeoutId: ReturnType<typeof setTimeout> | null = null;
	let hoverZoneTimeoutId: ReturnType<typeof setTimeout> | null = null;

	// Keep sidebar open when interacting with dropdown menus
	function handleDocumentMouseMove(e: MouseEvent) {
		if (!sidebarCollapsed || isMobile || !hoverState) return;
		
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

	// Track hover state with debouncing to prevent flickering
	let hoverState = $state(false);
	let hoverDebounceTimeout: ReturnType<typeof setTimeout> | null = null;
	
	// Debounced hover state - only update after a short delay to prevent rapid flickering
	function setHoverState(newState: boolean, delay = 50) {
		if (hoverDebounceTimeout) {
			clearTimeout(hoverDebounceTimeout);
		}
		
		if (newState) {
			// Opening immediately (no delay)
			hoverState = true;
			isHovered = true;
		} else {
			// Closing with delay to allow mouse to move between hover zone and sidebar
			hoverDebounceTimeout = setTimeout(() => {
				hoverState = false;
				isHovered = false;
				hoverDebounceTimeout = null;
			}, delay);
		}
	}

	// Smooth animated width using tweened - start at 0 for smooth opening
	const animatedWidth = tweened(sidebarCollapsed ? 0 : sidebarWidth, {
		duration: 250, // Gentle but responsive animation
		easing: cubicOut
	});

	// Update animated width when sidebarWidth changes (but only when not collapsing)
	$effect(() => {
		if (!sidebarCollapsed && !isMobile) {
			animatedWidth.set(sidebarWidth, { duration: 250, easing: cubicOut });
		}
	});

	// Smoothly animate width when collapsing/expanding or hovering
	// Use hoverState (debounced) instead of isHovered to prevent flickering
	$effect(() => {
		if (isMobile) return;
		
		if (sidebarCollapsed && !hoverState && !isPinned) {
			// Collapsing - animate to 0
			animatedWidth.set(0, { duration: 250, easing: cubicOut });
		} else if (!sidebarCollapsed || hoverState || isPinned) {
			// Expanding or hovered open - animate to sidebarWidth smoothly
			// Ensure we always animate to the full sidebarWidth
			animatedWidth.set(sidebarWidth, { duration: 250, easing: cubicOut });
		}
	});

	// Computed sidebar display width based on state (uses animated value)
	const displayWidth = $derived(() => {
		if (isMobile && sidebarCollapsed) return 0;
		// On mobile when open, show full width sidebar
		if (isMobile && !sidebarCollapsed) return sidebarWidth;
		// When expanded (not collapsed), use sidebarWidth directly
		if (!sidebarCollapsed) {
			return sidebarWidth;
		}
		// When collapsed and hovered, ResizableSplitter handles the animation
		// For the fixed sidebar fallback, use animated width
		return $animatedWidth;
	});

	// Track if we're in the middle of a collapse animation
	let isCollapsing = $state(false);
	
	// Determine if sidebar should use ResizableSplitter
	// Use hoverState (debounced) to prevent flickering from rapid mount/unmount
	const useResizable = $derived(
		!isMobile && 
		!isCollapsing &&
		(!sidebarCollapsed || (sidebarCollapsed && hoverState))
	);

	// Set up document mouse tracking when sidebar is hovered and collapsed
	$effect(() => {
		if (typeof window === 'undefined') return;
		
		if (sidebarCollapsed && !isMobile && hoverState) {
			document.addEventListener('mousemove', handleDocumentMouseMove);
			return () => {
				document.removeEventListener('mousemove', handleDocumentMouseMove);
			};
		}
	});
</script>

<!-- Left edge hover zone to reveal sidebar when collapsed on desktop -->
<!-- Keep width stable at 8px to prevent flickering from width changes -->
{#if !isMobile && sidebarCollapsed}
	<div
		class="fixed left-0 top-0 bottom-0 hover:bg-transparent pointer-events-auto"
		style="width: 8px; z-index: 50;"
		onmouseenter={() => {
			// Clear any pending hide timeout
			if (hoverZoneTimeoutId) {
				clearTimeout(hoverZoneTimeoutId);
				hoverZoneTimeoutId = null;
			}
			// Use debounced hover state to prevent flickering
			setHoverState(true, 0);
		}}
		onmouseleave={() => {
			// Delay hiding to allow mouse to move to sidebar
			hoverZoneTimeoutId = setTimeout(() => {
				// Only hide if mouse isn't over sidebar or dropdown
				if (typeof window !== 'undefined') {
					const dropdownElements = document.querySelectorAll('[data-radix-portal], [role="menu"]');
					const sidebarElement = document.querySelector('aside.fixed');
					if (!dropdownElements.length && !sidebarElement) {
						setHoverState(false, 200);
					}
				}
				hoverZoneTimeoutId = null;
			}, 100);
		}}
		role="presentation"
	></div>
{/if}

<!-- Mobile Hamburger Button removed - using SidebarToggle in InboxHeader instead -->

<!-- Mobile Backdrop Overlay (shown when sidebar is open on mobile) -->
{#if isMobile && !sidebarCollapsed}
	<div
		class="fixed inset-0 bg-black/50 z-40 transition-opacity"
		onclick={() => onToggleCollapse()}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onToggleCollapse();
			}
		}}
		role="button"
		tabindex="0"
		aria-label="Close sidebar"
	></div>
{/if}

<!-- Left Sidebar - Navigation -->
{#if useResizable && onSidebarWidthChange}
	<ResizableSplitter
		initialWidth={sidebarWidth}
		minWidth={192}
		maxWidth={384}
		onWidthChange={(w) => onSidebarWidthChange?.(w)}
		showHandle={sidebarCollapsed ? isHoveringRightEdge : true}
		shouldAnimateOpen={sidebarCollapsed && hoverState}
		onClose={() => {
			// Mark as collapsing to keep ResizableSplitter mounted during transition
			isCollapsing = true;
			// Immediately toggle collapsed state - ResizableSplitter has already animated width to 0
			// This will trigger our tweened animation and content fade transitions
			onToggleCollapse();
			// Keep ResizableSplitter mounted for a moment to allow smooth transition
			// then unmount after the tweened animation completes
			setTimeout(() => {
				isCollapsing = false;
			}, 350); // Slightly longer than animation duration
		}}
	>
		<aside
			class="bg-sidebar text-sidebar-primary flex flex-col border-r border-sidebar h-full overflow-hidden"
			style="pointer-events: auto; z-index: 50;"
			onmouseenter={() => {
				// Clear any pending hide timeout
				if (hoverZoneTimeoutId) {
					clearTimeout(hoverZoneTimeoutId);
					hoverZoneTimeoutId = null;
				}
				// Keep sidebar open when mouse enters
				setHoverState(true, 0);
			}}
			onmouseleave={() => {
				// Use debounced hover state
				setHoverState(false, 200);
				isHoveringRightEdge = false;
			}}
			onmousemove={(e) => {
				if (sidebarCollapsed && !isMobile && hoverState) {
					// When collapsed and hovered open, only show handle when mouse is near right edge
					const rect = e.currentTarget.getBoundingClientRect();
					const mouseX = e.clientX;
					const rightEdge = rect.right;
					const distanceFromRight = rightEdge - mouseX;
					// Show handle when within 32px of right edge
					isHoveringRightEdge = distanceFromRight <= 32;
				} else if (!sidebarCollapsed) {
					// When expanded, always show handle when mouse is near right edge
					const rect = e.currentTarget.getBoundingClientRect();
					const mouseX = e.clientX;
					const rightEdge = rect.right;
					const distanceFromRight = rightEdge - mouseX;
					isHoveringRightEdge = distanceFromRight <= 32;
				}
			}}
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
			{#if !sidebarCollapsed || isPinned || (hoverState && !isMobile)}
				<nav class="flex-1 px-nav-container py-nav-container overflow-y-auto" transition:fade={{ duration: 200 }}>
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
			{#if (!sidebarCollapsed || isPinned || (hoverState && !isMobile)) && !isMobile}
				<div class="px-nav-container py-nav-container border-t border-sidebar" transition:fade={{ duration: 200 }}>
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
		class="bg-sidebar text-sidebar-primary flex flex-col border-r border-sidebar overflow-hidden h-full"
		class:fixed={(sidebarCollapsed && !isMobile && hoverState) || (isMobile && !sidebarCollapsed)}
		class:z-50={(sidebarCollapsed && !isMobile && hoverState) || (isMobile && !sidebarCollapsed)}
		style="width: {displayWidth()}px; transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1);"
		class:hidden={isMobile && sidebarCollapsed}
		onmouseenter={() => {
			// Clear any pending hide timeout
			if (hoverTimeoutId) {
				clearTimeout(hoverTimeoutId);
				hoverTimeoutId = null;
			}
			setHoverState(true, 0);
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
			// Use debounced hover state
			setHoverState(false, 200);
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
		{#if !sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)}
			<nav class="flex-1 px-nav-container py-nav-container overflow-y-auto">
				<!-- Inbox -->
				<a
					href="/inbox"
					class="group relative flex items-center gap-icon px-nav-item py-nav-item rounded-md hover:bg-sidebar-hover transition-all duration-150 text-sm text-sidebar-secondary hover:text-sidebar-primary"
					class:justify-center={isMobile && sidebarCollapsed}
					title={isMobile && sidebarCollapsed ? 'Inbox' : ''}
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
					class:justify-center={isMobile && sidebarCollapsed}
					title={isMobile && sidebarCollapsed ? 'Flashcards' : ''}
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
		{#if (!sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)) && !isMobile}
			<div class="px-nav-container py-nav-container border-t border-sidebar" transition:fade={{ duration: 200 }}>
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

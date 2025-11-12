<script lang="ts">
import { goto } from '$app/navigation';
import { browser, dev } from '$app/environment';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { getContext } from 'svelte';
	import ResizableSplitter from './ResizableSplitter.svelte';
	import SidebarHeader from './sidebar/SidebarHeader.svelte';
	import CleanReadwiseButton from './sidebar/CleanReadwiseButton.svelte';
	import TeamList from './organizations/TeamList.svelte';
	import CreateMenu from './sidebar/CreateMenu.svelte';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';
	import { useAuthSession } from '$lib/composables/useAuthSession.svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { Id } from '$lib/convex';

	type Props = {
		inboxCount: number;
		isMobile: boolean;
		sidebarCollapsed: boolean;
		onToggleCollapse: () => void;
		sidebarWidth?: number;
		onSidebarWidthChange?: (width: number) => void;
		createMenuOpen?: boolean;
		onCreateMenuChange?: (open: boolean) => void;
		onQuickCreate?: (trigger: 'header_button' | 'footer_button') => void;
		user?: { email: string; firstName?: string; lastName?: string } | null;
	};

	let {
		inboxCount,
		isMobile,
		sidebarCollapsed,
		onToggleCollapse,
		sidebarWidth = 256,
		onSidebarWidthChange,
		createMenuOpen = false,
		onCreateMenuChange,
		onQuickCreate,
		user = null
	}: Props = $props();

	// Get user info from props (passed from layout)
	const accountEmail = user?.email ?? 'user@example.com';
	const accountName = user?.firstName
		? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
		: 'Personal workspace';
	const organizations = getContext<UseOrganizations | undefined>('organizations');
	const authSession = useAuthSession();

	// Get available accounts from localStorage (not database)
	// This ensures only accounts with active sessions are shown
	const linkedAccounts = $derived(authSession.availableAccounts ?? []);

	// Fetch organizations for each linked account
	// Use a Map to maintain queries keyed by userId for proper reactivity
	const orgQueriesMap = new Map<string, ReturnType<typeof useQuery>>();

	// Create/update queries reactively when linkedAccounts changes
	$effect(() => {
		if (!browser) return;

		// Get current account IDs
		const currentAccountIds = new Set(linkedAccounts.map((a) => a.userId));

		// Remove queries for accounts that are no longer linked
		for (const userId of orgQueriesMap.keys()) {
			if (!currentAccountIds.has(userId)) {
				orgQueriesMap.delete(userId);
			}
		}

		// Create queries for new accounts
		for (const account of linkedAccounts) {
			if (!orgQueriesMap.has(account.userId)) {
				const query = useQuery(api.organizations.listOrganizations, () => ({
					userId: account.userId as Id<'users'>
				}));
				orgQueriesMap.set(account.userId, query);
			}
		}
	});

	const linkedAccountOrganizations = $derived(
		linkedAccounts.map((account) => ({
			userId: account.userId,
			email: account.email,
			name: account.name,
			firstName: account.firstName,
			lastName: account.lastName,
			organizations: (orgQueriesMap.get(account.userId)?.data ?? []) as any[]
		}))
	);

	let isPinned = $state(false);
	let isHovered = $state(false);
	let isHoveringRightEdge = $state(false); // Track if mouse is near right edge for resize handle
	let hoverTimeoutId: ReturnType<typeof setTimeout> | null = null;
	let hoverZoneTimeoutId: ReturnType<typeof setTimeout> | null = null;

	// Track mouse position globally to close sidebar when mouse goes too far right
	function handleDocumentMouseMove(e: MouseEvent) {
		if (!sidebarCollapsed || isMobile || !hoverState) return;

		const target = e.target as HTMLElement | null;
		if (target) {
			// Check if mouse is over dropdown menu
			const isOverDropdown =
				target.closest('[data-radix-portal]') ||
				target.closest('[role="menu"]') ||
				target.closest('[data-radix-dropdown-menu-content]') ||
				target.closest('[data-bits-ui-dropdown-menu-content]');

			if (isOverDropdown) {
				// Cancel any pending hide timeout
				if (hoverDebounceTimeout) {
					clearTimeout(hoverDebounceTimeout);
					hoverDebounceTimeout = null;
				}
				setHoverState(true, 0);
				return;
			}
		}

		// Check if mouse is over sidebar or hover zone - keep open
		const sidebarElement = document.querySelector('aside.fixed, aside:not(.hidden)');
		const hoverZoneElement = document.querySelector('[role="presentation"]');

		if (sidebarElement) {
			const sidebarRect = sidebarElement.getBoundingClientRect();
			if (e.clientX >= sidebarRect.left && e.clientX <= sidebarRect.right) {
				// Mouse is over sidebar - keep open
				if (hoverDebounceTimeout) {
					clearTimeout(hoverDebounceTimeout);
					hoverDebounceTimeout = null;
				}
				return;
			}
		}

		if (hoverZoneElement) {
			const hoverZoneRect = hoverZoneElement.getBoundingClientRect();
			if (e.clientX >= hoverZoneRect.left && e.clientX <= hoverZoneRect.right) {
				// Mouse is over hover zone - keep open
				if (hoverDebounceTimeout) {
					clearTimeout(hoverDebounceTimeout);
					hoverDebounceTimeout = null;
				}
				return;
			}
		}

		// Check if mouse has moved too far to the right - close sidebar
		// Get sidebar position to calculate threshold
		if (sidebarElement) {
			const sidebarRect = sidebarElement.getBoundingClientRect();
			const rightEdge = sidebarRect.right;
			const closeThreshold = rightEdge + sidebarWidth * 0.1;

			// Only close if mouse is far to the right (beyond threshold)
			// This allows moving mouse back into screen without closing
			if (e.clientX >= closeThreshold) {
				setHoverState(false, 200);
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
		!isMobile && !isCollapsing && (!sidebarCollapsed || (sidebarCollapsed && hoverState))
	);

	const visibleTeams = $derived(() => organizations?.teams ?? []);
	const teamInvites = $derived(() => organizations?.teamInvites ?? []);
	const activeTeamId = $derived(() => organizations?.activeTeamId ?? null);

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
		class="pointer-events-auto fixed top-0 bottom-0 left-0 hover:bg-transparent"
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
			// Don't close on hover zone leave - let global mouse tracker handle closing
			// The global tracker will close when mouse goes too far right
			// This allows mouse to exit on left and come back without closing
		}}
		role="presentation"
	></div>
{/if}

<!-- Mobile Hamburger Button removed - using SidebarToggle in InboxHeader instead -->

<!-- Mobile Backdrop Overlay (shown when sidebar is open on mobile) -->
{#if isMobile && !sidebarCollapsed}
	<div
		class="fixed inset-0 z-40 bg-black/50 transition-opacity"
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
			class="flex h-full flex-col overflow-hidden border-r border-sidebar bg-sidebar text-sidebar-primary"
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
			onmouseleave={(e) => {
				// Don't close immediately on mouseleave - let global mouse tracker handle it
				// This allows mouse to exit on left side without closing
				// Reset handle visibility
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
				workspaceName={accountName}
				{accountEmail}
				linkedAccounts={linkedAccountOrganizations}
				{sidebarCollapsed}
				{isMobile}
				{isHovered}
				onSettings={() => {
					goto('/settings');
				}}
				onInviteMembers={() => {
					goto('/settings');
				}}
				onSwitchWorkspace={() => {
					console.log('Switch workspace menu selected');
				}}
				onCreateWorkspace={() => {
					console.log('Create workspace menu selected');
				}}
				onAddAccount={() => {
					const currentPath = browser
						? `${window.location.pathname}${window.location.search}`
						: '/inbox';
					const params = new URLSearchParams({
						linkAccount: '1',
						redirect: currentPath
					});
					goto(`/login?${params.toString()}`);
				}}
				onSwitchAccount={(targetUserId, redirectTo) => {
					authSession.switchAccount(targetUserId, redirectTo);
				}}
				onLogout={() => {
					authSession.logout();
				}}
			/>

			<!-- Navigation - Scrollable area -->
			{#if !sidebarCollapsed || isPinned || (hoverState && !isMobile)}
				<nav
					class="flex-1 overflow-y-auto px-nav-container py-nav-container"
					transition:fade={{ duration: 200 }}
				>
					<!-- My Mind -->
					<a
						href="/my-mind"
						class="group relative flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						title="My Mind"
					>
						<!-- Icon -->
						<svg
							class="h-4 w-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
							/>
						</svg>
						<span class="min-w-0 flex-1 font-normal">My Mind</span>
					</a>

					<!-- Inbox -->
					<a
						href="/inbox"
						class="group relative flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						title="Inbox"
					>
						<!-- Icon -->
						<svg
							class="h-4 w-4 flex-shrink-0"
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
						<span class="min-w-0 flex-1 font-normal">Inbox</span>
						{#if inboxCount > 0}
							<span
								class="min-w-[18px] flex-shrink-0 rounded bg-sidebar-badge px-badge py-badge text-center text-label font-medium text-sidebar-badge"
							>
								{inboxCount}
							</span>
						{/if}
					</a>

					<!-- Flashcards -->
					<a
						href="/flashcards"
						class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						title="Flashcards"
					>
						<!-- Icon -->
						<svg
							class="h-4 w-4 flex-shrink-0"
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

					<!-- Study -->
					<a
						href="/study"
						class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						title="Study Session"
					>
						<!-- Icon -->
						<svg
							class="h-4 w-4 flex-shrink-0"
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
						<span class="font-normal">Study</span>
					</a>

					<!-- Tags -->
					<a
						href="/tags"
						class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						title="Tags"
					>
						<!-- Icon -->
						<svg
							class="h-4 w-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
							/>
						</svg>
						<span class="font-normal">Tags</span>
					</a>

					{#if organizations}
						<TeamList
							teams={visibleTeams()}
							teamInvites={teamInvites()}
							activeTeamId={activeTeamId()}
							{sidebarCollapsed}
							{isMobile}
							onSelectTeam={(teamId) => organizations.setActiveTeam(teamId)}
							onCreateTeam={() => organizations.openModal('createTeam')}
							onJoinTeam={() => organizations.openModal('joinTeam')}
							onAcceptInvite={(inviteId) => organizations.acceptTeamInvite(inviteId)}
							onDeclineInvite={(inviteId) => organizations.declineTeamInvite(inviteId)}
						/>
					{/if}
				</nav>
			{/if}


			<!-- Development Test Menu (only in dev mode) -->
			{#if dev && (!sidebarCollapsed || isPinned || (hoverState && !isMobile)) && !isMobile}
				<div
					class="border-t border-sidebar px-nav-container py-nav-container"
					transition:fade={{ duration: 200 }}
				>
					<div class="px-section py-section">
						<p class="mb-1.5 text-label font-medium tracking-wider text-sidebar-tertiary uppercase">
							🧪 Development
						</p>
						<div class="space-y-0.5">
							<a
								href="/test/claude"
								class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
							>
								<svg
									class="h-4 w-4 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
									/>
								</svg>
								<span class="font-normal">Claude Test</span>
							</a>
							<a
								href="/test/readwise"
								class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
							>
								<svg
									class="h-4 w-4 flex-shrink-0"
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
								<span class="font-normal">Readwise Test</span>
							</a>
							<a
								href="/dev-docs"
								target="_blank"
								rel="noopener noreferrer"
								class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
							>
								<svg
									class="h-4 w-4 flex-shrink-0"
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
								<span class="font-normal">Dev Docs</span>
							</a>
							<CleanReadwiseButton />
						</div>
					</div>
				</div>
			{/if}
		</aside>
	</ResizableSplitter>
{:else}
	<aside
		class="flex h-full flex-col overflow-hidden border-r border-sidebar bg-sidebar text-sidebar-primary"
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
			if (
				relatedTarget &&
				(relatedTarget.closest('[data-radix-portal]') ||
					relatedTarget.closest('[role="menu"]') ||
					relatedTarget.closest('[data-radix-dropdown-menu-content]') ||
					relatedTarget.closest('[data-bits-ui-dropdown-menu-content]'))
			) {
				// Don't hide - mouse is going to dropdown
				return;
			}

			// Don't close immediately on mouseleave - let global mouse tracker handle it
			// This allows mouse to exit on left side without closing, and will close
			// when mouse moves too far to the right via the global tracker
		}}
	>
		<!-- Sticky Header with Workspace Menu -->
		<SidebarHeader
			workspaceName={accountName}
			{accountEmail}
			{sidebarCollapsed}
			{isMobile}
			{isHovered}
			onSettings={() => {
				if (typeof window !== 'undefined') {
					window.location.href = '/settings';
				}
			}}
			onLogout={() => {
				authSession.logout();
			}}
		/>

		<!-- Navigation -->
		{#if !sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)}
			<nav class="flex-1 overflow-y-auto px-nav-container py-nav-container">
				<!-- My Mind -->
				<a
					href="/my-mind"
					class="group relative flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:justify-center={isMobile && sidebarCollapsed}
					title={isMobile && sidebarCollapsed ? 'My Mind' : ''}
				>
					<svg
						class="h-4 w-4 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						/>
					</svg>
					{#if !isMobile || !sidebarCollapsed}
						<span class="font-normal">My Mind</span>
					{/if}
				</a>

				<!-- Inbox -->
				<a
					href="/inbox"
					class="group relative flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:justify-center={isMobile && sidebarCollapsed}
					title={isMobile && sidebarCollapsed ? 'Inbox' : ''}
				>
					<svg
						class="h-4 w-4 flex-shrink-0"
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
						<span class="min-w-0 flex-1 font-normal">Inbox</span>
						{#if inboxCount > 0}
							<span
								class="min-w-[18px] flex-shrink-0 rounded bg-sidebar-badge px-badge py-badge text-center text-label font-medium text-sidebar-badge"
							>
								{inboxCount}
							</span>
						{/if}
					{:else if isMobile && sidebarCollapsed}
						{#if inboxCount > 0}
							<span
								class="absolute top-0 right-0 rounded bg-sidebar-badge px-1 py-0.5 text-label leading-none font-medium text-sidebar-badge"
							>
								{inboxCount}
							</span>
						{/if}
					{:else}
						<span class="font-normal">Inbox</span>
						{#if inboxCount > 0}
							<span
								class="min-w-[18px] flex-shrink-0 rounded bg-sidebar-badge px-badge py-badge text-center text-label font-medium text-sidebar-badge"
							>
								{inboxCount}
							</span>
						{/if}
					{/if}
				</a>

				<!-- Flashcards -->
				<a
					href="/flashcards"
					class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:justify-center={isMobile && sidebarCollapsed}
					title={isMobile && sidebarCollapsed ? 'Flashcards' : ''}
				>
					<svg
						class="h-4 w-4 flex-shrink-0"
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

				<!-- Study -->
				<a
					href="/study"
					class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:justify-center={isMobile && sidebarCollapsed}
					title={isMobile && sidebarCollapsed ? 'Study' : ''}
				>
					<svg
						class="h-4 w-4 flex-shrink-0"
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
					{#if !isMobile || !sidebarCollapsed}
						<span class="font-normal">Study</span>
					{/if}
				</a>

				<!-- Tags -->
				<a
					href="/tags"
					class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:justify-center={isMobile && sidebarCollapsed}
					title={isMobile && sidebarCollapsed ? 'Tags' : ''}
				>
					<svg
						class="h-4 w-4 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
						/>
					</svg>
					{#if !isMobile || !sidebarCollapsed}
						<span class="font-normal">Tags</span>
					{/if}
				</a>

				{#if organizations}
					<TeamList
						teams={visibleTeams()}
						teamInvites={teamInvites()}
						activeTeamId={activeTeamId()}
						{sidebarCollapsed}
						{isMobile}
						onSelectTeam={(teamId) => organizations.setActiveTeam(teamId)}
						onCreateTeam={() => organizations.openModal('createTeam')}
						onJoinTeam={() => organizations.openModal('joinTeam')}
						onAcceptInvite={(inviteId) => organizations.acceptTeamInvite(inviteId)}
						onDeclineInvite={(inviteId) => organizations.declineTeamInvite(inviteId)}
					/>
				{/if}
			</nav>
		{/if}


		<!-- Development Test Menu (only in dev mode) -->
		{#if dev && (!sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)) && !isMobile}
			<div
				class="border-t border-sidebar px-nav-container py-nav-container"
				transition:fade={{ duration: 200 }}
			>
				<div class="px-section py-section">
					<p class="mb-1.5 text-label font-medium tracking-wider text-sidebar-tertiary uppercase">
						🧪 Development
					</p>
					<div class="space-y-0.5">
						<a
							href="/test/claude"
							class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						>
							<svg
								class="h-4 w-4 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
								/>
							</svg>
							<span class="font-normal">Claude Test</span>
						</a>
						<a
							href="/test/readwise"
							class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						>
							<svg
								class="h-4 w-4 flex-shrink-0"
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
							<span class="font-normal">Readwise Test</span>
						</a>
						<a
							href="/dev-docs"
							target="_blank"
							rel="noopener noreferrer"
							class="group flex items-center gap-icon rounded-md px-nav-item py-nav-item text-sm text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						>
							<svg
								class="h-4 w-4 flex-shrink-0"
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
							<span class="font-normal">Dev Docs</span>
						</a>
						<CleanReadwiseButton />
					</div>
				</div>
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

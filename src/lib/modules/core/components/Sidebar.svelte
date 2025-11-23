<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser, dev } from '$app/environment';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { getContext } from 'svelte';
	import ResizableSplitter from '$lib/components/organisms/ResizableSplitter.svelte';
	import SidebarHeader from '$lib/modules/core/components/SidebarHeader.svelte';
	import CleanReadwiseButton from '$lib/modules/core/components/CleanReadwiseButton.svelte';
	import { LoadingOverlay } from '$lib/components/atoms';
	import type {
		OrganizationsModuleAPI,
		OrganizationSummary
	} from '$lib/modules/core/organizations/composables/useOrganizations.svelte';
	import { useAuthSession } from '$lib/infrastructure/auth/composables/useAuthSession.svelte';
	import { resolveRoute } from '$lib/utils/navigation';

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
		circlesEnabled?: boolean;
		meetingsEnabled?: boolean;
		dashboardEnabled?: boolean;
	};

	let {
		inboxCount,
		isMobile,
		sidebarCollapsed,
		onToggleCollapse,
		sidebarWidth: sidebarWidthProp,
		onSidebarWidthChange,
		createMenuOpen: _createMenuOpen = false,
		onCreateMenuChange: _onCreateMenuChange,
		onQuickCreate: _onQuickCreate,
		user = null,
		circlesEnabled = false,
		meetingsEnabled = false,
		dashboardEnabled = false
	}: Props = $props();

	// Initialize sidebarWidth from prop or token
	// Technical constant (not design value): rem-to-px conversion factor
	const REM_TO_PX_FACTOR = 16; // Standard browser rem base (not a design token)
	let sidebarWidth = $state(sidebarWidthProp ?? 0); // Will be set from token if prop not provided
	$effect(() => {
		if (sidebarWidthProp !== undefined) {
			sidebarWidth = sidebarWidthProp;
			return;
		}
		// Fallback: read from token if prop not provided (shouldn't happen in practice)
		if (!browser) return;
		const tokenValue = getComputedStyle(document.documentElement)
			.getPropertyValue('--size-sidebar-default')
			.trim();
		if (tokenValue) {
			const remValue = parseFloat(tokenValue);
			sidebarWidth = remValue * REM_TO_PX_FACTOR;
		}
	});

	// Get user info from props (passed from layout)
	const accountEmail = user?.email ?? 'user@example.com';
	const accountName = user?.firstName
		? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
		: accountEmail;
	// PROOF OF CONCEPT: Using OrganizationsModuleAPI interface instead of UseOrganizations type
	// This demonstrates loose coupling - component depends on interface, not internal implementation
	const organizations = getContext<OrganizationsModuleAPI | undefined>('organizations');
	const authSession = useAuthSession();

	// Get active organization ID for org-scoped links
	const activeOrgId = $derived(() => {
		if (!organizations) return null;
		return organizations.activeOrganizationId ?? null;
	});

	// circlesEnabled is now passed as a prop from the layout (loaded early for instant rendering)

	// Get available accounts from localStorage (not database)
	// This ensures only accounts with active sessions are shown
	const linkedAccounts = $derived(() => {
		const accounts = authSession.availableAccounts ?? [];
		return accounts;
	});

	// Store organizations for each linked account (loaded from localStorage cache)
	// Organizations are cached in localStorage when accounts are active
	const LINKED_ACCOUNT_ORGS_KEY_PREFIX = 'linkedAccountOrgs_';
	const linkedAccountOrgsMap = $state<Record<string, OrganizationSummary[]>>({});

	// Load cached organizations for linked accounts from localStorage
	// CRITICAL: This effect must run reactively when linkedAccounts() changes
	// Also checks cache periodically to catch async updates from useAuthSession
	$effect(() => {
		if (!browser) return;

		const loadCacheForAccounts = () => {
			try {
				const accounts = linkedAccounts();

				for (const account of accounts) {
					if (!account.userId) continue;

					// Always check cache (don't skip) - cache might be updated by useAuthSession
					const cacheKey = `${LINKED_ACCOUNT_ORGS_KEY_PREFIX}${account.userId}`;
					const cached = localStorage.getItem(cacheKey);

					if (cached) {
						try {
							const orgs = JSON.parse(cached) as OrganizationSummary[];
							if (Array.isArray(orgs)) {
								// Only update if different to avoid unnecessary reactivity triggers
								const currentOrgs = linkedAccountOrgsMap[account.userId];
								if (!currentOrgs || JSON.stringify(currentOrgs) !== JSON.stringify(orgs)) {
									linkedAccountOrgsMap[account.userId] = orgs;
								}
							}
						} catch (_e) {
							// Invalid cache, clear it
							localStorage.removeItem(cacheKey);
						}
					} else {
						// Cache was removed, clear from map
						if (linkedAccountOrgsMap[account.userId]) {
							delete linkedAccountOrgsMap[account.userId];
						}
					}
				}
			} catch (error) {
				console.error('Error loading cached organizations for linked accounts:', error);
			}
		};

		// Load cache initially and when linkedAccounts changes
		loadCacheForAccounts();

		// Also check cache after a short delay to catch async updates from useAuthSession
		// This ensures we pick up organizations cached by /auth/linked-sessions endpoint
		const timeoutId = setTimeout(() => {
			loadCacheForAccounts();
		}, 500);

		// Listen for storage events (for cross-tab updates)
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key && e.key.startsWith(LINKED_ACCOUNT_ORGS_KEY_PREFIX)) {
				loadCacheForAccounts();
			}
		};

		window.addEventListener('storage', handleStorageChange);

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener('storage', handleStorageChange);
		};
	});

	// Cache current user's organizations when they change (so they're available when switching accounts)
	$effect(() => {
		if (!browser || !organizations) return;

		try {
			const currentUserId = authSession.user?.userId;
			if (!currentUserId) return;

			const orgs = organizations.organizations ?? [];
			if (orgs.length > 0) {
				const cacheKey = `${LINKED_ACCOUNT_ORGS_KEY_PREFIX}${currentUserId}`;
				localStorage.setItem(cacheKey, JSON.stringify(orgs));
			}
		} catch (error) {
			console.error('Error caching organizations:', error);
		}
	});

	// Map linked accounts with their organizations
	// CRITICAL: Access linkedAccountOrgsMap reactively to ensure updates trigger re-render
	const linkedAccountOrganizations = $derived(() => {
		// Access the map to ensure reactivity tracking
		const map = linkedAccountOrgsMap;
		const accounts = linkedAccounts();
		const mapped = accounts.map((account) => ({
			userId: account.userId,
			email: account.email,
			name: account.name ?? null,
			firstName: account.firstName ?? null,
			lastName: account.lastName ?? null,
			organizations: map[account.userId] ?? []
		}));

		console.log('🔍 [Sidebar] Linked account organizations mapped:', {
			accountsLength: accounts.length,
			mappedLength: mapped.length,
			mapKeys: Object.keys(map),
			mapped: mapped.map((a) => ({
				userId: a.userId,
				email: a.email,
				orgCount: a.organizations.length,
				cachedOrgs: map[a.userId]?.length ?? 0
			}))
		});

		return mapped;
	});

	let isPinned = $state(false);
	let isHovered = $state(false);
	let isHoveringRightEdge = $state(false); // Track if mouse is near right edge for resize handle
	let hoverTimeoutId: ReturnType<typeof setTimeout> | null = null;
	let hoverZoneTimeoutId: ReturnType<typeof setTimeout> | null = null;

	// Immediate overlay state for account switching (shows before page reload)
	let accountSwitchOverlay = $state<{
		show: boolean;
		targetName: string | null;
	}>({
		show: false,
		targetName: null
	});

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
		class="pointer-events-auto fixed top-0 bottom-0 left-0 z-sidebar w-sidebar-hover-zone hover:bg-transparent"
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
			class="pointer-events-auto z-sidebar flex h-full flex-col overflow-hidden border-r border-sidebar bg-sidebar text-sidebar-primary"
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
				linkedAccounts={linkedAccountOrganizations()}
				{sidebarCollapsed}
				{isMobile}
				{isHovered}
				onSettings={() => {
					goto(resolveRoute('/settings'));
				}}
				onInviteMembers={() => {
					goto(resolveRoute('/settings'));
				}}
				onSwitchWorkspace={() => {
					// Switch workspace functionality
				}}
				onCreateWorkspace={() => {
					organizations?.openModal('createOrganization');
				}}
				onCreateWorkspaceForAccount={async (targetUserId) => {
					// Switch to the target account and redirect to open create modal
					await authSession.switchAccount(targetUserId, '/inbox?create=organization');
				}}
				onJoinWorkspaceForAccount={async (targetUserId) => {
					// Switch to the target account and redirect to open join modal
					await authSession.switchAccount(targetUserId, '/inbox?join=organization');
				}}
				onAddAccount={() => {
					const currentPath = browser
						? `${window.location.pathname}${window.location.search}`
						: '/inbox';
					const params = new URLSearchParams({
						linkAccount: '1',
						redirect: currentPath
					});
					const loginPath = resolveRoute('/login');
					goto(`${loginPath}?${params.toString()}`);
				}}
				onSwitchAccount={async (targetUserId, redirectTo) => {
					// Find the account being switched to
					const targetAccount = linkedAccountOrganizations().find((a) => a.userId === targetUserId);
					const targetName =
						targetAccount?.firstName || targetAccount?.name || targetAccount?.email || 'account';

					// Show overlay IMMEDIATELY before API call/redirect
					accountSwitchOverlay.show = true;
					accountSwitchOverlay.targetName = targetName;

					try {
						// Then perform the switch (which will set sessionStorage and redirect)
						await authSession.switchAccount(targetUserId, redirectTo);
					} catch (error) {
						// Reset overlay if switch fails
						accountSwitchOverlay.show = false;
						accountSwitchOverlay.targetName = '';
						console.error('Failed to switch account:', error);
						// Optionally show error toast to user
					}
				}}
				onLogout={() => {
					authSession.logout();
				}}
				onLogoutAccount={(targetUserId) => {
					authSession.logoutAccount(targetUserId);
				}}
			/>

			<!-- Navigation - Scrollable area -->
			{#if !sidebarCollapsed || isPinned || (hoverState && !isMobile)}
				<nav
					class="flex-1 overflow-y-auto px-nav-container py-nav-container"
					transition:fade={{ duration: 200 }}
				>
					<!-- Inbox -->
					<a
						href={resolveRoute('/inbox')}
						class="group relative flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						title="Inbox"
					>
						<!-- Icon -->
						<svg
							class="icon-sm flex-shrink-0"
							style="width: 16px; height: 16px;"
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
						href={resolveRoute('/flashcards')}
						class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						title="Flashcards"
					>
						<!-- Icon -->
						<svg
							class="icon-sm flex-shrink-0"
							style="width: 16px; height: 16px;"
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
						href={resolveRoute('/study')}
						class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						title="Study Session"
					>
						<!-- Icon -->
						<svg
							class="icon-sm flex-shrink-0"
							style="width: 16px; height: 16px;"
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
						href={resolveRoute('/tags')}
						class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						title="Tags"
					>
						<!-- Icon -->
						<svg
							class="icon-sm flex-shrink-0"
							style="width: 16px; height: 16px;"
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

					<!-- Circles (Beta - Feature Flag) -->
					{#if circlesEnabled}
						<a
							href={resolveRoute(
								activeOrgId() ? `/org/circles?org=${activeOrgId()}` : '/org/circles'
							)}
							class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
							title="Circles"
						>
							<!-- Icon: Organization/Circles -->
							<svg
								class="icon-sm flex-shrink-0"
								style="width: 16px; height: 16px;"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
							<span class="font-normal">Circles</span>
						</a>
					{/if}

					<!-- Members -->
					<a
						href={resolveRoute(
							activeOrgId() ? `/org/members?org=${activeOrgId()}` : '/org/members'
						)}
						class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						title="Members"
					>
						<!-- Icon: Users -->
						<svg
							class="icon-sm flex-shrink-0"
							style="width: 16px; height: 16px;"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
						<span class="font-normal">Members</span>
					</a>

					<!-- Dashboard (Beta - Feature Flag) -->
					{#if dashboardEnabled}
						<a
							href={resolveRoute('/dashboard')}
							class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
							title="Dashboard"
						>
							<!-- Icon: Clipboard List -->
							<svg
								class="icon-sm flex-shrink-0"
								style="width: 16px; height: 16px;"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
								/>
							</svg>
							<span class="font-normal">Dashboard</span>
						</a>
					{/if}

					<!-- Meetings (Beta - Feature Flag) -->
					{#if meetingsEnabled}
						<a
							href={resolveRoute('/meetings')}
							class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
							title="Meetings"
						>
							<!-- Icon: Calendar -->
							<svg
								class="icon-sm flex-shrink-0"
								style="width: 16px; height: 16px;"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							<span class="font-normal">Meetings</span>
						</a>
					{/if}

					<!-- Favorites Section -->
					<section class="mt-content-section">
						{#if !sidebarCollapsed || isMobile}
							<div class="flex items-center justify-between px-section py-section">
								<p class="text-label font-medium tracking-wider text-sidebar-tertiary uppercase">
									Favorites
								</p>
								<div class="flex items-center gap-icon-wide">
									<!-- Placeholder for future action buttons -->
								</div>
							</div>
						{/if}

						<div class="space-y-form-field-gap">
							<!-- Empty state - content will be added later -->
						</div>

						{#if !sidebarCollapsed || isMobile}
							<p class="px-section py-section text-label text-sidebar-tertiary">
								No favorites yet.
							</p>
						{/if}
					</section>
				</nav>
			{/if}

			<!-- Development Test Menu (only in dev mode) -->
			{#if dev && (!sidebarCollapsed || isPinned || (hoverState && !isMobile)) && !isMobile}
				<div
					class="border-t border-sidebar px-nav-container py-nav-container"
					transition:fade={{ duration: 200 }}
				>
					<div class="px-section py-section">
						<p
							class="mb-form-field-gap text-label font-medium tracking-wider text-sidebar-tertiary uppercase"
						>
							🧪 Development
						</p>
						<div class="space-y-form-field-gap">
							<a
								href={resolveRoute('/test/claude')}
								class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
							>
								<svg
									class="icon-sm flex-shrink-0"
									style="width: 16px; height: 16px;"
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
								href={resolveRoute('/test/readwise')}
								class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
							>
								<svg
									class="icon-sm flex-shrink-0"
									style="width: 16px; height: 16px;"
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
								href={resolveRoute('/dev-docs')}
								target="_blank"
								rel="noopener noreferrer"
								class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
							>
								<svg
									class="icon-sm flex-shrink-0"
									style="width: 16px; height: 16px;"
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
			linkedAccounts={linkedAccountOrganizations()}
			{sidebarCollapsed}
			{isMobile}
			{isHovered}
			onSettings={() => {
				if (typeof window !== 'undefined') {
					window.location.href = resolveRoute('/settings');
				}
			}}
			onInviteMembers={() => {
				if (typeof window !== 'undefined') {
					window.location.href = resolveRoute('/settings');
				}
			}}
			onSwitchWorkspace={() => {
				console.log('Switch workspace menu selected');
			}}
			onCreateWorkspace={() => {
				organizations?.openModal('createOrganization');
			}}
			onCreateWorkspaceForAccount={async (targetUserId) => {
				// Switch to the target account and redirect to open create modal
				await authSession.switchAccount(targetUserId, '/inbox?create=organization');
			}}
			onJoinWorkspaceForAccount={async (targetUserId) => {
				// Switch to the target account and redirect to open join modal
				await authSession.switchAccount(targetUserId, '/inbox?join=organization');
			}}
			onAddAccount={() => {
				const currentPath = browser
					? `${window.location.pathname}${window.location.search}`
					: '/inbox';
				const params = new URLSearchParams({
					linkAccount: '1',
					redirect: currentPath
				});
				const loginPath = resolveRoute('/login');
				goto(`${loginPath}?${params.toString()}`);
			}}
			onSwitchAccount={async (targetUserId, redirectTo) => {
				// Find the account being switched to
				const targetAccount = linkedAccountOrganizations().find((a) => a.userId === targetUserId);
				const targetName =
					targetAccount?.firstName || targetAccount?.name || targetAccount?.email || 'account';

				// Show overlay IMMEDIATELY before API call/redirect
				accountSwitchOverlay.show = true;
				accountSwitchOverlay.targetName = targetName;

				try {
					// Then perform the switch (which will set sessionStorage and redirect)
					await authSession.switchAccount(targetUserId, redirectTo);
				} catch (error) {
					// Reset overlay if switch fails
					accountSwitchOverlay.show = false;
					accountSwitchOverlay.targetName = '';
					console.error('Failed to switch account:', error);
					// Optionally show error toast to user
				}
			}}
			onLogout={() => {
				authSession.logout();
			}}
			onLogoutAccount={(targetUserId) => {
				authSession.logoutAccount(targetUserId);
			}}
		/>

		<!-- Navigation -->
		{#if !sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)}
			<nav class="flex-1 overflow-y-auto px-nav-container py-nav-container">
				<!-- Inbox -->
				<a
					href={resolveRoute('/inbox')}
					class="group relative flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:justify-center={isMobile && sidebarCollapsed}
					title={isMobile && sidebarCollapsed ? 'Inbox' : ''}
				>
					<svg
						class="icon-sm flex-shrink-0"
						style="width: 16px; height: 16px;"
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
								class="absolute top-0 right-0 rounded bg-sidebar-badge px-badge py-badge text-label leading-none font-medium text-sidebar-badge"
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
					href={resolveRoute('/flashcards')}
					class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:justify-center={isMobile && sidebarCollapsed}
					title={isMobile && sidebarCollapsed ? 'Flashcards' : ''}
				>
					<svg
						class="icon-sm flex-shrink-0"
						style="width: 16px; height: 16px;"
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
					href={resolveRoute('/study')}
					class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:justify-center={isMobile && sidebarCollapsed}
					title={isMobile && sidebarCollapsed ? 'Study' : ''}
				>
					<svg
						class="icon-sm flex-shrink-0"
						style="width: 16px; height: 16px;"
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
					href={resolveRoute('/tags')}
					class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
					class:justify-center={isMobile && sidebarCollapsed}
					title={isMobile && sidebarCollapsed ? 'Tags' : ''}
				>
					<svg
						class="icon-sm flex-shrink-0"
						style="width: 16px; height: 16px;"
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

				<!-- Favorites Section -->
				<section class="mt-content-section">
					{#if !sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)}
						<div class="flex items-center justify-between px-section py-section">
							<p class="text-label font-medium tracking-wider text-sidebar-tertiary uppercase">
								Favorites
							</p>
							<div class="flex items-center gap-form-field-gap">
								<!-- Placeholder for future action buttons -->
							</div>
						</div>
					{/if}

					<div class="space-y-form-field-gap">
						<!-- Empty state - content will be added later -->
					</div>

					{#if !sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)}
						<p class="px-section py-section text-label text-sidebar-tertiary">No favorites yet.</p>
					{/if}
				</section>
			</nav>
		{/if}

		<!-- Development Test Menu (only in dev mode) -->
		{#if dev && (!sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)) && !isMobile}
			<div
				class="border-t border-sidebar px-nav-container py-nav-container"
				transition:fade={{ duration: 200 }}
			>
				<div class="px-section py-section">
					<p
						class="mb-form-field-gap text-label font-medium tracking-wider text-sidebar-tertiary uppercase"
					>
						🧪 Development
					</p>
					<div class="space-y-form-field-gap">
						<a
							href={resolveRoute('/test/claude')}
							class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						>
							<svg
								class="icon-sm flex-shrink-0"
								style="width: 16px; height: 16px;"
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
							href={resolveRoute('/test/readwise')}
							class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						>
							<svg
								class="icon-sm flex-shrink-0"
								style="width: 16px; height: 16px;"
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
							href={resolveRoute('/dev-docs')}
							target="_blank"
							rel="noopener noreferrer"
							class="group flex items-center gap-icon rounded-button px-nav-item py-nav-item text-small text-sidebar-secondary transition-all duration-150 hover:bg-sidebar-hover hover:text-sidebar-primary"
						>
							<svg
								class="icon-sm flex-shrink-0"
								style="width: 16px; height: 16px;"
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

<!-- Immediate overlay for account switching (before page reload) -->
<!-- CRITICAL: Use 'account' or 'workspace' subtitle, never account name (prevents "Loading [name]") -->
{#if accountSwitchOverlay.show}
	<LoadingOverlay show={true} flow="workspace-switching" subtitle="account" />
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

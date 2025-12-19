<script lang="ts">
	/**
	 * DESIGN SYSTEM EXCEPTION: Navigation item spacing (SYOS-585)
	 *
	 * Navigation items use non-standard vertical padding (6px) that doesn't fit the base scale:
	 * - spacing.nav.item.y = 0.375rem (6px) - optimal for compact navigation design
	 *
	 * This value is hardcoded as py-[0.375rem] because it doesn't reference base tokens.
	 * See: dev-docs/2-areas/design/token-file-split-exception-mapping.md
	 */

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
	import { NavItem, ThemeToggle } from '$lib/components/molecules';
	import { StandardDialog } from '$lib/components/organisms';
	import { FormInput } from '$lib/components/atoms';
	import { sidebarRecipe } from '$lib/design-system/recipes';
	import type {
		WorkspacesModuleAPI,
		WorkspaceSummary
	} from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
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
		meetingsEnabled?: boolean; // Deprecated: Always true, kept for backward compatibility
		dashboardEnabled?: boolean; // Deprecated: Always true, kept for backward compatibility
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
		meetingsEnabled: _meetingsEnabled = true, // Always enabled - core feature
		dashboardEnabled = true // Always enabled - core feature
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
	// PROOF OF CONCEPT: Using WorkspacesModuleAPI interface instead of UseOrganizations type
	// This demonstrates loose coupling - component depends on interface, not internal implementation
	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const authSession = useAuthSession();

	// Get active workspace slug for path-based routing
	const activeWorkspaceSlug = $derived(() => {
		if (!workspaces) return null;
		return workspaces.activeWorkspace?.slug ?? null;
	});

	// Create workspace dialog state
	let showCreateWorkspaceDialog = $state(false);
	let newWorkspaceName = $state('');

	const handleCreateWorkspace = async () => {
		if (!workspaces || !newWorkspaceName.trim()) return;
		try {
			await workspaces.createWorkspace({ name: newWorkspaceName.trim() });
			showCreateWorkspaceDialog = false;
			newWorkspaceName = '';
		} catch (error) {
			// Error handling is done in the mutation handler (toast shown)
			// Keep dialog open so user can retry
		}
	};

	// Core features (circles, meetings) are always enabled

	// Get available accounts from localStorage (not database)
	// This ensures only accounts with active sessions are shown
	const linkedAccounts = $derived(() => {
		const accounts = authSession.availableAccounts ?? [];
		return accounts;
	});

	// Store workspaces for each linked account (loaded from localStorage cache)
	// Organizations are cached in localStorage when accounts are active
	const LINKED_ACCOUNT_ORGS_KEY_PREFIX = 'linkedAccountOrgs_';
	const linkedAccountOrgsMap = $state<Record<string, WorkspaceSummary[]>>({});

	// Load cached workspaces for linked accounts from localStorage
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
							const orgs = JSON.parse(cached) as WorkspaceSummary[];
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
				console.error('Error loading cached workspaces for linked accounts:', error);
			}
		};

		// Load cache initially and when linkedAccounts changes
		loadCacheForAccounts();

		// Also check cache after a short delay to catch async updates from useAuthSession
		// This ensures we pick up workspaces cached by /auth/linked-sessions endpoint
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

	// Cache current user's workspaces when they change (so they're available when switching accounts)
	$effect(() => {
		if (!browser || !workspaces) return;

		try {
			const currentUserId = authSession.user?.userId;
			if (!currentUserId) return;

			const orgs = workspaces.workspaces ?? [];
			if (orgs.length > 0) {
				const cacheKey = `${LINKED_ACCOUNT_ORGS_KEY_PREFIX}${currentUserId}`;
				localStorage.setItem(cacheKey, JSON.stringify(orgs));
			}
		} catch (error) {
			console.error('Error caching workspaces:', error);
		}
	});

	// Map linked accounts with their workspaces
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
			workspaces: map[account.userId] ?? []
		}));

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
	// Initialize with 0, then update reactively via $effect to avoid closure warning
	const animatedWidth = tweened(0, {
		duration: 250, // Gentle but responsive animation
		easing: cubicOut
	});

	// Update animated width when sidebarWidth or sidebarCollapsed changes
	$effect(() => {
		if (sidebarCollapsed || isMobile) {
			animatedWidth.set(0, { duration: 250, easing: cubicOut });
		} else {
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

	// Computed z-index for sidebar when fixed (mobile or hovered collapsed)
	const sidebarZIndex = $derived(() => {
		if ((sidebarCollapsed && !isMobile && hoverState) || (isMobile && !sidebarCollapsed)) {
			return 'var(--zIndex-modal)';
		}
		return '';
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
		class="w-sidebar-hover-zone pointer-events-auto fixed top-0 bottom-0 left-0 hover:bg-transparent"
		style="z-index: var(--zIndex-dropdown);"
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
		class="fixed inset-0 bg-black/50 transition-opacity"
		style="z-index: var(--zIndex-overlay);"
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
		minWidth={208}
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
			class="pointer-events-auto {sidebarRecipe()}"
			style="background-color: var(--color-component-sidebar-bg); border-color: var(--color-component-sidebar-border); z-index: var(--zIndex-sticky);"
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
					const slug = activeWorkspaceSlug();
					if (slug) {
						goto(resolveRoute(`/w/${slug}/settings`));
					} else {
						goto(resolveRoute('/settings'));
					}
				}}
				onInviteMembers={() => {
					const slug = activeWorkspaceSlug();
					if (slug) {
						goto(resolveRoute(`/w/${slug}/settings`));
					} else {
						goto(resolveRoute('/settings'));
					}
				}}
				onSwitchWorkspace={() => {
					// Switch workspace functionality
				}}
				onCreateWorkspace={() => {
					showCreateWorkspaceDialog = true;
				}}
				onCreateWorkspaceForAccount={async (targetUserId) => {
					// Switch to the target account and redirect to open create modal
					await authSession.switchAccount(targetUserId, '/auth/redirect?create=workspace');
				}}
				onJoinWorkspaceForAccount={async (targetUserId) => {
					// Switch to the target account and redirect to open join modal
					await authSession.switchAccount(targetUserId, '/auth/redirect?join=workspace');
				}}
				onAddAccount={() => {
					const currentPath = browser
						? `${window.location.pathname}${window.location.search}`
						: '/auth/redirect';
					const params = new URLSearchParams({
						linkAccount: '1',
						redirect: currentPath
					});
					const loginPath = resolveRoute('/login');
					goto(`${loginPath}?${params.toString()}`);
				}}
				onSwitchAccount={async (targetUserId, _redirectTo) => {
					// Find the account being switched to
					const targetAccount = linkedAccountOrganizations().find((a) => a.userId === targetUserId);
					const targetName =
						targetAccount?.firstName || targetAccount?.name || targetAccount?.email || 'account';

					// Show overlay IMMEDIATELY before API call/redirect
					accountSwitchOverlay.show = true;
					accountSwitchOverlay.targetName = targetName;

					try {
						// Don't pass redirectTo - server will resolve workspace inbox
						await authSession.switchAccount(targetUserId);
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
					class="flex-1 overflow-y-auto"
					style="padding-inline: var(--spacing-2); padding-block: var(--spacing-2);"
					transition:fade={{ duration: 200 }}
				>
					<!-- Top section (no label) -->
					<!-- Inbox -->
					<NavItem
						href={resolveRoute(
							activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/inbox` : '/auth/redirect'
						)}
						iconType="inbox"
						label="Inbox"
						badge={inboxCount > 0 ? inboxCount : undefined}
						title="Inbox"
						collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
					/>

					<!-- Org Chart -->
					<NavItem
						href={resolveRoute(
							activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/chart` : '/auth/redirect'
						)}
						iconType="orgChart"
						label="Org Chart"
						title="Organization Chart"
						collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
					/>

					<!-- Workspace Section -->
					<section style="margin-top: var(--spacing-content-sectionGap);">
						{#if !sidebarCollapsed || isMobile}
							<div
								class="flex items-center justify-between"
								style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);"
							>
								<p class="text-label text-tertiary font-medium tracking-wider uppercase">
									Workspace
								</p>
							</div>
						{/if}

						<div class="space-y-form-field-gap">
							<!-- Meetings -->
							<NavItem
								href={resolveRoute(
									activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/meetings` : '/auth/redirect'
								)}
								iconType="calendar"
								label="Meetings"
								title="Meetings"
								collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
							/>

							<!-- Proposals -->
							<NavItem
								href={resolveRoute(
									activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/proposals` : '/auth/redirect'
								)}
								iconType="document"
								label="Proposals"
								title="My Proposals"
								collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
							/>
						</div>
					</section>

					<!-- Favorites Section -->
					<section style="margin-top: var(--spacing-content-sectionGap);">
						{#if !sidebarCollapsed || isMobile}
							<div
								class="flex items-center justify-between"
								style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);"
							>
								<p class="text-label text-tertiary font-medium tracking-wider uppercase">
									Favorites
								</p>
								<div class="gap-header flex items-center">
									<!-- Placeholder for future action buttons -->
								</div>
							</div>
						{/if}

						<div class="space-y-form-field-gap">
							<!-- Empty state - content will be added later -->
						</div>

						{#if !sidebarCollapsed || isMobile}
							<p
								class="text-label text-tertiary"
								style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);"
							>
								No favorites yet.
							</p>
						{/if}
					</section>

					<!-- Your circles Section -->
					<section style="margin-top: var(--spacing-content-sectionGap);">
						{#if !sidebarCollapsed || isMobile}
							<div
								class="flex items-center justify-between"
								style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);"
							>
								<p class="text-label text-tertiary font-medium tracking-wider uppercase">
									Your circles
								</p>
							</div>
						{/if}

						<div class="space-y-form-field-gap">
							<!-- Empty state - content will be added later -->
						</div>
					</section>

					<!-- Legacy Section -->
					<section style="margin-top: var(--spacing-content-sectionGap);">
						{#if !sidebarCollapsed || isMobile}
							<div
								class="flex items-center justify-between"
								style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);"
							>
								<p class="text-label text-tertiary font-medium tracking-wider uppercase">Legacy</p>
							</div>
						{/if}

						<div class="space-y-form-field-gap">
							<!-- Circles -->
							<NavItem
								href={resolveRoute(
									activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/chart` : '/auth/redirect'
								)}
								iconType="circles"
								label="Circles"
								title="Circles"
								collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
							/>

							<!-- Flashcards -->
							<NavItem
								href={resolveRoute(
									activeWorkspaceSlug()
										? `/w/${activeWorkspaceSlug()}/flashcards`
										: '/auth/redirect'
								)}
								iconType="flashcards"
								label="Flashcards"
								title="Flashcards"
								collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
							/>

							<!-- Study -->
							<NavItem
								href={resolveRoute(
									activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/study` : '/auth/redirect'
								)}
								iconType="study"
								label="Study"
								title="Study Session"
								collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
							/>

							<!-- Tags -->
							<NavItem
								href={resolveRoute(
									activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/tags` : '/auth/redirect'
								)}
								iconType="tags"
								label="Tags"
								title="Tags"
								collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
							/>

							<!-- Members -->
							<NavItem
								href={resolveRoute(
									activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/members` : '/auth/redirect'
								)}
								iconType="members"
								label="Members"
								title="Members"
								collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
							/>

							<!-- Dashboard (Beta - Feature Flag) -->
							{#if dashboardEnabled}
								<NavItem
									href={resolveRoute(
										activeWorkspaceSlug()
											? `/w/${activeWorkspaceSlug()}/dashboard`
											: '/auth/redirect'
									)}
									iconType="dashboard"
									label="Dashboard"
									title="Dashboard"
									collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
								/>
							{/if}
						</div>
					</section>

					<!-- Theme Toggle -->
					<div
						class="flex items-center"
						style="padding-inline: var(--spacing-2); padding-block: var(--spacing-2); margin-top: var(--spacing-content-sectionGap);"
					>
						<ThemeToggle />
					</div>
				</nav>
			{/if}

			<!-- Development Test Menu (only in dev mode) -->
			{#if dev && (!sidebarCollapsed || isPinned || (hoverState && !isMobile)) && !isMobile}
				<div
					style="padding-inline: var(--spacing-2); padding-block: var(--spacing-2);"
					transition:fade={{ duration: 200 }}
				>
					<div style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);">
						<p
							class="mb-form-field-gap text-label text-tertiary font-medium tracking-wider uppercase"
						>
							🧪 Development
						</p>
						<div class="space-y-form-field-gap">
							<NavItem
								href={resolveRoute('/test/claude')}
								iconType="lightbulb"
								label="Claude Test"
								title="Claude Test"
								collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
							/>
							<NavItem
								href={resolveRoute('/test/readwise')}
								iconType="study"
								label="Readwise Test"
								title="Readwise Test"
								collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
							/>
							<NavItem
								href={resolveRoute('/dev-docs')}
								iconType="study"
								label="Dev Docs"
								title="Dev Docs"
								target="_blank"
								rel="noopener noreferrer"
								collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
							/>
							<NavItem
								href={resolveRoute('/admin')}
								iconType="settings"
								label="Admin"
								title="Admin"
								collapsed={sidebarCollapsed && !isPinned && !(hoverState && !isMobile)}
							/>
							<CleanReadwiseButton />
						</div>
					</div>
				</div>
			{/if}
		</aside>
	</ResizableSplitter>
{:else}
	<aside
		class={sidebarRecipe()}
		class:fixed={(sidebarCollapsed && !isMobile && hoverState) || (isMobile && !sidebarCollapsed)}
		style="width: {displayWidth()}px; transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1); background-color: var(--color-component-sidebar-bg); border-color: var(--color-component-sidebar-border); {sidebarZIndex()
			? `z-index: ${sidebarZIndex()};`
			: ''}"
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
					const slug = activeWorkspaceSlug();
					if (slug) {
						window.location.href = resolveRoute(`/w/${slug}/settings`);
					} else {
						window.location.href = resolveRoute('/settings');
					}
				}
			}}
			onInviteMembers={() => {
				if (typeof window !== 'undefined') {
					const slug = activeWorkspaceSlug();
					if (slug) {
						window.location.href = resolveRoute(`/w/${slug}/settings`);
					} else {
						window.location.href = resolveRoute('/settings');
					}
				}
			}}
			onSwitchWorkspace={() => {
				console.log('Switch workspace menu selected');
			}}
			onCreateWorkspace={() => {
				showCreateWorkspaceDialog = true;
			}}
			onCreateWorkspaceForAccount={async (targetUserId) => {
				// Switch to the target account and redirect to open create modal
				await authSession.switchAccount(targetUserId, '/inbox?create=workspace');
			}}
			onJoinWorkspaceForAccount={async (targetUserId) => {
				// Switch to the target account and redirect to open join modal
				await authSession.switchAccount(targetUserId, '/inbox?join=workspace');
			}}
			onAddAccount={() => {
				const currentPath = browser
					? `${window.location.pathname}${window.location.search}`
					: '/auth/redirect';
				const params = new URLSearchParams({
					linkAccount: '1',
					redirect: currentPath
				});
				const loginPath = resolveRoute('/login');
				goto(`${loginPath}?${params.toString()}`);
			}}
			onSwitchAccount={async (targetUserId, _redirectTo) => {
				// Find the account being switched to
				const targetAccount = linkedAccountOrganizations().find((a) => a.userId === targetUserId);
				const targetName =
					targetAccount?.firstName || targetAccount?.name || targetAccount?.email || 'account';

				// Show overlay IMMEDIATELY before API call/redirect
				accountSwitchOverlay.show = true;
				accountSwitchOverlay.targetName = targetName;

				try {
					// Don't pass redirectTo - let server redirect to /inbox, then client will redirect to workspace
					// This ensures we get the first workspace's inbox after account switch
					await authSession.switchAccount(targetUserId);
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
			<nav
				class="flex-1 overflow-y-auto"
				style="padding-inline: var(--spacing-2); padding-block: var(--spacing-2);"
			>
				<!-- Top section (no label) -->
				<!-- Inbox -->
				<NavItem
					href={resolveRoute(
						activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/inbox` : '/auth/redirect'
					)}
					iconType="inbox"
					label="Inbox"
					badge={inboxCount > 0 ? inboxCount : undefined}
					title="Inbox"
					collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
				/>

				<!-- Org Chart -->
				<NavItem
					href={resolveRoute(
						activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/chart` : '/auth/redirect'
					)}
					iconType="orgChart"
					label="Org Chart"
					title="Organization Chart"
					collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
				/>

				<!-- Workspace Section -->
				<section style="margin-top: var(--spacing-content-sectionGap);">
					{#if !sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)}
						<div
							class="flex items-center justify-between"
							style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);"
						>
							<p class="text-label text-tertiary font-medium tracking-wider uppercase">Workspace</p>
						</div>
					{/if}

					<div class="space-y-form-field-gap">
						<!-- Meetings -->
						<NavItem
							href={resolveRoute(
								activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/meetings` : '/auth/redirect'
							)}
							iconType="calendar"
							label="Meetings"
							title="Meetings"
							collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
						/>

						<!-- Proposals -->
						<NavItem
							href={resolveRoute(
								activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/proposals` : '/auth/redirect'
							)}
							iconType="document"
							label="Proposals"
							title="My Proposals"
							collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
						/>
					</div>
				</section>

				<!-- Favorites Section -->
				<section style="margin-top: var(--spacing-content-sectionGap);">
					{#if !sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)}
						<div
							class="flex items-center justify-between"
							style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);"
						>
							<p class="text-label text-tertiary font-medium tracking-wider uppercase">Favorites</p>
							<div class="gap-header flex items-center">
								<!-- Placeholder for future action buttons -->
							</div>
						</div>
					{/if}

					<div class="space-y-form-field-gap">
						<!-- Empty state - content will be added later -->
					</div>

					{#if !sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)}
						<p
							class="text-label text-tertiary"
							style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);"
						>
							No favorites yet.
						</p>
					{/if}
				</section>

				<!-- Your circles Section -->
				<section style="margin-top: var(--spacing-content-sectionGap);">
					{#if !sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)}
						<div
							class="flex items-center justify-between"
							style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);"
						>
							<p class="text-label text-tertiary font-medium tracking-wider uppercase">
								Your circles
							</p>
						</div>
					{/if}

					<div class="space-y-form-field-gap">
						<!-- Empty state - content will be added later -->
					</div>
				</section>

				<!-- Legacy Section -->
				<section style="margin-top: var(--spacing-content-sectionGap);">
					{#if !sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)}
						<div
							class="flex items-center justify-between"
							style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);"
						>
							<p class="text-label text-tertiary font-medium tracking-wider uppercase">Legacy</p>
						</div>
					{/if}

					<div class="space-y-form-field-gap">
						<!-- Circles -->
						<NavItem
							href={resolveRoute(
								activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/chart` : '/auth/redirect'
							)}
							iconType="circles"
							label="Circles"
							title="Circles"
							collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
						/>

						<!-- Flashcards -->
						<NavItem
							href={resolveRoute(
								activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/flashcards` : '/auth/redirect'
							)}
							iconType="flashcards"
							label="Flashcards"
							title="Flashcards"
							collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
						/>

						<!-- Study -->
						<NavItem
							href={resolveRoute(
								activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/study` : '/auth/redirect'
							)}
							iconType="study"
							label="Study"
							title="Study Session"
							collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
						/>

						<!-- Tags -->
						<NavItem
							href={resolveRoute(
								activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/tags` : '/auth/redirect'
							)}
							iconType="tags"
							label="Tags"
							title="Tags"
							collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
						/>

						<!-- Members -->
						<NavItem
							href={resolveRoute(
								activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/members` : '/auth/redirect'
							)}
							iconType="members"
							label="Members"
							title="Members"
							collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
						/>

						<!-- Dashboard (Beta - Feature Flag) -->
						{#if dashboardEnabled}
							<NavItem
								href={resolveRoute(
									activeWorkspaceSlug() ? `/w/${activeWorkspaceSlug()}/dashboard` : '/auth/redirect'
								)}
								iconType="dashboard"
								label="Dashboard"
								title="Dashboard"
								collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
							/>
						{/if}
					</div>
				</section>

				<!-- Theme Toggle -->
				<div
					class="flex items-center"
					style="padding-inline: var(--spacing-2); padding-block: var(--spacing-2); margin-top: var(--spacing-content-sectionGap);"
				>
					<ThemeToggle />
				</div>
			</nav>
		{/if}

		<!-- Development Test Menu (only in dev mode) -->
		{#if dev && (!sidebarCollapsed || (hoverState && !isMobile) || (isMobile && !sidebarCollapsed)) && !isMobile}
			<div
				style="padding-inline: var(--spacing-2); padding-block: var(--spacing-2);"
				transition:fade={{ duration: 200 }}
			>
				<div style="padding-inline: var(--spacing-2); padding-block: var(--spacing-1);">
					<p
						class="mb-form-field-gap text-label text-tertiary font-medium tracking-wider uppercase"
					>
						🧪 Development
					</p>
					<div class="space-y-form-field-gap">
						<NavItem
							href={resolveRoute('/test/claude')}
							iconType="lightbulb"
							label="Claude Test"
							title="Claude Test"
							collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
						/>
						<NavItem
							href={resolveRoute('/test/readwise')}
							iconType="study"
							label="Readwise Test"
							title="Readwise Test"
							collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
						/>
						<NavItem
							href={resolveRoute('/dev-docs')}
							iconType="study"
							label="Dev Docs"
							title="Dev Docs"
							target="_blank"
							rel="noopener noreferrer"
							collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
						/>
						<NavItem
							href={resolveRoute('/admin')}
							iconType="settings"
							label="Admin"
							title="Admin"
							collapsed={sidebarCollapsed && !(hoverState && !isMobile)}
						/>
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

<!-- Create Workspace Dialog -->
<StandardDialog
	bind:open={showCreateWorkspaceDialog}
	title="Create workspace"
	description="Spin up a new workspace for another company or product team."
	submitLabel="Create"
	loading={workspaces?.loading.createWorkspace ?? false}
	onsubmit={handleCreateWorkspace}
	onclose={() => {
		newWorkspaceName = '';
	}}
>
	<div class="gap-form flex flex-col">
		<FormInput
			label="Organization name"
			bind:value={newWorkspaceName}
			placeholder="e.g. SynergyOS Labs"
			required
			min="2"
		/>
	</div>
</StandardDialog>

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

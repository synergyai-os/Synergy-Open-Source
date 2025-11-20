<script lang="ts">
	import { browser } from '$app/environment';
	// TODO: Re-enable when page is needed
	// import { page } from '$app/stores';
	import { onMount } from 'svelte';

	// Debug flag for overlay logging (set to false to disable production logs)
	const DEBUG_OVERLAY_LOGGING = import.meta.env.DEV;
	import OrganizationModals from '$lib/modules/core/organizations/components/OrganizationModals.svelte';
	import LoadingOverlay from '$lib/components/ui/LoadingOverlay.svelte';
	import { resolveRoute } from '$lib/utils/navigation';
	import { setContext } from 'svelte';
	import { useOrganizations } from '$lib/modules/core/organizations/composables/useOrganizations.svelte';
	import { createInboxModuleAPI } from '$lib/modules/inbox/api';
	import { createCoreModuleAPI } from '$lib/modules/core/api';
	import { createFlashcardsModuleAPI } from '$lib/modules/flashcards/api';
	import { createOrgChartModuleAPI } from '$lib/modules/org-chart/api';
	import type {
		OrganizationSummary,
		OrganizationInvite,
		TeamInvite,
		TeamSummary
	} from '$lib/modules/core/organizations/composables/useOrganizations.svelte';
	import { SHORTCUTS } from '$lib/modules/core/composables/useGlobalShortcuts.svelte';
	import { useLoadingOverlay } from '$lib/modules/core/composables/useLoadingOverlay.svelte';
	import { toast } from '$lib/utils/toast';
	import { page } from '$app/stores';
	// TODO: Re-enable when Id type is needed
	// import type { Id } from '$lib/convex';

	let { children, data } = $props();

	// Check if we're on an admin route - skip authenticated layout for admin routes
	const isAdminRoute = $derived(browser ? $page.url.pathname.startsWith('/admin') : false);

	// Initialize organizations composable with sessionId and server-side preloaded data
	// Returns OrganizationsModuleAPI interface (enables loose coupling - see SYOS-295)
	const organizations = useOrganizations({
		userId: () => data.user?.userId,
		sessionId: () => data.sessionId,
		orgFromUrl: () => $page.url.searchParams.get('org'),
		// Server-side preloaded data for instant workspace menu rendering
		// Cast unknown[] to proper types (server-side data is typed as unknown[] for safety)
		initialOrganizations: data.organizations as unknown as OrganizationSummary[],
		initialOrganizationInvites: data.organizationInvites as unknown as OrganizationInvite[],
		initialTeamInvites: data.teamInvites as unknown as TeamInvite[],
		initialTeams: data.teams as unknown as TeamSummary[] // Server-side preloaded teams for active organization
	});
	setContext('organizations', organizations);

	// Initialize core module API and provide via context
	// Enables loose coupling - other modules can use global components and composables without direct imports (see SYOS-308, SYOS-322)
	const coreAPI = createCoreModuleAPI();
	setContext('core-api', coreAPI);

	// Extract global components and composables from CoreModuleAPI
	const Sidebar = coreAPI.Sidebar;
	const GlobalActivityTracker = coreAPI.GlobalActivityTracker;
	const AppTopBar = coreAPI.AppTopBar;
	const QuickCreateModal = coreAPI.QuickCreateModal;
	const useGlobalShortcuts = coreAPI.useGlobalShortcuts;

	// Initialize inbox module API and provide via context
	// Enables loose coupling - other modules can use tagging composable without direct imports (see SYOS-306)
	const inboxAPI = createInboxModuleAPI();
	setContext('inbox-api', inboxAPI);

	// Initialize flashcards module API and provide via context
	// Enables loose coupling - other modules can use flashcards functionality without direct imports (see SYOS-314)
	const flashcardsAPI = createFlashcardsModuleAPI();
	setContext('flashcards-api', flashcardsAPI);

	// Initialize org chart module API and provide via context
	// Enables loose coupling - other modules can use org chart composable without direct imports (see SYOS-314)
	const orgChartAPI = createOrgChartModuleAPI();
	setContext('org-chart-api', orgChartAPI);

	// Feature flags loaded server-side for instant rendering (no client-side query delay)
	const circlesEnabled = $derived(data.circlesEnabled ?? false);
	const meetingsEnabled = $derived(data.meetingsEnabled ?? false);
	const dashboardEnabled = $derived(data.meetingsEnabled ?? false); // Dashboard uses meetings module flag

	// DEBUG: Log feature flag evaluation in browser console
	$effect(() => {
		if (browser) {
			console.log('[DEBUG] Feature flags (client-side):', {
				sessionId: data.sessionId,
				userId: data.user?.userId,
				userEmail: data.user?.email,
				activeOrganizationId: organizations.activeOrganizationId,
				circlesEnabled,
				meetingsEnabled,
				serverData: {
					circlesEnabled: data.circlesEnabled,
					meetingsEnabled: data.meetingsEnabled
				}
			});
		}
	});
	const loadingOverlay = useLoadingOverlay();
	setContext('loadingOverlay', loadingOverlay);
	const isAuthenticated = $derived(data.isAuthenticated);
	const accountEmail = $derived(() => data.user?.email ?? 'user@example.com');
	const accountName = $derived(() =>
		data.user?.firstName && data.user?.lastName
			? `${data.user.firstName} ${data.user.lastName}`
			: accountEmail()
	);
	const workspaceName = $derived(() => data.activeWorkspace?.name ?? 'Private workspace');

	// Account switching state (for page reloads)
	// CRITICAL: ALWAYS initialize as false - NEVER read from sessionStorage during initialization
	// Reading sessionStorage during initialization causes overlay to show BEFORE page reload
	// Only check sessionStorage in onMount (after component is mounted)
	let accountSwitchingState = $state<{
		isSwitching: boolean;
		switchingTo: string | null;
		switchingToType: 'personal' | 'organization';
		startTime: number | null;
		endTime: number | null; // Track when account switching ended to suppress org switching overlay
	}>({
		isSwitching: false,
		switchingTo: null,
		switchingToType: 'personal',
		startTime: null,
		endTime: null
	});

	// Combined switching state: Show single overlay for account + org switching
	// When account switching is active, extend it to cover org switching (no separate overlay)
	const isAccountSwitching = $derived(accountSwitchingState.isSwitching);
	const isOrgSwitching = $derived(organizations?.isSwitching ?? false);

	// Detect if this is an account switch (has switchingAccount flag) vs workspace switch (same account)
	// Account switch: Show "Switching account" → "Loading workspace"
	// Workspace switch: Show only "Loading workspace"
	// Note: Currently unused but kept for potential future use
	const _isAccountSwitch = $derived(
		browser && accountSwitchingState.isSwitching && accountSwitchingState.startTime !== null
	);

	// Track account switching flag from sessionStorage (NON-reactive - only checked on mount)
	// CRITICAL: Do NOT reactively track sessionStorage changes - this causes overlay to show BEFORE page reload
	// The overlay should ONLY show AFTER page reload, not before
	// We check the flag once on mount, then rely on accountSwitchingState.isSwitching for reactivity
	const flagState = $state({
		hasFlag: browser ? sessionStorage.getItem('switchingAccount') !== null : false
	});

	// DO NOT reactively track sessionStorage - only check on mount
	// Removing the $effect prevents overlay from showing before page reload
	// The flag is only used for initial state setup, then accountSwitchingState takes over

	const hasSwitchingAccountFlag = $derived(flagState.hasFlag);

	// Show overlay if account switching OR org switching
	// CRITICAL: Do NOT include hasSwitchingAccountFlag here - it causes overlay to show BEFORE page reload
	// After page reload, accountSwitchingState.isSwitching will be true (initialized from sessionStorage)
	// This creates one continuous overlay that transitions from "Switching account" to "Loading workspace"
	const shouldShowSwitchingOverlay = $derived(isAccountSwitching || isOrgSwitching);

	// Determine subtitle: "account" during account switch, "workspace" during org switch
	// IMPORTANT: Only use 'account' when account switching is active (not the flag - prevents pre-reload overlay)
	// During org switching, always use 'workspace' (not the org name) for consistent messaging
	const switchingSubtitle = $derived.by(() => {
		const result = isAccountSwitching ? 'account' : 'workspace';
		console.log('🔍 [SUBTITLE] Computing switchingSubtitle', {
			result,
			isAccountSwitching,
			hasSwitchingAccountFlag,
			isOrgSwitching,
			accountState: accountSwitchingState.isSwitching,
			orgState: organizations?.isSwitching,
			switchingTo: organizations?.switchingTo
		});
		return result;
	});

	// Log subtitle changes (separate effect for debugging)
	$effect(() => {
		if (!browser) return;
		console.log('🔄 [OVERLAY] Subtitle changed', {
			subtitle: switchingSubtitle,
			isAccountSwitching,
			isOrgSwitching,
			accountState: accountSwitchingState.isSwitching,
			orgState: organizations?.isSwitching,
			switchingTo: organizations?.switchingTo
		});
	});

	// Global overlay show state (for logging)
	// CRITICAL: Hide global overlay during account/workspace switching to prevent "Loading [account name]" from showing
	// Also hide if switchingAccount flag exists (even if shouldShowSwitchingOverlay is false due to timing)
	const globalOverlayShow = $derived(
		loadingOverlay.show &&
			!shouldShowSwitchingOverlay &&
			!hasSwitchingAccountFlag &&
			!isAccountSwitching &&
			!isOrgSwitching
	);

	// Log global overlay state
	$effect(() => {
		if (!browser) return;
		if (globalOverlayShow || loadingOverlay.show) {
			console.log('🌐 [GLOBAL OVERLAY] State', {
				show: globalOverlayShow,
				loadingOverlayShow: loadingOverlay.show,
				shouldShowSwitchingOverlay,
				hasSwitchingAccountFlag,
				isAccountSwitching,
				isOrgSwitching,
				flow: loadingOverlay.flow,
				title: loadingOverlay.title,
				subtitle: loadingOverlay.subtitle,
				subtitleType: typeof loadingOverlay.subtitle,
				subtitleLength: loadingOverlay.subtitle?.length,
				customStages: loadingOverlay.customStages,
				// Check if subtitle contains account name (this would cause "Loading [name]")
				hasAccountName:
					loadingOverlay.subtitle?.includes('Randy') ||
					loadingOverlay.subtitle?.includes('Hereman') ||
					loadingOverlay.subtitle?.includes('Fifth')
			});
		}
	});

	// Log overlay visibility changes
	$effect(() => {
		if (!browser) return;
		console.log('🔄 [OVERLAY] Visibility check', {
			shouldShow: shouldShowSwitchingOverlay,
			isAccountSwitching,
			isOrgSwitching,
			accountState: accountSwitchingState.isSwitching,
			orgState: organizations?.isSwitching,
			subtitle: switchingSubtitle
		});
	});

	// Clear account switching state immediately when org switching starts
	// This ensures subtitle switches from 'account' to 'workspace' smoothly
	$effect(() => {
		if (!browser) return;

		if (organizations?.isSwitching && accountSwitchingState.isSwitching) {
			console.log('🔄 [ACCOUNT SWITCH] Org switching started - clearing account switching state');
			accountSwitchingState.isSwitching = false;
			accountSwitchingState.switchingTo = null;
			accountSwitchingState.switchingToType = 'personal';
			// Keep startTime for transition monitoring
			// Ensure flag is cleared
			flagState.hasFlag = false;
		}
	});

	// Monitor account switching completion: Wait for org switching OR data to load
	// Account switch completes when either:
	// 1. Organization switching starts (explicit org change)
	// 2. Data has loaded and minimum duration elapsed (implicit org change or no change)
	$effect(() => {
		if (!browser || !accountSwitchingState.isSwitching || !accountSwitchingState.startTime) {
			if (browser && accountSwitchingState.isSwitching) {
				console.log('⏸️ [ACCOUNT SWITCH] Effect skipped', {
					hasStartTime: !!accountSwitchingState.startTime,
					isSwitching: accountSwitchingState.isSwitching
				});
			}
			return;
		}

		// Check minimum duration has elapsed (1 second for "Switching account" text)
		const elapsed = Date.now() - accountSwitchingState.startTime;
		const minimumAccountSwitchDuration = 1000; // Show "Switching account" for at least 1 second
		const minimumTotalDuration = 3000; // Total overlay duration (account + workspace loading)
		const orgSwitching = organizations?.isSwitching ?? false;
		const dataLoaded = !organizations?.isLoading; // Data has finished loading

		console.log('🔄 [ACCOUNT SWITCH] Monitoring transition', {
			elapsed,
			minimumAccountSwitchDuration,
			minimumTotalDuration,
			orgSwitching,
			dataLoaded,
			canTransition:
				(orgSwitching || (dataLoaded && elapsed >= minimumTotalDuration)) &&
				elapsed >= minimumAccountSwitchDuration
		});

		// Transition when:
		// 1. Org switching starts AND minimum account switch duration elapsed, OR
		// 2. Data loaded AND total minimum duration elapsed (ensures smooth transition even without explicit org switch)
		const shouldTransition =
			(orgSwitching && elapsed >= minimumAccountSwitchDuration) ||
			(dataLoaded && elapsed >= minimumTotalDuration);

		if (shouldTransition) {
			console.log('✅ [ACCOUNT SWITCH] Transitioning', {
				elapsed,
				orgSwitching,
				dataLoaded,
				orgSwitchingTo: organizations?.switchingTo,
				reason: orgSwitching ? 'org-switching-started' : 'data-loaded-minimum-duration'
			});

			// If org switching is already active, just clear account switching state
			// The org switching overlay will continue showing "Loading workspace"
			if (orgSwitching) {
				accountSwitchingState.isSwitching = false;
				accountSwitchingState.switchingTo = null;
				accountSwitchingState.switchingToType = 'personal';
				accountSwitchingState.startTime = null;
			} else if (dataLoaded && organizations?.setActiveOrganization && browser) {
				// Data loaded but no org switching - process URL params if they exist
				// URL sync was suppressed during account switching, now it can process the org param
				const urlParams = new URLSearchParams(window.location.search);
				const urlOrgParam = urlParams.get('org');

				if (
					urlOrgParam &&
					organizations.organizations?.some((org) => org.organizationId === urlOrgParam)
				) {
					// Process URL param - this will trigger org switching with "Loading workspace"
					console.log('🔄 [ACCOUNT SWITCH] Processing URL param after account switch', {
						orgId: urlOrgParam
					});
					// Trigger org switching - it will handle the overlay transition
					// Don't clear account switching state here - let the org switching effect handle it
					// The subtitle will automatically switch from 'account' to 'workspace' when org switching starts
					organizations.setActiveOrganization(urlOrgParam);
					// Account switching will be cleared when org switching becomes active (handled by reactive effect)
				} else {
					// No URL param and no org switching - just hide overlay
					// Don't trigger org switching unnecessarily
					accountSwitchingState.isSwitching = false;
					accountSwitchingState.switchingTo = null;
					accountSwitchingState.switchingToType = 'personal';
					accountSwitchingState.startTime = null;
					// Ensure flag is cleared
					flagState.hasFlag = false;
				}
			} else {
				// Fallback: just clear account switching state
				accountSwitchingState.isSwitching = false;
				// Ensure flag is cleared
				flagState.hasFlag = false;
				accountSwitchingState.switchingTo = null;
				accountSwitchingState.switchingToType = 'personal';
				accountSwitchingState.startTime = null;
			}

			// Clear safety timeout if it exists
			if (accountSwitchingState.endTime) {
				clearTimeout(accountSwitchingState.endTime as unknown as ReturnType<typeof setTimeout>);
				accountSwitchingState.endTime = null;
			}
		}
	});

	// Remove static overlay immediately when Svelte is ready (prevents duplicate overlay)
	// Hide static overlay as soon as shouldShowSwitchingOverlay becomes true (Svelte is loaded)
	// This prevents both overlays from being visible at the same time
	$effect(() => {
		if (!browser) return;

		// As soon as shouldShowSwitchingOverlay becomes true, hide static overlay immediately
		// Don't wait for LoadingOverlay to render - hide static overlay right away
		if (shouldShowSwitchingOverlay && window.__hasStaticOverlay) {
			const staticOverlay = document.getElementById('__switching-overlay');
			if (staticOverlay) {
				console.log(
					'🧹 [STATIC OVERLAY CLEANUP] Hiding static overlay immediately (Svelte overlay will show)',
					{
						staticOverlayFound: !!staticOverlay,
						shouldShowSwitchingOverlay
					}
				);
				// Remove immediately (no fade) - LoadingOverlay will show immediately after
				if (staticOverlay.parentNode) {
					staticOverlay.remove();
					console.log('✅ [STATIC OVERLAY CLEANUP] Static overlay removed from DOM');
				}
				delete window.__hasStaticOverlay;
			} else {
				delete window.__hasStaticOverlay;
			}
		}
	});

	// Track if component has been mounted for at least 100ms
	// This prevents overlay from showing during client-side navigation before page reload
	let mountedAt = $state<number | null>(null);

	// Check for account switching flag on mount
	onMount(() => {
		if (!browser) return;

		// Record mount time
		mountedAt = Date.now();

		// Don't remove static overlay immediately - wait until Svelte overlay is ready
		// This prevents flicker (blur on → blur off → blur on)
		// The static overlay will be replaced seamlessly by the Svelte overlay
		// Use $effect to remove static overlay once Svelte overlay is mounted

		const switchingData = sessionStorage.getItem('switchingAccount');
		if (switchingData) {
			try {
				const parsed = JSON.parse(switchingData);
				const flagAge = Date.now() - (parsed.startTime || 0);

				console.log('🚀 [ACCOUNT SWITCH] Processing account switch flag (AFTER page reload)', {
					accountName: parsed.accountName,
					startTime: parsed.startTime,
					currentTime: Date.now(),
					flagAge,
					mountedAt,
					timeSinceMount: mountedAt ? Date.now() - mountedAt : null
				});

				// CRITICAL: Only process flag if it was set BEFORE this component mounted
				// If flag was set very recently (< 100ms), it's from current click - ignore it
				// This prevents overlay from showing during client-side navigation before page reload
				if (flagAge < 100) {
					console.log('⏸️ [ACCOUNT SWITCH] Ignoring flag - too recent (from current click)');
					sessionStorage.removeItem('switchingAccount');
					return;
				}

				// CRITICAL: Clear global overlay to prevent "Loading [account name]" from showing
				// The global overlay might have stale data from previous state
				loadingOverlay.hideOverlay();

				// Set state from flag (this only happens AFTER page reload)
				// State was initialized as false, so this is the first time it's set to true
				accountSwitchingState.isSwitching = true;
				accountSwitchingState.switchingTo = parsed.accountName || 'account';
				accountSwitchingState.switchingToType = 'personal';
				accountSwitchingState.startTime = parsed.startTime || Date.now();

				// Clear the flag now that state is set
				sessionStorage.removeItem('switchingAccount');
				flagState.hasFlag = false;

				// Account switching overlay: Extend until org switching starts OR data loads
				// The $effect above will reactively transition when org switching starts or data loads
				// Safety timeout: If neither happens within 10s, clear account switching anyway
				const safetyTimeout = setTimeout(() => {
					console.log('⏰ [ACCOUNT SWITCH] Safety timeout triggered - clearing account switching');
					if (accountSwitchingState.isSwitching) {
						accountSwitchingState.isSwitching = false;
						accountSwitchingState.switchingTo = null;
						accountSwitchingState.switchingToType = 'personal';
						accountSwitchingState.startTime = null;
						accountSwitchingState.endTime = null;
					}
				}, 10000); // Increased from 5s to 10s to allow for slower data loading

				// Store timeout ID for cleanup (effect will clear it when org switching starts)
				accountSwitchingState.endTime = safetyTimeout as unknown as number;
			} catch (e) {
				console.warn('Failed to parse account switching data', e);
				sessionStorage.removeItem('switchingAccount');
			}
		}
	});

	// Initialize global shortcuts (only in browser - SSR safe)
	// Use $state to make it reactive so $effect tracks changes when it becomes available
	let shortcuts = $state<ReturnType<typeof useGlobalShortcuts> | null>(null);

	// Initialize shortcuts in browser after mount
	onMount(() => {
		if (browser) {
			shortcuts = useGlobalShortcuts();
		}
	});

	// Get inbox count for sidebar - using 0 for now since inbox uses mock data
	// TODO: Replace with actual Convex query when inbox data is connected
	const inboxCount = $derived(0);

	// Client-only state (SSR safe)
	let createMenuOpen = $state(false);
	let quickCreateModalOpen = $state(false);
	let quickCreateTrigger = $state<'keyboard_n' | 'header_button' | 'footer_button'>('keyboard_n');
	let quickCreateInitialType = $state<'note' | 'flashcard' | 'highlight' | null>(null);
	let isMobile = $state(false);
	let sidebarCollapsed = $state(false);
	let sidebarWidth = $state(286);

	// Get current view from page URL
	const getCurrentView = () => {
		if (!browser) return 'inbox';
		const path = window.location.pathname;
		if (path.includes('/flashcards')) return 'flashcards';
		if (path.includes('/tags')) return 'tags';
		if (path.includes('/my-mind')) return 'my_mind';
		if (path.includes('/study')) return 'study';
		return 'inbox';
	};

	// Initialize client-only state from browser APIs
	if (browser) {
		// Mobile detection
		isMobile = window.innerWidth < 768;
		window.addEventListener('resize', () => {
			isMobile = window.innerWidth < 768;
		});

		// Load sidebar width from localStorage
		const savedSidebarWidth = parseInt(localStorage.getItem('sidebarWidth') || '286');
		// Ensure width is at least the minimum (192px) to prevent sidebar from being invisible
		sidebarWidth = Math.max(192, savedSidebarWidth);
	}

	function handleSidebarWidthChange(width: number) {
		// Don't save width 0 - preserve the original width when collapsing
		if (width > 0) {
			sidebarWidth = width;
			if (browser) {
				localStorage.setItem('sidebarWidth', width.toString());
			}
		}
	}

	// Share sidebar state with child pages via context
	setContext('sidebar', {
		get sidebarCollapsed() {
			return sidebarCollapsed;
		},
		get isMobile() {
			return isMobile;
		},
		onSidebarToggle: () => {
			sidebarCollapsed = !sidebarCollapsed;
		}
	});

	// Register keyboard shortcuts for Quick Create
	$effect(() => {
		if (!shortcuts || !browser) return;

		// 'C' key - Quick create note (direct)
		shortcuts.register({
			key: SHORTCUTS.CREATE,
			handler: () => {
				quickCreateTrigger = 'keyboard_n';
				quickCreateInitialType = 'note';
				quickCreateModalOpen = true;
			},
			description: 'Create note',
			preventDefault: true
		});

		// 'Cmd+K' - Opens Command Center (full Quick Create palette)
		shortcuts.register({
			key: SHORTCUTS.COMMAND_PALETTE,
			meta: true,
			handler: () => {
				quickCreateTrigger = 'keyboard_n';
				quickCreateInitialType = null; // No initial type, show selection
				quickCreateModalOpen = true;
			},
			description: 'Command Center',
			preventDefault: true
		});

		// CMD+1/2/3/4/5/6/7/8/9 - Organization switching shortcuts
		// Organizations only (no personal workspace) - SYOS-209
		// Support up to 9 organizations (CMD+1 through CMD+9)
		for (let i = 1; i <= 9; i++) {
			shortcuts.register({
				key: i.toString(),
				meta: true,
				handler: () => {
					if (!organizations) return;

					// Build organization list: Organizations only (index 0, 1, 2, 3, 4, 5, 6, 7, 8)
					const workspaceIndex = i - 1; // Convert to 0-based index
					const orgList = organizations.organizations ?? [];

					// CMD+1-9 → Organizations (index 0, 1, 2, 3, 4, 5, 6, 7, 8)
					const targetOrg = orgList[workspaceIndex];

					if (targetOrg) {
						organizations.setActiveOrganization(targetOrg.organizationId);
						toast.success(`Switched to ${targetOrg.name}`);
					} else {
						// No organization at this index - show info toast
						toast.info(`No workspace at position ${i}. Create one to use CMD+${i}.`);
					}
				},
				description: `Switch to workspace ${i}`,
				preventDefault: true
			});
		}

		// Mark shortcuts as ready for E2E tests
		if (document.body) {
			document.body.setAttribute('data-shortcuts-ready', 'true');
		}

		return () => {
			if (!shortcuts) return;
			shortcuts.unregister(SHORTCUTS.CREATE);
			shortcuts.unregister(SHORTCUTS.COMMAND_PALETTE, { meta: true });
			// Unregister workspace shortcuts
			for (let i = 1; i <= 9; i++) {
				shortcuts.unregister(i.toString(), { meta: true });
			}
			if (document.body) {
				document.body.removeAttribute('data-shortcuts-ready');
			}
		};
	});

	// Redirect to login if not authenticated (shouldn't reach here due to server-side redirect)
	$effect(() => {
		if (browser && !isAuthenticated) {
			window.location.href = resolveRoute('/login');
		}
	});
</script>

{#if isAdminRoute}
	<!-- Admin routes use their own layout - skip authenticated layout -->
	{@render children()}
{:else if isAuthenticated}
	<div class="flex h-screen overflow-hidden">
		<!-- Shared Sidebar Component -->
		<Sidebar
			{inboxCount}
			{isMobile}
			{sidebarCollapsed}
			onToggleCollapse={() => (sidebarCollapsed = !sidebarCollapsed)}
			{sidebarWidth}
			onSidebarWidthChange={handleSidebarWidthChange}
			{createMenuOpen}
			onCreateMenuChange={(open) => (createMenuOpen = open)}
			onQuickCreate={(trigger) => {
				quickCreateTrigger = trigger;
				quickCreateInitialType = null; // Show command palette
				quickCreateModalOpen = true;
			}}
			user={data.user}
			{circlesEnabled}
			{meetingsEnabled}
			{dashboardEnabled}
		/>

		<!-- Main Content Area -->
		<div class="flex flex-1 flex-col overflow-hidden">
			<AppTopBar
				{organizations}
				{isMobile}
				{sidebarCollapsed}
				onSidebarToggle={() => (sidebarCollapsed = !sidebarCollapsed)}
				accountName={accountName()}
				accountEmail={accountEmail()}
				workspaceName={workspaceName()}
			/>
			<div class="flex-1 overflow-hidden">
				{@render children()}
			</div>
		</div>

		<!-- Global Activity Tracker -->
		<GlobalActivityTracker />

		<!-- Quick Create Modal -->
		<QuickCreateModal
			bind:open={quickCreateModalOpen}
			triggerMethod={quickCreateTrigger}
			currentView={getCurrentView()}
			initialType={quickCreateInitialType}
			sessionId={data.sessionId}
			organizationId={organizations?.activeOrganizationId ?? null}
			teamId={organizations?.activeTeamId ?? null}
			initialTags={data.tags}
		/>

		<!-- Organization Modals (Create/Join Org, Create/Join Team) -->
		{#if organizations}
			<OrganizationModals
				{organizations}
				activeOrganizationName={organizations.activeOrganization?.name ?? null}
			/>
		{/if}

		<!-- Loading Overlay (workspace switching, account operations, etc.) -->
		<!-- Single continuous overlay that transitions from "Switching account" to "Loading workspace" -->
		{#if shouldShowSwitchingOverlay}
			{@const subtitleValue = switchingSubtitle}
			{@const logRender = () => {
				if (!browser) return;
				if (!DEBUG_OVERLAY_LOGGING) return;

				// Check for any existing overlays in DOM
				const allOverlays = Array.from(
					document.querySelectorAll('[id*="overlay"], [class*="overlay"], [style*="z-index:999"]')
				);
				const staticOverlay = document.getElementById('__switching-overlay');
				const staticOverlayHeading = staticOverlay?.querySelector('h2');

				console.log('🎨 [LOADING OVERLAY] Rendering workspace-switching overlay', {
					shouldShow: shouldShowSwitchingOverlay,
					subtitle: subtitleValue,
					subtitleType: typeof subtitleValue,
					subtitleLength: subtitleValue?.length,
					isAccountSwitching,
					isOrgSwitching,
					accountState: accountSwitchingState.isSwitching,
					orgState: organizations?.isSwitching,
					accountStartTime: accountSwitchingState.startTime,
					orgSwitchingTo: organizations?.switchingTo,
					hasSwitchingAccountFlag,
					flagState: flagState.hasFlag,
					// DOM state checks
					staticOverlayExists: !!staticOverlay,
					staticOverlayHeadingText: staticOverlayHeading?.textContent,
					staticOverlayFullText: staticOverlay?.textContent?.substring(0, 150),
					allOverlaysCount: allOverlays.length,
					allOverlaysInfo: allOverlays.map((el) => ({
						id: el.id,
						className: el.className,
						textContent: el.textContent?.substring(0, 80),
						zIndex: window.getComputedStyle(el).zIndex
					}))
				});
			}}
			{@const _log = logRender()}
			<LoadingOverlay show={true} flow="workspace-switching" subtitle={subtitleValue} />
		{:else}
			{@const logNotShowing = () => {
				if (!browser) return;
				if (!DEBUG_OVERLAY_LOGGING) return;

				console.log('🎨 [LOADING OVERLAY] Overlay NOT showing', {
					shouldShowSwitchingOverlay,
					isAccountSwitching,
					isOrgSwitching,
					accountState: accountSwitchingState.isSwitching,
					orgState: organizations?.isSwitching
				});
			}}
			{@const _log = logNotShowing()}
		{/if}

		<!-- Global Loading Overlay (for account registration, linking, workspace creation) -->
		<!-- Hide global overlay when account/workspace switching is active (prevents "Loading [account name]" from showing) -->
		<LoadingOverlay
			show={globalOverlayShow}
			flow={loadingOverlay.flow}
			title={loadingOverlay.title}
			subtitle={loadingOverlay.subtitle}
			customStages={loadingOverlay.customStages}
		/>
	</div>
{:else}
	<!-- Not authenticated - shouldn't reach here due to redirect, but show login prompt -->
	<div class="flex h-screen items-center justify-center bg-base">
		<div class="text-center">
			<p class="mb-4 text-primary">Please log in to continue</p>
			<a href={resolveRoute('/login')} class="text-accent-primary">Go to Login</a>
		</div>
	</div>
{/if}

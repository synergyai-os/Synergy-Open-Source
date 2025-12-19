<script lang="ts">
	import { browser } from '$app/environment';
	// TODO: Re-enable when page is needed
	// import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import { LoadingOverlay } from '$lib/components/atoms';
	import { resolveRoute } from '$lib/utils/navigation';
	import { invariant } from '$lib/utils/invariant';
	import { setContext } from 'svelte';
	import { useWorkspaces } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { createInboxModuleAPI } from '$lib/modules/inbox/api';
	import { createCoreModuleAPI } from '$lib/modules/core/api';
	import { createFlashcardsModuleAPI } from '$lib/modules/flashcards/api';
	import { createOrgChartModuleAPI } from '$lib/modules/org-chart/api';
	import type {
		WorkspaceSummary,
		WorkspaceInvite
	} from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import { SHORTCUTS } from '$lib/modules/core/composables/useGlobalShortcuts.svelte';
	import { useLoadingOverlay } from '$lib/modules/core/composables/useLoadingOverlay.svelte';
	import { toast } from '$lib/utils/toast';
	import { page } from '$app/stores';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import type { Id } from '$lib/convex';
	import { generateHoverColor } from '$lib/utils/color-conversion';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { getPlatform } from '$lib/utils/platform';
	import { DesignModeBanner } from '$lib/components/organisms';

	let { children, data } = $props();

	// Check if we're on an admin route - skip authenticated layout for admin routes
	const isAdminRoute = $derived(browser ? $page.url.pathname.startsWith('/admin') : false);

	// Check if we're on a settings route - hide main sidebar for settings routes
	const isSettingsRoute = $derived(browser ? $page.url.pathname.includes('/settings') : false);

	// Check if we're on an onboarding route - hide main sidebar and use full-width layout
	const isOnboardingRoute = $derived(
		browser ? $page.url.pathname.startsWith('/onboarding') : false
	);

	// Check if we're on a workspace route
	const isWorkspaceRoute = $derived(browser ? $page.url.pathname.startsWith('/w/') : false);

	// Initialize workspaces composable with sessionId and server-side preloaded data
	// Returns WorkspacesModuleAPI interface (enables loose coupling - see SYOS-295)
	const workspaces = useWorkspaces({
		userId: () => data.user?.userId,
		sessionId: () => data.sessionId,
		orgFromUrl: () => null, // Path-based routing, no query params
		// Server-side preloaded data for instant workspace menu rendering
		// Cast unknown[] to proper types (server-side data is typed as unknown[] for safety)
		initialOrganizations: data.workspaces as unknown as WorkspaceSummary[],
		initialOrganizationInvites: data.workspaceInvites as unknown as WorkspaceInvite[]
	});
	setContext('workspaces', workspaces);

	// Phase 2C: Load org branding reactively (updates on workspace switch)
	// Use workspaces.activeWorkspaceId for reactive updates (not data.workspaceId)
	const getSessionId = () => data.sessionId;

	// Reactive activeWorkspaceId (Svelte 5 pattern - matches tags/+page.svelte)
	// Returns a function that can be called reactively inside useQuery
	const activeWorkspaceId = $derived(() => {
		if (!workspaces) return null;
		return workspaces.activeWorkspaceId ?? null;
	});

	// Load branding for ALL orgs (to generate CSS for all orgs at once)
	// This prevents CSS loss when switching workspaces
	const allOrgBrandingQuery =
		browser && getSessionId()
			? useQuery(api.features.workspaceBranding.index.getAllOrgBranding, () => {
					const sessionId = getSessionId();
					invariant(sessionId, 'sessionId required');
					return { sessionId };
				})
			: null;

	// Load RBAC details for dev console logging
	const rbacDetailsQuery =
		browser && import.meta.env.DEV && getSessionId()
			? useQuery(api.infrastructure.rbac.queries.getUserRBACDetails, () => {
					const sessionId = getSessionId();
					invariant(sessionId, 'sessionId required');
					const workspaceId = activeWorkspaceId();
					return {
						sessionId,
						workspaceId: workspaceId ?? undefined
					};
				})
			: null;

	// Load personId for dev console logging (workspace-scoped)
	// Only create query when workspaceId is available (required parameter)
	// Wrap in $derived to make conditional query creation reactive (see convex-integration.md#L250)
	const personIdQuery = $derived(
		browser && import.meta.env.DEV && getSessionId() && activeWorkspaceId() !== null
			? useQuery(api.core.people.index.getPersonForWorkspace, () => {
					const sessionId = getSessionId();
					const workspaceId = activeWorkspaceId();
					invariant(sessionId, 'sessionId required');
					invariant(workspaceId, 'workspaceId required'); // Should not happen due to outer check
					return {
						sessionId,
						workspaceId: workspaceId as Id<'workspaces'>
					};
				})
			: null
	);

	// Log RBAC details when available (dev mode only) - adds to existing dev info
	$effect(() => {
		if (!browser || !import.meta.env.DEV || !rbacDetailsQuery?.data) return;

		const rbacData = rbacDetailsQuery.data;
		const pathname = window.location.pathname;
		const isWorkspaceRoute = pathname.startsWith('/w/');
		const convexUrlSanitized = PUBLIC_CONVEX_URL
			? PUBLIC_CONVEX_URL.split('/').slice(0, 3).join('/') + '/...'
			: 'not configured';

		// Format RBAC data to match existing console log structure
		const rbacInfo = {
			systemRoles: rbacData.systemRoles.map((role) => ({
				roleSlug: role.roleSlug,
				roleName: role.roleName,
				permissions: role.permissions.map((p) => ({
					slug: p.slug,
					scope: p.scope,
					description: p.description
				}))
			})),
			activeWorkspaceRoles: rbacData.activeWorkspaceRoles.map((role) => ({
				roleSlug: role.roleSlug,
				roleName: role.roleName,
				circleId: role.circleId ?? null,
				permissions: role.permissions.map((p) => ({
					slug: p.slug,
					scope: p.scope,
					description: p.description
				}))
			})),
			allWorkspaceRoles: rbacData.workspaceRoles.map((ws) => ({
				workspaceId: ws.workspaceId,
				workspaceName: ws.workspaceName,
				roles: ws.roles.map((role) => ({
					roleSlug: role.roleSlug,
					roleName: role.roleName,
					circleId: role.circleId ?? null
				}))
			}))
		};

		// Log complete dev info with RBAC included
		console.log('🔍 SynergyOS Dev Info', {
			auth: {
				userId: data.user?.userId ?? null,
				personId: personIdQuery?.data?.personId ?? null,
				email: data.user?.email ?? null,
				name: accountName() ?? null,
				workosId: data.user?.workosId ?? null,
				isAuthenticated: isAuthenticated,
				sessionId: data.sessionId ?? null
			},
			workspace: {
				activeId: workspaces?.activeWorkspaceId ?? null,
				activeName: workspaceName() ?? null,
				totalCount: workspaces?.workspaces?.length ?? 0,
				invitesCount: workspaces?.workspaceInvites?.length ?? 0,
				isSwitching: workspaces?.isSwitching ?? false
			},
			features: {
				circles: circlesEnabled,
				meetings: meetingsEnabled,
				dashboard: dashboardEnabled
			},
			route: {
				pathname,
				isWorkspaceRoute
			},
			environment: {
				mode: import.meta.env.DEV ? 'development' : 'production',
				platform: getPlatform(),
				convexUrl: convexUrlSanitized,
				isMobile
			},
			state: {
				isAccountSwitching: isAccountSwitching,
				isOrgSwitching: isOrgSwitching,
				isLoading: workspaces?.isLoading ?? false
			},
			rbac: rbacInfo
		});
	});

	// Org branding state (Phase 2: Org Branding)
	// Use reactive query result, fallback to SSR data for initial render
	const workspaceId = $derived(activeWorkspaceId() ?? data.workspaceId ?? null);

	// Generate org branding CSS for ALL orgs (prevents CSS loss on workspace switch)
	const orgBrandingCSS = $derived.by(() => {
		// Get all org branding from query (fallback to empty object)
		const allBranding =
			(allOrgBrandingQuery?.data as
				| Record<string, { primaryColor: string; secondaryColor: string; logo?: string }>
				| null
				| undefined) ?? {};

		// Generate CSS for each org with branding
		// Use :root.org-{id} for higher specificity than :root alone
		const cssRules: string[] = [];
		for (const [orgId, branding] of Object.entries(allBranding)) {
			if (branding?.primaryColor) {
				const hoverColor = generateHoverColor(branding.primaryColor);
				cssRules.push(
					`:root.org-${orgId} { --color-brand-primary: ${branding.primaryColor}; --color-brand-secondary: ${branding.secondaryColor}; --color-brand-primaryHover: ${hoverColor}; }`
				);
			}
		}

		return cssRules.join('\n');
	});

	const orgBrandingStyleId = 'org-branding-styles';

	// Apply org branding CSS into dedicated style tag to avoid HTML injection
	$effect(() => {
		if (!browser) return;
		const styleEl = document.getElementById(orgBrandingStyleId);
		if (!styleEl) return;
		styleEl.textContent = orgBrandingCSS || '';
	});

	// Apply org class on client (idempotent - same as SSR, reactive to workspace switches)
	$effect(() => {
		if (browser && workspaceId) {
			// Remove ALL org-* classes to ensure clean state (handles SSR issues and workspace switches)
			const htmlElement = document.documentElement;
			const classesToRemove: string[] = [];
			htmlElement.classList.forEach((cls) => {
				if (cls.startsWith('org-')) {
					classesToRemove.push(cls);
				}
			});
			classesToRemove.forEach((cls) => htmlElement.classList.remove(cls));

			// Add new org class
			htmlElement.classList.add(`org-${workspaceId}`);
		}
	});

	// Initialize core module API and provide via context
	// Enables loose coupling - other modules can use global components and composables without direct imports (see SYOS-308, SYOS-322)
	const coreAPI = createCoreModuleAPI();
	setContext('core-api', coreAPI);

	// Extract global components and composables from CoreModuleAPI
	const Sidebar = coreAPI.Sidebar;
	const GlobalActivityTracker = coreAPI.GlobalActivityTracker;
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

	// Core features are always enabled (no feature flags)
	const circlesEnabled = true;
	const meetingsEnabled = true;
	const dashboardEnabled = true;

	const loadingOverlay = useLoadingOverlay();
	setContext('loadingOverlay', loadingOverlay);
	const isAuthenticated = $derived(data.isAuthenticated);
	const accountEmail = $derived(() => data.user?.email ?? 'user@example.com');
	const accountName = $derived(() =>
		data.user?.firstName && data.user?.lastName
			? `${data.user.firstName} ${data.user.lastName}`
			: accountEmail()
	);
	// Derive workspace name from active workspace (source of truth)
	// If not available yet (loading), will be undefined (handled gracefully by UI)
	const workspaceName = $derived(() => workspaces?.activeWorkspace?.name);

	// Account switching state (for page reloads)
	// CRITICAL: ALWAYS initialize as false - NEVER read from sessionStorage during initialization
	// Reading sessionStorage during initialization causes overlay to show BEFORE page reload
	// Only check sessionStorage in onMount (after component is mounted)
	let accountSwitchingState = $state<{
		isSwitching: boolean;
		switchingTo: string | null;
		switchingToType: 'personal' | 'workspace';
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
	const isOrgSwitching = $derived(workspaces?.isSwitching ?? false);

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
	// EXCEPTION: Don't show blur overlay during onboarding (workspace creation flow)
	const shouldShowSwitchingOverlay = $derived(
		!isOnboardingRoute && (isAccountSwitching || isOrgSwitching)
	);

	// Determine subtitle: "account" during account switch, "workspace" during org switch
	// IMPORTANT: Only use 'account' when account switching is active (not the flag - prevents pre-reload overlay)
	// During org switching, always use 'workspace' (not the org name) for consistent messaging
	const switchingSubtitle = $derived(isAccountSwitching ? 'account' : 'workspace');

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

	// Clear account switching state immediately when org switching starts
	// This ensures subtitle switches from 'account' to 'workspace' smoothly
	$effect(() => {
		if (!browser) return;

		if (workspaces?.isSwitching && accountSwitchingState.isSwitching) {
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
			return;
		}

		// Check minimum duration has elapsed (1 second for "Switching account" text)
		const elapsed = Date.now() - accountSwitchingState.startTime;
		const minimumAccountSwitchDuration = 1000; // Show "Switching account" for at least 1 second
		const minimumTotalDuration = 3000; // Total overlay duration (account + workspace loading)
		const orgSwitching = workspaces?.isSwitching ?? false;
		const dataLoaded = !workspaces?.isLoading; // Data has finished loading

		// Transition when:
		// 1. Org switching starts AND minimum account switch duration elapsed, OR
		// 2. Data loaded AND total minimum duration elapsed (ensures smooth transition even without explicit org switch)
		const shouldTransition =
			(orgSwitching && elapsed >= minimumAccountSwitchDuration) ||
			(dataLoaded && elapsed >= minimumTotalDuration);

		if (shouldTransition) {
			// If org switching is already active, just clear account switching state
			// The org switching overlay will continue showing "Loading workspace"
			if (orgSwitching) {
				accountSwitchingState.isSwitching = false;
				accountSwitchingState.switchingTo = null;
				accountSwitchingState.switchingToType = 'personal';
				accountSwitchingState.startTime = null;
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
				// Remove immediately (no fade) - LoadingOverlay will show immediately after
				if (staticOverlay.parentNode) {
					staticOverlay.remove();
				}
				delete window.__hasStaticOverlay;
			} else {
				delete window.__hasStaticOverlay;
			}
		}
	});

	// Check for account switching flag on mount
	onMount(() => {
		if (!browser) return;

		// Developer console log - only in development mode
		if (import.meta.env.DEV) {
			const pathname = window.location.pathname;
			const isWorkspaceRoute = pathname.startsWith('/w/');

			// Sanitize Convex URL (show only first part for security)
			const convexUrlSanitized = PUBLIC_CONVEX_URL
				? PUBLIC_CONVEX_URL.split('/').slice(0, 3).join('/') + '/...'
				: 'not configured';

			console.log('🔍 SynergyOS Dev Info', {
				auth: {
					userId: data.user?.userId ?? null,
					personId: personIdQuery?.data?.personId ?? null,
					email: data.user?.email ?? null,
					name: accountName() ?? null,
					workosId: data.user?.workosId ?? null,
					isAuthenticated: isAuthenticated,
					sessionId: data.sessionId ?? null
				},
				workspace: {
					activeId: workspaces?.activeWorkspaceId ?? null,
					activeName: workspaceName() ?? null,
					totalCount: workspaces?.workspaces?.length ?? 0,
					invitesCount: workspaces?.workspaceInvites?.length ?? 0,
					isSwitching: workspaces?.isSwitching ?? false
				},
				features: {
					circles: circlesEnabled,
					meetings: meetingsEnabled,
					dashboard: dashboardEnabled
				},
				route: {
					pathname,
					isWorkspaceRoute
				},
				environment: {
					mode: import.meta.env.DEV ? 'development' : 'production',
					platform: getPlatform(),
					convexUrl: convexUrlSanitized,
					isMobile
				},
				state: {
					isAccountSwitching: isAccountSwitching,
					isOrgSwitching: isOrgSwitching,
					isLoading: workspaces?.isLoading ?? false
				}
			});
		}

		// Don't remove static overlay immediately - wait until Svelte overlay is ready
		// This prevents flicker (blur on → blur off → blur on)
		// The static overlay will be replaced seamlessly by the Svelte overlay
		// Use $effect to remove static overlay once Svelte overlay is mounted

		const switchingData = sessionStorage.getItem('switchingAccount');
		if (switchingData) {
			try {
				const parsed = JSON.parse(switchingData);
				const flagAge = Date.now() - (parsed.startTime || 0);

				// CRITICAL: Only process flag if it was set BEFORE this component mounted
				// If flag was set very recently (< 100ms), it's from current click - ignore it
				// This prevents overlay from showing during client-side navigation before page reload
				if (flagAge < 100) {
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
	// Initial state will be set from token in browser initialization below
	let sidebarWidth = $state(0); // Will be set from token in browser block

	// Get current view from page URL
	const getCurrentView = () => {
		if (!browser) return 'inbox';
		const path = window.location.pathname;
		if (path.includes('/flashcards')) return 'flashcards';
		if (path.includes('/tags')) return 'tags';
		if (path.includes('/study')) return 'study';
		return 'inbox';
	};

	// Initialize client-only state from browser APIs
	if (browser) {
		// Mobile detection - uses breakpoint token from design-system.json
		const getBreakpointMd = () => {
			const breakpointMd = getComputedStyle(document.documentElement)
				.getPropertyValue('--breakpoint-md')
				.trim();
			return breakpointMd ? parseInt(breakpointMd, 10) : 768; // Fallback to 768px
		};
		isMobile = window.innerWidth < getBreakpointMd();
		window.addEventListener('resize', () => {
			isMobile = window.innerWidth < getBreakpointMd();
		});

		// Technical constants (not design values): rem-to-px conversion factor
		const REM_TO_PX_FACTOR = 16; // Standard browser rem base (not a design token)
		// Fallback values matching token defaults (used only if token read fails)
		const SIDEBAR_EXPANDED_FALLBACK_PX = 286; // Matches --size-sidebar-expanded token
		const SIDEBAR_COLLAPSED_FALLBACK_PX = 208; // Matches --size-sidebar-minWidth token

		// Helper to read sidebar width token and convert rem to pixels
		const getSidebarWidthToken = (tokenName: string, fallbackPx: number): number => {
			const tokenValue = getComputedStyle(document.documentElement)
				.getPropertyValue(tokenName)
				.trim();
			if (!tokenValue) return fallbackPx;
			const remValue = parseFloat(tokenValue);
			return remValue * REM_TO_PX_FACTOR; // Convert rem to pixels using standard browser rem base
		};

		// Load sidebar width from localStorage, fallback to expanded token (286px)
		const expandedWidth = getSidebarWidthToken(
			'--size-sidebar-expanded',
			SIDEBAR_EXPANDED_FALLBACK_PX
		);
		const collapsedWidth = getSidebarWidthToken(
			'--size-sidebar-collapsed',
			SIDEBAR_COLLAPSED_FALLBACK_PX
		);
		const savedSidebarWidth = parseInt(
			localStorage.getItem('sidebarWidth') || expandedWidth.toString()
		);
		// Ensure width is at least the minimum (collapsed width) to prevent sidebar from being invisible
		sidebarWidth = Math.max(collapsedWidth, savedSidebarWidth);
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
		// Support up to 9 workspaces (CMD+1 through CMD+9)
		for (let i = 1; i <= 9; i++) {
			shortcuts.register({
				key: i.toString(),
				meta: true,
				handler: () => {
					if (!workspaces) return;

					// Build workspace list: Organizations only (index 0, 1, 2, 3, 4, 5, 6, 7, 8)
					const workspaceIndex = i - 1; // Convert to 0-based index
					const orgList = workspaces.workspaces ?? [];

					// CMD+1-9 → Organizations (index 0, 1, 2, 3, 4, 5, 6, 7, 8)
					const targetOrg = orgList[workspaceIndex];

					if (targetOrg) {
						workspaces.setActiveWorkspace(targetOrg.workspaceId);
						toast.success(`Switched to ${targetOrg.name}`);
					} else {
						// No workspace at this index - show info toast
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

	// Design mode banner state (SYOS-910)
	// Show banner when on workspace route AND workspace is in design phase
	const isDesignMode = $derived(
		isWorkspaceRoute && workspaces?.activeWorkspace?.phase === 'design'
	);

	// Navigate to activation page (SYOS-998)
	function handleActivateClick() {
		const workspaceSlug = workspaces?.activeWorkspace?.slug;
		if (!workspaceSlug) {
			toast.error('No active workspace');
			return;
		}
		goto(resolveRoute(`/w/${workspaceSlug}/activate`));
	}
</script>

<!-- Inject org branding CSS (SSR-rendered, no FOUC) -->
<svelte:head>
	<style id="org-branding-styles"></style>
</svelte:head>

{#if isAdminRoute}
	<!-- Admin routes use their own layout - skip authenticated layout -->
	{@render children()}
{:else if isAuthenticated}
	<!--
		Shell Layout Pattern (Linear/Notion inspired)
		- Outer shell: base background (darkest) with subtle brand gradient
		- Inner content: floating elevated card with rounded corners, border, shadow
	-->
	<div
		class="bg-base relative flex h-screen overflow-hidden"
		style="padding-top: {isDesignMode && !isSettingsRoute && !isOnboardingRoute
			? 'var(--spacing-11)'
			: '0'};"
	>
		<!--
			Shell Background Gradient
			- Uses brand hue (195) at 3% opacity for subtle depth
			- Radial gradient from top-left for natural light feel
		-->
		<div
			class="pointer-events-none absolute inset-0 bg-radial-[at_0%_0%] from-[var(--gradient-overlay-subtle-from)] via-transparent to-transparent"
			aria-hidden="true"
		></div>

		<!-- Design Mode Banner (SYOS-910) - Fixed at top of viewport, spans full width -->
		{#if !isSettingsRoute && !isOnboardingRoute}
			<div class="fixed top-0 right-0 left-0" style="z-index: var(--zIndex-banner);">
				<DesignModeBanner {isDesignMode} onActivate={handleActivateClick} />
			</div>
		{/if}

		<!-- Shared Sidebar Component - Hidden on settings and onboarding routes -->
		{#if !isSettingsRoute && !isOnboardingRoute}
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
		{/if}

		<!-- Main Content Area - Floating Card (skip for settings and onboarding routes) -->
		{#if isSettingsRoute || isOnboardingRoute}
			<!-- Settings and onboarding routes use full-width layout (no shell pattern) -->
			<div class="flex flex-1 flex-col overflow-hidden">
				{@render children()}
			</div>
		{:else}
			<!-- Regular routes use shell layout pattern -->
			<div
				class="relative flex flex-1 flex-col overflow-hidden"
				style="padding: var(--spacing-2); padding-left: 0;"
			>
				<!--
					Content Card Container
					- Rounded corners (rounded-xl = 16px)
					- Subtle border for soft definition (not harsh)
					- Soft shadow for depth
					- Elevated background (lighter than sidebar for contrast)
				-->
				<div
					class="border-subtle bg-elevated flex flex-1 flex-col overflow-hidden rounded-xl border shadow-sm"
				>
					<!-- Top Bar with matching rounded corners -->
					<!-- <div class="rounded-t-xl bg-surface">
						<AppTopBar
							{workspaces}
							{isMobile}
							{sidebarCollapsed}
							onSidebarToggle={() => (sidebarCollapsed = !sidebarCollapsed)}
							accountName={accountName()}
							accountEmail={accountEmail()}
							workspaceName={workspaceName()}
						/>
					</div> -->
					<div class="flex-1 overflow-y-auto">
						{@render children()}
					</div>
				</div>
			</div>
		{/if}

		<!-- Global Activity Tracker -->
		<GlobalActivityTracker />

		<!-- Quick Create Modal -->
		<QuickCreateModal
			bind:open={quickCreateModalOpen}
			triggerMethod={quickCreateTrigger}
			currentView={getCurrentView()}
			initialType={quickCreateInitialType}
			sessionId={data.sessionId}
			workspaceId={workspaces?.activeWorkspaceId ?? null}
			initialTags={data.tags}
		/>

		<!-- Loading Overlay (workspace switching, account operations, etc.) -->
		<!-- Single continuous overlay that transitions from "Switching account" to "Loading workspace" -->
		{#if shouldShowSwitchingOverlay}
			{@const subtitleValue = switchingSubtitle}
			<LoadingOverlay show={true} flow="workspace-switching" subtitle={subtitleValue} />
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
	<div class="bg-base flex h-screen items-center justify-center">
		<div class="text-center">
			<p class="mb-content-section text-primary">Please log in to continue</p>
			<a href={resolveRoute('/login')} class="text-accent-primary">Go to Login</a>
		</div>
	</div>
{/if}

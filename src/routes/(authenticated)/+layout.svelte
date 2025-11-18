<script lang="ts">
	import { browser } from '$app/environment';
	// TODO: Re-enable when page is needed
	// import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import GlobalActivityTracker from '$lib/components/GlobalActivityTracker.svelte';
	import AppTopBar from '$lib/components/organizations/AppTopBar.svelte';
	import QuickCreateModal from '$lib/components/QuickCreateModal.svelte';
	import OrganizationModals from '$lib/components/organizations/OrganizationModals.svelte';
	import LoadingOverlay from '$lib/components/ui/LoadingOverlay.svelte';
	import { resolveRoute } from '$lib/utils/navigation';
	import { setContext } from 'svelte';
	import { useOrganizations } from '$lib/composables/useOrganizations.svelte';
	import type {
		OrganizationSummary,
		OrganizationInvite,
		TeamInvite,
		TeamSummary
	} from '$lib/composables/useOrganizations.svelte';
	import { useGlobalShortcuts, SHORTCUTS } from '$lib/composables/useGlobalShortcuts.svelte';
	import { useLoadingOverlay } from '$lib/composables/useLoadingOverlay.svelte';
	import { toast } from '$lib/utils/toast';
	import { page } from '$app/stores';
	// TODO: Re-enable when Id type is needed
	// import type { Id } from '$lib/convex';

	let { children, data } = $props();

	// Check if we're on an admin route - skip authenticated layout for admin routes
	const isAdminRoute = $derived(browser ? $page.url.pathname.startsWith('/admin') : false);

	// Initialize organizations composable with sessionId and server-side preloaded data
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
			: (data.user?.email ?? 'Personal workspace')
	);
	const workspaceName = $derived(() => data.activeWorkspace?.name ?? 'Private workspace');

	// Account switching state (for page reloads)
	let accountSwitchingState = $state<{
		isSwitching: boolean;
		switchingTo: string | null;
		switchingToType: 'personal' | 'organization';
		startTime: number | null;
	}>({
		isSwitching: false,
		switchingTo: null,
		switchingToType: 'personal',
		startTime: null
	});

	// Check for account switching flag on mount
	onMount(() => {
		if (!browser) return;

		// Remove static overlay if it exists (from app.html inline script)
		if (window.__hasStaticOverlay) {
			const staticOverlay = document.getElementById('__switching-overlay');
			if (staticOverlay) {
				staticOverlay.remove();
			}
			delete window.__hasStaticOverlay;
		}

		const switchingData = sessionStorage.getItem('switchingAccount');
		if (switchingData) {
			try {
				const parsed = JSON.parse(switchingData);
				accountSwitchingState.isSwitching = true;
				accountSwitchingState.switchingTo = parsed.accountName || 'account';
				accountSwitchingState.switchingToType = 'personal'; // Account switches are always to personal workspace
				accountSwitchingState.startTime = parsed.startTime || Date.now();

				// Clear the flag immediately (we've read it)
				sessionStorage.removeItem('switchingAccount');

				// Ensure minimum 5 second display
				const elapsed = Date.now() - (accountSwitchingState.startTime ?? Date.now());
				const minimumDuration = 5000;
				const remaining = Math.max(0, minimumDuration - elapsed);

				setTimeout(() => {
					accountSwitchingState.isSwitching = false;
					accountSwitchingState.switchingTo = null;
					accountSwitchingState.switchingToType = 'personal';
					accountSwitchingState.startTime = null;
				}, remaining);
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
		{#if (organizations?.isSwitching ?? false) || accountSwitchingState.isSwitching}
			<LoadingOverlay
				show={true}
				flow="workspace-switching"
				subtitle={organizations?.isSwitching
					? (organizations.switchingTo ?? 'workspace')
					: (accountSwitchingState.switchingTo ?? 'account')}
			/>
		{/if}

		<!-- Global Loading Overlay (for account registration, linking, workspace creation) -->
		<LoadingOverlay
			show={loadingOverlay.show}
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

<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import GlobalActivityTracker from '$lib/components/GlobalActivityTracker.svelte';
	import AppTopBar from '$lib/components/organizations/AppTopBar.svelte';
	import QuickCreateModal from '$lib/components/QuickCreateModal.svelte';
	import OrganizationModals from '$lib/components/organizations/OrganizationModals.svelte';
	import { getContext, setContext } from 'svelte';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';
	import { useGlobalShortcuts, SHORTCUTS } from '$lib/composables/useGlobalShortcuts.svelte';
	import { toast } from '$lib/utils/toast';

	let { children, data } = $props();

	const organizations = getContext<UseOrganizations | undefined>('organizations');
	const isAuthenticated = $derived(data.isAuthenticated);
	const accountEmail = $derived(() => data.user?.email ?? 'user@example.com');
	const accountName = $derived(() =>
		data.user?.firstName && data.user?.lastName
			? `${data.user.firstName} ${data.user.lastName}`
			: (data.user?.email ?? 'Personal workspace')
	);
	const workspaceName = $derived(() => data.activeWorkspace?.name ?? 'Private workspace');

	// Initialize global shortcuts (only in browser - SSR safe)
	const shortcuts = browser ? useGlobalShortcuts() : null;

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
		if (!shortcuts) return;

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

		// CMD+1/2/3/4/5/6/7/8/9 - Workspace switching shortcuts
		// Personal workspace is always index 0, organizations follow (1, 2, 3, 4...)
		// Support up to 9 workspaces total (CMD+1 through CMD+9)
		for (let i = 1; i <= 9; i++) {
			shortcuts.register({
				key: i.toString(),
				meta: true,
				handler: () => {
					if (!organizations) return;

					// Build workspace list: Personal (index 0) + Organizations (index 1+)
					const workspaceIndex = i - 1; // Convert to 0-based index
					const orgList = organizations.organizations ?? [];

					if (workspaceIndex === 0) {
						// CMD+1 → Personal workspace
						organizations.setActiveOrganization(null);
						toast.success('Switched to Personal workspace');
					} else {
						// CMD+2-9 → Organizations (index 1, 2, 3, 4, 5, 6, 7, 8)
						const orgIndex = workspaceIndex - 1; // Convert to org array index
						const targetOrg = orgList[orgIndex];

						if (targetOrg) {
							organizations.setActiveOrganization(targetOrg.organizationId);
							toast.success(`Switched to ${targetOrg.name}`);
						} else {
							// No organization at this index - show info toast
							toast.info(`No workspace at position ${i}. Create one to use CMD+${i}.`);
						}
					}
				},
				description: `Switch to workspace ${i}`,
				preventDefault: true
			});
		}

		return () => {
			shortcuts.unregister(SHORTCUTS.CREATE);
			shortcuts.unregister(SHORTCUTS.COMMAND_PALETTE, { meta: true });
			// Unregister workspace shortcuts
			for (let i = 1; i <= 9; i++) {
				shortcuts.unregister(i.toString(), { meta: true });
			}
		};
	});

	// Redirect to login if not authenticated (shouldn't reach here due to server-side redirect)
	$effect(() => {
		if (browser && !isAuthenticated) {
			window.location.href = '/login';
		}
	});
</script>

{#if isAuthenticated}
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
			userId={data.user?.userId}
		/>

		<!-- Organization Modals (Create/Join Org, Create/Join Team) -->
		{#if organizations}
			<OrganizationModals
				{organizations}
				activeOrganizationName={organizations.activeOrganization?.name ?? null}
			/>
		{/if}
	</div>
{:else}
	<!-- Not authenticated - shouldn't reach here due to redirect, but show login prompt -->
	<div class="flex h-screen items-center justify-center bg-base">
		<div class="text-center">
			<p class="mb-4 text-primary">Please log in to continue</p>
			<a href="/login" class="text-accent-primary">Go to Login</a>
		</div>
	</div>
{/if}

<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import GlobalActivityTracker from '$lib/components/GlobalActivityTracker.svelte';
    import AppTopBar from '$lib/components/organizations/AppTopBar.svelte';
    import QuickCreateModal from '$lib/components/QuickCreateModal.svelte';
    import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
    import { getContext, setContext } from 'svelte';
    import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';
    import { useGlobalShortcuts, SHORTCUTS } from '$lib/composables/useGlobalShortcuts.svelte';

	let { children } = $props();

    const organizations = getContext<UseOrganizations | undefined>('organizations');
    const auth = useAuth();
    const isAuthenticated = $derived(auth.isAuthenticated);
    const isLoading = $derived(auth.isLoading);
    const accountEmail = $derived(() => auth.user?.email ?? 'user@example.com');
    const accountName = $derived(() => auth.user?.name ?? 'Personal workspace');

	// Initialize global shortcuts (only in browser - SSR safe)
	const shortcuts = browser ? useGlobalShortcuts() : null;

	// Get inbox count for sidebar - using 0 for now since inbox uses mock data
	// TODO: Replace with actual Convex query when inbox data is connected
	const inboxCount = $derived(0);

	// Client-only state (SSR safe)
	let createMenuOpen = $state(false);
	let quickCreateModalOpen = $state(false);
	let quickCreateTrigger = $state<'keyboard_n' | 'header_button' | 'footer_button'>('keyboard_n');
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

		// 'N' key - Quick create note (direct, no modal)
		shortcuts.register({
			key: 'n',
			handler: () => {
				// TODO: Implement quick note creation (inline or minimal modal)
				console.log('Quick note (N key) - to be implemented');
			},
			description: 'New note (quick)',
			preventDefault: true,
		});

		// 'C' key - Opens Command Center (full Quick Create palette)
		shortcuts.register({
			key: SHORTCUTS.CREATE,
			handler: () => {
				quickCreateTrigger = 'keyboard_n';
				quickCreateModalOpen = true;
			},
			description: 'Command Center',
			preventDefault: true,
		});

		return () => {
			shortcuts.unregister('n');
			shortcuts.unregister(SHORTCUTS.CREATE);
		};
	});

	// Redirect to login if not authenticated
	$effect(() => {
		if (browser && !isLoading && !isAuthenticated) {
			window.location.href = '/login';
		}
	});
</script>

{#if isLoading}
	<div class="h-screen flex items-center justify-center bg-base">
		<p class="text-secondary">Loading...</p>
	</div>
{:else if isAuthenticated}
	<div class="h-screen flex overflow-hidden">
		<!-- Shared Sidebar Component -->
		<Sidebar
			inboxCount={inboxCount}
			isMobile={isMobile}
			sidebarCollapsed={sidebarCollapsed}
			onToggleCollapse={() => (sidebarCollapsed = !sidebarCollapsed)}
			sidebarWidth={sidebarWidth}
			onSidebarWidthChange={handleSidebarWidthChange}
			createMenuOpen={createMenuOpen}
			onCreateMenuChange={(open) => (createMenuOpen = open)}
			onQuickCreate={(trigger) => {
				quickCreateTrigger = trigger;
				quickCreateModalOpen = true;
			}}
		/>

		<!-- Main Content Area -->
        <div class="flex-1 overflow-hidden flex flex-col">
            <AppTopBar
                organizations={organizations}
                isMobile={isMobile}
                sidebarCollapsed={sidebarCollapsed}
                onSidebarToggle={() => (sidebarCollapsed = !sidebarCollapsed)}
                accountName={accountName()}
                accountEmail={accountEmail()}
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
		/>
	</div>
{:else}
	<!-- Not authenticated - shouldn't reach here due to redirect, but show login prompt -->
	<div class="h-screen flex items-center justify-center bg-base">
		<div class="text-center">
			<p class="text-primary mb-4">Please log in to continue</p>
			<a href="/login" class="text-accent-primary">Go to Login</a>
		</div>
	</div>
{/if}

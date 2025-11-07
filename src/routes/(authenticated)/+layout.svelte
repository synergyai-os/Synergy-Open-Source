<script lang="ts">
    import { browser } from '$app/environment';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import GlobalActivityTracker from '$lib/components/GlobalActivityTracker.svelte';
    import AppTopBar from '$lib/components/organizations/AppTopBar.svelte';
    import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
    import { getContext, setContext } from 'svelte';
    import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';

	let { children } = $props();

    const organizations = getContext<UseOrganizations | undefined>('organizations');
    const auth = useAuth();
    const isAuthenticated = $derived(auth.isAuthenticated);
    const isLoading = $derived(auth.isLoading);
    const accountEmail = $derived(() => auth.user?.email ?? 'user@example.com');
    const accountName = $derived(() => auth.user?.name ?? 'Personal workspace');

	// Get inbox count for sidebar - using 0 for now since inbox uses mock data
	// TODO: Replace with actual Convex query when inbox data is connected
	const inboxCount = $derived(0);

	// Mobile detection
	let isMobile = $state(false);
	if (browser) {
		isMobile = window.innerWidth < 768;
		window.addEventListener('resize', () => {
			isMobile = window.innerWidth < 768;
		});
	}

	// Sidebar state
	let sidebarCollapsed = $state(false);
	let sidebarWidth = $state(286); // Default width: 286px (was 256px, increased by 30px)

	// Initialize sidebar width from localStorage
	if (browser) {
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

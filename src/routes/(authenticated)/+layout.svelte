<script lang="ts">
	import { browser } from '$app/environment';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { setContext } from 'svelte';

	let { children } = $props();

	const auth = useAuth();
	const isAuthenticated = $derived(auth.isAuthenticated);
	const isLoading = $derived(auth.isLoading);

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
	let sidebarWidth = $state(256);

	// Initialize sidebar width from localStorage
	if (browser) {
		const savedSidebarWidth = parseInt(localStorage.getItem('sidebarWidth') || '256');
		sidebarWidth = savedSidebarWidth;
	}

	function handleSidebarWidthChange(width: number) {
		sidebarWidth = width;
		if (browser) {
			localStorage.setItem('sidebarWidth', width.toString());
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
		<div class="flex-1 overflow-hidden">
			{@render children()}
		</div>
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

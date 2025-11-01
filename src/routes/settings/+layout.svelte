<script lang="ts">
	import { browser } from '$app/environment';
	import SettingsSidebar from '$lib/components/SettingsSidebar.svelte';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

	let { children } = $props();

	const auth = useAuth();
	const isAuthenticated = $derived(auth.isAuthenticated);
	const isLoading = $derived(auth.isLoading);

	// Mobile detection
	let isMobile = $state(false);
	if (browser) {
		isMobile = window.innerWidth < 768;
		window.addEventListener('resize', () => {
			isMobile = window.innerWidth < 768;
		});
	}

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
		<!-- Settings Sidebar - Fixed, no collapse/resize -->
		<SettingsSidebar {isMobile} />

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


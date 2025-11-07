<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { PUBLIC_CONVEX_URL, PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY } from '$env/static/public';
	import { browser } from '$app/environment';
	import posthog from 'posthog-js';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { children, data } = $props();

	// Set up authentication (automatically initializes authenticated Convex client)
	// setupConvexAuth creates its own client and should register it with convex-svelte context
	// We DON'T need to call setupConvex() separately - it would create an unauthenticated client
	const authResult = setupConvexAuth({ 
		getServerState: () => data.authState,
		convexUrl: PUBLIC_CONVEX_URL // Explicitly pass URL to ensure it uses the right one
	});
	
	console.log('✅ Convex Auth setup complete', {
		isAuthenticated: authResult.isAuthenticated,
		isLoading: authResult.isLoading
	});

	// Initialize PostHog after the component mounts in the browser
	if (browser) {
		onMount(() => {
			posthog.init(PUBLIC_POSTHOG_KEY, {
				api_host: PUBLIC_POSTHOG_HOST,
				capture_pageview: false,
				capture_pageleave: false,
				capture_exceptions: true
			});

			beforeNavigate(() => posthog.capture('$pageleave'));
			afterNavigate(() => posthog.capture('$pageview'));
		});
	}

	// Theme is initialized via inline script in app.html for FOUC prevention
	// Components using createThemeStore() will initialize reactively on first use
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
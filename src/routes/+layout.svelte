<script lang="ts">
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
    import { PUBLIC_CONVEX_URL, PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY } from '$env/static/public';
    import { browser } from '$app/environment';
    import posthog from 'posthog-js';
    import { beforeNavigate, afterNavigate } from '$app/navigation';
    import { onMount, setContext } from 'svelte';
    import { identityFromToken } from '$lib/posthog/identity';
    import { useOrganizations } from '$lib/composables/useOrganizations.svelte';
    import OrganizationModals from '$lib/components/organizations/OrganizationModals.svelte';

    let { children, data } = $props();

	// Set up authentication (automatically initializes authenticated Convex client)
	// setupConvexAuth creates its own client and should register it with convex-svelte context
	// We DON'T need to call setupConvex() separately - it would create an unauthenticated client
	
	// Debug: Check what server state we're getting
	console.log('🔍 Server auth state:', data.authState);
	console.log('🔍 Convex URL:', PUBLIC_CONVEX_URL);
	
	const authResult = setupConvexAuth({ 
		getServerState: () => data.authState,
		convexUrl: PUBLIC_CONVEX_URL // Explicitly pass URL to ensure it uses the right one
	});
	
	// Use $effect to log auth state changes
	$effect(() => {
		console.log('🔄 Auth state changed:', {
			isAuthenticated: authResult.isAuthenticated,
			isLoading: authResult.isLoading,
			token: authResult.token ? '(has token)' : '(no token)'
		});
	});

	const organizationStore = useOrganizations();
	setContext('organizations', organizationStore);

	let posthogReady = $state(false);
	let lastIdentifiedId = $state<string | null>(null);

    const activeOrganizationName = $derived(() => organizationStore?.activeOrganization?.name ?? null);

	// Initialize PostHog after the component mounts in the browser
	if (browser && PUBLIC_POSTHOG_KEY) {
		onMount(() => {
			posthog.init(PUBLIC_POSTHOG_KEY, {
				api_host: PUBLIC_POSTHOG_HOST,
				capture_pageview: false,
				capture_pageleave: false,
				capture_exceptions: true
			});

			beforeNavigate(() => posthog.capture('$pageleave'));
			afterNavigate(() => posthog.capture('$pageview'));

			posthogReady = true;
		});
	}

	$effect(() => {
		if (!browser || !PUBLIC_POSTHOG_KEY || !posthogReady) return;

		const isAuthenticated = authResult.isAuthenticated;
		const token = authResult.token;

		if (!isAuthenticated || !token) {
			if (lastIdentifiedId) {
				posthog.reset();
				lastIdentifiedId = null;
			}
			return;
		}

		const identity = identityFromToken(token);
		if (!identity) return;

		if (lastIdentifiedId === identity.distinctId) return;

		lastIdentifiedId = identity.distinctId;
		posthog.identify(identity.distinctId, identity.properties);
	});

	// Theme is initialized via inline script in app.html for FOUC prevention
	// Components using createThemeStore() will initialize reactively on first use
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<OrganizationModals
    organizations={organizationStore}
    activeOrganizationName={activeOrganizationName()}
/>
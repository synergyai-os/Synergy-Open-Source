<script lang="ts">
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import { PUBLIC_CONVEX_URL, PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY } from '$env/static/public';
    import { browser } from '$app/environment';
    import posthog from 'posthog-js';
    import { beforeNavigate, afterNavigate } from '$app/navigation';
    import { onMount, setContext } from 'svelte';
    import { setupConvex } from 'convex-svelte';
    import { useOrganizations } from '$lib/composables/useOrganizations.svelte';
    import OrganizationModals from '$lib/components/organizations/OrganizationModals.svelte';

    let { children, data } = $props();

	// Set up Convex client (unauthenticated - WorkOS handles auth separately)
	setupConvex(PUBLIC_CONVEX_URL);

	const organizationStore = useOrganizations();
	setContext('organizations', organizationStore);

	let posthogReady = $state(false);

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

	// PostHog identity tracking from WorkOS user
	$effect(() => {
		if (!browser || !PUBLIC_POSTHOG_KEY || !posthogReady) return;

		if (data.user) {
			posthog.identify(data.user.id, {
				email: data.user.email,
				name: data.user.firstName && data.user.lastName 
					? `${data.user.firstName} ${data.user.lastName}` 
					: data.user.email
			});
		} else {
				posthog.reset();
		}
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
<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { PUBLIC_CONVEX_URL, PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY } from '$env/static/public';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import posthog from 'posthog-js';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { onMount, setContext } from 'svelte';
	import { setupConvex, useConvexClient } from 'convex-svelte';
	import { useOrganizations } from '$lib/composables/useOrganizations.svelte';
	import OrganizationModals from '$lib/components/organizations/OrganizationModals.svelte';

	let { children, data } = $props();

	// Set up Convex client
	setupConvex(PUBLIC_CONVEX_URL);
	const convexClient = browser ? useConvexClient() : null;

	const organizationStore = useOrganizations({
		userId: () => data.user?.userId,
		orgFromUrl: () => $page.url.searchParams.get('org')
	});
	setContext('organizations', organizationStore);

	let posthogReady = $state(false);

	const activeOrganizationName = $derived(
		() => organizationStore?.activeOrganization?.name ?? null
	);

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
				name:
					data.user.firstName && data.user.lastName
						? `${data.user.firstName} ${data.user.lastName}`
						: data.user.email
			});
		} else {
			posthog.reset();
		}
	});

	// Set Convex auth token when user is authenticated
	$effect(() => {
		console.log('🔍 Convex auth $effect triggered:', {
			browser,
			hasConvexClient: !!convexClient,
			isAuthenticated: data.isAuthenticated,
			userEmail: data.user?.email
		});

		if (!browser || !convexClient) {
			console.log('⏸️  Skipping Convex auth setup (no browser or client)');
			return;
		}

		if (!data.isAuthenticated) {
			console.log('🔓 User not authenticated, clearing Convex auth');
			convexClient.setAuth(async () => null);
			return;
		}

		console.log('🔐 Setting up Convex auth for authenticated user');
		
		// Fetch WorkOS access token and set it on Convex client
		convexClient.setAuth(async () => {
			console.log('🔍 Fetching WorkOS access token for Convex...');
			
			try {
				const response = await fetch('/auth/token', {
					credentials: 'include'
				});
				
				if (!response.ok) {
					console.error('❌ Failed to fetch auth token:', response.status);
					return null;
				}

				const { token } = await response.json();
				console.log('✅ WorkOS token fetched successfully:', token ? 'present' : 'missing');
				return token;
			} catch (error) {
				console.error('❌ Error fetching auth token:', error);
				return null;
			}
		});
	});

	// Theme is initialized via inline script in app.html for FOUC prevention
	// Components using createThemeStore() will initialize reactively on first use

	// Dynamically import Toaster only on client side (SSR issue with svelte-sonner)
	let Toaster = $state<any>(null);

	onMount(async () => {
		// Import svelte-sonner only on client side to avoid SSR issues
		const module = await import('svelte-sonner');
		Toaster = module.Toaster;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<OrganizationModals
	organizations={organizationStore}
	activeOrganizationName={activeOrganizationName()}
/>

<!-- Toast notifications - positioned top-right, styled with design tokens -->
<!-- Loaded client-side only to avoid SSR issues with svelte-sonner -->
{#if Toaster}
	<Toaster position="top-right" expand={false} richColors closeButton />
{/if}

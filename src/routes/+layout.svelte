<script lang="ts">
	import '../styles/app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { PUBLIC_CONVEX_URL, PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_KEY } from '$env/static/public';
	import { browser } from '$app/environment';
	import posthog from 'posthog-js';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { setupConvex, useConvexClient } from 'convex-svelte';
	import { BitsConfig } from 'bits-ui';

	let { children, data } = $props();

	// Detect browser locale for date formatting (defaults to en-GB for European format)
	// Future: Add user preference toggle like theme, store in localStorage/Convex
	const detectedLocale = $derived(browser && navigator.language ? navigator.language : 'en-GB');

	// Set up Convex client
	setupConvex(PUBLIC_CONVEX_URL);
	const convexClient = browser ? useConvexClient() : null;

	let posthogReady = $state(false);

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
			afterNavigate(() => {
				posthog.capture('$pageview');

				const params = new URLSearchParams(window.location.search);
				const fallbackReason = params.get('auth_fallback');
				if (fallbackReason) {
					posthog.capture('auth_redirect_fallback', {
						reason: fallbackReason,
						path: window.location.pathname
					});
				}
			});

			posthogReady = true;
		});
	}

	// PostHog identity tracking from WorkOS user
	$effect(() => {
		if (!browser || !PUBLIC_POSTHOG_KEY || !posthogReady) return;

		if (data.user) {
			posthog.identify(data.user.userId, {
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
		if (!browser || !convexClient) {
			return;
		}

		if (!data.isAuthenticated) {
			convexClient.setAuth(async () => null);
			return;
		}

		// Fetch WorkOS access token and set it on Convex client
		convexClient.setAuth(async () => {
			try {
				const response = await fetch('/auth/token', {
					credentials: 'include'
				});

				if (!response.ok) {
					return null;
				}

				const { token } = await response.json();
				return token;
			} catch (_error) {
				return null;
			}
		});
	});

	// Theme is initialized via inline script in app.html for FOUC prevention
	// Components using createThemeStore() will initialize reactively on first use

	// Dynamically import Toaster only on client side (SSR issue with svelte-sonner)
	let Toaster = $state<typeof import('svelte-sonner').Toaster | null>(null);

	onMount(async () => {
		// Import svelte-sonner only on client side to avoid SSR issues
		const module = await import('svelte-sonner');
		Toaster = module.Toaster;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<BitsConfig defaultPortalTo="body" defaultLocale={detectedLocale}>
	{@render children()}
</BitsConfig>

<!-- Toast notifications - positioned top-right, styled with design tokens -->
<!-- Loaded client-side only to avoid SSR issues with svelte-sonner -->
{#if Toaster}
	<Toaster position="top-right" expand={false} richColors closeButton />
{/if}

<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

	let { children, data } = $props();

	// Set up authentication (automatically initializes Convex client)
	setupConvexAuth({ getServerState: () => data.authState });

	// Theme is initialized via inline script in app.html for FOUC prevention
	// Components using createThemeStore() will initialize reactively on first use
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

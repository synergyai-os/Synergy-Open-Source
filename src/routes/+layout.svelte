<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

	let { children, data } = $props();

	// Set up authentication (automatically initializes Convex client)
	setupConvexAuth({ getServerState: () => data.authState });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

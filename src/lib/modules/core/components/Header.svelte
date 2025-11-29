<script lang="ts">
	import { Button } from '$lib/components/atoms';
	import { resolve } from '$app/paths';

	let {
		isAuthenticated = false
	}: {
		isAuthenticated?: boolean;
	} = $props();
</script>

<header
	class="h-system-header border-base px-inbox-container py-system-header sticky top-0 z-50 flex items-center justify-between border-b bg-surface"
>
	<!-- Logo -->
	<a
		href={resolve('/')}
		class="text-h3 hover:text-accent-primary font-bold text-primary transition-colors"
	>
		SYOS
	</a>

	<!-- Navigation Buttons -->
	<div class="flex items-center gap-2">
		{#if isAuthenticated}
			<!-- Logged in: Show Dashboard button -->
			<Button variant="primary" href={resolve('/inbox')}>Dashboard</Button>
		{:else}
			<!-- Not logged in: Show Register/Login -->
			<Button variant="secondary" href={resolve('/register')}>Register</Button>
			<Button variant="primary" href={resolve('/login')}>Login</Button>
		{/if}
	</div>
</header>

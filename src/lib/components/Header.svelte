<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { resolve } from '$app/paths';
	import { resolveRoute } from '$lib/utils/navigation';

	let {
		isAuthenticated = false
	}: {
		isAuthenticated?: boolean;
	} = $props();
</script>

<header
	class="sticky top-0 z-50 flex h-system-header items-center justify-between border-b border-base bg-surface px-inbox-container py-system-header"
>
	<!-- Logo -->
	<a
		href={resolve('/')}
		class="text-xl font-bold text-primary transition-colors hover:text-accent-primary"
	>
		SYOS
	</a>

	<!-- Navigation Buttons -->
	<div class="flex items-center gap-icon">
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

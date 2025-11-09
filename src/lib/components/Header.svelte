<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	let {
		isAuthenticated = false
	}: {
		isAuthenticated?: boolean;
	} = $props();
</script>

<header
	class="sticky top-0 z-50 bg-surface border-b border-base px-inbox-container py-system-header h-system-header flex items-center justify-between"
>
	<!-- Logo -->
	<a href="/" class="text-xl font-bold text-primary hover:text-accent-primary transition-colors">
		SYOS
	</a>

	<!-- Navigation Buttons -->
	<div class="flex items-center gap-icon">
		{#if isAuthenticated}
			<!-- Logged in: Show Dashboard button -->
			<Button variant="primary" href="/inbox">Dashboard</Button>
		{:else}
			<!-- Not logged in: Show Register/Login -->
			<Button variant="secondary" href="/register">Register</Button>
			<Button variant="primary" href="/login">Login</Button>
		{/if}
	</div>
</header>


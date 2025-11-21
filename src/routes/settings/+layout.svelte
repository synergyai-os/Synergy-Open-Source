<script lang="ts">
	import { browser } from '$app/environment';
	import SettingsSidebar from '$lib/modules/core/components/SettingsSidebar.svelte';

	let { children, data } = $props();

	// Mobile detection
	let isMobile = $state(false);
	if (browser) {
		isMobile = window.innerWidth < 768;
		const handleResize = () => {
			isMobile = window.innerWidth < 768;
		};
		window.addEventListener('resize', handleResize);
		// Cleanup is handled automatically by Svelte
	}
</script>

{#if data.isAuthenticated}
	<div class="flex h-screen overflow-hidden">
		<!-- Settings Sidebar - Fixed, no collapse/resize -->
		<SettingsSidebar {isMobile} />

		<!-- Main Content Area -->
		<div class="flex-1 overflow-hidden">
			{@render children()}
		</div>
	</div>
{/if}

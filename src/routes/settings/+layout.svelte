<script lang="ts">
	import { browser } from '$app/environment';
	import SettingsSidebar from '$lib/modules/core/components/SettingsSidebar.svelte';

	let { children, data } = $props();

	// Mobile detection - uses breakpoint token from design-system.json
	let isMobile = $state(false);
	if (browser) {
		const getBreakpointMd = () => {
			const breakpointMd = getComputedStyle(document.documentElement)
				.getPropertyValue('--breakpoint-md')
				.trim();
			return breakpointMd ? parseInt(breakpointMd, 10) : 768; // Fallback to 768px
		};
		isMobile = window.innerWidth < getBreakpointMd();
		const handleResize = () => {
			isMobile = window.innerWidth < getBreakpointMd();
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

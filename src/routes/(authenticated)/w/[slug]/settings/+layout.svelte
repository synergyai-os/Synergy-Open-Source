<script lang="ts">
	import { browser } from '$app/environment';
	import WorkspaceSettingsSidebar from '$lib/modules/core/components/WorkspaceSettingsSidebar.svelte';

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

	// Get workspace slug from parent layout data
	const workspaceSlug = $derived((data.workspaceSlug as string | undefined) ?? '');
</script>

<div class="flex h-screen overflow-hidden bg-base">
	<!-- Settings Sidebar - Fixed, no collapse/resize -->
	{#if workspaceSlug}
		<WorkspaceSettingsSidebar {workspaceSlug} {isMobile} />
	{/if}

	<!-- Main Content Area - Full width (no shell layout pattern) -->
	<div class="flex-1 overflow-hidden">
		{@render children()}
	</div>
</div>

<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { resolveRoute } from '$lib/utils/navigation';
	import OrgChart from '$lib/modules/org-chart/components/OrgChart.svelte';
	import CircleDetailPanel from '$lib/modules/org-chart/components/CircleDetailPanel.svelte';
	import RoleDetailPanel from '$lib/modules/org-chart/components/RoleDetailPanel.svelte';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import type { OrgChartModuleAPI } from '$lib/modules/org-chart/api';

	let { data: _data } = $props();

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const orgChartAPI = getContext<OrgChartModuleAPI | undefined>('org-chart-api');

	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	const workspaceId = $derived(() => {
		if (!workspaces) return undefined;
		return workspaces.activeWorkspaceId ?? undefined;
	});
	const organizationName = $derived(() => {
		if (!workspaces) return 'Organization';
		return workspaces.activeWorkspace?.name ?? 'Organization';
	});

	const getSessionId = () => $page.data.sessionId;
	// CRITICAL: Call $derived function to get primitive value (not the function itself)
	const getWorkspaceId = () => workspaceId();

	// Initialize org chart composable via API (enables loose coupling - see SYOS-314)
	if (!orgChartAPI) {
		throw new Error('OrgChartModuleAPI not available in context');
	}
	const orgChart = orgChartAPI.useOrgChart({
		sessionId: getSessionId,
		workspaceId: getWorkspaceId
	});

	const isLoading = $derived(orgChart.isLoading);
</script>

<div class="flex h-full flex-col bg-base">
	<!-- Header -->
	<header
		class="h-system-header border-base py-system-header flex flex-shrink-0 items-center justify-between border-b bg-surface px-page"
	>
		<div>
			<h1 class="text-button font-normal text-secondary">Org Chart</h1>
			<p class="text-label text-tertiary">{organizationName}</p>
		</div>
		<div class="flex items-center gap-2">
			<button
				class="py-nav-item text-button hover:bg-hover-solid rounded-button px-2 text-secondary hover:text-primary"
				onclick={() => goto(resolveRoute('/org/circles'))}
			>
				← Back to Circles
			</button>
		</div>
	</header>

	<!-- Content -->
	<main class="relative flex-1 overflow-hidden">
		{#if isLoading}
			<div class="flex h-full items-center justify-center">
				<div class="text-secondary">Loading org chart...</div>
			</div>
		{:else}
			<div class="p-inbox-container h-full">
				<OrgChart {orgChart} />
			</div>
		{/if}
	</main>
</div>

<!-- Detail Panels -->
<CircleDetailPanel {orgChart} />
<RoleDetailPanel {orgChart} />

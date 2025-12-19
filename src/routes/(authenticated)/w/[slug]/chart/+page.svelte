<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { getContext } from 'svelte';
	import { invariant } from '$lib/utils/invariant';
	import OrgChart from '$lib/modules/org-chart/components/OrgChart.svelte';
	import CircleDetailPanel from '$lib/modules/org-chart/components/CircleDetailPanel.svelte';
	import RoleDetailPanel from '$lib/modules/org-chart/components/RoleDetailPanel.svelte';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import type { OrgChartModuleAPI } from '$lib/modules/org-chart/api';
	import type { Id } from '$lib/convex/_generated/dataModel';

	let { data: _data } = $props();

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const orgChartAPI = getContext<OrgChartModuleAPI | undefined>('org-chart-api');
	const workspaceSlug = $derived(() => {
		if (!workspaces) return undefined;
		return workspaces.activeWorkspace?.slug ?? undefined;
	});

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
	// CRITICAL: Only create orgChart when sessionId AND workspaceId are available
	// Pattern matches meetings module (check all required params in outer condition)
	if (!orgChartAPI) {
		invariant(false, 'OrgChartModuleAPI not available in context');
	}
	const orgChart =
		browser && getSessionId() && getWorkspaceId()
			? orgChartAPI.useOrgChart({
					sessionId: getSessionId,
					workspaceId: getWorkspaceId
				})
			: null;

	const isLoading = $derived(!orgChart || orgChart.isLoading);
</script>

<div class="bg-base flex h-full flex-col">
	<!-- Header -->
	<header
		class="h-system-header border-base py-system-header bg-surface px-page flex flex-shrink-0 items-center justify-between border-b"
	>
		<div>
			<h1 class="text-button text-secondary font-normal">Org Chart</h1>
			<p class="text-label text-tertiary">{organizationName}</p>
		</div>
	</header>

	<!-- Content -->
	<main class="relative flex-1 overflow-hidden">
		{#if !browser}
			<div class="flex h-full items-center justify-center">
				<div class="text-secondary">Loading org chart...</div>
			</div>
		{:else if isLoading}
			<div class="flex h-full items-center justify-center">
				<div class="text-secondary">Loading org chart...</div>
			</div>
		{:else if orgChart}
			<div class="p-inbox-container h-full">
				<OrgChart
					{orgChart}
					workspaceId={workspaceId() as Id<'workspaces'> | undefined}
					workspaceSlug={workspaceSlug()}
				/>
			</div>
		{:else}
			<div class="flex h-full items-center justify-center">
				<div class="text-secondary">Loading org chart...</div>
			</div>
		{/if}
	</main>
</div>

<!-- Detail Panels - Client-only (require browser context, sessionId, and orgChart) -->
<!-- Selection state is now derived from the shared stacked navigation context -->
{#if browser && orgChart}
	<CircleDetailPanel {orgChart} />
	<RoleDetailPanel {orgChart} />
{/if}

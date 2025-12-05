<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { resolveRoute } from '$lib/utils/navigation';
	import OrgChart from '$lib/modules/org-chart/components/OrgChart.svelte';
	import CircleDetailPanel from '$lib/modules/org-chart/components/CircleDetailPanel.svelte';
	import RoleDetailPanel from '$lib/modules/org-chart/components/RoleDetailPanel.svelte';
	import EditCirclePanel from '$lib/modules/org-chart/components/EditCirclePanel.svelte';
	import EditRolePanel from '$lib/modules/org-chart/components/EditRolePanel.svelte';
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

	// Check if sessionId is available (prevents hydration errors)
	const hasSessionId = $derived(() => {
		if (!browser) return false;
		return !!getSessionId();
	});

	// Initialize org chart composable via API (enables loose coupling - see SYOS-314)
	// CRITICAL: Only create orgChart when sessionId is available to prevent hydration errors
	if (!orgChartAPI) {
		throw new Error('OrgChartModuleAPI not available in context');
	}
	const orgChart =
		browser && getSessionId()
			? orgChartAPI.useOrgChart({
					sessionId: getSessionId,
					workspaceId: getWorkspaceId
				})
			: null;

	const isLoading = $derived(!orgChart || orgChart.isLoading);
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
				onclick={() => {
					const slug = workspaceSlug();
					if (slug) {
						goto(resolveRoute(`/w/${slug}/circles`));
					} else {
						goto(resolveRoute('/inbox'));
					}
				}}
			>
				← Back to Circles
			</button>
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
				<OrgChart {orgChart} workspaceId={workspaceId()} workspaceSlug={workspaceSlug()} />
			</div>
		{:else}
			<div class="flex h-full items-center justify-center">
				<div class="text-secondary">Loading org chart...</div>
			</div>
		{/if}
	</main>
</div>

<!-- Detail Panels - Client-only (require browser context, sessionId, and orgChart) -->
{#if browser && orgChart}
	<CircleDetailPanel {orgChart} />
	<RoleDetailPanel {orgChart} />

	<!-- Edit Panels - Conditionally rendered based on navigation stack -->
	{@const currentLayer = orgChart.navigationStack.currentLayer}
	{#if currentLayer?.type === 'edit-circle'}
		<EditCirclePanel {orgChart} circleId={currentLayer.id as Id<'circles'>} />
	{/if}

	{#if currentLayer?.type === 'edit-role'}
		<EditRolePanel {orgChart} roleId={currentLayer.id as Id<'circleRoles'>} />
	{/if}
{/if}

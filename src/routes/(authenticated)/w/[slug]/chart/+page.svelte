<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { resolveRoute } from '$lib/utils/navigation';
	import { invariant } from '$lib/utils/invariant';
	import OrgChart from '$lib/modules/org-chart/components/OrgChart.svelte';
	import CircleDetailPanel from '$lib/modules/org-chart/components/CircleDetailPanel.svelte';
	import RoleDetailPanel from '$lib/modules/org-chart/components/RoleDetailPanel.svelte';
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

	// DEBUG: Log workspace loading state
	$effect(() => {
		if (browser) {
			console.log('📊 [CHART] Workspace state:', {
				sessionId: getSessionId(),
				workspaceId: getWorkspaceId(),
				workspaces: workspaces?.workspaces?.length ?? 0,
				activeWorkspaceId: workspaces?.activeWorkspaceId
			});
		}
	});

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

	// CRITICAL: Use $derived for navigation stack's currentLayer to ensure reactivity
	// Using {@const} in the template would not re-evaluate when the stack changes,
	// because the containing {#if} block's condition (browser && orgChart) doesn't change.
	// This caused edit panels to get stuck and not close properly.
	const currentLayer = $derived(orgChart?.navigationStack.currentLayer ?? null);
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
		<div class="flex items-center gap-2">
			<button
				class="py-nav-item text-button hover:bg-hover-solid rounded-button text-secondary hover:text-primary px-2"
				onclick={() => {
					const slug = workspaceSlug();
					if (slug) {
						goto(resolveRoute(`/w/${slug}/circles`));
					} else {
						goto(resolveRoute('/auth/redirect'));
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
{#if browser && orgChart}
	<CircleDetailPanel {orgChart} />
	<RoleDetailPanel {orgChart} />

	<!-- Edit Panels - Conditionally rendered based on navigation stack -->
	<!-- Note: currentLayer is defined as $derived in script for proper reactivity -->
	<!-- Note: EditCirclePanel removed - edit mode now handled directly in CircleDetailPanel -->
	{#if currentLayer?.type === 'edit-role'}
		<EditRolePanel {orgChart} roleId={currentLayer.id as Id<'circleRoles'>} />
	{/if}
{/if}

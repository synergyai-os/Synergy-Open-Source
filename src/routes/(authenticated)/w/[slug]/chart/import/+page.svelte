<!--
  Import Org Structure Route
  Provides UI for importing organizational structures via text markup
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { getContext } from 'svelte';
	import OrgStructureImporter from '$lib/modules/org-chart/components/import/OrgStructureImporter.svelte';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';
	import type { OrgChartModuleAPI } from '$lib/modules/org-chart/api';

	let { data: _data } = $props();

	// Get targetCircleId from query params
	// Use $page.url for SSR compatibility (url prop may be undefined during SSR)
	const targetCircleId = $derived(
		browser ? $page.url.searchParams.get('targetCircleId') || undefined : undefined
	);

	const workspaces = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	const orgChartAPI = getContext<OrgChartModuleAPI | undefined>('org-chart-api');

	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	const workspaceId = $derived(() => {
		if (!workspaces) return undefined;
		return workspaces.activeWorkspaceId ?? undefined;
	});
	const workspaceSlug = $derived(() => {
		if (!workspaces) return undefined;
		return workspaces.activeWorkspace?.slug ?? undefined;
	});

	const getSessionId = () => $page.data.sessionId;
	const getWorkspaceId = () => workspaceId();

	// Check if sessionId is available (prevents hydration errors)
	const hasSessionId = $derived(() => {
		if (!browser) return false;
		return !!getSessionId();
	});

	// Initialize org chart composable to get root circle
	invariant(orgChartAPI, 'OrgChartModuleAPI not available in context');
	const orgChart =
		browser && getSessionId()
			? orgChartAPI.useOrgChart({
					sessionId: getSessionId,
					workspaceId: getWorkspaceId
				})
			: null;

	// Find root circle (parentCircleId = null or undefined)
	const rootCircle = $derived.by(() => {
		if (!orgChart || !orgChart.circles) return null;
		const circles = orgChart.circles;
		return circles.find((c) => !c.parentCircleId) ?? null;
	});

	const isReady = $derived(
		browser && hasSessionId() && workspaceId() && workspaceSlug() && rootCircle
	);
</script>

<div class="bg-base flex h-full flex-col">
	<!-- Header -->
	<header
		class="h-system-header border-base py-system-header bg-surface px-page flex flex-shrink-0 items-center justify-between border-b"
	>
		<div>
			<h1 class="text-button text-secondary font-normal">Import Org Structure</h1>
			<p class="text-label text-tertiary">Create circles and roles from text markup</p>
		</div>
	</header>

	<!-- Content -->
	<main class="relative flex-1 overflow-hidden">
		{#if !browser}
			<div class="flex h-full items-center justify-center">
				<div class="text-secondary">Loading...</div>
			</div>
		{:else if !isReady}
			<div class="flex h-full items-center justify-center">
				<div class="text-secondary">Loading workspace...</div>
			</div>
		{:else if rootCircle && rootCircle.circleId}
			<div class="p-inbox-container h-full">
				<OrgStructureImporter
					workspaceId={workspaceId()}
					rootCircleId={rootCircle.circleId}
					workspaceSlug={workspaceSlug()}
					{targetCircleId}
				/>
			</div>
		{:else}
			<div class="flex h-full items-center justify-center">
				<div class="text-secondary">Loading circles...</div>
			</div>
		{/if}
	</main>
</div>

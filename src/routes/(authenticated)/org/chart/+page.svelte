<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { resolveRoute } from '$lib/utils/navigation';
	import { useOrgChart } from '$lib/composables/useOrgChart.svelte';
	import OrgChart from '$lib/components/org/OrgChart.svelte';
	import CircleDetailPanel from '$lib/components/org/CircleDetailPanel.svelte';
	import RoleDetailPanel from '$lib/components/org/RoleDetailPanel.svelte';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';

	let { data: _data } = $props();

	const organizations = getContext<UseOrganizations | undefined>('organizations');

	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	const organizationId = $derived(() => {
		if (!organizations) return undefined;
		return organizations.activeOrganizationId ?? undefined;
	});
	const organizationName = $derived(() => {
		if (!organizations) return 'Organization';
		return organizations.activeOrganization?.name ?? 'Organization';
	});

	const getSessionId = () => $page.data.sessionId;
	// CRITICAL: Call $derived function to get primitive value (not the function itself)
	const getOrganizationId = () => organizationId();

	// Redirect to onboarding if no org selected
	$effect(() => {
		if (browser && !organizationId()) {
			goto(resolveRoute('/org/onboarding'));
		}
	});

	// Initialize org chart composable
	const orgChart = useOrgChart({
		sessionId: getSessionId,
		organizationId: getOrganizationId
	});

	const isLoading = $derived(orgChart.isLoading);
</script>

<div class="flex h-full flex-col bg-base">
	<!-- Header -->
	<header
		class="flex h-system-header flex-shrink-0 items-center justify-between border-b border-base bg-surface px-inbox-container py-system-header"
	>
		<div>
			<h1 class="text-sm font-normal text-secondary">Org Chart</h1>
			<p class="text-xs text-tertiary">{organizationName}</p>
		</div>
		<div class="flex items-center gap-2">
			<button
				class="rounded-md px-nav-item py-nav-item text-sm text-secondary hover:bg-hover-solid hover:text-primary"
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
			<div class="h-full p-inbox-container">
				<OrgChart {orgChart} />
			</div>
		{/if}
	</main>
</div>

<!-- Detail Panels -->
<CircleDetailPanel {orgChart} />
<RoleDetailPanel {orgChart} />

<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { resolveRoute } from '$lib/utils/navigation';
	import { useCircles } from '$lib/composables/useCircles.svelte';
	import CreateCircleModal from '$lib/components/circles/CreateCircleModal.svelte';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';

	let { data: _data } = $props();

	const organizations = getContext<UseOrganizations | undefined>('organizations');
	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228 for full pattern documentation
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
	// Pattern: When passing $derived values to Convex queries, extract primitive first
	// See SYOS-228 for full pattern documentation
	const getOrganizationId = () => organizationId();

	// Redirect to onboarding if no org selected
	$effect(() => {
		if (browser && !organizationId()) {
			goto(resolveRoute('/org/onboarding'));
		}
	});

	// Initialize circles composable
	const circles = useCircles({
		sessionId: getSessionId,
		organizationId: getOrganizationId
	});

	const circlesList = $derived(circles.circles);
	const isLoading = $derived(!browser || circlesList === null);

	// Prepare circles for parent selector (exclude archived)
	const availableCircles = $derived(
		circlesList.filter((c) => !c.archivedAt).map((c) => ({ circleId: c.circleId, name: c.name }))
	);

	function handleRowClick(circleId: string) {
		const orgId = organizationId();
		if (!orgId) return;
		goto(resolveRoute(`/org/circles/${circleId}?org=${orgId}`));
	}
</script>

<div class="flex h-full flex-col bg-base">
	<!-- Header -->
	<header class="border-b border-base bg-surface px-inbox-container py-header">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-xl font-semibold text-primary">Circles</h1>
				<p class="mt-1 text-sm text-secondary">{organizationName}</p>
			</div>
			<button
				class="text-on-solid rounded-md bg-accent-primary px-nav-item py-nav-item text-sm font-medium hover:bg-accent-hover"
				onclick={() => circles.openModal('createCircle')}
			>
				Create Circle
			</button>
		</div>
	</header>

	<!-- Content -->
	<main class="flex-1 overflow-y-auto px-inbox-container py-inbox-container">
		{#if isLoading}
			<div class="flex h-64 items-center justify-center">
				<div class="text-secondary">Loading circles...</div>
			</div>
		{:else if circlesList.length === 0}
			<!-- Empty State -->
			<div class="flex h-64 flex-col items-center justify-center">
				<svg
					class="mb-4 h-12 w-12 text-secondary"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
				<h2 class="text-lg font-medium text-primary">No circles yet</h2>
				<p class="mt-1 text-sm text-secondary">Create your first circle to get started</p>
				<button
					class="text-on-solid mt-4 rounded-md bg-accent-primary px-nav-item py-nav-item text-sm font-medium hover:bg-accent-hover"
					onclick={() => circles.openModal('createCircle')}
				>
					Create Circle
				</button>
			</div>
		{:else}
			<!-- Circles Table -->
			<div class="overflow-hidden rounded-lg border border-base bg-surface">
				<table class="w-full">
					<thead class="border-b border-base bg-elevated">
						<tr>
							<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
								Name
							</th>
							<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
								Purpose
							</th>
							<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
								Parent
							</th>
							<th class="px-nav-item py-nav-item text-left text-sm font-medium text-secondary">
								Members
							</th>
						</tr>
					</thead>
					<tbody>
						{#each circlesList as circle (circle.circleId)}
							<tr
								class="cursor-pointer border-b border-base hover:bg-sidebar-hover"
								onclick={() => handleRowClick(circle.circleId)}
							>
								<td class="px-nav-item py-nav-item text-sm text-primary">
									{circle.name}
								</td>
								<td class="px-nav-item py-nav-item text-sm text-secondary">
									{circle.purpose ?? '—'}
								</td>
								<td class="px-nav-item py-nav-item text-sm text-secondary">
									{circle.parentName ?? '—'}
								</td>
								<td class="px-nav-item py-nav-item text-sm text-secondary">
									{circle.memberCount}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</main>
</div>

<!-- Create Circle Modal -->
<CreateCircleModal {circles} {availableCircles} />

<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { resolveRoute } from '$lib/utils/navigation';
	import { useCircles } from '$lib/modules/org-chart/composables/useCircles.svelte';
	import CircleMembersPanel from '$lib/modules/org-chart/components/circles/CircleMembersPanel.svelte';
	import CircleRolesPanel from '$lib/modules/org-chart/components/circles/CircleRolesPanel.svelte';
	import type { OrganizationsModuleAPI } from '$lib/modules/core/organizations/composables/useOrganizations.svelte';

	let { data: _data } = $props();

	const organizations = getContext<OrganizationsModuleAPI | undefined>('organizations');
	const circleId = $derived($page.params['id'] as string);
	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228 for full pattern documentation
	const organizationId = $derived(() => {
		if (!organizations) return undefined;
		return organizations.activeOrganizationId ?? undefined;
	});
	const getSessionId = () => $page.data.sessionId;
	// CRITICAL: Call $derived function to get primitive value (not the function itself)
	// Pattern: When passing $derived values to Convex queries, extract primitive first
	// See SYOS-228 for full pattern documentation
	const getOrganizationId = () => organizationId();
	const getCircleId = () => circleId;

	// Redirect to onboarding if no org selected
	$effect(() => {
		if (browser && !organizationId()) {
			goto(resolveRoute('/org/onboarding'));
		}
	});

	// Initialize circles composable
	const circles = useCircles({
		sessionId: getSessionId,
		organizationId: getOrganizationId,
		circleId: getCircleId
	});

	const circle = $derived(circles.circle);
	const members = $derived(circles.members);
	const roles = $derived(circles.roles);
	const isLoading = $derived(!browser || circle === null);

	// Editable circle info
	let editingName = $state(false);
	let editingPurpose = $state(false);
	let nameValue = $state('');
	let purposeValue = $state('');

	// Update local values when circle loads
	$effect(() => {
		if (circle) {
			nameValue = circle.name;
			purposeValue = circle.purpose ?? '';
		}
	});

	async function saveCircleName() {
		if (nameValue.trim() && nameValue !== circle?.name) {
			await circles.updateCircle({ circleId, name: nameValue.trim() });
		}
		editingName = false;
	}

	async function saveCirclePurpose() {
		if (purposeValue !== circle?.purpose) {
			await circles.updateCircle({ circleId, purpose: purposeValue || undefined });
		}
		editingPurpose = false;
	}
</script>

<div class="flex h-full flex-col bg-base">
	<!-- Header -->
	<header class="border-b border-base bg-surface px-inbox-container py-header">
		{#if isLoading}
			<div class="h-8 w-48 animate-pulse rounded-button bg-elevated"></div>
		{:else if circle}
			<div class="space-y-2">
				<!-- Circle Name (Editable) -->
				<div class="flex items-center gap-2">
					{#if editingName}
						<input
							type="text"
							bind:value={nameValue}
							onblur={saveCircleName}
							onkeydown={(e) => {
								if (e.key === 'Enter') saveCircleName();
								if (e.key === 'Escape') {
									editingName = false;
									nameValue = circle.name;
								}
							}}
							class="rounded-button border border-base bg-elevated px-input-x py-input-y text-h3 font-semibold text-primary focus:border-accent-primary focus:outline-none"
						/>
					{:else}
						<h1 class="text-h3 font-semibold text-primary">{circle.name}</h1>
						<button
							onclick={() => (editingName = true)}
							class="rounded-button text-secondary hover:bg-sidebar-hover hover:text-primary" style="padding: var(--spacing-2);"
							title="Edit name"
						>
							<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
								/>
							</svg>
						</button>
					{/if}
				</div>

				<!-- Circle Purpose (Editable) -->
				<div class="flex items-start gap-2">
					{#if editingPurpose}
						<textarea
							bind:value={purposeValue}
							onblur={saveCirclePurpose}
							onkeydown={(e) => {
								if (e.key === 'Escape') {
									editingPurpose = false;
									purposeValue = circle.purpose ?? '';
								}
							}}
							class="flex-1 rounded-button border border-base bg-elevated px-input-x py-input-y text-button text-secondary focus:border-accent-primary focus:outline-none"
							rows={2}
						></textarea>
					{:else}
						<p class="flex-1 text-button text-secondary">
							{circle.purpose || 'No purpose defined'}
						</p>
						<button
							onclick={() => (editingPurpose = true)}
							class="rounded-button text-secondary hover:bg-sidebar-hover hover:text-primary" style="padding: var(--spacing-2);"
							title="Edit purpose"
						>
							<svg class="size-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
								/>
							</svg>
						</button>
					{/if}
				</div>

				<!-- Meta Info -->
				<div class="flex items-center gap-4 text-button text-secondary">
					<span>{members.length} members</span>
					<span>{roles.length} roles</span>
					{#if circle.parentName}
						<span>Parent: {circle.parentName}</span>
					{/if}
				</div>
			</div>
		{/if}
	</header>

	<!-- Content -->
	<main class="flex flex-1 gap-form-section overflow-hidden px-inbox-container py-inbox-container">
		{#if isLoading}
			<div class="flex flex-1 items-center justify-center">
				<div class="text-secondary">Loading circle...</div>
			</div>
		{:else if circle}
			<!-- Members Panel (Left) -->
			<div class="w-1/2">
				<CircleMembersPanel {circles} {circleId} {members} />
			</div>

			<!-- Roles Panel (Right) -->
			<div class="w-1/2">
				<CircleRolesPanel {circles} {circleId} {roles} {members} />
			</div>
		{:else}
			<div class="flex flex-1 items-center justify-center">
				<div class="text-center">
					<p class="text-secondary">Circle not found</p>
					<button
						onclick={() => {
							const orgId = organizationId();
							if (orgId) {
								goto(resolveRoute(`/org/circles?org=${orgId}`));
							} else {
								goto(resolveRoute('/org/circles'));
							}
						}}
						class="text-on-solid mt-4 rounded-button bg-accent-primary px-2 py-nav-item text-button font-medium hover:bg-accent-hover"
					>
						Back to Circles
					</button>
				</div>
			</div>
		{/if}
	</main>
</div>

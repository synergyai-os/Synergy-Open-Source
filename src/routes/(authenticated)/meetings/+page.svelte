<script lang="ts">
	/**
	 * Meetings Page - List view with Today/Future sections
	 * Feature flag: meeting_module_beta
	 */

	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { useQuery } from 'convex-svelte';
	import { api, type Id } from '$lib/convex';
	import { useMeetings } from '$lib/composables/useMeetings.svelte';
	import MeetingCard from '$lib/components/meetings/MeetingCard.svelte';
	import TodayMeetingCard from '$lib/components/meetings/TodayMeetingCard.svelte';
	import CreateMeetingModal from '$lib/components/meetings/CreateMeetingModal.svelte';
	import { FeatureFlags } from '$lib/featureFlags';
	import { resolveRoute } from '$lib/utils/navigation';
	import type { OrganizationsModuleAPI } from '$lib/composables/useOrganizations.svelte';

	// Get sessionId from page data (provided by authenticated layout)
	const getSessionId = () => $page.data.sessionId;

	// Get organizations context (manages active organization)
	const organizationsContext = getContext<OrganizationsModuleAPI | undefined>('organizations');
	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228 for full pattern documentation
	const activeOrganization = $derived(() => {
		if (!organizationsContext) return null;
		return organizationsContext.activeOrganization ?? null;
	});
	const organizationId = $derived(() => {
		const org = activeOrganization();
		return org?.organizationId ?? undefined;
	});
	const hasOrganizations = $derived(() => {
		if (!organizationsContext) return false;
		return (organizationsContext.organizations ?? []).length > 0;
	});

	// Check feature flag (SYOS-226: organization-based targeting)
	const getOrganizationId = () => organizationId();
	const flagQuery =
		browser && getSessionId()
			? useQuery(api.featureFlags.checkFlag, () => {
					const session = getSessionId();
					if (!session) throw new Error('sessionId required');
					return {
						flag: FeatureFlags.MEETINGS_MODULE,
						sessionId: session
					};
				})
			: null;

	const featureEnabled = $derived(flagQuery?.data ?? false);

	// Fetch circles for create modal
	const circlesQuery =
		browser && getOrganizationId() && getSessionId()
			? useQuery(api.circles.list, () => {
					const orgId = getOrganizationId();
					const session = getSessionId();
					if (!orgId || !session) throw new Error('organizationId and sessionId required');
					return {
						organizationId: orgId as Id<'organizations'>,
						sessionId: session
					};
				})
			: null;

	const circles = $derived(
		(circlesQuery?.data ?? []).map((c) => ({ _id: c.circleId, name: c.name }))
	);

	// Fetch meetings
	const meetings = useMeetings({
		organizationId: () => organizationId(),
		sessionId: getSessionId
	});

	// Helper: Log sessionId and organizationId for manual template seeding
	$effect(() => {
		const orgId = organizationId();
		const session = getSessionId();
		if (orgId && session) {
			console.log('📋 Meeting Page Debug Info:');
			console.log('sessionId:', session);
			console.log('organizationId:', orgId);
			console.log('\n🌱 To seed default templates, run:');
			console.log(
				`npx convex run meetingTemplates:seedDefaultTemplates '{"sessionId": "${session}", "organizationId": "${orgId}"}'`
			);
		}
	});

	// Modal state
	const state = $state({
		showCreateModal: false,
		groupBy: 'none' as 'none' | 'circle' | 'date',
		activeTab: 'my-meetings' as 'my-meetings' | 'reports'
	});

	// Navigate to meeting session
	function handleStart(meetingId: string) {
		goto(resolveRoute(`/meetings/${meetingId}`));
	}

	function handleAddAgendaItem(meetingId: string) {
		console.log('Add agenda item:', meetingId);
		// TODO: Open add agenda item modal
	}
</script>

<svelte:head>
	<title>Meetings - SynergyOS</title>
</svelte:head>

{#if !featureEnabled && !flagQuery?.isLoading}
	<!-- Feature not enabled -->
	<div class="bg-surface-base flex min-h-screen items-center justify-center">
		<div class="text-center">
			<h1 class="text-2xl font-semibold text-text-primary">Meetings Module</h1>
			<p class="mt-2 text-text-secondary">
				This feature is not yet available. Contact your administrator for access.
			</p>
		</div>
	</div>
{:else if flagQuery?.isLoading}
	<!-- Loading -->
	<div class="bg-surface-base flex min-h-screen items-center justify-center">
		<div class="text-text-secondary">Loading...</div>
	</div>
{:else if !organizationId()}
	<!-- No organization selected -->
	<div class="bg-surface-base flex min-h-screen items-center justify-center">
		<div
			class="bg-surface-base w-full max-w-md rounded-lg border border-border-base p-6 text-center shadow-lg"
		>
			<h1 class="text-xl font-semibold text-text-primary">Organization Required</h1>

			{#if hasOrganizations()}
				<!-- User has orgs but none selected -->
				<p class="mt-2 text-sm text-text-secondary">
					Please select an organization to access Meetings.
				</p>

				<div class="mt-6 space-y-2">
					{#each organizationsContext?.organizations ?? [] as org (org.organizationId)}
						<button
							onclick={() => organizationsContext?.setActiveOrganization(org.organizationId)}
							class="hover:bg-surface-hover bg-surface-secondary w-full rounded-md border border-border-base px-4 py-3 text-left text-sm text-text-primary transition-colors"
						>
							{org.name}
						</button>
					{/each}
				</div>
			{:else}
				<!-- No orgs, need to create one -->
				<p class="mt-2 text-sm text-text-secondary">
					Meetings require an organization. Create one to get started.
				</p>

				<button
					onclick={() => organizationsContext?.openModal('createOrganization')}
					class="mt-6 rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
				>
					Create Organization
				</button>
			{/if}
		</div>
	</div>
{:else}
	<!-- Meetings Page -->
	<div class="bg-surface-base h-full overflow-y-auto">
		<!-- Header -->
		<div class="border-border-subtle bg-surface-base border-b">
			<div class="mx-auto max-w-6xl px-6 py-6">
				<div class="flex items-center gap-4">
					<!-- Icon -->
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary">
						<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<div class="flex-1">
						<h1 class="text-2xl font-semibold text-text-primary">Meetings</h1>
						<p class="mt-1 text-sm text-text-secondary">
							Collaborate on meeting agendas, take notes in real-time, and end every team meeting
							with an action plan and decisions.
						</p>
					</div>
				</div>
			</div>

			<!-- Tabs -->
			<div class="mx-auto max-w-6xl px-6">
				<div class="flex border-b border-border-base">
					<button
						onclick={() => (state.activeTab = 'my-meetings')}
						class="border-b-2 px-4 py-3 text-sm font-medium transition-colors {state.activeTab ===
						'my-meetings'
							? 'border-accent-primary text-accent-primary'
							: 'border-transparent text-text-secondary hover:text-text-primary'}"
					>
						My meetings
					</button>
					<button
						onclick={() => (state.activeTab = 'reports')}
						class="border-b-2 px-4 py-3 text-sm font-medium transition-colors {state.activeTab ===
						'reports'
							? 'border-accent-primary text-accent-primary'
							: 'border-transparent text-text-secondary hover:text-text-primary'}"
					>
						Reports
					</button>
				</div>
			</div>
		</div>

		<!-- Top Bar -->
		<div class="border-border-subtle bg-surface-base border-b">
			<div class="mx-auto max-w-6xl px-6 py-4">
				<div class="flex items-center justify-end">
					<div class="flex items-center gap-3">
						<!-- Group By (optional - can be implemented later) -->
						<!-- <div class="flex items-center gap-2">
							<span class="text-text-secondary text-sm">Group by:</span>
							<select
								bind:value={state.groupBy}
								class="border-border-base bg-surface-base text-text-primary text-sm border rounded-md px-3 py-1.5 focus:border-accent-orange focus:outline-none"
							>
								<option value="none">None</option>
								<option value="circle">Circle</option>
								<option value="date">Date</option>
							</select>
						</div> -->

						<!-- Synchronize Calendar (Phase 3) -->
						<!-- <button
							class="border-border-base text-text-secondary hover:bg-surface-hover flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm transition-colors"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							Synchronize calendar
						</button> -->

						<!-- Add Meeting Button -->
						<button
							onclick={() => (state.showCreateModal = true)}
							class="flex items-center gap-2 rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
						>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4v16m8-8H4"
								/>
							</svg>
							Add meeting
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Meeting List -->
		<div class="mx-auto max-w-6xl px-6 py-6">
			{#if meetings.isLoading}
				<div class="py-12 text-center text-text-secondary">Loading meetings...</div>
			{:else if meetings.error}
				<div class="py-12 text-center text-red-600">
					Error loading meetings: {meetings.error.message}
				</div>
			{:else if state.activeTab === 'my-meetings'}
				<!-- My Meetings Tab -->
				<!-- Today Section -->
				<div class="mb-8">
					<div class="mb-4 flex items-center gap-2">
						<h2 class="text-lg font-semibold text-text-primary">Today</h2>
						<svg class="h-5 w-5 text-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>

					{#if meetings.todayMeetings.length === 0}
						<div
							class="bg-surface-secondary rounded-lg border border-dashed border-border-base py-8 text-center text-text-tertiary"
						>
							No meetings scheduled for today
						</div>
					{:else}
						<div class="space-y-4">
							{#each meetings.todayMeetings as meeting (meeting._id)}
								<TodayMeetingCard
									{meeting}
									onStart={() => handleStart(meeting.originalMeetingId ?? meeting._id)}
									onAddAgendaItem={() =>
										handleAddAgendaItem(meeting.originalMeetingId ?? meeting._id)}
								/>
							{/each}
						</div>
					{/if}
				</div>

				<!-- This Week Section -->
				<div class="mb-8">
					<h2 class="mb-4 text-lg font-semibold text-text-primary">This week</h2>

					{#if meetings.thisWeekMeetings.length === 0}
						<div
							class="bg-surface-secondary rounded-lg border border-dashed border-border-base py-8 text-center text-text-tertiary"
						>
							No meetings scheduled this week
						</div>
					{:else}
						<div
							class="divide-border-subtle bg-surface-base divide-y rounded-lg border border-border-base"
						>
							{#each meetings.thisWeekMeetings as meeting (meeting._id)}
								<MeetingCard
									{meeting}
									organizationName={activeOrganization()?.name}
									onStart={() => handleStart(meeting.originalMeetingId ?? meeting._id)}
									onAddAgendaItem={() =>
										handleAddAgendaItem(meeting.originalMeetingId ?? meeting._id)}
								/>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Future Section -->
				<div>
					<h2 class="mb-4 text-lg font-semibold text-text-primary">Future</h2>

					{#if meetings.futureMeetings.length === 0}
						<div
							class="bg-surface-secondary rounded-lg border border-dashed border-border-base py-8 text-center text-text-tertiary"
						>
							No upcoming meetings scheduled
						</div>
					{:else}
						<div
							class="divide-border-subtle bg-surface-base divide-y rounded-lg border border-border-base"
						>
							{#each meetings.futureMeetings as meeting (meeting._id)}
								<MeetingCard
									{meeting}
									organizationName={activeOrganization()?.name}
									onStart={() => handleStart(meeting.originalMeetingId ?? meeting._id)}
									onAddAgendaItem={() =>
										handleAddAgendaItem(meeting.originalMeetingId ?? meeting._id)}
								/>
							{/each}
						</div>
					{/if}
				</div>
			{:else if state.activeTab === 'reports'}
				<!-- Reports Tab -->
				<div>
					<h2 class="mb-4 text-lg font-semibold text-text-primary">Closed meetings</h2>

					{#if meetings.closedMeetings.length === 0}
						<div
							class="bg-surface-secondary rounded-lg border border-dashed border-border-base py-12 text-center text-text-tertiary"
						>
							<svg
								class="mx-auto h-12 w-12 text-text-tertiary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<p class="mt-4">No closed meetings yet</p>
							<p class="mt-1 text-sm">Closed meetings will appear here</p>
						</div>
					{:else}
						<div
							class="divide-border-subtle bg-surface-base divide-y rounded-lg border border-border-base"
						>
							{#each meetings.closedMeetings as meeting (meeting._id)}
								<MeetingCard
									{meeting}
									organizationName={activeOrganization()?.name}
									onStart={() => handleStart(meeting.originalMeetingId ?? meeting._id)}
									onAddAgendaItem={() =>
										handleAddAgendaItem(meeting.originalMeetingId ?? meeting._id)}
								/>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Create Meeting Modal -->
	{#if organizationId() && getSessionId()}
		<CreateMeetingModal
			bind:open={state.showCreateModal}
			onClose={() => (state.showCreateModal = false)}
			organizationId={organizationId()!}
			sessionId={getSessionId()!}
			{circles}
		/>
	{/if}
{/if}

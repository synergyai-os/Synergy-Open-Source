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
	import { useMeetings } from '$lib/modules/meetings/composables/useMeetings.svelte';
	import MeetingCard from '$lib/modules/meetings/components/MeetingCard.svelte';
	import TodayMeetingCard from '$lib/modules/meetings/components/TodayMeetingCard.svelte';
	import CreateMeetingModal from '$lib/modules/meetings/components/CreateMeetingModal.svelte';
	import { Button, Tabs } from '$lib/components/ui';
	import { FeatureFlags } from '$lib/infrastructure/feature-flags';
	import { resolveRoute } from '$lib/utils/navigation';
	import type { OrganizationsModuleAPI } from '$lib/modules/core/organizations/composables/useOrganizations.svelte';

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

	// Helper: Log sessionId and organizationId for manual template seeding (dev only)
	$effect(() => {
		if (!import.meta.env.DEV) return;
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
	<div class="flex min-h-screen items-center justify-center bg-surface">
		<div class="text-center">
			<h1 class="text-h1 font-semibold text-text-primary">Meetings Module</h1>
			<p class="mt-spacing-text-gap text-text-secondary">
				This feature is not yet available. Contact your administrator for access.
			</p>
		</div>
	</div>
{:else if flagQuery?.isLoading}
	<!-- Loading -->
	<div class="flex min-h-screen items-center justify-center bg-surface">
		<div class="text-text-secondary">Loading...</div>
	</div>
{:else if !organizationId()}
	<!-- No organization selected -->
	<div class="flex min-h-screen items-center justify-center bg-surface">
		<div
			class="w-full max-w-dialog-default rounded-card border border-border-base bg-surface p-modal-padding text-center shadow-card"
		>
			<h1 class="text-h2 font-semibold text-text-primary">Organization Required</h1>

			{#if hasOrganizations()}
				<!-- User has orgs but none selected -->
				<p class="mt-spacing-text-gap text-body-sm text-text-secondary">
					Please select an organization to access Meetings.
				</p>

				<div class="space-y-meeting-card gap-settings-section">
					{#each organizationsContext?.organizations ?? [] as org (org.organizationId)}
						<Button
							variant="secondary"
							onclick={() => organizationsContext?.setActiveOrganization(org.organizationId)}
							class="w-full text-left"
						>
							{org.name}
						</Button>
					{/each}
				</div>
			{:else}
				<!-- No orgs, need to create one -->
				<p class="mt-spacing-text-gap text-body-sm text-text-secondary">
					Meetings require an organization. Create one to get started.
				</p>

				<Button
					variant="primary"
					onclick={() => organizationsContext?.openModal('createOrganization')}
					class="mt-settings-section"
				>
					Create Organization
				</Button>
			{/if}
		</div>
	</div>
{:else}
	<!-- Meetings Page -->
	<Tabs.Root bind:value={state.activeTab}>
		<div class="h-full overflow-y-auto bg-surface">
			<!-- Header -->
			<div class="border-b border-border-base bg-surface">
				<div class="mx-auto max-w-container px-container py-container">
					<div class="flex items-center gap-form-section">
						<!-- Icon -->
						<div
							class="flex size-icon-xl items-center justify-center rounded-avatar bg-accent-primary"
						>
							<svg
								class="icon-lg text-primary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<div class="flex-1">
							<h1 class="text-h1 text-text-primary">Meetings</h1>
							<p class="mt-spacing-icon-gap-sm text-body-sm text-text-secondary">
								Collaborate on meeting agendas, take notes in real-time, and end every team meeting
								with an action plan and decisions.
							</p>
						</div>
					</div>
				</div>

				<!-- Tabs -->
				<div class="mx-auto max-w-container px-container">
					<Tabs.List class="flex size-tab rounded-tab-container border-b border-border-base">
						<Tabs.Trigger
							value="my-meetings"
							class="border-b-2 border-transparent px-form-section py-header text-button font-medium text-text-secondary transition-colors hover:text-text-primary data-[state=active]:border-accent-primary data-[state=active]:text-accent-primary"
						>
							My meetings
						</Tabs.Trigger>
						<Tabs.Trigger
							value="reports"
							class="border-b-2 border-transparent px-form-section py-header text-button font-medium text-text-secondary transition-colors hover:text-text-primary data-[state=active]:border-accent-primary data-[state=active]:text-accent-primary"
						>
							Reports
						</Tabs.Trigger>
					</Tabs.List>
				</div>
			</div>

			<!-- Top Bar -->
			<div class="border-b border-border-base bg-surface">
				<div class="mx-auto max-w-container px-container py-form-section">
					<div class="flex items-center justify-end">
						<div class="gap-header flex items-center">
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
							<Button variant="primary" onclick={() => (state.showCreateModal = true)}>
								<svg class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4v16m8-8H4"
									/>
								</svg>
								Add meeting
							</Button>
						</div>
					</div>
				</div>
			</div>

			<!-- Meeting List -->
			<div class="mx-auto max-w-container px-container py-container">
				{#if meetings.isLoading}
					<div class="py-section-spacing-medium text-center text-text-secondary">
						Loading meetings...
					</div>
				{:else if meetings.error}
					<div class="py-section-spacing-medium text-center text-error-text">
						Error loading meetings: {meetings.error.message}
					</div>
				{:else}
					<!-- My Meetings Tab -->
					<Tabs.Content value="my-meetings">
						<!-- Today Section -->
						<div class="mb-meeting-section">
							<div class="mb-form-section flex items-center gap-meeting-card">
								<h2 class="text-h2 text-text-primary">Today</h2>
								<svg class="icon-md text-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>

							{#if meetings.todayMeetings.length === 0}
								<div
									class="rounded-card border border-dashed border-border-base bg-surface py-meeting-section text-center text-text-tertiary"
								>
									No meetings scheduled for today
								</div>
							{:else}
								<div class="space-y-form-section">
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
						<div class="mb-meeting-section">
							<h2 class="mb-form-section text-h2 text-text-primary">This week</h2>

							{#if meetings.thisWeekMeetings.length === 0}
								<div
									class="rounded-card border border-dashed border-border-base bg-surface py-meeting-section text-center text-text-tertiary"
								>
									No meetings scheduled this week
								</div>
							{:else}
								<div
									class="divide-y divide-border-base rounded-card border border-border-base bg-surface"
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
							<h2 class="mb-form-section text-h2 text-text-primary">Future</h2>

							{#if meetings.futureMeetings.length === 0}
								<div
									class="rounded-card border border-dashed border-border-base bg-surface py-meeting-section text-center text-text-tertiary"
								>
									No upcoming meetings scheduled
								</div>
							{:else}
								<div
									class="divide-y divide-border-base rounded-card border border-border-base bg-surface"
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
					</Tabs.Content>

					<!-- Reports Tab -->
					<Tabs.Content value="reports">
						<div>
							<h2 class="mb-form-section text-h2 text-text-primary">Closed meetings</h2>

							{#if meetings.closedMeetings.length === 0}
								<div
									class="rounded-card border border-dashed border-border-base bg-surface py-meeting-section text-center text-text-tertiary"
								>
									<svg
										class="mx-auto size-icon-xl text-text-tertiary"
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
									<p class="mt-form-section">No closed meetings yet</p>
									<p class="text-body-sm mt-meeting-avatar-gap">Closed meetings will appear here</p>
								</div>
							{:else}
								<div
									class="divide-y divide-border-base rounded-card border border-border-base bg-surface"
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
					</Tabs.Content>
				{/if}
			</div>
		</div>
	</Tabs.Root>

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

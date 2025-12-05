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
	import { Button, Icon, Heading, Text } from '$lib/components/atoms';
	import { PageHeader } from '$lib/components/molecules';
	import * as ScrollArea from '$lib/components/atoms/ScrollArea.svelte';
	import {
		scrollAreaRootRecipe,
		scrollAreaViewportRecipe,
		scrollAreaScrollbarRecipe,
		scrollAreaThumbRecipe
	} from '$lib/design-system/recipes';
	import { FeatureFlags } from '$lib/infrastructure/feature-flags';
	import { resolveRoute } from '$lib/utils/navigation';
	import type { WorkspacesModuleAPI } from '$lib/infrastructure/workspaces/composables/useWorkspaces.svelte';

	// Get sessionId from page data (provided by authenticated layout)
	const getSessionId = () => $page.data.sessionId;

	// Get workspaces context (manages active workspace)
	const organizationsContext = getContext<WorkspacesModuleAPI | undefined>('workspaces');
	// CRITICAL: Access getters directly (not via optional chaining) to ensure reactivity tracking
	// Pattern: Check object existence first, then access getter property directly
	// See SYOS-228 for full pattern documentation
	const activeWorkspace = $derived(() => {
		if (!organizationsContext) return null;
		return organizationsContext.activeWorkspace ?? null;
	});
	const workspaceId = $derived(() => {
		const org = activeWorkspace();
		return org?.workspaceId ?? undefined;
	});
	const workspaceSlug = $derived(() => {
		const org = activeWorkspace();
		return org?.slug ?? undefined;
	});

	// Check feature flag (SYOS-226: workspace-based targeting)
	const getWorkspaceId = () => workspaceId();
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
		browser && getWorkspaceId() && getSessionId()
			? useQuery(api.circles.list, () => {
					const orgId = getWorkspaceId();
					const session = getSessionId();
					if (!orgId || !session) throw new Error('workspaceId and sessionId required');
					return {
						workspaceId: orgId as Id<'workspaces'>,
						sessionId: session
					};
				})
			: null;

	const circles = $derived(
		(circlesQuery?.data ?? []).map((c) => ({ _id: c.circleId, name: c.name }))
	);

	// Fetch meeting templates for template name lookup
	const templatesQuery =
		browser && getWorkspaceId() && getSessionId()
			? useQuery(api.meetingTemplates.list, () => {
					const orgId = getWorkspaceId();
					const session = getSessionId();
					if (!orgId || !session) throw new Error('workspaceId and sessionId required');
					return {
						workspaceId: orgId as Id<'workspaces'>,
						sessionId: session
					};
				})
			: null;

	// Create templateId -> templateName map
	const templateNameMap = $derived(() => {
		const templates = templatesQuery?.data ?? [];
		const map = new Map<string, string>();
		for (const template of templates) {
			map.set(template._id, template.name);
		}
		return map;
	});

	// Fetch meetings
	const meetings = useMeetings({
		workspaceId: () => workspaceId(),
		sessionId: getSessionId
	});

	// Helper: Log sessionId and workspaceId for manual template seeding (dev only)
	$effect(() => {
		if (!import.meta.env.DEV) return;
		const orgId = workspaceId();
		const session = getSessionId();
		if (orgId && session) {
			console.log('📋 Meeting Page Debug Info:');
			console.log('sessionId:', session);
			console.log('workspaceId:', orgId);
			console.log('\n🌱 To seed default templates, run:');
			console.log(
				`npx convex run meetingTemplates:seedDefaultTemplates '{"sessionId": "${session}", "workspaceId": "${orgId}"}'`
			);
		}
	});

	// Modal state
	const state = $state({
		showCreateModal: false,
		activeTab: 'my-meetings' as 'my-meetings' | 'reports'
	});

	// Helper: Get real meeting ID (not synthetic)
	// For recurring meetings, synthetic IDs are like `${realId}_${timestamp}`
	// We need the real Convex ID to query the database
	function getRealMeetingId(meeting: {
		_id: string | Id<'meetings'>;
		originalMeetingId?: Id<'meetings'>;
	}): string {
		// Always prefer originalMeetingId if available (for recurring instances)
		if (meeting.originalMeetingId) {
			return meeting.originalMeetingId;
		}
		// For non-recurring meetings, _id is the real ID
		// For recurring instances, _id might be synthetic, so check format
		const id = meeting._id.toString();
		// Synthetic IDs have format: `${realId}_${timestamp}` (underscore separator)
		// Real Convex IDs are just alphanumeric strings
		if (id.includes('_') && id.split('_').length === 2) {
			// Likely a synthetic ID - extract the real ID part
			return id.split('_')[0];
		}
		return id;
	}

	// Navigate to meeting session
	// Always use real meeting ID (not synthetic IDs for recurring instances)
	function handleStart(meeting: {
		_id: string | Id<'meetings'>;
		originalMeetingId?: Id<'meetings'>;
	}) {
		const realId = getRealMeetingId(meeting);
		// Use page params slug (most reliable) or fallback to workspace context
		const slug = $page.params.slug || workspaceSlug();
		if (!slug) {
			console.error('Cannot navigate to meeting: workspace slug not available');
			return;
		}
		goto(resolveRoute(`/w/${slug}/meetings/${realId}`));
	}

	// Navigate to meeting report (for closed meetings)
	function handleShowReport(meeting: {
		_id: string | Id<'meetings'>;
		originalMeetingId?: Id<'meetings'>;
	}) {
		const realId = getRealMeetingId(meeting);
		// Use page params slug (most reliable) or fallback to workspace context
		const slug = $page.params.slug || workspaceSlug();
		if (!slug) {
			console.error('Cannot navigate to meeting: workspace slug not available');
			return;
		}
		goto(resolveRoute(`/w/${slug}/meetings/${realId}`));
	}

	function handleAddAgendaItem(meeting: {
		_id: string | Id<'meetings'>;
		originalMeetingId?: Id<'meetings'>;
	}) {
		const realId = getRealMeetingId(meeting);
		console.log('Add agenda item:', realId);
		// TODO: Open add agenda item modal
	}
</script>

<!-- Title is set by workspace layout -->

{#if !featureEnabled && !flagQuery?.isLoading}
	<!-- Feature not enabled -->
	<div class="flex min-h-screen items-center justify-center bg-surface">
		<div class="text-center">
			<Heading level="h1" size="h1" class="font-semibold">Meetings Module</Heading>
			<Text variant="body" color="secondary" class="mt-text-gap">
				This feature is not yet available. Contact your administrator for access.
			</Text>
		</div>
	</div>
{:else if flagQuery?.isLoading}
	<!-- Loading -->
	<div class="flex min-h-screen items-center justify-center bg-surface">
		<Text variant="body" color="secondary">Loading...</Text>
	</div>
{:else}
	<!-- Meetings Page -->
	<ScrollArea.Root type="auto" scrollHideDelay={400} class={[scrollAreaRootRecipe(), 'h-full']}>
		<ScrollArea.Viewport class={[scrollAreaViewportRecipe(), 'h-full', 'w-full']}>
			<div>
				<!-- Page Header -->
				<PageHeader>
					{#snippet titleSlot()}
						<div class="flex items-center gap-header">
							<!-- Group 1: Title -->
							<Text variant="label" size="sm" color="secondary" weight="normal">Meetings</Text>

							<!-- Group 2: Divider -->
							<div class="w-px shrink-0 self-stretch bg-[var(--color-border-default)]"></div>

							<!-- Group 3: Buttons -->
							<div class="flex items-center gap-button">
								<Button
									variant={state.activeTab === 'my-meetings' ? 'primary' : 'ghost'}
									size="sm"
									onclick={() => (state.activeTab = 'my-meetings')}
								>
									My Meetings
								</Button>
								<Button
									variant={state.activeTab === 'reports' ? 'primary' : 'ghost'}
									size="sm"
									onclick={() => (state.activeTab = 'reports')}
								>
									Reports
								</Button>
							</div>
						</div>
					{/snippet}

					{#snippet right()}
						<Button variant="outline" size="sm" onclick={() => (state.showCreateModal = true)}>
							<div class="flex items-center gap-button">
								<Icon type="add" size="sm" />
								<span>Add meeting</span>
							</div>
						</Button>
					{/snippet}
				</PageHeader>

				<!-- Meeting List -->
				<div class="max-w-container mx-auto px-page py-page">
					{#if meetings.isLoading}
						<div class="py-content-section text-center">
							<Text variant="body" color="secondary">Loading meetings...</Text>
						</div>
					{:else if meetings.error}
						<div class="py-content-section text-center">
							<Text variant="body" color="error"
								>Error loading meetings: {meetings.error.message}</Text
							>
						</div>
					{:else if state.activeTab === 'my-meetings'}
						<!-- My Meetings Tab -->
						<!-- Today Section -->
						<div class="mb-section">
							<div class="flex items-center gap-fieldGroup mb-header">
								<Heading level={5} color="secondary">Today</Heading>
								<Icon type="info" size="md" color="tertiary" />
							</div>

							{#if meetings.todayMeetings.length === 0}
								<div
									class="border-border-base rounded-card border border-dashed bg-surface text-center"
									style="padding-block: var(--spacing-8);"
								>
									<Text variant="body" color="tertiary">No meetings scheduled for today</Text>
								</div>
							{:else}
								<!-- Horizontal scroll container on desktop, vertical on mobile -->
								<div
									class="md:pb-section flex flex-col gap-section md:flex-row md:gap-section md:overflow-x-auto"
									style="scrollbar-width: thin;"
								>
									{#each meetings.todayMeetings as meeting (meeting._id)}
										<div class="flex-shrink-0">
											<TodayMeetingCard
												{meeting}
												templateName={meeting.templateId
													? templateNameMap().get(meeting.templateId)
													: undefined}
												attendeeAvatars={meeting.invitedUsers?.map((user) => ({
													name: user.name,
													color: '' // Not used - card uses variant="brand"
												})) ?? []}
												onStart={() => handleStart(meeting)}
												onAddAgendaItem={() => handleAddAgendaItem(meeting)}
											/>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<!-- This Week Section -->
						<div class="mb-section">
							<Heading level={5} color="secondary" class="mb-header">This week</Heading>

							{#if meetings.thisWeekMeetings.length === 0}
								<div
									class="border-border-base rounded-card border border-dashed bg-surface text-center"
									style="padding-block: var(--spacing-8);"
								>
									<Text variant="body" color="tertiary">No meetings scheduled this week</Text>
								</div>
							{:else}
								<div
									class="divide-border-base border-border-base divide-y rounded-card border bg-surface"
								>
									{#each meetings.thisWeekMeetings as meeting (meeting._id)}
										<MeetingCard
											{meeting}
											templateName={meeting.templateId
												? templateNameMap().get(meeting.templateId)
												: undefined}
											organizationName={activeWorkspace()?.name}
											onStart={() => handleStart(meeting)}
											onAddAgendaItem={() => handleAddAgendaItem(meeting)}
										/>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Future Section -->
						<div>
							<Heading level={5} color="secondary" class="mb-header">Future</Heading>

							{#if meetings.futureMeetings.length === 0}
								<div
									class="border-border-base rounded-card border border-dashed bg-surface text-center"
									style="padding-block: var(--spacing-8);"
								>
									<Text variant="body" color="tertiary">No upcoming meetings scheduled</Text>
								</div>
							{:else}
								<div
									class="divide-border-base border-border-base divide-y rounded-card border bg-surface"
								>
									{#each meetings.futureMeetings as meeting (meeting._id)}
										<MeetingCard
											{meeting}
											templateName={meeting.templateId
												? templateNameMap().get(meeting.templateId)
												: undefined}
											organizationName={activeWorkspace()?.name}
											onStart={() => handleStart(meeting)}
											onAddAgendaItem={() => handleAddAgendaItem(meeting)}
										/>
									{/each}
								</div>
							{/if}
						</div>
					{:else if state.activeTab === 'reports'}
						<!-- Reports Tab -->
						<div>
							<Heading level={5} color="secondary" class="mb-header">Closed meetings</Heading>

							{#if meetings.closedMeetings.length === 0}
								<div
									class="border-border-base text-text-tertiary rounded-card border border-dashed bg-surface text-center"
									style="padding-block: var(--spacing-8);"
								>
									<div class="mx-auto">
										<Icon type="document" size="xl" color="tertiary" />
									</div>
									<Text variant="body" color="tertiary" class="mt-form-section"
										>No closed meetings yet</Text
									>
									<Text variant="body" size="sm" color="tertiary" class="mt-fieldGroup"
										>Closed meetings will appear here</Text
									>
								</div>
							{:else}
								<div
									class="divide-border-base border-border-base divide-y rounded-card border bg-surface"
								>
									{#each meetings.closedMeetings as meeting (meeting._id)}
										<MeetingCard
											{meeting}
											templateName={meeting.templateId
												? templateNameMap().get(meeting.templateId)
												: undefined}
											organizationName={activeWorkspace()?.name}
											onShowReport={() => handleShowReport(meeting)}
										/>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</ScrollArea.Viewport>
		<!-- Scrollbar styling with design tokens -->
		<ScrollArea.Scrollbar
			orientation="vertical"
			class={scrollAreaScrollbarRecipe({ orientation: 'vertical' })}
			style="width: 0.5rem;"
		>
			<ScrollArea.Thumb class={scrollAreaThumbRecipe()} style="opacity: var(--opacity-50);" />
		</ScrollArea.Scrollbar>
	</ScrollArea.Root>

	<!-- Create Meeting Modal -->
	{#if workspaceId() && getSessionId()}
		<CreateMeetingModal
			bind:open={state.showCreateModal}
			onClose={() => (state.showCreateModal = false)}
			workspaceId={workspaceId()!}
			sessionId={getSessionId()!}
			{circles}
		/>
	{/if}
{/if}

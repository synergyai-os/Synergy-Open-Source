<script lang="ts">
	/**
	 * Meeting Session Page - Real-time collaborative meeting
	 * Features:
	 * - Real-time updates (meeting state, agenda items)
	 * - Step navigation (Check-in, Agenda, Closing)
	 * - Timer (elapsed time)
	 * - Secretary controls (start, advance, close)
	 */

	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { useMeetingSession } from '$lib/modules/meetings/composables/useMeetingSession.svelte';
	import { useMeetingPresence } from '$lib/modules/meetings/composables/useMeetingPresence.svelte';
	import { api, type Id } from '$lib/convex';
	import { toast } from 'svelte-sonner';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { browser } from '$app/environment';
	import AgendaItemView from '$lib/modules/meetings/components/AgendaItemView.svelte';
	import ImportProposalButton from '$lib/modules/org-chart/components/proposals/ImportProposalButton.svelte';
	import { Icon, Heading, Text, Button } from '$lib/components/atoms';
	import { invariant } from '$lib/utils/invariant';

	interface Props {
		data: {
			sessionId: string;
			enabledFeatures: string[];
		};
	}

	const { data }: Props = $props();

	// Check feature flag
	const meetingsEnabled = data.enabledFeatures.includes('meetings');

	// Get meetingId from URL params
	const meetingId = () => page.params.id as Id<'meetings'> | undefined;
	const sessionId = () => data.sessionId;

	// Real-time meeting session
	const session = useMeetingSession({
		meetingId,
		sessionId
	});

	// Query template to check if it's a governance meeting
	// Wrap in $derived to make query creation reactive
	const templateQuery = $derived(
		browser && session.meeting?.templateId && sessionId()
			? useQuery(api.modules.meetings.templates.get, () => {
					const meeting = session.meeting;
					const sid = sessionId();
					invariant(meeting?.templateId && sid, 'Meeting templateId and sessionId required');
					return {
						sessionId: sid,
						templateId: meeting.templateId
					};
				})
			: null
	);

	const isGovernanceMeeting = $derived(templateQuery?.data?.name === 'Governance' || false);
	const hasCircleId = $derived(!!session.meeting?.circleId);
	const shouldShowImportButton = $derived(hasCircleId || isGovernanceMeeting);

	// Debug log (dev only)
	$effect(() => {
		if (import.meta.env.DEV && session.meeting) {
			console.log('🔍 Meeting Debug:', {
				meetingId: session.meeting._id,
				circleId: session.meeting.circleId,
				templateId: session.meeting.templateId,
				templateName: templateQuery?.data?.name,
				isGovernanceMeeting,
				hasCircleId,
				shouldShowImportButton
			});
		}
	});

	// Real-time presence tracking (SYOS-227)
	const presence = useMeetingPresence({
		meetingId,
		sessionId
	});

	// Start recordHeartbeat on mount, stop on unmount (browser-safe pattern)
	// Use untrack() to prevent infinite effect loops (SYOS-227)
	$effect(() => {
		if (!browser) return;

		// Call recordHeartbeat functions without tracking their internal reactive dependencies
		untrack(() => {
			presence.startHeartbeat();
		});

		return () => {
			untrack(() => {
				presence.stopHeartbeat();
			});
		};
	});

	// Convex client for mutations
	const convexClient = useConvexClient();

	// Local state for agenda item input
	const state = $state({
		newAgendaTitle: '',
		isAddingAgenda: false,
		hoveredProcessedId: null as Id<'meetingAgendaItems'> | null
	});

	// Derived: Split agenda items by status
	const todoItems = $derived(session.agendaItems.filter((item) => item.status === 'todo'));
	const processedItems = $derived(
		session.agendaItems.filter((item) => item.status === 'processed')
	);
	const rejectedItems = $derived(session.agendaItems.filter((item) => item.status === 'rejected'));

	// Derived: Get active agenda item from meeting (synchronized view)
	const activeItem = $derived(
		session.activeAgendaItemId
			? session.agendaItems.find((item) => item._id === session.activeAgendaItemId)
			: undefined
	);

	// Handle start meeting
	async function handleStartMeeting() {
		try {
			await session.startMeeting();
			toast.success('Meeting started');
		} catch (error) {
			console.error('Failed to start meeting:', error);
			toast.error('Failed to start meeting');
		}
	}

	// Handle advance step
	async function handleAdvanceStep(newStep: string) {
		try {
			await session.advanceStep(newStep);
		} catch (error) {
			console.error('Failed to advance step:', error);
			toast.error('Failed to advance step');
		}
	}

	// Handle close meeting
	async function handleCloseMeeting() {
		try {
			await session.closeMeeting();
			toast.success('Meeting closed');
		} catch (error) {
			console.error('Failed to close meeting:', error);
			toast.error('Failed to close meeting');
		}
	}

	// Handle add agenda item
	async function handleAddAgendaItem() {
		if (!state.newAgendaTitle.trim()) return;

		try {
			await session.addAgendaItem(state.newAgendaTitle.trim());
			state.newAgendaTitle = '';
			state.isAddingAgenda = false;
			toast.success('Agenda item added');
		} catch (error) {
			console.error('Failed to add agenda item:', error);
			toast.error('Failed to add agenda item');
		}
	}

	// Handle mark agenda item status
	async function handleMarkStatus(
		itemId: Id<'meetingAgendaItems'>,
		status: 'processed' | 'rejected'
	) {
		try {
			// Call mutation
			await convexClient.mutation(api.modules.meetings.agendaItems.markStatus, {
				agendaItemId: itemId,
				sessionId: sessionId(),
				status
			});

			// If marking active item, it will be cleared automatically by backend
			// Recorder should select new active item
			toast.success(`Agenda item marked as ${status}`);
		} catch (error) {
			console.error(`Failed to mark as ${status}:`, error);
			toast.error(`Failed to mark as ${status}`);
		}
	}

	// Handle set active agenda item (recorder only)
	async function handleSetActiveItem(itemId: Id<'meetingAgendaItems'> | null) {
		if (!session.isRecorder) {
			toast.error('Only the recorder can set the active agenda item');
			return;
		}

		try {
			await session.setActiveAgendaItem(itemId);
		} catch (error) {
			console.error('Failed to set active agenda item:', error);
			toast.error('Failed to set active agenda item');
		}
	}

	// Step configuration
	const steps = [
		{ id: 'check-in', label: 'Check-in' },
		{ id: 'agenda', label: 'Agenda' },
		{ id: 'closing', label: 'Closing' }
	];
</script>

{#if !meetingsEnabled}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<Heading level="h1" size="h1" class="font-bold">Meetings Not Enabled</Heading>
			<Text variant="body" color="secondary" class="mt-text-gap">
				This feature is not enabled for your workspace.
			</Text>
		</div>
	</div>
{:else if session.isLoading}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<div
				class="size-icon-lg rounded-avatar border-accent-primary inline-block animate-spin border-4 border-solid border-r-transparent"
			></div>
			<Text variant="body" color="secondary" class="mb-header">Loading meeting...</Text>
		</div>
	</div>
{:else if session.error}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<Heading level="h1" size="h1" class="text-error-text font-bold">Error Loading Meeting</Heading
			>
			<Text variant="body" color="secondary" class="mt-text-gap">{session.error.message}</Text>
		</div>
	</div>
{:else if session.meeting}
	<div class="bg-surface flex h-screen flex-col overflow-hidden">
		<!-- Header -->
		<div
			class="border-border-base bg-elevated px-page py-stack-header flex items-center justify-between border-b"
		>
			<div class="gap-content flex items-center">
				<Heading level="h1" size="h2" class="font-semibold">{session.meeting.title}</Heading>

				<!-- Recorder Indicator - visible to everyone -->
				{#if session.isStarted && session.meeting?.recorderPersonId}
					<div class="gap-fieldGroup flex items-center">
						<Text variant="label" color="tertiary">Recorder:</Text>
						<Text variant="body" size="sm" class="font-medium">
							{session.meeting.attendees?.find(
								(a) => a.personId === session.meeting.recorderPersonId
							)?.personName || 'Unknown'}
						</Text>
					</div>
				{/if}

				<!-- Active Users Indicator (SYOS-227) -->
				{#if session.isStarted && !session.isClosed}
					<div class="gap-fieldGroup flex items-center">
						<Text variant="label" color="secondary">Active:</Text>
						<Text variant="label" class="font-medium">
							{presence.activeCount}/{presence.expectedCount}
						</Text>
					</div>
				{/if}
			</div>

			<div class="gap-content flex items-center">
				<!-- Timer -->
				{#if session.isStarted && !session.isClosed}
					<div class="text-text-secondary gap-fieldGroup flex items-center">
						<Icon type="clock" size="md" />
						<Text variant="body" size="sm" class="font-code">{session.elapsedTimeFormatted}</Text>
					</div>
				{/if}

				<!-- Start Meeting Button (before meeting starts) -->
				{#if !session.isStarted}
					<Button variant="primary" onclick={handleStartMeeting}>Start Meeting</Button>
				{/if}

				<!-- Close Meeting Button (recorder only, after meeting starts) -->
				{#if session.isStarted && !session.isClosed && session.isRecorder}
					<Button
						variant="outline"
						onclick={handleCloseMeeting}
						class="border-error-border text-error-text hover:bg-error-bg-hover"
					>
						Close Meeting
					</Button>
				{/if}

				<!-- Meeting Closed Badge -->
				{#if session.isClosed}
					<span
						class="bg-badge text-badge-text px-badge py-badge text-button rounded-badge font-medium"
					>
						Meeting Closed
					</span>
				{/if}
			</div>
		</div>

		<!-- Content Area -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Sidebar (Agenda) -->
			<div class="w-sidebar border-border-base bg-elevated overflow-y-auto border-r">
				<div class="card-padding">
					<div class="mb-header flex items-center justify-between">
						<Heading level="h2" size="h3" class="font-semibold">Agenda</Heading>
						{#if !session.isClosed}
							<div class="gap-button flex items-center">
								{#if shouldShowImportButton}
									<ImportProposalButton
										meetingId={session.meeting._id}
										sessionId={sessionId()}
										workspaceId={session.meeting.workspaceId}
									/>
								{/if}
								<Button variant="ghost" size="sm" onclick={() => (state.isAddingAgenda = true)}>
									+ Add
								</Button>
							</div>
						{/if}
					</div>

					<!-- Add Agenda Item Input -->
					{#if state.isAddingAgenda}
						<div class="mb-header">
							<input
								type="text"
								bind:value={state.newAgendaTitle}
								placeholder="Agenda item title"
								class="border-border-base text-button text-text-primary placeholder-text-tertiary focus:ring-accent-primary rounded-input bg-surface px-input-x py-input-y focus:border-accent-primary w-full border focus:ring-1 focus:outline-none"
								onkeydown={(e) => {
									if (e.key === 'Enter') handleAddAgendaItem();
									if (e.key === 'Escape') {
										state.isAddingAgenda = false;
										state.newAgendaTitle = '';
									}
								}}
							/>
							<div class="mt-text-gap gap-fieldGroup flex">
								<Button variant="primary" size="sm" onclick={handleAddAgendaItem}>Add</Button>
								<Button
									variant="outline"
									size="sm"
									onclick={() => {
										state.isAddingAgenda = false;
										state.newAgendaTitle = '';
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					{/if}

					<!-- Agenda Items - Split by Status -->
					{#if session.agendaItems.length === 0}
						<Text variant="body" size="sm" color="tertiary">No agenda items yet</Text>
					{:else}
						<!-- To Process Section -->
						{#if todoItems.length > 0}
							<div class="mb-header">
								<Text
									variant="label"
									color="secondary"
									class="mb-text-gap font-semibold tracking-wider uppercase"
								>
									To Process ({todoItems.length})
								</Text>
								<div class="gap-fieldGroup flex flex-col">
									{#each todoItems as item (item._id)}
										<button
											onclick={() => session.isRecorder && handleSetActiveItem(item._id)}
											disabled={!session.isRecorder}
											class="px-fieldGroup py-nav-item rounded-button w-full border text-left transition-colors {session.activeAgendaItemId ===
											item._id
												? 'bg-accent-primary/10 border-accent-primary'
												: 'border-border-base bg-surface hover:border-accent-primary'} {session.isRecorder
												? 'cursor-pointer'
												: 'cursor-not-allowed'}"
											style={session.isRecorder ? undefined : 'opacity: var(--opacity-60);'}
										>
											<Text variant="body" size="sm" class="font-medium">{item.title}</Text>
											<Text variant="label" color="tertiary" class="mt-icon-gap-sm">
												Added by {item.creatorName}
											</Text>
										</button>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Processed Section -->
						{#if processedItems.length > 0}
							<div class="mb-header">
								<div class="mb-text-gap gap-fieldGroup flex items-center">
									<Icon type="check" size="sm" color="tertiary" />
									<Text
										variant="label"
										color="tertiary"
										class="font-semibold tracking-wider uppercase"
									>
										Processed ({processedItems.length})
									</Text>
								</div>
								<div class="gap-fieldGroup flex flex-col">
									{#each processedItems as item (item._id)}
										<button
											onclick={() => session.isRecorder && handleSetActiveItem(item._id)}
											disabled={!session.isRecorder}
											onmouseenter={() => (state.hoveredProcessedId = item._id)}
											onmouseleave={() => (state.hoveredProcessedId = null)}
											class="border-border-base px-fieldGroup py-nav-item rounded-button bg-surface w-full border text-left transition-all {session.isRecorder
												? 'cursor-pointer'
												: 'cursor-not-allowed'}"
											style="opacity: var(--opacity-{state.hoveredProcessedId === item._id
												? '100'
												: '60'});"
										>
											<Text variant="body" size="sm" color="tertiary" class="font-medium"
												>{item.title}</Text
											>
											<Text variant="label" color="tertiary" class="mt-icon-gap-sm">
												Added by {item.creatorName}
											</Text>
										</button>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Rejected Section -->
						{#if rejectedItems.length > 0}
							<div>
								<div class="mb-text-gap gap-fieldGroup flex items-center">
									<Icon type="close" size="sm" color="error" />
									<Text
										variant="label"
										color="error"
										class="font-semibold tracking-wider uppercase"
									>
										Rejected ({rejectedItems.length})
									</Text>
								</div>
								<div class="gap-fieldGroup flex flex-col">
									{#each rejectedItems as item (item._id)}
										<button
											onclick={() => session.isRecorder && handleSetActiveItem(item._id)}
											disabled={!session.isRecorder}
											onmouseenter={() => (state.hoveredProcessedId = item._id)}
											onmouseleave={() => (state.hoveredProcessedId = null)}
											class="border-border-base px-fieldGroup py-nav-item rounded-button bg-surface w-full border text-left transition-all {session.isRecorder
												? 'cursor-pointer'
												: 'cursor-not-allowed'}"
											style="opacity: var(--opacity-{state.hoveredProcessedId === item._id
												? '100'
												: '60'});"
										>
											<Text variant="body" size="sm" color="tertiary" class="font-medium"
												>{item.title}</Text
											>
											<Text variant="label" color="tertiary" class="mt-icon-gap-sm">
												Added by {item.creatorName}
											</Text>
										</button>
									{/each}
								</div>
							</div>
						{/if}
					{/if}
				</div>
			</div>

			<!-- Main Content -->
			<div class="flex flex-1 flex-col overflow-hidden">
				<!-- Step Navigation (Tabs) -->
				{#if session.isStarted && !session.isClosed}
					<div class="border-border-base bg-elevated flex border-b">
						{#each steps as step (step.id)}
							<button
								onclick={() => handleAdvanceStep(step.id)}
								class="border-border-base px-form-section py-header text-button cursor-pointer font-medium transition-colors {session.currentStep ===
								step.id
									? 'border-accent-primary text-accent-primary border-b-2'
									: 'text-text-secondary hover:text-text-primary'}"
							>
								{step.label}
							</button>
						{/each}
					</div>
				{/if}

				<!-- Step Content -->
				<div class="pb-page px-page py-page flex-1 overflow-y-auto">
					{#if !session.isStarted}
						<!-- Before meeting starts -->
						<div class="text-center">
							<div class="mx-auto">
								<Icon type="clock" size="xl" color="tertiary" />
							</div>
							<Heading level="h2" size="h3" class="mb-header font-semibold">
								Meeting Not Started
							</Heading>
							<Text variant="body" color="secondary" class="mt-text-gap">
								Click "Start Meeting" to begin
							</Text>
						</div>
					{:else if session.isClosed}
						<!-- Meeting closed -->
						<div class="text-center">
							<div class="mx-auto">
								<Icon type="check-circle" size="xl" color="success" />
							</div>
							<Heading level="h2" size="h3" class="mb-header font-semibold">Meeting Closed</Heading>
							<Text variant="body" color="secondary" class="mt-text-gap">
								This meeting has ended. Duration: {session.elapsedTimeFormatted}
							</Text>
						</div>
					{:else if session.currentStep === 'check-in'}
						<!-- Check-in Step - Attendance Tracking (SYOS-227) -->
						<div>
							<Heading level="h2" size="h2" class="font-bold">Check-in</Heading>
							<Text variant="body" color="secondary" class="mt-text-gap">
								Everyone expresses how they feel and what is on their minds.
							</Text>

							<!-- Attendance List -->
							<div class="mb-header">
								<Heading level="h3" size="h3" class="font-semibold">
									Attendance ({presence.activeCount}/{presence.expectedCount} present)
								</Heading>

								{#if presence.combinedAttendance.length > 0}
									<div class="gap-fieldGroup mb-header flex flex-col">
										{#each presence.combinedAttendance as attendee (attendee.personId)}
											<label
												class="border-border-base px-card py-card gap-fieldGroup rounded-button bg-surface flex items-center border transition-colors {attendee.isActive
													? 'border-accent-primary/30 bg-accent-primary/5'
													: ''}"
											>
												<!-- Checkbox (read-only, auto-checked for active users) -->
												<input
													type="checkbox"
													checked={attendee.isActive}
													disabled
													class="border-border-base size-icon-sm text-accent-primary cursor-default rounded focus:ring-0"
													style="opacity: var(--opacity-{attendee.isActive ? '100' : '50'});"
												/>

												<!-- User Avatar -->
												<div
													class="text-button size-icon-lg rounded-avatar flex items-center justify-center font-medium {attendee.isActive
														? 'bg-accent-primary text-primary'
														: 'bg-surface-tertiary text-text-tertiary'}"
												>
													{attendee.name?.[0]?.toUpperCase() ?? '?'}
												</div>

												<!-- User Name -->
												<Text
													variant="body"
													size="sm"
													as="span"
													class="flex-1 {attendee.isActive
														? 'text-text-primary font-medium'
														: 'text-text-secondary'}"
												>
													{attendee.name}
												</Text>

												<!-- Guest Badge (for unexpected joiners) -->
												{#if !attendee.isExpected}
													<span
														class="bg-info-bg px-badge py-badge text-info-text rounded-badge text-label font-medium"
													>
														Guest
													</span>
												{/if}

												<!-- Attendee Type Badge (for expected attendees) -->
												{#if attendee.isExpected && attendee.attendeeType}
													<Text variant="label" color="tertiary">
														{#if attendee.attendeeType === 'role'}
															(Role)
														{:else if attendee.attendeeType === 'circle'}
															(Circle)
														{/if}
													</Text>
												{/if}
											</label>
										{/each}
									</div>
								{:else}
									<Text variant="body" size="sm" color="tertiary" class="mb-header">
										No attendees registered yet
									</Text>
								{/if}
							</div>
						</div>
					{:else if session.currentStep === 'agenda'}
						<!-- Agenda Step - Processing Flow -->
						{#if todoItems.length === 0 && processedItems.length === 0 && rejectedItems.length === 0}
							<!-- No agenda items -->
							<div class="flex h-full items-center justify-center">
								<div class="text-center">
									<div class="mx-auto">
										<Icon type="clipboard" size="xl" color="tertiary" />
									</div>
									<Heading level="h3" size="h3" class="mb-header font-semibold">
										No Agenda Items
									</Heading>
									<Text variant="body" color="secondary" class="mt-text-gap">
										Add items using the sidebar on the left
									</Text>
								</div>
							</div>
						{:else if todoItems.length === 0}
							<!-- All items processed - Completion state -->
							<div class="flex h-full items-center justify-center">
								<div class="text-center">
									<div class="mx-auto">
										<Icon type="check-circle" size="xxl" color="success" />
									</div>
									<Heading level="h3" size="h1" class="mb-header font-bold">
										All Agenda Items Processed!
									</Heading>
									<Text variant="body" color="secondary" class="mt-text-gap">
										{processedItems.length}
										{processedItems.length === 1 ? 'item' : 'items'} completed
									</Text>
									<Text variant="body" size="sm" color="tertiary" class="mb-header">
										You can now advance to the Closing step
									</Text>
								</div>
							</div>
						{:else}
							<!-- Active item view -->
							<AgendaItemView
								item={activeItem}
								meetingId={session.meeting._id}
								workspaceId={session.meeting.workspaceId}
								circleId={session.meeting.circleId}
								sessionId={data.sessionId}
								onMarkStatus={handleMarkStatus}
								isClosed={session.isClosed}
								isRecorder={session.isRecorder}
							/>
						{/if}
					{:else if session.currentStep === 'closing'}
						<!-- Closing Step -->
						<div>
							<Heading level="h2" size="h2" class="font-bold">Closing</Heading>
							<Text variant="body" color="secondary" class="mt-text-gap">
								Recap decisions, action items, and next steps.
							</Text>
							<div class="mb-header">
								<div class="border-border-base rounded-card bg-surface card-padding border">
									<Heading level="h3" size="h3" class="font-semibold">Meeting Summary</Heading>
									<div class="gap-fieldGroup mb-header flex flex-col">
										<Text variant="body" size="sm" color="secondary"
											>Duration: {session.elapsedTimeFormatted}</Text
										>
										<Text variant="body" size="sm" color="secondary"
											>Agenda items discussed: {session.agendaItems.length}</Text
										>
										<Text variant="body" size="sm" color="secondary"
											>Attendees: {session.meeting.attendees?.length ?? 0}</Text
										>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

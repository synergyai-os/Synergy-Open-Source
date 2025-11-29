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
	import SecretarySelector from '$lib/modules/meetings/components/SecretarySelector.svelte';
	import SecretaryConfirmationDialog from '$lib/modules/meetings/components/SecretaryConfirmationDialog.svelte';
	import { Icon, Heading, Text, Button } from '$lib/components/atoms';

	interface Props {
		data: {
			sessionId: string;
			userId: Id<'users'>;
			enabledFeatures: string[];
		};
	}

	const { data }: Props = $props();

	// Check feature flag
	const meetingsEnabled = data.enabledFeatures.includes('meetings');

	// Get meetingId from URL params
	const meetingId = () => page.params.id as Id<'meetings'> | undefined;
	const sessionId = () => data.sessionId;
	const userId = () => data.userId;

	// Real-time meeting session
	const session = useMeetingSession({
		meetingId,
		sessionId,
		userId
	});

	// Real-time presence tracking (SYOS-227)
	const presence = useMeetingPresence({
		meetingId,
		sessionId
	});

	// Start heartbeat on mount, stop on unmount (browser-safe pattern)
	// Use untrack() to prevent infinite effect loops (SYOS-227)
	$effect(() => {
		if (!browser) return;

		// Call heartbeat functions without tracking their internal reactive dependencies
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

	// Real-time secretary change requests (only for current secretary)
	const secretaryRequestsQuery =
		browser && meetingId() && sessionId()
			? useQuery(api.meetings.watchSecretaryRequests, () => {
					const mId = meetingId();
					const sId = sessionId();
					if (!mId || !sId) throw new Error('Missing meetingId or sessionId');
					return { meetingId: mId, sessionId: sId };
				})
			: null;

	const pendingRequest = $derived(secretaryRequestsQuery?.data?.[0] ?? null);

	// Local state for agenda item input and selection
	const state = $state({
		newAgendaTitle: '',
		isAddingAgenda: false,
		activeItemId: null as Id<'meetingAgendaItems'> | null,
		hoveredProcessedId: null as Id<'meetingAgendaItems'> | null
	});

	// Derived: Split agenda items into processed/unprocessed
	const unprocessedItems = $derived(session.agendaItems.filter((item) => !item.isProcessed));
	const processedItems = $derived(session.agendaItems.filter((item) => item.isProcessed));

	// Derived: Get active agenda item
	const activeItem = $derived(
		state.activeItemId
			? session.agendaItems.find((item) => item._id === state.activeItemId)
			: undefined
	);

	// Auto-select first unprocessed item when entering agenda step
	$effect(() => {
		if (
			session.isStarted &&
			!session.isClosed &&
			session.currentStep === 'agenda' &&
			!state.activeItemId &&
			unprocessedItems.length > 0
		) {
			state.activeItemId = unprocessedItems[0]._id;
		}
	});

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

	// Handle mark agenda item as processed
	async function handleMarkProcessed(itemId: Id<'meetingAgendaItems'>) {
		try {
			// Call mutation
			await convexClient.mutation(api.meetingAgendaItems.markProcessed, {
				agendaItemId: itemId,
				sessionId: sessionId(),
				isProcessed: true
			});

			// Auto-select next unprocessed item
			const currentIndex = unprocessedItems.findIndex((i) => i._id === itemId);
			if (currentIndex < unprocessedItems.length - 1) {
				state.activeItemId = unprocessedItems[currentIndex + 1]._id;
			} else {
				// All items processed
				state.activeItemId = null;
			}

			toast.success('Agenda item marked as processed');
		} catch (error) {
			console.error('Failed to mark as processed:', error);
			toast.error('Failed to mark as processed');
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
				This feature is not enabled for your organization.
			</Text>
		</div>
	</div>
{:else if session.isLoading}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<div
				class="border-accent-primary inline-block size-icon-lg animate-spin rounded-avatar border-4 border-solid border-r-transparent"
			></div>
			<Text variant="body" color="secondary" class="mt-content-section">Loading meeting...</Text>
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
	<div class="flex h-screen flex-col overflow-hidden bg-surface">
		<!-- Header -->
		<div
			class="border-border-base py-header flex items-center justify-between border-b bg-elevated px-page"
		>
			<div class="gap-content-section flex items-center">
				<Heading level="h1" size="h2" class="font-semibold">{session.meeting.title}</Heading>

				<!-- Secretary Selector - visible to everyone -->
				{#if session.meeting}
					<div class="flex items-center gap-fieldGroup">
						<Text variant="label" color="tertiary">Secretary:</Text>
						<SecretarySelector
							meetingId={session.meeting._id}
							sessionId={data.sessionId}
							currentSecretaryId={session.meeting.secretaryId ?? session.meeting.createdBy}
							currentSecretaryName={session.meeting.secretaryName || 'Unknown'}
							currentUserId={data.userId}
							attendees={session.meeting.attendees || []}
						/>
					</div>
				{/if}

				<!-- Active Users Indicator (SYOS-227) -->
				{#if session.isStarted && !session.isClosed}
					<div class="flex items-center gap-fieldGroup">
						<Text variant="label" color="secondary">Active:</Text>
						<Text variant="label" class="font-medium">
							{presence.activeCount}/{presence.expectedCount}
						</Text>
					</div>
				{/if}
			</div>

			<div class="gap-content-section flex items-center">
				<!-- Timer -->
				{#if session.isStarted && !session.isClosed}
					<div class="text-text-secondary flex items-center gap-fieldGroup">
						<Icon type="clock" size="md" />
						<Text variant="body" size="sm" class="font-code">{session.elapsedTimeFormatted}</Text>
					</div>
				{/if}

				<!-- Start Meeting Button (Secretary only, before meeting starts) -->
				{#if session.isSecretary && !session.isStarted}
					<Button variant="primary" onclick={handleStartMeeting}>Start Meeting</Button>
				{/if}

				<!-- Close Meeting Button (Secretary only, after meeting starts) -->
				{#if session.isSecretary && session.isStarted && !session.isClosed}
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
			<div class="w-sidebar border-border-base overflow-y-auto border-r bg-elevated">
				<div class="p-card">
					<div class="mb-content-section flex items-center justify-between">
						<Heading level="h2" size="h3" class="font-semibold">Agenda</Heading>
						{#if !session.isClosed}
							<Button variant="ghost" size="sm" onclick={() => (state.isAddingAgenda = true)}>
								+ Add
							</Button>
						{/if}
					</div>

					<!-- Add Agenda Item Input -->
					{#if state.isAddingAgenda}
						<div class="mb-content-section">
							<input
								type="text"
								bind:value={state.newAgendaTitle}
								placeholder="Agenda item title"
								class="border-border-base text-button text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-accent-primary w-full rounded-input border bg-surface px-input-x py-input-y focus:ring-1 focus:outline-none"
								onkeydown={(e) => {
									if (e.key === 'Enter') handleAddAgendaItem();
									if (e.key === 'Escape') {
										state.isAddingAgenda = false;
										state.newAgendaTitle = '';
									}
								}}
							/>
							<div class="mt-text-gap flex gap-fieldGroup">
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
						{#if unprocessedItems.length > 0}
							<div class="mb-section-gap">
								<Text
									variant="label"
									color="secondary"
									class="mb-text-gap font-semibold tracking-wider uppercase"
								>
									To Process ({unprocessedItems.length})
								</Text>
								<div class="flex flex-col gap-fieldGroup">
									{#each unprocessedItems as item (item._id)}
										<button
											onclick={() => session.isSecretary && (state.activeItemId = item._id)}
											disabled={!session.isSecretary}
											class="px-fieldGroup py-nav-item w-full rounded-button border text-left transition-colors {state.activeItemId ===
											item._id
												? 'border-accent-primary bg-accent-primary/10'
												: 'border-border-base hover:border-accent-primary bg-surface'} {!session.isSecretary
												? 'cursor-not-allowed'
												: 'cursor-pointer'}"
											style={!session.isSecretary ? 'opacity: var(--opacity-50);' : ''}
											title={!session.isSecretary
												? 'Only the secretary can switch agenda items'
												: ''}
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
							<div>
								<div class="mb-text-gap flex items-center gap-fieldGroup">
									<Icon type="check" size="sm" color="tertiary" />
									<Text
										variant="label"
										color="tertiary"
										class="font-semibold tracking-wider uppercase"
									>
										Processed ({processedItems.length})
									</Text>
								</div>
								<div class="flex flex-col gap-fieldGroup">
									{#each processedItems as item (item._id)}
										<button
											onclick={() => session.isSecretary && (state.activeItemId = item._id)}
											onmouseenter={() => (state.hoveredProcessedId = item._id)}
											onmouseleave={() => (state.hoveredProcessedId = null)}
											disabled={!session.isSecretary}
											class="border-border-base px-fieldGroup py-nav-item w-full rounded-button border bg-surface text-left transition-all {!session.isSecretary
												? 'cursor-not-allowed'
												: 'cursor-pointer'}"
											style="opacity: var(--opacity-{state.hoveredProcessedId === item._id
												? '100'
												: '60'});"
											title={!session.isSecretary
												? 'Only the secretary can switch agenda items'
												: ''}
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
					<div class="border-border-base flex border-b bg-elevated">
						{#each steps as step (step.id)}
							<button
								onclick={() => session.isSecretary && handleAdvanceStep(step.id)}
								disabled={!session.isSecretary}
								class="border-border-base px-form-section py-header text-button font-medium transition-colors {session.currentStep ===
								step.id
									? 'border-accent-primary text-accent-primary border-b-2'
									: 'text-text-secondary hover:text-text-primary'} {!session.isSecretary
									? 'cursor-not-allowed'
									: 'cursor-pointer'}"
							>
								{step.label}
							</button>
						{/each}
					</div>
				{/if}

				<!-- Step Content -->
				<div class="pb-section-spacing-xlarge flex-1 overflow-y-auto px-page py-page">
					{#if !session.isStarted}
						<!-- Before meeting starts -->
						<div class="text-center">
							<div class="mx-auto">
								<Icon type="clock" size="xl" color="tertiary" />
							</div>
							<Heading level="h2" size="h3" class="mt-content-section font-semibold">
								Meeting Not Started
							</Heading>
							<Text variant="body" color="secondary" class="mt-text-gap">
								{session.isSecretary
									? 'Click "Start Meeting" to begin'
									: 'Waiting for facilitator to start the meeting'}
							</Text>
						</div>
					{:else if session.isClosed}
						<!-- Meeting closed -->
						<div class="text-center">
							<div class="mx-auto">
								<Icon type="check-circle" size="xl" color="success" />
							</div>
							<Heading level="h2" size="h3" class="mt-content-section font-semibold">
								Meeting Closed
							</Heading>
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
							<div class="mt-section-gap">
								<Heading level="h3" size="h3" class="font-semibold">
									Attendance ({presence.activeCount}/{presence.expectedCount} present)
								</Heading>

								{#if presence.combinedAttendance.length > 0}
									<div class="mt-content-section flex flex-col gap-fieldGroup">
										{#each presence.combinedAttendance as attendee (attendee.userId)}
											<label
												class="border-border-base px-card py-card flex items-center gap-fieldGroup rounded-button border bg-surface transition-colors {attendee.isActive
													? 'border-accent-primary/30 bg-accent-primary/5'
													: ''}"
											>
												<!-- Checkbox (read-only, auto-checked for active users) -->
												<input
													type="checkbox"
													checked={attendee.isActive}
													disabled
													class="border-border-base text-accent-primary size-icon-sm cursor-default rounded focus:ring-0"
													style="opacity: var(--opacity-{attendee.isActive ? '100' : '50'});"
												/>

												<!-- User Avatar -->
												<div
													class="text-button flex size-icon-lg items-center justify-center rounded-avatar font-medium {attendee.isActive
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
									<Text variant="body" size="sm" color="tertiary" class="mt-content-section">
										No attendees registered yet
									</Text>
								{/if}
							</div>
						</div>
					{:else if session.currentStep === 'agenda'}
						<!-- Agenda Step - Processing Flow -->
						{#if unprocessedItems.length === 0 && processedItems.length === 0}
							<!-- No agenda items -->
							<div class="flex h-full items-center justify-center">
								<div class="text-center">
									<div class="mx-auto">
										<Icon type="clipboard" size="xl" color="tertiary" />
									</div>
									<Heading level="h3" size="h3" class="mt-content-section font-semibold">
										No Agenda Items
									</Heading>
									<Text variant="body" color="secondary" class="mt-text-gap">
										Add items using the sidebar on the left
									</Text>
								</div>
							</div>
						{:else if unprocessedItems.length === 0}
							<!-- All items processed - Completion state -->
							<div class="flex h-full items-center justify-center">
								<div class="text-center">
									<div class="mx-auto">
										<Icon type="check-circle" size="xxl" color="success" />
									</div>
									<Heading level="h3" size="h1" class="mt-content-section font-bold">
										All Agenda Items Processed!
									</Heading>
									<Text variant="body" color="secondary" class="mt-text-gap">
										{processedItems.length}
										{processedItems.length === 1 ? 'item' : 'items'} completed
									</Text>
									<Text variant="body" size="sm" color="tertiary" class="mt-content-section">
										You can now advance to the Closing step
									</Text>
								</div>
							</div>
						{:else}
							<!-- Active item view -->
							<AgendaItemView
								item={activeItem}
								meetingId={session.meeting._id}
								organizationId={session.meeting.organizationId}
								circleId={session.meeting.circleId}
								sessionId={data.sessionId}
								isSecretary={session.isSecretary}
								onMarkProcessed={handleMarkProcessed}
								isClosed={session.isClosed}
							/>
						{/if}
					{:else if session.currentStep === 'closing'}
						<!-- Closing Step -->
						<div>
							<Heading level="h2" size="h2" class="font-bold">Closing</Heading>
							<Text variant="body" color="secondary" class="mt-text-gap">
								Recap decisions, action items, and next steps.
							</Text>
							<div class="mt-section-gap">
								<div class="border-border-base rounded-card border bg-surface card-padding">
									<Heading level="h3" size="h3" class="font-semibold">Meeting Summary</Heading>
									<div class="mt-content-section flex flex-col gap-fieldGroup">
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

	<!-- Secretary Confirmation Dialog (real-time) -->
	<SecretaryConfirmationDialog
		request={pendingRequest}
		sessionId={data.sessionId}
		onClose={() => {
			// Dialog closes automatically when request is resolved
		}}
	/>
{/if}

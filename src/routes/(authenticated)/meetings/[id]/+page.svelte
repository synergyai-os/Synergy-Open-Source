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
		activeItemId: null as Id<'meetingAgendaItems'> | null
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
			<h1 class="text-h1 font-bold text-text-primary">Meetings Not Enabled</h1>
			<p class="mt-spacing-text-gap text-text-secondary">
				This feature is not enabled for your organization.
			</p>
		</div>
	</div>
{:else if session.isLoading}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<div
				class="inline-block size-icon-lg animate-spin rounded-avatar border-4 border-solid border-accent-primary border-r-transparent"
			></div>
			<p class="mt-content-section text-text-secondary">Loading meeting...</p>
		</div>
	</div>
{:else if session.error}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<h1 class="text-h1 font-bold text-error-text">Error Loading Meeting</h1>
			<p class="mt-spacing-text-gap text-text-secondary">{session.error.message}</p>
		</div>
	</div>
{:else if session.meeting}
	<div class="flex h-screen flex-col overflow-hidden bg-surface">
		<!-- Header -->
		<div
			class="flex items-center justify-between border-b border-border-base bg-elevated px-container py-header"
		>
			<div class="flex items-center gap-content-section">
				<h1 class="text-h2 font-semibold text-text-primary">{session.meeting.title}</h1>

				<!-- Secretary Selector - visible to everyone -->
				{#if session.meeting}
					<div class="flex items-center gap-icon">
						<span class="text-button text-text-tertiary">Secretary:</span>
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
					<div class="gap-icon-sm flex items-center">
						<span class="text-label text-text-secondary">Active:</span>
						<span class="text-label font-medium text-text-primary">
							{presence.activeCount}/{presence.expectedCount}
						</span>
					</div>
				{/if}
			</div>

			<div class="flex items-center gap-content-section">
				<!-- Timer -->
				{#if session.isStarted && !session.isClosed}
					<div class="flex items-center gap-icon text-text-secondary">
						<svg
							class="icon-md"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span class="font-code text-button">{session.elapsedTimeFormatted}</span>
					</div>
				{/if}

				<!-- Start Meeting Button (Secretary only, before meeting starts) -->
				{#if session.isSecretary && !session.isStarted}
					<button
						onclick={handleStartMeeting}
						class="rounded-button bg-accent-primary px-button-x py-button-y text-button font-medium text-primary transition-colors hover:bg-accent-hover"
					>
						Start Meeting
					</button>
				{/if}

				<!-- Close Meeting Button (Secretary only, after meeting starts) -->
				{#if session.isSecretary && session.isStarted && !session.isClosed}
					<button
						onclick={handleCloseMeeting}
						class="hover:bg-error-bg-hover rounded-button border border-error-border px-button-x py-button-y text-button font-medium text-error-text transition-colors"
					>
						Close Meeting
					</button>
				{/if}

				<!-- Meeting Closed Badge -->
				{#if session.isClosed}
					<span
						class="bg-badge text-badge-text rounded-badge px-badge py-badge text-button font-medium"
					>
						Meeting Closed
					</span>
				{/if}
			</div>
		</div>

		<!-- Content Area -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Sidebar (Agenda) -->
			<div class="w-sidebar overflow-y-auto border-r border-border-base bg-elevated">
				<div class="p-card">
					<div class="mb-content-section flex items-center justify-between">
						<h2 class="text-body-sm font-semibold text-text-primary">Agenda</h2>
						{#if !session.isClosed}
							<button
								onclick={() => (state.isAddingAgenda = true)}
								class="text-button font-medium text-accent-primary hover:text-accent-hover"
								title="Add agenda item"
							>
								+ Add
							</button>
						{/if}
					</div>

					<!-- Add Agenda Item Input -->
					{#if state.isAddingAgenda}
						<div class="mb-content-section">
							<input
								type="text"
								bind:value={state.newAgendaTitle}
								placeholder="Agenda item title"
								class="w-full rounded-input border border-border-base bg-surface px-input-x py-input-y text-button text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
								onkeydown={(e) => {
									if (e.key === 'Enter') handleAddAgendaItem();
									if (e.key === 'Escape') {
										state.isAddingAgenda = false;
										state.newAgendaTitle = '';
									}
								}}
							/>
							<div class="mt-spacing-text-gap flex gap-icon">
								<button
									onclick={handleAddAgendaItem}
									class="py-button-y-sm rounded-button bg-accent-primary px-button-x text-label font-medium text-primary"
								>
									Add
								</button>
								<button
									onclick={() => {
										state.isAddingAgenda = false;
										state.newAgendaTitle = '';
									}}
									class="py-button-y-sm rounded-button border border-border-base px-button-x text-label font-medium text-text-secondary"
								>
									Cancel
								</button>
							</div>
						</div>
					{/if}

					<!-- Agenda Items - Split by Status -->
					{#if session.agendaItems.length === 0}
						<p class="text-body-sm text-text-tertiary">No agenda items yet</p>
					{:else}
						<!-- To Process Section -->
						{#if unprocessedItems.length > 0}
							<div class="mb-section-gap">
								<h3
									class="mb-spacing-text-gap text-label font-semibold tracking-wider text-text-secondary uppercase"
								>
									To Process ({unprocessedItems.length})
								</h3>
								<div class="flex flex-col gap-icon">
									{#each unprocessedItems as item (item._id)}
										<button
											onclick={() => session.isSecretary && (state.activeItemId = item._id)}
											disabled={!session.isSecretary}
											class="w-full rounded-button border px-nav-item py-nav-item text-left transition-colors {state.activeItemId ===
											item._id
												? 'border-accent-primary bg-accent-primary/10'
												: 'border-border-base bg-surface hover:border-accent-primary'} {!session.isSecretary
												? 'cursor-not-allowed opacity-50'
												: 'cursor-pointer'}"
											title={!session.isSecretary
												? 'Only the secretary can switch agenda items'
												: ''}
										>
											<p class="text-body-sm font-medium text-text-primary">{item.title}</p>
											<p class="mt-spacing-icon-gap-sm text-label text-text-tertiary">
												Added by {item.creatorName}
											</p>
										</button>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Processed Section -->
						{#if processedItems.length > 0}
							<div>
								<h3
									class="mb-spacing-text-gap flex items-center gap-icon text-label font-semibold tracking-wider text-text-tertiary uppercase"
								>
									<svg
										class="icon-sm"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
									Processed ({processedItems.length})
								</h3>
								<div class="flex flex-col gap-icon">
									{#each processedItems as item (item._id)}
										<button
											onclick={() => session.isSecretary && (state.activeItemId = item._id)}
											disabled={!session.isSecretary}
											class="w-full rounded-button border border-border-base bg-surface px-nav-item py-nav-item text-left opacity-60 transition-colors hover:opacity-100 {!session.isSecretary
												? 'cursor-not-allowed'
												: 'cursor-pointer'}"
											title={!session.isSecretary
												? 'Only the secretary can switch agenda items'
												: ''}
										>
											<p class="text-body-sm font-medium text-text-tertiary">{item.title}</p>
											<p class="mt-spacing-icon-gap-sm text-label text-text-tertiary">
												Added by {item.creatorName}
											</p>
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
					<div class="flex border-b border-border-base bg-elevated">
						{#each steps as step (step.id)}
							<button
								onclick={() => session.isSecretary && handleAdvanceStep(step.id)}
								disabled={!session.isSecretary}
								class="border-border-base px-container py-header text-button font-medium transition-colors {session.currentStep ===
								step.id
									? 'border-b-2 border-accent-primary text-accent-primary'
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
				<div class="pb-section-spacing-xlarge flex-1 overflow-y-auto px-container py-container">
					{#if !session.isStarted}
						<!-- Before meeting starts -->
						<div class="text-center">
							<svg
								class="mx-auto icon-xl text-text-tertiary"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<h2 class="mt-content-section text-h3 font-semibold text-text-primary">
								Meeting Not Started
							</h2>
							<p class="mt-spacing-text-gap text-text-secondary">
								{session.isSecretary
									? 'Click "Start Meeting" to begin'
									: 'Waiting for facilitator to start the meeting'}
							</p>
						</div>
					{:else if session.isClosed}
						<!-- Meeting closed -->
						<div class="text-center">
							<svg
								class="mx-auto icon-xl text-success-text"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<h2 class="mt-content-section text-h3 font-semibold text-text-primary">
								Meeting Closed
							</h2>
							<p class="mt-spacing-text-gap text-text-secondary">
								This meeting has ended. Duration: {session.elapsedTimeFormatted}
							</p>
						</div>
					{:else if session.currentStep === 'check-in'}
						<!-- Check-in Step - Attendance Tracking (SYOS-227) -->
						<div>
							<h2 class="text-h2 font-bold text-text-primary">Check-in</h2>
							<p class="mt-spacing-text-gap text-text-secondary">
								Everyone expresses how they feel and what is on their minds.
							</p>

							<!-- Attendance List -->
							<div class="mt-section-gap">
								<h3 class="text-body-sm font-semibold text-text-primary">
									Attendance ({presence.activeCount}/{presence.expectedCount} present)
								</h3>

								{#if presence.combinedAttendance.length > 0}
									<div class="mt-content-section flex flex-col gap-icon">
										{#each presence.combinedAttendance as attendee (attendee.userId)}
											<label
												class="flex items-center gap-icon rounded-button border border-border-base bg-surface px-card py-card transition-colors {attendee.isActive
													? 'border-accent-primary/30 bg-accent-primary/5'
													: ''}"
											>
												<!-- Checkbox (read-only, auto-checked for active users) -->
												<input
													type="checkbox"
													checked={attendee.isActive}
													disabled
													class="icon-sm cursor-default rounded border-border-base text-accent-primary focus:ring-0 {attendee.isActive
														? 'opacity-100'
														: 'opacity-50'}"
												/>

												<!-- User Avatar -->
												<div
													class="flex size-icon-lg items-center justify-center rounded-avatar text-button font-medium {attendee.isActive
														? 'bg-accent-primary text-primary'
														: 'bg-surface-tertiary text-text-tertiary'}"
												>
													{attendee.name?.[0]?.toUpperCase() ?? '?'}
												</div>

												<!-- User Name -->
												<span
													class="text-body-sm flex-1 {attendee.isActive
														? 'font-medium text-text-primary'
														: 'text-text-secondary'}"
												>
													{attendee.name}
												</span>

												<!-- Guest Badge (for unexpected joiners) -->
												{#if !attendee.isExpected}
													<span
														class="bg-info-bg py-badge-sm text-info-text rounded-badge px-badge text-label font-medium"
													>
														Guest
													</span>
												{/if}

												<!-- Attendee Type Badge (for expected attendees) -->
												{#if attendee.isExpected && attendee.attendeeType}
													<span class="text-label text-text-tertiary">
														{#if attendee.attendeeType === 'role'}
															(Role)
														{:else if attendee.attendeeType === 'circle'}
															(Circle)
														{/if}
													</span>
												{/if}
											</label>
										{/each}
									</div>
								{:else}
									<p class="text-body-sm mt-content-section text-text-tertiary">
										No attendees registered yet
									</p>
								{/if}
							</div>
						</div>
					{:else if session.currentStep === 'agenda'}
						<!-- Agenda Step - Processing Flow -->
						{#if unprocessedItems.length === 0 && processedItems.length === 0}
							<!-- No agenda items -->
							<div class="flex h-full items-center justify-center">
								<div class="text-center">
									<svg
										class="mx-auto icon-xl text-text-tertiary"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
										/>
									</svg>
									<h3 class="mt-content-section text-h3 font-semibold text-text-primary">
										No Agenda Items
									</h3>
									<p class="mt-spacing-text-gap text-text-secondary">
										Add items using the sidebar on the left
									</p>
								</div>
							</div>
						{:else if unprocessedItems.length === 0}
							<!-- All items processed - Completion state -->
							<div class="flex h-full items-center justify-center">
								<div class="text-center">
									<svg
										class="icon-xxl mx-auto text-success-text"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									<h3 class="mt-content-section text-h1 font-bold text-text-primary">
										All Agenda Items Processed!
									</h3>
									<p class="mt-spacing-text-gap text-text-secondary">
										{processedItems.length}
										{processedItems.length === 1 ? 'item' : 'items'} completed
									</p>
									<p class="text-body-sm mt-content-section text-text-tertiary">
										You can now advance to the Closing step
									</p>
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
							<h2 class="text-h2 font-bold text-text-primary">Closing</h2>
							<p class="mt-spacing-text-gap text-text-secondary">
								Recap decisions, action items, and next steps.
							</p>
							<div class="mt-section-gap">
								<div
									class="rounded-card border border-border-base bg-surface px-container py-container"
								>
									<h3 class="font-semibold text-text-primary">Meeting Summary</h3>
									<div
										class="text-body-sm mt-content-section flex flex-col gap-icon text-text-secondary"
									>
										<p>Duration: {session.elapsedTimeFormatted}</p>
										<p>Agenda items discussed: {session.agendaItems.length}</p>
										<p>Attendees: {session.meeting.attendees?.length ?? 0}</p>
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

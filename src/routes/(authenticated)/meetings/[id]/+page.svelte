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
	import { useMeetingSession } from '$lib/composables/useMeetingSession.svelte';
	import { useMeetingPresence } from '$lib/composables/useMeetingPresence.svelte';
	import { api, type Id } from '$lib/convex';
	import { toast } from 'svelte-sonner';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { browser } from '$app/environment';
	import AgendaItemView from '$lib/components/meetings/AgendaItemView.svelte';
	import SecretarySelector from '$lib/components/meetings/SecretarySelector.svelte';
	import SecretaryConfirmationDialog from '$lib/components/meetings/SecretaryConfirmationDialog.svelte';

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
			<h1 class="text-2xl font-bold text-text-primary">Meetings Not Enabled</h1>
			<p class="mt-2 text-text-secondary">This feature is not enabled for your organization.</p>
		</div>
	</div>
{:else if session.isLoading}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-primary border-r-transparent"
			></div>
			<p class="mt-4 text-text-secondary">Loading meeting...</p>
		</div>
	</div>
{:else if session.error}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-red-600">Error Loading Meeting</h1>
			<p class="mt-2 text-text-secondary">{session.error.message}</p>
		</div>
	</div>
{:else if session.meeting}
	<div class="bg-surface-base flex h-screen flex-col overflow-hidden">
		<!-- Header -->
		<div
			class="flex items-center justify-between border-b border-border-base bg-elevated px-6 py-4"
		>
			<div class="flex items-center gap-4">
				<h1 class="text-xl font-semibold text-text-primary">{session.meeting.title}</h1>

				<!-- Secretary Selector - visible to everyone -->
				{#if session.meeting}
					<div class="flex items-center gap-2">
						<span class="text-sm text-text-tertiary">Secretary:</span>
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

			<div class="flex items-center gap-4">
				<!-- Timer -->
				{#if session.isStarted && !session.isClosed}
					<div class="flex items-center gap-2 text-text-secondary">
						<svg
							class="h-5 w-5"
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
						<span class="font-mono text-sm">{session.elapsedTimeFormatted}</span>
					</div>
				{/if}

				<!-- Start Meeting Button (Secretary only, before meeting starts) -->
				{#if session.isSecretary && !session.isStarted}
					<button
						onclick={handleStartMeeting}
						class="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
					>
						Start Meeting
					</button>
				{/if}

				<!-- Close Meeting Button (Secretary only, after meeting starts) -->
				{#if session.isSecretary && session.isStarted && !session.isClosed}
					<button
						onclick={handleCloseMeeting}
						class="rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
					>
						Close Meeting
					</button>
				{/if}

				<!-- Meeting Closed Badge -->
				{#if session.isClosed}
					<span class="rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700">
						Meeting Closed
					</span>
				{/if}
			</div>
		</div>

		<!-- Content Area -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Sidebar (Agenda) -->
			<div class="w-80 overflow-y-auto border-r border-border-base bg-elevated">
				<div class="p-4">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-sm font-semibold text-text-primary">Agenda</h2>
						{#if !session.isClosed}
							<button
								onclick={() => (state.isAddingAgenda = true)}
								class="text-sm font-medium text-accent-primary hover:text-accent-hover"
								title="Add agenda item"
							>
								+ Add
							</button>
						{/if}
					</div>

					<!-- Add Agenda Item Input -->
					{#if state.isAddingAgenda}
						<div class="mb-4">
							<input
								type="text"
								bind:value={state.newAgendaTitle}
								placeholder="Agenda item title"
								class="bg-surface-base w-full rounded-md border border-border-base px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
								onkeydown={(e) => {
									if (e.key === 'Enter') handleAddAgendaItem();
									if (e.key === 'Escape') {
										state.isAddingAgenda = false;
										state.newAgendaTitle = '';
									}
								}}
							/>
							<div class="mt-2 flex gap-2">
								<button
									onclick={handleAddAgendaItem}
									class="rounded-md bg-accent-primary px-3 py-1 text-xs font-medium text-white"
								>
									Add
								</button>
								<button
									onclick={() => {
										state.isAddingAgenda = false;
										state.newAgendaTitle = '';
									}}
									class="rounded-md border border-border-base px-3 py-1 text-xs font-medium text-text-secondary"
								>
									Cancel
								</button>
							</div>
						</div>
					{/if}

					<!-- Agenda Items - Split by Status -->
					{#if session.agendaItems.length === 0}
						<p class="text-sm text-text-tertiary">No agenda items yet</p>
					{:else}
						<!-- To Process Section -->
						{#if unprocessedItems.length > 0}
							<div class="mb-6">
								<h3 class="mb-2 text-xs font-semibold tracking-wider text-text-secondary uppercase">
									To Process ({unprocessedItems.length})
								</h3>
								<div class="space-y-2">
									{#each unprocessedItems as item (item._id)}
										<button
											onclick={() => session.isSecretary && (state.activeItemId = item._id)}
											disabled={!session.isSecretary}
											class="w-full rounded-md border px-nav-item py-nav-item text-left transition-colors {state.activeItemId ===
											item._id
												? 'border-accent-primary bg-accent-primary/10'
												: 'bg-surface-base border-border-base hover:border-accent-primary'} {!session.isSecretary
												? 'cursor-not-allowed opacity-50'
												: 'cursor-pointer'}"
											title={!session.isSecretary
												? 'Only the secretary can switch agenda items'
												: ''}
										>
											<p class="text-sm font-medium text-text-primary">{item.title}</p>
											<p class="mt-1 text-xs text-text-tertiary">
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
									class="mb-2 flex items-center gap-icon text-xs font-semibold tracking-wider text-text-tertiary uppercase"
								>
									<svg
										class="h-4 w-4"
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
								<div class="space-y-2">
									{#each processedItems as item (item._id)}
										<button
											onclick={() => session.isSecretary && (state.activeItemId = item._id)}
											disabled={!session.isSecretary}
											class="bg-surface-base w-full rounded-md border border-border-base px-nav-item py-nav-item text-left opacity-60 transition-colors hover:opacity-100 {!session.isSecretary
												? 'cursor-not-allowed'
												: 'cursor-pointer'}"
											title={!session.isSecretary
												? 'Only the secretary can switch agenda items'
												: ''}
										>
											<p class="text-sm font-medium text-text-tertiary">{item.title}</p>
											<p class="mt-1 text-xs text-text-tertiary">
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
								class="border-border-base px-6 py-3 text-sm font-medium transition-colors {session.currentStep ===
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
				<div class="flex-1 overflow-y-auto px-6 py-6 pb-32">
					{#if !session.isStarted}
						<!-- Before meeting starts -->
						<div class="text-center">
							<svg
								class="mx-auto h-12 w-12 text-text-tertiary"
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
							<h2 class="mt-4 text-lg font-semibold text-text-primary">Meeting Not Started</h2>
							<p class="mt-2 text-text-secondary">
								{session.isSecretary
									? 'Click "Start Meeting" to begin'
									: 'Waiting for facilitator to start the meeting'}
							</p>
						</div>
					{:else if session.isClosed}
						<!-- Meeting closed -->
						<div class="text-center">
							<svg
								class="mx-auto h-12 w-12 text-green-600"
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
							<h2 class="mt-4 text-lg font-semibold text-text-primary">Meeting Closed</h2>
							<p class="mt-2 text-text-secondary">
								This meeting has ended. Duration: {session.elapsedTimeFormatted}
							</p>
						</div>
					{:else if session.currentStep === 'check-in'}
						<!-- Check-in Step - Attendance Tracking (SYOS-227) -->
						<div>
							<h2 class="text-xl font-bold text-text-primary">Check-in</h2>
							<p class="mt-2 text-text-secondary">
								Everyone expresses how they feel and what is on their minds.
							</p>

							<!-- Attendance List -->
							<div class="mt-6">
								<h3 class="text-sm font-semibold text-text-primary">
									Attendance ({presence.activeCount}/{presence.expectedCount} present)
								</h3>

								{#if presence.combinedAttendance.length > 0}
									<div class="mt-4 space-y-2">
										{#each presence.combinedAttendance as attendee (attendee.userId)}
											<label
												class="bg-surface-base flex items-center gap-3 rounded-md border border-border-base p-3 transition-colors {attendee.isActive
													? 'border-accent-primary/30 bg-accent-primary/5'
													: ''}"
											>
												<!-- Checkbox (read-only, auto-checked for active users) -->
												<input
													type="checkbox"
													checked={attendee.isActive}
													disabled
													class="h-4 w-4 cursor-default rounded border-border-base text-accent-primary focus:ring-0 {attendee.isActive
														? 'opacity-100'
														: 'opacity-50'}"
												/>

												<!-- User Avatar -->
												<div
													class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium {attendee.isActive
														? 'bg-accent-primary text-white'
														: 'bg-surface-tertiary text-text-tertiary'}"
												>
													{attendee.name?.[0]?.toUpperCase() ?? '?'}
												</div>

												<!-- User Name -->
												<span
													class="flex-1 text-sm {attendee.isActive
														? 'font-medium text-text-primary'
														: 'text-text-secondary'}"
												>
													{attendee.name}
												</span>

												<!-- Guest Badge (for unexpected joiners) -->
												{#if !attendee.isExpected}
													<span
														class="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
													>
														Guest
													</span>
												{/if}

												<!-- Attendee Type Badge (for expected attendees) -->
												{#if attendee.isExpected && attendee.attendeeType}
													<span class="text-xs text-text-tertiary">
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
									<p class="mt-4 text-sm text-text-tertiary">No attendees registered yet</p>
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
										class="mx-auto h-12 w-12 text-text-tertiary"
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
									<h3 class="mt-4 text-lg font-semibold text-text-primary">No Agenda Items</h3>
									<p class="mt-2 text-text-secondary">Add items using the sidebar on the left</p>
								</div>
							</div>
						{:else if unprocessedItems.length === 0}
							<!-- All items processed - Completion state -->
							<div class="flex h-full items-center justify-center">
								<div class="text-center">
									<svg
										class="mx-auto h-16 w-16 text-green-600"
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
									<h3 class="mt-4 text-2xl font-bold text-text-primary">
										All Agenda Items Processed!
									</h3>
									<p class="mt-2 text-text-secondary">
										{processedItems.length}
										{processedItems.length === 1 ? 'item' : 'items'} completed
									</p>
									<p class="mt-4 text-sm text-text-tertiary">
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
							<h2 class="text-xl font-bold text-text-primary">Closing</h2>
							<p class="mt-2 text-text-secondary">Recap decisions, action items, and next steps.</p>
							<div class="mt-6">
								<div class="bg-surface-base rounded-lg border border-border-base p-6">
									<h3 class="font-semibold text-text-primary">Meeting Summary</h3>
									<div class="mt-4 space-y-2 text-sm text-text-secondary">
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

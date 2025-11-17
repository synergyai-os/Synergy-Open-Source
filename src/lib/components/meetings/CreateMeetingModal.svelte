<script lang="ts">
	/**
	 * CreateMeetingModal - Full meeting creation form
	 * Features: title, template, date/time, duration, recurrence, attendees, privacy
	 */

	import { Dialog } from 'bits-ui';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import { browser } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import type { Id } from '$lib/convex';
	import ToggleSwitch from '$lib/components/ui/ToggleSwitch.svelte';
	import AttendeeSelector from './AttendeeSelector.svelte';

	type Attendee = {
		type: 'user' | 'circle' | 'team';
		id: Id<'users'> | Id<'circles'> | Id<'teams'>;
		name: string;
		email?: string;
	};

	interface Props {
		open: boolean;
		onClose: () => void;
		organizationId: string;
		sessionId: string;
		circles?: Array<{ _id: Id<'circles'>; name: string }>;
	}

	let { open = $bindable(), onClose, organizationId, sessionId, circles = [] }: Props = $props();

	// Form state
	const state = $state({
		title: '',
		selectedTemplateId: '' as Id<'meetingTemplates'> | '',
		circleId: '' as Id<'circles'> | '',
		startDate: '',
		startTime: '',
		duration: 60,
		visibility: 'public' as 'public' | 'circle' | 'private',
		recurrenceEnabled: false,
		recurrence: {
			frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
			interval: 1,
			daysOfWeek: [] as number[],
			endDate: '' as string
		},
		selectedAttendees: [] as Attendee[]
	});

	// Fetch templates
	const templatesQuery =
		browser && organizationId && sessionId
			? useQuery(api.meetingTemplates.list, () => ({
					organizationId: organizationId as Id<'organizations'>,
					sessionId
				}))
			: null;

	const templates = $derived((templatesQuery?.data ?? []).filter((t) => t._id));

	// Get Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;

	// Helper: Parse date/time to timestamp
	function parseDateTime(date: string, time: string): number {
		return new Date(`${date}T${time}`).getTime();
	}

	// Helper: Get upcoming meeting dates for preview
	const upcomingMeetings = $derived.by(() => {
		if (!state.recurrenceEnabled || !state.startDate || !state.startTime) return [];

		const startTimestamp = parseDateTime(state.startDate, state.startTime);
		const upcoming: Date[] = [];
		const startDate = new Date(startTimestamp);
		const maxMeetings = 7; // Show 7 meetings to see full weekly pattern

		if (state.recurrence.frequency === 'weekly' && state.recurrence.daysOfWeek.length > 0) {
			const selectedDay = state.recurrence.daysOfWeek[0];
			const startDayOfWeek = startDate.getDay();

			// Always include start date as first meeting
			upcoming.push(new Date(startDate));

			// If start day differs from selected recurring day, add recurring instances
			if (startDayOfWeek !== selectedDay) {
				// Find first occurrence of selected day after start date
				let currentTime = startDate.getTime() + 24 * 60 * 60 * 1000; // Start from day after
				let currentDate = new Date(currentTime);

				// Find first matching day
				while (currentDate.getDay() !== selectedDay) {
					currentTime += 24 * 60 * 60 * 1000;
					currentDate = new Date(currentTime);
				}

				// Add next recurring meetings (we already have start date)
				for (let i = 0; i < maxMeetings - 1; i++) {
					upcoming.push(new Date(currentTime));
					currentTime += 7 * state.recurrence.interval * 24 * 60 * 60 * 1000;
				}
			} else {
				// Start day matches recurring day - just add next occurrences
				let currentTime = startDate.getTime();
				for (let i = 1; i < maxMeetings; i++) {
					currentTime += 7 * state.recurrence.interval * 24 * 60 * 60 * 1000;
					upcoming.push(new Date(currentTime));
				}
			}
		} else if (state.recurrence.frequency === 'daily') {
			// Daily: respect selected days (if any specified)
			if (state.recurrence.daysOfWeek.length > 0) {
				// Always include start date as first meeting
				upcoming.push(new Date(startDate));

				// Then find subsequent matching days
				let currentTime = startDate.getTime() + 24 * 60 * 60 * 1000; // Start from day after
				let count = 1; // Already have start date

				while (count < maxMeetings) {
					const currentDate = new Date(currentTime);
					const dayOfWeek = currentDate.getDay();
					if (state.recurrence.daysOfWeek.includes(dayOfWeek)) {
						upcoming.push(new Date(currentTime));
						count++;
					}
					currentTime += 24 * 60 * 60 * 1000;
				}
			} else {
				// No specific days - truly daily (every day)
				for (let i = 0; i < maxMeetings; i++) {
					const time = startDate.getTime() + i * state.recurrence.interval * 24 * 60 * 60 * 1000;
					upcoming.push(new Date(time));
				}
			}
		} else if (state.recurrence.frequency === 'monthly') {
			for (let i = 0; i < maxMeetings; i++) {
				// For monthly, we need to properly handle month boundaries
				const date = new Date(startDate.getTime());
				// Use setMonth which doesn't mutate if we create new instances each time
				const newDate = new Date(
					date.getFullYear(),
					date.getMonth() + i * state.recurrence.interval,
					date.getDate(),
					date.getHours(),
					date.getMinutes()
				);
				upcoming.push(newDate);
			}
		}

		return upcoming;
	});

	// Toggle day selection for recurrence
	function toggleDay(day: number) {
		if (state.recurrence.frequency === 'weekly') {
			// Weekly: single-select only (replace current selection)
			state.recurrence.daysOfWeek = [day];
		} else {
			// Daily: multi-select (toggle on/off)
			const index = state.recurrence.daysOfWeek.indexOf(day);
			if (index > -1) {
				state.recurrence.daysOfWeek.splice(index, 1);
			} else {
				state.recurrence.daysOfWeek.push(day);
			}
		}
	}

	// Helper message for weekly recurrence
	const weeklyScheduleMessage = $derived.by(() => {
		if (
			state.recurrence.frequency !== 'weekly' ||
			state.recurrence.daysOfWeek.length === 0 ||
			!state.startDate
		) {
			return null;
		}

		const startDate = new Date(state.startDate);
		const startDayOfWeek = startDate.getDay();
		const selectedDay = state.recurrence.daysOfWeek[0];

		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		const startDayName = dayNames[startDayOfWeek];
		const selectedDayName = dayNames[selectedDay];

		// Format start date
		const startDateFormatted = startDate.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});

		if (startDayOfWeek === selectedDay) {
			// Same day: recurring starts immediately
			return `Your meeting will repeat every ${selectedDayName}, starting ${startDateFormatted}.`;
		} else {
			// Different day: first on start date, then recurring on selected day
			// Find first occurrence of selected day after start date
			let currentTime = startDate.getTime() + 24 * 60 * 60 * 1000; // Start from next day
			let firstRecurrence = new Date(currentTime);

			while (firstRecurrence.getDay() !== selectedDay) {
				currentTime += 24 * 60 * 60 * 1000;
				firstRecurrence = new Date(currentTime);
			}

			const firstRecurrenceFormatted = firstRecurrence.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric'
			});

			return `First meeting on ${startDayName}, ${startDateFormatted}. Then recurring every ${selectedDayName}, starting ${firstRecurrenceFormatted}.`;
		}
	});

	// Helper message for daily recurrence
	const dailyScheduleMessage = $derived.by(() => {
		if (
			state.recurrence.frequency !== 'daily' ||
			state.recurrence.daysOfWeek.length === 0 ||
			!state.startDate
		) {
			return null;
		}

		const startDate = new Date(state.startDate);
		const startDayOfWeek = startDate.getDay();
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

		// Check if start date is today
		const today = new Date();
		const isToday =
			startDate.getDate() === today.getDate() &&
			startDate.getMonth() === today.getMonth() &&
			startDate.getFullYear() === today.getFullYear();

		// Get selected day names (create copy before sorting to avoid mutation)
		const selectedDayNames = [...state.recurrence.daysOfWeek]
			.sort((a, b) => a - b)
			.map((day) => dayNames[day]);

		// Format list: "Monday, Tuesday, and Wednesday"
		let dayList = '';
		if (selectedDayNames.length === 1) {
			dayList = selectedDayNames[0];
		} else if (selectedDayNames.length === 2) {
			dayList = `${selectedDayNames[0]} and ${selectedDayNames[1]}`;
		} else {
			const lastDay = selectedDayNames[selectedDayNames.length - 1];
			const otherDays = selectedDayNames.slice(0, -1).join(', ');
			dayList = `${otherDays}, and ${lastDay}`;
		}

		// Check if start date is in the selected pattern
		const startDayInPattern = state.recurrence.daysOfWeek.includes(startDayOfWeek);

		if (startDayInPattern) {
			// Start date IS in selected pattern
			return `Meeting repeats on ${dayList}.`;
		} else {
			// Start date NOT in selected pattern
			if (isToday) {
				return `Meeting starts today, then repeats on ${dayList}.`;
			} else {
				const startDayName = dayNames[startDayOfWeek];
				return `Meeting starts on ${startDayName}, then repeats on ${dayList}.`;
			}
		}
	});

	// Auto-select days based on frequency and start date
	$effect(() => {
		if (!state.recurrenceEnabled) return;

		if (state.recurrence.frequency === 'weekly' && state.startDate) {
			// Weekly: Pre-select day based on start date
			const startDate = new Date(state.startDate);
			const dayOfWeek = startDate.getDay();
			state.recurrence.daysOfWeek = [dayOfWeek];
		} else if (state.recurrence.frequency === 'daily') {
			// Daily: Pre-select weekdays (Mon-Fri = 1-5)
			state.recurrence.daysOfWeek = [1, 2, 3, 4, 5];
		}
	});

	// Submit form
	async function handleSubmit() {
		if (!state.title.trim()) {
			toast.error('Meeting title is required');
			return;
		}

		if (!state.startDate || !state.startTime) {
			toast.error('Please select start date and time');
			return;
		}

		try {
			const startTime = parseDateTime(state.startDate, state.startTime);

			const recurrence = state.recurrenceEnabled
				? {
						frequency: state.recurrence.frequency,
						interval: state.recurrence.interval,
						daysOfWeek:
							state.recurrence.frequency === 'weekly' || state.recurrence.frequency === 'daily'
								? state.recurrence.daysOfWeek.length > 0
									? state.recurrence.daysOfWeek
									: undefined
								: undefined,
						endDate: state.recurrence.endDate
							? new Date(state.recurrence.endDate).getTime()
							: undefined
					}
				: undefined;

			const result = await convexClient?.mutation(api.meetings.create, {
				sessionId,
				organizationId: organizationId as Id<'organizations'>,
				circleId: state.circleId || undefined,
				templateId: state.selectedTemplateId || undefined,
				title: state.title,
				startTime,
				duration: state.duration,
				visibility: state.visibility,
				recurrence
			});

			// Add attendees after meeting creation
			const meetingId = result?.meetingId;
			if (meetingId && state.selectedAttendees.length > 0) {
				for (const attendee of state.selectedAttendees) {
					try {
						await convexClient?.mutation(api.meetings.addAttendee, {
							sessionId,
							meetingId: meetingId as Id<'meetings'>,
							attendeeType: attendee.type,
							userId: attendee.type === 'user' ? (attendee.id as Id<'users'>) : undefined,
							circleId: attendee.type === 'circle' ? (attendee.id as Id<'circles'>) : undefined,
							teamId: attendee.type === 'team' ? (attendee.id as Id<'teams'>) : undefined
						});
					} catch (error) {
						console.error(`Failed to add attendee ${attendee.name}:`, error);
						// Continue with other attendees even if one fails
					}
				}
			}

			toast.success('Meeting created successfully');
			resetForm();
			onClose();
		} catch (error) {
			console.error('Failed to create meeting:', error);
			toast.error('Failed to create meeting');
		}
	}

	// Reset form
	function resetForm() {
		state.title = '';
		state.selectedTemplateId = '';
		state.circleId = '';
		state.startDate = '';
		state.startTime = '';
		state.duration = 60;
		state.visibility = 'public';
		state.recurrenceEnabled = false;
		state.recurrence = {
			frequency: 'weekly',
			interval: 1,
			daysOfWeek: [],
			endDate: ''
		};
		state.selectedAttendees = [];
	}

	// Set default date/time when modal opens
	$effect(() => {
		if (open && !state.startDate) {
			const now = new Date();
			state.startDate = now.toISOString().split('T')[0];
			state.startTime = now.toTimeString().slice(0, 5);
		}
	});

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<Dialog.Root {open} onOpenChange={(value) => !value && onClose()}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
		/>
		<Dialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 max-h-[90vh] w-[min(800px,90vw)] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg border border-base bg-elevated text-text-primary shadow-xl"
		>
			<div class="space-y-6 p-6">
				<!-- Header -->
				<div class="flex items-center justify-between">
					<Dialog.Title class="text-xl font-semibold">Add meeting</Dialog.Title>
					<button
						onclick={onClose}
						class="rounded-md p-1 text-text-tertiary transition-colors hover:text-text-primary"
						aria-label="Close"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<!-- Form -->
				<form onsubmit={(e) => (e.preventDefault(), handleSubmit())} class="space-y-6">
					<div class="grid grid-cols-3 gap-6">
						<!-- Left Column (2/3) -->
						<div class="col-span-2 space-y-4">
							<!-- Title -->
							<div>
								<label for="title" class="mb-2 block text-sm font-medium text-text-primary"
									>Title</label
								>
								<input
									id="title"
									type="text"
									bind:value={state.title}
									class="bg-surface-base w-full rounded-md border border-border-base px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
									placeholder="Meeting title"
								/>
							</div>

							<!-- Template (Optional) -->
							<div>
								<label for="template" class="mb-2 block text-sm font-medium text-text-primary">
									Template <span class="text-text-tertiary">(optional)</span>
								</label>
								<select
									id="template"
									bind:value={state.selectedTemplateId}
									class="bg-surface-base w-full rounded-md border border-border-base px-3 py-2 text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
								>
									<option value="">
										{templates.length === 0
											? 'No templates available (none)'
											: 'None (ad-hoc meeting)'}
									</option>
									{#each templates as template (template._id)}
										<option value={template._id}>{template.name}</option>
									{/each}
								</select>
							</div>

							<!-- Circle (Optional) -->
							{#if circles.length > 0}
								<div>
									<label for="circle" class="mb-2 block text-sm font-medium text-text-primary"
										>Circle (optional)</label
									>
									<select
										id="circle"
										bind:value={state.circleId}
										class="bg-surface-base w-full rounded-md border border-border-base px-3 py-2 text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
									>
										<option value="">Ad-hoc meeting (no circle)</option>
										{#each circles as circle (circle._id)}
											<option value={circle._id}>{circle.name}</option>
										{/each}
									</select>
								</div>
							{/if}

							<!-- Start Date/Time -->
							<div>
								<fieldset class="mb-2">
									<legend class="block text-sm font-medium text-text-primary">Start date</legend>
									<div class="grid grid-cols-3 gap-2">
										<div class="col-span-1">
											<label for="meeting-start-date" class="sr-only">Date</label>
											<input
												id="meeting-start-date"
												type="date"
												bind:value={state.startDate}
												class="bg-surface-base w-full rounded-md border border-border-base px-3 py-2 text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
											/>
										</div>
										<div class="col-span-1">
											<label for="meeting-start-time" class="sr-only">Time</label>
											<input
												id="meeting-start-time"
												type="time"
												bind:value={state.startTime}
												class="bg-surface-base w-full rounded-md border border-border-base px-3 py-2 text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
											/>
										</div>
										<div class="col-span-1 flex items-center gap-2">
											<label for="meeting-duration" class="sr-only">Duration (minutes)</label>
											<input
												id="meeting-duration"
												type="number"
												bind:value={state.duration}
												min="5"
												max="480"
												class="bg-surface-base w-20 rounded-md border border-border-base px-3 py-2 text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
											/>
											<span class="text-sm text-text-secondary">minutes</span>
										</div>
									</div>
								</fieldset>
							</div>

							<!-- Recurrence -->
							<div class="space-y-4">
								<div class="flex items-center gap-3">
									<ToggleSwitch
										checked={state.recurrenceEnabled}
										onChange={(checked) => (state.recurrenceEnabled = checked)}
									/>
									<span class="text-sm font-medium text-text-primary">Repeat this meeting</span>
								</div>

								{#if state.recurrenceEnabled}
									<div class="space-y-4 border-l-2 border-accent-primary pl-4">
										<!-- Frequency -->
										<div class="flex items-center gap-2">
											<span class="text-sm text-text-secondary">Every</span>
											<input
												type="number"
												bind:value={state.recurrence.interval}
												min="1"
												max="99"
												class="bg-surface-base w-16 rounded-md border border-border-base px-2 py-1 text-sm text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
											/>
											<select
												bind:value={state.recurrence.frequency}
												class="bg-surface-base rounded-md border border-border-base px-3 py-1 text-sm text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
											>
												<option value="daily">Day(s)</option>
												<option value="weekly">Week(s)</option>
												<option value="monthly">Month(s)</option>
											</select>
										</div>

										<!-- Days of Week (for weekly and daily) -->
										{#if state.recurrence.frequency === 'weekly' || state.recurrence.frequency === 'daily'}
											<div>
												<span class="mb-2 block text-sm text-text-secondary">On</span>
												<div class="flex gap-2">
													{#each dayNames as day, index (index)}
														{@const isSelected = state.recurrence.daysOfWeek.includes(index)}
														<button
															type="button"
															onclick={() => toggleDay(index)}
															class="flex h-10 w-10 items-center justify-center rounded-md border text-sm transition-colors {isSelected
																? 'border-accent-primary bg-accent-primary text-white'
																: 'bg-surface-base hover:bg-surface-hover border-border-base text-text-secondary'}"
														>
															{day}
														</button>
													{/each}
												</div>

												<!-- Schedule Helper Messages -->
												{#if weeklyScheduleMessage}
													<div
														class="mt-2 flex items-start gap-2 rounded-md border border-base bg-surface p-3 text-xs text-secondary"
													>
														<span class="text-base">💡</span>
														<span>{weeklyScheduleMessage}</span>
													</div>
												{:else if dailyScheduleMessage}
													<div
														class="mt-2 flex items-start gap-2 rounded-md border border-base bg-surface p-3 text-xs text-secondary"
													>
														<span class="text-base">💡</span>
														<span>{dailyScheduleMessage}</span>
													</div>
												{/if}
											</div>
										{/if}

										<!-- Upcoming Meetings Preview -->
										{#if upcomingMeetings.length > 0}
											<div>
												<span class="mb-2 block text-sm text-text-secondary"
													>Upcoming {upcomingMeetings.length} Meetings</span
												>
												<div class="flex gap-2">
													{#each upcomingMeetings as date (date.getTime())}
														<div class="bg-surface-tertiary rounded-md px-3 py-2 text-center">
															<div class="text-xs font-medium text-accent-primary">
																{date.toLocaleDateString('en-US', { month: 'short' })}
															</div>
															<div class="text-sm font-medium text-text-primary">
																{date.getDate()}
															</div>
															<div class="text-xs text-text-secondary">
																{date.getFullYear()}
															</div>
														</div>
													{/each}
												</div>
											</div>
										{/if}

										<!-- Info message -->
										<div
											class="flex items-start gap-2 rounded-md border border-base bg-surface p-3 text-xs text-secondary"
										>
											<span class="text-base">ℹ️</span>
											<span
												>The recurrence has no end: the next {upcomingMeetings.length} meetings are shown
												to preview the pattern. Additional ones will appear as they occur.</span
											>
										</div>
									</div>
								{/if}
							</div>

							<!-- Attendees -->
							<AttendeeSelector
								bind:selectedAttendees={state.selectedAttendees}
								onAttendeesChange={(attendees) => {
									state.selectedAttendees = attendees;
								}}
								organizationId={organizationId as Id<'organizations'>}
								{sessionId}
							/>
						</div>

						<!-- Right Column (1/3) -->
						<div class="space-y-4">
							<!-- Privacy -->
							<div>
								<fieldset>
									<legend class="mb-2 block text-sm font-medium text-text-primary">Privacy</legend>
									<div class="space-y-2">
										<label class="flex items-start gap-3">
											<input
												type="radio"
												bind:group={state.visibility}
												value="public"
												class="mt-0.5"
											/>
											<div>
												<div class="text-sm font-medium text-text-primary">Public</div>
												<div class="text-xs text-text-secondary">
													All organization members can see this meeting and access to the report
												</div>
											</div>
										</label>
										<label class="flex items-start gap-3">
											<input
												type="radio"
												bind:group={state.visibility}
												value="private"
												class="mt-0.5"
											/>
											<div>
												<div class="text-sm font-medium text-text-primary">Private</div>
												<div class="text-xs text-text-secondary">
													Only invited attendees can see this meeting
												</div>
											</div>
										</label>
									</div>
								</fieldset>
							</div>
						</div>
					</div>

					<!-- Actions -->
					<div class="border-border-subtle flex justify-end gap-3 border-t pt-4">
						<button
							type="button"
							onclick={onClose}
							class="hover:bg-surface-hover rounded-md border border-border-base px-4 py-2 text-sm font-medium text-text-secondary transition-colors"
						>
							Close
						</button>
						<button
							type="submit"
							class="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
						>
							Schedule
						</button>
					</div>
				</form>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

/**
 * Meeting Form Composable
 *
 * SYOS-469: Extracts form state, data fetching, and business logic from CreateMeetingModal component
 *
 * Features:
 * - Fetches meeting templates for organization
 * - Form state management (title, template, date/time, duration, recurrence, attendees, privacy)
 * - Complex recurrence logic (~200 lines)
 * - Date parsing and validation
 * - Submit logic (create meeting + add attendees)
 * - Helper functions (formatDate, schedule messages, etc.)
 */

import { browser } from '$app/environment';
import { useConvexClient, useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { toast } from 'svelte-sonner';

type Attendee = {
	type: 'user' | 'circle';
	id: Id<'users'> | Id<'circles'>;
	name: string;
	email?: string;
};

interface UseMeetingFormParams {
	organizationId: () => string;
	sessionId: () => string | undefined;
	circles?: () => Array<{ _id: Id<'circles'>; name: string }>;
	onSuccess?: () => void;
}

export interface UseMeetingFormReturn {
	// Data
	get templates(): Array<{ _id: Id<'meetingTemplates'>; name: string }>;
	get isLoading(): boolean;

	// Form state (getters + setters)
	get title(): string;
	set title(value: string);
	get selectedTemplateId(): Id<'meetingTemplates'> | '';
	set selectedTemplateId(value: Id<'meetingTemplates'> | '');
	get circleId(): Id<'circles'> | '';
	set circleId(value: Id<'circles'> | '');
	get startDate(): string;
	set startDate(value: string);
	get startTime(): string;
	set startTime(value: string);
	get duration(): number;
	set duration(value: number);
	get visibility(): 'public' | 'circle' | 'private';
	set visibility(value: 'public' | 'circle' | 'private');
	get recurrenceEnabled(): boolean;
	set recurrenceEnabled(value: boolean);
	get recurrenceFrequency(): 'daily' | 'weekly' | 'monthly';
	set recurrenceFrequency(value: 'daily' | 'weekly' | 'monthly');
	get recurrenceInterval(): number;
	set recurrenceInterval(value: number);
	get recurrenceDaysOfWeek(): string[];
	set recurrenceDaysOfWeek(value: string[]);
	get recurrenceEndDate(): string;
	set recurrenceEndDate(value: string);
	get selectedAttendees(): Attendee[];
	set selectedAttendees(value: Attendee[]);

	// Computed values
	get upcomingMeetings(): Date[];
	get weeklyScheduleMessage(): string | null;
	get dailyScheduleMessage(): string | null;

	// Actions
	handleSubmit: () => Promise<void>;
	resetForm: () => void;
	initializeDefaultDateTime: () => void;
}

export function useMeetingForm(params: UseMeetingFormParams): UseMeetingFormReturn {
	// Get Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;

	// Fetch templates
	const templatesQuery =
		browser && params.organizationId() && params.sessionId()
			? useQuery(api.meetingTemplates.list, () => {
					const sessionId = params.sessionId();
					if (!sessionId) throw new Error('sessionId required');
					return {
						organizationId: params.organizationId() as Id<'organizations'>,
						sessionId
					};
				})
			: null;

	const templates = $derived((templatesQuery?.data ?? []).filter((t) => t._id));
	const isLoading = $derived(templatesQuery?.isLoading ?? false);

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
			daysOfWeek: [] as string[],
			endDate: '' as string
		},
		selectedAttendees: [] as Attendee[]
	});

	// Helper: Parse date/time to timestamp
	function parseDateTime(date: string, time: string): number {
		// Use Date constructor to parse date/time (not mutated, immediately converted to timestamp)
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		return new Date(`${date}T${time}`).getTime();
	}

	// Helper: Get upcoming meeting dates for preview
	const upcomingMeetings = $derived.by(() => {
		if (!state.recurrenceEnabled || !state.startDate || !state.startTime) return [];

		const startTimestamp = parseDateTime(state.startDate, state.startTime);
		const upcoming: Date[] = [];
		// Use Date constructor to create date instances (not mutated, used for calculations)
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const startDate = new Date(startTimestamp);
		const maxMeetings = 7; // Show 7 meetings to see full weekly pattern

		if (state.recurrence.frequency === 'weekly' && state.recurrence.daysOfWeek.length > 0) {
			const selectedDay = parseInt(state.recurrence.daysOfWeek[0], 10);
			const startDayOfWeek = startDate.getDay();

			// Always include start date as first meeting
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			upcoming.push(new Date(startDate));

			// If start day differs from selected recurring day, add recurring instances
			if (startDayOfWeek !== selectedDay) {
				// Find first occurrence of selected day after start date
				let currentTime = startDate.getTime() + 24 * 60 * 60 * 1000; // Start from day after
				// eslint-disable-next-line svelte/prefer-svelte-reactivity
				let currentDate = new Date(currentTime);

				// Find first matching day
				while (currentDate.getDay() !== selectedDay) {
					currentTime += 24 * 60 * 60 * 1000;
					// eslint-disable-next-line svelte/prefer-svelte-reactivity
					currentDate = new Date(currentTime);
				}

				// Add next recurring meetings (we already have start date)
				for (let i = 0; i < maxMeetings - 1; i++) {
					// eslint-disable-next-line svelte/prefer-svelte-reactivity
					upcoming.push(new Date(currentTime));
					currentTime += 7 * state.recurrence.interval * 24 * 60 * 60 * 1000;
				}
			} else {
				// Start day matches recurring day - just add next occurrences
				let currentTime = startDate.getTime();
				for (let i = 1; i < maxMeetings; i++) {
					currentTime += 7 * state.recurrence.interval * 24 * 60 * 60 * 1000;
					// eslint-disable-next-line svelte/prefer-svelte-reactivity
					upcoming.push(new Date(currentTime));
				}
			}
		} else if (state.recurrence.frequency === 'daily') {
			// Daily: respect selected days (if any specified)
			if (state.recurrence.daysOfWeek.length > 0) {
				// Always include start date as first meeting
				// eslint-disable-next-line svelte/prefer-svelte-reactivity
				upcoming.push(new Date(startDate));

				// Then find subsequent matching days
				let currentTime = startDate.getTime() + 24 * 60 * 60 * 1000; // Start from day after
				let count = 1; // Already have start date

				while (count < maxMeetings) {
					// eslint-disable-next-line svelte/prefer-svelte-reactivity
					const currentDate = new Date(currentTime);
					const dayOfWeek = currentDate.getDay();
					if (state.recurrence.daysOfWeek.includes(dayOfWeek.toString())) {
						// eslint-disable-next-line svelte/prefer-svelte-reactivity
						upcoming.push(new Date(currentTime));
						count++;
					}
					currentTime += 24 * 60 * 60 * 1000;
				}
			} else {
				// No specific days - truly daily (every day)
				for (let i = 0; i < maxMeetings; i++) {
					const time = startDate.getTime() + i * state.recurrence.interval * 24 * 60 * 60 * 1000;
					// eslint-disable-next-line svelte/prefer-svelte-reactivity
					upcoming.push(new Date(time));
				}
			}
		} else if (state.recurrence.frequency === 'monthly') {
			for (let i = 0; i < maxMeetings; i++) {
				// For monthly, we need to properly handle month boundaries
				// Use Date constructor which doesn't mutate if we create new instances each time
				// eslint-disable-next-line svelte/prefer-svelte-reactivity
				const date = new Date(startDate.getTime());
				// eslint-disable-next-line svelte/prefer-svelte-reactivity
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

	// Helper message for weekly recurrence
	const weeklyScheduleMessage = $derived.by(() => {
		if (
			state.recurrence.frequency !== 'weekly' ||
			state.recurrence.daysOfWeek.length === 0 ||
			!state.startDate
		) {
			return null;
		}

		// Use Date constructor to parse start date (not mutated, only used for display)
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const startDate = new Date(state.startDate);
		const startDayOfWeek = startDate.getDay();
		const selectedDay = parseInt(state.recurrence.daysOfWeek[0], 10);

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
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			let firstRecurrence = new Date(currentTime);

			while (firstRecurrence.getDay() !== selectedDay) {
				currentTime += 24 * 60 * 60 * 1000;
				// eslint-disable-next-line svelte/prefer-svelte-reactivity
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

		// Use Date constructor to parse start date (not mutated, only used for display)
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const startDate = new Date(state.startDate);
		const startDayOfWeek = startDate.getDay();
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

		// Check if start date is today
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const today = new Date();
		const isToday =
			startDate.getDate() === today.getDate() &&
			startDate.getMonth() === today.getMonth() &&
			startDate.getFullYear() === today.getFullYear();

		// Get selected day names (create copy before sorting to avoid mutation)
		const selectedDayNames = [...state.recurrence.daysOfWeek]
			.map((day) => parseInt(day, 10))
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
		const startDayInPattern = state.recurrence.daysOfWeek.includes(startDayOfWeek.toString());

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
									? state.recurrence.daysOfWeek.map((day) => parseInt(day, 10))
									: undefined
								: undefined,
						endDate: state.recurrence.endDate
							? // Use Date constructor to parse end date (not mutated, immediately converted to timestamp)
								// eslint-disable-next-line svelte/prefer-svelte-reactivity
								new Date(state.recurrence.endDate).getTime()
							: undefined
					}
				: undefined;

			const result = await convexClient?.mutation(api.meetings.create, {
				sessionId: params.sessionId()!,
				organizationId: params.organizationId() as Id<'organizations'>,
				circleId: state.circleId || undefined,
				templateId: state.selectedTemplateId || undefined,
				meetingType: 'general', // TODO: Phase 3 - Replace with form state when stepper is integrated
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
							sessionId: params.sessionId()!,
							meetingId: meetingId as Id<'meetings'>,
							attendeeType: attendee.type,
							userId: attendee.type === 'user' ? (attendee.id as Id<'users'>) : undefined,
							circleId: attendee.type === 'circle' ? (attendee.id as Id<'circles'>) : undefined
						});
					} catch (error) {
						console.error(`Failed to add attendee ${attendee.name}:`, error);
						// Continue with other attendees even if one fails
					}
				}
			}

			toast.success('Meeting created successfully');
			resetForm();
			params.onSuccess?.();
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
			daysOfWeek: [] as string[],
			endDate: ''
		};
		state.selectedAttendees = [];
	}

	// Set default date/time
	function initializeDefaultDateTime() {
		if (!state.startDate) {
			// Use Date constructor to create default date/time (not mutated, immediately converted to strings)
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const now = new Date();
			state.startDate = now.toISOString().split('T')[0];
			state.startTime = now.toTimeString().slice(0, 5);
		}
	}

	// Auto-select days based on frequency and start date
	$effect(() => {
		if (!state.recurrenceEnabled) return;

		if (state.recurrence.frequency === 'weekly' && state.startDate) {
			// Weekly: Pre-select day based on start date
			// Use Date constructor to parse start date (not mutated, only used for display)
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const startDate = new Date(state.startDate);
			const dayOfWeek = startDate.getDay();
			state.recurrence.daysOfWeek = [dayOfWeek.toString()];
		} else if (state.recurrence.frequency === 'daily') {
			// Daily: Pre-select weekdays (Mon-Fri = 1-5)
			state.recurrence.daysOfWeek = ['1', '2', '3', '4', '5'];
		}
	});

	return {
		// Data
		get templates() {
			return templates;
		},
		get isLoading() {
			return isLoading;
		},

		// Form state (getters + setters)
		get title() {
			return state.title;
		},
		set title(value: string) {
			state.title = value;
		},
		get selectedTemplateId() {
			return state.selectedTemplateId;
		},
		set selectedTemplateId(value: Id<'meetingTemplates'> | '') {
			state.selectedTemplateId = value;
		},
		get circleId() {
			return state.circleId;
		},
		set circleId(value: Id<'circles'> | '') {
			state.circleId = value;
		},
		get startDate() {
			return state.startDate;
		},
		set startDate(value: string) {
			state.startDate = value;
		},
		get startTime() {
			return state.startTime;
		},
		set startTime(value: string) {
			state.startTime = value;
		},
		get duration() {
			return state.duration;
		},
		set duration(value: number) {
			state.duration = value;
		},
		get visibility() {
			return state.visibility;
		},
		set visibility(value: 'public' | 'circle' | 'private') {
			state.visibility = value;
		},
		get recurrenceEnabled() {
			return state.recurrenceEnabled;
		},
		set recurrenceEnabled(value: boolean) {
			state.recurrenceEnabled = value;
		},
		get recurrenceFrequency() {
			return state.recurrence.frequency;
		},
		set recurrenceFrequency(value: 'daily' | 'weekly' | 'monthly') {
			state.recurrence.frequency = value;
		},
		get recurrenceInterval() {
			return state.recurrence.interval;
		},
		set recurrenceInterval(value: number) {
			state.recurrence.interval = value;
		},
		get recurrenceDaysOfWeek() {
			return state.recurrence.daysOfWeek;
		},
		set recurrenceDaysOfWeek(value: string[]) {
			state.recurrence.daysOfWeek = value;
		},
		get recurrenceEndDate() {
			return state.recurrence.endDate;
		},
		set recurrenceEndDate(value: string) {
			state.recurrence.endDate = value;
		},
		get selectedAttendees() {
			return state.selectedAttendees;
		},
		set selectedAttendees(value: Attendee[]) {
			state.selectedAttendees = value;
		},

		// Computed values
		get upcomingMeetings() {
			return upcomingMeetings;
		},
		get weeklyScheduleMessage() {
			return weeklyScheduleMessage;
		},
		get dailyScheduleMessage() {
			return dailyScheduleMessage;
		},

		// Actions
		handleSubmit,
		resetForm,
		initializeDefaultDateTime
	};
}

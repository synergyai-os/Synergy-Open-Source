/**
 * Meetings Composable - Reactive meeting data management
 *
 * Handles:
 * - Fetching meetings for workspace
 * - Filtering by today/future/circle
 * - Real-time updates via useQuery
 */

import { useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';
import { browser } from '$app/environment';
import { invariant } from '$lib/utils/invariant';

interface UseMeetingsOptions {
	workspaceId: () => string | undefined;
	sessionId: () => string | undefined;
	circleFilter?: () => string | undefined;
}

interface Meeting {
	_id: Id<'meetings'> | string; // Synthetic ID for React keys (recurring instances)
	originalMeetingId?: Id<'meetings'>; // Real Convex ID for navigation/queries
	_creationTime: number;
	workspaceId: Id<'workspaces'> | string;
	circleId?: Id<'circles'> | string;
	templateId?: Id<'meetingTemplates'> | string;
	title: string;
	startTime: number;
	duration: number;
	visibility: 'public' | 'private';
	recurrence?: {
		frequency: 'daily' | 'weekly' | 'monthly';
		interval: number;
		daysOfWeek?: number[];
		endDate?: number;
	};
	attendeeCount?: number;
	invitedUsers?: Array<{ personId: string; name: string }>; // Invited users for display
	createdAt: number;
	createdByPersonId: Id<'people'> | string;
	updatedAt: number;
	closedAt?: number; // Meeting session closed timestamp
	viewerPersonId?: Id<'people'> | string;
	recorderPersonId?: Id<'people'> | string;
}

export function useMeetings(options: UseMeetingsOptions) {
	const { workspaceId, sessionId, circleFilter } = options;

	// Fetch meetings for user (already filtered by permissions in backend)
	const meetingsQuery =
		browser && workspaceId() && sessionId()
			? useQuery(api.features.meetings.meetings.listForUser, () => {
					const orgId = workspaceId();
					const session = sessionId();
					// Throw if not ready yet (outer check ensures they exist)
					invariant(orgId && session, 'workspaceId and sessionId required');
					return {
						workspaceId: orgId as Id<'workspaces'>,
						sessionId: session
					};
				})
			: null;

	// Derived: Filter meetings by today/this week/future and circle
	const state = $state({
		todayMeetings: [] as Meeting[],
		thisWeekMeetings: [] as Meeting[],
		futureMeetings: [] as Meeting[],
		closedMeetings: [] as Meeting[]
	});

	// Helper: Get day of week from timestamp (0 = Sunday, 6 = Saturday)
	function getDayOfWeek(timestamp: number): number {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		return new Date(timestamp).getDay();
	}

	// Helper: Generate future occurrences for recurring meetings
	// Shows next 2 weeks (14 days) or 10 instances, whichever comes first
	// Note: Does NOT include the original meeting - only generates future instances
	function generateRecurringInstances(meeting: Meeting): Meeting[] {
		if (!meeting.recurrence) return [meeting];

		const instances: Meeting[] = [];
		const { frequency, interval, daysOfWeek, endDate } = meeting.recurrence;
		const now = Date.now();
		const twoWeeksFromNow = now + 14 * 24 * 60 * 60 * 1000; // 2 weeks
		const maxEndDate = endDate ? Math.min(endDate, twoWeeksFromNow) : twoWeeksFromNow;
		const maxInstances = 10; // Max 10 future occurrences

		// Start from the original meeting time, but we'll calculate the next occurrence first
		let currentTime = meeting.startTime;
		let instanceCount = 0;

		// Helper to calculate next occurrence
		function calculateNextOccurrence(time: number): number {
			if (frequency === 'daily') {
				// If specific days are set, find next matching day
				if (daysOfWeek && daysOfWeek.length > 0) {
					let nextTime = time + 24 * 60 * 60 * 1000; // Start from next day
					let daysChecked = 0;
					while (daysChecked < 7 && !daysOfWeek.includes(getDayOfWeek(nextTime))) {
						nextTime += 24 * 60 * 60 * 1000;
						daysChecked++;
					}
					return nextTime;
				} else {
					// No specific days - truly every day
					return time + interval * 24 * 60 * 60 * 1000;
				}
			} else if (frequency === 'weekly') {
				// For weekly, advance by interval weeks
				// Always advance at least 7 days to ensure we skip to next week
				let nextTime = time + 7 * interval * 24 * 60 * 60 * 1000;

				// If specific days are set, find next matching day
				// But ensure we've advanced at least one day from the original time
				if (daysOfWeek && daysOfWeek.length > 0) {
					// If we're still on the same day, advance one more day first
					if (getDayOfWeek(nextTime) === getDayOfWeek(time)) {
						nextTime += 24 * 60 * 60 * 1000;
					}
					let daysChecked = 0;
					while (daysChecked < 7 && !daysOfWeek.includes(getDayOfWeek(nextTime))) {
						nextTime += 24 * 60 * 60 * 1000;
						daysChecked++;
					}
				}
				return nextTime;
			} else if (frequency === 'monthly') {
				// For monthly, properly handle month boundaries
				// eslint-disable-next-line svelte/prefer-svelte-reactivity
				const date = new Date(time);
				// eslint-disable-next-line svelte/prefer-svelte-reactivity
				const newDate = new Date(
					date.getFullYear(),
					date.getMonth() + interval,
					date.getDate(),
					date.getHours(),
					date.getMinutes()
				);
				return newDate.getTime();
			}
			return time;
		}

		// Calculate first occurrence (skip the original if it's in the past)
		// If original meeting is today or future, include it; otherwise start from next occurrence
		// Use todayStart for accurate day comparison (not 24-hour window)
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const nowDate = new Date(now);
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const todayStart = new Date(
			nowDate.getFullYear(),
			nowDate.getMonth(),
			nowDate.getDate(),
			0,
			0,
			0,
			0
		).getTime();

		if (currentTime >= todayStart) {
			// Original meeting is today or future - include it
			instances.push({
				...meeting,
				startTime: currentTime,
				// Use original ID for the first instance (today's meeting)
				_id: meeting._id,
				// Store original Convex ID for navigation/queries
				originalMeetingId: meeting._id as Id<'meetings'>
			});
			instanceCount++;
			// Calculate next occurrence (this will skip to next week/day)
			currentTime = calculateNextOccurrence(currentTime);
		} else {
			// Original meeting is in the past - start from next occurrence
			currentTime = calculateNextOccurrence(currentTime);
		}

		// Generate future instances
		while (currentTime <= maxEndDate && instanceCount < maxInstances) {
			instances.push({
				...meeting,
				startTime: currentTime,
				// Synthetic ID for React keys (unique per occurrence)
				_id: `${meeting._id}_${currentTime}`,
				// Store original Convex ID for navigation/queries
				originalMeetingId: meeting._id as Id<'meetings'>
			});
			instanceCount++;
			currentTime = calculateNextOccurrence(currentTime);

			// Safety check to prevent infinite loop
			if (currentTime <= meeting.startTime) break;
		}

		return instances;
	}

	// Update filtered meetings when query data changes
	$effect(() => {
		const meetings = (meetingsQuery?.data ?? []) as Meeting[];
		const circleId = circleFilter?.();

		// Separate active and closed meetings
		let activeMeetings = meetings.filter((m) => !m.closedAt);
		let closedMeetings = meetings.filter((m) => m.closedAt);

		// Filter by circle if specified
		if (circleId) {
			activeMeetings = activeMeetings.filter((m) => m.circleId === circleId);
			closedMeetings = closedMeetings.filter((m) => m.circleId === circleId);
		}

		// Expand recurring meetings into individual instances (active only)
		const expandedMeetings: Meeting[] = [];
		for (const meeting of activeMeetings) {
			const instances = generateRecurringInstances(meeting);
			expandedMeetings.push(...instances);
		}

		// Get today's date boundaries (local timezone)
		// Use local timezone to ensure correct day boundaries
		const now = Date.now();
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const todayDate = new Date(now);
		// Set to start of today in local timezone (midnight)
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const todayStart = new Date(
			todayDate.getFullYear(),
			todayDate.getMonth(),
			todayDate.getDate(),
			0, // hours
			0, // minutes
			0, // seconds
			0 // milliseconds
		).getTime();
		const todayEnd = todayStart + 24 * 60 * 60 * 1000;

		// Get end of week (Sunday)
		const dayOfWeek = todayDate.getDay();
		const daysUntilSunday = 7 - dayOfWeek;
		const endOfWeek = todayStart + daysUntilSunday * 24 * 60 * 60 * 1000;

		// Split into today, this week, and future
		state.todayMeetings = expandedMeetings
			.filter((m) => m.startTime >= todayStart && m.startTime < todayEnd)
			.sort((a, b) => a.startTime - b.startTime);

		state.thisWeekMeetings = expandedMeetings
			.filter((m) => m.startTime >= todayEnd && m.startTime < endOfWeek)
			.sort((a, b) => a.startTime - b.startTime);

		state.futureMeetings = expandedMeetings
			.filter((m) => m.startTime >= endOfWeek)
			.sort((a, b) => a.startTime - b.startTime);

		// Sort closed meetings by closedAt (most recent first)
		state.closedMeetings = closedMeetings.sort((a, b) => (b.closedAt ?? 0) - (a.closedAt ?? 0));
	});

	return {
		get todayMeetings() {
			return state.todayMeetings;
		},
		get thisWeekMeetings() {
			return state.thisWeekMeetings;
		},
		get futureMeetings() {
			return state.futureMeetings;
		},
		get closedMeetings() {
			return state.closedMeetings;
		},
		get isLoading() {
			return meetingsQuery?.isLoading ?? true;
		},
		get error() {
			return meetingsQuery?.error;
		}
	};
}

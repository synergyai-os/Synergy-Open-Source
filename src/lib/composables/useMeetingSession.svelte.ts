/**
 * Meeting Session Composable - Real-time meeting state management
 *
 * Handles:
 * - Real-time meeting state (startedAt, currentStep, closedAt)
 * - Real-time agenda items (anyone can add)
 * - Timer calculation (elapsed time)
 * - Secretary actions (start, advance, close)
 *
 * Pattern: Single $state object with getters (Svelte 5)
 */

import { useQuery, useConvexClient } from 'convex-svelte';
import { api } from '$lib/convex';
import { browser } from '$app/environment';
import type { Id } from '$lib/convex';

interface UseMeetingSessionOptions {
	meetingId: () => Id<'meetings'> | undefined;
	sessionId: () => string | undefined;
	userId: () => Id<'users'> | undefined;
}

export function useMeetingSession(options: UseMeetingSessionOptions) {
	const { meetingId, sessionId, userId } = options;

	// Real-time queries
	const meetingQuery =
		browser && meetingId() && sessionId()
			? useQuery(api.meetings.get, () => {
					const id = meetingId();
					const session = sessionId();
					if (!id || !session) throw new Error('meetingId and sessionId required');
					return { meetingId: id, sessionId: session };
				})
			: null;

	const agendaItemsQuery =
		browser && meetingId() && sessionId()
			? useQuery(api.meetings.getAgendaItems, () => {
					const id = meetingId();
					const session = sessionId();
					if (!id || !session) throw new Error('meetingId and sessionId required');
					return { meetingId: id, sessionId: session };
				})
			: null;

	// Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;

	// Local state for timer
	const state = $state({
		currentTime: Date.now()
	});

	// Update timer every second (only when meeting is active)
	$effect(() => {
		if (!browser) return;

		const meeting = meetingQuery?.data;
		if (!meeting || !meeting.startedAt || meeting.closedAt) return;

		const interval = setInterval(() => {
			state.currentTime = Date.now();
		}, 1000);

		return () => clearInterval(interval);
	});

	// Actions
	async function startMeeting() {
		const id = meetingId();
		const session = sessionId();
		if (!id || !session) throw new Error('meetingId and sessionId required');

		await convexClient?.mutation(api.meetings.startMeeting, {
			meetingId: id,
			sessionId: session
		});
	}

	async function advanceStep(newStep: string) {
		const id = meetingId();
		const session = sessionId();
		if (!id || !session) throw new Error('meetingId and sessionId required');

		await convexClient?.mutation(api.meetings.advanceStep, {
			meetingId: id,
			sessionId: session,
			newStep
		});
	}

	async function closeMeeting() {
		const id = meetingId();
		const session = sessionId();
		if (!id || !session) throw new Error('meetingId and sessionId required');

		await convexClient?.mutation(api.meetings.closeMeeting, {
			meetingId: id,
			sessionId: session
		});
	}

	async function addAgendaItem(title: string) {
		const id = meetingId();
		const session = sessionId();
		if (!id || !session) throw new Error('meetingId and sessionId required');

		await convexClient?.mutation(api.meetings.createAgendaItem, {
			meetingId: id,
			sessionId: session,
			title
		});
	}

	// Computed values
	return {
		// Meeting state
		get meeting() {
			return meetingQuery?.data;
		},
		get agendaItems() {
			return agendaItemsQuery?.data ?? [];
		},
		get isLoading() {
			// If query doesn't exist (SSR or missing params), treat as loading
			if (!meetingQuery) return true;
			// Otherwise use actual loading state
			return meetingQuery.isLoading ?? false;
		},
		get error() {
			return meetingQuery?.error ?? agendaItemsQuery?.error;
		},

		// Meeting status
		get isStarted() {
			return !!meetingQuery?.data?.startedAt;
		},
		get isClosed() {
			return !!meetingQuery?.data?.closedAt;
		},
		get currentStep() {
			return meetingQuery?.data?.currentStep ?? 'check-in';
		},

		// Timer
		get elapsedTime() {
			const meeting = meetingQuery?.data;
			if (!meeting?.startedAt) return 0;
			if (meeting.closedAt) return meeting.closedAt - meeting.startedAt;
			return state.currentTime - meeting.startedAt;
		},
		get elapsedTimeFormatted() {
			const elapsed = this.elapsedTime;
			const minutes = Math.floor(elapsed / 1000 / 60);
			const seconds = Math.floor((elapsed / 1000) % 60);
			return `${minutes.toString().padStart(2, '0')}m${seconds.toString().padStart(2, '0')}s`;
		},

		// Permissions
		get isSecretary() {
			const meeting = meetingQuery?.data;
			const currentUserId = userId();
			if (!meeting || !currentUserId) return false;
			const secretaryId = meeting.secretaryId ?? meeting.createdBy;
			return secretaryId === currentUserId;
		},

		// Actions
		startMeeting,
		advanceStep,
		closeMeeting,
		addAgendaItem
	};
}

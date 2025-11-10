/**
 * Composable for study session state management
 * Manages study session queue, progress, and FSRS rating submission
 */

import { browser } from '$app/environment';
import { useQuery, useConvexClient } from 'convex-svelte';
import { api } from '$lib/convex';
import type { Id } from '$lib/convex';

export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy';

export interface StudyFlashcard {
	_id: Id<'flashcards'>;
	userId: Id<'users'>;
	question: string;
	answer: string;
	algorithm: string;
	fsrsStability?: number;
	fsrsDifficulty?: number;
	fsrsDue?: number;
	fsrsState?: 'new' | 'learning' | 'review' | 'relearning';
	reps: number;
	lapses: number;
	lastReviewAt?: number;
	createdAt: number;
}

export interface UseStudySessionReturn {
	get reviewQueue(): StudyFlashcard[];
	get currentCard(): StudyFlashcard | null;
	get isFlipped(): boolean;
	get cardsReviewed(): number;
	get sessionStartTime(): number | null;
	get isReviewing(): boolean;
	get isLoading(): boolean;
	get error(): string | null;
	get selectedTagIds(): Id<'tags'>[];
	setSelectedTagIds: (tagIds: Id<'tags'>[]) => void;
	flipCard: () => void;
	rateCard: (rating: FlashcardRating) => Promise<void>;
	startSession: (limit?: number) => void;
	resetSession: () => void;
}

export function useStudySession(): UseStudySessionReturn {
	// Session state
	const state = $state({
		reviewQueue: [] as StudyFlashcard[],
		isFlipped: false,
		cardsReviewed: 0,
		sessionStartTime: null as number | null,
		currentCardStartTime: null as number | null,
		isReviewing: false,
		selectedTagIds: [] as Id<'tags'>[],
		sessionLimit: 10,
	});

	// Convex client for mutations
	const convexClient = browser ? useConvexClient() : null;

	// Query for due flashcards (reactive to tag selection)
	const dueCardsQuery = browser
		? useQuery(
				api.flashcards.getDueFlashcards,
				() => ({
					limit: state.sessionLimit,
					algorithm: 'fsrs',
					tagIds: state.selectedTagIds.length > 0 ? state.selectedTagIds : undefined,
				})
			)
		: null;

	// Derived state
	const isLoading = $derived(dueCardsQuery?.isLoading ?? false);
	const error = $derived(dueCardsQuery?.error ? String(dueCardsQuery.error) : null);
	const currentCard = $derived(state.reviewQueue[0] ?? null);

	// Initialize session with due cards
	function startSession(limit?: number) {
		if (limit !== undefined) {
			state.sessionLimit = limit;
		}

		const dueCards = (dueCardsQuery?.data ?? []) as StudyFlashcard[];
		state.reviewQueue = [...dueCards];
		state.isFlipped = false;
		state.cardsReviewed = 0;
		state.sessionStartTime = Date.now();
		state.currentCardStartTime = Date.now();
		state.isReviewing = false;
	}

	// Reset session
	function resetSession() {
		state.reviewQueue = [];
		state.isFlipped = false;
		state.cardsReviewed = 0;
		state.sessionStartTime = null;
		state.currentCardStartTime = null;
		state.isReviewing = false;
	}

	// Flip card
	function flipCard() {
		if (!state.isReviewing) {
			state.isFlipped = !state.isFlipped;
		}
	}

	// Rate card and submit to backend
	async function rateCard(rating: FlashcardRating) {
		if (!currentCard || state.isReviewing || !convexClient) {
			return;
		}

		state.isReviewing = true;

		try {
			// Calculate review time (time since current card was shown)
			const reviewTime = state.currentCardStartTime
				? Math.floor((Date.now() - state.currentCardStartTime) / 1000)
				: undefined;

			// Submit rating to backend
			await convexClient.mutation(api.flashcards.reviewFlashcard, {
				flashcardId: currentCard._id,
				rating,
				reviewTime,
			});

			// Remove card from queue (queue-based removal pattern)
			state.reviewQueue = state.reviewQueue.slice(1);
			state.isFlipped = false;
			state.cardsReviewed++;
		} catch (err) {
			console.error('Failed to rate card:', err);
			// Keep card in queue on error
		} finally {
			state.isReviewing = false;
		}
	}

	// Auto-start session when due cards are loaded
	$effect(() => {
		if (browser && dueCardsQuery?.data && state.reviewQueue.length === 0 && !state.sessionStartTime) {
			startSession();
		}
	});

	// Reset card timer when current card changes
	$effect(() => {
		if (currentCard && !state.isReviewing) {
			state.currentCardStartTime = Date.now();
		}
	});

	return {
		get reviewQueue() {
			return state.reviewQueue;
		},
		get currentCard() {
			return currentCard;
		},
		get isFlipped() {
			return state.isFlipped;
		},
		get cardsReviewed() {
			return state.cardsReviewed;
		},
		get sessionStartTime() {
			return state.sessionStartTime;
		},
		get isReviewing() {
			return state.isReviewing;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		get selectedTagIds() {
			return state.selectedTagIds;
		},
		setSelectedTagIds(tagIds: Id<'tags'>[]) {
			state.selectedTagIds = tagIds;
			// Reset session when tags change
			resetSession();
		},
		flipCard,
		rateCard,
		startSession,
		resetSession,
	};
}


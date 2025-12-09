import { createEmptyCard, fsrs, Rating, type Card } from 'ts-fsrs';

import { parseState } from './state';

type RatingLabel = 'again' | 'hard' | 'good' | 'easy';

export function parseRating(label: RatingLabel): Rating {
	switch (label) {
		case 'again':
			return Rating.Again;
		case 'hard':
			return Rating.Hard;
		case 'good':
			return Rating.Good;
		case 'easy':
			return Rating.Easy;
		default:
			return Rating.Good;
	}
}

export function calculateInitialFsrsCard(now: Date) {
	const scheduler = fsrs();
	const baseCard = createEmptyCard(now);
	const scheduling = scheduler.repeat(baseCard, now);
	const initial = scheduling[Rating.Good].card;
	return {
		card: initial,
		state: {
			stability: initial.stability,
			difficulty: initial.difficulty,
			due: initial.due.getTime(),
			state: initial.state,
			reps: initial.reps,
			lapses: initial.lapses,
			lastReviewAt: initial.last_review?.getTime()
		}
	};
}

export function calculateScheduleFromStoredFlashcard(flashcard: {
	fsrsDue?: number | null;
	fsrsStability?: number | null;
	fsrsDifficulty?: number | null;
	fsrsState?: string | null;
	reps: number;
	lapses: number;
	lastReviewAt?: number | null;
}) {
	const scheduler = fsrs();
	const now = new Date();
	const card: Card = {
		due: flashcard.fsrsDue ? new Date(flashcard.fsrsDue) : now,
		stability: flashcard.fsrsStability ?? 0,
		difficulty: flashcard.fsrsDifficulty ?? 0,
		elapsed_days: flashcard.lastReviewAt
			? Math.floor((Date.now() - flashcard.lastReviewAt) / (1000 * 60 * 60 * 24))
			: 0,
		scheduled_days: 0,
		learning_steps: 0,
		reps: flashcard.reps,
		lapses: flashcard.lapses,
		state: parseState(flashcard.fsrsState ?? 'new'),
		last_review: flashcard.lastReviewAt ? new Date(flashcard.lastReviewAt) : undefined
	};

	return {
		now,
		scheduler,
		card
	};
}

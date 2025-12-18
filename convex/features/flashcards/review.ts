import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

import { calculateScheduleFromStoredFlashcard, parseRating } from './reviewSchedule';
import { requireOwnedFlashcard } from './repository';
import { normalizeStateString } from './state';

type ReviewInput = {
	flashcardId: Id<'flashcards'>;
	rating: 'again' | 'hard' | 'good' | 'easy';
	reviewTime?: number;
	personId: Id<'people'>;
};

export async function reviewFlashcard(ctx: MutationCtx, input: ReviewInput) {
	const flashcard = await requireOwnedFlashcard(ctx, input.flashcardId, input.personId);

	if (flashcard.algorithm !== 'fsrs') {
		throw createError(
			ErrorCodes.FLASHCARD_INVALID_ALGORITHM,
			`Algorithm ${flashcard.algorithm} not yet supported`
		);
	}

	const { scheduler, card, now } = calculateScheduleFromStoredFlashcard(flashcard);
	const result = scheduler.repeat(card, now)[parseRating(input.rating)];

	await ctx.db.patch(input.flashcardId, {
		fsrsStability: result.card.stability,
		fsrsDifficulty: result.card.difficulty,
		fsrsDue: result.card.due.getTime(),
		fsrsState: normalizeStateString(result.card.state),
		reps: result.card.reps,
		lapses: result.card.lapses,
		lastReviewAt: now.getTime()
	});

	await ctx.db.insert('flashcardReviews', {
		flashcardId: input.flashcardId,
		personId: input.personId,
		rating: input.rating,
		algorithm: flashcard.algorithm,
		reviewTime: input.reviewTime,
		reviewedAt: now.getTime(),
		fsrsLog: {
			stability: result.log.stability,
			difficulty: result.log.difficulty,
			scheduledDays: result.log.scheduled_days,
			elapsedDays: result.log.elapsed_days
		}
	});

	return {
		success: true,
		nextDue: result.card.due.getTime()
	};
}

import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createEmptyCard, Rating } from 'ts-fsrs';
import { fsrs } from 'ts-fsrs';

import { normalizeStateString } from './state';
import { attachTagsToFlashcard } from './tags';

type CreateFlashcardArgs = {
	personId: Id<'people'>;
	question: string;
	answer: string;
	sourceInboxItemId?: Id<'inboxItems'>;
	sourceType?: string;
	tagIds?: Id<'tags'>[] | null;
	algorithm: string;
};

export async function createFlashcardRecord(ctx: MutationCtx, args: CreateFlashcardArgs) {
	const now = new Date();
	const f = fsrs();
	const scheduling = f.repeat(createEmptyCard(now), now);
	const card = scheduling[Rating.Good].card;

	const flashcardId = await ctx.db.insert('flashcards', {
		personId: args.personId,
		question: args.question,
		answer: args.answer,
		sourceInboxItemId: args.sourceInboxItemId,
		sourceType: args.sourceType,
		algorithm: args.algorithm,
		fsrsStability: card.stability,
		fsrsDifficulty: card.difficulty,
		fsrsDue: card.due.getTime(),
		fsrsState: normalizeStateString(card.state),
		reps: card.reps,
		lapses: card.lapses,
		lastReviewAt: card.last_review?.getTime(),
		createdAt: Date.now()
	});

	await attachTagsToFlashcard(ctx, flashcardId, args.tagIds);
	return flashcardId;
}

export async function createFlashcardsBatch(
	ctx: MutationCtx,
	baseArgs: Omit<CreateFlashcardArgs, 'question' | 'answer'>,
	flashcards: Array<{ question: string; answer: string }>
) {
	const f = fsrs();
	const now = new Date();
	const ids: Id<'flashcards'>[] = [];

	for (const flashcard of flashcards) {
		const scheduling = f.repeat(createEmptyCard(now), now);
		const card = scheduling[Rating.Good].card;

		const flashcardId = await ctx.db.insert('flashcards', {
			personId: baseArgs.personId,
			question: flashcard.question,
			answer: flashcard.answer,
			sourceInboxItemId: baseArgs.sourceInboxItemId,
			sourceType: baseArgs.sourceType,
			algorithm: baseArgs.algorithm,
			fsrsStability: card.stability,
			fsrsDifficulty: card.difficulty,
			fsrsDue: card.due.getTime(),
			fsrsState: normalizeStateString(card.state),
			reps: card.reps,
			lapses: card.lapses,
			lastReviewAt: card.last_review?.getTime(),
			createdAt: Date.now()
		});

		await attachTagsToFlashcard(ctx, flashcardId, baseArgs.tagIds);
		ids.push(flashcardId);
	}

	return ids;
}

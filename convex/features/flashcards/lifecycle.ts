import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

import { requirePersonId } from './auth';
import { createFlashcardRecord, createFlashcardsBatch } from './creation';
import { getDefaultAlgorithm } from './settings';
import { requireOwnedFlashcard, deleteFlashcard } from './repository';

type BaseArgs = {
	sessionId: string;
	flashcardId?: Id<'flashcards'>;
	question?: string;
	answer?: string;
	sourceInboxItemId?: Id<'inboxItems'>;
	sourceType?: string;
	tagIds?: Id<'tags'>[] | null;
};

export async function createFlashcardForUser(ctx: MutationCtx, args: BaseArgs) {
	const personId = await requirePersonId(ctx, args.sessionId);
	const algorithm = await getDefaultAlgorithm(ctx, personId);
	return createFlashcardRecord(ctx, {
		personId,
		question: args.question ?? '',
		answer: args.answer ?? '',
		sourceInboxItemId: args.sourceInboxItemId,
		sourceType: args.sourceType,
		tagIds: args.tagIds,
		algorithm
	});
}

export async function createFlashcardsForUser(
	ctx: MutationCtx,
	args: BaseArgs,
	flashcards: Array<{ question: string; answer: string }>
) {
	const personId = await requirePersonId(ctx, args.sessionId);
	const algorithm = await getDefaultAlgorithm(ctx, personId);
	return createFlashcardsBatch(ctx, { ...args, personId, algorithm }, flashcards);
}

export async function updateFlashcardContent(ctx: MutationCtx, args: BaseArgs) {
	const personId = await requirePersonId(ctx, args.sessionId);
	if (!args.flashcardId) {
		throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'flashcardId is required');
	}
	await requireOwnedFlashcard(ctx, args.flashcardId, personId);
	await ctx.db.patch(args.flashcardId, {
		...(args.question !== undefined ? { question: args.question } : {}),
		...(args.answer !== undefined ? { answer: args.answer } : {})
	});
	return { success: true };
}

export async function archiveFlashcardForUser(ctx: MutationCtx, args: BaseArgs) {
	const personId = await requirePersonId(ctx, args.sessionId);
	if (!args.flashcardId) {
		throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'flashcardId is required');
	}
	await requireOwnedFlashcard(ctx, args.flashcardId, personId);
	await deleteFlashcard(ctx, args.flashcardId);
	return { success: true };
}

export async function restoreFlashcardForUser(ctx: MutationCtx, args: BaseArgs) {
	if (!args.flashcardId) {
		throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, 'flashcardId is required');
	}
	// Current implementation hard-deletes flashcards; restoration is not supported yet.
	throw createError(
		ErrorCodes.FLASHCARD_NOT_FOUND,
		'Flashcard restoration is not supported once deleted'
	);
}

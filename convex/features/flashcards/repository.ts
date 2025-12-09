import type { Id } from '../../_generated/dataModel';
import type { ActionCtx, MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

type Ctx = MutationCtx | QueryCtx;
type AnyCtx = MutationCtx | QueryCtx | ActionCtx;

export async function requireFlashcard(ctx: Ctx, flashcardId: Id<'flashcards'>) {
	const flashcard = await ctx.db.get(flashcardId);
	if (!flashcard) {
		throw createError(ErrorCodes.FLASHCARD_NOT_FOUND, 'Flashcard not found');
	}
	return flashcard;
}

export async function requireOwnedFlashcard(
	ctx: Ctx,
	flashcardId: Id<'flashcards'>,
	userId: Id<'users'>
) {
	const flashcard = await requireFlashcard(ctx, flashcardId);
	if (flashcard.userId !== userId) {
		throw createError(ErrorCodes.FLASHCARD_ACCESS_DENIED, 'Not authorized');
	}
	return flashcard;
}

export async function deleteFlashcardRelations(ctx: MutationCtx, flashcardId: Id<'flashcards'>) {
	const flashcardTags = await ctx.db
		.query('flashcardTags')
		.withIndex('by_flashcard', (q) => q.eq('flashcardId', flashcardId))
		.collect();
	for (const ft of flashcardTags) {
		await ctx.db.delete(ft._id);
	}

	const reviews = await ctx.db
		.query('flashcardReviews')
		.withIndex('by_flashcard', (q) => q.eq('flashcardId', flashcardId))
		.collect();
	for (const review of reviews) {
		await ctx.db.delete(review._id);
	}
}

export async function deleteFlashcard(ctx: MutationCtx, flashcardId: Id<'flashcards'>) {
	await deleteFlashcardRelations(ctx, flashcardId);
	await ctx.db.delete(flashcardId);
}

export async function getUserFlashcards(ctx: QueryCtx, userId: Id<'users'>) {
	return ctx.db
		.query('flashcards')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();
}

export async function listFlashcardTags(ctx: AnyCtx) {
	return ctx.db.query('flashcardTags').collect();
}

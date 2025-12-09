import type { Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';

import { collectFlashcardTagsByIds } from './tags';

export async function listDueFlashcards(
	ctx: QueryCtx,
	userId: Id<'users'>,
	limit: number,
	algorithm: string,
	tagIds?: Id<'tags'>[] | null
) {
	const now = Date.now();

	let dueCards = await ctx.db
		.query('flashcards')
		.withIndex('by_user_due', (q) =>
			q.eq('userId', userId).eq('algorithm', algorithm).lte('fsrsDue', now)
		)
		.order('asc')
		.take(limit * 2);

	if (tagIds && tagIds.length > 0) {
		const allTagIds = await collectFlashcardTagsByIds(ctx, tagIds, userId);
		if (allTagIds) {
			const flashcardTagRelations = await Promise.all(
				allTagIds.map((tagId) =>
					ctx.db
						.query('flashcardTags')
						.withIndex('by_tag', (q) => q.eq('tagId', tagId))
						.collect()
				)
			);

			const validFlashcardIds = new Set<Id<'flashcards'>>();
			for (const relations of flashcardTagRelations) {
				for (const relation of relations) {
					validFlashcardIds.add(relation.flashcardId);
				}
			}

			dueCards = dueCards.filter((card) => validFlashcardIds.has(card._id));
		}
	}

	return dueCards.slice(0, limit);
}

export async function listUserFlashcards(
	ctx: QueryCtx,
	userId: Id<'users'>,
	tagIds?: Id<'tags'>[]
) {
	let flashcards = await ctx.db
		.query('flashcards')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();

	if (tagIds && tagIds.length > 0) {
		const allTagIds = await collectFlashcardTagsByIds(ctx, tagIds, userId);
		if (allTagIds) {
			const flashcardTagRelations = await Promise.all(
				allTagIds.map((tagId) =>
					ctx.db
						.query('flashcardTags')
						.withIndex('by_tag', (q) => q.eq('tagId', tagId))
						.collect()
				)
			);

			const validFlashcardIds = new Set<Id<'flashcards'>>();
			for (const relations of flashcardTagRelations) {
				for (const relation of relations) {
					validFlashcardIds.add(relation.flashcardId);
				}
			}

			flashcards = flashcards.filter((card) => validFlashcardIds.has(card._id));
		}
	}

	return flashcards;
}

export async function listCollections(ctx: QueryCtx, userId: Id<'users'>) {
	const tags = await ctx.db
		.query('tags')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();
	const flashcards = await ctx.db
		.query('flashcards')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();
	const flashcardTags = await ctx.db.query('flashcardTags').collect();

	const tagToFlashcards = new Map<Id<'tags'>, Set<Id<'flashcards'>>>();
	for (const ft of flashcardTags) {
		const flashcard = flashcards.find((f) => f._id === ft.flashcardId);
		if (!flashcard || flashcard.userId !== userId) continue;

		if (!tagToFlashcards.has(ft.tagId)) {
			tagToFlashcards.set(ft.tagId, new Set());
		}
		tagToFlashcards.get(ft.tagId)!.add(ft.flashcardId);
	}

	const now = Date.now();
	const collections = tags.map((tag) => {
		const flashcardIds = tagToFlashcards.get(tag._id) || new Set();
		const collectionFlashcards = flashcards.filter((f) => flashcardIds.has(f._id));
		const dueCount = collectionFlashcards.filter((f) => f.fsrsDue && f.fsrsDue <= now).length;

		return {
			tagId: tag._id,
			name: tag.displayName,
			color: tag.color,
			count: collectionFlashcards.length,
			dueCount
		};
	});

	collections.sort((a, b) => {
		if (b.count !== a.count) return b.count - a.count;
		return a.name.localeCompare(b.name);
	});

	return collections;
}

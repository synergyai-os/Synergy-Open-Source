import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';

import { getTagDescendantsForTags } from '../tags';

type Ctx = MutationCtx | QueryCtx;

export async function attachTagsToFlashcard(
	ctx: MutationCtx,
	flashcardId: Id<'flashcards'>,
	tagIds?: Id<'tags'>[] | null
) {
	if (!tagIds || tagIds.length === 0) return;
	for (const tagId of tagIds) {
		await ctx.db.insert('flashcardTags', {
			flashcardId,
			tagId
		});
	}
}

export async function collectFlashcardTagsByIds(
	ctx: Ctx,
	tagIds: Id<'tags'>[] | undefined,
	userId: Id<'users'>
) {
	if (!tagIds || tagIds.length === 0) return null;
	return getTagDescendantsForTags(ctx, tagIds, userId);
}

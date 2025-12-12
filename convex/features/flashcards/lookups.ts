import { query } from '../../_generated/server';
import { v } from 'convex/values';

import { getUserId } from './auth';

export const findFlashcard = query({
	args: {
		sessionId: v.string(),
		flashcardId: v.id('flashcards')
	},
	handler: async (ctx, args) => {
		const userId = await getUserId(ctx, args.sessionId);
		const flashcard = await ctx.db.get(args.flashcardId);
		if (!flashcard || flashcard.userId !== userId) return null;
		return flashcard;
	}
});

export const findFlashcardTags = query({
	args: {
		sessionId: v.string(),
		flashcardId: v.id('flashcards')
	},
	handler: async (ctx, args) => {
		const userId = await getUserId(ctx, args.sessionId);

		const flashcard = await ctx.db.get(args.flashcardId);
		if (!flashcard || flashcard.userId !== userId) return null;

		const flashcardTags = await ctx.db
			.query('flashcardTags')
			.withIndex('by_flashcard', (q) => q.eq('flashcardId', args.flashcardId))
			.collect();

		const tags = await Promise.all(flashcardTags.map((ft) => ctx.db.get(ft.tagId)));
		const resolved = tags.filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));
		return resolved.length ? resolved : null;
	}
});

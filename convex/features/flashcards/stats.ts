import type { Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';

type FlashcardStats = {
	total: number;
	due: number;
};

export async function getFlashcardStats(
	ctx: QueryCtx,
	personId: Id<'people'>
): Promise<FlashcardStats> {
	const flashcards = await ctx.db
		.query('flashcards')
		.withIndex('by_person', (q) => q.eq('personId', personId))
		.collect();

	const now = Date.now();
	const due = flashcards.filter((card) => card.fsrsDue && card.fsrsDue <= now).length;

	return {
		total: flashcards.length,
		due
	};
}

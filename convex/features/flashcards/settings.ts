import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';

type Ctx = MutationCtx | QueryCtx;

export async function getDefaultAlgorithm(ctx: Ctx, personId: Id<'people'>) {
	const settings = await ctx.db
		.query('userAlgorithmSettings')
		.withIndex('by_person', (q) => q.eq('personId', personId))
		.first();

	return settings?.defaultAlgorithm ?? 'fsrs';
}

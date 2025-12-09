import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';

type Ctx = MutationCtx | QueryCtx;

export async function getDefaultAlgorithm(ctx: Ctx, userId: Id<'users'>) {
	const settings = await ctx.db
		.query('userAlgorithmSettings')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.first();

	return settings?.defaultAlgorithm ?? 'fsrs';
}

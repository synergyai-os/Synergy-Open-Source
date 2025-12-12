import type { QueryCtx } from '../../../_generated/server';
import type { Id } from '../../../_generated/dataModel';
import { USER_ID_FIELD } from '../../../core/people/constants';
import { requireActivePerson } from '../../../core/people/rules';

export async function findSyncProgressForPerson(
	ctx: QueryCtx,
	personId: Id<'people'>
): Promise<{
	step: string;
	current: number;
	total: number;
	message?: string;
} | null> {
	const person = await requireActivePerson(ctx, personId);
	const linkedUser = person[USER_ID_FIELD];
	if (!linkedUser) return null;

	const progress = await ctx.db
		.query('syncProgress')
		.withIndex('by_user', (q) => q.eq('userId', linkedUser))
		.first();

	if (!progress) return null;

	return {
		step: progress.step,
		current: progress.current,
		total: progress.total,
		message: progress.message
	};
}

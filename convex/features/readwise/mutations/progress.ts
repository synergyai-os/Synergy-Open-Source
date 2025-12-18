import type { MutationCtx } from '../../../_generated/server';
import type { Id } from '../../../_generated/dataModel';

export async function updateSyncProgressStateImpl(
	ctx: MutationCtx,
	args: {
		personId: Id<'people'>;
		step: string;
		current: number;
		total?: number;
		message?: string;
	}
) {
	const { personId, step, current, total, message } = args;
	const now = Date.now();
	const existing = await ctx.db
		.query('syncProgress')
		.withIndex('by_person', (q) => q.eq('personId', personId))
		.first();

	if (existing) {
		await ctx.db.patch(existing._id, {
			step,
			current,
			total,
			message,
			updatedAt: now
		});
		return existing._id;
	}

	return ctx.db.insert('syncProgress', {
		personId,
		step,
		current,
		total,
		message,
		startedAt: now,
		updatedAt: now
	});
}

export async function clearSyncProgressImpl(ctx: MutationCtx, personId: Id<'people'>) {
	const existing = await ctx.db
		.query('syncProgress')
		.withIndex('by_person', (q) => q.eq('personId', personId))
		.first();
	if (existing) {
		await ctx.db.delete(existing._id);
	}
}

export async function updateLastSyncTimeImpl(ctx: MutationCtx, userId: Id<'users'>) {
	const now = Date.now();
	const settings = await ctx.db
		.query('userSettings')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.first();

	if (settings) {
		await ctx.db.patch(settings._id, {
			lastReadwiseSyncAt: now
		});
		return;
	}

	await ctx.db.insert('userSettings', {
		userId,
		lastReadwiseSyncAt: now
	});
}

import type { QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';

export async function hasHighlightImpl(ctx: QueryCtx, externalId: string) {
	const existing = await ctx.db
		.query('highlights')
		.withIndex('by_external_id', (q) => q.eq('externalId', externalId))
		.first();
	return !!existing;
}

export async function findSourceIdByBookIdImpl(ctx: QueryCtx, bookId: string) {
	const source = await ctx.db
		.query('sources')
		.withIndex('by_external_id', (q) => q.eq('externalId', bookId))
		.first();
	return source?._id || null;
}

export async function findHighlightIdByExternalIdImpl(ctx: QueryCtx, externalId: string) {
	const highlight = await ctx.db
		.query('highlights')
		.withIndex('by_external_id', (q) => q.eq('externalId', externalId))
		.first();
	return highlight?._id || null;
}

export async function hasInboxItemImpl(
	ctx: QueryCtx,
	userId: Id<'users'>,
	highlightId: Id<'highlights'>
) {
	const existing = await ctx.db
		.query('inboxItems')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.filter((q) =>
			q.and(q.eq(q.field('type'), 'readwise_highlight'), q.eq(q.field('highlightId'), highlightId))
		)
		.first();
	return !!existing;
}

export async function isInboxItemNewImpl(ctx: QueryCtx, inboxItemId: Id<'inboxItems'>) {
	const inboxItem = await ctx.db.get(inboxItemId);
	if (!inboxItem) return false;
	const now = Date.now();
	return now - inboxItem.createdAt < 5000;
}

import type { QueryCtx } from '../../../_generated/server';
import type { Id } from '../../../_generated/dataModel';
import { createError, ErrorCodes } from '../../../infrastructure/errors/codes';

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
	workspaceId: Id<'workspaces'>,
	highlightId: Id<'highlights'>
) {
	const personId = await findPersonId(ctx, userId, workspaceId);
	const existing = await ctx.db
		.query('inboxItems')
		.withIndex('by_person', (q) => q.eq('personId', personId))
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

async function findPersonId(
	ctx: QueryCtx,
	userId: Id<'users'>,
	workspaceId: Id<'workspaces'>
): Promise<Id<'people'>> {
	const person = await ctx.db
		.query('people')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!person) {
		throw createError(
			ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
			'User is not a member of workspace'
		);
	}

	return person._id;
}

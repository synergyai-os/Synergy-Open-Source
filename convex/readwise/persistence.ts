import { internal } from '../_generated/api';
import type { ActionCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import type { ReadwiseHighlight, ReadwiseSource } from '../../src/lib/types/readwise';

export async function findHighlightIdByExternalId(
	ctx: ActionCtx,
	userId: string,
	externalId: string
): Promise<Id<'highlights'> | null> {
	return ctx.runQuery(internal.syncReadwiseMutations.findHighlightIdByExternalId, {
		userId,
		externalId
	});
}

export async function hasHighlight(
	ctx: ActionCtx,
	userId: string,
	externalId: string
): Promise<boolean> {
	return ctx.runQuery(internal.syncReadwiseMutations.hasHighlight, { userId, externalId });
}

export async function hasInboxItem(
	ctx: ActionCtx,
	userId: string,
	highlightId: Id<'highlights'>
): Promise<boolean> {
	return ctx.runQuery(internal.syncReadwiseMutations.hasInboxItem, {
		userId,
		highlightId
	});
}

export async function createHighlightIfMissing(
	ctx: ActionCtx,
	args: { userId: string; sourceId: Id<'sources'>; readwiseHighlight: ReadwiseHighlight }
): Promise<Id<'highlights'>> {
	return ctx.runMutation(internal.syncReadwiseMutations.createHighlightIfMissing, args);
}

export async function createInboxItemIfMissing(
	ctx: ActionCtx,
	args: { userId: string; highlightId: Id<'highlights'> }
): Promise<Id<'inboxItems'>> {
	return ctx.runMutation(internal.syncReadwiseMutations.createInboxItemIfMissing, args);
}

export async function findSourceIdByBookId(
	ctx: ActionCtx,
	userId: string,
	bookId: string
): Promise<Id<'sources'> | null> {
	return ctx.runQuery(internal.syncReadwiseMutations.findSourceIdByBookId, {
		userId,
		bookId
	});
}

export async function createAuthorIfMissing(
	ctx: ActionCtx,
	args: { userId: string; authorName: string }
): Promise<Id<'authors'>> {
	return ctx.runMutation(internal.syncReadwiseMutations.createAuthorIfMissing, args);
}

export async function createSourceIfMissing(
	ctx: ActionCtx,
	args: { userId: string; primaryAuthorId: Id<'authors'>; readwiseSource: ReadwiseSource }
): Promise<Id<'sources'>> {
	return ctx.runMutation(internal.syncReadwiseMutations.createSourceIfMissing, args);
}

export async function linkAuthorToSource(
	ctx: ActionCtx,
	args: { sourceId: Id<'sources'>; authorId: Id<'authors'> }
): Promise<Id<'sourceAuthors'>> {
	return ctx.runMutation(internal.syncReadwiseMutations.createAuthorLink, args);
}

export async function createTagIfMissing(
	ctx: ActionCtx,
	args: {
		userId: string;
		workspaceId: Id<'workspaces'>;
		tagName: string;
		externalId?: number;
	}
): Promise<Id<'tags'>> {
	return ctx.runMutation(internal.syncReadwiseMutations.createTagIfMissing, args);
}

export async function linkTagToSource(
	ctx: ActionCtx,
	args: { sourceId: Id<'sources'>; tagId: Id<'tags'> }
): Promise<Id<'sourceTags'>> {
	return ctx.runMutation(internal.syncReadwiseMutations.createTagLink, args);
}

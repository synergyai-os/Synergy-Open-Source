import { internal } from '../../_generated/api';
import type { ActionCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import type { ReadwiseHighlight, ReadwiseSource } from '../../../src/lib/types/readwise';

export async function findHighlightIdByExternalId(
	ctx: ActionCtx,
	personId: Id<'people'>,
	externalId: string
): Promise<Id<'highlights'> | null> {
	return ctx.runQuery(internal.features.readwise.mutations.findHighlightIdByExternalId, {
		personId,
		externalId
	});
}

export async function hasHighlight(
	ctx: ActionCtx,
	personId: Id<'people'>,
	externalId: string
): Promise<boolean> {
	return ctx.runQuery(internal.features.readwise.mutations.hasHighlight, { personId, externalId });
}

export async function hasInboxItem(
	ctx: ActionCtx,
	personId: Id<'people'>,
	workspaceId: Id<'workspaces'>,
	highlightId: Id<'highlights'>
): Promise<boolean> {
	return ctx.runQuery(internal.features.readwise.mutations.hasInboxItem, {
		personId,
		workspaceId,
		highlightId
	});
}

export async function createHighlightIfMissing(
	ctx: ActionCtx,
	args: { personId: Id<'people'>; sourceId: Id<'sources'>; readwiseHighlight: ReadwiseHighlight }
): Promise<Id<'highlights'>> {
	return ctx.runMutation(internal.features.readwise.mutations.createHighlightIfMissing, args);
}

export async function createInboxItemIfMissing(
	ctx: ActionCtx,
	args: { personId: Id<'people'>; workspaceId: Id<'workspaces'>; highlightId: Id<'highlights'> }
): Promise<Id<'inboxItems'>> {
	return ctx.runMutation(internal.features.readwise.mutations.createInboxItemIfMissing, args);
}

export async function findSourceIdByBookId(
	ctx: ActionCtx,
	personId: Id<'people'>,
	bookId: string
): Promise<Id<'sources'> | null> {
	return ctx.runQuery(internal.features.readwise.mutations.findSourceIdByBookId, {
		personId,
		bookId
	});
}

export async function createAuthorIfMissing(
	ctx: ActionCtx,
	args: { personId: Id<'people'>; authorName: string }
): Promise<Id<'authors'>> {
	return ctx.runMutation(internal.features.readwise.mutations.createAuthorIfMissing, args);
}

export async function createSourceIfMissing(
	ctx: ActionCtx,
	args: { personId: Id<'people'>; primaryAuthorId: Id<'authors'>; readwiseSource: ReadwiseSource }
): Promise<Id<'sources'>> {
	return ctx.runMutation(internal.features.readwise.mutations.createSourceIfMissing, args);
}

export async function linkAuthorToSource(
	ctx: ActionCtx,
	args: { sourceId: Id<'sources'>; authorId: Id<'authors'> }
): Promise<Id<'sourceAuthors'>> {
	return ctx.runMutation(internal.features.readwise.mutations.createAuthorLink, args);
}

export async function createTagIfMissing(
	ctx: ActionCtx,
	args: {
		personId: Id<'people'>;
		workspaceId: Id<'workspaces'>;
		tagName: string;
		externalId?: number;
	}
): Promise<Id<'tags'>> {
	return ctx.runMutation(internal.features.readwise.mutations.createTagIfMissing, args);
}

export async function linkTagToSource(
	ctx: ActionCtx,
	args: { sourceId: Id<'sources'>; tagId: Id<'tags'> }
): Promise<Id<'sourceTags'>> {
	return ctx.runMutation(internal.features.readwise.mutations.createTagLink, args);
}

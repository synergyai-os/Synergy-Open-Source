/**
 * Readwise Sync Mutations
 *
 * Internal mutations for syncing Readwise data.
 * These must be in a separate file without "use node" because mutations
 * cannot be defined in Node.js files (only actions can).
 */

import { internalMutation, internalQuery } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import {
	clearSyncProgressImpl,
	createAuthorIfMissingImpl,
	createHighlightIfMissingImpl,
	createInboxItemIfMissingImpl,
	createSourceIfMissingImpl,
	createTagIfMissingImpl,
	findHighlightIdByExternalIdImpl,
	findSourceIdByBookIdImpl,
	hasHighlightImpl,
	hasInboxItemImpl,
	isInboxItemNewImpl,
	linkAuthorToSourceImpl,
	linkTagToSourceImpl,
	updateLastSyncTimeImpl,
	updateSyncProgressStateImpl
} from './mutations/index';

/**
 * Internal mutation: Update sync progress
 */
export const updateSyncProgressState = internalMutation({
	args: {
		userId: v.id('users'),
		step: v.string(),
		current: v.number(),
		total: v.optional(v.number()),
		message: v.optional(v.string())
	},
	handler: (ctx, args) => updateSyncProgressStateImpl(ctx, args)
});

/**
 * Internal mutation: Clear sync progress
 */
export const updateSyncProgress = internalMutation({
	args: {
		userId: v.id('users')
	},
	handler: (ctx, args) => clearSyncProgressImpl(ctx, args.userId)
});

/**
 * Internal mutation: Find or create author
 */
export const createAuthorIfMissing = internalMutation({
	args: {
		userId: v.id('users'),
		authorName: v.string()
	},
	handler: (ctx, args): Promise<Id<'authors'>> => createAuthorIfMissingImpl(ctx, args)
});

/**
 * Internal mutation: Find or create source
 */
export const createSourceIfMissing = internalMutation({
	args: {
		userId: v.id('users'),
		primaryAuthorId: v.id('authors'),
		readwiseSource: v.any() // Readwise source object
	},
	handler: (ctx, args): Promise<Id<'sources'>> => createSourceIfMissingImpl(ctx, args)
});

/**
 * Internal mutation: Link author to source
 */
export const createAuthorLink = internalMutation({
	args: {
		sourceId: v.id('sources'),
		authorId: v.id('authors')
	},
	handler: (ctx, args): Promise<Id<'sourceAuthors'>> => linkAuthorToSourceImpl(ctx, args)
});

/**
 * Internal mutation: Find or create tag
 */
export const createTagIfMissing = internalMutation({
	args: {
		userId: v.id('users'),
		workspaceId: v.id('workspaces'), // REQUIRED: Users always have at least one workspace
		tagName: v.string(),
		externalId: v.optional(v.number())
	},
	handler: (ctx, args): Promise<Id<'tags'>> => createTagIfMissingImpl(ctx, args)
});

/**
 * Internal mutation: Link tag to source
 */
export const createTagLink = internalMutation({
	args: {
		sourceId: v.id('sources'),
		tagId: v.id('tags')
	},
	handler: (ctx, args): Promise<Id<'sourceTags'>> => linkTagToSourceImpl(ctx, args)
});

/**
 * Internal mutation: Find or create highlight
 */
export const createHighlightIfMissing = internalMutation({
	args: {
		userId: v.id('users'),
		sourceId: v.id('sources'),
		readwiseHighlight: v.any() // Readwise highlight object
	},
	handler: (ctx, args): Promise<Id<'highlights'>> => createHighlightIfMissingImpl(ctx, args)
});

/**
 * Internal mutation: Find or create inbox item
 */
export const createInboxItemIfMissing = internalMutation({
	args: {
		userId: v.id('users'),
		workspaceId: v.id('workspaces'),
		highlightId: v.id('highlights')
	},
	handler: (ctx, args): Promise<Id<'inboxItems'>> => createInboxItemIfMissingImpl(ctx, args)
});

/**
 * Internal query: Check if highlight exists by externalId
 */
export const hasHighlight = internalQuery({
	args: {
		userId: v.id('users'),
		externalId: v.string()
	},
	handler: async (ctx, args): Promise<boolean> => {
		const exists: boolean = await hasHighlightImpl(ctx, args.externalId);
		return exists;
	}
});

/**
 * Internal query: Get sourceId for a book_id (Readwise external ID)
 */
export const findSourceIdByBookId = internalQuery({
	args: {
		userId: v.id('users'),
		bookId: v.string() // Readwise book_id (externalId)
	},
	handler: (ctx, args): Promise<Id<'sources'> | null> => findSourceIdByBookIdImpl(ctx, args.bookId)
});

/**
 * Internal query: Get highlightId by externalId
 */
export const findHighlightIdByExternalId = internalQuery({
	args: {
		userId: v.id('users'),
		externalId: v.string()
	},
	handler: (ctx, args): Promise<Id<'highlights'> | null> =>
		findHighlightIdByExternalIdImpl(ctx, args.externalId)
});

/**
 * Internal query: Check if inbox item exists for a highlight
 */
export const hasInboxItem = internalQuery({
	args: {
		userId: v.id('users'),
		workspaceId: v.id('workspaces'),
		highlightId: v.id('highlights')
	},
	handler: async (ctx, args): Promise<boolean> => {
		const exists: boolean = await hasInboxItemImpl(
			ctx,
			args.userId,
			args.workspaceId,
			args.highlightId
		);
		return exists;
	}
});

/**
 * Internal query: Check if inbox item was newly created
 */
export const isInboxItemNew = internalQuery({
	args: {
		inboxItemId: v.id('inboxItems'),
		highlightId: v.id('highlights')
	},
	handler: async (ctx, args): Promise<boolean> => {
		const isNew: boolean = await isInboxItemNewImpl(ctx, args.inboxItemId);
		return isNew;
	}
});

/**
 * Internal mutation: Update last sync time
 */
export const updateLastSyncTime = internalMutation({
	args: {
		userId: v.id('users')
	},
	handler: (ctx, args) => updateLastSyncTimeImpl(ctx, args.userId)
});

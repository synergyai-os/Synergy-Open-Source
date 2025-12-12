import { mutation, query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from '../../_generated/dataModel';
import {
	createFlashcardInInboxForSession,
	createHighlightInInboxForSession,
	createNoteInInboxForSession,
	archiveInboxItemForSession,
	restoreInboxItemForSession,
	updateInboxItemProcessedForSession
} from './lifecycle';
import {
	findInboxItemForSession,
	findInboxItemWithDetailsForSession,
	findSyncProgressForSession,
	listInboxItemsForSession
} from './queries';

/**
 * List inbox items (thin handler delegating to helpers).
 */
export const listInboxItems = query({
	args: {
		sessionId: v.string(),
		filterType: v.optional(v.string()),
		processed: v.optional(v.boolean()),
		workspaceId: v.optional(v.union(v.id('workspaces'), v.null())),
		circleId: v.optional(v.id('circles'))
	},
	handler: (ctx, args) => listInboxItemsForSession(ctx, args)
});

/**
 * Get a single inbox item by ID
 */
/**
 * Get a single inbox item by ID
 *
 * SECURITY: Uses sessionId to derive person context server-side (prevents impersonation)
 */
export const findInboxItem = query({
	args: { sessionId: v.string(), inboxItemId: v.id('inboxItems') },
	handler: async (ctx, args): Promise<Doc<'inboxItems'> | null> => {
		const result = await findInboxItemForSession(ctx, args);
		return result ?? null;
	}
});

/**
 * Get inbox item with full details (highlight, source, tags, etc.)
 * This is useful for displaying detailed information in the inbox UI
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit person context parameter
 */
/**
 * Get inbox item with full details (highlight, source, tags)
 *
 * SECURITY: Uses sessionId to derive person context server-side (prevents impersonation)
 */
export const findInboxItemWithDetails = query({
	args: { sessionId: v.string(), inboxItemId: v.id('inboxItems') },
	handler: async (
		ctx,
		args
	): Promise<Awaited<ReturnType<typeof findInboxItemWithDetailsForSession>> | null> => {
		const result = await findInboxItemWithDetailsForSession(ctx, args);
		return result ?? null;
	}
});

/**
 * Mark an inbox item as processed
 * This removes it from the inbox workflow (user has reviewed it)
 */
/**
 * Mark an inbox item as processed
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit person context parameter
 */
/**
 * Mark inbox item as processed
 *
 * SECURITY: Uses sessionId to derive person context server-side (prevents impersonation)
 */
export const updateProcessed = mutation({
	args: { sessionId: v.string(), inboxItemId: v.id('inboxItems') },
	handler: (ctx, args) => updateInboxItemProcessedForSession(ctx, args.sessionId, args.inboxItemId)
});

/**
 * Archive an inbox item (soft hide from inbox)
 */
export const archiveInboxItem = mutation({
	args: { sessionId: v.string(), inboxItemId: v.id('inboxItems') },
	handler: (ctx, args) => archiveInboxItemForSession(ctx, args.sessionId, args.inboxItemId)
});

/**
 * Restore an archived inbox item (returns to inbox)
 */
export const restoreInboxItem = mutation({
	args: { sessionId: v.string(), inboxItemId: v.id('inboxItems') },
	handler: (ctx, args) => restoreInboxItemForSession(ctx, args.sessionId, args.inboxItemId)
});

/**
 * Query: Get sync progress for current user
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit person context parameter
 */
/**
 * Get Readwise sync progress for current user
 *
 * SECURITY: Uses sessionId to derive person context server-side (prevents impersonation)
 */
export const findSyncProgress = query({
	args: { sessionId: v.string() },
	handler: async (
		ctx,
		args
	): Promise<Awaited<ReturnType<typeof findSyncProgressForSession>> | null> => {
		const result = await findSyncProgressForSession(ctx, args.sessionId);
		return result ?? null;
	}
});

/**
 * Quick Create: Create a manual note and add to inbox
 */
/**
 * Quick Create: Create a manual text note and add to inbox
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit person context parameter
 */
/**
 * Create a note in inbox
 *
 * SECURITY: Uses sessionId to derive person context server-side (prevents impersonation)
 */
export const createNoteInInbox = mutation({
	args: {
		sessionId: v.string(),
		text: v.string(),
		title: v.optional(v.string()),
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: (
		ctx,
		args
	): Promise<{
		inboxItemId: Id<'inboxItems'>;
	}> => createNoteInInboxForSession(ctx, args.sessionId, args.text, args.title)
});

/**
 * Quick Create: Create a flashcard and add to inbox
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit person context parameter
 */
/**
 * Create a flashcard in inbox
 *
 * SECURITY: Uses sessionId to derive person context server-side (prevents impersonation)
 */
export const createFlashcardInInbox = mutation({
	args: {
		sessionId: v.string(),
		question: v.string(),
		answer: v.string(),
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: (
		ctx,
		args
	): Promise<{
		flashcardId: Id<'flashcards'>;
		inboxItemId: Id<'inboxItems'>;
	}> =>
		createFlashcardInInboxForSession(
			ctx,
			args.sessionId,
			args.question,
			args.answer,
			args.tagIds ?? []
		)
});

/**
 * Quick Create: Create a manual highlight and add to inbox
 *
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and remove explicit person context parameter
 */
/**
 * Create a highlight in inbox
 *
 * SECURITY: Uses sessionId to derive person context server-side (prevents impersonation)
 */
export const createHighlightInInbox = mutation({
	args: {
		sessionId: v.string(),
		text: v.string(),
		sourceTitle: v.optional(v.string()),
		note: v.optional(v.string()),
		tagIds: v.optional(v.array(v.id('tags')))
	},
	handler: (
		ctx,
		args
	): Promise<{
		highlightId: Id<'highlights'>;
		inboxItemId: Id<'inboxItems'>;
	}> =>
		createHighlightInInboxForSession(
			ctx,
			args.sessionId,
			args.text,
			args.sourceTitle,
			args.note,
			args.tagIds ?? []
		)
});

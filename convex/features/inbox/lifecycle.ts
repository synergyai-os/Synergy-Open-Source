import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { getUserId } from './access';
import { ensureInboxOwnership, ensureInboxAssignmentRecorded } from './assignments';
import {
	notifyInboxItemArchived,
	notifyInboxItemCreated,
	notifyInboxItemProcessed,
	notifyInboxItemRestored
} from './notifications';

type FlashcardIds = { flashcardId: Id<'flashcards'>; inboxItemId: Id<'inboxItems'> };
type HighlightIds = { highlightId: Id<'highlights'>; inboxItemId: Id<'inboxItems'> };
type NoteIds = { inboxItemId: Id<'inboxItems'> };

export async function updateInboxItemProcessedForSession(
	ctx: MutationCtx,
	sessionId: string,
	inboxItemId: Id<'inboxItems'>
): Promise<Id<'inboxItems'>> {
	const userId = await getUserId(ctx, sessionId);
	await ensureInboxOwnership(ctx, inboxItemId, userId);

	await ctx.db.patch(inboxItemId, {
		processed: true,
		processedAt: Date.now()
	});

	await notifyInboxItemProcessed(ctx, inboxItemId, userId);

	return inboxItemId;
}

export async function createNoteInInboxForSession(
	ctx: MutationCtx,
	sessionId: string,
	text: string,
	title?: string
): Promise<NoteIds> {
	const userId = await getUserId(ctx, sessionId);
	const inboxItemId = await ctx.db.insert('inboxItems', {
		type: 'manual_text',
		userId,
		processed: false,
		createdAt: Date.now(),
		text,
		bookTitle: title
	});

	await ensureInboxAssignmentRecorded(ctx, inboxItemId, userId);
	await notifyInboxItemCreated(ctx, inboxItemId, userId);

	return { inboxItemId };
}

export async function createFlashcardInInboxForSession(
	ctx: MutationCtx,
	sessionId: string,
	question: string,
	answer: string,
	tagIds?: Id<'tags'>[]
): Promise<FlashcardIds> {
	const userId = await getUserId(ctx, sessionId);

	const flashcardId = await ctx.db.insert('flashcards', {
		userId,
		question,
		answer,
		algorithm: 'fsrs',
		reps: 0,
		lapses: 0,
		createdAt: Date.now()
	});

	const inboxItemId = await ctx.db.insert('inboxItems', {
		type: 'manual_text',
		userId,
		processed: false,
		createdAt: Date.now(),
		text: `Q: ${question}\n\nA: ${answer}`,
		bookTitle: 'Flashcard'
	});

	if (tagIds) {
		for (const tagId of tagIds) {
			await ctx.db.insert('flashcardTags', { flashcardId, tagId });
		}
	}

	await ensureInboxAssignmentRecorded(ctx, inboxItemId, userId);
	await notifyInboxItemCreated(ctx, inboxItemId, userId);

	return { flashcardId, inboxItemId };
}

export async function createHighlightInInboxForSession(
	ctx: MutationCtx,
	sessionId: string,
	text: string,
	sourceTitle?: string,
	note?: string,
	tagIds?: Id<'tags'>[]
): Promise<HighlightIds> {
	const userId = await getUserId(ctx, sessionId);
	const source = await getOrCreateManualSource(ctx, userId, sourceTitle);

	const highlightId = await ctx.db.insert('highlights', {
		userId,
		sourceId: source._id,
		text,
		note,
		externalId: `manual_${Date.now()}`,
		externalUrl: '',
		updatedAt: Date.now(),
		createdAt: Date.now()
	});

	const inboxItemId = await ctx.db.insert('inboxItems', {
		type: 'readwise_highlight',
		userId,
		processed: false,
		createdAt: Date.now(),
		highlightId
	});

	if (tagIds) {
		for (const tagId of tagIds) {
			await ctx.db.insert('highlightTags', { highlightId, tagId });
		}
	}

	await ensureInboxAssignmentRecorded(ctx, inboxItemId, userId);
	await notifyInboxItemCreated(ctx, inboxItemId, userId);

	return { highlightId, inboxItemId };
}

export async function archiveInboxItemForSession(
	ctx: MutationCtx,
	sessionId: string,
	inboxItemId: Id<'inboxItems'>
) {
	const userId = await getUserId(ctx, sessionId);
	await ensureInboxOwnership(ctx, inboxItemId, userId);

	await ctx.db.patch(inboxItemId, {
		processed: true,
		processedAt: Date.now()
	});

	await notifyInboxItemArchived(ctx, inboxItemId, userId);

	return inboxItemId;
}

export async function restoreInboxItemForSession(
	ctx: MutationCtx,
	sessionId: string,
	inboxItemId: Id<'inboxItems'>
) {
	const userId = await getUserId(ctx, sessionId);
	await ensureInboxOwnership(ctx, inboxItemId, userId);

	await ctx.db.patch(inboxItemId, {
		processed: false,
		processedAt: undefined
	});

	await notifyInboxItemRestored(ctx, inboxItemId, userId);

	return inboxItemId;
}

async function getOrCreateManualSource(ctx: MutationCtx, userId: string, sourceTitle?: string) {
	const manualSourceTitle = sourceTitle || 'Manual Entry';
	const existing = await ctx.db
		.query('sources')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.filter((q) => q.eq(q.field('title'), manualSourceTitle))
		.first();
	if (existing) return existing as Doc<'sources'>;

	let manualAuthor = await ctx.db
		.query('authors')
		.withIndex('by_user_name', (q) => q.eq('userId', userId).eq('name', 'manual'))
		.first();
	if (!manualAuthor) {
		const authorId = await ctx.db.insert('authors', {
			userId,
			name: 'manual',
			displayName: 'Manual Entry',
			createdAt: Date.now()
		});
		manualAuthor = await ctx.db.get(authorId);
	}

	const sourceId = await ctx.db.insert('sources', {
		userId,
		authorId: manualAuthor!._id,
		title: manualSourceTitle,
		category: 'manual',
		sourceType: 'manual',
		externalId: `manual_${Date.now()}`,
		numHighlights: 1,
		updatedAt: Date.now(),
		createdAt: Date.now()
	});
	return (await ctx.db.get(sourceId))!;
}

import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { getInboxActor } from './access';
import { ensureInboxOwnership, ensureInboxAssignmentRecorded } from './assignments';
import { USER_ID_FIELD } from '../../core/people/constants';
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
	const existing = await ctx.db.get(inboxItemId);
	const actor = await getInboxActor(ctx, sessionId, existing?.workspaceId ?? null);
	await ensureInboxOwnership(ctx, inboxItemId, actor.personId);

	await ctx.db.patch(inboxItemId, {
		processed: true,
		processedAt: Date.now()
	});

	await notifyInboxItemProcessed(ctx, inboxItemId, actor.personId);

	return inboxItemId;
}

export async function createNoteInInboxForSession(
	ctx: MutationCtx,
	sessionId: string,
	text: string,
	title?: string
): Promise<NoteIds> {
	const actor = await getInboxActor(ctx, sessionId);
	const inboxItemId = await ctx.db.insert('inboxItems', {
		type: 'manual_text',
		personId: actor.personId,
		processed: false,
		createdAt: Date.now(),
		text,
		bookTitle: title,
		workspaceId: actor.workspaceId
	});

	await ensureInboxAssignmentRecorded(ctx, inboxItemId, actor.personId);
	await notifyInboxItemCreated(ctx, inboxItemId, actor.personId);

	return { inboxItemId };
}

export async function createFlashcardInInboxForSession(
	ctx: MutationCtx,
	sessionId: string,
	question: string,
	answer: string,
	tagIds?: Id<'tags'>[]
): Promise<FlashcardIds> {
	const actor = await getInboxActor(ctx, sessionId);

	const flashcardId = await ctx.db.insert('flashcards', {
		[USER_ID_FIELD]: actor.linkedUser,
		question,
		answer,
		algorithm: 'fsrs',
		reps: 0,
		lapses: 0,
		createdAt: Date.now()
	});

	const inboxItemId = await ctx.db.insert('inboxItems', {
		type: 'manual_text',
		personId: actor.personId,
		processed: false,
		createdAt: Date.now(),
		text: `Q: ${question}\n\nA: ${answer}`,
		bookTitle: 'Flashcard',
		workspaceId: actor.workspaceId
	});

	if (tagIds) {
		for (const tagId of tagIds) {
			await ctx.db.insert('flashcardTags', { flashcardId, tagId });
		}
	}

	await ensureInboxAssignmentRecorded(ctx, inboxItemId, actor.personId);
	await notifyInboxItemCreated(ctx, inboxItemId, actor.personId);

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
	const actor = await getInboxActor(ctx, sessionId);
	const source = await getOrCreateManualSource(ctx, actor, sourceTitle);

	const highlightId = await ctx.db.insert('highlights', {
		[USER_ID_FIELD]: actor.linkedUser,
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
		personId: actor.personId,
		processed: false,
		createdAt: Date.now(),
		highlightId,
		workspaceId: actor.workspaceId
	});

	if (tagIds) {
		for (const tagId of tagIds) {
			await ctx.db.insert('highlightTags', { highlightId, tagId });
		}
	}

	await ensureInboxAssignmentRecorded(ctx, inboxItemId, actor.personId);
	await notifyInboxItemCreated(ctx, inboxItemId, actor.personId);

	return { highlightId, inboxItemId };
}

export async function archiveInboxItemForSession(
	ctx: MutationCtx,
	sessionId: string,
	inboxItemId: Id<'inboxItems'>
) {
	const existing = await ctx.db.get(inboxItemId);
	const actor = await getInboxActor(ctx, sessionId, existing?.workspaceId ?? null);
	await ensureInboxOwnership(ctx, inboxItemId, actor.personId);

	await ctx.db.patch(inboxItemId, {
		processed: true,
		processedAt: Date.now()
	});

	await notifyInboxItemArchived(ctx, inboxItemId, actor.personId);

	return inboxItemId;
}

export async function restoreInboxItemForSession(
	ctx: MutationCtx,
	sessionId: string,
	inboxItemId: Id<'inboxItems'>
) {
	const existing = await ctx.db.get(inboxItemId);
	const actor = await getInboxActor(ctx, sessionId, existing?.workspaceId ?? null);
	await ensureInboxOwnership(ctx, inboxItemId, actor.personId);

	await ctx.db.patch(inboxItemId, {
		processed: false,
		processedAt: undefined
	});

	await notifyInboxItemRestored(ctx, inboxItemId, actor.personId);

	return inboxItemId;
}

async function getOrCreateManualSource(
	ctx: MutationCtx,
	actor: { linkedUser: Id<'users'>; workspaceId: Id<'workspaces'> },
	sourceTitle?: string
) {
	const manualSourceTitle = sourceTitle || 'Manual Entry';
	const existing = await ctx.db
		.query('sources')
		.withIndex('by_user', (q) => q.eq(USER_ID_FIELD, actor.linkedUser))
		.filter((q) => q.eq(q.field('title'), manualSourceTitle))
		.first();
	if (existing) return existing as Doc<'sources'>;

	let manualAuthor = await ctx.db
		.query('authors')
		.withIndex('by_user_name', (q) => q.eq(USER_ID_FIELD, actor.linkedUser).eq('name', 'manual'))
		.first();
	if (!manualAuthor) {
		const authorId = await ctx.db.insert('authors', {
			[USER_ID_FIELD]: actor.linkedUser,
			name: 'manual',
			displayName: 'Manual Entry',
			createdAt: Date.now()
		});
		manualAuthor = await ctx.db.get(authorId);
	}

	const sourceId = await ctx.db.insert('sources', {
		[USER_ID_FIELD]: actor.linkedUser,
		authorId: manualAuthor!._id,
		title: manualSourceTitle,
		category: 'manual',
		sourceType: 'manual',
		externalId: `manual_${Date.now()}`,
		numHighlights: 1,
		workspaceId: actor.workspaceId,
		updatedAt: Date.now(),
		createdAt: Date.now()
	});
	return (await ctx.db.get(sourceId))!;
}

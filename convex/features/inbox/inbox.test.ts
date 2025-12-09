import { afterEach, describe, expect, test, vi } from 'vitest';

import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { ErrorCodes } from '../../infrastructure/errors/codes';
import * as access from './access';
import * as assignments from './assignments';
import {
	archiveInboxItemForSession,
	createFlashcardInInboxForSession,
	createHighlightInInboxForSession,
	createNoteInInboxForSession,
	restoreInboxItemForSession,
	updateInboxItemProcessedForSession
} from './lifecycle';
import * as notifications from './notifications';
import {
	findInboxItemForSession,
	findInboxItemWithDetailsForSession,
	findSyncProgressForSession
} from './queries';
import { createError } from '../../infrastructure/errors/codes';

describe('inbox helpers', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('ensureInboxOwnership returns item when owned', async () => {
		const get = vi.fn().mockResolvedValue({ _id: 'i1', userId: 'u1' });
		const ctx = { db: { get } } as unknown as MutationCtx;

		const result = await assignments.ensureInboxOwnership(ctx, 'i1' as any, 'u1');

		expect(result?._id).toBe('i1');
		expect(get).toHaveBeenCalledWith('i1');
	});

	test('ensureInboxOwnership throws with error code when not owned', async () => {
		const ctx = {
			db: { get: vi.fn().mockResolvedValue({ _id: 'i1', userId: 'other' }) }
		} as unknown as MutationCtx;

		await expect(assignments.ensureInboxOwnership(ctx, 'i1' as any, 'u1')).rejects.toThrow(
			`${ErrorCodes.INBOX_ITEM_NOT_FOUND}: Inbox item not found or access denied`
		);
	});

	test('updateInboxItemProcessedForSession patches and notifies', async () => {
		vi.spyOn(access, 'getUserId').mockResolvedValue('u1');
		const patch = vi.fn();
		const get = vi.fn().mockResolvedValue({ _id: 'i1', userId: 'u1' });
		const notify = vi.spyOn(notifications, 'notifyInboxItemProcessed').mockResolvedValue();
		const ctx = { db: { get, patch } } as unknown as MutationCtx;

		const result = await updateInboxItemProcessedForSession(ctx, 'sess', 'i1' as any);

		expect(result).toBe('i1');
		expect(patch).toHaveBeenCalledWith('i1', expect.objectContaining({ processed: true }));
		expect(notify).toHaveBeenCalledWith(ctx, 'i1', 'u1');
	});

	test('updateInboxItemProcessedForSession rejects when ownership fails', async () => {
		vi.spyOn(access, 'getUserId').mockResolvedValue('u1');
		const ctx = {
			db: { get: vi.fn().mockResolvedValue({ _id: 'i1', userId: 'u2' }) }
		} as unknown as MutationCtx;

		await expect(updateInboxItemProcessedForSession(ctx, 'sess', 'i1' as any)).rejects.toThrow(
			`${ErrorCodes.INBOX_ITEM_NOT_FOUND}: Inbox item not found or access denied`
		);
	});

	test('archiveInboxItemForSession patches and notifies', async () => {
		vi.spyOn(access, 'getUserId').mockResolvedValue('u1');
		const patch = vi.fn();
		const get = vi.fn().mockResolvedValue({ _id: 'i1', userId: 'u1' });
		const notify = vi.spyOn(notifications, 'notifyInboxItemArchived').mockResolvedValue();
		const ctx = { db: { get, patch } } as unknown as MutationCtx;

		const result = await archiveInboxItemForSession(ctx, 'sess', 'i1' as any);

		expect(result).toBe('i1');
		expect(patch).toHaveBeenCalledWith(
			'i1',
			expect.objectContaining({ processed: true, processedAt: expect.any(Number) })
		);
		expect(notify).toHaveBeenCalledWith(ctx, 'i1', 'u1');
	});

	test('archiveInboxItemForSession rejects when ownership fails', async () => {
		vi.spyOn(access, 'getUserId').mockResolvedValue('u1');
		const ctx = {
			db: { get: vi.fn().mockResolvedValue({ _id: 'i1', userId: 'u2' }) }
		} as unknown as MutationCtx;

		await expect(archiveInboxItemForSession(ctx, 'sess', 'i1' as any)).rejects.toThrow(
			`${ErrorCodes.INBOX_ITEM_NOT_FOUND}: Inbox item not found or access denied`
		);
	});

	test('restoreInboxItemForSession patches and notifies', async () => {
		vi.spyOn(access, 'getUserId').mockResolvedValue('u1');
		const patch = vi.fn();
		const get = vi.fn().mockResolvedValue({ _id: 'i1', userId: 'u1' });
		const notify = vi.spyOn(notifications, 'notifyInboxItemRestored').mockResolvedValue();
		const ctx = { db: { get, patch } } as unknown as MutationCtx;

		const result = await restoreInboxItemForSession(ctx, 'sess', 'i1' as any);

		expect(result).toBe('i1');
		expect(patch).toHaveBeenCalledWith(
			'i1',
			expect.objectContaining({ processed: false, processedAt: undefined })
		);
		expect(notify).toHaveBeenCalledWith(ctx, 'i1', 'u1');
	});

	test('createNoteInInboxForSession creates item and notifies', async () => {
		vi.spyOn(access, 'getUserId').mockResolvedValue('u1');
		const insert = vi.fn().mockResolvedValueOnce('inbox-1');
		vi.spyOn(assignments, 'ensureInboxAssignmentRecorded').mockResolvedValue();
		const notify = vi.spyOn(notifications, 'notifyInboxItemCreated').mockResolvedValue();
		const ctx = { db: { insert } } as unknown as MutationCtx;

		const result = await createNoteInInboxForSession(ctx, 'sess', 'note body', 'title');

		expect(result).toEqual({ inboxItemId: 'inbox-1' });
		expect(insert).toHaveBeenCalledWith(
			'inboxItems',
			expect.objectContaining({ userId: 'u1', text: 'note body' })
		);
		expect(assignments.ensureInboxAssignmentRecorded).toHaveBeenCalledWith(ctx, 'inbox-1', 'u1');
		expect(notify).toHaveBeenCalledWith(ctx, 'inbox-1', 'u1');
	});

	test('createFlashcardInInboxForSession creates flashcard, inbox item, tags, and notifies', async () => {
		vi.spyOn(access, 'getUserId').mockResolvedValue('u1');
		vi.spyOn(assignments, 'ensureInboxAssignmentRecorded').mockResolvedValue();
		const insert = vi
			.fn()
			.mockResolvedValueOnce('flash-1')
			.mockResolvedValueOnce('inbox-1')
			.mockResolvedValue('flashcardTag-any');
		const notify = vi.spyOn(notifications, 'notifyInboxItemCreated').mockResolvedValue();
		const ctx = { db: { insert } } as unknown as MutationCtx;

		const result = await createFlashcardInInboxForSession(ctx, 'sess', 'q', 'a', [
			'tag-1' as any,
			'tag-2' as any
		]);

		expect(result).toEqual({ flashcardId: 'flash-1', inboxItemId: 'inbox-1' });
		expect(insert).toHaveBeenNthCalledWith(
			1,
			'flashcards',
			expect.objectContaining({ userId: 'u1', question: 'q', answer: 'a' })
		);
		expect(insert).toHaveBeenNthCalledWith(
			2,
			'inboxItems',
			expect.objectContaining({ userId: 'u1', type: 'manual_text', bookTitle: 'Flashcard' })
		);
		expect(insert).toHaveBeenNthCalledWith(3, 'flashcardTags', {
			flashcardId: 'flash-1',
			tagId: 'tag-1'
		});
		expect(insert).toHaveBeenNthCalledWith(4, 'flashcardTags', {
			flashcardId: 'flash-1',
			tagId: 'tag-2'
		});
		expect(assignments.ensureInboxAssignmentRecorded).toHaveBeenCalledWith(ctx, 'inbox-1', 'u1');
		expect(notify).toHaveBeenCalledWith(ctx, 'inbox-1', 'u1');
	});

	test('createFlashcardInInboxForSession propagates auth failure', async () => {
		vi.spyOn(access, 'getUserId').mockRejectedValue(
			createError(ErrorCodes.AUTH_REQUIRED, 'auth required')
		);
		const ctx = { db: { insert: vi.fn() } } as unknown as MutationCtx;

		await expect(
			createFlashcardInInboxForSession(ctx, 'sess', 'q', 'a', ['tag-1' as any])
		).rejects.toThrow(`${ErrorCodes.AUTH_REQUIRED}: auth required`);
	});

	test('createHighlightInInboxForSession creates highlight, inbox item, tags, and notifies', async () => {
		vi.spyOn(access, 'getUserId').mockResolvedValue('u1');
		vi.spyOn(assignments, 'ensureInboxAssignmentRecorded').mockResolvedValue();
		const existingSource = {
			_id: 'source-1',
			userId: 'u1',
			authorId: 'author-1',
			title: 'Manual Entry'
		} as any;
		const insert = vi
			.fn()
			.mockResolvedValueOnce('highlight-1')
			.mockResolvedValueOnce('inbox-1')
			.mockResolvedValue('highlightTag-any');
		const notify = vi.spyOn(notifications, 'notifyInboxItemCreated').mockResolvedValue();
		const ctx = {
			db: {
				insert,
				query: vi.fn((table: string) => {
					if (table === 'sources') {
						return {
							withIndex: vi.fn().mockReturnValue({
								filter: vi
									.fn()
									.mockReturnValue({ first: vi.fn().mockResolvedValue(existingSource) })
							})
						};
					}
					return {
						withIndex: vi.fn().mockReturnValue({
							filter: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(null) })
						})
					};
				})
			}
		} as unknown as MutationCtx;

		const result = await createHighlightInInboxForSession(ctx, 'sess', 'body', 'Title', 'Note', [
			'tag-1' as any
		]);

		expect(result).toEqual({ highlightId: 'highlight-1', inboxItemId: 'inbox-1' });
		expect(insert).toHaveBeenNthCalledWith(
			1,
			'highlights',
			expect.objectContaining({ userId: 'u1', sourceId: 'source-1', text: 'body', note: 'Note' })
		);
		expect(insert).toHaveBeenNthCalledWith(
			2,
			'inboxItems',
			expect.objectContaining({
				userId: 'u1',
				type: 'readwise_highlight',
				highlightId: 'highlight-1'
			})
		);
		expect(insert).toHaveBeenNthCalledWith(3, 'highlightTags', {
			highlightId: 'highlight-1',
			tagId: 'tag-1'
		});
		expect(assignments.ensureInboxAssignmentRecorded).toHaveBeenCalledWith(ctx, 'inbox-1', 'u1');
		expect(notify).toHaveBeenCalledWith(ctx, 'inbox-1', 'u1');
	});

	test('createHighlightInInboxForSession propagates auth failure', async () => {
		vi.spyOn(access, 'getUserId').mockRejectedValue(
			createError(ErrorCodes.AUTH_REQUIRED, 'auth required')
		);
		const ctx = {
			db: {
				insert: vi.fn(),
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						filter: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(null) })
					})
				})
			}
		} as unknown as MutationCtx;

		await expect(
			createHighlightInInboxForSession(ctx, 'sess', 'body', 'Title', 'Note', ['tag-1' as any])
		).rejects.toThrow(`${ErrorCodes.AUTH_REQUIRED}: auth required`);
	});

	test('findInboxItemForSession returns null when user is not found', async () => {
		vi.spyOn(access, 'findUserId').mockResolvedValue(null);
		const ctx = {} as unknown as QueryCtx;

		const result = await findInboxItemForSession(ctx, {
			sessionId: 'sess',
			inboxItemId: 'i1' as any
		});

		expect(result).toBeNull();
	});

	test('findInboxItemWithDetailsForSession returns null when not owned', async () => {
		vi.spyOn(access, 'getUserId').mockResolvedValue('u1');
		const ctx = {
			db: { get: vi.fn().mockResolvedValue({ _id: 'i1', userId: 'other', type: 'manual_text' }) }
		} as unknown as QueryCtx;

		const result = await findInboxItemWithDetailsForSession(ctx, {
			sessionId: 'sess',
			inboxItemId: 'i1' as any
		});

		expect(result).toBeNull();
	});

	test('findSyncProgressForSession maps progress fields', async () => {
		vi.spyOn(access, 'getUserId').mockResolvedValue('u1');
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue({
							step: 'syncing',
							current: 1,
							total: 3,
							message: 'progress'
						})
					})
				})
			}
		} as unknown as QueryCtx;

		const result = await findSyncProgressForSession(ctx, 'sess');

		expect(result).toEqual({ step: 'syncing', current: 1, total: 3, message: 'progress' });
	});
});

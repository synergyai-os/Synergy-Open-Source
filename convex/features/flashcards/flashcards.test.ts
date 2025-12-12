import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';

import { ErrorCodes } from '../../infrastructure/errors/codes';
import * as auth from './auth';
import * as creation from './creation';
import * as settings from './settings';
import * as repository from './repository';
import {
	archiveFlashcardForUser,
	createFlashcardForUser,
	updateFlashcardContent
} from './lifecycle';
import * as importExport from './importExport';

describe('flashcards helpers', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	test('createFlashcardForUser combines auth and algorithm defaults', async () => {
		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any);
		vi.spyOn(settings, 'getDefaultAlgorithm').mockResolvedValue('fsrs');
		const create = vi.spyOn(creation, 'createFlashcardRecord').mockResolvedValue('f1' as any);

		const ctx = { db: {} } as any;
		const flashcardId = await createFlashcardForUser(ctx, {
			sessionId: 's1',
			question: 'Q',
			answer: 'A',
			sourceType: 'manual'
		});

		expect(flashcardId).toBe('f1');
		expect(create).toHaveBeenCalledWith(
			ctx,
			expect.objectContaining({
				userId: 'u1',
				question: 'Q',
				answer: 'A',
				algorithm: 'fsrs'
			})
		);
	});

	test('updateFlashcardContent requires flashcardId', async () => {
		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any);
		await expect(
			updateFlashcardContent({} as any, { sessionId: 's1', question: 'Q' })
		).rejects.toThrow(`${ErrorCodes.VALIDATION_REQUIRED_FIELD}: flashcardId is required`);
	});

	test('updateFlashcardContent enforces ownership before patch', async () => {
		const patch = vi.fn();
		const ctx = { db: { patch } } as any;
		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any);
		vi.spyOn(repository, 'requireOwnedFlashcard').mockResolvedValue({ _id: 'f1' } as any);

		await updateFlashcardContent(ctx, {
			sessionId: 's1',
			flashcardId: 'f1' as any,
			question: 'New Q'
		});

		expect(repository.requireOwnedFlashcard).toHaveBeenCalledWith(ctx, 'f1', 'u1');
		expect(patch).toHaveBeenCalledWith('f1', expect.objectContaining({ question: 'New Q' }));
	});

	test('archiveFlashcardForUser deletes after ownership check', async () => {
		const del = vi.fn();
		const ctx = { db: { delete: del } } as any;
		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any);
		vi.spyOn(repository, 'requireOwnedFlashcard').mockResolvedValue({ _id: 'f1' } as any);
		vi.spyOn(repository, 'deleteFlashcard').mockImplementation(async (_ctx, id) => del(id));

		await archiveFlashcardForUser(ctx, { sessionId: 's1', flashcardId: 'f1' as any });

		expect(repository.requireOwnedFlashcard).toHaveBeenCalledWith(ctx, 'f1', 'u1');
		expect(del).toHaveBeenCalledWith('f1');
	});

	test('archiveFlashcardForUser surfaces auth errors', async () => {
		vi.spyOn(auth, 'requireUserId').mockRejectedValue(
			new Error(`${ErrorCodes.AUTH_REQUIRED}: Not authenticated`)
		);

		await expect(
			archiveFlashcardForUser({} as any, { sessionId: 's1', flashcardId: 'f1' as any })
		).rejects.toThrow(`${ErrorCodes.AUTH_REQUIRED}: Not authenticated`);
	});

	test('fetchFlashcardsFromSourceHelper parses API result', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ content: [{ text: '[{"question":"Q","answer":"A"}]' }] })
		} as any);

		const ctx = {
			runQuery: vi
				.fn()
				.mockResolvedValueOnce('u1')
				.mockResolvedValueOnce({ claudeApiKey: 'encrypted-key' }),
			runAction: vi.fn().mockResolvedValue('api-key')
		} as any;

		vi.spyOn(auth, 'requireUserId').mockResolvedValue('u1' as any);
		vi.spyOn(settings, 'getDefaultAlgorithm').mockResolvedValue('fsrs');
		vi.spyOn(repository, 'requireOwnedFlashcard').mockResolvedValue({ _id: 'f1' } as any);
		vi.spyOn(repository, 'deleteFlashcard').mockResolvedValue(undefined);

		const result = await importExport.fetchFlashcardsFromSourceHelper(ctx, {
			sessionId: 's1',
			text: 'text',
			sourceTitle: 'title'
		});

		expect(result.success).toBe(true);
		expect(result.flashcards[0]).toEqual({ question: 'Q', answer: 'A' });
	});

	test('fetchFlashcardsFromSourceHelper surfaces generation failures', async () => {
		global.fetch = vi.fn().mockRejectedValue(new Error('boom')) as any;

		const ctx = {
			runQuery: vi
				.fn()
				.mockResolvedValueOnce('u1')
				.mockResolvedValueOnce({ claudeApiKey: 'encrypted-key' }),
			runAction: vi.fn().mockResolvedValue('api-key')
		} as any;

		await expect(
			importExport.fetchFlashcardsFromSourceHelper(ctx, {
				sessionId: 's1',
				text: 'text'
			})
		).rejects.toThrow(
			`${ErrorCodes.FLASHCARD_GENERATION_FAILED}: Failed to generate flashcard: boom`
		);
	});
});

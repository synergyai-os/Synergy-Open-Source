import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../infrastructure/sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn()
}));
vi.mock('../../core/people/queries', () => ({
	getPersonByUserAndWorkspace: vi.fn(),
	listWorkspacesForUser: vi.fn()
}));
vi.mock('../../core/people/rules', () => ({
	requireActivePerson: vi.fn()
}));

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { getPersonByUserAndWorkspace, listWorkspacesForUser } from '../../core/people/queries';
import { requireActivePerson } from '../../core/people/rules';
import { createNote, findNote, updateNote } from './index';

const getHandler = <T extends Record<string, unknown>>(fn: T) =>
	(fn as any).handler ? (fn as any).handler : (fn as any);

const makeCtx = (overrides: Record<string, unknown> = {}) =>
	({
		db: {
			insert: vi.fn(),
			patch: vi.fn(),
			get: vi.fn(),
			query: vi.fn(() => ({
				withIndex: vi.fn(() => ({
					collect: vi.fn().mockResolvedValue([])
				}))
			}))
		},
		...overrides
	}) as any;

describe('features/notes', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	const person = { _id: 'p1', workspaceId: 'w1', userId: 'u1', status: 'active' } as any;

	test('createNote validates the session and inserts a note for the acting user', async () => {
		(validateSessionAndGetUserId as any).mockResolvedValue({ userId: 'u1' });
		(listWorkspacesForUser as any).mockResolvedValue(['w1']);
		(getPersonByUserAndWorkspace as any).mockResolvedValue(person);
		(requireActivePerson as any).mockResolvedValue(person);
		const ctx = makeCtx();
		ctx.db.insert.mockResolvedValue('note-1');

		const handler = getHandler(createNote);

		const result = await handler(ctx, {
			sessionId: 'sess',
			title: 'Title',
			content: 'Body',
			contentMarkdown: undefined
		});

		expect(validateSessionAndGetUserId).toHaveBeenCalledWith(ctx, 'sess');
		expect(ctx.db.insert).toHaveBeenCalledWith(
			'inboxItems',
			expect.objectContaining({
				personId: 'p1',
				workspaceId: 'w1',
				type: 'note',
				content: 'Body'
			})
		);
		expect(result).toBe('note-1');
	});

	test('updateNote rejects when the note is not owned by the acting user', async () => {
		(validateSessionAndGetUserId as any).mockResolvedValue({ userId: 'u1' });
		(listWorkspacesForUser as any).mockResolvedValue(['w1']);
		(getPersonByUserAndWorkspace as any).mockResolvedValue(person);
		(requireActivePerson as any).mockResolvedValue(person);
		const ctx = makeCtx();
		ctx.db.get.mockResolvedValue({
			_id: 'note-1',
			personId: 'other',
			type: 'note',
			workspaceId: 'w1'
		});

		const handler = getHandler(updateNote);

		await expect(
			handler(ctx, {
				sessionId: 'sess',
				noteId: 'note-1' as any,
				title: 'New title'
			})
		).rejects.toThrow(`${ErrorCodes.NOTE_ACCESS_DENIED}: Note not found or access denied`);
	});

	test('updateNote patches when the note is owned by the acting user', async () => {
		(validateSessionAndGetUserId as any).mockResolvedValue({ userId: 'u1' });
		(listWorkspacesForUser as any).mockResolvedValue(['w1']);
		(getPersonByUserAndWorkspace as any).mockResolvedValue(person);
		(requireActivePerson as any).mockResolvedValue(person);
		const ctx = makeCtx();
		ctx.db.get.mockResolvedValue({
			_id: 'note-1',
			personId: 'p1',
			type: 'note',
			workspaceId: 'w1'
		});

		const handler = getHandler(updateNote);

		await handler(ctx, {
			sessionId: 'sess',
			noteId: 'note-1' as any,
			title: 'Updated'
		});

		expect(ctx.db.patch).toHaveBeenCalledWith(
			'note-1',
			expect.objectContaining({
				title: 'Updated',
				updatedAt: expect.any(Number)
			})
		);
	});

	test('findNote returns null when the note does not belong to the user', async () => {
		(validateSessionAndGetUserId as any).mockResolvedValue({ userId: 'u1' });
		(listWorkspacesForUser as any).mockResolvedValue(['w1']);
		(getPersonByUserAndWorkspace as any).mockResolvedValue(person);
		(requireActivePerson as any).mockResolvedValue(person);
		const ctx = makeCtx();
		ctx.db.get.mockResolvedValue({
			_id: 'note-1',
			personId: 'other',
			type: 'note',
			workspaceId: 'w1'
		});

		const handler = getHandler(findNote);

		const result = await handler(ctx, {
			sessionId: 'sess',
			noteId: 'note-1' as any
		});

		expect(result).toBeNull();
	});

	test('createNote surfaces authentication failures from validateSessionAndGetUserId', async () => {
		(validateSessionAndGetUserId as any).mockRejectedValue(
			createError(ErrorCodes.AUTH_REQUIRED, 'Not authenticated')
		);
		(listWorkspacesForUser as any).mockResolvedValue(['w1']);
		(getPersonByUserAndWorkspace as any).mockResolvedValue(person);
		(requireActivePerson as any).mockResolvedValue(person);
		const ctx = makeCtx();

		const handler = getHandler(createNote);

		await expect(
			handler(ctx, { sessionId: 'sess', content: 'Body', title: 'Title' })
		).rejects.toThrow(/AUTH_REQUIRED/);
	});
});

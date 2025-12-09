import { describe, expect, test, vi } from 'vitest';

vi.mock('../../infrastructure/sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn()
}));

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { getTagItemCountHandler, listTagsForEntity } from './queries';

const makeCtx = () =>
	({
		db: {
			query: vi.fn(() => ({
				withIndex: vi.fn(() => ({
					collect: vi.fn().mockResolvedValue([])
				}))
			})),
			get: vi.fn().mockResolvedValue(null)
		}
	}) as any;

describe('tags/queries', () => {
	test('listTagsForHighlight throws when session invalid', async () => {
		(validateSessionAndGetUserId as any).mockRejectedValue(
			createError(ErrorCodes.AUTH_REQUIRED, 'Not authenticated')
		);
		const ctx = makeCtx();

		await expect(listTagsForEntity(ctx as any, 'highlights', 'h1', 's')).rejects.toThrowError(
			/AUTH_REQUIRED/
		);
	});

	test('getTagItemCount throws when unauthenticated', async () => {
		(validateSessionAndGetUserId as any).mockRejectedValue(
			createError(ErrorCodes.AUTH_REQUIRED, 'Not authenticated')
		);
		const ctx = makeCtx();

		await expect(
			getTagItemCountHandler(ctx as any, { sessionId: 's', tagId: 't1' })
		).rejects.toThrowError(/AUTH_REQUIRED/);
	});
});

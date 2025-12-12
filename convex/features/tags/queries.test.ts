import { describe, expect, test, vi } from 'vitest';

const accessMocks = vi.hoisted(() => ({
	getActorFromSession: vi.fn(),
	ensureWorkspaceMembership: vi.fn(),
	ensureCircleMembership: vi.fn(),
	ensureTagAccess: vi.fn()
}));

vi.mock('./access', () => accessMocks);

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { getTagItemCountHandler, listTagsForEntity } from './queries';

const makeCtx = (highlight?: any) =>
	({
		db: {
			query: vi.fn(() => ({
				withIndex: vi.fn(() => ({
					collect: vi.fn().mockResolvedValue([])
				}))
			})),
			get: vi.fn().mockResolvedValue(highlight ?? null)
		}
	}) as any;

describe('tags/queries', () => {
	test('listTagsForHighlight throws when session invalid', async () => {
		accessMocks.getActorFromSession.mockRejectedValue(
			createError(ErrorCodes.AUTH_REQUIRED, 'Not authenticated')
		);
		const ctx = makeCtx({ _id: 'h1', workspaceId: 'ws1' });

		await expect(listTagsForEntity(ctx as any, 'highlights', 'h1', 's')).rejects.toThrowError(
			/AUTH_REQUIRED/
		);
	});

	test('getTagItemCount throws when unauthenticated', async () => {
		accessMocks.getActorFromSession.mockRejectedValue(
			createError(ErrorCodes.AUTH_REQUIRED, 'Not authenticated')
		);
		const ctx = makeCtx();

		await expect(
			getTagItemCountHandler(ctx as any, { sessionId: 's', tagId: 't1' })
		).rejects.toThrowError(/AUTH_REQUIRED/);
	});
});

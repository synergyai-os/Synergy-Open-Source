import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx } from '../../_generated/server';
import { archiveCircle } from './circleArchival';

vi.mock('../../sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'u1' })
}));

vi.mock('./circleAccess', () => ({
	ensureWorkspaceMembership: vi.fn()
}));

describe('circleArchival.archiveCircle', () => {
	test('throws when attempting to archive root circle', async () => {
		const ctx = {
			db: {
				get: vi.fn().mockResolvedValue({
					_id: 'c1',
					parentCircleId: undefined,
					workspaceId: 'w1'
				}),
				patch: vi.fn(),
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						collect: vi.fn().mockResolvedValue([])
					})
				})
			}
		} as unknown as MutationCtx;

		await expect(archiveCircle(ctx, { sessionId: 's1', circleId: 'c1' as any })).rejects.toThrow(
			/CIRCLE_INVALID_PARENT/
		);
	});
});

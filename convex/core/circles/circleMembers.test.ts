import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx } from '../../_generated/server';
import { addCircleMember } from './circleMembers';

vi.mock('./rules', () => ({
	requireCircle: vi.fn().mockResolvedValue({
		workspaceId: 'w1'
	})
}));

vi.mock('./circleAccess', () => ({
	ensureWorkspaceMembership: vi.fn(),
	requireWorkspacePersonFromSession: vi.fn().mockResolvedValue('p-acting')
}));

describe('circleMembers.addCircleMember', () => {
	test('throws when member already exists', async () => {
		let queryCall = 0;
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						first: async () => {
							queryCall += 1;
							// First call: ensure acting person is a member
							if (queryCall === 1) return { _id: 'membership-acting' };
							// Second call: existing membership for target person
							if (queryCall === 2) return { _id: 'membership-existing' };
							return null;
						}
					})
				}),
				insert: vi.fn(),
				delete: vi.fn()
			}
		} as unknown as MutationCtx;

		await expect(
			addCircleMember(ctx, {
				sessionId: 's1',
				circleId: 'c1' as any,
				memberPersonId: 'p-target' as any
			})
		).rejects.toThrow(/CIRCLE_MEMBER_EXISTS/);
	});
});

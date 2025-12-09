import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx } from '../../_generated/server';
import { assignUser } from './roleAssignments';

vi.mock('../../sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'u-acting' })
}));

vi.mock('./roleAccess', () => ({
	ensureCircleExists: vi.fn().mockResolvedValue({ workspaceId: 'w1' }),
	ensureWorkspaceMembership: vi.fn()
}));

vi.mock('./roleRbac', () => ({
	handleUserCircleRoleCreated: vi.fn(),
	handleUserCircleRoleRemoved: vi.fn()
}));

describe('roleAssignments.assignUser', () => {
	test('throws when assignment already exists', async () => {
		const handler = (assignUser as any).handler ?? (assignUser as any);
		const ctx = {
			db: {
				get: vi.fn().mockResolvedValue({
					_id: 'r1',
					circleId: 'c1',
					templateId: undefined
				}),
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue({ _id: 'existing-assignment' })
					})
				}),
				insert: vi.fn()
			}
		} as unknown as MutationCtx;

		await expect(
			handler(ctx as any, {
				sessionId: 's1',
				circleRoleId: 'r1' as any,
				userId: 'u-target' as any
			})
		).rejects.toThrow(/ASSIGNMENT_ALREADY_EXISTS/);
	});
});

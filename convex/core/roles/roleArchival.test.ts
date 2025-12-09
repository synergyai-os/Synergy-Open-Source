import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx } from '../../_generated/server';
import { archiveRole } from './roleArchival';

vi.mock('../../sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'u1' })
}));

vi.mock('./roleAccess', () => ({
	ensureCircleExists: vi.fn().mockResolvedValue({ workspaceId: 'w1' }),
	ensureWorkspaceMembership: vi.fn(),
	countLeadRolesInCircle: vi.fn()
}));

describe('roleArchival.archiveRole', () => {
	test('throws when role is not found', async () => {
		const handler = (archiveRole as any).handler ?? (archiveRole as any);
		const ctx = {
			db: {
				get: vi.fn().mockResolvedValue(null)
			}
		} as unknown as MutationCtx;

		await expect(
			handler(ctx as any, { sessionId: 's1', circleRoleId: 'r1' as any })
		).rejects.toThrow(/ROLE_NOT_FOUND/);
	});
});

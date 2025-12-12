import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { requireProfilePermission, requireSessionUserId } from './access';

const mockUserId = 'user-1' as Id<'users'>;
const mockTargetUserId = 'user-2' as Id<'users'>;

vi.mock('../../infrastructure/sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'user-1' })
}));

const requirePermissionMock = vi.fn().mockResolvedValue(undefined);
vi.mock('../../rbac/permissions', () => ({
	requirePermission: (...args: unknown[]) => requirePermissionMock(...args)
}));

afterEach(() => {
	requirePermissionMock.mockClear();
	vi.clearAllMocks();
});

describe('users/access helpers', () => {
	it('requireSessionUserId returns validated userId', async () => {
		const ctx = {} as QueryCtx;

		const result = await requireSessionUserId(ctx, 'session-1');

		expect(result).toBe(mockUserId);
	});

	it('requireProfilePermission validates session and forwards permission check', async () => {
		const ctx = {} as MutationCtx;

		const result = await requireProfilePermission(ctx, 'session-2', mockTargetUserId);

		expect(result).toBe(mockUserId);
		expect(requirePermissionMock).toHaveBeenCalledWith(ctx, mockUserId, 'users.manage-profile', {
			resourceOwnerId: mockTargetUserId
		});
	});
});

import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx } from '../../_generated/server';
import { createCircleInternal } from './circleLifecycle';

vi.mock('../../sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'u1' })
}));

vi.mock('./circleAccess', () => ({
	ensureWorkspaceMembership: vi.fn()
}));

vi.mock('./validation', () => ({
	validateCircleName: vi.fn().mockReturnValue('Name required'),
	validateCircleNameUpdate: vi.fn()
}));

vi.mock('./slug', () => ({
	slugifyName: (name: string) => name
}));

vi.mock('./circleCoreRoles', () => ({
	createCoreRolesForCircle: vi.fn()
}));

vi.mock('../../orgVersionHistory', () => ({
	captureCreate: vi.fn(),
	captureUpdate: vi.fn()
}));

describe('circleLifecycle.createCircleInternal', () => {
	test('throws validation error code when name is invalid', async () => {
		const ctx = {
			db: {
				query: () => ({
					withIndex: () => ({
						collect: async () => []
					})
				}),
				insert: vi.fn(),
				get: vi.fn()
			}
		} as unknown as MutationCtx;

		await expect(
			createCircleInternal(ctx, {
				sessionId: 's1',
				workspaceId: 'w1' as any,
				name: '   ',
				purpose: undefined,
				parentCircleId: undefined
			})
		).rejects.toThrow(/VALIDATION_REQUIRED_FIELD/);
	});
});

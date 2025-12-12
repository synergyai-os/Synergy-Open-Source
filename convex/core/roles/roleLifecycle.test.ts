import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx } from '../../_generated/server';
import { create } from './roleLifecycle';

const { circleId, personId } = vi.hoisted(() => ({
	circleId: 'c1',
	personId: 'p1'
}));

vi.mock('./roleAccess', () => ({
	ensureCircleExists: vi.fn().mockResolvedValue({ workspaceId: 'w1' }),
	ensureWorkspaceMembership: vi.fn(),
	isLeadRole: vi.fn(),
	isWorkspaceAdmin: vi.fn(),
	requireWorkspacePersonFromSession: vi.fn().mockResolvedValue(personId)
}));

vi.mock('./validation', () => ({
	hasDuplicateRoleName: vi.fn().mockReturnValue(true)
}));

vi.mock('../history', () => ({
	recordCreateHistory: vi.fn(),
	recordUpdateHistory: vi.fn()
}));

describe('roleLifecycle.create', () => {
	test('throws when role name duplicates existing role (uses ErrorCodes)', async () => {
		const handler = (create as any).handler ?? (create as any);
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						collect: vi.fn().mockResolvedValue([])
					})
				}),
				insert: vi.fn()
			}
		} as unknown as MutationCtx;

		await expect(
			handler(ctx as any, {
				sessionId: 's1',
				circleId: circleId as any,
				name: 'Lead',
				purpose: undefined
			})
		).rejects.toThrow(/VALIDATION_INVALID_FORMAT/);
	});
});

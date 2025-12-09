import { describe, expect, test, vi } from 'vitest';

vi.mock('../../permissions', () => ({
	canAccessContent: vi.fn()
}));

import { canAccessContent } from '../../permissions';
import { ensureParentChainValid, validateTagName } from './validation';

const makeCtx = (opts: { parents?: Record<string, any> }) =>
	({
		db: {
			get: vi.fn(async (id: string) => opts.parents?.[id] ?? null)
		}
	}) as any;

describe('tags/validation', () => {
	test('validateTagName rejects empty names', () => {
		expect(() => validateTagName('')).toThrow(/TAG_NAME_REQUIRED/);
	});

	test('ensureParentChainValid rejects workspace mismatch', async () => {
		const ctx = makeCtx({
			parents: {
				parent1: {
					_id: 'parent1',
					userId: 'owner',
					workspaceId: 'ws-other',
					circleId: undefined,
					parentId: undefined
				}
			}
		});

		await expect(ensureParentChainValid(ctx, 'parent1', 'owner', 'ws1', undefined)).rejects.toThrow(
			/TAG_PARENT_WORKSPACE_MISMATCH/
		);
	});

	test('ensureParentChainValid rejects access denied when user differs', async () => {
		(canAccessContent as any).mockResolvedValue(false);
		const ctx = makeCtx({
			parents: {
				parent1: {
					_id: 'parent1',
					userId: 'other',
					workspaceId: 'ws1',
					circleId: undefined,
					parentId: undefined
				}
			}
		});

		await expect(ensureParentChainValid(ctx, 'parent1', 'owner', 'ws1', undefined)).rejects.toThrow(
			/TAG_PARENT_ACCESS_DENIED/
		);
	});
});

import { describe, expect, test, vi } from 'vitest';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

const accessMocks = vi.hoisted(() => ({
	ensureTagAccess: vi.fn()
}));

vi.mock('./access', () => accessMocks);

const { ensureTagAccess } = accessMocks;

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
		ensureTagAccess.mockResolvedValue(undefined);
		const ctx = makeCtx({
			parents: {
				parent1: {
					_id: 'parent1',
					personId: 'owner',
					workspaceId: 'ws-other',
					circleId: undefined,
					parentId: undefined
				}
			}
		});

		await expect(
			ensureParentChainValid(
				ctx,
				'parent1',
				{ personId: 'owner', workspaceId: 'ws1' } as any,
				'ws1',
				undefined
			)
		).rejects.toThrow(/TAG_PARENT_WORKSPACE_MISMATCH/);
	});

	test('ensureParentChainValid rejects access denied when person differs', async () => {
		ensureTagAccess.mockRejectedValue(createError(ErrorCodes.TAG_ACCESS_DENIED, 'denied'));
		const ctx = makeCtx({
			parents: {
				parent1: {
					_id: 'parent1',
					personId: 'other',
					workspaceId: 'ws1',
					circleId: undefined,
					parentId: undefined
				}
			}
		});

		await expect(
			ensureParentChainValid(
				ctx,
				'parent1',
				{ personId: 'owner', workspaceId: 'ws1' } as any,
				'ws1',
				undefined
			)
		).rejects.toThrow(/TAG_ACCESS_DENIED/);
	});
});

import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { requireQuickEditPermission } from './orgChartPermissions';

vi.mock('./rbac/permissions', () => ({
	hasPermission: async () => true
}));

function createCtx(orgSettings: Doc<'workspaceOrgSettings'> | null): MutationCtx {
	return {
		db: {
			query: (_table: string) => ({
				withIndex: (_index: string, _cb: (q: any) => any) => ({
					first: async () => orgSettings
				})
			})
		}
	} as unknown as MutationCtx;
}

const circle = {
	_id: 'c1' as Id<'circles'>,
	workspaceId: 'w1' as Id<'workspaces'>,
	circleType: 'hierarchy'
} as unknown as Doc<'circles'>;

describe('requireQuickEditPermission', () => {
	test('throws ErrorCodes when quick edits disabled', async () => {
		const ctx = createCtx({
			_id: 'os1' as Id<'workspaceOrgSettings'>,
			workspaceId: circle.workspaceId,
			allowQuickChanges: false
		} as unknown as Doc<'workspaceOrgSettings'>);

		await expect(requireQuickEditPermission(ctx, 'u1' as Id<'users'>, circle)).rejects.toThrow(
			/GENERIC_ERROR/
		);
	});
});

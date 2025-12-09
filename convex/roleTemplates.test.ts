import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { create as createTemplate } from './roleTemplates';

const mockUserId = 'u1' as Id<'users'>;
const workspaceId = 'w1' as Id<'workspaces'>;

vi.mock('./sessionValidation', () => ({
	validateSessionAndGetUserId: async () => ({ userId: mockUserId })
}));

function createCtx(role: string): MutationCtx {
	return {
		db: {
			query: (table: string) => ({
				withIndex: (_index: string, _cb: (q: any) => any) => ({
					first: async () => {
						if (table === 'workspaceMembers') {
							return { role, workspaceId, userId: mockUserId };
						}
						return null;
					}
				})
			}),
			insert: async () => 'rt1'
		}
	} as unknown as MutationCtx;
}

describe('roleTemplates.create', () => {
	test('requires admin/owner membership (uses ErrorCodes)', async () => {
		const handler = (createTemplate as any).handler ?? (createTemplate as any);
		const ctx = createCtx('member');

		await expect(
			handler(ctx as any, {
				sessionId: 's1',
				workspaceId,
				name: 'Template',
				description: undefined,
				isCore: false,
				isRequired: false
			})
		).rejects.toThrow(/AUTHZ_INSUFFICIENT_RBAC/);
	});
});

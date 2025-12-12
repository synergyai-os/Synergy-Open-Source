import { describe, expect, test, vi } from 'vitest';

import { ensureTagAccess, ensureWorkspaceMembership } from './access';

const makeCtx = (opts: { person?: any; circleMembers?: any[] }) =>
	({
		db: {
			get: vi.fn().mockResolvedValue(opts.person ?? null),
			query: vi.fn((table: string) => {
				if (table === 'circleMembers') {
					return {
						withIndex: vi.fn(() => ({
							first: vi.fn().mockResolvedValue(opts.circleMembers?.[0] ?? null)
						}))
					};
				}
				return { withIndex: vi.fn(() => ({ first: vi.fn().mockResolvedValue(null) })) };
			})
		}
	}) as any;

describe('tags/access', () => {
	test('ensureWorkspaceMembership throws when person is not in workspace', async () => {
		const ctx = makeCtx({ person: { _id: 'p1', workspaceId: 'ws2', status: 'active' } });

		await expect(ensureWorkspaceMembership(ctx, 'ws1', 'p1' as any)).rejects.toThrow(
			/WORKSPACE_ACCESS_DENIED/
		);
	});

	test('ensureTagAccess allows workspace tags for workspace member', async () => {
		const ctx = makeCtx({ person: { _id: 'p1', workspaceId: 'ws1', status: 'active' } });
		const actor = { personId: 'p1', workspaceId: 'ws1', user: 'u1' } as any;
		const tag = {
			_id: 't1',
			personId: 'p2',
			workspaceId: 'ws1',
			ownershipType: 'workspace'
		} as any;

		await expect(ensureTagAccess(ctx, actor, tag)).resolves.not.toThrow();
	});

	test('ensureTagAccess requires circle membership for circle tags', async () => {
		const ctx = makeCtx({ person: { _id: 'p1', workspaceId: 'ws1', status: 'active' } });
		const actor = { personId: 'p1', workspaceId: 'ws1', user: 'u1' } as any;
		const tag = {
			_id: 't1',
			personId: 'p2',
			workspaceId: 'ws1',
			circleId: 'c1',
			ownershipType: 'circle'
		} as any;

		await expect(ensureTagAccess(ctx, actor, tag)).rejects.toThrow(/AUTHZ_NOT_CIRCLE_MEMBER/);
	});
});

import { describe, expect, test, vi } from 'vitest';

import { ensureOwnershipContext, ensureWorkspaceMembership } from './access';

const makeCtx = (opts: { workspaceMembers?: any[]; circleMembers?: any[]; circle?: any }) =>
	({
		db: {
			query: vi.fn((table: string) => {
				if (table === 'workspaceMembers') {
					return {
						withIndex: vi.fn(() => ({
							first: vi.fn().mockResolvedValue(opts.workspaceMembers?.[0] ?? null),
							collect: vi.fn().mockResolvedValue(opts.workspaceMembers ?? [])
						}))
					};
				}
				if (table === 'circleMembers') {
					return {
						withIndex: vi.fn(() => ({
							first: vi.fn().mockResolvedValue(opts.circleMembers?.[0] ?? null)
						}))
					};
				}
				return { withIndex: vi.fn(() => ({ first: vi.fn().mockResolvedValue(null) })) };
			}),
			get: vi.fn().mockResolvedValue(opts.circle ?? null)
		}
	}) as any;

describe('tags/access', () => {
	test('ensureWorkspaceMembership throws when user is not a member', async () => {
		const ctx = makeCtx({ workspaceMembers: [] });

		await expect(ensureWorkspaceMembership(ctx, 'user1', 'ws1')).rejects.toThrow(
			/WORKSPACE_ACCESS_DENIED/
		);
	});

	test('ensureOwnershipContext requires circle membership for circle ownership', async () => {
		const ctx = makeCtx({ circleMembers: [], circle: { workspaceId: 'ws1' } });

		await expect(
			ensureOwnershipContext(ctx, 'user1', 'circle', undefined, 'circle1')
		).rejects.toThrow(/AUTHZ_NOT_CIRCLE_MEMBER/);
	});

	test('ensureOwnershipContext resolves workspace ownership with membership', async () => {
		const ctx = makeCtx({ workspaceMembers: [{ workspaceId: 'ws1', userId: 'user1' }] });

		const result = await ensureOwnershipContext(ctx, 'user1', 'workspace', 'ws1');

		expect(result).toEqual({ ownership: 'workspace', workspaceId: 'ws1' });
	});
});

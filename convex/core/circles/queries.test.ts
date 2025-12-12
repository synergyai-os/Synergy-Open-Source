import { describe, expect, test, vi } from 'vitest';
import type { QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { getCircleMembers } from './queries';

const { mockPersonId, mockWorkspaceId, mockCircleId } = vi.hoisted(() => ({
	mockPersonId: 'p1' as Id<'people'>,
	mockWorkspaceId: 'w1' as Id<'workspaces'>,
	mockCircleId: 'c1' as Id<'circles'>
}));

function createMockDb() {
	const data: Record<string, any[]> = {
		people: [
			{
				_id: mockPersonId,
				workspaceId: mockWorkspaceId,
				email: 'test@example.com',
				displayName: 'Test User'
			}
		],
		circles: [{ _id: mockCircleId, workspaceId: mockWorkspaceId }],
		circleMembers: [{ circleId: mockCircleId, personId: mockPersonId, joinedAt: 123 }]
	};

	const get = async (id: any) =>
		data.circles?.find((c) => c._id === id) ?? data.people?.find((u) => u._id === id) ?? null;

	const query = (table: string) => ({
		withIndex: (_name: string, _cb: (q: any) => any) => ({
			collect: async () => data[table] ?? [],
			first: async () => (data[table] ?? [])[0]
		})
	});

	return { get, query };
}

vi.mock('./circleAccess', () => ({
	requireWorkspacePersonFromSession: vi.fn().mockResolvedValue(mockPersonId),
	ensureWorkspaceMembership: vi.fn()
}));

describe('getCircleMembers helper', () => {
	test('returns non-null members filtered to existing users', async () => {
		const ctx = { db: createMockDb() } as unknown as QueryCtx;

		const result = await getCircleMembers(ctx, {
			sessionId: 's1',
			circleId: mockCircleId
		});

		expect(result).toEqual([
			{
				personId: mockPersonId,
				email: 'test@example.com',
				displayName: 'Test User',
				joinedAt: 123
			}
		]);
	});
});

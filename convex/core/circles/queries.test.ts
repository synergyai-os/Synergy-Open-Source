import { describe, expect, test, vi } from 'vitest';
import type { QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { getCircleMembers } from './queries';

const mockUserId = 'u1' as Id<'users'>;
const mockWorkspaceId = 'w1' as Id<'workspaces'>;
const mockCircleId = 'c1' as Id<'circles'>;

function createMockDb() {
	const data: Record<string, any[]> = {
		workspaceMembers: [{ workspaceId: mockWorkspaceId, userId: mockUserId }],
		circles: [{ _id: mockCircleId, workspaceId: mockWorkspaceId }],
		circleMembers: [
			{ circleId: mockCircleId, userId: mockUserId, joinedAt: 123 },
			{ circleId: mockCircleId, userId: 'ghost', joinedAt: 456 }
		],
		users: [{ _id: mockUserId, email: 'test@example.com', name: 'Test User' }]
	};

	const get = async (id: any) =>
		data.circles?.find((c) => c._id === id) ?? data.users?.find((u) => u._id === id);

	const query = (table: string) => ({
		withIndex: (_name: string, _cb: (q: any) => any) => ({
			collect: async () => data[table] ?? [],
			first: async () => (data[table] ?? [])[0]
		})
	});

	return { get, query };
}

vi.mock('../../sessionValidation', () => ({
	validateSessionAndGetUserId: async () => ({ userId: mockUserId })
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
				userId: mockUserId,
				email: 'test@example.com',
				name: 'Test User',
				joinedAt: 123
			}
		]);
	});
});

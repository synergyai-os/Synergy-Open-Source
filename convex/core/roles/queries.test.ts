import { describe, expect, test, vi } from 'vitest';
import type { QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { listMembersWithoutRoles } from './queries';

const mockUserId = 'u1' as Id<'users'>;
const mockWorkspaceId = 'w1' as Id<'workspaces'>;
const mockCircleId = 'c1' as Id<'circles'>;

function createMockDb() {
	const data: Record<string, any[]> = {
		workspaceMembers: [{ workspaceId: mockWorkspaceId, userId: mockUserId }],
		circles: [{ _id: mockCircleId, workspaceId: mockWorkspaceId }],
		circleRoles: [],
		circleMembers: [
			{ circleId: mockCircleId, userId: mockUserId, joinedAt: 100 },
			{ circleId: mockCircleId, userId: 'u2', joinedAt: 200 }
		],
		userCircleRoles: []
	};

	const get = async (id: any) => data.circles.find((c) => c._id === id);

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

describe('listMembersWithoutRoles helper', () => {
	test('returns members when no roles exist', async () => {
		const ctx = { db: createMockDb() } as unknown as QueryCtx;

		const result = await listMembersWithoutRoles(ctx, {
			sessionId: 's1',
			circleId: mockCircleId
		});

		expect(result).toEqual([
			{
				userId: mockUserId,
				email: '',
				name: '',
				joinedAt: 100
			},
			{
				userId: 'u2',
				email: '',
				name: '',
				joinedAt: 200
			}
		]);
	});
});

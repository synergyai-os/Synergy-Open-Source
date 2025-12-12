import { describe, expect, test, vi } from 'vitest';
import type { QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { listMembersWithoutRoles } from './queries';

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
				status: 'active',
				email: '',
				displayName: ''
			},
			{ _id: 'p2', workspaceId: mockWorkspaceId, status: 'active', email: '', displayName: '' }
		],
		circles: [{ _id: mockCircleId, workspaceId: mockWorkspaceId }],
		circleRoles: [],
		circleMembers: [
			{ circleId: mockCircleId, personId: mockPersonId, joinedAt: 100 },
			{ circleId: mockCircleId, personId: 'p2', joinedAt: 200 }
		],
		userCircleRoles: []
	};

	const get = async (id: any) =>
		[...data.circles, ...data.people].find((c) => c._id === id) ?? null;

	const query = (table: string) => ({
		withIndex: (_name: string, _cb: (q: any) => any) => ({
			collect: async () => data[table] ?? [],
			first: async () => (data[table] ?? [])[0]
		})
	});

	return { get, query };
}

vi.mock('./roleAccess', () => ({
	requireWorkspacePersonFromSession: vi.fn().mockResolvedValue(mockPersonId),
	ensureWorkspaceMembership: vi.fn()
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
				personId: mockPersonId,
				email: '',
				displayName: '',
				joinedAt: 100
			},
			{
				personId: 'p2',
				email: '',
				displayName: '',
				joinedAt: 200
			}
		]);
	});
});

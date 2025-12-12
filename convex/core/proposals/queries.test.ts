import { describe, expect, test, vi } from 'vitest';
import type { QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { listProposalsQuery } from './proposalQueries';

const mockConvexUser = 'u1' as Id<'users'>;
const mockPersonId = 'p1' as Id<'people'>;
const mockWorkspaceId = 'w1' as Id<'workspaces'>;
const mockCircleId = 'c1' as Id<'circles'>;

function createMockDb() {
	const proposals = [
		{
			_id: 'p1',
			workspaceId: mockWorkspaceId,
			status: 'draft',
			circleId: mockCircleId,
			createdByPersonId: mockPersonId,
			createdAt: 3
		},
		{
			_id: 'p2',
			workspaceId: mockWorkspaceId,
			status: 'submitted',
			circleId: mockCircleId,
			createdByPersonId: mockPersonId,
			createdAt: 2
		},
		{
			_id: 'p3',
			workspaceId: 'other',
			status: 'draft',
			circleId: mockCircleId,
			createdByPersonId: mockPersonId,
			createdAt: 1
		}
	];

	const collections: Record<string, any[]> = {
		circleProposals: proposals
	};

	const query = (table: string) => ({
		withIndex: (name: string, cb: (q: any) => any) => {
			cb({ eq: () => ({ eq: () => null }) }); // no-op matcher

			let result = collections[table] ?? [];
			if (name === 'by_workspace_status') {
				result = result.filter(
					(p) => p.workspaceId === mockWorkspaceId && p.status === 'submitted'
				);
			} else if (name === 'by_workspace') {
				result = result.filter((p) => p.workspaceId === mockWorkspaceId);
			} else if (name === 'by_circle') {
				result = result.filter((p) => p.circleId === mockCircleId);
			} else if (name === 'by_creatorPerson') {
				result = result.filter((p) => p.createdByPersonId === mockPersonId);
			}

			return {
				collect: async () => result,
				first: async () => result[0]
			};
		}
	});

	return {
		query,
		get: async () => null
	};
}

vi.mock('./proposalAccess', () => ({
	ensureWorkspaceMembership: vi.fn(async () => undefined)
}));

vi.mock('../people/queries', () => ({
	getPersonForSessionAndWorkspace: vi.fn(async () => ({
		person: {
			_id: mockPersonId,
			workspaceId: mockWorkspaceId,
			status: 'active'
		},
		workspaceId: mockWorkspaceId,
		linkedUser: mockConvexUser
	}))
}));

describe('listProposalsQuery helper', () => {
	test('filters by workspace and status when provided', async () => {
		const ctx = { db: createMockDb() } as unknown as QueryCtx;

		const result = await listProposalsQuery(ctx, {
			sessionId: 's1',
			workspaceId: mockWorkspaceId,
			status: 'submitted'
		});

		expect(result).toEqual([
			{
				_id: 'p2',
				workspaceId: mockWorkspaceId,
				status: 'submitted',
				circleId: mockCircleId,
				createdByPersonId: mockPersonId,
				createdAt: 2
			}
		]);
	});

	test('applies limit and sorts by createdAt desc', async () => {
		const ctx = { db: createMockDb() } as unknown as QueryCtx;

		const result = await listProposalsQuery(ctx, {
			sessionId: 's1',
			workspaceId: mockWorkspaceId,
			limit: 1
		});

		expect(result).toEqual([
			{
				_id: 'p1',
				workspaceId: mockWorkspaceId,
				status: 'draft',
				circleId: mockCircleId,
				createdByPersonId: mockPersonId,
				createdAt: 3
			}
		]);
	});
});

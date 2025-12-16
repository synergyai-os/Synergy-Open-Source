/**
 * Proposal domain tests
 *
 * Co-located tests for queries, mutations, and business rules.
 */

import { describe, expect, test, vi } from 'vitest';
import type { QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { listProposalsQuery } from './queries';
import { assertTransition, canTransition, isTerminalState } from './rules';
import { VALID_TRANSITIONS } from './constants';
import type { ProposalStatus } from './schema';

// ============================================================================
// Query Tests
// ============================================================================

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

vi.mock('./rules', async () => {
	const actual = await vi.importActual('./rules');
	return {
		...actual,
		ensureWorkspaceMembership: vi.fn(async () => undefined)
	};
});

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

describe('Queries', () => {
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
});

// ============================================================================
// State Machine Tests
// ============================================================================

const validPaths: [ProposalStatus, ProposalStatus][] = [
	['draft', 'submitted'],
	['draft', 'withdrawn'],
	['submitted', 'in_meeting'],
	['submitted', 'withdrawn'],
	['in_meeting', 'objections'],
	['in_meeting', 'integrated'],
	['in_meeting', 'approved'],
	['in_meeting', 'rejected'],
	['in_meeting', 'withdrawn'],
	['objections', 'integrated'],
	['objections', 'rejected'],
	['objections', 'withdrawn'],
	['integrated', 'approved'],
	['integrated', 'rejected'],
	['integrated', 'withdrawn']
];

describe('State Machine', () => {
	describe('VALID_TRANSITIONS', () => {
		test('includes only known statuses', () => {
			const keys = Object.keys(VALID_TRANSITIONS);
			const values = Object.values(VALID_TRANSITIONS).flat();

			for (const status of [...keys, ...values]) {
				expect(status).toMatch(
					/^(draft|submitted|in_meeting|objections|integrated|approved|rejected|withdrawn)$/
				);
			}
		});
	});

	describe('canTransition', () => {
		test('allows documented valid transitions', () => {
			for (const [from, to] of validPaths) {
				expect(canTransition(from, to)).toBe(true);
			}
		});

		test('blocks invalid transitions', () => {
			expect(canTransition('approved', 'draft')).toBe(false);
			expect(canTransition('withdrawn', 'submitted')).toBe(false);
			expect(canTransition('draft', 'approved')).toBe(false);
			expect(canTransition('integrated', 'submitted')).toBe(false);
		});
	});

	describe('assertTransition', () => {
		test('does not throw for valid transitions', () => {
			expect(() => assertTransition('draft', 'submitted', 'test')).not.toThrow();
			expect(() => assertTransition('integrated', 'approved', 'test')).not.toThrow();
		});

		test('throws for invalid transitions', () => {
			expect(() => assertTransition('approved', 'draft' as ProposalStatus, 'test')).toThrow();
			expect(() => assertTransition('draft', 'approved', 'test')).toThrow();
		});
	});

	describe('isTerminalState', () => {
		test('identifies terminal statuses', () => {
			expect(isTerminalState('approved')).toBe(true);
			expect(isTerminalState('rejected')).toBe(true);
			expect(isTerminalState('withdrawn')).toBe(true);
		});

		test('non-terminal statuses return false', () => {
			expect(isTerminalState('draft')).toBe(false);
			expect(isTerminalState('in_meeting')).toBe(false);
			expect(isTerminalState('integrated')).toBe(false);
		});
	});
});


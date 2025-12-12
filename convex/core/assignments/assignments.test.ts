import { describe, expect, test, vi } from 'vitest';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { create, end } from './mutations';
import { isAssignedToRole } from './queries';

vi.mock('./queries', async () => {
	const actual = await vi.importActual<typeof import('./queries')>('./queries');
	return {
		...actual,
		getActiveAssignmentForRole: vi.fn(),
		requireAssignment: vi.fn()
	};
});

vi.mock('./rules', () => ({
	canCreateAssignment: vi.fn(),
	canEndAssignment: vi.fn(),
	hasTermEnded: vi.fn().mockReturnValue(false),
	requireActiveAssignment: vi.fn(),
	requireAssignment: vi.fn()
}));

vi.mock('../circles/rules', () => ({
	requireCircle: vi.fn()
}));

vi.mock('../circles/circleAccess', () => ({
	ensureWorkspaceMembership: vi.fn(),
	requireWorkspacePersonFromSession: vi.fn()
}));

vi.mock('../people/queries', () => ({
	getPersonByUserAndWorkspace: vi.fn()
}));

import { getActiveAssignmentForRole } from './queries';
import {
	canCreateAssignment,
	canEndAssignment,
	requireActiveAssignment,
	hasTermEnded
} from './rules';
import { requireCircle } from '../circles/rules';
import { requireWorkspacePersonFromSession } from '../circles/circleAccess';
import { getPersonByUserAndWorkspace } from '../people/queries';

describe('assignments.create', () => {
	test('rejects when active assignment already exists', async () => {
		(requireCircle as ReturnType<typeof vi.fn>).mockResolvedValue({
			_id: 'circle-1',
			workspaceId: 'ws-1'
		});
		(requireWorkspacePersonFromSession as ReturnType<typeof vi.fn>).mockResolvedValue(
			'person-actor'
		);
		(getPersonByUserAndWorkspace as ReturnType<typeof vi.fn>).mockResolvedValue({
			_id: 'person-target',
			workspaceId: 'ws-1'
		});
		(canCreateAssignment as ReturnType<typeof vi.fn>).mockResolvedValue(true);
		(hasTermEnded as ReturnType<typeof vi.fn>).mockReturnValue(false);
		(getActiveAssignmentForRole as ReturnType<typeof vi.fn>).mockResolvedValue({ _id: 'existing' });

		const handler = (create as any).handler ?? (create as any);
		const ctx = {
			db: {
				get: vi.fn().mockImplementation((id: string) => {
					if (id === 'circle-role-1') {
						return {
							_id: 'circle-role-1',
							circleId: 'circle-1'
						};
					}
					return null;
				}),
				insert: vi.fn(),
				query: vi.fn()
			}
		} as unknown as MutationCtx;

		await expect(
			handler(ctx, {
				sessionId: 'session-1',
				circleId: 'circle-1' as any,
				roleId: 'circle-role-1' as any,
				assigneeUserId: 'user-target' as any
			})
		).rejects.toThrow(/ASSIGNMENT_ALREADY_EXISTS/);
	});
});

describe('assignments.end', () => {
	test('marks assignment as ended', async () => {
		(requireActiveAssignment as ReturnType<typeof vi.fn>).mockResolvedValue({
			_id: 'assignment-1',
			circleId: 'circle-1',
			status: 'active'
		});
		(requireCircle as ReturnType<typeof vi.fn>).mockResolvedValue({
			_id: 'circle-1',
			workspaceId: 'ws-1'
		});
		(requireWorkspacePersonFromSession as ReturnType<typeof vi.fn>).mockResolvedValue(
			'person-actor'
		);
		(canEndAssignment as ReturnType<typeof vi.fn>).mockResolvedValue(true);

		const handler = (end as any).handler ?? (end as any);
		const patch = vi.fn();
		const ctx = {
			db: {
				patch
			}
		} as unknown as MutationCtx;

		const result = await handler(ctx, {
			sessionId: 'session-1',
			assignmentId: 'assignment-1' as any,
			endReason: 'reassigned'
		});

		expect(result).toEqual({ success: true });
		expect(patch).toHaveBeenCalledWith(
			'assignment-1',
			expect.objectContaining({ status: 'ended', endedByPersonId: 'person-actor' })
		);
	});
});

describe('assignments queries', () => {
	test('isAssignedToRole returns false when no active assignment', async () => {
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue(null)
					})
				})
			}
		} as unknown as QueryCtx;

		const result = await isAssignedToRole(ctx, 'person-1' as any, 'role-1' as any);
		expect(result).toBe(false);
	});

	test('isAssignedToRole returns true when active assignment exists', async () => {
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue({ status: 'active' })
					})
				})
			}
		} as unknown as QueryCtx;

		const result = await isAssignedToRole(ctx, 'person-1' as any, 'role-1' as any);
		expect(result).toBe(true);
	});
});

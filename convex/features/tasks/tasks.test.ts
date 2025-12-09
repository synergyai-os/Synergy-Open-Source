import { afterEach, describe, expect, test, vi } from 'vitest';

import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { ErrorCodes } from '../../infrastructure/errors/codes';
import { ensureWorkspaceMembership, getMeetingForTaskOrThrow, getTaskOrThrow } from './access';
import { updateTaskAssignee } from './assignments';
import { createTask, updateTaskDetails, updateTaskRemoval, updateTaskStatus } from './lifecycle';
import { listTasks } from './queries';

type AnyCtx = MutationCtx | QueryCtx;

const makeWorkspaceQuery = (membership: any | null) =>
	vi.fn().mockImplementation((table: string) => {
		if (table === 'workspaceMembers') {
			return {
				withIndex: vi.fn().mockImplementation((_indexName: string, cb?: any) => {
					const builder = { eq: vi.fn().mockReturnThis() };
					cb?.(builder);
					return { first: vi.fn().mockResolvedValue(membership) };
				})
			};
		}

		throw new Error(`Unexpected table ${table}`);
	});

const makeWorkspaceAndTasksQuery = (membership: any | null, tasks: any[]) =>
	vi.fn().mockImplementation((table: string) => {
		if (table === 'workspaceMembers') {
			return {
				withIndex: vi.fn().mockImplementation((_indexName: string, cb?: any) => {
					const builder = { eq: vi.fn().mockReturnThis() };
					cb?.(builder);
					return { first: vi.fn().mockResolvedValue(membership) };
				})
			};
		}

		if (table === 'tasks') {
			return {
				withIndex: vi.fn().mockImplementation((_indexName: string, cb?: any) => {
					const builder = { eq: vi.fn().mockReturnThis() };
					cb?.(builder);
					return { collect: vi.fn().mockResolvedValue(tasks) };
				})
			};
		}

		throw new Error(`Unexpected table ${table}`);
	});

afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe('tasks access helpers', () => {
	test('ensureWorkspaceMembership rejects non-members', async () => {
		const ctx = { db: { query: makeWorkspaceQuery(null) } } as unknown as AnyCtx;

		await expect(ensureWorkspaceMembership(ctx, 'w1' as any, 'u1' as any)).rejects.toThrow(
			`${ErrorCodes.WORKSPACE_ACCESS_DENIED}: User is not a member of this workspace`
		);
	});

	test('getTaskOrThrow throws when task missing', async () => {
		const ctx = {
			db: { get: vi.fn().mockResolvedValue(null) }
		} as unknown as AnyCtx;

		await expect(getTaskOrThrow(ctx, 't1' as any)).rejects.toThrow(
			`${ErrorCodes.TASK_NOT_FOUND}: Task not found`
		);
	});

	test('getMeetingForTaskOrThrow enforces meeting existence', async () => {
		const ctx = {
			db: { get: vi.fn().mockResolvedValue(null) }
		} as unknown as AnyCtx;

		await expect(getMeetingForTaskOrThrow(ctx, 'm1' as any)).rejects.toThrow(
			`${ErrorCodes.MEETING_NOT_FOUND}: Meeting not found`
		);
	});
});

describe('tasks queries', () => {
	test('listTasks filters by status and requires membership', async () => {
		const tasks = [
			{ _id: 't1', status: 'todo' },
			{ _id: 't2', status: 'done' }
		];
		const query = makeWorkspaceAndTasksQuery({ _id: 'membership1' }, tasks);
		const ctx = { db: { query } } as unknown as QueryCtx;

		const result = await listTasks(ctx, {
			workspaceId: 'w1' as any,
			status: 'done',
			userId: 'u1' as any
		});

		expect(result).toEqual([{ _id: 't2', status: 'done' }]);
	});
});

describe('tasks mutations', () => {
	test('createTask inserts when access and inputs are valid', async () => {
		vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00Z').getTime());

		const insert = vi.fn().mockResolvedValue('task123');
		const query = makeWorkspaceQuery({ _id: 'membership1' });
		const get = vi.fn().mockImplementation((id: string) => {
			if (id === 'm1') return Promise.resolve({ _id: 'm1', workspaceId: 'w1' });
			if (id === 'a1') return Promise.resolve({ _id: 'a1', meetingId: 'm1' });
			if (id === 'p1') return Promise.resolve({ _id: 'p1', workspaceId: 'w1' });
			return Promise.resolve(null);
		});

		const ctx = { db: { insert, query, get } } as unknown as MutationCtx;

		const result = await createTask(ctx, {
			workspaceId: 'w1' as any,
			meetingId: 'm1' as any,
			agendaItemId: 'a1' as any,
			projectId: 'p1' as any,
			circleId: 'c1' as any,
			assigneeType: 'user',
			assigneeUserId: 'assignee1' as any,
			description: 'Test task',
			dueDate: 123,
			status: 'in-progress',
			userId: 'u1' as any
		});

		expect(result.actionItemId).toBe('task123');
		expect(insert).toHaveBeenCalledWith(
			'tasks',
			expect.objectContaining({
				workspaceId: 'w1',
				meetingId: 'm1',
				agendaItemId: 'a1',
				projectId: 'p1',
				circleId: 'c1',
				assigneeType: 'user',
				assigneeUserId: 'assignee1',
				description: 'Test task',
				dueDate: 123,
				status: 'in-progress',
				createdAt: Date.now(),
				createdBy: 'u1'
			})
		);
	});

	test('createTask rejects mismatched meeting workspace', async () => {
		const query = makeWorkspaceQuery({ _id: 'membership1' });
		const get = vi.fn().mockImplementation((id: string) => {
			if (id === 'm1') return Promise.resolve({ _id: 'm1', workspaceId: 'other' });
			return Promise.resolve(null);
		});
		const ctx = { db: { query, get } } as unknown as MutationCtx;

		await expect(
			createTask(ctx, {
				workspaceId: 'w1' as any,
				meetingId: 'm1' as any,
				assigneeType: 'user',
				assigneeUserId: 'assignee1' as any,
				description: 'Test task',
				userId: 'u1' as any
			})
		).rejects.toThrow(
			`${ErrorCodes.WORKSPACE_ACCESS_DENIED}: Meeting does not belong to this workspace`
		);
	});

	test('createTask rejects missing assignee details', async () => {
		const ctx = {
			db: { query: makeWorkspaceQuery({ _id: 'membership1' }) }
		} as unknown as MutationCtx;

		await expect(
			createTask(ctx, {
				workspaceId: 'w1' as any,
				assigneeType: 'user',
				description: 'Task without assignee',
				userId: 'u1' as any
			})
		).rejects.toThrow(
			`${ErrorCodes.VALIDATION_REQUIRED_FIELD}: assigneeUserId is required when assigneeType is user`
		);
	});

	test('updateTaskDetails rejects project workspace mismatch', async () => {
		const query = makeWorkspaceQuery({ _id: 'membership1' });
		const get = vi.fn().mockImplementation((id: string) => {
			if (id === 'task1') {
				return Promise.resolve({ _id: 'task1', workspaceId: 'w1', meetingId: 'm1' });
			}
			if (id === 'm1') {
				return Promise.resolve({ _id: 'm1', workspaceId: 'w1' });
			}
			if (id === 'projectX') {
				return Promise.resolve({ _id: 'projectX', workspaceId: 'other' });
			}
			return Promise.resolve(null);
		});
		const ctx = { db: { query, get, patch: vi.fn() } } as unknown as MutationCtx;

		await expect(
			updateTaskDetails(ctx, {
				actionItemId: 'task1' as any,
				projectId: 'projectX' as any,
				userId: 'u1' as any
			})
		).rejects.toThrow(
			`${ErrorCodes.WORKSPACE_ACCESS_DENIED}: Project does not belong to this workspace`
		);
	});

	test('updateTaskStatus patches status and timestamp', async () => {
		vi.useFakeTimers().setSystemTime(new Date('2024-02-01T00:00:00Z').getTime());

		const patch = vi.fn();
		const query = makeWorkspaceQuery({ _id: 'membership1' });
		const get = vi.fn().mockResolvedValue({ _id: 'task1', workspaceId: 'w1' });
		const ctx = { db: { query, get, patch } } as unknown as MutationCtx;

		await updateTaskStatus(ctx, {
			actionItemId: 'task1' as any,
			status: 'done',
			userId: 'u1' as any
		});

		expect(patch).toHaveBeenCalledWith('task1', {
			status: 'done',
			updatedAt: Date.now()
		});
	});

	test('updateTaskStatus errors when meeting referenced but missing', async () => {
		const patch = vi.fn();
		const query = makeWorkspaceQuery({ _id: 'membership1' });
		const get = vi.fn().mockImplementation((id: string) => {
			if (id === 'task1') {
				return Promise.resolve({ _id: 'task1', workspaceId: 'w1', meetingId: 'missing' });
			}
			return Promise.resolve(null);
		});
		const ctx = { db: { query, get, patch } } as unknown as MutationCtx;

		await expect(
			updateTaskStatus(ctx, {
				actionItemId: 'task1' as any,
				status: 'done',
				userId: 'u1' as any
			})
		).rejects.toThrow(`${ErrorCodes.MEETING_NOT_FOUND}: Meeting not found`);
	});

	test('updateTaskAssignee enforces assignee validation', async () => {
		const query = makeWorkspaceQuery({ _id: 'membership1' });
		const get = vi.fn().mockResolvedValue({ _id: 'task1', workspaceId: 'w1' });
		const patch = vi.fn();
		const ctx = { db: { query, get, patch } } as unknown as MutationCtx;

		await expect(
			updateTaskAssignee(ctx, {
				actionItemId: 'task1' as any,
				assigneeType: 'role',
				userId: 'u1' as any
			})
		).rejects.toThrow(
			`${ErrorCodes.VALIDATION_REQUIRED_FIELD}: assigneeRoleId is required when assigneeType is role`
		);
	});

	test('updateTaskRemoval deletes the task', async () => {
		const del = vi.fn();
		const query = makeWorkspaceQuery({ _id: 'membership1' });
		const get = vi.fn().mockResolvedValue({ _id: 'task1', workspaceId: 'w1' });
		const ctx = { db: { query, get, delete: del } } as unknown as MutationCtx;

		await updateTaskRemoval(ctx, { actionItemId: 'task1' as any, userId: 'u1' as any });

		expect(del).toHaveBeenCalledWith('task1');
	});
});

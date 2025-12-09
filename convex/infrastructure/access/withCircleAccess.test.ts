import { describe, expect, test, vi } from 'vitest';
import type { Doc, Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { withCircleAccess } from './withCircleAccess';

const baseCircle = {
	_id: 'circle1' as Id<'circles'>,
	workspaceId: 'workspace1' as Id<'workspaces'>,
	archivedAt: undefined
} as Pick<Doc<'circles'>, '_id' | 'workspaceId' | 'archivedAt'>;

describe('withCircleAccess', () => {
	const ctx = {} as QueryCtx;
	const userId = 'user1' as Id<'users'>;

	test('returns handler result when access checks pass', async () => {
		const deps = {
			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }),
			getCircle: vi.fn().mockResolvedValue(baseCircle),
			isWorkspaceMember: vi.fn().mockResolvedValue(true)
		};

		const result = await withCircleAccess(
			ctx,
			{ sessionId: 's', circleId: baseCircle._id },
			async ({ userId: receivedUserId, circle }) => {
				expect(receivedUserId).toBe(userId);
				expect(circle._id).toBe(baseCircle._id);
				return 'ok';
			},
			{},
			deps
		);

		expect(result).toBe('ok');
	});

	test('throws when circle is not found', async () => {
		const deps = {
			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }),
			getCircle: vi.fn().mockResolvedValue(null),
			isWorkspaceMember: vi.fn()
		};

		await expect(
			withCircleAccess(
				ctx,
				{ sessionId: 's', circleId: baseCircle._id },
				async () => 'ok',
				{},
				deps
			)
		).rejects.toThrow(/CIRCLE_NOT_FOUND/);
	});

	test('blocks archived circle by default', async () => {
		const deps = {
			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }),
			getCircle: vi.fn().mockResolvedValue({ ...baseCircle, archivedAt: Date.now() }),
			isWorkspaceMember: vi.fn().mockResolvedValue(true)
		};

		await expect(
			withCircleAccess(
				ctx,
				{ sessionId: 's', circleId: baseCircle._id },
				async () => 'ok',
				{},
				deps
			)
		).rejects.toThrow(/CIRCLE_ARCHIVED/);
	});

	test('allows archived circle when explicitly permitted', async () => {
		const deps = {
			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }),
			getCircle: vi.fn().mockResolvedValue({ ...baseCircle, archivedAt: Date.now() }),
			isWorkspaceMember: vi.fn().mockResolvedValue(true)
		};

		const result = await withCircleAccess(
			ctx,
			{ sessionId: 's', circleId: baseCircle._id },
			async () => 'ok',
			{ allowArchivedCircle: true },
			deps
		);

		expect(result).toBe('ok');
	});

	test('denies when workspace membership check fails', async () => {
		const deps = {
			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }),
			getCircle: vi.fn().mockResolvedValue(baseCircle),
			isWorkspaceMember: vi.fn().mockResolvedValue(false)
		};

		await expect(
			withCircleAccess(
				ctx,
				{ sessionId: 's', circleId: baseCircle._id },
				async () => 'ok',
				{},
				deps
			)
		).rejects.toThrow(/WORKSPACE_ACCESS_DENIED/);
	});

	test('skips workspace membership when disabled', async () => {
		const deps = {
			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId }),
			getCircle: vi.fn().mockResolvedValue(baseCircle),
			isWorkspaceMember: vi.fn()
		};

		const result = await withCircleAccess(
			ctx,
			{ sessionId: 's', circleId: baseCircle._id },
			async () => 'ok',
			{ requireWorkspaceMembership: false },
			deps
		);

		expect(result).toBe('ok');
	});
});

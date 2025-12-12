import { describe, expect, test, vi } from 'vitest';

vi.mock('./helpers/access', () => ({
	requireWorkspacePersonFromSession: vi.fn().mockResolvedValue({ personId: 'person1' }),
	ensureWorkspaceMembership: vi.fn(),
	requireMeeting: vi.fn(async (ctx, id) => {
		const meeting = await (ctx as MutationCtx).db.get(id);

		if (!meeting) {
			throw new Error('Meeting not found');
		}

		return meeting;
	})
}));

import type { MutationCtx } from '../../_generated/server';
import { updateMeetingCancel, restoreMeeting } from './helpers/mutations/lifecycle';
import { ErrorCodes } from '../../infrastructure/errors/codes';

const makeCtx = (meeting: any) =>
	({
		db: {
			get: vi.fn().mockResolvedValue(meeting),
			patch: vi.fn().mockResolvedValue(undefined),
			query: vi.fn(() => ({ withIndex: () => ({ first: vi.fn() }) }))
		}
	}) as unknown as MutationCtx;

describe('meetings lifecycle helpers', () => {
	test('cancel meeting sets canceledAt', async () => {
		const ctx = makeCtx({ _id: 'm1', workspaceId: 'w1' });

		await expect(updateMeetingCancel(ctx, { sessionId: 's', meetingId: 'm1' })).resolves.toEqual({
			success: true
		});

		expect((ctx.db as any).patch).toHaveBeenCalledWith('m1', {
			canceledAt: expect.any(Number),
			updatedAt: expect.any(Number)
		});
	});

	test('cancel meeting fails when started', async () => {
		const ctx = makeCtx({ _id: 'm1', workspaceId: 'w1', startedAt: Date.now() });

		await expect(updateMeetingCancel(ctx, { sessionId: 's', meetingId: 'm1' })).rejects.toThrow(
			`${ErrorCodes.GENERIC_ERROR}: Cannot cancel a meeting that has started`
		);
	});

	test('restore clears canceled/deleted flags', async () => {
		const ctx = makeCtx({
			_id: 'm1',
			workspaceId: 'w1',
			canceledAt: Date.now(),
			deletedAt: Date.now()
		});

		await expect(restoreMeeting(ctx, { sessionId: 's', meetingId: 'm1' })).resolves.toEqual({
			success: true
		});

		expect((ctx.db as any).patch).toHaveBeenCalledWith('m1', {
			canceledAt: undefined,
			deletedAt: undefined,
			updatedAt: expect.any(Number)
		});
	});
});

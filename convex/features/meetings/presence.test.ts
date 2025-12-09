import { describe, expect, test, vi } from 'vitest';

vi.mock('../../infrastructure/sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'user1' })
}));

import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { handleRecordHeartbeat } from './presence';
import { ErrorCodes } from '../../infrastructure/errors/codes';

type Ctx = MutationCtx | QueryCtx;

const makeCtx = (): Ctx =>
	({
		db: {
			get: vi.fn().mockResolvedValue(null)
		}
	}) as unknown as Ctx;

describe('meetings/presence', () => {
	test('recordHeartbeat throws when meeting is missing with coded error', async () => {
		const ctx = makeCtx();
		const deps = {
			validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'user1' })
		};

		await expect(
			handleRecordHeartbeat(
				ctx as MutationCtx,
				{ sessionId: 's', meetingId: 'm1' as any },
				{
					validateSessionAndGetUserId: deps.validateSessionAndGetUserId,
					getMeeting: async () => null
				}
			)
		).rejects.toThrow(`${ErrorCodes.MEETING_NOT_FOUND}: Meeting not found`);
	});
});

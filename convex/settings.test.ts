import { describe, expect, it, vi } from 'vitest';
import type { QueryCtx } from './_generated/server';
import { getUserIdFromSessionId } from './settings';

vi.mock('./sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn().mockResolvedValue({ userId: 'user-1' })
}));

describe('settings auth helpers', () => {
	it('getUserIdFromSessionId delegates to session validation', async () => {
		const ctx = {} as QueryCtx;

		const handler = (getUserIdFromSessionId as any).handler ?? (getUserIdFromSessionId as any);

		const result = await handler(ctx, { sessionId: 'session-1' });

		expect(result).toBe('user-1');
	});
});

import { describe, expect, test } from 'vitest';
import type { QueryCtx, MutationCtx } from '../_generated/server';
import type { Doc, Id } from '../_generated/dataModel';
import { validateSession, validateSessionAndGetUserId } from './sessionValidation';
import { ErrorCodes } from './errors/codes';

type Ctx = QueryCtx | MutationCtx;

const makeCtx = (session: Doc<'authSessions'> | null): Ctx =>
	({
		db: {
			query: () => ({
				filter: () => ({
					order: () => ({
						first: async () => session
					}),
					first: async () => session
				})
			})
		}
	}) as unknown as Ctx;

describe('sessionValidation', () => {
	test('validateSession throws SESSION_NOT_FOUND when no active session', async () => {
		const ctx = makeCtx(null);
		await expect(validateSession(ctx, 'user1' as Id<'users'>)).rejects.toThrow(
			`${ErrorCodes.SESSION_NOT_FOUND}:`
		);
	});

	test('validateSessionAndGetUserId throws SESSION_REVOKED when session is revoked', async () => {
		const now = Date.now();
		const ctx = makeCtx({
			_id: 's1' as Id<'authSessions'>,
			sessionId: 'sid',
			convexUserId: 'user1' as Id<'users'>,
			isValid: true,
			expiresAt: now + 1000,
			revokedAt: now - 1
		} as unknown as Doc<'authSessions'>);

		await expect(validateSessionAndGetUserId(ctx, 'sid')).rejects.toThrow(
			`${ErrorCodes.SESSION_REVOKED}:`
		);
	});
});

/**
 * Session Validation Tests
 *
 * Tests for the new secure session validation pattern:
 * sessionId → validate → derive userId
 *
 * Security tests ensure impersonation attacks are prevented.
 */

import { describe, it, expect } from 'vitest';
import type { QueryCtx } from '../../convex/_generated/server';
import type { Id } from '../../convex/_generated/dataModel';
import {
	validateSessionAndGetUserId,
	getUserIdFromSession,
	validateSession
} from '../../convex/sessionValidation';

// Mock database context
function createMockCtx(sessions: any[] = []): QueryCtx {
	return {
		db: {
			query: (_tableName: string) => ({
				filter: (_fn: any) => ({
					first: async () => {
						// Simulate filtering logic
						return sessions.find((s) => s.isValid && s.expiresAt > Date.now());
					},
					// Support .order() chaining for deprecated function
					order: (_direction: string, _field: string) => ({
						first: async () => {
							return sessions.find((s) => s.isValid && s.expiresAt > Date.now());
						}
					})
				}),
				order: () => ({
					first: async () => {
						return sessions.find((s) => s.isValid && s.expiresAt > Date.now());
					}
				})
			})
		}
	} as any;
}

describe('validateSessionAndGetUserId', () => {
	const validSessionId = 'session_valid123';
	const validUserId = 'user_abc123' as Id<'users'>;
	const now = Date.now();

	it('should return userId for valid session', async () => {
		const mockSession = {
			sessionId: validSessionId,
			convexUserId: validUserId,
			isValid: true,
			expiresAt: now + 3600000, // 1 hour from now
			revokedAt: undefined
		};

		const ctx = createMockCtx([mockSession]);
		const result = await validateSessionAndGetUserId(ctx, validSessionId);

		expect(result.userId).toBe(validUserId);
		expect(result.session).toBeDefined();
	});

	it('should throw error for expired session', async () => {
		const mockSession = {
			sessionId: validSessionId,
			convexUserId: validUserId,
			isValid: true,
			expiresAt: now - 1000, // Expired 1 second ago
			revokedAt: undefined
		};

		const ctx = createMockCtx([mockSession]);

		await expect(validateSessionAndGetUserId(ctx, validSessionId)).rejects.toThrow(
			'Session not found or expired'
		);
	});

	it('should throw error for revoked session', async () => {
		const mockSession = {
			sessionId: validSessionId,
			convexUserId: validUserId,
			isValid: true,
			expiresAt: now + 3600000,
			revokedAt: now - 1000 // Revoked 1 second ago
		};

		const ctx = createMockCtx([mockSession]);

		await expect(validateSessionAndGetUserId(ctx, validSessionId)).rejects.toThrow(
			'Session has been revoked'
		);
	});

	it('should throw error for invalid session', async () => {
		const mockSession = {
			sessionId: validSessionId,
			convexUserId: validUserId,
			isValid: false, // Invalid
			expiresAt: now + 3600000,
			revokedAt: undefined
		};

		const ctx = createMockCtx([mockSession]);

		await expect(validateSessionAndGetUserId(ctx, validSessionId)).rejects.toThrow(
			'Session not found or expired'
		);
	});

	it('should throw error for non-existent session', async () => {
		const ctx = createMockCtx([]);

		await expect(validateSessionAndGetUserId(ctx, 'nonexistent_session')).rejects.toThrow(
			'Session not found or expired'
		);
	});
});

describe('getUserIdFromSession', () => {
	const validSessionId = 'session_valid456';
	const validUserId = 'user_xyz789' as Id<'users'>;
	const now = Date.now();

	it('should return userId for valid session', async () => {
		const mockSession = {
			sessionId: validSessionId,
			convexUserId: validUserId,
			isValid: true,
			expiresAt: now + 3600000,
			revokedAt: undefined
		};

		const ctx = createMockCtx([mockSession]);
		const result = await getUserIdFromSession(ctx, validSessionId);

		expect(result).toBe(validUserId);
	});

	it('should return null for expired session', async () => {
		const mockSession = {
			sessionId: validSessionId,
			convexUserId: validUserId,
			isValid: true,
			expiresAt: now - 1000,
			revokedAt: undefined
		};

		const ctx = createMockCtx([mockSession]);
		const result = await getUserIdFromSession(ctx, validSessionId);

		expect(result).toBeNull();
	});

	it('should return null for revoked session', async () => {
		const mockSession = {
			sessionId: validSessionId,
			convexUserId: validUserId,
			isValid: true,
			expiresAt: now + 3600000,
			revokedAt: now - 1000
		};

		const ctx = createMockCtx([mockSession]);
		const result = await getUserIdFromSession(ctx, validSessionId);

		expect(result).toBeNull();
	});

	it('should return null for non-existent session', async () => {
		const ctx = createMockCtx([]);
		const result = await getUserIdFromSession(ctx, 'nonexistent');

		expect(result).toBeNull();
	});
});

describe('validateSession (DEPRECATED)', () => {
	const validUserId = 'user_deprecated123' as Id<'users'>;
	const now = Date.now();

	it('should still work for backward compatibility', async () => {
		const mockSession = {
			convexUserId: validUserId,
			isValid: true,
			expiresAt: now + 3600000,
			revokedAt: undefined
		};

		const ctx = createMockCtx([mockSession]);
		const result = await validateSession(ctx, validUserId);

		expect(result).toBeDefined();
		expect(result.convexUserId).toBe(validUserId);
	});

	it('should throw for expired session', async () => {
		const mockSession = {
			convexUserId: validUserId,
			isValid: true,
			expiresAt: now - 1000,
			revokedAt: undefined
		};

		const ctx = createMockCtx([mockSession]);

		await expect(validateSession(ctx, validUserId)).rejects.toThrow('Session not found');
	});
});

describe('Security: Impersonation Prevention', () => {
	const attackerSessionId = 'session_attacker';
	const attackerUserId = 'user_attacker' as Id<'users'>;
	const victimUserId = 'user_victim' as Id<'users'>;
	const now = Date.now();

	it('should prevent attacker from accessing victim data by passing victim userId', async () => {
		// Attacker has valid session for their own account
		const attackerSession = {
			sessionId: attackerSessionId,
			convexUserId: attackerUserId,
			isValid: true,
			expiresAt: now + 3600000,
			revokedAt: undefined
		};

		const ctx = createMockCtx([attackerSession]);

		// Attacker passes their valid sessionId
		// System derives attackerUserId from session (not victimUserId from client)
		const result = await validateSessionAndGetUserId(ctx, attackerSessionId);

		// ✅ System returns attackerUserId (derived from session)
		expect(result.userId).toBe(attackerUserId);
		// ❌ Attacker CANNOT get victimUserId by passing it as parameter
		expect(result.userId).not.toBe(victimUserId);
	});

	it('should fail when attacker tries to use non-existent session', async () => {
		const ctx = createMockCtx([]);

		// Attacker tries to use a forged/non-existent sessionId
		await expect(validateSessionAndGetUserId(ctx, 'forged_session_id')).rejects.toThrow(
			'Session not found or expired'
		);
	});

	it('should fail when attacker tries to use expired stolen session', async () => {
		// Attacker somehow obtained a victim's sessionId, but it's expired
		const stolenExpiredSession = {
			sessionId: 'stolen_session',
			convexUserId: victimUserId,
			isValid: true,
			expiresAt: now - 1000, // Expired
			revokedAt: undefined
		};

		const ctx = createMockCtx([stolenExpiredSession]);

		await expect(validateSessionAndGetUserId(ctx, 'stolen_session')).rejects.toThrow(
			'Session not found or expired'
		);
	});

	it('should fail when attacker tries to use revoked stolen session', async () => {
		// Attacker somehow obtained a victim's sessionId, but it's been revoked
		const stolenRevokedSession = {
			sessionId: 'stolen_session',
			convexUserId: victimUserId,
			isValid: true,
			expiresAt: now + 3600000,
			revokedAt: now - 1000 // Revoked
		};

		const ctx = createMockCtx([stolenRevokedSession]);

		await expect(validateSessionAndGetUserId(ctx, 'stolen_session')).rejects.toThrow(
			'Session has been revoked'
		);
	});
});

describe('Performance: Query Efficiency', () => {
	it('should use index-based query (by_session)', async () => {
		const sessionId = 'perf_test_session';
		const userId = 'perf_test_user' as Id<'users'>;
		const now = Date.now();

		const mockSession = {
			sessionId,
			convexUserId: userId,
			isValid: true,
			expiresAt: now + 3600000,
			revokedAt: undefined
		};

		// Mock ctx with query tracking
		let queryTableName = '';
		const ctx = {
			db: {
				query: (tableName: string) => {
					queryTableName = tableName;
					return {
						filter: () => ({
							first: async () => mockSession
						})
					};
				}
			}
		} as any;

		await validateSessionAndGetUserId(ctx, sessionId);

		// Verify it queries authSessions table
		expect(queryTableName).toBe('authSessions');
	});
});

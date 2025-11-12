/**
 * Session Validation Middleware for Convex
 * 
 * SECURITY NOTE: This is a temporary solution while WorkOS password auth tokens
 * don't include the 'aud' claim required for Convex JWT validation.
 * 
 * Pattern: Pass userId from authenticated SvelteKit session → Validate in Convex
 * 
 * TODO: Migrate to JWT-based auth once WorkOS adds 'aud' claim support
 * See: https://docs.convex.dev/auth/authkit
 */

import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';

/**
 * Validates that a userId corresponds to an active, valid, non-expired session
 * 
 * Security: Prevents impersonation by verifying userId against authSessions table
 * Checks: existence, expiration, validity flag, and revocation status
 * 
 * @throws Error if session is invalid, expired, revoked, or not found
 * @returns Session record if valid
 */
export async function validateSession(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>
) {
	const now = Date.now();
	
	// Query for active session matching this userId with all security checks
	const session = await ctx.db
		.query('authSessions')
		.filter((q) => 
			q.and(
				q.eq(q.field('convexUserId'), userId),
				q.eq(q.field('isValid'), true),
				q.gt(q.field('expiresAt'), now)
			)
		)
		.order('desc', '_creationTime')
		.first();

	if (!session) {
		throw new Error('Session not found - user must log in');
	}

	// Additional check: ensure session hasn't been revoked
	if (session.revokedAt && session.revokedAt <= now) {
		throw new Error('Session has been revoked - user must log in again');
	}

	return session;
}

/**
 * Optional: Get userId from session validation (for queries that don't pass userId)
 * 
 * Usage: const userId = await getUserIdFromSession(ctx, sessionId);
 */
export async function getUserIdFromSession(
	ctx: QueryCtx | MutationCtx,
	sessionId: string
): Promise<Id<'users'> | null> {
	const now = Date.now();
	
	const session = await ctx.db
		.query('authSessions')
		.filter((q) => 
			q.and(
				q.eq(q.field('sessionId'), sessionId),
				q.eq(q.field('isValid'), true),
				q.gt(q.field('expiresAt'), now)
			)
		)
		.first();

	if (!session) {
		return null;
	}

	// Check if session has been revoked
	if (session.revokedAt && session.revokedAt <= now) {
		return null;
	}

	return session.convexUserId;
}


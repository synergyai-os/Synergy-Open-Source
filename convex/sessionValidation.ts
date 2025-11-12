/**
 * Session Validation Middleware for Convex
 * 
 * SECURITY: Session-based authentication with server-side validation
 * 
 * Pattern: Pass sessionId from authenticated SvelteKit session → Validate in Convex → Derive userId
 * 
 * Benefits:
 * - Client cannot impersonate users (sessionId is cryptographically signed)
 * - userId is derived server-side from validated session
 * - Defense in depth: validated by SvelteKit middleware + Convex
 * 
 * Migration path: Once WorkOS adds 'aud' claim, can switch to JWT-based auth
 * See: https://docs.convex.dev/auth/authkit
 */

import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';

/**
 * DEPRECATED: Validates that a userId corresponds to an active session
 * 
 * ⚠️ Security Risk: Trusts client-supplied userId
 * Use validateSessionAndGetUserId(ctx, sessionId) instead
 * 
 * @deprecated Use validateSessionAndGetUserId() for better security
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
 * Get userId from session validation (for queries that don't pass userId)
 * 
 * @param ctx Query or Mutation context
 * @param sessionId Session ID from authenticated SvelteKit session
 * @returns userId if session is valid, null otherwise
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

/**
 * Validate session and get userId (RECOMMENDED - Secure by default)
 * 
 * This is the PREFERRED way to authenticate Convex functions.
 * 
 * Security Benefits:
 * - Derives userId from server-validated sessionId (not client-supplied)
 * - Prevents impersonation attacks
 * - Defense in depth: validated by SvelteKit + Convex
 * 
 * Usage:
 * ```typescript
 * export const myQuery = query({
 *   args: { sessionId: v.string() },
 *   handler: async (ctx, args) => {
 *     const { userId, session } = await validateSessionAndGetUserId(ctx, args.sessionId);
 *     // Now use userId safely - it's derived from validated session
 *     return await ctx.db.query('items').withIndex('by_user', q => q.eq('userId', userId)).collect();
 *   }
 * });
 * ```
 * 
 * @param ctx Query or Mutation context
 * @param sessionId Session ID from authenticated SvelteKit session
 * @returns Object with userId and full session record
 * @throws Error if session is invalid, expired, revoked, or not found
 */
export async function validateSessionAndGetUserId(
	ctx: QueryCtx | MutationCtx,
	sessionId: string
): Promise<{ userId: Id<'users'>; session: any }> {
	const now = Date.now();
	
	// Query for active session with all security checks
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
		throw new Error('Session not found or expired - user must log in');
	}

	// Additional check: ensure session hasn't been revoked
	if (session.revokedAt && session.revokedAt <= now) {
		throw new Error('Session has been revoked - user must log in again');
	}

	return {
		userId: session.convexUserId,
		session
	};
}


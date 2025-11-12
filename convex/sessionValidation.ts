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
 * Validates that a userId corresponds to an active, non-expired session
 * 
 * Security: Prevents impersonation by verifying userId against authSessions table
 * 
 * @throws Error if session is invalid, expired, or not found
 * @returns Session record if valid
 */
export async function validateSession(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>
) {
	// Query for active session matching this userId
	const session = await ctx.db
		.query('authSessions')
		.filter((q) => q.eq(q.field('convexUserId'), userId))
		.order('desc')
		.first();

	if (!session) {
		throw new Error('Session not found - user must log in');
	}

	const now = Date.now();
	if (session.expiresAt < now) {
		throw new Error('Session expired - user must log in again');
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
	const session = await ctx.db
		.query('authSessions')
		.filter((q) => q.eq(q.field('sessionId'), sessionId))
		.first();

	if (!session || session.expiresAt < Date.now()) {
		return null;
	}

	return session.convexUserId;
}


// WorkOS authentication is handled by SvelteKit
// User authentication state is stored in HTTP-only cookies
// Convex functions receive sessionId from client queries and derive userId server-side

import type { QueryCtx, MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { validateSessionAndGetUserId, getUserIdFromSession } from './sessionValidation';

/**
 * Get authenticated user ID from sessionId (RECOMMENDED)
 *
 * This is the secure way to authenticate Convex functions.
 *
 * Security: Derives userId from server-validated sessionId, preventing impersonation attacks.
 *
 * Usage:
 * ```typescript
 * export const myQuery = query({
 *   args: { sessionId: v.string() },
 *   handler: async (ctx, args) => {
 *     const userId = await getAuthUserId(ctx, args.sessionId);
 *     // Use userId safely
 *   }
 * });
 * ```
 *
 * @param ctx Query or Mutation context
 * @param sessionId Session ID from authenticated SvelteKit session
 * @returns userId
 * @throws Error if session is invalid
 */
export async function getAuthUserId(
	ctx: QueryCtx | MutationCtx,
	sessionId: string
): Promise<Id<'users'>> {
	const { userId } = await validateSessionAndGetUserId(ctx, sessionId);
	return userId;
}

/**
 * Get authenticated user ID from sessionId (returns null if invalid)
 *
 * Similar to getAuthUserId() but returns null instead of throwing.
 * Useful for optional authentication scenarios.
 *
 * @param ctx Query or Mutation context
 * @param sessionId Session ID from authenticated SvelteKit session
 * @returns userId or null if session invalid
 */
export async function getAuthUserIdOrNull(
	ctx: QueryCtx | MutationCtx,
	sessionId: string
): Promise<Id<'users'> | null> {
	return await getUserIdFromSession(ctx, sessionId);
}

// DEPRECATED: Legacy function for backward compatibility
// This was used when Convex JWT auth was attempted but WorkOS tokens lack 'aud' claim
export async function getAuthUserIdFromJWT(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		return null;
	}
	return identity.subject;
}

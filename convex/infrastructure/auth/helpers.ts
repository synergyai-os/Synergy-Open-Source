import { createError, ErrorCodes } from '../errors/codes';
import type { MutationCtx, QueryCtx } from '../_generated/server';

/**
 * Require an authenticated user and return the associated person document.
 * Throws AUTH_REQUIRED if no identity or no matching person is found.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw createError(ErrorCodes.AUTH_REQUIRED, 'Authentication required');
	}

	const person = await ctx.db
		.query('people')
		.withIndex('by_auth_id', (q) => q.eq('authId', identity.subject))
		.unique();

	if (!person) {
		throw createError(ErrorCodes.AUTH_REQUIRED, 'User not found');
	}

	return person;
}

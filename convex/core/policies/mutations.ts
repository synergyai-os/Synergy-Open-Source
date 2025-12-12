import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

/**
 * Policies domain mutation scaffold.
 */
export const ensurePolicy = mutation({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			'Policies mutations not implemented (SYOS-707 scaffold).'
		);
	}
});

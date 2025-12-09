import { mutation } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

/**
 * Policies domain mutation scaffold.
 */
export const ensurePolicy = mutation({
	args: {},
	handler: async () => {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			'Policies mutations not implemented (SYOS-707 scaffold).'
		);
	}
});

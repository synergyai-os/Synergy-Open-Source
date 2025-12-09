import { mutation } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

/**
 * Assignments domain mutation scaffold.
 */
export const ensureAssignment = mutation({
	args: {},
	handler: async () => {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			'Assignments mutations not implemented (SYOS-707 scaffold).'
		);
	}
});

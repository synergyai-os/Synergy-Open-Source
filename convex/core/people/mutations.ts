import { mutation } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

/**
 * People domain mutation scaffold.
 */
export const ensurePerson = mutation({
	args: {},
	handler: async () => {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			'People mutations not implemented (SYOS-707 scaffold).'
		);
	}
});

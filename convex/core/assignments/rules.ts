/**
 * Assignments domain rules scaffold.
 */

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

export function requireAssignmentsDomain(): never {
	throw createError(
		ErrorCodes.GENERIC_ERROR,
		'Assignments domain rules not implemented (SYOS-707 scaffold).'
	);
}

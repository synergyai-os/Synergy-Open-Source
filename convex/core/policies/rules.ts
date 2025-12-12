/**
 * Policies domain rules scaffold.
 */

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

export function requirePoliciesDomain(): never {
	throw createError(
		ErrorCodes.GENERIC_ERROR,
		'Policies domain rules not implemented (SYOS-707 scaffold).'
	);
}

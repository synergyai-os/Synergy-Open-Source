/**
 * Authority has no mutations; calculations are pure functions.
 * SYOS-707 scaffold file to satisfy domain structure.
 */

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

export function assertAuthorityIsDerived(): never {
	throw createError(
		ErrorCodes.GENERIC_ERROR,
		'Authority is derived from roles; no mutations are defined.'
	);
}

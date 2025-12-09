'use strict';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

/**
 * Require a person by ID or throw.
 */
export async function requirePerson(
	ctx: QueryCtx | MutationCtx,
	personId: Id<'users'>
): Promise<Doc<'users'>> {
	const person = await ctx.db.get(personId);
	if (!person) {
		throw createError(ErrorCodes.PERSON_NOT_FOUND, 'Person not found');
	}
	return person;
}

/**
 * Validate that a person has a name (simple scaffold validation).
 */
export function isValidPersonName(name: string | null | undefined): boolean {
	if (!name) return false;
	const trimmed = name.trim();
	return trimmed.length >= 2 && trimmed.length <= 100;
}

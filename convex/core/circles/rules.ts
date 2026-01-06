/**
 * Circles business rules (pure helpers + validation).
 * SYOS-707: centralizes reusable circle logic for queries/mutations.
 */

import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';
import { LEAD_AUTHORITY, type LeadAuthority } from './constants';

export { slugifyName, ensureUniqueSlug } from './slug';
export { validateCircleName, validateCircleNameUpdate } from './validation';

// Export helper functions that are part of the public API
export { getCircleMembers } from './circleMembers';
export { createCoreRolesForCircle } from './autoCreateRoles';

export async function requireCircle(
	ctx: QueryCtx | MutationCtx,
	circleId: Id<'circles'>
): Promise<Doc<'circles'>> {
	const circle = await ctx.db.get(circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, `Circle ${circleId} not found`);
	}
	return circle;
}

/**
 * Validates if a lead authority can be used for a root circle
 *
 * Root circles must have decision-making or facilitation authority.
 * Convening authority (advisory only) is not allowed for organizational root.
 *
 * @param leadAuthority - The lead authority to validate
 * @returns true if valid for root circle, false otherwise
 *
 * @see INVARIANTS.md:ORG-10 - Root circle authority constraint
 */
export function canBeRootCircle(leadAuthority: LeadAuthority): boolean {
	return leadAuthority !== LEAD_AUTHORITY.CONVENES;
}

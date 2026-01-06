/**
 * Quick Edit Permission Checks
 *
 * Determines if a person can make quick edits (direct changes without proposals)
 * to circles and roles based on workspace settings and lead authority restrictions.
 *
 * Per SYOS-971: Quick edit is an authority decision (organizational),
 * not an RBAC system capability.
 *
 * SYOS-1070: Updated to use leadAuthority model
 */

import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { DEFAULT_LEAD_AUTHORITY, LEAD_AUTHORITY, type LeadAuthority } from '../circles/constants';
import { getAuthorityContext } from './context';
import { isCircleLead, isCircleMember } from './rules';

type AnyCtx = QueryCtx | MutationCtx;

/**
 * Require that person has permission to make quick edits to a circle.
 * Throws if permission is denied.
 *
 * Checks:
 * 1. Workspace setting: `allowQuickChanges` must be enabled
 * 2. Lead authority restrictions: convening circles cannot be quick-edited
 * 3. Authority: person must be circle lead (decides) or member (facilitates)
 *
 * @param ctx - Query or mutation context
 * @param personId - Person ID making the edit
 * @param circle - Circle being edited
 * @throws Error if quick edit is not allowed
 */
export async function requireQuickEditPermissionForPerson(
	ctx: AnyCtx,
	personId: Id<'people'>,
	circle: Doc<'circles'>
): Promise<void> {
	// Phase behavior:
	// - design: direct edits are expected (proposals not required); allow workspace members to edit even
	//   before circle membership/authority is established (common during org setup).
	// - active: respect allowQuickChanges + authority restrictions.
	const workspace = await ctx.db.get(circle.workspaceId);
	if (!workspace) {
		throw createError(ErrorCodes.WORKSPACE_NOT_FOUND, 'Workspace not found');
	}

	// In design phase we intentionally allow quick edits without circle authority checks.
	// The caller is still required to be an active workspace member by the domain mutation wrappers.
	if (workspace.phase === 'design') {
		return;
	}

	// 1. Check workspace setting
	const orgSettings = await ctx.db
		.query('workspaceOrgSettings')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', circle.workspaceId))
		.first();

	if (!orgSettings?.allowQuickChanges) {
		throw createError(
			ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
			'Quick edits disabled. Use "Edit circle" to create a proposal.'
		);
	}

	// 2. Check lead authority restrictions
	const leadAuthority = (circle.leadAuthority ?? DEFAULT_LEAD_AUTHORITY) as LeadAuthority;

	if (leadAuthority === LEAD_AUTHORITY.CONVENES) {
		throw createError(
			ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
			'Convening circles are coordination-only. Create a proposal in your home circle.'
		);
	}

	// 3. Check authority based on lead authority
	const authorityContext = await getAuthorityContext(ctx, {
		personId,
		circleId: circle._id
	});

	switch (leadAuthority) {
		case LEAD_AUTHORITY.DECIDES:
			// Only circle lead can edit
			if (!isCircleLead(authorityContext)) {
				throw createError(
					ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
					'Only Circle Lead can make changes in circles where lead decides.'
				);
			}
			break;

		case LEAD_AUTHORITY.FACILITATES:
			// Any circle member can edit
			if (!isCircleMember(authorityContext)) {
				throw createError(
					ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
					'Only circle members can make changes in facilitated circles.'
				);
			}
			break;

		case LEAD_AUTHORITY.CONVENES:
			// Already handled above, but TypeScript needs exhaustive check
			throw createError(
				ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
				'Convening circles are coordination-only. Create a proposal in your home circle.'
			);
	}
}

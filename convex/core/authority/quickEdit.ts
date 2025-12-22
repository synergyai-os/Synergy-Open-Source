/**
 * Quick Edit Permission Checks
 *
 * Determines if a person can make quick edits (direct changes without proposals)
 * to circles and roles based on workspace settings and circle type restrictions.
 *
 * Per SYOS-971: Quick edit is an authority decision (organizational),
 * not an RBAC system capability.
 */

import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { CIRCLE_TYPES, type CircleType } from '../circles/constants';
import { getAuthorityContext } from './context';
import { isCircleLead, isCircleMember } from './rules';

type AnyCtx = QueryCtx | MutationCtx;

/**
 * Require that person has permission to make quick edits to a circle.
 * Throws if permission is denied.
 *
 * Checks:
 * 1. Workspace setting: `allowQuickChanges` must be enabled
 * 2. Circle type restrictions: guilds cannot be quick-edited
 * 3. Authority: person must be circle lead (hierarchy) or member (empowered_team/hybrid)
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

	// 2. Check circle type restrictions
	const circleType = (circle.circleType ?? CIRCLE_TYPES.HIERARCHY) as CircleType;

	if (circleType === CIRCLE_TYPES.GUILD) {
		throw createError(
			ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
			'Guilds are coordination-only. Create a proposal in your home circle.'
		);
	}

	// 3. Check authority based on circle type
	const authorityContext = await getAuthorityContext(ctx, {
		personId,
		circleId: circle._id
	});

	switch (circleType) {
		case CIRCLE_TYPES.HIERARCHY:
			// Only circle lead can edit
			if (!isCircleLead(authorityContext)) {
				throw createError(
					ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
					'Only Circle Lead can make changes in hierarchical circles.'
				);
			}
			break;

		case CIRCLE_TYPES.EMPOWERED_TEAM:
		case CIRCLE_TYPES.HYBRID:
			// Any circle member can edit
			if (!isCircleMember(authorityContext)) {
				throw createError(
					ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
					'Only circle members can make changes in empowered teams.'
				);
			}
			break;

		case CIRCLE_TYPES.GUILD:
			// Already handled above, but TypeScript needs exhaustive check
			throw createError(
				ErrorCodes.AUTHZ_INSUFFICIENT_RBAC,
				'Guilds are coordination-only. Create a proposal in your home circle.'
			);
	}
}

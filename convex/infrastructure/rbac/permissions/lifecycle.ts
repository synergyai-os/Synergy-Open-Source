import type { Id } from '../../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../../_generated/server';
import type { PermissionContext } from './types';
import { findPersonByUserAndWorkspace } from '../../../core/people/queries';

type Ctx = QueryCtx | MutationCtx;

/**
 * List active user roles from systemRoles and workspaceRoles tables.
 *
 * Migrated from deprecated userRoles table (SYOS-862).
 * Returns roles in the format expected by the permission system (with roleId).
 */
export async function listActiveUserRoles(
	ctx: Ctx,
	userId: Id<'users'>,
	context?: PermissionContext
): Promise<
	Array<{ roleId: Id<'rbacRoles'>; workspaceId?: Id<'workspaces'>; circleId?: Id<'circles'> }>
> {
	const result: Array<{
		roleId: Id<'rbacRoles'>;
		workspaceId?: Id<'workspaces'>;
		circleId?: Id<'circles'>;
	}> = [];

	// 1. Get system roles (platform-level, no workspaceId)
	const systemRoles = await ctx.db
		.query('systemRoles')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();

	for (const systemRole of systemRoles) {
		// Look up roleId from roles table by slug
		const role = await ctx.db
			.query('rbacRoles')
			.withIndex('by_slug', (q) => q.eq('slug', systemRole.role))
			.first();

		if (role) {
			result.push({ roleId: role._id });
		}
	}

	// 2. Get workspace roles (workspace-scoped, uses personId)
	if (context?.workspaceId) {
		const person = await findPersonByUserAndWorkspace(ctx, userId, context.workspaceId);
		if (person) {
			const workspaceRoles = await ctx.db
				.query('workspaceRoles')
				.withIndex('by_person', (q) => q.eq('personId', person._id))
				.filter((q) => q.eq(q.field('workspaceId'), context.workspaceId))
				.collect();

			for (const workspaceRole of workspaceRoles) {
				// Look up roleId from roles table by slug
				const role = await ctx.db
					.query('rbacRoles')
					.withIndex('by_slug', (q) => q.eq('slug', workspaceRole.role))
					.first();

				if (role) {
					result.push({
						roleId: role._id,
						workspaceId: workspaceRole.workspaceId
					});
				}
			}
		}
	}

	// Note: Circle-scoped roles are not supported in the new model yet
	// If context.circleId is provided, we could filter here, but the new tables
	// don't have circleId, so this is a limitation of the migration

	return result;
}

/**
 * @deprecated Use grantSystemRole or grantWorkspaceRole from scopeHelpers instead.
 * This function is kept for backward compatibility but should not be used.
 *
 * SYOS-862: userRoles table deleted, migrated to systemRoles + workspaceRoles
 */
export async function createUserRoleAssignment(
	_ctx: MutationCtx,
	_args: {
		userId: Id<'users'>;
		roleId: Id<'rbacRoles'>;
		assignedBy: Id<'users'>;
		workspaceId?: Id<'workspaces'>;
		circleId?: Id<'circles'>;
		resourceType?: string;
		resourceId?: string;
		expiresAt?: number;
		sourceCircleRoleId?: Id<'assignments'>;
		assignedAt?: number;
	}
): Promise<never> {
	throw new Error(
		'createUserRoleAssignment is deprecated. Use grantSystemRole or grantWorkspaceRole from scopeHelpers instead.'
	);
}

/**
 * @deprecated Use revokeSystemRole or revokeWorkspaceRole from scopeHelpers instead.
 * This function is kept for backward compatibility but should not be used.
 *
 * SYOS-862: userRoles table deleted, migrated to systemRoles + workspaceRoles
 */
export async function updateUserRoleRevocation(
	_ctx: MutationCtx,
	_userRoleId: Id<'systemRoles'> | Id<'workspaceRoles'>,
	_revokedAt = Date.now()
): Promise<never> {
	throw new Error(
		'updateUserRoleRevocation is deprecated. Use revokeSystemRole or revokeWorkspaceRole from scopeHelpers instead.'
	);
}

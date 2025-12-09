import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { PermissionContext } from './types';

type Ctx = QueryCtx | MutationCtx;

export async function listActiveUserRoles(
	ctx: Ctx,
	userId: Id<'users'>,
	context?: PermissionContext
) {
	const userRoles = await ctx.db
		.query('userRoles')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();
	const now = Date.now();
	return userRoles.filter((role) => {
		if (role.revokedAt) return false;
		if (role.expiresAt && role.expiresAt < now) return false;
		if (context?.workspaceId && role.workspaceId && role.workspaceId !== context.workspaceId)
			return false;
		if (context?.circleId && role.circleId && role.circleId !== context.circleId) return false;
		return true;
	});
}

export async function createUserRoleAssignment(
	ctx: MutationCtx,
	args: {
		userId: Id<'users'>;
		roleId: Id<'roles'>;
		assignedBy: Id<'users'>;
		workspaceId?: Id<'workspaces'>;
		circleId?: Id<'circles'>;
		resourceType?: string;
		resourceId?: string;
		expiresAt?: number;
		sourceCircleRoleId?: Id<'userCircleRoles'>;
		assignedAt?: number;
	}
): Promise<Id<'userRoles'>> {
	const assignedAt = args.assignedAt ?? Date.now();
	return ctx.db.insert('userRoles', {
		userId: args.userId,
		roleId: args.roleId,
		workspaceId: args.workspaceId,
		circleId: args.circleId,
		resourceType: args.resourceType,
		resourceId: args.resourceId,
		assignedBy: args.assignedBy,
		assignedAt,
		expiresAt: args.expiresAt,
		sourceCircleRoleId: args.sourceCircleRoleId,
		revokedAt: undefined
	});
}

export async function updateUserRoleRevocation(
	ctx: MutationCtx,
	userRoleId: Id<'userRoles'>,
	revokedAt = Date.now()
): Promise<void> {
	await ctx.db.patch(userRoleId, { revokedAt });
}

import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { validateSessionAndGetUserId } from '../../sessionValidation';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { listActiveUserRoles } from './lifecycle';
import { logPermissionCheck } from './logging';
import type {
	PermissionContext,
	PermissionLogEntry,
	PermissionSlug,
	UserPermission
} from './types';
import { normalizePermissionContext } from './validation';

type Ctx = QueryCtx | MutationCtx;

const scopePriority: Record<UserPermission['scope'], number> = { all: 3, own: 2, none: 1 };

export async function hasPermission(
	ctx: Ctx,
	userId: Id<'users'>,
	permissionSlug: PermissionSlug,
	context?: PermissionContext
): Promise<boolean> {
	const permissions = await listUserPermissions(ctx, userId, context);
	for (const perm of permissions) {
		if (perm.permissionSlug !== permissionSlug) continue;
		if (perm.scope === 'all')
			return logAndAllow(ctx, userId, permissionSlug, perm, context, 'User has all scope');
		if (perm.scope === 'own') return handleOwnScope(ctx, userId, permissionSlug, perm, context);
		if (perm.scope === 'none')
			return logAndDeny(
				ctx,
				userId,
				permissionSlug,
				perm,
				context,
				'Explicitly denied by role configuration'
			);
	}
	await logPermissionCheck(ctx, {
		userId,
		action: 'check',
		permissionSlug,
		result: 'denied',
		reason: 'Permission not granted to user',
		context
	});
	return false;
}

export async function requirePermission(
	ctx: Ctx,
	userId: Id<'users'>,
	permissionSlug: PermissionSlug,
	context?: PermissionContext
): Promise<void> {
	const allowed = await hasPermission(ctx, userId, permissionSlug, context);
	if (!allowed) {
		throw createError(ErrorCodes.AUTHZ_INSUFFICIENT_RBAC, `Missing permission ${permissionSlug}`);
	}
}

export async function requireSystemAdmin(ctx: Ctx, sessionId: string): Promise<Id<'users'>> {
	const { userId } = await validateSessionAndGetUserId(ctx, sessionId);
	const isAdmin = await checkIsSystemAdmin(ctx, userId);
	if (!isAdmin) {
		throw createError(ErrorCodes.AUTHZ_INSUFFICIENT_RBAC, 'System admin access required');
	}
	return userId;
}

export async function checkIsSystemAdmin(ctx: Ctx, userId: Id<'users'>): Promise<boolean> {
	const roles = await listActiveUserRoles(ctx, userId);
	for (const role of roles) {
		if (role.workspaceId !== undefined) continue;
		const roleDoc = await ctx.db.get(role.roleId);
		if (roleDoc?.slug === 'admin') return true;
	}
	return false;
}

export async function listUserPermissions(
	ctx: Ctx,
	userId: Id<'users'>,
	context?: PermissionContext
): Promise<UserPermission[]> {
	const activeUserRoles = await listActiveUserRoles(
		ctx,
		userId,
		normalizePermissionContext(context)
	);
	const permissions = await collectPermissionsForRoles(ctx, activeUserRoles);
	return mergePermissions(permissions);
}

async function collectPermissionsForRoles(
	ctx: Ctx,
	roles: Array<{ roleId: Id<'roles'> }>
): Promise<UserPermission[]> {
	const permissions: UserPermission[] = [];
	for (const userRole of roles) {
		const role = await ctx.db.get(userRole.roleId);
		if (!role) continue;
		const rolePermissions = await ctx.db
			.query('rolePermissions')
			.withIndex('by_role', (q) => q.eq('roleId', userRole.roleId))
			.collect();
		for (const rolePerm of rolePermissions) {
			const permission = await ctx.db.get(rolePerm.permissionId);
			if (!permission) continue;
			permissions.push({
				permissionSlug: permission.slug,
				scope: rolePerm.scope,
				roleSlug: role.slug,
				roleName: role.name
			});
		}
	}
	return permissions;
}

function mergePermissions(permissions: UserPermission[]): UserPermission[] {
	const merged = new Map<string, UserPermission>();
	for (const perm of permissions) {
		const existing = merged.get(perm.permissionSlug);
		if (!existing || scopePriority[perm.scope] > scopePriority[existing.scope]) {
			merged.set(perm.permissionSlug, perm);
		}
	}
	return [...merged.values()];
}

async function handleOwnScope(
	ctx: Ctx,
	userId: Id<'users'>,
	permissionSlug: PermissionSlug,
	perm: UserPermission,
	context?: PermissionContext
): Promise<boolean> {
	if (context?.circleId && !context.resourceOwnerId) {
		return logAndAllow(
			ctx,
			userId,
			permissionSlug,
			perm,
			context,
			'User has circle-scoped role for this circle'
		);
	}
	if (context?.resourceOwnerId) {
		const isOwner = context.resourceOwnerId === userId;
		if (isOwner) {
			return logAndAllow(ctx, userId, permissionSlug, perm, context, 'User owns resource');
		}
		await logAndDeny(ctx, userId, permissionSlug, perm, context, 'Resource not owned by user');
		return false;
	}
	await logAndDeny(
		ctx,
		userId,
		permissionSlug,
		perm,
		context,
		"Scope is 'own' but neither circleId nor resourceOwnerId provided"
	);
	return false;
}

function logAndAllow(
	ctx: Ctx,
	userId: Id<'users'>,
	permissionSlug: PermissionSlug,
	perm: UserPermission,
	context: PermissionContext | undefined,
	reason: string
): Promise<true> {
	const entry: PermissionLogEntry = {
		userId,
		action: 'check',
		permissionSlug,
		roleSlug: perm.roleSlug,
		result: 'allowed',
		reason,
		context
	};
	return logPermissionCheck(ctx, entry).then(() => true);
}

function logAndDeny(
	ctx: Ctx,
	userId: Id<'users'>,
	permissionSlug: PermissionSlug,
	perm: UserPermission,
	context: PermissionContext | undefined,
	reason: string
): Promise<false> {
	const entry: PermissionLogEntry = {
		userId,
		action: 'check',
		permissionSlug,
		roleSlug: perm.roleSlug,
		result: 'denied',
		reason,
		context
	};
	return logPermissionCheck(ctx, entry).then(() => false);
}

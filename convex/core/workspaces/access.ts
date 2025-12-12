import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { requirePermission } from '../../rbac/permissions';

type AnyCtx = QueryCtx | MutationCtx;

export async function listUserWorkspaceMemberships(ctx: AnyCtx, userId: Id<'users'>) {
	return ctx.db
		.query('workspaceMembers')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();
}

export async function listWorkspaceMemberships(ctx: AnyCtx, workspaceId: Id<'workspaces'>) {
	return ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();
}

export async function findWorkspaceMembership(
	ctx: AnyCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<Doc<'workspaceMembers'> | null> {
	return ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();
}

export async function requireWorkspaceMembership(
	ctx: AnyCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>,
	message = 'You are not a member of this workspace'
): Promise<Doc<'workspaceMembers'>> {
	const membership = await findWorkspaceMembership(ctx, workspaceId, userId);
	if (!membership) {
		throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, message);
	}
	return membership;
}

export async function requireWorkspaceAdminOrOwner(
	ctx: AnyCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>,
	message = 'Must be org admin or owner'
): Promise<Doc<'workspaceMembers'>> {
	const membership = await requireWorkspaceMembership(ctx, workspaceId, userId, message);
	if (membership.role === 'member') {
		throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, message);
	}
	return membership;
}

export async function requireCanInviteMembers(
	ctx: AnyCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<Doc<'workspaceMembers'>> {
	const membership = await requireWorkspaceMembership(ctx, workspaceId, userId);
	if (membership.role === 'owner') {
		return membership;
	}

	await requirePermission(ctx, userId, 'users.invite', { workspaceId });
	return membership;
}

export async function getWorkspaceOwnerCount(
	ctx: AnyCtx,
	workspaceId: Id<'workspaces'>
): Promise<number> {
	const owners = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.filter((q) => q.eq(q.field('role'), 'owner'))
		.collect();

	return owners.length;
}

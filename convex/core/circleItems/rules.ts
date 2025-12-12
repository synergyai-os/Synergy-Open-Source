import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

/**
 * Verify the user belongs to the workspace.
 */
export async function ensureWorkspaceMembership(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		throw createError(
			ErrorCodes.WORKSPACE_ACCESS_DENIED,
			'You do not have access to this workspace'
		);
	}
}

/**
 * Resolve the workspace for either a circle or role.
 */
export async function getWorkspaceIdFromEntity(
	ctx: QueryCtx | MutationCtx,
	entityType: 'circle' | 'role',
	entityId: string
): Promise<Id<'workspaces'>> {
	if (entityType === 'circle') {
		const circle = await ctx.db.get(entityId as Id<'circles'>);
		if (!circle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		}
		return circle.workspaceId;
	}

	const role = await ctx.db.get(entityId as Id<'circleRoles'>);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}
	const circle = await ctx.db.get(role.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}
	return circle.workspaceId;
}

/**
 * Resolve the circle for a circle item (works for role-backed items too).
 */
export async function getCircleForItem(
	ctx: QueryCtx | MutationCtx,
	item: Doc<'circleItems'>
): Promise<Doc<'circles'>> {
	if (item.entityType === 'circle') {
		const circleId = item.entityId as Id<'circles'>;
		const circle = await ctx.db.get(circleId);
		if (!circle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		}
		return circle;
	}

	const roleId = item.entityId as Id<'circleRoles'>;
	const role = await ctx.db.get(roleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}
	const circle = await ctx.db.get(role.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}
	return circle;
}

/**
 * Look up a category by name for the workspace/entity type.
 */
export async function findCategoryByName(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	entityType: 'circle' | 'role',
	categoryName: string
): Promise<Id<'circleItemCategories'> | null> {
	const categories = await ctx.db
		.query('circleItemCategories')
		.withIndex('by_entity_type', (q) =>
			q.eq('workspaceId', workspaceId).eq('entityType', entityType)
		)
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.collect();

	const category = categories.find((c) => c.name === categoryName);
	return category?._id ?? null;
}

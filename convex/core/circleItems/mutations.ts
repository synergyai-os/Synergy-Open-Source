import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { recordCreateHistory, recordUpdateHistory } from '../history';
import { requireQuickEditPermission } from '../../rbac/orgChart';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { findCategoryByName, getCircleForItem, getWorkspaceIdFromEntity } from './rules';

async function getCircleForEntity(
	ctx: MutationCtx,
	entityType: 'circle' | 'role',
	entityId: string
): Promise<Doc<'circles'>> {
	if (entityType === 'circle') {
		const circle = await ctx.db.get(entityId as Id<'circles'>);
		if (!circle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		}
		return circle;
	}

	const role = await ctx.db.get(entityId as Id<'circleRoles'>);
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
 * Create a new circle item.
 */
export const create = mutation({
	args: {
		sessionId: v.string(),
		entityType: v.union(v.literal('circle'), v.literal('role')),
		entityId: v.string(),
		categoryName: v.string(),
		content: v.string(),
		order: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const workspaceId = await getWorkspaceIdFromEntity(ctx, args.entityType, args.entityId);

		const circle = await getCircleForEntity(ctx, args.entityType, args.entityId);
		await requireQuickEditPermission(ctx, userId, circle);

		const categoryId = await findCategoryByName(
			ctx,
			workspaceId,
			args.entityType,
			args.categoryName
		);
		if (!categoryId) {
			throw createError(
				ErrorCodes.GENERIC_ERROR,
				`Category "${args.categoryName}" not found for ${args.entityType}`
			);
		}

		const existingItems = await ctx.db
			.query('circleItems')
			.withIndex('by_category', (q) => q.eq('categoryId', categoryId))
			.filter((q) =>
				q.and(
					q.eq(q.field('entityType'), args.entityType),
					q.eq(q.field('entityId'), args.entityId),
					q.eq(q.field('archivedAt'), undefined)
				)
			)
			.collect();

		const duplicate = existingItems.find(
			(item) => item.content.toLowerCase().trim() === args.content.toLowerCase().trim()
		);
		if (duplicate) {
			throw createError(
				ErrorCodes.GENERIC_ERROR,
				`An item with this content already exists in "${args.categoryName}"`
			);
		}

		let order = args.order;
		if (order === undefined) {
			const maxOrder = existingItems.reduce((max, item) => Math.max(max, item.order), -1);
			order = maxOrder + 1;
		}

		const now = Date.now();
		const itemId = await ctx.db.insert('circleItems', {
			workspaceId,
			categoryId,
			entityType: args.entityType,
			entityId: args.entityId,
			content: args.content.trim(),
			order,
			createdAt: now,
			createdBy: userId,
			updatedAt: now
		});

		const afterDoc = await ctx.db.get(itemId);
		if (afterDoc) {
			await recordCreateHistory(ctx, 'circleItem', afterDoc);
		}

		return { itemId, success: true };
	}
});

/**
 * Update a circle item (inline editing with auto-save).
 */
export const update = mutation({
	args: {
		sessionId: v.string(),
		circleItemId: v.id('circleItems'),
		content: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const item = await ctx.db.get(args.circleItemId);
		if (!item) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Circle item not found');
		}

		const circle = await getCircleForItem(ctx, item);
		await requireQuickEditPermission(ctx, userId, circle);

		const beforeDoc = { ...item };

		await ctx.db.patch(args.circleItemId, {
			content: args.content.trim(),
			updatedAt: Date.now(),
			updatedBy: userId
		});

		const afterDoc = await ctx.db.get(args.circleItemId);
		if (afterDoc) {
			await recordUpdateHistory(ctx, 'circleItem', beforeDoc, afterDoc);
		}

		return { success: true };
	}
});

/**
 * @deprecated Use `update` instead. Kept for backward compatibility.
 */
export const quickUpdate = update;

/**
 * Delete a circle item (soft delete).
 */
export const deleteItem = mutation({
	args: {
		sessionId: v.string(),
		circleItemId: v.id('circleItems')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const item = await ctx.db.get(args.circleItemId);
		if (!item) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Circle item not found');
		}

		const circle = await getCircleForItem(ctx, item);
		await requireQuickEditPermission(ctx, userId, circle);

		await ctx.db.patch(args.circleItemId, {
			archivedAt: Date.now(),
			archivedBy: userId,
			updatedAt: Date.now(),
			updatedBy: userId
		});

		const afterDoc = await ctx.db.get(args.circleItemId);
		if (afterDoc) {
			await recordUpdateHistory(ctx, 'circleItem', item, afterDoc);
		}

		return { success: true };
	}
});

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Doc, Id } from './_generated/dataModel';
import type { QueryCtx, MutationCtx } from './_generated/server';
import { captureUpdate, captureCreate } from './orgVersionHistory';
import { requireQuickEditPermission } from './orgChartPermissions';
import { createError, ErrorCodes } from './infrastructure/errors/codes';

/**
 * Circle Items - Content items within categories (domains, accountabilities, etc.)
 * Supports both circles and roles with customizable categories per workspace.
 */

/**
 * Helper: Verify user has access to workspace
 */
async function ensureWorkspaceMembership(
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
 * Get circle for a circle item (for permission checking)
 */
async function getCircleForItem(
	ctx: QueryCtx | MutationCtx,
	item: Doc<'circleItems'>
): Promise<Doc<'circles'>> {
	// Circle items can belong to either a circle or a role
	// If entityType is 'circle', entityId is the circle ID
	// If entityType is 'role', we need to get the role's circleId
	if (item.entityType === 'circle') {
		const circleId = item.entityId as Id<'circles'>;
		const circle = await ctx.db.get(circleId);
		if (!circle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		}
		return circle;
	} else {
		// entityType is 'role', get the role's circle
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
}

/**
 * Find category by name for a workspace and entity type
 */
async function findCategoryByName(
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

/**
 * Get workspace ID from entity (circle or role)
 */
async function getWorkspaceIdFromEntity(
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
	} else {
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
}

/**
 * List items for a specific category of an entity
 * Returns items ordered by order field
 */
export const listByCategory = query({
	args: {
		sessionId: v.string(),
		entityType: v.union(v.literal('circle'), v.literal('role')),
		entityId: v.string(),
		categoryName: v.string()
	},
	handler: async (ctx, args) => {
		// 1. Validate session
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get workspace ID from entity
		const workspaceId = await getWorkspaceIdFromEntity(ctx, args.entityType, args.entityId);

		// 3. Verify workspace membership
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		// 4. Find category
		const categoryId = await findCategoryByName(
			ctx,
			workspaceId,
			args.entityType,
			args.categoryName
		);
		if (!categoryId) {
			// Category doesn't exist yet (custom categories may not exist)
			return [];
		}

		// 5. Get all active items for this category and entity
		const items = await ctx.db
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

		// 6. Sort by order, then by createdAt for stable sort
		items.sort((a, b) => {
			if (a.order !== b.order) {
				return a.order - b.order;
			}
			return a.createdAt - b.createdAt;
		});

		// 7. Return simplified format
		return items.map((item) => ({
			itemId: item._id,
			content: item.content,
			order: item.order,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt
		}));
	}
});

/**
 * List all items for an entity (all categories)
 * Returns items grouped by category
 */
export const listByEntity = query({
	args: {
		sessionId: v.string(),
		entityType: v.union(v.literal('circle'), v.literal('role')),
		entityId: v.string()
	},
	handler: async (ctx, args) => {
		// 1. Validate session
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get workspace ID from entity
		const workspaceId = await getWorkspaceIdFromEntity(ctx, args.entityType, args.entityId);

		// 3. Verify workspace membership
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		// 4. Get all active items for this entity
		const items = await ctx.db
			.query('circleItems')
			.withIndex('by_entity', (q) =>
				q.eq('entityType', args.entityType).eq('entityId', args.entityId)
			)
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.collect();

		// 5. Get category names
		const categoryMap = new Map<Id<'circleItemCategories'>, string>();
		for (const item of items) {
			if (!categoryMap.has(item.categoryId)) {
				const category = await ctx.db.get(item.categoryId);
				if (category) {
					categoryMap.set(item.categoryId, category.name);
				}
			}
		}

		// 6. Group by category and sort
		const grouped = new Map<string, typeof items>();
		for (const item of items) {
			const categoryName = categoryMap.get(item.categoryId) ?? 'Unknown';
			if (!grouped.has(categoryName)) {
				grouped.set(categoryName, []);
			}
			grouped.get(categoryName)!.push(item);
		}

		// 7. Sort items within each category
		for (const [, categoryItems] of grouped.entries()) {
			categoryItems.sort((a, b) => {
				if (a.order !== b.order) {
					return a.order - b.order;
				}
				return a.createdAt - b.createdAt;
			});
		}

		// 8. Return grouped format
		return Array.from(grouped.entries()).map(([categoryName, categoryItems]) => ({
			categoryName,
			items: categoryItems.map((item) => ({
				itemId: item._id,
				content: item.content,
				order: item.order,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt
			}))
		}));
	}
});

/**
 * Create a new circle item
 * Requires: Org Designer role + allowQuickChanges workspace setting
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
		// 1. Validate session
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get workspace ID and entity
		const workspaceId = await getWorkspaceIdFromEntity(ctx, args.entityType, args.entityId);

		// 3. Get circle for permission check
		let circle: Doc<'circles'> | null = null;
		if (args.entityType === 'circle') {
			circle = await ctx.db.get(args.entityId as Id<'circles'>);
			if (!circle) {
				throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
			}
		} else {
			const role = await ctx.db.get(args.entityId as Id<'circleRoles'>);
			if (!role) {
				throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
			}
			circle = await ctx.db.get(role.circleId);
			if (!circle) {
				throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
			}
		}

		// 4. Check quick edit permission
		await requireQuickEditPermission(ctx, userId, circle);

		// 5. Find or create category
		const categoryId = await findCategoryByName(
			ctx,
			workspaceId,
			args.entityType,
			args.categoryName
		);
		if (!categoryId) {
			// Category doesn't exist - this shouldn't happen for default categories
			// but could happen for custom categories that were deleted
			throw createError(
				ErrorCodes.GENERIC_ERROR,
				`Category "${args.categoryName}" not found for ${args.entityType}`
			);
		}

		// 6. Check for duplicate content (case-insensitive)
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

		// 7. Calculate order (max + 1 if not provided)
		let order = args.order;
		if (order === undefined) {
			const maxOrder = existingItems.reduce((max, item) => Math.max(max, item.order), -1);
			order = maxOrder + 1;
		}

		// 8. Create item
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

		// 9. Capture version history
		const afterDoc = await ctx.db.get(itemId);
		if (afterDoc) {
			await captureCreate(ctx, 'circleItem', afterDoc);
		}

		return { itemId, success: true };
	}
});

/**
 * Update a circle item (inline editing with auto-save)
 * Requires: Org Designer role + allowQuickChanges workspace setting
 */
export const update = mutation({
	args: {
		sessionId: v.string(),
		circleItemId: v.id('circleItems'),
		content: v.string()
	},
	handler: async (ctx, args) => {
		// 1. Validate session
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get circle item and its circle
		const item = await ctx.db.get(args.circleItemId);
		if (!item) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Circle item not found');
		}

		const circle = await getCircleForItem(ctx, item);

		// 3. Check quick edit permission (RBAC + workspace setting)
		await requireQuickEditPermission(ctx, userId, circle);

		// 4. Capture before state
		const beforeDoc = { ...item };

		// 5. Apply update
		await ctx.db.patch(args.circleItemId, {
			content: args.content.trim(),
			updatedAt: Date.now(),
			updatedBy: userId
		});

		// 6. Capture version history
		const afterDoc = await ctx.db.get(args.circleItemId);
		if (afterDoc) {
			await captureUpdate(ctx, 'circleItem', beforeDoc, afterDoc);
		}

		return { success: true };
	}
});

/**
 * @deprecated Use `update` instead. Kept for backward compatibility.
 */
export const quickUpdate = update;

/**
 * Delete a circle item (soft delete)
 * Requires: Org Designer role + allowQuickChanges workspace setting
 */
export const deleteItem = mutation({
	args: {
		sessionId: v.string(),
		circleItemId: v.id('circleItems')
	},
	handler: async (ctx, args) => {
		// 1. Validate session
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get circle item and its circle
		const item = await ctx.db.get(args.circleItemId);
		if (!item) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Circle item not found');
		}

		const circle = await getCircleForItem(ctx, item);

		// 3. Check quick edit permission
		await requireQuickEditPermission(ctx, userId, circle);

		// 4. Soft delete (set archivedAt)
		await ctx.db.patch(args.circleItemId, {
			archivedAt: Date.now(),
			archivedBy: userId,
			updatedAt: Date.now(),
			updatedBy: userId
		});

		// 5. Capture version history (delete event)
		const afterDoc = await ctx.db.get(args.circleItemId);
		if (afterDoc) {
			await captureUpdate(ctx, 'circleItem', item, afterDoc);
		}

		return { success: true };
	}
});

import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import type { Id } from '../../_generated/dataModel';
import { ensureWorkspaceMembership, findCategoryByName, getWorkspaceIdFromEntity } from './rules';

/**
 * List items for a specific category of an entity, ordered by `order` then `createdAt`.
 */
export const listByCategory = query({
	args: {
		sessionId: v.string(),
		entityType: v.union(v.literal('circle'), v.literal('role')),
		entityId: v.string(),
		categoryName: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const workspaceId = await getWorkspaceIdFromEntity(ctx, args.entityType, args.entityId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		const categoryId = await findCategoryByName(
			ctx,
			workspaceId,
			args.entityType,
			args.categoryName
		);
		if (!categoryId) {
			return [];
		}

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

		items.sort((a, b) => {
			if (a.order !== b.order) {
				return a.order - b.order;
			}
			return a.createdAt - b.createdAt;
		});

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
 * List all items for an entity, grouped by category.
 */
export const listByEntity = query({
	args: {
		sessionId: v.string(),
		entityType: v.union(v.literal('circle'), v.literal('role')),
		entityId: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const workspaceId = await getWorkspaceIdFromEntity(ctx, args.entityType, args.entityId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		const items = await ctx.db
			.query('circleItems')
			.withIndex('by_entity', (q) =>
				q.eq('entityType', args.entityType).eq('entityId', args.entityId)
			)
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.collect();

		const categoryMap = new Map<Id<'circleItemCategories'>, string>();
		for (const item of items) {
			if (!categoryMap.has(item.categoryId)) {
				const category = await ctx.db.get(item.categoryId);
				if (category) {
					categoryMap.set(item.categoryId, category.name);
				}
			}
		}

		const grouped = new Map<string, typeof items>();
		for (const item of items) {
			const categoryName = categoryMap.get(item.categoryId) ?? 'Unknown';
			if (!grouped.has(categoryName)) {
				grouped.set(categoryName, []);
			}
			grouped.get(categoryName)!.push(item);
		}

		for (const [, categoryItems] of grouped.entries()) {
			categoryItems.sort((a, b) => {
				if (a.order !== b.order) {
					return a.order - b.order;
				}
				return a.createdAt - b.createdAt;
			});
		}

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

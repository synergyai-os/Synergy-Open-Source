import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const circleItemCategoriesTable = defineTable({
	workspaceId: v.id('workspaces'),
	entityType: v.union(v.literal('circle'), v.literal('role')),
	name: v.string(),
	order: v.number(),
	isDefault: v.boolean(),
	createdAt: v.number(),
	createdBy: v.id('users'),
	updatedAt: v.number(),
	updatedBy: v.optional(v.id('users')),
	archivedAt: v.optional(v.number()),
	archivedBy: v.optional(v.id('users'))
})
	.index('by_workspace', ['workspaceId'])
	.index('by_entity_type', ['workspaceId', 'entityType']);

export const circleItemsTable = defineTable({
	workspaceId: v.id('workspaces'),
	categoryId: v.id('circleItemCategories'),
	entityType: v.union(v.literal('circle'), v.literal('role')),
	entityId: v.string(),
	content: v.string(),
	order: v.number(),
	createdAt: v.number(),
	createdBy: v.id('users'),
	updatedAt: v.number(),
	updatedBy: v.optional(v.id('users')),
	archivedAt: v.optional(v.number()),
	archivedBy: v.optional(v.id('users'))
})
	.index('by_category', ['categoryId'])
	.index('by_entity', ['entityType', 'entityId'])
	.index('by_workspace', ['workspaceId']);

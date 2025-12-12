import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const tagsTable = defineTable({
	personId: v.id('people'),
	name: v.string(),
	displayName: v.string(),
	externalId: v.optional(v.number()),
	color: v.string(),
	parentId: v.optional(v.id('tags')),
	createdAt: v.number(),
	workspaceId: v.id('workspaces'),
	circleId: v.optional(v.id('circles')),
	ownershipType: v.optional(v.union(v.literal('user'), v.literal('workspace'), v.literal('circle')))
})
	.index('by_person', ['personId'])
	.index('by_person_name', ['personId', 'name'])
	.index('by_person_parent', ['personId', 'parentId'])
	.index('by_workspace', ['workspaceId'])
	.index('by_workspace_name', ['workspaceId', 'name'])
	.index('by_circle', ['circleId'])
	.index('by_circle_name', ['circleId', 'name']);

export const sourceTagsTable = defineTable({
	sourceId: v.id('sources'),
	tagId: v.id('tags')
})
	.index('by_source', ['sourceId'])
	.index('by_tag', ['tagId'])
	.index('by_source_tag', ['sourceId', 'tagId']);

export const highlightTagsTable = defineTable({
	highlightId: v.id('highlights'),
	tagId: v.id('tags')
})
	.index('by_highlight', ['highlightId'])
	.index('by_tag', ['tagId'])
	.index('by_highlight_tag', ['highlightId', 'tagId']);

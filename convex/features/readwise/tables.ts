import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const authorsTable = defineTable({
	personId: v.id('people'),
	name: v.string(),
	displayName: v.string(),
	createdAt: v.number()
})
	.index('by_person', ['personId'])
	.index('by_person_name', ['personId', 'name']);

export const sourcesTable = defineTable({
	personId: v.id('people'),
	authorId: v.id('authors'),
	title: v.string(),
	category: v.string(),
	sourceType: v.string(),
	externalId: v.string(),
	sourceUrl: v.optional(v.string()),
	coverImageUrl: v.optional(v.string()),
	highlightsUrl: v.optional(v.string()),
	asin: v.optional(v.string()),
	documentNote: v.optional(v.string()),
	numHighlights: v.number(),
	lastHighlightAt: v.optional(v.number()),
	updatedAt: v.number(),
	createdAt: v.number(),
	workspaceId: v.optional(v.id('workspaces')),
	circleId: v.optional(v.id('circles')),
	ownershipType: v.optional(
		v.union(v.literal('user'), v.literal('workspace'), v.literal('circle'), v.literal('purchased'))
	)
})
	.index('by_person', ['personId'])
	.index('by_author', ['authorId'])
	.index('by_external_id', ['externalId'])
	.index('by_person_category', ['personId', 'category'])
	.index('by_person_source_type', ['personId', 'sourceType'])
	.index('by_workspace', ['workspaceId'])
	.index('by_circle', ['circleId']);

export const sourceAuthorsTable = defineTable({
	sourceId: v.id('sources'),
	authorId: v.id('authors')
})
	.index('by_source', ['sourceId'])
	.index('by_author', ['authorId'])
	.index('by_source_author', ['sourceId', 'authorId']);

export const highlightsTable = defineTable({
	personId: v.id('people'),
	sourceId: v.id('sources'),
	text: v.string(),
	location: v.optional(v.number()),
	locationType: v.optional(v.string()),
	note: v.optional(v.string()),
	color: v.optional(v.string()),
	externalId: v.string(),
	externalUrl: v.string(),
	highlightedAt: v.optional(v.number()),
	updatedAt: v.number(),
	createdAt: v.number(),
	lastSyncedAt: v.optional(v.number()),
	workspaceId: v.optional(v.id('workspaces')),
	circleId: v.optional(v.id('circles')),
	ownershipType: v.optional(
		v.union(v.literal('user'), v.literal('workspace'), v.literal('circle'), v.literal('purchased'))
	)
})
	.index('by_person', ['personId'])
	.index('by_source', ['sourceId'])
	.index('by_external_id', ['externalId'])
	.index('by_person_source', ['personId', 'sourceId'])
	.index('by_workspace', ['workspaceId'])
	.index('by_circle', ['circleId']);

export const syncProgressTable = defineTable({
	personId: v.id('people'),
	step: v.string(),
	current: v.number(),
	total: v.optional(v.number()),
	message: v.optional(v.string()),
	startedAt: v.number(),
	updatedAt: v.number()
}).index('by_person', ['personId']);

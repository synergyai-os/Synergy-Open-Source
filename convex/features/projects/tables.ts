import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const projectsTable = defineTable({
	workspaceId: v.id('workspaces'),
	circleId: v.optional(v.id('circles')),
	name: v.string(),
	description: v.optional(v.string()),
	externalTool: v.union(
		v.literal('linear'),
		v.literal('notion'),
		v.literal('asana'),
		v.literal('jira'),
		v.literal('trello')
	),
	externalProjectId: v.string(),
	syncStatus: v.optional(v.union(v.literal('synced'), v.literal('pending'), v.literal('error'))),
	lastSyncedAt: v.optional(v.number()),
	externalUrl: v.optional(v.string()),
	createdAt: v.number(),
	createdBy: v.id('users'),
	updatedAt: v.number()
})
	.index('by_workspace', ['workspaceId'])
	.index('by_circle', ['circleId'])
	.index('by_external_tool', ['externalTool', 'externalProjectId']);

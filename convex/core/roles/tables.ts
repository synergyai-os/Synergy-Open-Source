import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const roleTemplatesTable = defineTable({
	workspaceId: v.optional(v.id('workspaces')),
	name: v.string(),
	roleType: v.union(v.literal('circle_lead'), v.literal('structural'), v.literal('custom')),
	// GOVERNANCE FIELDS — required (DR-011: Governance Fields in Core Schema)
	defaultPurpose: v.string(), // Template's default purpose
	defaultDecisionRights: v.array(v.string()), // Template's default decision rights
	description: v.optional(v.string()),
	isCore: v.boolean(),
	appliesTo: v.union(v.literal('decides'), v.literal('facilitates'), v.literal('convenes')),
	rbacPermissions: v.optional(
		v.array(
			v.object({
				permissionSlug: v.string(),
				scope: v.union(v.literal('all'), v.literal('own'))
			})
		)
	),
	archivedAt: v.optional(v.number()),
	archivedByPersonId: v.optional(v.id('people')),
	createdAt: v.number(),
	createdByPersonId: v.optional(v.id('people')),
	updatedAt: v.number(),
	updatedByPersonId: v.optional(v.id('people'))
})
	.index('by_workspace', ['workspaceId'])
	.index('by_core', ['workspaceId', 'isCore']);

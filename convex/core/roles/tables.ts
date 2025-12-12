import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const roleTemplatesTable = defineTable({
	workspaceId: v.optional(v.id('workspaces')),
	name: v.string(),
	description: v.optional(v.string()),
	isCore: v.boolean(),
	isRequired: v.boolean(),
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
	createdByPersonId: v.id('people'),
	updatedAt: v.number(),
	updatedByPersonId: v.optional(v.id('people'))
})
	.index('by_workspace', ['workspaceId'])
	.index('by_core', ['workspaceId', 'isCore']);

export const userCircleRolesTable = defineTable({
	personId: v.id('people'),
	circleRoleId: v.id('circleRoles'),
	scope: v.optional(v.string()),
	assignedAt: v.number(),
	assignedByPersonId: v.id('people'),
	updatedAt: v.number(),
	updatedByPersonId: v.optional(v.id('people')),
	archivedAt: v.optional(v.number()),
	archivedByPersonId: v.optional(v.id('people'))
})
	.index('by_person', ['personId'])
	.index('by_role', ['circleRoleId'])
	.index('by_person_role', ['personId', 'circleRoleId'])
	.index('by_role_archived', ['circleRoleId', 'archivedAt'])
	.index('by_person_archived', ['personId', 'archivedAt']);

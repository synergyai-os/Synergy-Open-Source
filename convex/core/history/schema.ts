import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const orgVersionHistoryTable = defineTable(
	v.union(
		v.object({
			entityType: v.literal('circle'),
			workspaceId: v.id('workspaces'),
			entityId: v.id('circles'),
			changeType: v.union(
				v.literal('create'),
				v.literal('update'),
				v.literal('archive'),
				v.literal('restore')
			),
			changedByPersonId: v.id('people'),
			changedAt: v.number(),
			changeDescription: v.optional(v.string()),
			before: v.optional(
				v.object({
					name: v.string(),
					slug: v.string(),
					purpose: v.optional(v.string()),
					parentCircleId: v.optional(v.id('circles')),
					status: v.union(v.literal('draft'), v.literal('active')),
					circleType: v.optional(
						v.union(
							v.literal('hierarchy'),
							v.literal('empowered_team'),
							v.literal('guild'),
							v.literal('hybrid')
						)
					),
					decisionModel: v.optional(
						v.union(
							v.literal('manager_decides'),
							v.literal('team_consensus'),
							v.literal('consent'),
							v.literal('coordination_only')
						)
					),
					archivedAt: v.optional(v.number())
				})
			),
			after: v.optional(
				v.object({
					name: v.string(),
					slug: v.string(),
					purpose: v.optional(v.string()),
					parentCircleId: v.optional(v.id('circles')),
					status: v.union(v.literal('draft'), v.literal('active')),
					circleType: v.optional(
						v.union(
							v.literal('hierarchy'),
							v.literal('empowered_team'),
							v.literal('guild'),
							v.literal('hybrid')
						)
					),
					decisionModel: v.optional(
						v.union(
							v.literal('manager_decides'),
							v.literal('team_consensus'),
							v.literal('consent'),
							v.literal('coordination_only')
						)
					),
					archivedAt: v.optional(v.number())
				})
			)
		}),
		v.object({
			entityType: v.literal('circleRole'),
			workspaceId: v.id('workspaces'),
			entityId: v.id('circleRoles'),
			changeType: v.union(
				v.literal('create'),
				v.literal('update'),
				v.literal('archive'),
				v.literal('restore')
			),
			changedByPersonId: v.id('people'),
			changedAt: v.number(),
			changeDescription: v.optional(v.string()),
			before: v.optional(
				v.object({
					circleId: v.id('circles'),
					name: v.string(),
					purpose: v.optional(v.string()),
					templateId: v.optional(v.id('roleTemplates')),
					status: v.union(v.literal('draft'), v.literal('active')),
					isHiring: v.boolean(),
					archivedAt: v.optional(v.number())
				})
			),
			after: v.optional(
				v.object({
					circleId: v.id('circles'),
					name: v.string(),
					purpose: v.optional(v.string()),
					templateId: v.optional(v.id('roleTemplates')),
					status: v.union(v.literal('draft'), v.literal('active')),
					isHiring: v.boolean(),
					archivedAt: v.optional(v.number())
				})
			)
		}),
		v.object({
			entityType: v.literal('userCircleRole'),
			workspaceId: v.id('workspaces'),
			entityId: v.id('userCircleRoles'),
			changeType: v.union(
				v.literal('create'),
				v.literal('update'),
				v.literal('archive'),
				v.literal('restore')
			),
			changedByPersonId: v.id('people'),
			changedAt: v.number(),
			changeDescription: v.optional(v.string()),
			before: v.optional(
				v.object({
					personId: v.id('people'),
					circleRoleId: v.id('circleRoles'),
					scope: v.optional(v.string()),
					archivedAt: v.optional(v.number())
				})
			),
			after: v.optional(
				v.object({
					personId: v.id('people'),
					circleRoleId: v.id('circleRoles'),
					scope: v.optional(v.string()),
					archivedAt: v.optional(v.number())
				})
			)
		}),
		v.object({
			entityType: v.literal('circleMember'),
			workspaceId: v.id('workspaces'),
			entityId: v.id('circleMembers'),
			changeType: v.union(
				v.literal('create'),
				v.literal('update'),
				v.literal('archive'),
				v.literal('restore')
			),
			changedByPersonId: v.id('people'),
			changedAt: v.number(),
			changeDescription: v.optional(v.string()),
			before: v.optional(
				v.object({
					circleId: v.id('circles'),
					personId: v.id('people'),
					archivedAt: v.optional(v.number())
				})
			),
			after: v.optional(
				v.object({
					circleId: v.id('circles'),
					personId: v.id('people'),
					archivedAt: v.optional(v.number())
				})
			)
		}),
		v.object({
			entityType: v.literal('circleItemCategory'),
			workspaceId: v.id('workspaces'),
			entityId: v.id('circleItemCategories'),
			changeType: v.union(
				v.literal('create'),
				v.literal('update'),
				v.literal('archive'),
				v.literal('restore')
			),
			changedByPersonId: v.id('people'),
			changedAt: v.number(),
			changeDescription: v.optional(v.string()),
			before: v.optional(
				v.object({
					workspaceId: v.id('workspaces'),
					entityType: v.union(v.literal('circle'), v.literal('role')),
					name: v.string(),
					order: v.number(),
					isDefault: v.boolean(),
					archivedAt: v.optional(v.number())
				})
			),
			after: v.optional(
				v.object({
					workspaceId: v.id('workspaces'),
					entityType: v.union(v.literal('circle'), v.literal('role')),
					name: v.string(),
					order: v.number(),
					isDefault: v.boolean(),
					archivedAt: v.optional(v.number())
				})
			)
		}),
		v.object({
			entityType: v.literal('circleItem'),
			workspaceId: v.id('workspaces'),
			entityId: v.id('circleItems'),
			changeType: v.union(
				v.literal('create'),
				v.literal('update'),
				v.literal('archive'),
				v.literal('restore')
			),
			changedByPersonId: v.id('people'),
			changedAt: v.number(),
			changeDescription: v.optional(v.string()),
			before: v.optional(
				v.object({
					categoryId: v.id('circleItemCategories'),
					entityType: v.union(v.literal('circle'), v.literal('role')),
					entityId: v.string(),
					content: v.string(),
					order: v.number(),
					archivedAt: v.optional(v.number())
				})
			),
			after: v.optional(
				v.object({
					categoryId: v.id('circleItemCategories'),
					entityType: v.union(v.literal('circle'), v.literal('role')),
					entityId: v.string(),
					content: v.string(),
					order: v.number(),
					archivedAt: v.optional(v.number())
				})
			)
		})
	)
)
	.index('by_entity', ['entityType', 'entityId'])
	.index('by_workspace', ['workspaceId', 'changedAt'])
	.index('by_person', ['changedByPersonId', 'changedAt']);

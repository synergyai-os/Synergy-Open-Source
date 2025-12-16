import { defineTable } from 'convex/server';
import { v } from 'convex/values';
// NOTE: These literals must match constants.ts
// Convex requires literal values in v.literal(), so we can't use constants directly here.
// See: convex/core/circles/constants.ts for single source of truth
import { CIRCLE_TYPES, DECISION_MODELS } from './constants';

// Runtime check: Ensure schema literals match constants (catches mismatches at startup)
const _schemaCheck: {
	circleTypes: ['hierarchy', 'empowered_team', 'guild', 'hybrid'];
	decisionModels: ['manager_decides', 'team_consensus', 'consent', 'coordination_only'];
} = {
	circleTypes: Object.values(CIRCLE_TYPES) as ['hierarchy', 'empowered_team', 'guild', 'hybrid'],
	decisionModels: Object.values(DECISION_MODELS) as [
		'manager_decides',
		'team_consensus',
		'consent',
		'coordination_only'
	]
};

export const circlesTable = defineTable({
	workspaceId: v.id('workspaces'),
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
	createdAt: v.number(),
	updatedAt: v.number(),
	updatedByPersonId: v.optional(v.id('people')),
	archivedAt: v.optional(v.number()),
	archivedByPersonId: v.optional(v.id('people'))
})
	.index('by_workspace', ['workspaceId'])
	.index('by_parent', ['parentCircleId'])
	.index('by_slug', ['workspaceId', 'slug'])
	.index('by_workspace_archived', ['workspaceId', 'archivedAt'])
	.index('by_workspace_status', ['workspaceId', 'status', 'archivedAt']);

export const circleMembersTable = defineTable({
	circleId: v.id('circles'),
	personId: v.id('people'),
	joinedAt: v.number(),
	addedByPersonId: v.optional(v.id('people')),
	archivedAt: v.optional(v.number()),
	archivedByPersonId: v.optional(v.id('people'))
})
	.index('by_circle', ['circleId'])
	.index('by_person', ['personId'])
	.index('by_circle_person', ['circleId', 'personId'])
	.index('by_circle_archived', ['circleId', 'archivedAt']);

export const circleRolesTable = defineTable({
	circleId: v.id('circles'),
	workspaceId: v.id('workspaces'),
	name: v.string(),
	roleType: v.union(v.literal('circle_lead'), v.literal('structural'), v.literal('custom')),
	purpose: v.string(),
	decisionRights: v.array(v.string()),
	templateId: v.optional(v.id('roleTemplates')),
	status: v.union(v.literal('draft'), v.literal('active')),
	isHiring: v.boolean(),
	representsToParent: v.optional(v.boolean()),
	createdAt: v.number(),
	updatedAt: v.number(),
	updatedByPersonId: v.optional(v.id('people')),
	archivedAt: v.optional(v.number()),
	archivedByPersonId: v.optional(v.id('people'))
})
	.index('by_circle', ['circleId'])
	.index('by_circle_archived', ['circleId', 'archivedAt'])
	.index('by_template', ['templateId'])
	.index('by_circle_status', ['circleId', 'status', 'archivedAt'])
	.index('by_workspace_hiring', ['workspaceId', 'isHiring', 'archivedAt'])
	.index('by_circle_roleType', ['circleId', 'roleType']);

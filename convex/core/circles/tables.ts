import { defineTable } from 'convex/server';
import { v } from 'convex/values';
// NOTE: These literals must match constants.ts
// Convex requires literal values in v.literal(), so we can't use constants directly here.
// See: convex/core/circles/constants.ts for single source of truth
import { LEAD_AUTHORITY } from './constants';

// Runtime check: Ensure schema literals match constants (catches mismatches at startup)
const _schemaCheck: {
	leadAuthority: ['decides', 'facilitates', 'convenes'];
} = {
	leadAuthority: Object.values(LEAD_AUTHORITY) as ['decides', 'facilitates', 'convenes']
};

export const circlesTable = defineTable({
	workspaceId: v.id('workspaces'),
	name: v.string(),
	slug: v.string(),
	// GOVERNANCE FIELD — required (DR-011: Governance Fields in Core Schema)
	purpose: v.string(),
	parentCircleId: v.optional(v.id('circles')),
	status: v.union(v.literal('draft'), v.literal('active')),
	leadAuthority: v.optional(
		v.union(v.literal('decides'), v.literal('facilitates'), v.literal('convenes'))
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
	// GOVERNANCE FIELDS — required (DR-011: Governance Fields in Core Schema)
	purpose: v.string(), // GOV-02: Every role has a purpose
	decisionRights: v.array(v.string()), // GOV-03: Every role has at least one decision right
	roleType: v.union(v.literal('circle_lead'), v.literal('structural'), v.literal('custom')),
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

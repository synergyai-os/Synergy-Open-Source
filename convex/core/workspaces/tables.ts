import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const workspacesTable = defineTable({
	name: v.string(),
	slug: v.string(),
	createdAt: v.number(),
	updatedAt: v.number(),
	plan: v.string(),
	phase: v.optional(v.union(v.literal('design'), v.literal('active'))),
	displayNames: v.optional(
		v.object({
			circle: v.optional(v.string()),
			circleLead: v.optional(v.string()),
			facilitator: v.optional(v.string()),
			secretary: v.optional(v.string()),
			tension: v.optional(v.string()),
			proposal: v.optional(v.string())
		})
	),
	// Onboarding: workspace setup completion (SYOS-891)
	setupCompletedAt: v.optional(v.number()),
	archivedAt: v.optional(v.number()),
	archivedByPersonId: v.optional(v.id('people')),
	archivedReason: v.optional(v.string()),
	branding: v.optional(
		v.object({
			primaryColor: v.string(),
			secondaryColor: v.string(),
			logo: v.optional(v.string()),
			updatedAt: v.number(),
			updatedBy: v.id('users')
		})
	)
}).index('by_slug', ['slug']);

export const workspaceAliasesTable = defineTable({
	workspaceId: v.id('workspaces'),
	slug: v.string(),
	createdAt: v.number()
}).index('by_slug', ['slug']);

// SYOS-843: workspaceInvitesTable moved to features/invites/tables.ts

export const workspaceSettingsTable = defineTable({
	workspaceId: v.id('workspaces'),
	claudeApiKey: v.optional(v.string()),
	createdAt: v.number(),
	updatedAt: v.number()
}).index('by_workspace', ['workspaceId']);

export const workspaceOrgSettingsTable = defineTable({
	workspaceId: v.id('workspaces'),
	requireCircleLeadRole: v.optional(v.boolean()),
	leadRequirementByCircleType: v.optional(
		v.object({
			hierarchy: v.boolean(),
			empowered_team: v.boolean(),
			guild: v.boolean(),
			hybrid: v.boolean()
		})
	),
	coreRoleTemplateIds: v.array(v.id('roleTemplates')),
	allowQuickChanges: v.boolean(),
	createdAt: v.number(),
	updatedAt: v.number()
}).index('by_workspace', ['workspaceId']);

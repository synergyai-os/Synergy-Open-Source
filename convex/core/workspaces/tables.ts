import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const workspacesTable = defineTable({
	name: v.string(),
	slug: v.string(),
	createdAt: v.number(),
	updatedAt: v.number(),
	plan: v.string(),
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

export const workspaceMembersTable = defineTable({
	workspaceId: v.id('workspaces'),
	userId: v.id('users'),
	role: v.union(v.literal('owner'), v.literal('admin'), v.literal('member')),
	joinedAt: v.number()
})
	.index('by_workspace', ['workspaceId'])
	.index('by_user', ['userId'])
	.index('by_workspace_user', ['workspaceId', 'userId']);

export const workspaceInvitesTable = defineTable({
	workspaceId: v.id('workspaces'),
	invitedUserId: v.optional(v.id('users')),
	email: v.optional(v.string()),
	role: v.union(v.literal('owner'), v.literal('admin'), v.literal('member')),
	invitedBy: v.id('users'),
	code: v.string(),
	createdAt: v.number(),
	expiresAt: v.optional(v.number()),
	acceptedAt: v.optional(v.number()),
	revokedAt: v.optional(v.number())
})
	.index('by_code', ['code'])
	.index('by_workspace', ['workspaceId'])
	.index('by_user', ['invitedUserId'])
	.index('by_email', ['email']);

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

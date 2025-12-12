import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const rolesTable = defineTable({
	slug: v.string(),
	name: v.string(),
	description: v.string(),
	isSystem: v.boolean(),
	createdAt: v.number(),
	updatedAt: v.number()
}).index('by_slug', ['slug']);

export const permissionsTable = defineTable({
	slug: v.string(),
	category: v.string(),
	action: v.string(),
	description: v.string(),
	requiresResource: v.boolean(),
	isSystem: v.boolean(),
	createdAt: v.number(),
	updatedAt: v.number()
})
	.index('by_slug', ['slug'])
	.index('by_category', ['category']);

export const rolePermissionsTable = defineTable({
	roleId: v.id('roles'),
	permissionId: v.id('permissions'),
	scope: v.union(v.literal('all'), v.literal('own'), v.literal('none')),
	createdAt: v.number()
})
	.index('by_role', ['roleId'])
	.index('by_permission', ['permissionId'])
	.index('by_role_permission', ['roleId', 'permissionId']);

export const userRolesTable = defineTable({
	userId: v.id('users'),
	roleId: v.id('roles'),
	workspaceId: v.optional(v.id('workspaces')),
	circleId: v.optional(v.id('circles')),
	resourceType: v.optional(v.string()),
	resourceId: v.optional(v.string()),
	assignedBy: v.id('users'),
	assignedAt: v.number(),
	expiresAt: v.optional(v.number()),
	revokedAt: v.optional(v.number()),
	sourceCircleRoleId: v.optional(v.id('userCircleRoles'))
})
	.index('by_user', ['userId'])
	.index('by_role', ['roleId'])
	.index('by_user_role', ['userId', 'roleId'])
	.index('by_user_workspace', ['userId', 'workspaceId'])
	.index('by_user_circle', ['userId', 'circleId'])
	.index('by_user_resource', ['userId', 'resourceType', 'resourceId'])
	.index('by_source_circle_role', ['sourceCircleRoleId']);

export const resourceGuestsTable = defineTable({
	userId: v.id('users'),
	resourceType: v.string(),
	resourceId: v.string(),
	permissionIds: v.array(v.id('permissions')),
	invitedBy: v.id('users'),
	invitedAt: v.number(),
	expiresAt: v.optional(v.number()),
	revokedAt: v.optional(v.number()),
	lastAccessedAt: v.optional(v.number())
})
	.index('by_user', ['userId'])
	.index('by_resource', ['resourceType', 'resourceId'])
	.index('by_user_resource', ['userId', 'resourceType', 'resourceId']);

export const permissionAuditLogTable = defineTable({
	userId: v.id('users'),
	action: v.string(),
	permissionSlug: v.optional(v.string()),
	roleSlug: v.optional(v.string()),
	resourceType: v.optional(v.string()),
	resourceId: v.optional(v.string()),
	workspaceId: v.optional(v.id('workspaces')),
	circleId: v.optional(v.id('circles')),
	result: v.union(v.literal('allowed'), v.literal('denied')),
	reason: v.optional(v.string()),
	metadata: v.optional(v.any()),
	timestamp: v.number()
})
	.index('by_user', ['userId'])
	.index('by_timestamp', ['timestamp'])
	.index('by_user_timestamp', ['userId', 'timestamp'])
	.index('by_workspace', ['workspaceId'])
	.index('by_circle', ['circleId'])
	.index('by_action', ['action'])
	.index('by_permission', ['permissionSlug']);

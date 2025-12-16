import { defineTable } from 'convex/server';
import { v } from 'convex/values';

// =============================================================================
// RBAC Scope Model (SYOS-791)
// =============================================================================
// RBAC operates at two scopes with different identity models:
//
// | Scope     | Table          | Identifier | Use Case                            |
// |-----------|----------------|------------|-------------------------------------|
// | System    | systemRoles    | userId     | Platform ops: admin, dev, support   |
// | Workspace | workspaceRoles | personId   | Org ops: billing admin, ws admin    |
//
// Why two scopes?
// - Same user can have different RBAC roles in different workspaces
// - Platform-level access (developer, support) is independent of any workspace
// - Workspace isolation: personId prevents accidental cross-workspace correlation
// =============================================================================

/**
 * System-level roles (platform operations)
 *
 * Uses userId because system roles span ALL workspaces.
 * Examples: platform_admin, platform_manager, developer, support
 *
 * @see architecture.md - RBAC Scope Model
 */
export const systemRolesTable = defineTable({
	userId: v.id('users'),
	role: v.string(), // 'platform_admin' | 'platform_manager' | 'developer' | 'support'
	grantedAt: v.number(),
	grantedBy: v.optional(v.id('users'))
})
	.index('by_user', ['userId'])
	.index('by_role', ['role']);

/**
 * Workspace-level roles (organization operations)
 *
 * Uses personId because workspace roles are scoped to a single workspace.
 * The same user can be a billing admin in Workspace A but a regular member in Workspace B.
 * Examples: billing_admin, workspace_admin, member
 *
 * @see architecture.md - RBAC Scope Model
 */
export const workspaceRolesTable = defineTable({
	personId: v.id('people'),
	workspaceId: v.id('workspaces'),
	role: v.string(), // 'billing_admin' | 'workspace_admin' | 'member'
	grantedAt: v.number(),
	grantedByPersonId: v.optional(v.id('people')),
	sourceCircleRoleId: v.optional(v.id('assignments')) // For auto-assignment cleanup when circleRole removed
})
	.index('by_person', ['personId'])
	.index('by_role', ['role'])
	.index('by_source_role', ['sourceCircleRoleId']);

// =============================================================================
// Role and Permission Definition Tables
// =============================================================================

export const rbacRolesTable = defineTable({
	slug: v.string(),
	name: v.string(),
	description: v.string(),
	isSystem: v.boolean(),
	createdAt: v.number(),
	updatedAt: v.number()
}).index('by_slug', ['slug']);

export const rbacPermissionsTable = defineTable({
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

export const rbacRolePermissionsTable = defineTable({
	roleId: v.id('rbacRoles'),
	permissionId: v.id('rbacPermissions'),
	scope: v.union(v.literal('all'), v.literal('own'), v.literal('none')),
	createdAt: v.number()
})
	.index('by_role', ['roleId'])
	.index('by_permission', ['permissionId'])
	.index('by_role_permission', ['roleId', 'permissionId']);

// =============================================================================
// LEGACY: userRoles table (SYOS-862: DELETED)
// =============================================================================
// This table was replaced by systemRoles + workspaceRoles (SYOS-791).
// Deleted in SYOS-862 - all code migrated to use new tables.
// =============================================================================

/**
 * Guest access to specific resources.
 *
 * Grants a guest-person view access to a specific resource without requiring
 * a role assignment. For guests who need RBAC permissions, use role assignments
 * via the `assignments` table instead.
 *
 * Security model:
 * - personId scopes to exactly one workspace (no workspaceId needed)
 * - Presence of record = view access granted
 * - expiresAt provides optional time-limited access
 *
 * @see SYOS-868: Guest Access Design decision record
 * @see XDOM-01: Audit fields use personId, not userId
 */
export const resourceGuestsTable = defineTable({
	// Who (workspace-scoped identity)
	personId: v.id('people'), // The guest person (must have isGuest: true)

	// What they can access
	resourceType: v.string(), // 'circles' | 'proposals' | 'documents' | etc.
	resourceId: v.string(), // Specific resource ID

	// Audit
	grantedByPersonId: v.id('people'), // Who granted access
	grantedAt: v.number(), // When granted

	// Optional expiry (overrides person-level guestExpiry if set)
	expiresAt: v.optional(v.number())
})
	.index('by_person', ['personId'])
	.index('by_resource', ['resourceType', 'resourceId']);

export const rbacAuditLogTable = defineTable({
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

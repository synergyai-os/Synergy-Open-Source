/**
 * RBAC Permission Checking Functions
 *
 * Core permission logic that handles multi-role, resource scoping, and audit logging.
 */

import { query } from '../_generated/server';
import { v } from 'convex/values';
import type { QueryCtx, MutationCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import { validateSessionAndGetUserId } from '../sessionValidation';

// ============================================================================
// Types
// ============================================================================

export type PermissionSlug =
	| 'users.view'
	| 'users.invite'
	| 'users.remove'
	| 'users.change-roles'
	| 'users.manage-profile'
	| 'teams.view'
	| 'teams.create'
	| 'teams.update'
	| 'teams.delete'
	| 'teams.add-members'
	| 'teams.remove-members'
	| 'teams.change-roles'
	| 'organizations.view-settings'
	| 'organizations.update-settings'
	| 'organizations.manage-billing';

export interface PermissionContext {
	organizationId?: Id<'organizations'>;
	teamId?: Id<'teams'>;
	resourceType?: string;
	resourceId?: string;
	resourceOwnerId?: Id<'users'>; // User who "owns" the resource (for scope: "own")
}

interface UserPermission {
	permissionSlug: string;
	scope: 'all' | 'own' | 'none';
	roleSlug: string;
	roleName: string;
}

// ============================================================================
// Core Permission Functions
// ============================================================================

/**
 * Check if user has a specific permission
 * Handles multi-role users and resource scoping
 *
 * @returns true if user has permission, false otherwise
 */
export async function hasPermission(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	permissionSlug: PermissionSlug,
	context?: PermissionContext
): Promise<boolean> {
	try {
		// Get all permissions for this user
		const permissions = await getUserPermissions(ctx, userId, context);

		// Check if user has the permission with appropriate scope
		for (const perm of permissions) {
			if (perm.permissionSlug === permissionSlug) {
				// If scope is "all", user can access anything
				if (perm.scope === 'all') {
					await logPermissionCheck(ctx, {
						userId,
						action: 'check',
						permissionSlug,
						roleSlug: perm.roleSlug,
						result: 'allowed',
						context
					});
					return true;
				}

				// Handle "own" scope: user must own the resource OR have team-scoped role
				if (perm.scope === 'own') {
					// CASE 1: Team-scoped permission (e.g., Team Lead managing their team)
					// If context has teamId, and this permission exists, it means getUserPermissions
					// already filtered to roles with matching teamId - user has permission!
					if (context?.teamId && !context.resourceOwnerId) {
						await logPermissionCheck(ctx, {
							userId,
							action: 'check',
							permissionSlug,
							roleSlug: perm.roleSlug,
							result: 'allowed',
							reason: 'User has team-scoped role for this team',
							context
						});
						return true;
					}

					// CASE 2: Resource ownership check (e.g., user editing their own profile)
					if (context?.resourceOwnerId) {
						const isOwner = context.resourceOwnerId === userId;
						await logPermissionCheck(ctx, {
							userId,
							action: 'check',
							permissionSlug,
							roleSlug: perm.roleSlug,
							result: isOwner ? 'allowed' : 'denied',
							reason: isOwner ? 'User owns resource' : 'Resource not owned by user',
							context
						});
						return isOwner;
					}

					// CASE 3: No way to determine ownership - deny
					await logPermissionCheck(ctx, {
						userId,
						action: 'check',
						permissionSlug,
						roleSlug: perm.roleSlug,
						result: 'denied',
						reason: "Scope is 'own' but neither teamId nor resourceOwnerId provided",
						context
					});
					return false;
				}

				// If permission exists but scope is "none" or conditions not met
				if (perm.scope === 'none') {
					await logPermissionCheck(ctx, {
						userId,
						action: 'check',
						permissionSlug,
						roleSlug: perm.roleSlug,
						result: 'denied',
						reason: 'Explicitly denied by role configuration',
						context
					});
					return false;
				}
			}
		}

		// Permission not found
		await logPermissionCheck(ctx, {
			userId,
			action: 'check',
			permissionSlug,
			result: 'denied',
			reason: 'Permission not granted to user',
			context
		});
		return false;
	} catch (error) {
		console.error('Error checking permission:', error);
		return false;
	}
}

/**
 * Require a specific permission (throws if not granted)
 * Use this in mutations/queries to enforce permissions
 */
export async function requirePermission(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	permissionSlug: PermissionSlug,
	context?: PermissionContext
): Promise<void> {
	const hasPermissionResult = await hasPermission(ctx, userId, permissionSlug, context);

	if (!hasPermissionResult) {
		throw new Error(`Permission denied: ${permissionSlug}`);
	}
}

/**
 * Require system admin role (throws if not admin)
 * Use this in admin mutations/queries to enforce admin-only access
 *
 * @param ctx Query or Mutation context
 * @param sessionId Session ID from authenticated SvelteKit session
 * @returns userId if user is system admin
 * @throws Error if user is not system admin
 */
export async function requireSystemAdmin(
	ctx: QueryCtx | MutationCtx,
	sessionId: string
): Promise<Id<'users'>> {
	// Validate session and get userId (prevents impersonation)
	const { userId } = await validateSessionAndGetUserId(ctx, sessionId);

	// Get all user roles
	const userRoles = await ctx.db
		.query('userRoles')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();

	// Filter to active roles (not revoked, not expired)
	const now = Date.now();
	const activeUserRoles = userRoles.filter((ur) => {
		if (ur.revokedAt) return false;
		if (ur.expiresAt && ur.expiresAt < now) return false;
		return true;
	});

	// Check if user has admin role with no organizationId (global scope)
	for (const userRole of activeUserRoles) {
		// Must have no organizationId (global scope)
		if (userRole.organizationId !== undefined) {
			continue;
		}

		// Get role details
		const role = await ctx.db.get(userRole.roleId);
		if (!role) continue;

		// Check if role slug is 'admin'
		if (role.slug === 'admin') {
			return userId;
		}
	}

	throw new Error('System admin access required');
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all permissions for a user in a given context
 * Aggregates permissions from all roles the user has
 */
async function getUserPermissions(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	context?: PermissionContext
): Promise<UserPermission[]> {
	// Get all active user roles (not revoked or expired)
	const userRolesQuery = ctx.db
		.query('userRoles')
		.withIndex('by_user', (q) => q.eq('userId', userId));

	const allUserRoles = await userRolesQuery.collect();

	// Filter to active roles (not revoked, not expired)
	const now = Date.now();
	const activeUserRoles = allUserRoles.filter((ur) => {
		if (ur.revokedAt) return false;
		if (ur.expiresAt && ur.expiresAt < now) return false;

		// If context specifies org/team, only include matching scoped roles + unscoped roles
		if (context?.organizationId) {
			if (ur.organizationId && ur.organizationId !== context.organizationId) {
				return false;
			}
		}

		if (context?.teamId) {
			if (ur.teamId && ur.teamId !== context.teamId) {
				return false;
			}
		}

		return true;
	});

	// Get all permissions for these roles
	const permissions: UserPermission[] = [];

	for (const userRole of activeUserRoles) {
		// Get role details
		const role = await ctx.db.get(userRole.roleId);
		if (!role) continue;

		// Get role permissions
		const rolePermissions = await ctx.db
			.query('rolePermissions')
			.withIndex('by_role', (q) => q.eq('roleId', userRole.roleId))
			.collect();

		for (const rolePerm of rolePermissions) {
			const permission = await ctx.db.get(rolePerm.permissionId);
			if (!permission) continue;

			permissions.push({
				permissionSlug: permission.slug,
				scope: rolePerm.scope,
				roleSlug: role.slug,
				roleName: role.name
			});
		}
	}

	// Merge permissions (if user has same permission from multiple roles, take highest scope)
	const merged = new Map<string, UserPermission>();

	const scopePriority = { all: 3, own: 2, none: 1 };

	for (const perm of permissions) {
		const existing = merged.get(perm.permissionSlug);

		if (!existing || scopePriority[perm.scope] > scopePriority[existing.scope]) {
			merged.set(perm.permissionSlug, perm);
		}
	}

	return Array.from(merged.values());
}

/**
 * Get role permissions for a specific role
 * TODO: Re-enable when needed
 */
// async function getRolePermissions(
// 	ctx: QueryCtx | MutationCtx,
// 	roleId: Id<'roles'>
// ): Promise<UserPermission[]> {
// 	const role = await ctx.db.get(roleId);
// 	if (!role) return [];
//
// 	const rolePermissions = await ctx.db
// 		.query('rolePermissions')
// 		.withIndex('by_role', (q) => q.eq('roleId', roleId))
// 		.collect();
//
// 	const permissions: UserPermission[] = [];
//
// 	for (const rolePerm of rolePermissions) {
// 		const permission = await ctx.db.get(rolePerm.permissionId);
// 		if (!permission) continue;
//
// 		permissions.push({
// 			permissionSlug: permission.slug,
// 			scope: rolePerm.scope,
// 			roleSlug: role.slug,
// 			roleName: role.name
// 		});
// 	}
//
// 	return permissions;
// }

// ============================================================================
// Audit Logging
// ============================================================================

interface PermissionLogEntry {
	userId: Id<'users'>;
	action: string;
	permissionSlug?: string;
	roleSlug?: string;
	result: 'allowed' | 'denied';
	reason?: string;
	context?: PermissionContext;
}

/**
 * Log a permission check to the audit log
 */
async function logPermissionCheck(
	ctx: QueryCtx | MutationCtx,
	entry: PermissionLogEntry
): Promise<void> {
	try {
		// Type guard: only log in mutation contexts (db.insert only available in mutations)
		if ('insert' in ctx.db) {
			await ctx.db.insert('permissionAuditLog', {
				userId: entry.userId,
				action: entry.action,
				permissionSlug: entry.permissionSlug,
				roleSlug: entry.roleSlug,
				resourceType: entry.context?.resourceType,
				resourceId: entry.context?.resourceId,
				organizationId: entry.context?.organizationId,
				teamId: entry.context?.teamId,
				result: entry.result,
				reason: entry.reason,
				metadata: entry.context
					? {
							resourceOwnerId: entry.context.resourceOwnerId
						}
					: undefined,
				timestamp: Date.now()
			});
		}
		// In query contexts, we silently skip logging (can't write from queries)
	} catch (error) {
		// Don't fail permission check if audit logging fails
		console.error('Failed to log permission check:', error);
	}
}

// ============================================================================
// Query - Frontend Permission Checking
// ============================================================================

/**
 * Check if user is a system-level admin (global admin role with no organizationId)
 *
 * Used by hooks.server.ts to protect admin routes
 *
 * @returns true if user has global admin role, false otherwise
 */
export const isSystemAdmin = query({
	args: {
		sessionId: v.string() // Session validation (derives userId securely)
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get all user roles
		const userRoles = await ctx.db
			.query('userRoles')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		// Filter to active roles (not revoked, not expired)
		const now = Date.now();
		const activeUserRoles = userRoles.filter((ur) => {
			if (ur.revokedAt) return false;
			if (ur.expiresAt && ur.expiresAt < now) return false;
			return true;
		});

		// Check if user has admin role with no organizationId (global scope)
		for (const userRole of activeUserRoles) {
			// Must have no organizationId (global scope)
			if (userRole.organizationId !== undefined) {
				continue;
			}

			// Get role details
			const role = await ctx.db.get(userRole.roleId);
			if (!role) continue;

			// Check if role slug is 'admin'
			if (role.slug === 'admin') {
				return true;
			}
		}

		return false;
	}
});

/**
 * Get user permissions for frontend use
 * Returns flattened list of permissions with their slugs
 *
 * Used by usePermissions composable to reactively check permissions in UI
 */
export const getUserPermissionsQuery = query({
	args: {
		sessionId: v.string(), // Session validation (derives userId securely)
		organizationId: v.optional(v.id('organizations')),
		teamId: v.optional(v.id('teams'))
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const context: PermissionContext = {};

		if (args.organizationId) {
			context.organizationId = args.organizationId;
		}

		if (args.teamId) {
			context.teamId = args.teamId;
		}

		// Get all permissions for user
		const permissions = await getUserPermissions(ctx, userId, context);

		// Return flattened permissions with slug and scope
		return permissions.map((p) => ({
			permissionSlug: p.permissionSlug,
			scope: p.scope,
			roleSlug: p.roleSlug,
			roleName: p.roleName
		}));
	}
});

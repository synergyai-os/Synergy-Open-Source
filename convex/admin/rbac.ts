/**
 * Admin RBAC Management
 *
 * Queries and mutations for managing roles, permissions, and user-role assignments.
 * All functions require system admin access (global admin role).
 */

import { query, mutation } from '../_generated/server';
import { v } from 'convex/values';
import { requireSystemAdmin } from '../infrastructure/rbac/permissions';
import type { Id } from '../_generated/dataModel';
import { createError, ErrorCodes } from '../infrastructure/errors/codes';

// ============================================================================
// RBAC Management Queries
// ============================================================================

/**
 * List all roles with permission counts
 * Deduplicates by slug (keeps the most recent role if duplicates exist)
 */
export const listRoles = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const roles = await ctx.db.query('rbacRoles').collect();

		// Get permission counts for each role
		const rolesWithCounts = await Promise.all(
			roles.map(async (role) => {
				const rolePermissions = await ctx.db
					.query('rbacRolePermissions')
					.withIndex('by_role', (q) => q.eq('roleId', role._id))
					.collect();

				return {
					_id: role._id,
					slug: role.slug,
					name: role.name,
					description: role.description,
					isSystem: role.isSystem,
					permissionCount: rolePermissions.length,
					createdAt: role.createdAt,
					updatedAt: role.updatedAt
				};
			})
		);

		// Deduplicate by slug - keep the most recent role (highest createdAt)
		const roleMap = new Map<string, (typeof rolesWithCounts)[number]>();
		for (const role of rolesWithCounts) {
			const existing = roleMap.get(role.slug);
			if (!existing || role.createdAt > existing.createdAt) {
				roleMap.set(role.slug, role);
			}
		}

		return Array.from(roleMap.values());
	}
});

/**
 * Get single role with all permissions
 */
export const getRole = query({
	args: {
		sessionId: v.string(),
		roleId: v.id('rbacRoles')
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const role = await ctx.db.get(args.roleId);
		if (!role) {
			throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
		}

		// Get all permissions for this role
		const rolePermissions = await ctx.db
			.query('rbacRolePermissions')
			.withIndex('by_role', (q) => q.eq('roleId', args.roleId))
			.collect();

		const permissions = await Promise.all(
			rolePermissions.map(async (rp) => {
				const permission = await ctx.db.get(rp.permissionId);
				if (!permission) return null;

				return {
					permissionId: permission._id,
					slug: permission.slug,
					category: permission.category,
					action: permission.action,
					description: permission.description,
					scope: rp.scope
				};
			})
		);

		return {
			_id: role._id,
			slug: role.slug,
			name: role.name,
			description: role.description,
			isSystem: role.isSystem,
			permissions: permissions.filter((p) => p !== null),
			createdAt: role.createdAt,
			updatedAt: role.updatedAt
		};
	}
});

/**
 * List all permissions grouped by category
 */
export const listPermissions = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const permissions = await ctx.db.query('rbacPermissions').collect();

		// Group by category
		const grouped = permissions.reduce(
			(acc, perm) => {
				if (!acc[perm.category]) {
					acc[perm.category] = [];
				}
				acc[perm.category].push({
					_id: perm._id,
					slug: perm.slug,
					category: perm.category,
					action: perm.action,
					description: perm.description,
					requiresResource: perm.requiresResource,
					isSystem: perm.isSystem,
					createdAt: perm.createdAt,
					updatedAt: perm.updatedAt
				});
				return acc;
			},
			{} as Record<string, unknown[]>
		);

		return grouped;
	}
});

/**
 * Get permissions for a specific role
 */
export const getRolePermissions = query({
	args: {
		sessionId: v.string(),
		roleId: v.id('rbacRoles')
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const rolePermissions = await ctx.db
			.query('rbacRolePermissions')
			.withIndex('by_role', (q) => q.eq('roleId', args.roleId))
			.collect();

		const permissions = await Promise.all(
			rolePermissions.map(async (rp) => {
				const permission = await ctx.db.get(rp.permissionId);
				if (!permission) return null;

				return {
					permissionId: permission._id,
					slug: permission.slug,
					category: permission.category,
					action: permission.action,
					description: permission.description,
					scope: rp.scope
				};
			})
		);

		return permissions.filter((p) => p !== null);
	}
});

/**
 * Get all roles for a user (with scoping info)
 *
 * SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
 */
export const getUserRoles = query({
	args: {
		sessionId: v.string(),
		targetUserId: v.id('users')
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const result: Array<{
			userRoleId: Id<'systemRoles'> | Id<'workspaceRoles'>;
			roleId: Id<'rbacRoles'>;
			roleSlug: string;
			roleName: string;
			workspaceId?: Id<'workspaces'>;
			circleId?: Id<'circles'>;
			assignedAt: number;
			expiresAt?: number;
			revokedAt?: number;
		}> = [];

		// Get system roles (platform-level)
		const systemRoles = await ctx.db
			.query('systemRoles')
			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId))
			.collect();

		for (const systemRole of systemRoles) {
			const role = await ctx.db
				.query('rbacRoles')
				.withIndex('by_slug', (q) => q.eq('slug', systemRole.role))
				.first();

			if (role) {
				result.push({
					userRoleId: systemRole._id,
					roleId: role._id,
					roleSlug: role.slug,
					roleName: role.name,
					assignedAt: systemRole.grantedAt,
					expiresAt: undefined // System roles don't expire
				});
			}
		}

		// Get workspace roles (workspace-scoped)
		// Need to find all people for this user across workspaces
		const people = await ctx.db
			.query('people')
			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId))
			.collect();

		for (const person of people) {
			const workspaceRoles = await ctx.db
				.query('workspaceRoles')
				.withIndex('by_person', (q) => q.eq('personId', person._id))
				.collect();

			for (const workspaceRole of workspaceRoles) {
				const role = await ctx.db
					.query('rbacRoles')
					.withIndex('by_slug', (q) => q.eq('slug', workspaceRole.role))
					.first();

				if (role) {
					result.push({
						userRoleId: workspaceRole._id,
						roleId: role._id,
						roleSlug: role.slug,
						roleName: role.name,
						workspaceId: workspaceRole.workspaceId,
						assignedAt: workspaceRole.grantedAt,
						expiresAt: undefined // Workspace roles don't expire in new model
					});
				}
			}
		}

		return result;
	}
});

/**
 * List all user-role assignments (for admin overview)
 *
 * SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
 */
export const listUserRoles = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const assignments: Array<{
			userRoleId: Id<'systemRoles'> | Id<'workspaceRoles'>;
			userId: Id<'users'>;
			userEmail: string;
			userName: string;
			roleId: Id<'rbacRoles'>;
			roleSlug: string;
			roleName: string;
			workspaceId?: Id<'workspaces'>;
			circleId?: Id<'circles'>;
			assignedAt: number;
			expiresAt?: number;
			revokedAt?: number;
		}> = [];

		// Get all system roles
		const systemRoles = await ctx.db.query('systemRoles').collect();
		for (const systemRole of systemRoles) {
			const role = await ctx.db
				.query('rbacRoles')
				.withIndex('by_slug', (q) => q.eq('slug', systemRole.role))
				.first();
			const user = await ctx.db.get(systemRole.userId);
			if (!role || !user) continue;

			assignments.push({
				userRoleId: systemRole._id,
				userId: user._id,
				userEmail: user.email,
				userName: user.name || user.email,
				roleId: role._id,
				roleSlug: role.slug,
				roleName: role.name,
				assignedAt: systemRole.grantedAt,
				expiresAt: undefined
			});
		}

		// Get all workspace roles
		const workspaceRoles = await ctx.db.query('workspaceRoles').collect();
		for (const workspaceRole of workspaceRoles) {
			const role = await ctx.db
				.query('rbacRoles')
				.withIndex('by_slug', (q) => q.eq('slug', workspaceRole.role))
				.first();
			const person = await ctx.db.get(workspaceRole.personId);
			if (!role || !person || !person.userId) continue;

			const user = await ctx.db.get(person.userId);
			if (!user) continue;

			assignments.push({
				userRoleId: workspaceRole._id,
				userId: user._id,
				userEmail: user.email,
				userName: user.name || user.email,
				roleId: role._id,
				roleSlug: role.slug,
				roleName: role.name,
				workspaceId: workspaceRole.workspaceId,
				assignedAt: workspaceRole.grantedAt,
				expiresAt: undefined
			});
		}

		return assignments;
	}
});

/**
 * Get RBAC system analytics
 * Provides insights into role distribution, permission usage, and assignment patterns
 *
 * SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
 */
export const getRBACAnalytics = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const allSystemRoles = await ctx.db.query('systemRoles').collect();
		const allWorkspaceRoles = await ctx.db.query('workspaceRoles').collect();
		const allRoles = await ctx.db.query('rbacRoles').collect();
		const allPermissions = await ctx.db.query('rbacPermissions').collect();
		const allRolePermissions = await ctx.db.query('rbacRolePermissions').collect();

		// Build lookup maps to avoid N+1 queries
		const rolesBySlug = new Map(allRoles.map((r) => [r.slug, r]));
		const permsById = new Map(allPermissions.map((p) => [p._id, p]));

		// Combine all assignments (system + workspace)
		const activeAssignments: Array<{
			roleSlug: string;
			userId: Id<'users'>;
			workspaceId?: Id<'workspaces'>;
			circleId?: Id<'circles'>;
		}> = [];

		// Process system roles
		for (const systemRole of allSystemRoles) {
			activeAssignments.push({
				roleSlug: systemRole.role,
				userId: systemRole.userId
			});
		}

		// Process workspace roles
		for (const workspaceRole of allWorkspaceRoles) {
			const person = await ctx.db.get(workspaceRole.personId);
			if (!person || !person.userId) continue;

			activeAssignments.push({
				roleSlug: workspaceRole.role,
				userId: person.userId,
				workspaceId: workspaceRole.workspaceId
			});
		}

		// Role distribution (how many users per role)
		const roleDistribution = new Map<
			string,
			{ roleName: string; count: number; scopes: { global: number; org: number; circle: number } }
		>();

		for (const assignment of activeAssignments) {
			const role = rolesBySlug.get(assignment.roleSlug);
			if (!role) continue;

			const existing = roleDistribution.get(role.slug) || {
				roleName: role.name,
				count: 0,
				scopes: { global: 0, org: 0, circle: 0 }
			};

			existing.count++;
			if (assignment.circleId) {
				existing.scopes.circle++;
			} else if (assignment.workspaceId) {
				existing.scopes.org++;
			} else {
				existing.scopes.global++;
			}

			roleDistribution.set(role.slug, existing);
		}

		// Most assigned roles (top 5)
		const mostAssignedRoles = Array.from(roleDistribution.entries())
			.map(([slug, data]) => ({ slug, ...data }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		// Assignment scope breakdown
		const scopeBreakdown = {
			global: activeAssignments.filter((ur) => !ur.workspaceId && !ur.circleId).length,
			workspace: activeAssignments.filter((ur) => ur.workspaceId && !ur.circleId).length,
			circle: activeAssignments.filter((ur) => ur.circleId).length
		};

		// Permission usage stats
		const permissionUsage = new Map<string, number>();
		for (const rp of allRolePermissions) {
			const permission = permsById.get(rp.permissionId);
			if (!permission) continue;

			const existing = permissionUsage.get(permission.slug) || 0;
			permissionUsage.set(permission.slug, existing + 1);
		}

		// Most used permissions (top 5)
		const mostUsedPermissions = Array.from(permissionUsage.entries())
			.map(([slug, count]) => ({ slug, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		// System-level assignments only (for system admin visibility)
		const systemLevelAssignments = activeAssignments.filter(
			(ur) => !ur.workspaceId && !ur.circleId
		);
		const systemLevelUsers = new Set(systemLevelAssignments.map((ur) => ur.userId.toString()));

		// Role health metrics
		const rolesWithNoAssignments = allRoles.filter((role) => {
			const hasAssignments = activeAssignments.some((ur) => ur.roleSlug === role.slug);
			return !hasAssignments;
		});

		const rolesWithNoPermissions = allRoles.filter((role) => {
			const hasPermissions = allRolePermissions.some((rp) => rp.roleId === role._id);
			return !hasPermissions;
		});

		const totalAssignments = allSystemRoles.length + allWorkspaceRoles.length;

		return {
			overview: {
				totalRoles: allRoles.length,
				totalPermissions: allPermissions.length,
				totalAssignments,
				activeAssignments: activeAssignments.length,
				revokedAssignments: 0 // New model doesn't have revokedAt
			},
			roleDistribution: Array.from(roleDistribution.entries()).map(([slug, data]) => ({
				slug,
				...data
			})),
			mostAssignedRoles,
			scopeBreakdown,
			mostUsedPermissions,
			systemLevel: {
				assignments: systemLevelAssignments.length,
				users: systemLevelUsers.size
			},
			health: {
				rolesWithNoAssignments: rolesWithNoAssignments.length,
				rolesWithNoPermissions: rolesWithNoPermissions.length,
				unusedRoles: rolesWithNoAssignments.map((r) => ({
					_id: r._id,
					slug: r.slug,
					name: r.name
				}))
			}
		};
	}
});

/**
 * List all workspaces (for admin dropdown)
 */
export const listWorkspaces = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const workspaces = await ctx.db.query('workspaces').collect();

		return workspaces.map((workspace) => ({
			_id: workspace._id,
			name: workspace.name,
			slug: workspace.slug
		}));
	}
});

/**
 * List circles by workspace (for admin dropdown)
 */
export const listCirclesByWorkspace = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const circles = await ctx.db
			.query('circles')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();

		return circles.map((circle) => ({
			_id: circle._id,
			name: circle.name,
			slug: circle.slug,
			workspaceId: circle.workspaceId
		}));
	}
});

// ============================================================================
// RBAC Management Mutations
// ============================================================================

/**
 * Create new permission
 */
export const createPermission = mutation({
	args: {
		sessionId: v.string(),
		slug: v.string(),
		category: v.string(),
		action: v.string(),
		description: v.string(),
		requiresResource: v.boolean()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		// Check if permission with slug already exists
		const existing = await ctx.db
			.query('rbacPermissions')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.first();

		if (existing) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Permission with this slug already exists');
		}

		const now = Date.now();
		const permissionId = await ctx.db.insert('rbacPermissions', {
			slug: args.slug,
			category: args.category,
			action: args.action,
			description: args.description,
			requiresResource: args.requiresResource,
			isSystem: false,
			createdAt: now,
			updatedAt: now
		});

		return permissionId;
	}
});

/**
 * Create new role
 */
export const createRole = mutation({
	args: {
		sessionId: v.string(),
		slug: v.string(),
		name: v.string(),
		description: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		// Check if role with slug already exists
		const existing = await ctx.db
			.query('rbacRoles')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.first();

		if (existing) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Role with this slug already exists');
		}

		const now = Date.now();
		const roleId = await ctx.db.insert('rbacRoles', {
			slug: args.slug,
			name: args.name,
			description: args.description,
			isSystem: false,
			createdAt: now,
			updatedAt: now
		});

		return roleId;
	}
});

/**
 * Update role name/description
 */
export const updateRole = mutation({
	args: {
		sessionId: v.string(),
		roleId: v.id('rbacRoles'),
		name: v.optional(v.string()),
		description: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const role = await ctx.db.get(args.roleId);
		if (!role) {
			throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
		}

		// Prevent changes to system roles
		if (role.isSystem) {
			throw createError(ErrorCodes.AUTHZ_INSUFFICIENT_RBAC, 'Cannot modify system roles');
		}

		const updates: { name?: string; description?: string; updatedAt: number } = {
			updatedAt: Date.now()
		};

		if (args.name !== undefined) {
			updates.name = args.name;
		}

		if (args.description !== undefined) {
			updates.description = args.description;
		}

		await ctx.db.patch(args.roleId, updates);

		return { success: true };
	}
});

/**
 * Delete role
 */
export const deleteRole = mutation({
	args: {
		sessionId: v.string(),
		roleId: v.id('rbacRoles')
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const role = await ctx.db.get(args.roleId);
		if (!role) {
			throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
		}

		// Prevent deletion of system roles
		if (role.isSystem) {
			throw createError(ErrorCodes.AUTHZ_INSUFFICIENT_RBAC, 'Cannot delete system roles');
		}

		// Check if role is assigned to any users
		// Check systemRoles
		const systemRoles = await ctx.db
			.query('systemRoles')
			.filter((q) => q.eq(q.field('role'), role.slug))
			.first();

		const workspaceRoles = await ctx.db
			.query('workspaceRoles')
			.filter((q) => q.eq(q.field('role'), role.slug))
			.first();

		if (systemRoles || workspaceRoles) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Cannot delete role that is assigned to users');
		}

		// Delete role permissions first
		const rolePermissions = await ctx.db
			.query('rbacRolePermissions')
			.withIndex('by_role', (q) => q.eq('roleId', args.roleId))
			.collect();

		for (const rp of rolePermissions) {
			await ctx.db.delete(rp._id);
		}

		// Delete role
		await ctx.db.delete(args.roleId);

		return { success: true };
	}
});

/**
 * Assign permission to role with scope
 */
export const assignPermissionToRole = mutation({
	args: {
		sessionId: v.string(),
		roleId: v.id('rbacRoles'),
		permissionId: v.id('rbacPermissions'),
		scope: v.union(v.literal('all'), v.literal('own'), v.literal('none'))
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		// Check if assignment already exists
		const existing = await ctx.db
			.query('rbacRolePermissions')
			.withIndex('by_role_permission', (q) =>
				q.eq('roleId', args.roleId).eq('permissionId', args.permissionId)
			)
			.first();

		if (existing) {
			// Update existing assignment
			await ctx.db.patch(existing._id, {
				scope: args.scope
			});
			return { success: true, updated: true };
		}

		// Create new assignment
		await ctx.db.insert('rbacRolePermissions', {
			roleId: args.roleId,
			permissionId: args.permissionId,
			scope: args.scope,
			createdAt: Date.now()
		});

		return { success: true, updated: false };
	}
});

/**
 * Remove permission from role
 */
export const removePermissionFromRole = mutation({
	args: {
		sessionId: v.string(),
		roleId: v.id('rbacRoles'),
		permissionId: v.id('rbacPermissions')
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const rolePermission = await ctx.db
			.query('rbacRolePermissions')
			.withIndex('by_role_permission', (q) =>
				q.eq('roleId', args.roleId).eq('permissionId', args.permissionId)
			)
			.first();

		if (!rolePermission) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Permission not assigned to role');
		}

		await ctx.db.delete(rolePermission._id);

		return { success: true };
	}
});

/**
 * Assign role to user (with optional org/team scoping, expiration)
 *
 * SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
 */
export const assignRoleToUser = mutation({
	args: {
		sessionId: v.string(),
		assigneeUserId: v.id('users'),
		roleId: v.id('rbacRoles'),
		workspaceId: v.optional(v.id('workspaces')),
		circleId: v.optional(v.id('circles')),
		expiresAt: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const adminUserId = await requireSystemAdmin(ctx, args.sessionId);

		const role = await ctx.db.get(args.roleId);
		if (!role) {
			throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
		}

		// Note: expiresAt is not supported in new model (systemRoles/workspaceRoles don't have expiration)
		if (args.expiresAt) {
			console.warn('expiresAt parameter is not supported in new RBAC model');
		}

		if (args.workspaceId) {
			// Workspace-scoped role
			const person = await ctx.db
				.query('people')
				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId))
				.filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
				.first();

			if (!person) {
				throw createError(
					ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
					'User must be a member of the workspace to assign workspace roles'
				);
			}

			// Check if already has this workspace role
			const existing = await ctx.db
				.query('workspaceRoles')
				.withIndex('by_person', (q) => q.eq('personId', person._id))
				.filter((q) =>
					q.and(q.eq(q.field('workspaceId'), args.workspaceId), q.eq(q.field('role'), role.slug))
				)
				.first();

			if (existing) {
				return { success: true, updated: true, userRoleId: existing._id };
			}

			// Get admin personId for grantedByPersonId
			const adminPerson = await ctx.db
				.query('people')
				.withIndex('by_user', (q) => q.eq('userId', adminUserId))
				.filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
				.first();

			const userRoleId = await ctx.db.insert('workspaceRoles', {
				personId: person._id,
				workspaceId: args.workspaceId,
				role: role.slug,
				grantedAt: Date.now(),
				grantedByPersonId: adminPerson?._id
			});

			return { success: true, updated: false, userRoleId };
		} else {
			// System-scoped role
			// Check if already has this system role
			const existing = await ctx.db
				.query('systemRoles')
				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId))
				.filter((q) => q.eq(q.field('role'), role.slug))
				.first();

			if (existing) {
				return { success: true, updated: true, userRoleId: existing._id };
			}

			const userRoleId = await ctx.db.insert('systemRoles', {
				userId: args.assigneeUserId,
				role: role.slug,
				grantedAt: Date.now(),
				grantedBy: adminUserId
			});

			return { success: true, updated: false, userRoleId };
		}
	}
});

/**
 * Revoke role from user
 *
 * SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
 */
export const revokeUserRole = mutation({
	args: {
		sessionId: v.string(),
		userRoleId: v.union(v.id('systemRoles'), v.id('workspaceRoles'))
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		// Try systemRoles first
		const systemRole = await ctx.db.get(args.userRoleId as Id<'systemRoles'>);
		if (systemRole && 'userId' in systemRole) {
			await ctx.db.delete(args.userRoleId as Id<'systemRoles'>);
			return { success: true };
		}

		// Try workspaceRoles
		const workspaceRole = await ctx.db.get(args.userRoleId as Id<'workspaceRoles'>);
		if (workspaceRole && 'personId' in workspaceRole) {
			await ctx.db.delete(args.userRoleId as Id<'workspaceRoles'>);
			return { success: true };
		}

		throw createError(ErrorCodes.GENERIC_ERROR, 'User role assignment not found');
	}
});

/**
 * Update user role (scoping, expiration)
 *
 * SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
 * Note: New model doesn't support updating scoping - must revoke and re-assign
 */
export const updateUserRole = mutation({
	args: {
		sessionId: v.string(),
		userRoleId: v.union(v.id('systemRoles'), v.id('workspaceRoles')),
		workspaceId: v.optional(v.id('workspaces')),
		circleId: v.optional(v.id('circles')),
		expiresAt: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		// Note: New model doesn't support updating scoping or expiration
		// This mutation is kept for backward compatibility but does nothing
		// Callers should revoke and re-assign if they need to change scoping
		if (args.expiresAt !== undefined) {
			console.warn('expiresAt is not supported in new RBAC model');
		}
		if (args.workspaceId !== undefined || args.circleId !== undefined) {
			console.warn(
				'Updating scoping is not supported in new RBAC model. Revoke and re-assign instead.'
			);
		}

		// Verify the role exists
		const systemRole = await ctx.db.get(args.userRoleId as Id<'systemRoles'>);
		const workspaceRole = await ctx.db.get(args.userRoleId as Id<'workspaceRoles'>);

		if (!systemRole && !workspaceRole) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'User role assignment not found');
		}

		return { success: true };
	}
});

/**
 * Setup docs.view permission and assign to admin role
 * Helper function to quickly restrict documentation access
 */
export const setupDocsPermission = mutation({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const adminUserId = await requireSystemAdmin(ctx, args.sessionId);
		const now = Date.now();

		// Step 1: Create docs.view permission if it doesn't exist
		let docsViewPerm = await ctx.db
			.query('rbacPermissions')
			.withIndex('by_slug', (q) => q.eq('slug', 'docs.view'))
			.first();

		if (!docsViewPerm) {
			const permissionId = await ctx.db.insert('rbacPermissions', {
				slug: 'docs.view',
				category: 'docs',
				action: 'view',
				description: 'View documentation pages',
				requiresResource: false,
				isSystem: true,
				createdAt: now,
				updatedAt: now
			});
			docsViewPerm = await ctx.db.get(permissionId);
			if (!docsViewPerm) {
				throw createError(ErrorCodes.GENERIC_ERROR, 'Failed to create docs.view permission');
			}
		}

		// Step 2: Get admin role
		const adminRole = await ctx.db
			.query('rbacRoles')
			.withIndex('by_slug', (q) => q.eq('slug', 'admin'))
			.first();

		if (!adminRole) {
			throw createError(
				ErrorCodes.GENERIC_ERROR,
				'Admin role not found. Please run seedRBAC first.'
			);
		}

		// Step 3: Assign docs.view permission to admin role (scope: "all")
		const existingRolePerm = await ctx.db
			.query('rbacRolePermissions')
			.withIndex('by_role_permission', (q) =>
				q.eq('roleId', adminRole._id).eq('permissionId', docsViewPerm._id)
			)
			.first();

		if (!existingRolePerm) {
			await ctx.db.insert('rbacRolePermissions', {
				roleId: adminRole._id,
				permissionId: docsViewPerm._id,
				scope: 'all',
				createdAt: now
			});
		}

		// Step 4: Ensure admin role is assigned to current user (system scope)
		const existingSystemRole = await ctx.db
			.query('systemRoles')
			.withIndex('by_user', (q) => q.eq('userId', adminUserId))
			.filter((q) => q.eq(q.field('role'), 'admin'))
			.first();

		if (!existingSystemRole) {
			await ctx.db.insert('systemRoles', {
				userId: adminUserId,
				role: 'admin',
				grantedAt: now,
				grantedBy: adminUserId
			});
		}

		return {
			success: true,
			permissionId: docsViewPerm._id,
			roleId: adminRole._id,
			userId: adminUserId,
			message:
				'docs.view permission created and assigned to admin role. Admin role assigned to you.'
		};
	}
});

// ============================================================================
// Role Template RBAC Permissions Management
// ============================================================================

/**
 * List all role templates with their RBAC permissions
 * Returns both system-level and workspace-level templates
 */
export const listRoleTemplates = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		// Get all role templates (system and workspace-level)
		const allTemplates = await ctx.db.query('roleTemplates').collect();

		// Filter out archived templates
		const activeTemplates = allTemplates.filter((t) => !t.archivedAt);

		// Enrich with permission details
		const templatesWithPermissions = await Promise.all(
			activeTemplates.map(async (template) => {
				const rbacPermissions = template.rbacPermissions || [];

				// Enrich permission slugs with permission details
				const enrichedPermissions = await Promise.all(
					rbacPermissions.map(async (perm) => {
						const permission = await ctx.db
							.query('rbacPermissions')
							.withIndex('by_slug', (q) => q.eq('slug', perm.permissionSlug))
							.first();

						return {
							permissionSlug: perm.permissionSlug,
							scope: perm.scope,
							permissionId: permission?._id,
							permissionName: permission?.description || perm.permissionSlug,
							category: permission?.category
						};
					})
				);

				return {
					_id: template._id,
					name: template.name,
					roleType: template.roleType,
					description: template.description,
					workspaceId: template.workspaceId,
					isCore: template.isCore,
					appliesTo: template.appliesTo,
					rbacPermissions: enrichedPermissions,
					createdAt: template.createdAt,
					updatedAt: template.updatedAt
				};
			})
		);

		// Sort: system templates first, then by name
		return templatesWithPermissions.sort((a, b) => {
			if (a.workspaceId === undefined && b.workspaceId !== undefined) return -1;
			if (a.workspaceId !== undefined && b.workspaceId === undefined) return 1;
			return a.name.localeCompare(b.name);
		});
	}
});

/**
 * Update RBAC permissions for a role template
 */
export const updateTemplateRbacPermissions = mutation({
	args: {
		sessionId: v.string(),
		templateId: v.id('roleTemplates'),
		rbacPermissions: v.array(
			v.object({
				permissionSlug: v.string(),
				scope: v.union(v.literal('all'), v.literal('own'))
			})
		)
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const template = await ctx.db.get(args.templateId);
		if (!template) {
			throw createError(ErrorCodes.TEMPLATE_NOT_FOUND, 'Role template not found');
		}

		// Validate all permission slugs exist
		for (const perm of args.rbacPermissions) {
			const permission = await ctx.db
				.query('rbacPermissions')
				.withIndex('by_slug', (q) => q.eq('slug', perm.permissionSlug))
				.first();

			if (!permission) {
				throw createError(
					ErrorCodes.GENERIC_ERROR,
					`Permission "${perm.permissionSlug}" not found`
				);
			}
		}

		// Update template
		await ctx.db.patch(args.templateId, {
			rbacPermissions: args.rbacPermissions,
			updatedAt: Date.now()
		});

		return { success: true };
	}
});

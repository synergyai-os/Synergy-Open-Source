/**
 * RBAC Query Functions
 *
 * Helper queries for retrieving roles and permissions data.
 */

import { query } from '../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../sessionValidation';
import type { Id } from '../_generated/dataModel';

/**
 * Get all roles
 */
export const getRoles = query({
	handler: async (ctx) => {
		return ctx.db.query('roles').collect();
	}
});

/**
 * Get all permissions
 */
export const getPermissions = query({
	handler: async (ctx) => {
		return ctx.db.query('permissions').collect();
	}
});

/**
 * Get permissions for a specific role
 */
export const getPermissionsForRole = query({
	args: { roleSlug: v.string() },
	handler: async (ctx, { roleSlug }) => {
		// Get role
		const role = await ctx.db
			.query('roles')
			.withIndex('by_slug', (q) => q.eq('slug', roleSlug))
			.first();

		if (!role) {
			return null;
		}

		// Get role permissions
		const rolePermissions = await ctx.db
			.query('rolePermissions')
			.withIndex('by_role', (q) => q.eq('roleId', role._id))
			.collect();

		// Get permission details
		const permissions = await Promise.all(rolePermissions.map((rp) => ctx.db.get(rp.permissionId)));

		return {
			role,
			permissions: permissions.filter(Boolean).map((p, i) => ({
				...p,
				scope: rolePermissions[i].scope
			}))
		};
	}
});

/**
 * Get detailed RBAC information for a user
 * Returns system roles and workspace-specific roles with their permissions
 */
export const getUserRBACDetails = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.optional(v.id('workspaces'))
	},
	handler: async (ctx, args) => {
		// Validate session and get userId
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get all user roles
		const allUserRoles = await ctx.db
			.query('userRoles')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		// Filter active roles
		const now = Date.now();
		const activeUserRoles = allUserRoles.filter((ur) => {
			if (ur.revokedAt) return false;
			if (ur.expiresAt && ur.expiresAt < now) return false;
			return true;
		});

		// Separate system roles (no workspaceId) and workspace roles
		const systemRoles: Array<{
			userRoleId: Id<'userRoles'>;
			roleSlug: string;
			roleName: string;
			permissions: Array<{
				slug: string;
				category: string;
				action: string;
				description: string;
				scope: 'all' | 'own' | 'none';
			}>;
			assignedAt: number;
			expiresAt?: number;
		}> = [];

		const workspaceRolesMap = new Map<
			Id<'workspaces'>,
			Array<{
				userRoleId: Id<'userRoles'>;
				roleSlug: string;
				roleName: string;
				circleId?: Id<'circles'>;
				permissions: Array<{
					slug: string;
					category: string;
					action: string;
					description: string;
					scope: 'all' | 'own' | 'none';
				}>;
				assignedAt: number;
				expiresAt?: number;
			}>
		>();

		// Process each role
		for (const userRole of activeUserRoles) {
			const role = await ctx.db.get(userRole.roleId);
			if (!role) continue;

			// Get role permissions
			const rolePermissions = await ctx.db
				.query('rolePermissions')
				.withIndex('by_role', (q) => q.eq('roleId', userRole.roleId))
				.collect();

			// Get permission details
			const permissions = await Promise.all(
				rolePermissions.map(async (rp) => {
					const permission = await ctx.db.get(rp.permissionId);
					if (!permission) return null;
					return {
						slug: permission.slug,
						category: permission.category,
						action: permission.action,
						description: permission.description,
						scope: rp.scope
					};
				})
			);

			const roleData = {
				userRoleId: userRole._id,
				roleSlug: role.slug,
				roleName: role.name,
				permissions: permissions.filter(Boolean) as Array<{
					slug: string;
					category: string;
					action: string;
					description: string;
					scope: 'all' | 'own' | 'none';
				}>,
				assignedAt: userRole.assignedAt,
				expiresAt: userRole.expiresAt
			};

			if (!userRole.workspaceId) {
				// System role
				systemRoles.push(roleData);
			} else {
				// Workspace role
				if (!workspaceRolesMap.has(userRole.workspaceId)) {
					workspaceRolesMap.set(userRole.workspaceId, []);
				}
				workspaceRolesMap.get(userRole.workspaceId)!.push({
					...roleData,
					circleId: userRole.circleId
				});
			}
		}

		// Convert workspace map to array with workspace names
		const workspaceRoles = await Promise.all(
			Array.from(workspaceRolesMap.entries()).map(async ([workspaceId, roles]) => {
				const workspace = await ctx.db.get(workspaceId);
				return {
					workspaceId,
					workspaceName: workspace?.name ?? 'Unknown',
					roles
				};
			})
		);

		// Get active workspace roles if workspaceId is provided
		const activeWorkspaceRoles =
			args.workspaceId && workspaceRolesMap.has(args.workspaceId)
				? workspaceRolesMap.get(args.workspaceId)!
				: [];

		return {
			systemRoles,
			workspaceRoles,
			activeWorkspaceRoles: args.workspaceId ? activeWorkspaceRoles : []
		};
	}
});

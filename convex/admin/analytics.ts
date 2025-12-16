/**
 * Admin Analytics
 *
 * Queries for system analytics and statistics.
 * All functions require system admin access (global admin role).
 */

import { query } from '../_generated/server';
import { v } from 'convex/values';
import { requireSystemAdmin } from '../infrastructure/rbac/permissions';

/**
 * Get system statistics
 */
export const getSystemStats = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		// Get user count
		const users = await ctx.db.query('users').collect();
		const activeUsers = users.filter((u) => !u.deletedAt);

		// Get workspace count
		const workspaces = await ctx.db.query('workspaces').collect();

		// Get circle count
		const circles = await ctx.db.query('circles').collect();

		// Get role assignments count
		// SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
		const systemRoles = await ctx.db.query('systemRoles').collect();
		const workspaceRoles = await ctx.db.query('workspaceRoles').collect();
		const activeUserRoles = [...systemRoles, ...workspaceRoles]; // All are active in new model

		// Get roles count
		const roles = await ctx.db.query('rbacRoles').collect();

		// Get permissions count
		const permissions = await ctx.db.query('rbacPermissions').collect();

		return {
			users: {
				total: users.length,
				active: activeUsers.length,
				deleted: users.length - activeUsers.length
			},
			workspaces: {
				total: workspaces.length
			},
			circles: {
				total: circles.length
			},
			roles: {
				total: roles.length,
				system: roles.filter((r) => r.isSystem).length,
				custom: roles.filter((r) => !r.isSystem).length
			},
			permissions: {
				total: permissions.length,
				system: permissions.filter((p) => p.isSystem).length,
				custom: permissions.filter((p) => !p.isSystem).length
			},
			roleAssignments: {
				total: activeUserRoles.length,
				active: activeUserRoles.length,
				revoked: 0 // New model doesn't have revokedAt
			}
		};
	}
});

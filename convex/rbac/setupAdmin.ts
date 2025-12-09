/**
 * Admin Setup Utility
 *
 * One-time mutation to assign admin role to a user.
 * Run this after seeding RBAC data to make yourself an admin.
 *
 * Usage: Call setupAdmin() mutation from Convex dashboard:
 *   setupAdmin({ userId: "your-user-id-here" })
 *
 * Or via CLI:
 *   npx convex run rbac/setupAdmin:setupAdmin '{"userId":"your-user-id-here"}'
 */

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../_generated/dataModel';
import type { QueryCtx, MutationCtx } from '../_generated/server';
import { createError, ErrorCodes } from '../infrastructure/errors/codes';

/**
 * Assign admin role to a user
 */
export const setupAdmin = mutation({
	args: {
		userId: v.id('users'),
		workspaceId: v.optional(v.id('workspaces')) // Optional: scope to specific org
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		console.log(`🔧 Setting up admin for user: ${args.userId}`);

		// 1. Find admin role
		const adminRole = await ctx.db
			.query('roles')
			.withIndex('by_slug', (q) => q.eq('slug', 'admin'))
			.first();

		if (!adminRole) {
			throw createError(
				ErrorCodes.GENERIC_ERROR,
				'Admin role not found. Please run seedRBAC first.'
			);
		}

		// 2. Check if user already has admin role
		const existing = await ctx.db
			.query('userRoles')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.filter((q) => q.eq(q.field('roleId'), adminRole._id))
			.first();

		if (existing) {
			console.log('⚠️  User already has admin role');
			return {
				success: true,
				message: 'User already has admin role',
				userRoleId: existing._id
			};
		}

		// 3. Assign admin role
		const userRoleId = await ctx.db.insert('userRoles', {
			userId: args.userId,
			roleId: adminRole._id,
			assignedAt: now,
			assignedBy: args.userId, // Self-assigned
			workspaceId: args.workspaceId ?? undefined
		});

		console.log(`✅ Admin role assigned to user ${args.userId}`);

		// 4. Verify permissions
		const permissions = await getUserPermissions(ctx, args.userId);

		return {
			success: true,
			message: 'Admin role assigned successfully',
			userRoleId,
			permissions: permissions.map((p) => p.permissionSlug),
			permissionCount: permissions.length
		};
	}
});

/**
 * Verify admin setup - check user's current roles and permissions
 */
export const verifyAdminSetup = query({
	args: {
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		// Get user's roles
		const userRoles = await ctx.db
			.query('userRoles')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.collect();

		const roles = await Promise.all(
			userRoles.map(async (ur) => {
				const role = await ctx.db.get(ur.roleId);
				return role
					? {
							roleId: role._id,
							slug: role.slug,
							name: role.name,
							scope: ur.workspaceId ? 'workspace' : ur.circleId ? 'circle' : 'global'
						}
					: null;
			})
		);

		// Get user's permissions
		const permissions = await getUserPermissions(ctx, args.userId);

		return {
			userId: args.userId,
			roles: roles.filter((r) => r !== null),
			permissions: permissions.map((p) => ({
				slug: p.permissionSlug,
				scope: p.scope,
				fromRole: p.roleName
			})),
			isAdmin: roles.some((r) => r?.slug === 'admin')
		};
	}
});

/**
 * Helper: Get all permissions for a user (flattened from all roles)
 */
async function getUserPermissions(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>
): Promise<Array<{ permissionSlug: string; scope: 'all' | 'own' | 'none'; roleName: string }>> {
	// Get all user's roles
	const userRoles = await ctx.db
		.query('userRoles')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();

	if (userRoles.length === 0) {
		return [];
	}

	// Get permissions for each role
	const allPermissions: Array<{
		permissionSlug: string;
		scope: 'all' | 'own' | 'none';
		roleName: string;
	}> = [];

	for (const userRole of userRoles) {
		const role = await ctx.db.get(userRole.roleId);
		if (!role) continue;

		// Get role-permission mappings
		const rolePerms = await ctx.db
			.query('rolePermissions')
			.withIndex('by_role', (q) => q.eq('roleId', userRole.roleId))
			.collect();

		for (const rolePerm of rolePerms) {
			const permission = await ctx.db.get(rolePerm.permissionId);
			if (!permission) continue;

			allPermissions.push({
				permissionSlug: permission.slug,
				scope: rolePerm.scope,
				roleName: role.name
			});
		}
	}

	return allPermissions;
}

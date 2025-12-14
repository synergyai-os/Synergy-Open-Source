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

import { mutation, query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import type { QueryCtx, MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../errors/codes';
import { validateSessionAndGetUserId } from '../sessionValidation';
import { findPersonByUserAndWorkspace as _findPersonByUserAndWorkspace } from '../../core/people/queries';

/**
 * Assign admin role to a user
 */
export const setupAdmin = mutation({
	args: {
		sessionId: v.optional(v.string()),
		assigneeUserId: v.id('users'),
		workspaceId: v.optional(v.id('workspaces')) // Optional: scope to specific org
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		if (args.sessionId) {
			await validateSessionAndGetUserId(ctx, args.sessionId);
		}

		console.log(`🔧 Setting up admin for user: ${args.assigneeUserId}`);

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
		// SYOS-862: Updated to use systemRoles instead of deprecated userRoles table
		if (args.workspaceId) {
			// Workspace-scoped admin (workspaceRoles)
			const person = await ctx.db
				.query('people')
				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId))
				.filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
				.first();

			if (!person) {
				throw createError(
					ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
					'User must be a member of the workspace to assign workspace admin role'
				);
			}

			const existing = await ctx.db
				.query('workspaceRoles')
				.withIndex('by_person', (q) => q.eq('personId', person._id))
				.filter((q) =>
					q.and(
						q.eq(q.field('workspaceId'), args.workspaceId),
						q.eq(q.field('role'), 'workspace_admin')
					)
				)
				.first();

			if (existing) {
				console.log('⚠️  User already has workspace admin role');
				return {
					success: true,
					message: 'User already has workspace admin role',
					userRoleId: existing._id
				};
			}

			const userRoleId = await ctx.db.insert('workspaceRoles', {
				personId: person._id,
				workspaceId: args.workspaceId,
				role: 'workspace_admin',
				grantedAt: now,
				grantedByPersonId: person._id // Self-assigned
			});

			console.log(`✅ Workspace admin role assigned to user ${args.assigneeUserId}`);

			// 4. Verify permissions
			const permissions = await getUserPermissions(ctx, args.assigneeUserId);

			return {
				success: true,
				message: 'Workspace admin role assigned successfully',
				userRoleId,
				permissions: permissions.map((p) => p.permissionSlug),
				permissionCount: permissions.length
			};
		} else {
			// System-scoped admin (systemRoles)
			const existing = await ctx.db
				.query('systemRoles')
				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId))
				.filter((q) => q.eq(q.field('role'), 'platform_admin'))
				.first();

			if (existing) {
				console.log('⚠️  User already has platform admin role');
				const permissions = await getUserPermissions(ctx, args.assigneeUserId);
				return {
					success: true,
					message: 'User already has platform admin role',
					userRoleId: existing._id,
					permissions: permissions.map((p) => p.permissionSlug),
					permissionCount: permissions.length
				};
			}

			const userRoleId = await ctx.db.insert('systemRoles', {
				userId: args.assigneeUserId,
				role: 'platform_admin',
				grantedAt: now,
				grantedBy: args.assigneeUserId // Self-assigned
			});

			console.log(`✅ Platform admin role assigned to user ${args.assigneeUserId}`);

			// 4. Verify permissions
			const permissions = await getUserPermissions(ctx, args.assigneeUserId);

			return {
				success: true,
				message: 'Platform admin role assigned successfully',
				userRoleId,
				permissions: permissions.map((p) => p.permissionSlug),
				permissionCount: permissions.length
			};
		}

		// 4. Verify permissions
		const permissions = await getUserPermissions(ctx, args.assigneeUserId);

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
		sessionId: v.optional(v.string()),
		targetUserId: v.id('users')
	},
	handler: async (ctx, args) => {
		if (args.sessionId) {
			await validateSessionAndGetUserId(ctx, args.sessionId);
		}

		// Get user's roles
		// SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
		const roles: Array<{
			roleId: Id<'roles'>;
			slug: string;
			name: string;
			scope: string;
		}> = [];

		// Get system roles
		const systemRoles = await ctx.db
			.query('systemRoles')
			.withIndex('by_user', (q) => q.eq('userId', args.targetUserId))
			.collect();

		for (const systemRole of systemRoles) {
			const role = await ctx.db
				.query('roles')
				.withIndex('by_slug', (q) => q.eq('slug', systemRole.role))
				.first();

			if (role) {
				roles.push({
					roleId: role._id,
					slug: role.slug,
					name: role.name,
					scope: 'system'
				});
			}
		}

		// Get workspace roles
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
					.query('roles')
					.withIndex('by_slug', (q) => q.eq('slug', workspaceRole.role))
					.first();

				if (role) {
					roles.push({
						roleId: role._id,
						slug: role.slug,
						name: role.name,
						scope: 'workspace'
					});
				}
			}
		}

		// Get user's permissions
		const permissions = await getUserPermissions(ctx, args.targetUserId);

		return {
			userId: args.targetUserId,
			roles,
			permissions: permissions.map((p) => ({
				slug: p.permissionSlug,
				scope: p.scope,
				fromRole: p.roleName
			})),
			isAdmin: roles.some(
				(r) => r.slug === 'admin' || r.slug === 'platform_admin' || r.slug === 'workspace_admin'
			)
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
	// SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
	const allPermissions: Array<{
		permissionSlug: string;
		scope: 'all' | 'own' | 'none';
		roleName: string;
	}> = [];

	// Get system roles
	const systemRoles = await ctx.db
		.query('systemRoles')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();

	for (const systemRole of systemRoles) {
		const role = await ctx.db
			.query('roles')
			.withIndex('by_slug', (q) => q.eq('slug', systemRole.role))
			.first();

		if (!role) continue;

		// Get role-permission mappings
		const rolePerms = await ctx.db
			.query('rolePermissions')
			.withIndex('by_role', (q) => q.eq('roleId', role._id))
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

	// Get workspace roles
	const people = await ctx.db
		.query('people')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();

	for (const person of people) {
		const workspaceRoles = await ctx.db
			.query('workspaceRoles')
			.withIndex('by_person', (q) => q.eq('personId', person._id))
			.collect();

		for (const workspaceRole of workspaceRoles) {
			const role = await ctx.db
				.query('roles')
				.withIndex('by_slug', (q) => q.eq('slug', workspaceRole.role))
				.first();

			if (!role) continue;

			// Get role-permission mappings
			const rolePerms = await ctx.db
				.query('rolePermissions')
				.withIndex('by_role', (q) => q.eq('roleId', role._id))
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
	}

	return allPermissions;
}

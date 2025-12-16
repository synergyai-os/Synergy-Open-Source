/**
 * RBAC Query Functions
 *
 * Helper queries for retrieving roles and permissions data.
 */

import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../sessionValidation';
import type { Id } from '../../_generated/dataModel';

/**
 * Get all roles
 */
export const getRoles = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);
		return ctx.db.query('rbacRoles').collect();
	}
});

/**
 * Get all permissions
 */
export const getPermissions = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);
		return ctx.db.query('rbacPermissions').collect();
	}
});

/**
 * Get permissions for a specific role
 */
export const getPermissionsForRole = query({
	args: { sessionId: v.string(), roleSlug: v.string() },
	handler: async (ctx, { sessionId, roleSlug }) => {
		await validateSessionAndGetUserId(ctx, sessionId);
		// Get role
		const role = await ctx.db
			.query('rbacRoles')
			.withIndex('by_slug', (q) => q.eq('slug', roleSlug))
			.first();

		if (!role) {
			return null;
		}

		// Get role permissions
		const rolePermissions = await ctx.db
			.query('rbacRolePermissions')
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
 *
 * SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
 */
export const getUserRBACDetails = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.optional(v.id('workspaces'))
	},
	handler: async (ctx, args) => {
		// Validate session and get userId
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Separate system roles and workspace roles
		const systemRoles: Array<{
			userRoleId: Id<'systemRoles'>;
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
				userRoleId: Id<'workspaceRoles'>;
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

		// Process system roles
		const allSystemRoles = await ctx.db
			.query('systemRoles')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		for (const systemRole of allSystemRoles) {
			const role = await ctx.db
				.query('rbacRoles')
				.withIndex('by_slug', (q) => q.eq('slug', systemRole.role))
				.first();

			if (!role) continue;

			// Get role permissions
			const rolePermissions = await ctx.db
				.query('rbacRolePermissions')
				.withIndex('by_role', (q) => q.eq('roleId', role._id))
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

			systemRoles.push({
				userRoleId: systemRole._id,
				roleSlug: role.slug,
				roleName: role.name,
				permissions: permissions.filter(Boolean) as Array<{
					slug: string;
					category: string;
					action: string;
					description: string;
					scope: 'all' | 'own' | 'none';
				}>,
				assignedAt: systemRole.grantedAt,
				expiresAt: undefined // System roles don't expire
			});
		}

		// Process workspace roles
		const people = await ctx.db
			.query('people')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		for (const person of people) {
			const allWorkspaceRoles = await ctx.db
				.query('workspaceRoles')
				.withIndex('by_person', (q) => q.eq('personId', person._id))
				.collect();

			for (const workspaceRole of allWorkspaceRoles) {
				const role = await ctx.db
					.query('rbacRoles')
					.withIndex('by_slug', (q) => q.eq('slug', workspaceRole.role))
					.first();

				if (!role) continue;

				// Get role permissions
				const rolePermissions = await ctx.db
					.query('rbacRolePermissions')
					.withIndex('by_role', (q) => q.eq('roleId', role._id))
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
					userRoleId: workspaceRole._id,
					roleSlug: role.slug,
					roleName: role.name,
					permissions: permissions.filter(Boolean) as Array<{
						slug: string;
						category: string;
						action: string;
						description: string;
						scope: 'all' | 'own' | 'none';
					}>,
					assignedAt: workspaceRole.grantedAt,
					expiresAt: undefined // Workspace roles don't expire in new model
				};

				if (!workspaceRolesMap.has(workspaceRole.workspaceId)) {
					workspaceRolesMap.set(workspaceRole.workspaceId, []);
				}
				workspaceRolesMap.get(workspaceRole.workspaceId)!.push(roleData);
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

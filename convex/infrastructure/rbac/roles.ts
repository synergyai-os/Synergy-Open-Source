/**
 * RBAC Role Management Functions
 *
 * Functions for assigning, revoking, and querying user roles.
 *
 * SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
 */

import { mutation, query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import { validateSessionAndGetUserId } from '../sessionValidation';
import { createError, ErrorCodes } from '../errors/codes';
import { requirePermission } from './permissions';
import {
	grantSystemRole,
	grantWorkspaceRole,
	revokeSystemRole,
	revokeWorkspaceRole
} from './scopeHelpers';
import { findPersonByUserAndWorkspace } from '../../core/people/queries';
import type { SystemRole, WorkspaceRole } from './scopeHelpers';

/**
 * Assign a role to a user
 * Requires "users.change-roles" permission
 */
export const assignRole = mutation({
	args: {
		sessionId: v.string(),
		assigneeUserId: v.id('users'),
		roleSlug: v.string(),
		workspaceId: v.optional(v.id('workspaces')),
		circleId: v.optional(v.id('circles')),
		resourceType: v.optional(v.string()),
		resourceId: v.optional(v.string()),
		expiresAt: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Check permission
		await requirePermission(ctx, actingUserId, 'users.change-roles', {
			workspaceId: args.workspaceId,
			circleId: args.circleId
		});

		// Get role by slug
		const role = await ctx.db
			.query('rbacRoles')
			.withIndex('by_slug', (q) => q.eq('slug', args.roleSlug))
			.first();

		if (!role) {
			throw createError(ErrorCodes.ROLE_NOT_FOUND, `Role not found: ${args.roleSlug}`);
		}

		// Determine if this is a system role or workspace role
		// System roles: no workspaceId, workspace roles: has workspaceId
		if (args.workspaceId) {
			// Workspace-scoped role
			const person = await findPersonByUserAndWorkspace(ctx, args.assigneeUserId, args.workspaceId);
			if (!person) {
				throw createError(
					ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
					'User must be a member of the workspace to assign workspace roles'
				);
			}

			// Check if person already has this workspace role
			const existing = await ctx.db
				.query('workspaceRoles')
				.withIndex('by_person', (q) => q.eq('personId', person._id))
				.filter((q) =>
					q.and(
						q.eq(q.field('workspaceId'), args.workspaceId),
						q.eq(q.field('role'), args.roleSlug as WorkspaceRole)
					)
				)
				.first();

			if (existing) {
				throw createError(ErrorCodes.GENERIC_ERROR, `User already has role: ${args.roleSlug}`);
			}

			// Get actor personId for grantedByPersonId
			const actorPerson = await findPersonByUserAndWorkspace(ctx, actingUserId, args.workspaceId);
			const grantedByPersonId = actorPerson?._id;

			const workspaceRoleId = await grantWorkspaceRole(
				ctx,
				person._id,
				args.roleSlug as WorkspaceRole,
				grantedByPersonId
			);

			return { success: true, userRoleId: workspaceRoleId as any }; // Type cast for backward compatibility
		} else {
			// System-scoped role
			// Check if user already has this system role
			const existing = await ctx.db
				.query('systemRoles')
				.withIndex('by_user', (q) => q.eq('userId', args.assigneeUserId))
				.filter((q) => q.eq(q.field('role'), args.roleSlug as SystemRole))
				.first();

			if (existing) {
				throw createError(ErrorCodes.GENERIC_ERROR, `User already has role: ${args.roleSlug}`);
			}

			const systemRoleId = await grantSystemRole(
				ctx,
				args.assigneeUserId,
				args.roleSlug as SystemRole,
				actingUserId
			);

			return { success: true, userRoleId: systemRoleId as any }; // Type cast for backward compatibility
		}

		// Note: Circle-scoped roles and resource-scoped roles are not supported in the new model yet
		// They would need to be added to workspaceRoles with additional fields if needed
	}
});

/**
 * Revoke a role from a user
 * Requires "users.change-roles" permission
 *
 * SYOS-862: Updated to work with systemRoles + workspaceRoles
 * Accepts either systemRoleId or workspaceRoleId
 */
export const revokeRole = mutation({
	args: {
		sessionId: v.string(),
		userRoleId: v.union(v.id('systemRoles'), v.id('workspaceRoles')) // Accepts either table ID
	},
	handler: async (ctx, args) => {
		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Try to get as system role first
		const systemRole = await ctx.db.get(args.userRoleId as any);
		if (systemRole && 'userId' in systemRole) {
			// It's a system role
			await requirePermission(ctx, actingUserId, 'users.change-roles', {});

			await revokeSystemRole(ctx, systemRole.userId, systemRole.role as SystemRole);
			return { success: true };
		}

		// Try to get as workspace role
		const workspaceRole = await ctx.db.get(args.userRoleId as any);
		if (workspaceRole && 'personId' in workspaceRole) {
			// It's a workspace role
			await requirePermission(ctx, actingUserId, 'users.change-roles', {
				workspaceId: workspaceRole.workspaceId
			});

			await revokeWorkspaceRole(ctx, workspaceRole.personId, workspaceRole.role as WorkspaceRole);
			return { success: true };
		}

		throw createError(ErrorCodes.GENERIC_ERROR, 'User role not found');
	}
});

/**
 * Get all roles for a user
 *
 * SYOS-862: Updated to query systemRoles + workspaceRoles instead of deprecated userRoles
 */
export const getUserRoles = query({
	args: {
		sessionId: v.string(), // Session validation (derives userId securely)
		workspaceId: v.optional(v.id('workspaces')),
		circleId: v.optional(v.id('circles'))
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const result: Array<{
			userRoleId: Id<'systemRoles'> | Id<'workspaceRoles'>;
			roleSlug: string;
			roleName: string;
			workspaceId?: Id<'workspaces'>;
			circleId?: Id<'circles'>;
			assignedAt: number;
			expiresAt?: number;
		}> = [];

		// Get system roles
		const systemRoles = await ctx.db
			.query('systemRoles')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect();

		for (const systemRole of systemRoles) {
			const role = await ctx.db
				.query('rbacRoles')
				.withIndex('by_slug', (q) => q.eq('slug', systemRole.role))
				.first();

			if (role) {
				result.push({
					userRoleId: systemRole._id,
					roleSlug: role.slug,
					roleName: role.name,
					assignedAt: systemRole.grantedAt,
					expiresAt: undefined // System roles don't expire
				});
			}
		}

		// Get workspace roles (if workspaceId provided)
		if (args.workspaceId) {
			const person = await findPersonByUserAndWorkspace(ctx, userId, args.workspaceId);
			if (person) {
				const workspaceRoles = await ctx.db
					.query('workspaceRoles')
					.withIndex('by_person', (q) => q.eq('personId', person._id))
					.filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
					.collect();

				for (const workspaceRole of workspaceRoles) {
					const role = await ctx.db
						.query('rbacRoles')
						.withIndex('by_slug', (q) => q.eq('slug', workspaceRole.role))
						.first();

					if (role) {
						result.push({
							userRoleId: workspaceRole._id,
							roleSlug: role.slug,
							roleName: role.name,
							workspaceId: workspaceRole.workspaceId,
							assignedAt: workspaceRole.grantedAt,
							expiresAt: undefined // Workspace roles don't expire in new model
						});
					}
				}
			}
		}

		// Note: Circle-scoped roles are not supported in the new model yet
		// If args.circleId is provided, we could filter here, but the new tables don't have circleId

		return result;
	}
});

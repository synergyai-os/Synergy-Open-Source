/**
 * RBAC Role Management Functions
 *
 * Functions for assigning, revoking, and querying user roles.
 */

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../sessionValidation';
import { createError, ErrorCodes } from '../infrastructure/errors/codes';
import { requirePermission } from './permissions';

/**
 * Assign a role to a user
 * Requires "users.change-roles" permission
 */
export const assignRole = mutation({
	args: {
		sessionId: v.string(),
		userId: v.id('users'),
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
			.query('roles')
			.withIndex('by_slug', (q) => q.eq('slug', args.roleSlug))
			.first();

		if (!role) {
			throw createError(ErrorCodes.ROLE_NOT_FOUND, `Role not found: ${args.roleSlug}`);
		}

		// Check if user already has this role
		const existingRole = await ctx.db
			.query('userRoles')
			.withIndex('by_user_role', (q) => q.eq('userId', args.userId).eq('roleId', role._id))
			.filter((q) => {
				let filter = q.eq(q.field('revokedAt'), undefined);

				if (args.workspaceId) {
					filter = q.and(filter, q.eq(q.field('workspaceId'), args.workspaceId));
				}

				if (args.circleId) {
					filter = q.and(filter, q.eq(q.field('circleId'), args.circleId));
				}

				return filter;
			})
			.first();

		if (existingRole) {
			throw createError(ErrorCodes.GENERIC_ERROR, `User already has role: ${args.roleSlug}`);
		}

		// Assign role
		const userRoleId = await ctx.db.insert('userRoles', {
			userId: args.userId,
			roleId: role._id,
			workspaceId: args.workspaceId,
			circleId: args.circleId,
			resourceType: args.resourceType,
			resourceId: args.resourceId,
			assignedBy: actingUserId,
			assignedAt: Date.now(),
			expiresAt: args.expiresAt
		});

		return { success: true, userRoleId };
	}
});

/**
 * Revoke a role from a user
 * Requires "users.change-roles" permission
 */
export const revokeRole = mutation({
	args: {
		sessionId: v.string(),
		userRoleId: v.id('userRoles')
	},
	handler: async (ctx, args) => {
		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get user role
		const userRole = await ctx.db.get(args.userRoleId);
		if (!userRole) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'User role not found');
		}

		// Check permission
		await requirePermission(ctx, actingUserId, 'users.change-roles', {
			workspaceId: userRole.workspaceId,
			circleId: userRole.circleId
		});

		// Mark as revoked
		await ctx.db.patch(args.userRoleId, {
			revokedAt: Date.now()
		});

		return { success: true };
	}
});

/**
 * Get all roles for a user
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

		const query = ctx.db.query('userRoles').withIndex('by_user', (q) => q.eq('userId', userId));

		const allRoles = await query.collect();

		// Filter active roles
		const now = Date.now();
		const activeRoles = allRoles.filter((ur) => {
			if (ur.revokedAt) return false;
			if (ur.expiresAt && ur.expiresAt < now) return false;

			if (args.workspaceId && ur.workspaceId && ur.workspaceId !== args.workspaceId) {
				return false;
			}

			if (args.circleId && ur.circleId && ur.circleId !== args.circleId) {
				return false;
			}

			return true;
		});

		// Populate role details
		const rolesWithDetails = await Promise.all(
			activeRoles.map(async (ur) => {
				const role = await ctx.db.get(ur.roleId);
				return {
					userRoleId: ur._id,
					roleSlug: role?.slug,
					roleName: role?.name,
					workspaceId: ur.workspaceId,
					circleId: ur.circleId,
					assignedAt: ur.assignedAt,
					expiresAt: ur.expiresAt
				};
			})
		);

		return rolesWithDetails;
	}
});

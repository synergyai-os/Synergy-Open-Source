/**
 * RBAC Role Management Functions
 *
 * Functions for assigning, revoking, and querying user roles.
 */

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '../auth';
import type { Id } from '../_generated/dataModel';
import { requirePermission } from './permissions';

/**
 * Assign a role to a user
 * Requires "users.change-roles" permission
 */
export const assignRole = mutation({
	args: {
		userId: v.id('users'),
		roleSlug: v.string(),
		organizationId: v.optional(v.id('organizations')),
		teamId: v.optional(v.id('teams')),
		resourceType: v.optional(v.string()),
		resourceId: v.optional(v.string()),
		expiresAt: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const actingUserId = await getAuthUserId(ctx);
		if (!actingUserId) {
			throw new Error('Not authenticated');
		}

		// Check permission
		await requirePermission(ctx, actingUserId, 'users.change-roles', {
			organizationId: args.organizationId,
			teamId: args.teamId
		});

		// Get role by slug
		const role = await ctx.db
			.query('roles')
			.withIndex('by_slug', (q) => q.eq('slug', args.roleSlug))
			.first();

		if (!role) {
			throw new Error(`Role not found: ${args.roleSlug}`);
		}

		// Check if user already has this role
		const existingRole = await ctx.db
			.query('userRoles')
			.withIndex('by_user_role', (q) => q.eq('userId', args.userId).eq('roleId', role._id))
			.filter((q) => {
				let filter = q.eq(q.field('revokedAt'), undefined);

				if (args.organizationId) {
					filter = q.and(filter, q.eq(q.field('organizationId'), args.organizationId));
				}

				if (args.teamId) {
					filter = q.and(filter, q.eq(q.field('teamId'), args.teamId));
				}

				return filter;
			})
			.first();

		if (existingRole) {
			throw new Error(`User already has role: ${args.roleSlug}`);
		}

		// Assign role
		const userRoleId = await ctx.db.insert('userRoles', {
			userId: args.userId,
			roleId: role._id,
			organizationId: args.organizationId,
			teamId: args.teamId,
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
		userRoleId: v.id('userRoles')
	},
	handler: async (ctx, args) => {
		const actingUserId = await getAuthUserId(ctx);
		if (!actingUserId) {
			throw new Error('Not authenticated');
		}

		// Get user role
		const userRole = await ctx.db.get(args.userRoleId);
		if (!userRole) {
			throw new Error('User role not found');
		}

		// Check permission
		await requirePermission(ctx, actingUserId, 'users.change-roles', {
			organizationId: userRole.organizationId,
			teamId: userRole.teamId
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
		userId: v.id('users'),
		organizationId: v.optional(v.id('organizations')),
		teamId: v.optional(v.id('teams'))
	},
	handler: async (ctx, args) => {
		const query = ctx.db.query('userRoles').withIndex('by_user', (q) => q.eq('userId', args.userId));

		const allRoles = await query.collect();

		// Filter active roles
		const now = Date.now();
		const activeRoles = allRoles.filter((ur) => {
			if (ur.revokedAt) return false;
			if (ur.expiresAt && ur.expiresAt < now) return false;

			if (args.organizationId && ur.organizationId && ur.organizationId !== args.organizationId) {
				return false;
			}

			if (args.teamId && ur.teamId && ur.teamId !== args.teamId) {
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
					organizationId: ur.organizationId,
					teamId: ur.teamId,
					assignedAt: ur.assignedAt,
					expiresAt: ur.expiresAt
				};
			})
		);

		return rolesWithDetails;
	}
});

/**
 * Admin User Management
 *
 * Queries and mutations for managing users.
 * All functions require system admin access (global admin role).
 */

import { query } from '../_generated/server';
import { v } from 'convex/values';
import { requireSystemAdmin } from '../rbac/permissions';

/**
 * List all users
 */
export const listAllUsers = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const users = await ctx.db.query('users').collect();

		return users.map((user) => ({
			_id: user._id,
			workosId: user.workosId,
			email: user.email,
			emailVerified: user.emailVerified,
			firstName: user.firstName,
			lastName: user.lastName,
			name: user.name,
			profileImageUrl: user.profileImageUrl,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			lastLoginAt: user.lastLoginAt,
			deletedAt: user.deletedAt
		}));
	}
});

/**
 * Get user by ID with role information
 */
export const getUserById = query({
	args: {
		sessionId: v.string(),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const user = await ctx.db.get(args.userId);
		if (!user) {
			throw new Error('User not found');
		}

		// Get user's roles
		const userRoles = await ctx.db
			.query('userRoles')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.collect();

		const roles = await Promise.all(
			userRoles.map(async (ur) => {
				const role = await ctx.db.get(ur.roleId);
				if (!role) return null;

				return {
					userRoleId: ur._id,
					roleId: role._id,
					roleSlug: role.slug,
					roleName: role.name,
					workspaceId: ur.workspaceId,
					circleId: ur.circleId,
					assignedAt: ur.assignedAt,
					expiresAt: ur.expiresAt,
					revokedAt: ur.revokedAt
				};
			})
		);

		return {
			_id: user._id,
			workosId: user.workosId,
			email: user.email,
			emailVerified: user.emailVerified,
			firstName: user.firstName,
			lastName: user.lastName,
			name: user.name,
			profileImageUrl: user.profileImageUrl,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			lastLoginAt: user.lastLoginAt,
			deletedAt: user.deletedAt,
			roles: roles.filter((r) => r !== null)
		};
	}
});

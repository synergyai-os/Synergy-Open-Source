/**
 * Admin User Management
 *
 * Queries and mutations for managing users.
 * All functions require system admin access (global admin role).
 */

import { query } from '../_generated/server';
import { v } from 'convex/values';
import { requireSystemAdmin } from '../infrastructure/rbac/permissions';
import { createError, ErrorCodes } from '../infrastructure/errors/codes';
import type { Id } from '../_generated/dataModel';

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
		targetUserId: v.id('users')
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const user = await ctx.db.get(args.targetUserId);
		if (!user) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'User not found');
		}

		// Get user's roles
		// SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
		const roles: Array<{
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

		// Get system roles
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
				roles.push({
					userRoleId: systemRole._id,
					roleId: role._id,
					roleSlug: role.slug,
					roleName: role.name,
					assignedAt: systemRole.grantedAt,
					expiresAt: undefined
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
					.query('rbacRoles')
					.withIndex('by_slug', (q) => q.eq('slug', workspaceRole.role))
					.first();

				if (role) {
					roles.push({
						userRoleId: workspaceRole._id,
						roleId: role._id,
						roleSlug: role.slug,
						roleName: role.name,
						workspaceId: workspaceRole.workspaceId,
						assignedAt: workspaceRole.grantedAt,
						expiresAt: undefined
					});
				}
			}
		}

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
			roles
		};
	}
});

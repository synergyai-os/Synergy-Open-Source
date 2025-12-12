/**
 * Workspace Role Management Queries
 *
 * Queries for managing RBAC roles at the workspace level.
 * Part of SYOS-649: RBAC Role Management UI - Workspace & Admin Enhancements
 */

import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import type { Id } from '../../_generated/dataModel';

/**
 * Workspace member with their role assignments
 */
export interface WorkspaceMemberWithRoles {
	userId: Id<'users'>;
	userName: string | null;
	userEmail: string;
	roles: Array<{
		userRoleId: Id<'userRoles'>;
		roleId: Id<'roles'>;
		roleSlug: string;
		roleName: string;
		scope: 'system' | 'workspace' | 'circle';
		circleId?: Id<'circles'>;
		circleName?: string;
		assignedAt: number;
		expiresAt?: number;
	}>;
}

/**
 * Get all workspace members with their active role assignments (system + workspace-scoped)
 *
 * Returns members with their roles filtered to:
 * - Active roles only (not revoked, not expired)
 * - System roles (no workspaceId) OR workspace-scoped roles matching the workspace
 * - Includes circle-scoped roles if they belong to the workspace
 */
export const getWorkspaceMembersWithRoles = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces')
	},
	handler: async (ctx, args): Promise<WorkspaceMemberWithRoles[]> => {
		// 1. Validate session
		await validateSessionAndGetUserId(ctx, args.sessionId);

		// 2. Get workspace members
		const members = await ctx.db
			.query('workspaceMembers')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();

		// 3. For each member, get their roles (system + workspace-scoped)
		const result: WorkspaceMemberWithRoles[] = [];
		const now = Date.now();

		for (const member of members) {
			const user = await ctx.db.get(member.userId);
			if (!user) continue;

			// Get all user roles
			const userRoles = await ctx.db
				.query('userRoles')
				.withIndex('by_user', (q) => q.eq('userId', member.userId))
				.collect();

			// Filter active roles and enrich with details
			const roles: WorkspaceMemberWithRoles['roles'] = [];

			for (const ur of userRoles) {
				// Skip revoked roles
				if (ur.revokedAt) continue;

				// Skip expired roles
				if (ur.expiresAt && ur.expiresAt < now) continue;

				// Skip if workspace-scoped but different workspace
				if (ur.workspaceId && ur.workspaceId !== args.workspaceId) continue;

				// For circle-scoped roles, verify circle belongs to workspace
				let circle: { workspaceId: Id<'workspaces'>; name: string } | null = null;
				if (ur.circleId) {
					circle = await ctx.db.get(ur.circleId);
					if (!circle || circle.workspaceId !== args.workspaceId) continue;
				}

				// Get role details
				const role = await ctx.db.get(ur.roleId);
				if (!role) continue;

				// Determine scope type
				let scope: 'system' | 'workspace' | 'circle' = 'system';
				let circleName: string | undefined;

				if (ur.circleId && circle) {
					scope = 'circle';
					circleName = circle.name;
				} else if (ur.workspaceId) {
					scope = 'workspace';
				}

				roles.push({
					userRoleId: ur._id,
					roleId: role._id,
					roleSlug: role.slug,
					roleName: role.name,
					scope,
					circleId: ur.circleId,
					circleName,
					assignedAt: ur.assignedAt,
					expiresAt: ur.expiresAt
				});
			}

			result.push({
				userId: member.userId,
				userName: user.name ?? null,
				userEmail: user.email,
				roles
			});
		}

		return result;
	}
});

/**
 * Get roles that can be assigned (for dropdown)
 *
 * Returns all roles with basic information needed for assignment UI.
 */
export const getAssignableRoles = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);

		const roles = await ctx.db.query('roles').collect();

		return roles.map((role) => ({
			_id: role._id,
			slug: role.slug,
			name: role.name,
			description: role.description,
			isSystem: role.isSystem
		}));
	}
});

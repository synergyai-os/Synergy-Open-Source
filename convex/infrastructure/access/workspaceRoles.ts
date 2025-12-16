/**
 * Workspace Role Management Queries
 *
 * SYOS-855: Extracted from core/workspaces/roles.ts to infrastructure/access/
 *
 * Queries for managing RBAC roles at the workspace level.
 * Part of SYOS-649: RBAC Role Management UI - Workspace & Admin Enhancements
 */

import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../sessionValidation';
import type { Id } from '../../_generated/dataModel';

/**
 * Workspace member with their role assignments
 *
 * SYOS-862: Updated to use systemRoles + workspaceRoles instead of deprecated userRoles table
 */
export interface WorkspaceMemberWithRoles {
	userId: Id<'users'>;
	userName: string | null;
	userEmail: string;
	roles: Array<{
		userRoleId: Id<'systemRoles'> | Id<'workspaceRoles'>; // ID from systemRoles or workspaceRoles table (SYOS-862: migrated from userRoles)
		roleId: Id<'rbacRoles'>;
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

		// 2. Get workspace members (SYOS-814 Phase 2: Use people table)
		const people = await ctx.db
			.query('people')
			.withIndex('by_workspace_status', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('status', 'active')
			)
			.collect();

		// 3. For each member, get their roles (system + workspace-scoped)
		const result: WorkspaceMemberWithRoles[] = [];

		for (const person of people) {
			if (!person.userId) continue; // Skip invited-only people (no userId yet)

			const userId = person.userId; // TypeScript narrowing after null check
			const user = await ctx.db.get(userId);
			if (!user) continue;

			// Filter active roles and enrich with details
			const roles: WorkspaceMemberWithRoles['roles'] = [];

			// Get system roles (platform-level, no workspaceId)
			const systemRoles = await ctx.db
				.query('systemRoles')
				.withIndex('by_user', (q) => q.eq('userId', userId))
				.collect();

			for (const systemRole of systemRoles) {
				// Look up role details from roles table
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
						scope: 'system',
						assignedAt: systemRole.grantedAt,
						expiresAt: undefined // System roles don't expire
					});
				}
			}

			// Get workspace roles (workspace-scoped, uses personId)
			const workspaceRoles = await ctx.db
				.query('workspaceRoles')
				.withIndex('by_person', (q) => q.eq('personId', person._id))
				.filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
				.collect();

			for (const workspaceRole of workspaceRoles) {
				// Look up role details from roles table
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
						scope: 'workspace',
						assignedAt: workspaceRole.grantedAt,
						expiresAt: undefined // Workspace roles don't expire in new model
					});
				}
			}

			// Note: Circle-scoped roles are not supported in the new model yet
			// They would need to be added to workspaceRoles with circleId if needed

			result.push({
				userId: userId,
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

		const roles = await ctx.db.query('rbacRoles').collect();

		return roles.map((role) => ({
			_id: role._id,
			slug: role.slug,
			name: role.name,
			description: role.description,
			isSystem: role.isSystem
		}));
	}
});

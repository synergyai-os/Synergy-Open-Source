import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './auth';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';

/**
 * Circle Roles represent organizational accountabilities within circles
 * Examples: "Circle Lead", "Dev Lead", "Facilitator"
 *
 * NOTE: These are NOT RBAC permissions (access control), but organizational
 * roles that define who does what work. Action items are assigned to roles,
 * not people directly.
 */

async function ensureWorkspaceMembership(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		throw new Error('You do not have access to this workspace');
	}
}

async function ensureCircleExists(
	ctx: QueryCtx | MutationCtx,
	circleId: Id<'circles'>
): Promise<{ circleId: Id<'circles'>; workspaceId: Id<'workspaces'> }> {
	const circle = await ctx.db.get(circleId);
	if (!circle) {
		throw new Error('Circle not found');
	}
	return { circleId: circle._id, workspaceId: circle.workspaceId };
}

/**
 * List all roles in a circle
 */
export const listByCircle = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const { workspaceId } = await ensureCircleExists(ctx, args.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		const roles = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
			.collect();

		// Get filler count for each role
		const rolesWithFillers = await Promise.all(
			roles.map(async (role) => {
				const assignments = await ctx.db
					.query('userCircleRoles')
					.withIndex('by_role', (q) => q.eq('circleRoleId', role._id))
					.collect();

				return {
					roleId: role._id,
					circleId: role.circleId,
					name: role.name,
					purpose: role.purpose,
					fillerCount: assignments.length,
					createdAt: role.createdAt
				};
			})
		);

		return rolesWithFillers;
	}
});

/**
 * Get a single role by ID
 */
export const get = query({
	args: {
		sessionId: v.string(),
		roleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const role = await ctx.db.get(args.roleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		// Get circle name for context
		const circle = await ctx.db.get(role.circleId);
		if (!circle) {
			throw new Error('Circle not found');
		}

		// Get filler count
		const assignments = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_role', (q) => q.eq('circleRoleId', args.roleId))
			.collect();

		return {
			roleId: role._id,
			name: role.name,
			purpose: role.purpose,
			circleId: role.circleId,
			circleName: circle.name,
			workspaceId,
			fillerCount: assignments.length,
			createdAt: role.createdAt
		};
	}
});

/**
 * Get all roles assigned to a user
 */
export const getUserRoles = query({
	args: {
		sessionId: v.string(),
		userId: v.id('users'),
		circleId: v.optional(v.id('circles')) // Optional: filter by circle
	},
	handler: async (ctx, args) => {
		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		// Get user's role assignments
		const assignments = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.collect();

		// Get role details and verify access
		const roles = await Promise.all(
			assignments.map(async (assignment) => {
				const role = await ctx.db.get(assignment.circleRoleId);
				if (!role) return null;

				// If filtering by circle, skip roles from other circles
				if (args.circleId && role.circleId !== args.circleId) {
					return null;
				}

				const circle = await ctx.db.get(role.circleId);
				if (!circle) return null;

				// Verify acting user has access to this workspace
				try {
					await ensureWorkspaceMembership(ctx, circle.workspaceId, actingUserId);
				} catch {
					return null; // Skip roles the acting user can't access
				}

				return {
					roleId: role._id,
					roleName: role.name,
					rolePurpose: role.purpose,
					circleId: role.circleId,
					circleName: circle.name,
					workspaceId: circle.workspaceId,
					assignedAt: assignment.assignedAt
				};
			})
		);

		return roles.filter((role): role is NonNullable<typeof role> => role !== null);
	}
});

/**
 * Get all users who fill a specific role
 */
export const getRoleFillers = query({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		const assignments = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_role', (q) => q.eq('circleRoleId', args.circleRoleId))
			.collect();

		const fillers = await Promise.all(
			assignments.map(async (assignment) => {
				const user = await ctx.db.get(assignment.userId);
				if (!user) return null;

				const assignedByUser = await ctx.db.get(assignment.assignedBy);

				return {
					userId: assignment.userId,
					email: (user as unknown as { email?: string } | undefined)?.email ?? '',
					name: (user as unknown as { name?: string } | undefined)?.name ?? '',
					assignedAt: assignment.assignedAt,
					assignedBy: assignment.assignedBy,
					assignedByName:
						(assignedByUser as unknown as { name?: string } | undefined)?.name ?? 'Unknown'
				};
			})
		);

		return fillers.filter((filler): filler is NonNullable<typeof filler> => filler !== null);
	}
});

/**
 * Create a new role in a circle
 */
export const create = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		name: v.string(),
		purpose: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const { workspaceId } = await ensureCircleExists(ctx, args.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		const trimmedName = args.name.trim();
		if (!trimmedName) {
			throw new Error('Role name is required');
		}

		// Check for duplicate role name in circle
		const existingRole = await ctx.db
			.query('circleRoles')
			.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
			.collect();

		if (existingRole.some((role) => role.name.toLowerCase() === trimmedName.toLowerCase())) {
			throw new Error('A role with this name already exists in this circle');
		}

		const roleId = await ctx.db.insert('circleRoles', {
			circleId: args.circleId,
			name: trimmedName,
			purpose: args.purpose,
			createdAt: Date.now()
		});

		return { roleId };
	}
});

/**
 * Update a role
 */
export const update = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		name: v.optional(v.string()),
		purpose: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		const updates: { name?: string; purpose?: string } = {};

		if (args.name !== undefined) {
			const trimmedName = args.name.trim();
			if (!trimmedName) {
				throw new Error('Role name cannot be empty');
			}

			// Check for duplicate role name in circle (excluding current role)
			const existingRoles = await ctx.db
				.query('circleRoles')
				.withIndex('by_circle', (q) => q.eq('circleId', role.circleId))
				.collect();

			const duplicate = existingRoles.find(
				(r) => r._id !== args.circleRoleId && r.name.toLowerCase() === trimmedName.toLowerCase()
			);

			if (duplicate) {
				throw new Error('A role with this name already exists in this circle');
			}

			updates.name = trimmedName;
		}

		if (args.purpose !== undefined) {
			updates.purpose = args.purpose;
		}

		await ctx.db.patch(args.circleRoleId, updates);

		return { success: true };
	}
});

/**
 * Delete a role (and remove all user assignments)
 */
export const deleteRole = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, userId);

		// Remove all user assignments first
		const assignments = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_role', (q) => q.eq('circleRoleId', args.circleRoleId))
			.collect();

		for (const assignment of assignments) {
			await ctx.db.delete(assignment._id);
		}

		// Delete the role
		await ctx.db.delete(args.circleRoleId);

		return { success: true };
	}
});

/**
 * Assign a user to a role
 */
export const assignUser = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const actingUserId = await getAuthUserId(ctx, args.sessionId);
		if (!actingUserId) {
			throw new Error('Not authenticated');
		}

		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);

		// Verify acting user has access
		await ensureWorkspaceMembership(ctx, workspaceId, actingUserId);

		// Verify target user has access
		await ensureWorkspaceMembership(ctx, workspaceId, args.userId);

		// Check if already assigned
		const existingAssignment = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_user_role', (q) =>
				q.eq('userId', args.userId).eq('circleRoleId', args.circleRoleId)
			)
			.first();

		if (existingAssignment) {
			throw new Error('User is already assigned to this role');
		}

		await ctx.db.insert('userCircleRoles', {
			userId: args.userId,
			circleRoleId: args.circleRoleId,
			assignedAt: Date.now(),
			assignedBy: actingUserId
		});

		return { success: true };
	}
});

/**
 * Remove a user from a role
 */
export const removeUser = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const actingUserId = await getAuthUserId(ctx, args.sessionId);
		if (!actingUserId) {
			throw new Error('Not authenticated');
		}

		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw new Error('Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, actingUserId);

		// Find assignment
		const assignment = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_user_role', (q) =>
				q.eq('userId', args.userId).eq('circleRoleId', args.circleRoleId)
			)
			.first();

		if (!assignment) {
			throw new Error('User is not assigned to this role');
		}

		await ctx.db.delete(assignment._id);

		return { success: true };
	}
});

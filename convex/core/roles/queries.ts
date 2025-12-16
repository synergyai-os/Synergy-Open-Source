/**
 * Roles queries - read operations
 *
 * All query handlers for role operations.
 * Consolidated from fragmented query files per architecture.md domain structure.
 */

import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import {
	ensureCircleExists,
	ensureWorkspaceMembership,
	requireWorkspacePersonFromSession
} from './roleAccess';
import { getPersonById } from '../people/queries';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * List roles by circle with filler information
 */
async function listRolesByCircle(
	ctx: QueryCtx,
	args: { sessionId: string; circleId: Id<'circles'>; includeArchived?: boolean }
): Promise<Doc<'circleRoles'>[]> {
	const { workspaceId } = await ensureCircleExists(ctx, args.circleId);
	const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
	await ensureWorkspaceMembership(ctx, workspaceId, personId);

	const roles = args.includeArchived
		? await ctx.db
				.query('circleRoles')
				.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
				.collect()
		: await ctx.db
				.query('circleRoles')
				.withIndex('by_circle_archived', (q) =>
					q.eq('circleId', args.circleId).eq('archivedAt', undefined)
				)
				.collect();

	const rolesWithFillers = await Promise.all(
		roles.map(async (role) => {
			const assignments = args.includeArchived
				? await ctx.db
						.query('assignments')
						.withIndex('by_role', (q) => q.eq('roleId', role._id))
						.collect()
				: await ctx.db
						.query('assignments')
						.withIndex('by_role', (q) => q.eq('roleId', role._id))
						.filter((q) => q.eq(q.field('status'), 'active'))
						.collect();

			const scopes = assignments
				.map((assignment) => assignment.scope)
				.filter((scope): scope is string => scope !== undefined && scope !== null && scope !== '');

			const scope = scopes.length > 0 ? scopes[0] : undefined;

			return {
				roleId: role._id,
				circleId: role.circleId,
				name: role.name,
				purpose: role.purpose,
				scope,
				fillerCount: assignments.length,
				createdAt: role.createdAt
			};
		})
	);

	return rolesWithFillers;
}

/**
 * List roles by workspace with filler information
 */
async function listRolesByWorkspace(
	ctx: QueryCtx,
	args: { sessionId: string; workspaceId: Id<'workspaces'>; includeArchived?: boolean }
) {
	const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, args.workspaceId);
	await ensureWorkspaceMembership(ctx, args.workspaceId, personId);

	const circles = await ctx.db
		.query('circles')
		.withIndex('by_workspace_archived', (q) =>
			q.eq('workspaceId', args.workspaceId).eq('archivedAt', undefined)
		)
		.collect();

	if (circles.length === 0) {
		return [];
	}

	const circleIds = circles.map((c) => c._id);

	const rolesByCirclePromises = circleIds.map(async (circleId) => {
		const roles = args.includeArchived
			? await ctx.db
					.query('circleRoles')
					.withIndex('by_circle', (q) => q.eq('circleId', circleId))
					.collect()
			: await ctx.db
					.query('circleRoles')
					.withIndex('by_circle_archived', (q) =>
						q.eq('circleId', circleId).eq('archivedAt', undefined)
					)
					.collect();
		return { circleId, roles };
	});

	const rolesByCircleData = await Promise.all(rolesByCirclePromises);

	const allRoleIds = new Set<Id<'circleRoles'>>();
	for (const { roles } of rolesByCircleData) {
		for (const role of roles) {
			allRoleIds.add(role._id);
		}
	}

	const assignmentPromises = Array.from(allRoleIds).map(async (roleId) => {
		const assignments = args.includeArchived
			? await ctx.db
					.query('assignments')
					.withIndex('by_role', (q) => q.eq('roleId', roleId))
					.collect()
			: await ctx.db
					.query('assignments')
					.withIndex('by_role', (q) => q.eq('roleId', roleId))
					.filter((q) => q.eq(q.field('status'), 'active'))
					.collect();
		return { roleId, assignments };
	});

	const assignmentsByRoleData = await Promise.all(assignmentPromises);

	const assignmentsByRole = new Map<
		Id<'circleRoles'>,
		(typeof assignmentsByRoleData)[0]['assignments']
	>();
	for (const { roleId, assignments } of assignmentsByRoleData) {
		assignmentsByRole.set(roleId, assignments);
	}

	const result: Array<{
		circleId: Id<'circles'>;
		roles: Array<{
			roleId: Id<'circleRoles'>;
			circleId: Id<'circles'>;
			name: string;
			purpose?: string;
			templateId?: Id<'roleTemplates'>;
			scope?: string;
			status: 'draft' | 'active';
			isHiring: boolean;
			fillerCount: number;
			createdAt: number;
		}>;
	}> = [];

	for (const { circleId, roles } of rolesByCircleData) {
		const rolesWithData = roles.map((role) => {
			const assignments = assignmentsByRole.get(role._id) ?? [];
			const scopes = assignments
				.map((a) => a.scope)
				.filter((scope): scope is string => scope !== undefined && scope !== null && scope !== '');

			return {
				roleId: role._id,
				circleId: role.circleId,
				name: role.name,
				purpose: role.purpose,
				templateId: role.templateId,
				scope: scopes.length > 0 ? scopes[0] : undefined,
				status: role.status,
				isHiring: role.isHiring,
				fillerCount: assignments.length,
				createdAt: role.createdAt
			};
		});

		if (rolesWithData.length > 0) {
			result.push({ circleId, roles: rolesWithData });
		}
	}

	return result;
}

/**
 * Get role details with circle and assignment information
 */
async function getRoleDetails(
	ctx: QueryCtx,
	args: { sessionId: string; roleId: Id<'circleRoles'> }
) {
	const role = await ctx.db.get(args.roleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
	await ensureWorkspaceMembership(ctx, workspaceId, personId);

	const circle = await ctx.db.get(role.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	const assignments = await ctx.db
		.query('assignments')
		.withIndex('by_role', (q) => q.eq('roleId', args.roleId))
		.filter((q) => q.eq(q.field('status'), 'active'))
		.collect();

	let isLeadRoleFlag = false;
	if (role.templateId) {
		const template = await ctx.db.get(role.templateId);
		isLeadRoleFlag = template?.roleType === 'circle_lead';
	}

	return {
		roleId: role._id,
		name: role.name,
		purpose: role.purpose,
		circleId: role.circleId,
		circleName: circle.name,
		workspaceId,
		fillerCount: assignments.length,
		createdAt: role.createdAt,
		templateId: role.templateId,
		isLeadRole: isLeadRoleFlag,
		representsToParent: role.representsToParent ?? false
	};
}

/**
 * List user roles across circles
 */
async function listUserRoles(
	ctx: QueryCtx,
	args: {
		sessionId: string;
		targetPersonId: Id<'people'>;
		circleId?: Id<'circles'>;
		includeArchived?: boolean;
	}
) {
	// Cache actor person per workspace to avoid repeated lookups
	const actorByWorkspace = new Map<Id<'workspaces'>, Id<'people'>>();
	const assignments = args.includeArchived
		? await ctx.db
				.query('assignments')
				.withIndex('by_person', (q) => q.eq('personId', args.targetPersonId))
				.collect()
		: await ctx.db
				.query('assignments')
				.withIndex('by_person', (q) => q.eq('personId', args.targetPersonId))
				.filter((q) => q.eq(q.field('status'), 'active'))
				.collect();

	const roles = await Promise.all(
		assignments.map(async (assignment) => {
			const role = await ctx.db.get(assignment.roleId);
			if (!role) return null;

			if (args.circleId && role.circleId !== args.circleId) {
				return null;
			}

			const circle = await ctx.db.get(role.circleId);
			if (!circle) return null;

			try {
				let actorPersonId = actorByWorkspace.get(circle.workspaceId);
				if (!actorPersonId) {
					actorPersonId = await requireWorkspacePersonFromSession(
						ctx,
						args.sessionId,
						circle.workspaceId
					);
					actorByWorkspace.set(circle.workspaceId, actorPersonId);
				}
				await ensureWorkspaceMembership(ctx, circle.workspaceId, actorPersonId);
			} catch {
				return null;
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

/**
 * List role fillers (people assigned to a role)
 */
async function listRoleFillers(
	ctx: QueryCtx,
	args: { sessionId: string; circleRoleId: Id<'circleRoles'>; includeArchived?: boolean }
) {
	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
	await ensureWorkspaceMembership(ctx, workspaceId, personId);

	const assignments = args.includeArchived
		? await ctx.db
				.query('assignments')
				.withIndex('by_role', (q) => q.eq('roleId', args.circleRoleId))
				.collect()
		: await ctx.db
				.query('assignments')
				.withIndex('by_role', (q) => q.eq('roleId', args.circleRoleId))
				.filter((q) => q.eq(q.field('status'), 'active'))
				.collect();

	const fillers = await Promise.all(
		assignments.map(async (assignment) => {
			const person = await getPersonById(ctx, assignment.personId);
			const assignedByPerson = assignment.assignedByPersonId
				? await ctx.db.get(assignment.assignedByPersonId)
				: null;

			return {
				personId: assignment.personId,
				email: person.email ?? '',
				displayName: person.displayName,
				assignedAt: assignment.assignedAt,
				assignedByPersonId: assignment.assignedByPersonId,
				assignedByDisplayName:
					(assignedByPerson &&
						typeof assignedByPerson === 'object' &&
						'displayName' in assignedByPerson &&
						(assignedByPerson as { displayName?: string }).displayName) ||
					undefined
			};
		})
	);

	return fillers;
}

/**
 * List circle members who don't have any roles assigned
 */
export async function listMembersWithoutRoles(
	ctx: QueryCtx,
	args: { sessionId: string; circleId: Id<'circles'>; includeArchived?: boolean }
) {
	const circle = await ctx.db.get(args.circleId);
	if (!circle) return [];

	const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, circle.workspaceId);
	await ensureWorkspaceMembership(ctx, circle.workspaceId, personId);

	const roles = args.includeArchived
		? await ctx.db
				.query('circleRoles')
				.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
				.collect()
		: await ctx.db
				.query('circleRoles')
				.withIndex('by_circle_archived', (q) =>
					q.eq('circleId', args.circleId).eq('archivedAt', undefined)
				)
				.collect();

	const roleIds = roles.map((r) => r._id);

	const memberships = args.includeArchived
		? await ctx.db
				.query('circleMembers')
				.withIndex('by_circle', (q) => q.eq('circleId', args.circleId))
				.collect()
		: await ctx.db
				.query('circleMembers')
				.withIndex('by_circle_archived', (q) =>
					q.eq('circleId', args.circleId).eq('archivedAt', undefined)
				)
				.collect();

	// If no roles exist, return all members with user fields when available.
	if (roleIds.length === 0) {
		const members = await Promise.all(
			memberships.map(async (membership) => {
				const person = await getPersonById(ctx, membership.personId);
				return {
					personId: membership.personId,
					email: person.email ?? '',
					displayName: person.displayName,
					joinedAt: membership.joinedAt
				};
			})
		);
		return members;
	}

	const allAssignments = await Promise.all(
		roleIds.map(async (roleId) => {
			const assignments = args.includeArchived
				? await ctx.db
						.query('assignments')
						.withIndex('by_role', (q) => q.eq('roleId', roleId))
						.collect()
				: await ctx.db
						.query('assignments')
						.withIndex('by_role', (q) => q.eq('roleId', roleId))
						.filter((q) => q.eq(q.field('status'), 'active'))
						.collect();
			return assignments;
		})
	);

	const personIdsWithRoles = new Set<Id<'people'>>();
	for (const assignments of allAssignments) {
		for (const assignment of assignments) {
			personIdsWithRoles.add(assignment.personId);
		}
	}

	const membersWithoutRoles = memberships.filter(
		(membership) => !personIdsWithRoles.has(membership.personId)
	);

	const members = await Promise.all(
		membersWithoutRoles.map(async (membership) => {
			const person = await getPersonById(ctx, membership.personId);
			return {
				personId: membership.personId,
				email: person.email ?? '',
				displayName: person.displayName,
				joinedAt: membership.joinedAt
			};
		})
	);

	return members;
}

// ============================================================================
// Query Handlers
// ============================================================================

export const listByCircle = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args): Promise<Doc<'circleRoles'>[]> => {
		const roles = await listRolesByCircle(ctx, args);
		return roles ?? [];
	}
});

export const listByWorkspace = query({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args): Promise<Doc<'circleRoles'>[]> => {
		const roles = await listRolesByWorkspace(ctx, args);
		return roles ?? [];
	}
});

export const get = query({
	args: {
		sessionId: v.string(),
		roleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => getRoleDetails(ctx, args)
});

export const getUserRoles = query({
	args: {
		sessionId: v.string(),
		targetPersonId: v.id('people'),
		circleId: v.optional(v.id('circles')),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => listUserRoles(ctx, args)
});

export const getRoleFillers = query({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => listRoleFillers(ctx, args)
});

export const getMembersWithoutRoles = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => listMembersWithoutRoles(ctx, args)
});

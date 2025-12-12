import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from './roleAccess';

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
					.query('userCircleRoles')
					.withIndex('by_role', (q) => q.eq('circleRoleId', roleId))
					.collect()
			: await ctx.db
					.query('userCircleRoles')
					.withIndex('by_role_archived', (q) =>
						q.eq('circleRoleId', roleId).eq('archivedAt', undefined)
					)
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

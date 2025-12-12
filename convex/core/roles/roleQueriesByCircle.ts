import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import {
	ensureCircleExists,
	ensureWorkspaceMembership,
	requireWorkspacePersonFromSession
} from './roleAccess';

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
						.query('userCircleRoles')
						.withIndex('by_role', (q) => q.eq('circleRoleId', role._id))
						.collect()
				: await ctx.db
						.query('userCircleRoles')
						.withIndex('by_role_archived', (q) =>
							q.eq('circleRoleId', role._id).eq('archivedAt', undefined)
						)
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

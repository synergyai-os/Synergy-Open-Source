import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { validateSessionAndGetUserId } from '../../sessionValidation';
import { ensureWorkspaceMembership } from './roleAccess';

async function listUserRoles(
	ctx: QueryCtx,
	args: {
		sessionId: string;
		userId: Id<'users'>;
		circleId?: Id<'circles'>;
		includeArchived?: boolean;
	}
) {
	const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const assignments = args.includeArchived
		? await ctx.db
				.query('userCircleRoles')
				.withIndex('by_user', (q) => q.eq('userId', args.userId))
				.collect()
		: await ctx.db
				.query('userCircleRoles')
				.withIndex('by_user_archived', (q) =>
					q.eq('userId', args.userId).eq('archivedAt', undefined)
				)
				.collect();

	const roles = await Promise.all(
		assignments.map(async (assignment) => {
			const role = await ctx.db.get(assignment.circleRoleId);
			if (!role) return null;

			if (args.circleId && role.circleId !== args.circleId) {
				return null;
			}

			const circle = await ctx.db.get(role.circleId);
			if (!circle) return null;

			try {
				await ensureWorkspaceMembership(ctx, circle.workspaceId, actingUserId);
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

export const getUserRoles = query({
	args: {
		sessionId: v.string(),
		userId: v.id('users'),
		circleId: v.optional(v.id('circles')),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => listUserRoles(ctx, args)
});

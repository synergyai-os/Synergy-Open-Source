import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { validateSessionAndGetUserId } from '../../sessionValidation';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { ensureCircleExists, ensureWorkspaceMembership } from './roleAccess';

async function listRoleFillers(
	ctx: QueryCtx,
	args: { sessionId: string; circleRoleId: Id<'circleRoles'>; includeArchived?: boolean }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	await ensureWorkspaceMembership(ctx, workspaceId, userId);

	const assignments = args.includeArchived
		? await ctx.db
				.query('userCircleRoles')
				.withIndex('by_role', (q) => q.eq('circleRoleId', args.circleRoleId))
				.collect()
		: await ctx.db
				.query('userCircleRoles')
				.withIndex('by_role_archived', (q) =>
					q.eq('circleRoleId', args.circleRoleId).eq('archivedAt', undefined)
				)
				.collect();

	const fillers = await Promise.all(
		assignments.map(async (assignment) => {
			const user = await ctx.db.get(assignment.userId);

			const assignedByUser = await ctx.db.get(assignment.assignedBy);

			return {
				userId: assignment.userId,
				email:
					(user && typeof user === 'object' && 'email' in user
						? (user as { email?: string }).email
						: '') ?? '',
				name:
					(user && typeof user === 'object' && 'name' in user
						? (user as { name?: string }).name
						: '') ?? '',
				assignedAt: assignment.assignedAt,
				assignedBy: assignment.assignedBy,
				assignedByName:
					(assignedByUser &&
						typeof assignedByUser === 'object' &&
						'name' in assignedByUser &&
						(assignedByUser as { name?: string }).name) ??
					'Unknown'
			};
		})
	);

	return fillers;
}

export const getRoleFillers = query({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => listRoleFillers(ctx, args)
});

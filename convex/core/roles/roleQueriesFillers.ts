import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import {
	ensureCircleExists,
	ensureWorkspaceMembership,
	requireWorkspacePersonFromSession
} from './roleAccess';
import { getPersonById } from '../people/queries';

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

export const getRoleFillers = query({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => listRoleFillers(ctx, args)
});

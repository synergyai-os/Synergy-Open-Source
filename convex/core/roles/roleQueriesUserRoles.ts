import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from './roleAccess';

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

export const getUserRoles = query({
	args: {
		sessionId: v.string(),
		targetPersonId: v.id('people'),
		circleId: v.optional(v.id('circles')),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => listUserRoles(ctx, args)
});

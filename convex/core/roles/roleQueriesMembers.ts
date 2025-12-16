import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from './roleAccess';
import { getPersonById } from '../people/queries';

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

export const getMembersWithoutRoles = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		includeArchived: v.optional(v.boolean())
	},
	handler: async (ctx, args) => listMembersWithoutRoles(ctx, args)
});

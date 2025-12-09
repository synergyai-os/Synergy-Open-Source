import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { validateSessionAndGetUserId } from '../../sessionValidation';
import { ensureWorkspaceMembership } from './roleAccess';

type UserLike = { email?: string; name?: string } | null | undefined;

function toUserFields(user: UserLike) {
	return {
		email: (user && user.email) ?? '',
		name: (user && user.name) ?? ''
	};
}

export async function listMembersWithoutRoles(
	ctx: QueryCtx,
	args: { sessionId: string; circleId: Id<'circles'>; includeArchived?: boolean }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const circle = await ctx.db.get(args.circleId);
	if (!circle) return [];

	await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

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
				const user = await ctx.db.get(membership.userId);
				const { email, name } = toUserFields(user as UserLike);
				return {
					userId: membership.userId,
					email,
					name,
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
						.query('userCircleRoles')
						.withIndex('by_role', (q) => q.eq('circleRoleId', roleId))
						.collect()
				: await ctx.db
						.query('userCircleRoles')
						.withIndex('by_role_archived', (q) =>
							q.eq('circleRoleId', roleId).eq('archivedAt', undefined)
						)
						.collect();
			return assignments;
		})
	);

	const userIdsWithRoles = new Set<Id<'users'>>();
	for (const assignments of allAssignments) {
		for (const assignment of assignments) {
			userIdsWithRoles.add(assignment.userId);
		}
	}

	const membersWithoutRoles = memberships.filter(
		(membership) => !userIdsWithRoles.has(membership.userId)
	);

	const members = await Promise.all(
		membersWithoutRoles.map(async (membership) => {
			const user = await ctx.db.get(membership.userId);
			const { email, name } = toUserFields(user as UserLike);
			return {
				userId: membership.userId,
				email,
				name,
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

import type { QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';

export type OrgLink = {
	workspaceId: Id<'workspaces'>;
	role: 'owner' | 'admin' | 'member';
	joinedAt: number;
};

export async function listOrgLinksForUser(ctx: QueryCtx, userId: Id<'users'>): Promise<OrgLink[]> {
	const memberships = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();

	return memberships.map(({ workspaceId, role, joinedAt }) => ({
		workspaceId,
		role,
		joinedAt
	}));
}

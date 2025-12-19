import { v } from 'convex/values';
import { query } from '../../_generated/server';
import type { QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { requireSessionUserId, linkExists } from './rules';
import { listWorkspacesForUser, findPersonByUserAndWorkspace } from '../people/queries';

export const getUserById = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		const userId = await requireSessionUserId(ctx, args.sessionId);
		return await ctx.db.get(userId);
	}
});

export const getUserByWorkosId = query({
	args: { sessionId: v.string(), workosId: v.string() },
	handler: async (ctx, args) => {
		await requireSessionUserId(ctx, args.sessionId);
		return await ctx.db
			.query('users')
			.withIndex('by_workos_id', (q) => q.eq('workosId', args.workosId))
			.first();
	}
});

export const getCurrentUser = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		const userId = await requireSessionUserId(ctx, args.sessionId);
		return await ctx.db.get(userId);
	}
});

export const validateAccountLink = query({
	args: {
		sessionId: v.string(),
		targetUserId: v.id('users')
	},
	handler: async (ctx, args) => {
		const userId = await requireSessionUserId(ctx, args.sessionId);
		const exists = await linkExists(ctx, userId, args.targetUserId);
		return { linked: exists };
	}
});

export const listLinkedAccounts = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		const userId = await requireSessionUserId(ctx, args.sessionId);
		return await listLinked(ctx, userId);
	}
});

// ============================================================================
// Organization Links Query Helper
// ============================================================================

export type OrgLink = {
	workspaceId: Id<'workspaces'>;
	role: 'owner' | 'admin' | 'member';
	joinedAt: number;
};

// SYOS-814 Phase 3: Migrated to use people table
export async function listOrgLinksForUser(ctx: QueryCtx, userId: Id<'users'>): Promise<OrgLink[]> {
	const workspaceIds = await listWorkspacesForUser(ctx, userId);

	const links = await Promise.all(
		workspaceIds.map(async (workspaceId) => {
			const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId);
			if (!person || person.status !== 'active') return null;

			return {
				workspaceId,
				role: person.workspaceRole,
				joinedAt: person.joinedAt ?? person.invitedAt ?? person.createdAt
			};
		})
	);

	return links.filter((link): link is OrgLink => link !== null);
}

// ============================================================================
// Internal Helpers
// ============================================================================

async function listLinked(ctx: QueryCtx, userId: Id<'users'>) {
	const links = await ctx.db
		.query('accountLinks')
		.withIndex('by_primary', (q) => q.eq('primaryUserId', userId))
		.collect();

	const results: {
		userId: Id<'users'>;
		email: string | null;
		name: string | null;
		firstName: string | null;
		lastName: string | null;
		linkType: string | null;
		verifiedAt: number;
	}[] = [];

	for (const link of links) {
		const user = await ctx.db.get(link.linkedUserId);
		if (!user) continue;

		results.push({
			userId: link.linkedUserId,
			email: user.email ?? null,
			name: user.name ?? null,
			firstName: user.firstName ?? null,
			lastName: user.lastName ?? null,
			linkType: link.linkType ?? null,
			verifiedAt: link.verifiedAt
		});
	}

	return results;
}

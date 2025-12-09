import { query } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import type { Doc, Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import {
	findWorkspaceMembership,
	listUserWorkspaceMemberships,
	listWorkspaceMemberships
} from './access';
import { calculateInitialsFromName } from './slug';

type WorkspaceSummary = {
	workspaceId: Id<'workspaces'>;
	name: string;
	initials: string;
	slug: string;
	plan: string;
	createdAt: number;
	updatedAt: number;
	role: string;
	joinedAt: number;
	memberCount: number;
};

export const findBySlug = query({
	args: {
		slug: v.string(),
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const workspace = await findWorkspaceBySlug(ctx, args.slug);
		if (!workspace) return null;

		const membership = await findWorkspaceMembership(ctx, workspace._id, userId);
		if (!membership) return null;

		return getWorkspaceSummary(ctx, workspace, membership);
	}
});

export const findById = query({
	args: {
		workspaceId: v.id('workspaces'),
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const workspace = await ctx.db.get(args.workspaceId);
		if (!workspace) return null;

		const membership = await findWorkspaceMembership(ctx, workspace._id, userId);
		if (!membership) return null;

		return getWorkspaceSummary(ctx, workspace, membership);
	}
});

async function listWorkspaceSummaries(ctx: QueryCtx, userId: Id<'users'>) {
	const memberships = await listUserWorkspaceMemberships(ctx, userId);

	const summaries = await Promise.all(
		memberships.map((membership) => getWorkspaceSummaryForMembership(ctx, membership))
	);

	return summaries.filter((summary): summary is WorkspaceSummary => summary !== undefined);
}

async function getWorkspaceSummaryForMembership(
	ctx: QueryCtx,
	membership: Doc<'workspaceMembers'>
): Promise<WorkspaceSummary | undefined> {
	const workspace = await ctx.db.get(membership.workspaceId);
	if (!workspace) return undefined;

	return getWorkspaceSummary(ctx, workspace, membership);
}

async function getWorkspaceSummary(
	ctx: QueryCtx,
	workspace: Doc<'workspaces'>,
	membership: Doc<'workspaceMembers'>
): Promise<WorkspaceSummary> {
	const memberCount = await listWorkspaceMemberships(ctx, workspace._id);

	return {
		workspaceId: workspace._id,
		name: workspace.name,
		initials: calculateInitialsFromName(workspace.name),
		slug: workspace.slug,
		plan: workspace.plan,
		createdAt: workspace.createdAt,
		updatedAt: workspace.updatedAt,
		role: membership.role,
		joinedAt: membership.joinedAt,
		memberCount: memberCount.length
	};
}

async function findWorkspaceBySlug(ctx: QueryCtx, slug: string) {
	return ctx.db
		.query('workspaces')
		.withIndex('by_slug', (q) => q.eq('slug', slug))
		.first();
}

export const listWorkspaces = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args): Promise<WorkspaceSummary[]> => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const summaries = await listWorkspaceSummaries(ctx, userId);
		return summaries ?? [];
	}
});

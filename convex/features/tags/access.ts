import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';

type WorkspaceId = Id<'workspaces'>;
type CircleId = Id<'circles'>;

export async function ensureWorkspaceMembership(
	ctx: MutationCtx,
	userId: Id<'users'>,
	workspaceId: WorkspaceId
): Promise<void> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();
	if (!membership) {
		throw createError(
			ErrorCodes.WORKSPACE_ACCESS_DENIED,
			'You do not have access to this workspace'
		);
	}
}

export async function ensureUserWorkspace(
	ctx: MutationCtx,
	userId: Id<'users'>
): Promise<WorkspaceId> {
	const memberships = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect();
	if (memberships.length === 0) {
		throw createError(
			ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
			'User must belong to at least one workspace'
		);
	}
	return memberships[0].workspaceId;
}

export async function ensureOwnershipContext(
	ctx: MutationCtx,
	userId: Id<'users'>,
	ownership: 'user' | 'workspace' | 'circle',
	workspaceId?: WorkspaceId,
	circleId?: CircleId
): Promise<{
	ownership: 'user' | 'workspace' | 'circle';
	workspaceId?: WorkspaceId;
	circleId?: CircleId;
}> {
	if (ownership === 'workspace') {
		const resolvedWorkspaceId = workspaceId ?? (await ensureUserWorkspace(ctx, userId));
		if (workspaceId) await ensureWorkspaceMembership(ctx, userId, workspaceId);
		return { ownership, workspaceId: resolvedWorkspaceId };
	}

	if (ownership === 'circle') {
		if (!circleId) {
			throw createError(ErrorCodes.TAG_CIRCLE_REQUIRED, 'circleId is required for circle tags');
		}
		const circleMembership = await ctx.db
			.query('circleMembers')
			.withIndex('by_circle_user', (q) => q.eq('circleId', circleId).eq('userId', userId))
			.first();
		if (!circleMembership) {
			throw createError(
				ErrorCodes.AUTHZ_NOT_CIRCLE_MEMBER,
				'You do not have access to this circle'
			);
		}
		const circle = await ctx.db.get(circleId);
		if (!circle) throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		return { ownership, workspaceId: circle.workspaceId, circleId };
	}

	const resolvedWorkspaceId = await ensureUserWorkspace(ctx, userId);
	return { ownership: 'user', workspaceId: resolvedWorkspaceId };
}

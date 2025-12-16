import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { createError, ErrorCodes } from '../errors/codes';

type WithCircleAccessInput = {
	sessionId: string;
	circleId: Id<'circles'>;
};

type WithCircleAccessOptions = {
	allowArchivedCircle?: boolean;
	requireWorkspaceMembership?: boolean;
};

type WithCircleAccessDeps = {
	validateSessionAndGetUserId: typeof validateSessionAndGetUserId;
	getCircle: (
		ctx: QueryCtx | MutationCtx,
		circleId: Id<'circles'>
	) => Promise<Doc<'circles'> | null>;
	isWorkspaceMember: (
		ctx: QueryCtx | MutationCtx,
		workspaceId: Id<'workspaces'>,
		userId: Id<'users'>
	) => Promise<boolean>;
};

const defaultDeps: WithCircleAccessDeps = {
	validateSessionAndGetUserId,
	getCircle: (ctx, circleId) => ctx.db.get(circleId),
	isWorkspaceMember: async (ctx, workspaceId, userId) => {
		const person = await ctx.db
			.query('people')
			.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
			.first();
		return Boolean(person && person.status === 'active');
	}
};

/**
 * withCircleAccess
 *
 * Composes session validation + circle lookup + workspace access check.
 * Returns handler result with validated userId and circle context.
 */
export async function withCircleAccess<T>(
	ctx: QueryCtx | MutationCtx,
	args: WithCircleAccessInput,
	handler: (input: { userId: Id<'users'>; circle: Doc<'circles'> }) => Promise<T>,
	options: WithCircleAccessOptions = {},
	deps: WithCircleAccessDeps = defaultDeps
): Promise<T> {
	const { userId } = await deps.validateSessionAndGetUserId(ctx, args.sessionId);

	const circle = await deps.getCircle(ctx, args.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	if (!options.allowArchivedCircle && circle.archivedAt) {
		throw createError(ErrorCodes.CIRCLE_ARCHIVED, 'Circle is archived');
	}

	if (options.requireWorkspaceMembership !== false) {
		const isMember = await deps.isWorkspaceMember(ctx, circle.workspaceId, userId);
		if (!isMember) {
			throw createError(
				ErrorCodes.WORKSPACE_ACCESS_DENIED,
				'You do not have access to this workspace'
			);
		}
	}

	return handler({ userId, circle });
}

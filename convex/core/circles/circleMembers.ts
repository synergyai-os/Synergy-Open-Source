import { validateSessionAndGetUserId } from '../../sessionValidation';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { ensureWorkspaceMembership } from './circleAccess';
import { requireCircle } from './rules';

export async function getCircleMembers(
	ctx: QueryCtx,
	args: {
		sessionId: string;
		circleId: Id<'circles'>;
		includeArchived?: boolean;
	}
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const circle = await requireCircle(ctx, args.circleId);

	await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

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

	const members = await Promise.all(
		memberships.map(async (membership) => {
			const user = await ctx.db.get(membership.userId);
			if (!user) return null;

			return {
				userId: membership.userId,
				email: (user as unknown as { email?: string } | undefined)?.email ?? '',
				name: (user as unknown as { name?: string } | undefined)?.name ?? '',
				joinedAt: membership.joinedAt
			};
		})
	);

	return members.filter((member): member is NonNullable<typeof member> => member !== null);
}

export async function addCircleMember(
	ctx: MutationCtx,
	args: { sessionId: string; circleId: Id<'circles'>; targetUserId: Id<'users'> }
) {
	const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const circle = await requireCircle(ctx, args.circleId);

	await ensureWorkspaceMembership(ctx, circle.workspaceId, actingUserId);
	await ensureWorkspaceMembership(ctx, circle.workspaceId, args.targetUserId);
	await ensureCircleMembership(
		ctx,
		args.circleId,
		actingUserId,
		ErrorCodes.AUTHZ_NOT_CIRCLE_MEMBER
	);

	const existingMembership = await ctx.db
		.query('circleMembers')
		.withIndex('by_circle_user', (q) =>
			q.eq('circleId', args.circleId).eq('userId', args.targetUserId)
		)
		.first();

	if (existingMembership) {
		throw createError(ErrorCodes.CIRCLE_MEMBER_EXISTS, 'User is already a member of this circle');
	}

	await ctx.db.insert('circleMembers', {
		circleId: args.circleId,
		userId: args.targetUserId,
		joinedAt: Date.now()
	});

	return { success: true };
}

export async function removeCircleMember(
	ctx: MutationCtx,
	args: { sessionId: string; circleId: Id<'circles'>; targetUserId: Id<'users'> }
) {
	const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);
	const circle = await requireCircle(ctx, args.circleId);

	await ensureWorkspaceMembership(ctx, circle.workspaceId, actingUserId);
	await ensureCircleMembership(
		ctx,
		args.circleId,
		actingUserId,
		ErrorCodes.AUTHZ_NOT_CIRCLE_MEMBER
	);

	const membership = await ctx.db
		.query('circleMembers')
		.withIndex('by_circle_user', (q) =>
			q.eq('circleId', args.circleId).eq('userId', args.targetUserId)
		)
		.first();

	if (!membership) {
		throw createError(ErrorCodes.CIRCLE_MEMBER_NOT_FOUND, 'User is not a member of this circle');
	}

	await ctx.db.delete(membership._id);

	return { success: true };
}

async function ensureCircleMembership(
	ctx: QueryCtx | MutationCtx,
	circleId: Id<'circles'>,
	userId: Id<'users'>,
	errorCode: (typeof ErrorCodes)[keyof typeof ErrorCodes]
) {
	const membership = await ctx.db
		.query('circleMembers')
		.withIndex('by_circle_user', (q) => q.eq('circleId', circleId).eq('userId', userId))
		.first();
	if (!membership) {
		throw createError(errorCode, 'You do not have access to this circle');
	}
}

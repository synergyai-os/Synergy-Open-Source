import { captureArchive, captureRestore } from '../../orgVersionHistory';
import { validateSessionAndGetUserId } from '../../sessionValidation';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { ensureWorkspaceMembership } from './circleAccess';

export async function archiveCircle(
	ctx: MutationCtx,
	args: { sessionId: string; circleId: Id<'circles'> }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const circle = await ctx.db.get(args.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	if (circle.parentCircleId === undefined) {
		throw createError(ErrorCodes.CIRCLE_INVALID_PARENT, 'Root circle cannot be archived');
	}

	await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

	const now = Date.now();

	await ctx.db.patch(args.circleId, {
		archivedAt: now,
		archivedBy: userId,
		updatedAt: now,
		updatedBy: userId
	});

	const archivedCircle = await ctx.db.get(args.circleId);
	if (archivedCircle) {
		await captureArchive(ctx, 'circle', circle, archivedCircle);
	}

	const roles = await ctx.db
		.query('circleRoles')
		.withIndex('by_circle_archived', (q) =>
			q.eq('circleId', args.circleId).eq('archivedAt', undefined)
		)
		.collect();

	for (const role of roles) {
		await ctx.db.patch(role._id, {
			archivedAt: now,
			archivedBy: userId,
			updatedAt: now,
			updatedBy: userId
		});

		const assignments = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_role_archived', (q) =>
				q.eq('circleRoleId', role._id).eq('archivedAt', undefined)
			)
			.collect();

		for (const assignment of assignments) {
			await ctx.db.patch(assignment._id, {
				archivedAt: now,
				archivedBy: userId,
				updatedAt: now,
				updatedBy: userId
			});
		}
	}

	return { success: true };
}

export async function restoreCircle(
	ctx: MutationCtx,
	args: { sessionId: string; circleId: Id<'circles'> }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const circle = await ctx.db.get(args.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	if (!circle.archivedAt) {
		throw createError(ErrorCodes.CIRCLE_ARCHIVED, 'Circle is not archived');
	}

	await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

	if (circle.parentCircleId) {
		const parent = await ctx.db.get(circle.parentCircleId);
		if (!parent) {
			throw createError(ErrorCodes.CIRCLE_INVALID_PARENT, 'Parent circle no longer exists');
		}
		if (parent.archivedAt) {
			throw createError(
				ErrorCodes.CIRCLE_ARCHIVED,
				'Cannot restore circle while parent circle is archived'
			);
		}
	}

	const now = Date.now();
	const oldCircle = { ...circle };

	await ctx.db.patch(args.circleId, {
		archivedAt: undefined,
		archivedBy: undefined,
		updatedAt: now,
		updatedBy: userId
	});

	const restoredCircle = await ctx.db.get(args.circleId);
	if (restoredCircle) {
		await captureRestore(ctx, 'circle', oldCircle, restoredCircle);
	}

	return { success: true };
}

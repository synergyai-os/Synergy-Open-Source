import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { recordArchiveHistory, recordRestoreHistory } from '../history';
import { ensureWorkspaceMembership, requireWorkspacePersonFromSession } from './circleAccess';

export async function archiveCircle(
	ctx: MutationCtx,
	args: { sessionId: string; circleId: Id<'circles'> }
) {
	const circle = await ctx.db.get(args.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	if (circle.parentCircleId === undefined) {
		throw createError(ErrorCodes.CIRCLE_INVALID_PARENT, 'Root circle cannot be archived');
	}

	const actorPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);
	await ensureWorkspaceMembership(ctx, circle.workspaceId, actorPersonId);

	const now = Date.now();

	await ctx.db.patch(args.circleId, {
		archivedAt: now,
		archivedByPersonId: actorPersonId,
		updatedAt: now,
		updatedByPersonId: actorPersonId
	});

	const archivedCircle = await ctx.db.get(args.circleId);
	if (archivedCircle) {
		await recordArchiveHistory(ctx, 'circle', circle, archivedCircle);
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
			archivedByPersonId: actorPersonId,
			updatedAt: now,
			updatedByPersonId: actorPersonId
		});

		const assignments = await ctx.db
			.query('assignments')
			.withIndex('by_role', (q) => q.eq('roleId', role._id))
			.filter((q) => q.eq(q.field('status'), 'active'))
			.collect();

		for (const assignment of assignments) {
			await ctx.db.patch(assignment._id, {
				status: 'ended',
				endedAt: now,
				endedByPersonId: actorPersonId
			});
		}
	}

	return { success: true };
}

export async function restoreCircle(
	ctx: MutationCtx,
	args: { sessionId: string; circleId: Id<'circles'> }
) {
	const circle = await ctx.db.get(args.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	if (!circle.archivedAt) {
		throw createError(ErrorCodes.CIRCLE_ARCHIVED, 'Circle is not archived');
	}

	const actorPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);
	await ensureWorkspaceMembership(ctx, circle.workspaceId, actorPersonId);

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
		archivedByPersonId: undefined,
		updatedAt: now,
		updatedByPersonId: actorPersonId
	});

	const restoredCircle = await ctx.db.get(args.circleId);
	if (restoredCircle) {
		await recordRestoreHistory(ctx, 'circle', oldCircle, restoredCircle);
	}

	return { success: true };
}

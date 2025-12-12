import { recordCreateHistory, recordUpdateHistory } from '../history';
import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import {
	ensureUniqueCircleSlug,
	ensureWorkspaceMembership,
	requireWorkspacePersonFromSession
} from './circleAccess';
import { createCoreRolesForCircle } from './circleCoreRoles';
import { slugifyName } from './slug';
import { validateCircleName, validateCircleNameUpdate } from './validation';
import type { CircleType } from './schema';
import { requireQuickEditPermissionForPerson } from '../../rbac/orgChart';

export async function createCircleInternal(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		workspaceId: Id<'workspaces'>;
		name: string;
		purpose?: string;
		parentCircleId?: Id<'circles'>;
		circleType?: CircleType;
		decisionModel?: 'manager_decides' | 'team_consensus' | 'consent' | 'coordination_only';
	}
) {
	const actorPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		args.workspaceId
	);

	await ensureWorkspaceMembership(ctx, args.workspaceId, actorPersonId);

	const nameValidationError = validateCircleName(args.name);
	if (nameValidationError) {
		throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, nameValidationError);
	}

	const trimmedName = args.name.trim();

	if (args.parentCircleId === undefined) {
		const allCircles = await ctx.db
			.query('circles')
			.withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
			.collect();

		const existingRoot = allCircles.find((circle) => circle.parentCircleId === undefined);

		if (existingRoot) {
			throw createError(ErrorCodes.CIRCLE_INVALID_PARENT, 'Workspace already has a root circle');
		}
	}

	if (args.parentCircleId) {
		const parentCircle = await ctx.db.get(args.parentCircleId);
		if (!parentCircle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Parent circle not found');
		}
		if (parentCircle.workspaceId !== args.workspaceId) {
			throw createError(
				ErrorCodes.CIRCLE_INVALID_PARENT,
				'Parent circle must belong to the same workspace'
			);
		}
	}

	const slugBase = slugifyName(trimmedName);
	const slug = await ensureUniqueCircleSlug(ctx, args.workspaceId, slugBase);
	const now = Date.now();

	const circleType = args.circleType ?? 'hierarchy';
	const decisionModel = args.decisionModel ?? 'manager_decides';

	const circleId = await ctx.db.insert('circles', {
		workspaceId: args.workspaceId,
		name: trimmedName,
		slug,
		purpose: args.purpose,
		parentCircleId: args.parentCircleId,
		circleType,
		decisionModel,
		status: 'active',
		createdAt: now,
		updatedAt: now,
		updatedByPersonId: actorPersonId
	});

	const newCircle = await ctx.db.get(circleId);
	if (newCircle) {
		await recordCreateHistory(ctx, 'circle', newCircle);
	}

	await createCoreRolesForCircle(ctx, circleId, args.workspaceId, actorPersonId, circleType);

	return {
		circleId,
		slug
	};
}

export async function updateCircleInternal(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		circleId: Id<'circles'>;
		name?: string;
		purpose?: string;
		parentCircleId?: Id<'circles'>;
	}
) {
	const circle = await ctx.db.get(args.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	const actorPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);

	await ensureWorkspaceMembership(ctx, circle.workspaceId, actorPersonId);

	const updates: Partial<Doc<'circles'>> = {
		updatedAt: Date.now(),
		updatedByPersonId: actorPersonId
	};

	if (args.name !== undefined) {
		const nameValidationError = validateCircleNameUpdate(args.name);
		if (nameValidationError) {
			throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, nameValidationError);
		}

		const trimmedName = args.name.trim();
		updates.name = trimmedName;

		const slugBase = slugifyName(trimmedName);
		updates.slug = await ensureUniqueCircleSlug(ctx, circle.workspaceId, slugBase);
	}

	if (args.purpose !== undefined) {
		updates.purpose = args.purpose;
	}

	if (args.parentCircleId !== undefined) {
		if (args.parentCircleId) {
			const parentCircle = await ctx.db.get(args.parentCircleId);
			if (!parentCircle) {
				throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Parent circle not found');
			}
			if (parentCircle.workspaceId !== circle.workspaceId) {
				throw createError(
					ErrorCodes.CIRCLE_INVALID_PARENT,
					'Parent circle must belong to the same workspace'
				);
			}
			if (args.parentCircleId === args.circleId) {
				throw createError(ErrorCodes.CIRCLE_INVALID_PARENT, 'Circle cannot be its own parent');
			}
		}
		updates.parentCircleId = args.parentCircleId;
	}

	await ctx.db.patch(args.circleId, updates);

	const updatedCircle = await ctx.db.get(args.circleId);
	if (updatedCircle) {
		await recordUpdateHistory(ctx, 'circle', circle, updatedCircle);
	}

	return { success: true };
}

export async function updateInlineCircle(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		circleId: Id<'circles'>;
		updates: {
			name?: string;
			purpose?: string;
			circleType?: CircleType;
			decisionModel?: 'manager_decides' | 'team_consensus' | 'consent' | 'coordination_only';
		};
	}
) {
	const circle = await ctx.db.get(args.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	const actorPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);

	await requireQuickEditPermissionForPerson(ctx, actorPersonId, circle);

	const beforeDoc = { ...circle };

	const updateData: Partial<Doc<'circles'>> = {
		updatedAt: Date.now(),
		updatedByPersonId: actorPersonId
	};

	if (args.updates.name !== undefined) {
		const nameValidationError = validateCircleNameUpdate(args.updates.name);
		if (nameValidationError) {
			throw createError(ErrorCodes.VALIDATION_REQUIRED_FIELD, nameValidationError);
		}

		const trimmedName = args.updates.name.trim();
		updateData.name = trimmedName;

		const slugBase = slugifyName(trimmedName);
		updateData.slug = await ensureUniqueCircleSlug(ctx, circle.workspaceId, slugBase);
	}

	if (args.updates.purpose !== undefined) {
		updateData.purpose = args.updates.purpose;
	}

	if (args.updates.circleType !== undefined) {
		updateData.circleType = args.updates.circleType;
	}

	if (args.updates.decisionModel !== undefined) {
		updateData.decisionModel = args.updates.decisionModel;
	}

	await ctx.db.patch(args.circleId, updateData);

	const afterDoc = await ctx.db.get(args.circleId);
	if (afterDoc) {
		await recordUpdateHistory(ctx, 'circle', beforeDoc, afterDoc);
	}

	return { success: true };
}

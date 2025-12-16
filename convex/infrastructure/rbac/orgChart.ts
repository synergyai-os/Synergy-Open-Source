import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { QueryCtx, MutationCtx } from '../../_generated/server';
import type { Doc, Id } from '../../_generated/dataModel';
import { createError, ErrorCodes } from '../errors/codes';
import { validateSessionAndGetUserId } from '../sessionValidation';
import { hasPermission } from './permissions';
import type { CircleType } from '../../core/circles';
import { requirePerson } from '../../core/people/rules';

export interface QuickEditResult {
	allowed: boolean;
	reason?: string;
}

function getEffectiveCircleType(circle: Doc<'circles'>): CircleType {
	return circle.circleType ?? CIRCLE_TYPES.HIERARCHY;
}

export const getQuickEditStatusQuery = query({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const circle = await ctx.db.get(args.circleId);
		if (!circle) {
			throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
		}

		return await canQuickEdit(ctx, userId, circle);
	}
});

export async function canQuickEdit(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	circle: Doc<'circles'>
): Promise<QuickEditResult> {
	const orgSettings = await ctx.db
		.query('workspaceOrgSettings')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', circle.workspaceId))
		.first();

	if (!orgSettings?.allowQuickChanges) {
		return {
			allowed: false,
			reason: 'Quick edits disabled. Use "Edit circle" to create a proposal.'
		};
	}

	const hasPermissionResult = await hasPermission(ctx, userId, 'org-chart.edit.quick', {
		workspaceId: circle.workspaceId,
		circleId: circle._id
	});

	if (!hasPermissionResult) {
		return {
			allowed: false,
			reason: 'Quick edits require Org Designer role.'
		};
	}

	const circleType = getEffectiveCircleType(circle);

	if (circleType === 'guild') {
		return {
			allowed: false,
			reason: 'Guilds are coordination-only. Create a proposal in your home circle.'
		};
	}

	return { allowed: true };
}

export async function requireQuickEditPermission(
	ctx: MutationCtx,
	userId: Id<'users'>,
	circle: Doc<'circles'>
): Promise<void> {
	const orgSettings = await ctx.db
		.query('workspaceOrgSettings')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', circle.workspaceId))
		.first();

	if (!orgSettings?.allowQuickChanges) {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			'Quick edits disabled. Use "Edit circle" to create a proposal.'
		);
	}

	const hasPermissionResult = await hasPermission(ctx, userId, 'org-chart.edit.quick', {
		workspaceId: circle.workspaceId,
		circleId: circle._id
	});

	if (!hasPermissionResult) {
		throw createError(ErrorCodes.AUTHZ_INSUFFICIENT_RBAC, 'Quick edits require Org Designer role.');
	}

	const circleType = getEffectiveCircleType(circle);

	if (circleType === 'guild') {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			'Guilds are coordination-only. Create a proposal in your home circle.'
		);
	}
}

// TODO: SYOS-791 - move RBAC to workspaceRoles/personId. Until then, map personId -> userId.
export async function requireQuickEditPermissionForPerson(
	ctx: MutationCtx,
	personId: Id<'people'>,
	circle: Doc<'circles'>
): Promise<void> {
	const person = await requirePerson(ctx, personId);
	if (!person.userId) {
		throw createError(ErrorCodes.AUTH_REQUIRED, 'User link required for quick edits');
	}
	await requireQuickEditPermission(ctx, person.userId, circle);
}

export async function canQuickEditForPerson(
	ctx: QueryCtx | MutationCtx,
	personId: Id<'people'>,
	circle: Doc<'circles'>
): Promise<QuickEditResult> {
	const person = await requirePerson(ctx, personId);
	if (!person.userId) {
		return { allowed: false, reason: 'User link required for quick edits' };
	}
	return canQuickEdit(ctx, person.userId, circle);
}

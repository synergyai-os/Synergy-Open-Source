import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../sessionValidation';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { captureArchive, captureRestore } from '../../orgVersionHistory';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { ensureCircleExists, ensureWorkspaceMembership } from './roleAccess';
import { isLeadRequiredForCircleType } from './lead';
import { handleUserCircleRoleRemoved, handleUserCircleRoleRestored } from './roleRbac';
import { countLeadRolesInCircle } from './roleAccess';

async function archiveRoleHelper(
	ctx: MutationCtx,
	roleId: Id<'circleRoles'>,
	userId: Id<'users'>,
	reason: 'direct' | 'cascade' = 'direct'
): Promise<void> {
	const role = await ctx.db.get(roleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	if (role.archivedAt !== undefined) {
		return;
	}

	if (reason === 'direct' && role.templateId) {
		const template = await ctx.db.get(role.templateId);
		if (template?.isRequired) {
			const circle = await ctx.db.get(role.circleId);
			if (!circle) {
				throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
			}

			const orgSettings = await ctx.db
				.query('workspaceOrgSettings')
				.withIndex('by_workspace', (q) => q.eq('workspaceId', circle.workspaceId))
				.first();

			const circleType = circle.circleType ?? 'hierarchy';
			const leadRequired = isLeadRequiredForCircleType(
				circleType,
				orgSettings?.leadRequirementByCircleType
			);

			if (leadRequired) {
				const leadCount = await countLeadRolesInCircle(ctx, role.circleId);
				if (leadCount <= 1) {
					throw createError(
						ErrorCodes.GENERIC_ERROR,
						`Cannot archive the last Lead role in a ${circleType} circle. ${circleType} circles require at least one Lead role.`
					);
				}
			}
		}
	}

	const now = Date.now();

	await ctx.db.patch(roleId, {
		archivedAt: now,
		archivedBy: userId,
		updatedAt: now,
		updatedBy: userId
	});

	const archivedRole = await ctx.db.get(roleId);
	if (archivedRole) {
		await captureArchive(ctx, 'circleRole', role, archivedRole);
	}

	const assignments = await ctx.db
		.query('userCircleRoles')
		.withIndex('by_role_archived', (q) => q.eq('circleRoleId', roleId).eq('archivedAt', undefined))
		.collect();

	for (const assignment of assignments) {
		await ctx.db.patch(assignment._id, {
			archivedAt: now,
			archivedBy: userId,
			updatedAt: now,
			updatedBy: userId
		});

		await handleUserCircleRoleRemoved(ctx, assignment._id);
	}
}

async function archiveRoleMutation(
	ctx: MutationCtx,
	args: { sessionId: string; circleRoleId: Id<'circleRoles'> }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	await ensureWorkspaceMembership(ctx, workspaceId, userId);

	await archiveRoleHelper(ctx, args.circleRoleId, userId, 'direct');

	return { success: true };
}

async function restoreRoleMutation(
	ctx: MutationCtx,
	args: { sessionId: string; roleId: Id<'circleRoles'> }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const role = await ctx.db.get(args.roleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	if (!role.archivedAt) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Role is not archived');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	await ensureWorkspaceMembership(ctx, workspaceId, userId);

	const circle = await ctx.db.get(role.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle no longer exists');
	}
	if (circle.archivedAt) {
		throw createError(
			ErrorCodes.CIRCLE_ARCHIVED,
			'Cannot restore role while circle is archived. Restore circle first.'
		);
	}

	const now = Date.now();
	const oldRole = { ...role };

	let templateId = role.templateId;
	if (templateId) {
		const template = await ctx.db.get(templateId);
		if (!template || template.archivedAt) {
			templateId = undefined;
		}
	}

	await ctx.db.patch(args.roleId, {
		archivedAt: undefined,
		archivedBy: undefined,
		templateId,
		updatedAt: now,
		updatedBy: userId
	});

	const restoredRole = await ctx.db.get(args.roleId);
	if (restoredRole) {
		await captureRestore(ctx, 'circleRole', oldRole, restoredRole);
	}

	return { success: true };
}

async function restoreAssignmentMutation(
	ctx: MutationCtx,
	args: { sessionId: string; assignmentId: Id<'userCircleRoles'> }
) {
	const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const assignment = await ctx.db.get(args.assignmentId);
	if (!assignment) {
		throw createError(ErrorCodes.ASSIGNMENT_NOT_FOUND, 'Assignment not found');
	}

	if (!assignment.archivedAt) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Assignment is not archived');
	}

	const role = await ctx.db.get(assignment.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role no longer exists');
	}
	if (role.archivedAt) {
		throw createError(
			ErrorCodes.CIRCLE_ARCHIVED,
			'Cannot restore assignment while role is archived'
		);
	}

	const circle = await ctx.db.get(role.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	await ensureWorkspaceMembership(ctx, circle.workspaceId, userId);

	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) =>
			q.eq('workspaceId', circle.workspaceId).eq('userId', assignment.userId)
		)
		.first();

	if (!membership) {
		throw createError(
			ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED,
			'User is no longer a workspace member'
		);
	}

	const existingActive = await ctx.db
		.query('userCircleRoles')
		.withIndex('by_user_role', (q) =>
			q.eq('userId', assignment.userId).eq('circleRoleId', assignment.circleRoleId)
		)
		.filter((q) => q.eq(q.field('archivedAt'), undefined))
		.first();

	if (existingActive) {
		throw createError(ErrorCodes.ASSIGNMENT_ALREADY_EXISTS, 'User already has this role assigned');
	}

	const now = Date.now();
	const oldAssignment = { ...assignment };

	await ctx.db.patch(args.assignmentId, {
		archivedAt: undefined,
		archivedBy: undefined,
		updatedAt: now,
		updatedBy: userId
	});

	await handleUserCircleRoleRestored(ctx, args.assignmentId);

	const restoredAssignment = await ctx.db.get(args.assignmentId);
	if (restoredAssignment) {
		await captureRestore(ctx, 'userCircleRole', oldAssignment, restoredAssignment);
	}

	return { success: true };
}

export const archiveRole = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => archiveRoleMutation(ctx, args)
});

export const restoreRole = mutation({
	args: {
		sessionId: v.string(),
		roleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => restoreRoleMutation(ctx, args)
});

export const restoreAssignment = mutation({
	args: {
		sessionId: v.string(),
		assignmentId: v.id('userCircleRoles')
	},
	handler: async (ctx, args) => restoreAssignmentMutation(ctx, args)
});

export { archiveRoleHelper };

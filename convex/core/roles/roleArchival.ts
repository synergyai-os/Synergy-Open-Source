import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { recordArchiveHistory, recordRestoreHistory } from '../history';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import {
	ensureCircleExists,
	ensureWorkspaceMembership,
	requireWorkspacePersonById,
	requireWorkspacePersonFromSession
} from './roleAccess';
import { handleUserCircleRoleRemoved, handleUserCircleRoleRestored } from './roleRbac';

async function archiveRoleHelper(
	ctx: MutationCtx,
	roleId: Id<'circleRoles'>,
	actorPersonId: Id<'people'>,
	reason: 'direct' | 'cascade' = 'direct'
): Promise<void> {
	const role = await ctx.db.get(roleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	if (role.archivedAt !== undefined) {
		return;
	}

	// GOV-04: Lead role cannot be deleted while circle exists
	if (reason === 'direct' && role.roleType === 'circle_lead') {
		const circle = await ctx.db.get(role.circleId);
		if (!circle || circle.archivedAt !== undefined) {
			// Circle is archived or doesn't exist - allow archiving lead role
			// (this happens during cascade archival)
		} else {
			// Circle is active - prevent deleting lead role
			throw createError(
				ErrorCodes.GENERIC_ERROR,
				'GOV-04: Lead role cannot be deleted while circle exists. Every circle must have exactly one lead role.'
			);
		}
	}

	const now = Date.now();

	await ctx.db.patch(roleId, {
		archivedAt: now,
		archivedByPersonId: actorPersonId,
		updatedAt: now,
		updatedByPersonId: actorPersonId
	});

	const archivedRole = await ctx.db.get(roleId);
	if (archivedRole) {
		await recordArchiveHistory(ctx, 'circleRole', role, archivedRole);
	}

	const assignments = await ctx.db
		.query('assignments')
		.withIndex('by_role', (q) => q.eq('roleId', roleId))
		.filter((q) => q.eq(q.field('status'), 'active'))
		.collect();

	for (const assignment of assignments) {
		await ctx.db.patch(assignment._id, {
			status: 'ended',
			endedAt: now,
			endedByPersonId: actorPersonId
		});

		await handleUserCircleRoleRemoved(ctx, assignment._id);
	}
}

async function archiveRoleMutation(
	ctx: MutationCtx,
	args: { sessionId: string; circleRoleId: Id<'circleRoles'> }
) {
	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	const actorPersonId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
	await ensureWorkspaceMembership(ctx, workspaceId, actorPersonId);

	await archiveRoleHelper(ctx, args.circleRoleId, actorPersonId, 'direct');

	return { success: true };
}

async function restoreRoleMutation(
	ctx: MutationCtx,
	args: { sessionId: string; roleId: Id<'circleRoles'> }
) {
	const role = await ctx.db.get(args.roleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	if (!role.archivedAt) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Role is not archived');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	const actorPersonId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
	await ensureWorkspaceMembership(ctx, workspaceId, actorPersonId);

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
		archivedByPersonId: undefined,
		templateId,
		updatedAt: now,
		updatedByPersonId: actorPersonId
	});

	const restoredRole = await ctx.db.get(args.roleId);
	if (restoredRole) {
		await recordRestoreHistory(ctx, 'circleRole', oldRole, restoredRole);
	}

	return { success: true };
}

async function restoreAssignmentMutation(
	ctx: MutationCtx,
	args: { sessionId: string; assignmentId: Id<'assignments'> }
) {
	const assignment = await ctx.db.get(args.assignmentId);
	if (!assignment) {
		throw createError(ErrorCodes.ASSIGNMENT_NOT_FOUND, 'Assignment not found');
	}

	if (assignment.status !== 'ended') {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Assignment is not ended');
	}

	const role = await ctx.db.get(assignment.roleId);
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

	const actorPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);
	await ensureWorkspaceMembership(ctx, circle.workspaceId, actorPersonId);

	await requireWorkspacePersonById(ctx, circle.workspaceId, assignment.personId);

	const existingActive = await ctx.db
		.query('assignments')
		.withIndex('by_role_person', (q) =>
			q.eq('roleId', assignment.roleId).eq('personId', assignment.personId)
		)
		.filter((q) => q.eq(q.field('status'), 'active'))
		.first();

	if (existingActive) {
		throw createError(ErrorCodes.ASSIGNMENT_ALREADY_EXISTS, 'User already has this role assigned');
	}

	const _now = Date.now();
	const oldAssignment = { ...assignment };

	await ctx.db.patch(args.assignmentId, {
		status: 'active',
		endedAt: undefined,
		endedByPersonId: undefined
	});

	await handleUserCircleRoleRestored(ctx, args.assignmentId);

	const restoredAssignment = await ctx.db.get(args.assignmentId);
	if (restoredAssignment) {
		await recordRestoreHistory(ctx, 'assignment', oldAssignment, restoredAssignment);
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
		assignmentId: v.id('assignments')
	},
	handler: async (ctx, args) => restoreAssignmentMutation(ctx, args)
});

export { archiveRoleHelper };

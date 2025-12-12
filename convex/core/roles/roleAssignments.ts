import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import {
	ensureCircleExists,
	ensureWorkspaceMembership,
	requireWorkspacePersonFromSession
} from './roleAccess';
import { handleUserCircleRoleCreated, handleUserCircleRoleRemoved } from './roleRbac';

async function assignUserToRole(
	ctx: MutationCtx,
	args: { sessionId: string; circleRoleId: Id<'circleRoles'>; assigneePersonId: Id<'people'> }
): Promise<{ success: true }> {
	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);

	const actorPersonId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
	const targetPersonId = args.assigneePersonId;
	await ensureWorkspaceMembership(ctx, workspaceId, actorPersonId);
	await ensureWorkspaceMembership(ctx, workspaceId, targetPersonId);

	const existingAssignment = await ctx.db
		.query('userCircleRoles')
		.withIndex('by_person_role', (q) =>
			q.eq('personId', targetPersonId).eq('circleRoleId', args.circleRoleId)
		)
		.first();

	if (existingAssignment) {
		throw createError(
			ErrorCodes.ASSIGNMENT_ALREADY_EXISTS,
			'Person is already assigned to this role'
		);
	}

	const now = Date.now();
	const userCircleRoleId = await ctx.db.insert('userCircleRoles', {
		personId: targetPersonId,
		circleRoleId: args.circleRoleId,
		assignedAt: now,
		assignedByPersonId: actorPersonId,
		updatedAt: now
	});

	await handleUserCircleRoleCreated(
		ctx,
		{
			_id: userCircleRoleId,
			personId: targetPersonId,
			circleRoleId: args.circleRoleId,
			assignedByPersonId: actorPersonId
		},
		{
			templateId: role.templateId,
			circleId: role.circleId,
			workspaceId
		}
	);

	return { success: true };
}

export const assignUser = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		assigneePersonId: v.id('people')
	},
	handler: async (ctx, args) => assignUserToRole(ctx, args)
});

export const removeUser = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		assigneePersonId: v.id('people')
	},
	handler: async (ctx, args) => {
		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		const actorPersonId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
		await ensureWorkspaceMembership(ctx, workspaceId, actorPersonId);

		const assignment = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_person_role', (q) =>
				q.eq('personId', args.assigneePersonId).eq('circleRoleId', args.circleRoleId)
			)
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.first();

		if (!assignment) {
			throw createError(ErrorCodes.ASSIGNMENT_NOT_FOUND, 'Person is not assigned to this role');
		}

		const now = Date.now();
		await ctx.db.patch(assignment._id, {
			archivedAt: now,
			archivedByPersonId: actorPersonId,
			updatedAt: now,
			updatedByPersonId: actorPersonId
		});

		await handleUserCircleRoleRemoved(ctx, assignment._id);

		return { success: true };
	}
});

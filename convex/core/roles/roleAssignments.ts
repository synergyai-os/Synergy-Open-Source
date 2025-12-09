import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../../sessionValidation';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { ensureCircleExists, ensureWorkspaceMembership } from './roleAccess';
import { handleUserCircleRoleCreated, handleUserCircleRoleRemoved } from './roleRbac';

async function assignUserToRole(
	ctx: MutationCtx,
	args: { sessionId: string; circleRoleId: Id<'circleRoles'>; userId: Id<'users'> }
): Promise<{ success: true }> {
	const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

	const role = await ctx.db.get(args.circleRoleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);

	await ensureWorkspaceMembership(ctx, workspaceId, actingUserId);
	await ensureWorkspaceMembership(ctx, workspaceId, args.userId);

	const existingAssignment = await ctx.db
		.query('userCircleRoles')
		.withIndex('by_user_role', (q) =>
			q.eq('userId', args.userId).eq('circleRoleId', args.circleRoleId)
		)
		.first();

	if (existingAssignment) {
		throw createError(
			ErrorCodes.ASSIGNMENT_ALREADY_EXISTS,
			'User is already assigned to this role'
		);
	}

	const now = Date.now();
	const userCircleRoleId = await ctx.db.insert('userCircleRoles', {
		userId: args.userId,
		circleRoleId: args.circleRoleId,
		assignedAt: now,
		assignedBy: actingUserId,
		updatedAt: now
	});

	await handleUserCircleRoleCreated(
		ctx,
		{
			_id: userCircleRoleId,
			userId: args.userId,
			circleRoleId: args.circleRoleId,
			assignedBy: actingUserId
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
		userId: v.id('users')
	},
	handler: async (ctx, args) => assignUserToRole(ctx, args)
});

export const removeUser = mutation({
	args: {
		sessionId: v.string(),
		circleRoleId: v.id('circleRoles'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const { userId: actingUserId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		const role = await ctx.db.get(args.circleRoleId);
		if (!role) {
			throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
		}

		const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
		await ensureWorkspaceMembership(ctx, workspaceId, actingUserId);

		const assignment = await ctx.db
			.query('userCircleRoles')
			.withIndex('by_user_role', (q) =>
				q.eq('userId', args.userId).eq('circleRoleId', args.circleRoleId)
			)
			.filter((q) => q.eq(q.field('archivedAt'), undefined))
			.first();

		if (!assignment) {
			throw createError(ErrorCodes.ASSIGNMENT_NOT_FOUND, 'User is not assigned to this role');
		}

		const now = Date.now();
		await ctx.db.patch(assignment._id, {
			archivedAt: now,
			archivedBy: actingUserId,
			updatedAt: now,
			updatedBy: actingUserId
		});

		await handleUserCircleRoleRemoved(ctx, assignment._id);

		return { success: true };
	}
});

import type { Id } from '../../_generated/dataModel';
import type { MutationCtx } from '../../_generated/server';
import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import {
	ensureWorkspaceMembership,
	requireWorkspacePersonFromSession
} from '../circles/circleAccess';
import { requireCircle } from '../circles/rules';
import { getPersonByUserAndWorkspace } from '../people/queries';
import { getActiveAssignmentForRole } from './queries';
import {
	canCreateAssignment,
	canEndAssignment,
	hasTermEnded,
	requireActiveAssignment,
	requireAssignment
} from './rules';

type CreateArgs = {
	sessionId: string;
	circleId: Id<'circles'>;
	roleId: Id<'circleRoles'>;
	assigneeUserId: Id<'users'>;
	startDate?: number;
	endDate?: number;
	assignedByPersonId?: Id<'people'>;
};

type EndArgs = {
	sessionId: string;
	assignmentId: Id<'assignments'>;
	endReason?: string;
	endedByPersonId?: Id<'people'>;
};

type UpdateArgs = {
	sessionId: string;
	assignmentId: Id<'assignments'>;
	endDate?: number;
	startDate?: number;
};

async function validateRole(ctx: MutationCtx, roleId: Id<'circleRoles'>) {
	const role = await ctx.db.get(roleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}
	return role;
}

async function createAssignment(ctx: MutationCtx, args: CreateArgs) {
	const circle = await requireCircle(ctx, args.circleId);
	const targetPerson = await getPersonByUserAndWorkspace(
		ctx,
		args.assigneeUserId,
		circle.workspaceId
	);
	const actorPersonId =
		args.assignedByPersonId ??
		(await requireWorkspacePersonFromSession(ctx, args.sessionId, circle.workspaceId));

	await ensureWorkspaceMembership(ctx, circle.workspaceId, actorPersonId);
	await ensureWorkspaceMembership(ctx, circle.workspaceId, targetPerson._id);

	const role = await validateRole(ctx, args.roleId);
	if (role.circleId !== circle._id) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Role does not belong to circle');
	}

	const authorized = await canCreateAssignment(ctx, actorPersonId, circle._id);
	if (!authorized) {
		throw createError(ErrorCodes.AUTHZ_NOT_CIRCLE_LEAD, 'Insufficient authority to assign role');
	}

	const existing = await getActiveAssignmentForRole(ctx, args.roleId);
	if (existing) {
		throw createError(
			ErrorCodes.ASSIGNMENT_ALREADY_EXISTS,
			'Role already has an active assignment'
		);
	}

	const now = Date.now();
	const status = hasTermEnded({ endDate: args.endDate }) ? 'ended' : 'active';

	const assignmentId = await ctx.db.insert('assignments', {
		circleId: circle._id,
		roleId: role._id,
		personId: targetPerson._id,
		assignedAt: now,
		assignedByPersonId: actorPersonId,
		startDate: args.startDate,
		endDate: args.endDate,
		status,
		endedAt: status === 'ended' ? now : undefined,
		endedByPersonId: status === 'ended' ? actorPersonId : undefined,
		endReason: undefined
	});

	return { assignmentId };
}

async function endAssignment(ctx: MutationCtx, args: EndArgs) {
	const assignment = await requireActiveAssignment(ctx, args.assignmentId);
	const circle = await requireCircle(ctx, assignment.circleId);

	const actorPersonId =
		args.endedByPersonId ??
		(await requireWorkspacePersonFromSession(ctx, args.sessionId, circle.workspaceId));

	await ensureWorkspaceMembership(ctx, circle.workspaceId, actorPersonId);

	const authorized = await canEndAssignment(ctx, actorPersonId, circle._id);
	if (!authorized) {
		throw createError(ErrorCodes.AUTHZ_NOT_CIRCLE_LEAD, 'Insufficient authority to end assignment');
	}

	const now = Date.now();
	await ctx.db.patch(assignment._id, {
		status: 'ended',
		endedAt: now,
		endedByPersonId: actorPersonId,
		endReason: args.endReason
	});

	return { success: true };
}

async function updateAssignment(ctx: MutationCtx, args: UpdateArgs) {
	const assignment = await requireAssignment(ctx, args.assignmentId);
	const circle = await requireCircle(ctx, assignment.circleId);
	const actorPersonId = await requireWorkspacePersonFromSession(
		ctx,
		args.sessionId,
		circle.workspaceId
	);
	await ensureWorkspaceMembership(ctx, circle.workspaceId, actorPersonId);

	const authorized = await canCreateAssignment(ctx, actorPersonId, circle._id);
	if (!authorized) {
		throw createError(
			ErrorCodes.AUTHZ_NOT_CIRCLE_LEAD,
			'Insufficient authority to update assignment'
		);
	}

	const updates: Partial<typeof assignment> = {};
	if (args.endDate !== undefined) {
		updates.endDate = args.endDate;
	}
	if (args.startDate !== undefined) {
		updates.startDate = args.startDate;
	}

	if (Object.keys(updates).length === 0) {
		return { success: true };
	}

	await ctx.db.patch(assignment._id, updates);
	return { success: true };
}

export const create = mutation({
	args: {
		sessionId: v.string(),
		circleId: v.id('circles'),
		roleId: v.id('circleRoles'),
		assigneeUserId: v.id('users'),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number())
	},
	handler: async (ctx, args) => createAssignment(ctx, args)
});

export const end = mutation({
	args: {
		sessionId: v.string(),
		assignmentId: v.id('assignments'),
		endReason: v.optional(v.string())
	},
	handler: async (ctx, args) => endAssignment(ctx, args)
});

export const update = mutation({
	args: {
		sessionId: v.string(),
		assignmentId: v.id('assignments'),
		endDate: v.optional(v.number()),
		startDate: v.optional(v.number())
	},
	handler: async (ctx, args) => updateAssignment(ctx, args)
});

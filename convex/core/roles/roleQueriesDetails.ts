import { query } from '../../_generated/server';
import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import type { QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import {
	ensureCircleExists,
	ensureWorkspaceMembership,
	requireWorkspacePersonFromSession
} from './roleAccess';

async function getRoleDetails(
	ctx: QueryCtx,
	args: { sessionId: string; roleId: Id<'circleRoles'> }
) {
	const role = await ctx.db.get(args.roleId);
	if (!role) {
		throw createError(ErrorCodes.ROLE_NOT_FOUND, 'Role not found');
	}

	const { workspaceId } = await ensureCircleExists(ctx, role.circleId);
	const personId = await requireWorkspacePersonFromSession(ctx, args.sessionId, workspaceId);
	await ensureWorkspaceMembership(ctx, workspaceId, personId);

	const circle = await ctx.db.get(role.circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}

	const assignments = await ctx.db
		.query('userCircleRoles')
		.withIndex('by_role_archived', (q) =>
			q.eq('circleRoleId', args.roleId).eq('archivedAt', undefined)
		)
		.collect();

	let isLeadRoleFlag = false;
	if (role.templateId) {
		const template = await ctx.db.get(role.templateId);
		isLeadRoleFlag = template?.isRequired === true;
	}

	return {
		roleId: role._id,
		name: role.name,
		purpose: role.purpose,
		circleId: role.circleId,
		circleName: circle.name,
		workspaceId,
		fillerCount: assignments.length,
		createdAt: role.createdAt,
		templateId: role.templateId,
		isLeadRole: isLeadRoleFlag,
		representsToParent: role.representsToParent ?? false
	};
}

export const get = query({
	args: {
		sessionId: v.string(),
		roleId: v.id('circleRoles')
	},
	handler: async (ctx, args) => getRoleDetails(ctx, args)
});

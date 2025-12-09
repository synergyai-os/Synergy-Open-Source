import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { isLeadTemplate } from './detection';
import { countLeadRoles } from './lead';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';

export async function ensureWorkspaceMembership(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<void> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		throw createError(
			ErrorCodes.WORKSPACE_ACCESS_DENIED,
			'You do not have access to this workspace'
		);
	}
}

export async function ensureCircleExists(
	ctx: QueryCtx | MutationCtx,
	circleId: Id<'circles'>
): Promise<{ circleId: Id<'circles'>; workspaceId: Id<'workspaces'> }> {
	const circle = await ctx.db.get(circleId);
	if (!circle) {
		throw createError(ErrorCodes.CIRCLE_NOT_FOUND, 'Circle not found');
	}
	return { circleId: circle._id, workspaceId: circle.workspaceId };
}

export async function isLeadRole(
	ctx: QueryCtx | MutationCtx,
	roleId: Id<'circleRoles'>
): Promise<boolean> {
	const role = await ctx.db.get(roleId);
	if (!role || !role.templateId) {
		return false;
	}

	const template = await ctx.db.get(role.templateId);
	return isLeadTemplate(template);
}

export async function isWorkspaceAdmin(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<boolean> {
	const membership = await ctx.db
		.query('workspaceMembers')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	if (!membership) {
		return false;
	}

	return membership.role === 'owner' || membership.role === 'admin';
}

export async function countLeadRolesInCircle(
	ctx: QueryCtx | MutationCtx,
	circleId: Id<'circles'>
): Promise<number> {
	const roles = await ctx.db
		.query('circleRoles')
		.withIndex('by_circle_archived', (q) => q.eq('circleId', circleId).eq('archivedAt', undefined))
		.collect();

	const templateIds = Array.from(
		new Set(roles.map((role) => role.templateId).filter((id): id is Id<'roleTemplates'> => !!id))
	);

	const templates = await Promise.all(
		templateIds.map(async (templateId) => ({
			templateId,
			template: await ctx.db.get(templateId)
		}))
	);

	const templateMap = new Map<Id<'roleTemplates'>, Doc<'roleTemplates'> | null>(
		templates.map(({ templateId, template }) => [templateId, template])
	);

	return countLeadRoles(roles, (templateId) => templateMap.get(templateId));
}

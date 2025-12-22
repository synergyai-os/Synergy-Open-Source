import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { isLeadTemplate, countLeadRoles } from './rules';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { requireActivePerson, requirePerson } from '../people/rules';
import { getMyPerson, getPersonById } from '../people/queries';

export async function ensureWorkspaceMembership(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	personId: Id<'people'>
): Promise<void> {
	const person = await requireActivePerson(ctx, personId);
	if (person.workspaceId !== workspaceId) {
		throw createError(
			ErrorCodes.WORKSPACE_ACCESS_DENIED,
			'You do not have access to this workspace'
		);
	}
}

/**
 * Ensures the person belongs to the workspace, regardless of whether they are active, invited, or a placeholder.
 * This is intentionally looser than ensureWorkspaceMembership() and should generally only be used for "target"
 * identities (e.g. assignees) where placeholders are valid.
 */
export async function ensureWorkspacePersonIsInWorkspace(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	personId: Id<'people'>
): Promise<void> {
	const person = await requirePerson(ctx, personId);
	if (person.workspaceId !== workspaceId) {
		throw createError(
			ErrorCodes.WORKSPACE_ACCESS_DENIED,
			'You do not have access to this workspace'
		);
	}
	if (person.status === 'archived') {
		throw createError(ErrorCodes.WORKSPACE_MEMBERSHIP_REQUIRED, 'Person is archived');
	}
}

export async function requireWorkspacePersonFromSession(
	ctx: QueryCtx | MutationCtx,
	sessionId: string,
	workspaceId: Id<'workspaces'>
): Promise<Id<'people'>> {
	const person = await getMyPerson(ctx, sessionId, workspaceId);
	await ensureWorkspaceMembership(ctx, workspaceId, person._id);
	return person._id;
}

export async function requireWorkspacePersonById(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	personId: Id<'people'>
): Promise<void> {
	const person = await getPersonById(ctx, personId);
	if (person.workspaceId !== workspaceId) {
		throw createError(
			ErrorCodes.WORKSPACE_ACCESS_DENIED,
			'You do not have access to this workspace'
		);
	}
	await requireActivePerson(ctx, personId);
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
	personId: Id<'people'>
): Promise<boolean> {
	const person = await requireActivePerson(ctx, personId);
	if (person.workspaceId !== workspaceId) return false;
	return person.workspaceRole === 'owner' || person.workspaceRole === 'admin';
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

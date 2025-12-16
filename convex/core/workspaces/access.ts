import type { Doc, Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { requirePermission } from '../../infrastructure/rbac/permissions';
import { findPersonByUserAndWorkspace, getPersonByUserAndWorkspace } from '../people/queries';
import { requireActivePerson } from '../people/rules';

type AnyCtx = QueryCtx | MutationCtx;

/**
 * Returns person record
 */
export async function requireWorkspaceMembership(
	ctx: AnyCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>,
	message = 'You are not a member of this workspace'
): Promise<Doc<'people'>> {
	const person = await findPersonByUserAndWorkspace(ctx, userId, workspaceId);
	if (!person || person.status !== 'active') {
		throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, message);
	}
	return person;
}

/**
 * Returns person record
 */
export async function requireWorkspaceAdminOrOwner(
	ctx: AnyCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>,
	message = 'Must be org admin or owner'
): Promise<Doc<'people'>> {
	const person = await getPersonByUserAndWorkspace(ctx, userId, workspaceId);
	const activePerson = await requireActivePerson(ctx, person._id);

	if (activePerson.workspaceRole === 'member') {
		throw createError(ErrorCodes.WORKSPACE_ACCESS_DENIED, message);
	}

	return activePerson;
}

/**
 * Returns person record
 */
export async function requireCanInviteMembers(
	ctx: AnyCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
): Promise<Doc<'people'>> {
	const person = await requireWorkspaceMembership(ctx, workspaceId, userId);
	if (person.workspaceRole === 'owner') {
		return person;
	}

	await requirePermission(ctx, userId, 'users.invite', { workspaceId });
	return person;
}

/**
 * SYOS-814 Phase 3: Migrated to use people table
 */
export async function getWorkspaceOwnerCount(
	ctx: AnyCtx,
	workspaceId: Id<'workspaces'>
): Promise<number> {
	const activePeople = await ctx.db
		.query('people')
		.withIndex('by_workspace_status', (q) =>
			q.eq('workspaceId', workspaceId).eq('status', 'active')
		)
		.collect();

	return activePeople.filter((person) => person.workspaceRole === 'owner').length;
}

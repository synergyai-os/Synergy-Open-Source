import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { ensureUniqueSlug } from './slug';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { getMyPerson, getPersonById } from '../people/queries';
import { requireActivePerson } from '../people/rules';

export async function ensureUniqueCircleSlug(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	baseSlug: string
): Promise<string> {
	const existingCircles = await ctx.db
		.query('circles')
		.withIndex('by_workspace', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	const existingSlugs = new Set(existingCircles.map((circle) => circle.slug));
	return ensureUniqueSlug(baseSlug, existingSlugs);
}

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

import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { ensureUniqueSlug } from '../circles/slug';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { requireActivePerson } from '../people/rules';

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

export async function getNextAgendaOrder(
	ctx: MutationCtx,
	meetingId: Id<'meetings'>
): Promise<number> {
	const existingItems = await ctx.db
		.query('meetingAgendaItems')
		.withIndex('by_meeting', (q) => q.eq('meetingId', meetingId))
		.collect();

	return existingItems.length > 0 ? Math.max(...existingItems.map((i) => i.order)) + 1 : 1;
}

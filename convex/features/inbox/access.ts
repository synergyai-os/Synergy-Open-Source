import { getPersonForSessionAndWorkspace } from '../../core/people/queries';
import { requireActivePerson } from '../../core/people/rules';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';

type Ctx = QueryCtx | MutationCtx;

export type InboxActor = {
	personId: Id<'people'>;
	workspaceId: Id<'workspaces'>;
	linkedUser: Id<'users'>;
};

export async function getInboxActor(
	ctx: Ctx,
	sessionId: string,
	workspaceId?: Id<'workspaces'> | null
): Promise<InboxActor> {
	const {
		person,
		workspaceId: resolvedWorkspaceId,
		linkedUser
	} = await getPersonForSessionAndWorkspace(ctx, sessionId, workspaceId);
	const activePerson = await requireActivePerson(ctx, person._id);

	return {
		personId: activePerson._id,
		workspaceId: resolvedWorkspaceId,
		linkedUser
	};
}

// Optional helper used by tests and legacy callers that expect null instead of throw
export async function findInboxActor(
	ctx: Ctx,
	sessionId: string,
	workspaceId?: Id<'workspaces'> | null
): Promise<InboxActor | null> {
	try {
		return await getInboxActor(ctx, sessionId, workspaceId);
	} catch {
		return null;
	}
}

export async function findInboxItemOwnedByPerson(
	ctx: Ctx,
	inboxItemId: Id<'inboxItems'>,
	personId: Id<'people'>
) {
	const item = await ctx.db.get(inboxItemId);
	if (!item || item.personId !== personId) return null;
	return item;
}

import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import type { Id } from '../../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../_generated/server';

type Ctx = QueryCtx | MutationCtx;

export async function getUserId(ctx: Ctx, sessionId: string): Promise<string> {
	const { userId } = await validateSessionAndGetUserId(ctx, sessionId);
	return userId;
}

// Optional helper used by tests and legacy callers that expect null instead of throw
export async function findUserId(ctx: Ctx, sessionId: string): Promise<string | null> {
	try {
		return await getUserId(ctx, sessionId);
	} catch {
		return null;
	}
}

export async function findInboxItemOwnedByUser(
	ctx: Ctx,
	inboxItemId: Id<'inboxItems'>,
	userId: string
) {
	const item = await ctx.db.get(inboxItemId);
	if (!item || item.userId !== userId) return null;
	return item;
}

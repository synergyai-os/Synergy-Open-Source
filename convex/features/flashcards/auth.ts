import type { MutationCtx, QueryCtx } from '../../_generated/server';
import { getPersonForSessionAndWorkspace } from '../../core/people/queries';

type AnyCtx = MutationCtx | QueryCtx;

export async function requirePersonId(ctx: AnyCtx, sessionId: string) {
	const { person } = await getPersonForSessionAndWorkspace(ctx, sessionId, null);
	return person._id;
}

export async function getPersonId(ctx: AnyCtx, sessionId: string) {
	return requirePersonId(ctx, sessionId);
}

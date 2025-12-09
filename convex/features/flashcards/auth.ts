import type { ActionCtx, MutationCtx, QueryCtx } from '../../_generated/server';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';

type AnyCtx = MutationCtx | QueryCtx | ActionCtx;

export async function requireUserId(ctx: AnyCtx, sessionId: string) {
	const { userId } = await validateSessionAndGetUserId(ctx, sessionId);
	return userId;
}

export async function getUserId(ctx: AnyCtx, sessionId: string) {
	return requireUserId(ctx, sessionId);
}

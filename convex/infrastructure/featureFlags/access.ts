import { requireSystemAdmin } from '../rbac/permissions';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { UserContext } from './types';
import type { Ctx } from './types';

export async function requireAdmin(ctx: Ctx, sessionId: string): Promise<void> {
	await requireSystemAdmin(ctx, sessionId);
}

export async function getUserContext(ctx: Ctx, sessionId: string): Promise<UserContext> {
	const { userId } = await validateSessionAndGetUserId(ctx, sessionId);
	const user = await ctx.db.get(userId);
	return { userId, user };
}

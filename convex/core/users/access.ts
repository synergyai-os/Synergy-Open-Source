import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { requirePermission } from '../../rbac/permissions';

export async function requireSessionUserId(
	ctx: QueryCtx | MutationCtx,
	sessionId: string
): Promise<Id<'users'>> {
	const { userId } = await validateSessionAndGetUserId(ctx, sessionId);
	return userId;
}

export async function requireProfilePermission(
	ctx: MutationCtx,
	sessionId: string,
	targetUserId: Id<'users'>
): Promise<Id<'users'>> {
	const { userId } = await validateSessionAndGetUserId(ctx, sessionId);

	await requirePermission(ctx, userId, 'users.manage-profile', {
		resourceOwnerId: targetUserId
	});

	return userId;
}

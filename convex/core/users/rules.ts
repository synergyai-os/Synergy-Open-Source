import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';
import { requirePermission } from '../../infrastructure/rbac/permissions';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { MAX_LINK_DEPTH, MAX_TOTAL_ACCOUNTS } from './constants';

// ============================================================================
// Session/Access Rules
// ============================================================================

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

// ============================================================================
// Profile Rules
// ============================================================================

export function calculateProfileName(
	firstName?: string | null,
	lastName?: string | null
): string | undefined {
	if (firstName && lastName) return `${firstName} ${lastName}`;
	return firstName || lastName || undefined;
}

// ============================================================================
// Account Linking Rules
// ============================================================================

export async function linkExists(
	ctx: MutationCtx | QueryCtx,
	primaryUserId: Id<'users'>,
	linkedUserId: Id<'users'>
): Promise<boolean> {
	if (primaryUserId === linkedUserId) {
		return true;
	}

	const visited = new Set<string>();
	const queue: Array<{ userId: Id<'users'>; depth: number }> = [
		{ userId: primaryUserId, depth: 0 }
	];

	while (queue.length > 0) {
		const current = queue.shift()!;

		if (current.depth >= MAX_LINK_DEPTH) {
			continue;
		}

		if (visited.has(current.userId)) {
			continue;
		}
		visited.add(current.userId);

		if (visited.size > MAX_TOTAL_ACCOUNTS) {
			console.warn(`User ${primaryUserId} has too many linked accounts (>${MAX_TOTAL_ACCOUNTS})`);
			return false;
		}

		const links = await ctx.db
			.query('accountLinks')
			.withIndex('by_primary', (q) => q.eq('primaryUserId', current.userId))
			.collect();

		for (const link of links) {
			if (link.linkedUserId === linkedUserId) {
				return true;
			}
			if (!visited.has(link.linkedUserId)) {
				queue.push({ userId: link.linkedUserId, depth: current.depth + 1 });
			}
		}
	}

	return false;
}

export async function getTransitiveLinks(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	maxDepth: number
): Promise<Set<Id<'users'>>> {
	const visited = new Set<Id<'users'>>();
	const queue: Array<{ userId: Id<'users'>; depth: number }> = [{ userId, depth: 0 }];

	while (queue.length > 0) {
		const current = queue.shift()!;
		if (visited.has(current.userId)) {
			continue;
		}

		visited.add(current.userId);
		if (current.depth >= maxDepth) {
			continue;
		}

		const links = await ctx.db
			.query('accountLinks')
			.withIndex('by_primary', (q) => q.eq('primaryUserId', current.userId))
			.collect();

		for (const link of links) {
			if (!visited.has(link.linkedUserId)) {
				queue.push({ userId: link.linkedUserId, depth: current.depth + 1 });
			}
		}
	}

	return visited;
}

export async function checkLinkDepth(
	ctx: QueryCtx | MutationCtx,
	userId1: Id<'users'>,
	userId2: Id<'users'>
): Promise<boolean> {
	const user1Links = await getTransitiveLinks(ctx, userId1, MAX_LINK_DEPTH);
	const user2Links = await getTransitiveLinks(ctx, userId2, MAX_LINK_DEPTH);
	const combined = new Set([...user1Links, ...user2Links, userId1, userId2]);

	return combined.size > MAX_TOTAL_ACCOUNTS;
}

export async function ensureLinkable(
	ctx: MutationCtx,
	ownerUserId: Id<'users'>,
	targetUserId: Id<'users'>
): Promise<void> {
	if (ownerUserId === targetUserId) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Cannot link the same account');
	}

	const primary = await ctx.db.get(ownerUserId);
	const linked = await ctx.db.get(targetUserId);
	if (!primary || !linked) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'One or both accounts no longer exist');
	}

	const existingLinks = await ctx.db
		.query('accountLinks')
		.withIndex('by_primary', (q) => q.eq('primaryUserId', ownerUserId))
		.collect();
	if (existingLinks.length >= MAX_TOTAL_ACCOUNTS - 1) {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			`Cannot link more than ${MAX_TOTAL_ACCOUNTS} accounts`
		);
	}

	const wouldExceedDepth = await checkLinkDepth(ctx, ownerUserId, targetUserId);
	if (wouldExceedDepth) {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			`Cannot link accounts: would exceed maximum depth of ${MAX_LINK_DEPTH} or account limit of ${MAX_TOTAL_ACCOUNTS}`
		);
	}
}


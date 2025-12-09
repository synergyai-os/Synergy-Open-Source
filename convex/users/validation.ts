import type { MutationCtx, QueryCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

export const MAX_LINK_DEPTH = 3;
export const MAX_TOTAL_ACCOUNTS = 10;

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

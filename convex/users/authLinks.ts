import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import { requireSessionUserId } from './access';
import { checkLinkDepth, linkExists, MAX_LINK_DEPTH, MAX_TOTAL_ACCOUNTS } from './validation';
import { createError, ErrorCodes } from '../infrastructure/errors/codes';

async function requireLinkOwner(
	ctx: MutationCtx,
	primaryUserId: Id<'users'>
): Promise<Id<'users'>> {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw createError(ErrorCodes.AUTH_REQUIRED, 'Not authenticated');
	}

	const currentUser = await ctx.db
		.query('users')
		.withIndex('by_workos_id', (q) => q.eq('workosId', identity.subject))
		.first();

	if (!currentUser || currentUser._id !== primaryUserId) {
		throw createError(ErrorCodes.AUTHZ_INSUFFICIENT_RBAC, 'Cannot link accounts for another user');
	}

	return currentUser._id;
}

async function createDirectedLink(
	ctx: MutationCtx,
	primaryUserId: Id<'users'>,
	linkedUserId: Id<'users'>,
	linkType?: string
) {
	if (await linkExists(ctx, primaryUserId, linkedUserId)) {
		return;
	}

	await ctx.db.insert('accountLinks', {
		primaryUserId,
		linkedUserId,
		linkType,
		verifiedAt: Date.now(),
		createdAt: Date.now()
	});
}

async function createBidirectionalLink(
	ctx: MutationCtx,
	primaryUserId: Id<'users'>,
	linkedUserId: Id<'users'>,
	linkType?: string
) {
	await createDirectedLink(ctx, primaryUserId, linkedUserId, linkType);
	await createDirectedLink(ctx, linkedUserId, primaryUserId, linkType);
}

export const addAccountLink = mutation({
	args: {
		primaryUserId: v.id('users'),
		linkedUserId: v.id('users'),
		linkType: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		await requireLinkOwner(ctx, args.primaryUserId);
		await ensureLinkable(ctx, args.primaryUserId, args.linkedUserId);
		await createBidirectionalLink(
			ctx,
			args.primaryUserId,
			args.linkedUserId,
			args.linkType ?? undefined
		);

		return { success: true };
	}
});

export const removeAccountLink = mutation({
	args: {
		sessionId: v.string(),
		targetUserId: v.id('users')
	},
	handler: async (ctx, args) => {
		const currentUserId = await requireSessionUserId(ctx, args.sessionId);
		if (currentUserId === args.targetUserId) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Cannot unlink your own account');
		}

		await removeBidirectionalLink(ctx, currentUserId, args.targetUserId);
		return { success: true };
	}
});

export const validateAccountLink = query({
	args: {
		primaryUserId: v.id('users'),
		linkedUserId: v.id('users')
	},
	handler: async (ctx, args) => {
		const exists = await linkExists(ctx, args.primaryUserId, args.linkedUserId);
		return { linked: exists };
	}
});

export const listLinkedAccounts = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		const userId = await requireSessionUserId(ctx, args.sessionId);
		return await listLinked(ctx, userId);
	}
});

async function ensureLinkable(
	ctx: MutationCtx,
	primaryUserId: Id<'users'>,
	linkedUserId: Id<'users'>
) {
	if (primaryUserId === linkedUserId) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Cannot link the same account');
	}

	const primary = await ctx.db.get(primaryUserId);
	const linked = await ctx.db.get(linkedUserId);
	if (!primary || !linked) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'One or both accounts no longer exist');
	}

	const existingLinks = await ctx.db
		.query('accountLinks')
		.withIndex('by_primary', (q) => q.eq('primaryUserId', primaryUserId))
		.collect();
	if (existingLinks.length >= MAX_TOTAL_ACCOUNTS - 1) {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			`Cannot link more than ${MAX_TOTAL_ACCOUNTS} accounts`
		);
	}

	const wouldExceedDepth = await checkLinkDepth(ctx, primaryUserId, linkedUserId);
	if (wouldExceedDepth) {
		throw createError(
			ErrorCodes.GENERIC_ERROR,
			`Cannot link accounts: would exceed maximum depth of ${MAX_LINK_DEPTH} or account limit of ${MAX_TOTAL_ACCOUNTS}`
		);
	}
}

async function removeBidirectionalLink(
	ctx: MutationCtx,
	currentUserId: Id<'users'>,
	targetUserId: Id<'users'>
) {
	const targetUser = await ctx.db.get(targetUserId);
	if (!targetUser) {
		throw createError(ErrorCodes.GENERIC_ERROR, 'Target account no longer exists');
	}

	const link1 = await ctx.db
		.query('accountLinks')
		.withIndex('by_primary', (q) => q.eq('primaryUserId', currentUserId))
		.filter((q) => q.eq(q.field('linkedUserId'), targetUserId))
		.first();
	if (link1) {
		await ctx.db.delete(link1._id);
	}

	const link2 = await ctx.db
		.query('accountLinks')
		.withIndex('by_primary', (q) => q.eq('primaryUserId', targetUserId))
		.filter((q) => q.eq(q.field('linkedUserId'), currentUserId))
		.first();
	if (link2) {
		await ctx.db.delete(link2._id);
	}
}

async function listLinked(ctx: QueryCtx, userId: Id<'users'>) {
	const links = await ctx.db
		.query('accountLinks')
		.withIndex('by_primary', (q) => q.eq('primaryUserId', userId))
		.collect();

	const results: {
		userId: Id<'users'>;
		email: string | null;
		name: string | null;
		firstName: string | null;
		lastName: string | null;
		linkType: string | null;
		verifiedAt: number;
	}[] = [];

	for (const link of links) {
		const user = await ctx.db.get(link.linkedUserId);
		if (!user) continue;

		results.push({
			userId: link.linkedUserId,
			email: user.email ?? null,
			name: user.name ?? null,
			firstName: user.firstName ?? null,
			lastName: user.lastName ?? null,
			linkType: link.linkType ?? null,
			verifiedAt: link.verifiedAt
		});
	}

	return results;
}

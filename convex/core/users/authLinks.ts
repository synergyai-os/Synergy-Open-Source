import { v } from 'convex/values';
import { mutation, query } from '../../_generated/server';
import type { MutationCtx, QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import { checkLinkDepth, linkExists, MAX_LINK_DEPTH, MAX_TOTAL_ACCOUNTS } from './validation';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';

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
		sessionId: v.string(),
		targetUserId: v.id('users'),
		linkType: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await ensureLinkable(ctx, userId, args.targetUserId);
		await createBidirectionalLink(ctx, userId, args.targetUserId, args.linkType ?? undefined);

		return { success: true };
	}
});

export const linkAccounts = mutation({
	args: {
		sessionId: v.string(),
		targetUserId: v.id('users'),
		linkType: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await ensureLinkable(ctx, userId, args.targetUserId);
		await createBidirectionalLink(ctx, userId, args.targetUserId, args.linkType ?? undefined);
		return { success: true };
	}
});

export const removeAccountLink = mutation({
	args: {
		sessionId: v.string(),
		targetUserId: v.id('users')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		if (userId === args.targetUserId) {
			throw createError(ErrorCodes.GENERIC_ERROR, 'Cannot unlink your own account');
		}

		await removeBidirectionalLink(ctx, userId, args.targetUserId);
		return { success: true };
	}
});

export const unlinkAccounts = mutation({
	args: {
		sessionId: v.string(),
		targetUserId: v.id('users')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await removeBidirectionalLink(ctx, userId, args.targetUserId);
		return { success: true };
	}
});

export const validateAccountLink = query({
	args: {
		sessionId: v.string(),
		targetUserId: v.id('users')
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		const exists = await linkExists(ctx, userId, args.targetUserId);
		return { linked: exists };
	}
});

export const listLinkedAccounts = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return await listLinked(ctx, userId);
	}
});

async function ensureLinkable(
	ctx: MutationCtx,
	ownerUserId: Id<'users'>,
	targetUserId: Id<'users'>
) {
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

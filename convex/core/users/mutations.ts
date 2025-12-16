import { v } from 'convex/values';
import { mutation } from '../../_generated/server';
import type { Doc, MutationCtx, QueryCtx } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import {
	calculateProfileName,
	checkLinkDepth,
	ensureLinkable,
	linkExists,
	requireProfilePermission
} from './rules';
import { MAX_LINK_DEPTH, MAX_TOTAL_ACCOUNTS } from './constants';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';

// ============================================================================
// User Lifecycle Mutations
// ============================================================================

export const syncUserFromWorkOS = mutation({
	args: {
		sessionId: v.optional(v.string()),
		workosId: v.string(),
		email: v.string(),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		emailVerified: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		if (args.sessionId) {
			await validateSessionAndGetUserId(ctx, args.sessionId);
		}

		return upsertWorkosUser(ctx, {
			...args,
			emailVerified: args.emailVerified ?? true
		});
	}
});

export const ensureWorkosUser = mutation({
	args: {
		sessionId: v.optional(v.string()),
		workosId: v.string(),
		email: v.string(),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		emailVerified: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		if (args.sessionId) {
			await validateSessionAndGetUserId(ctx, args.sessionId);
		}
		return upsertWorkosUser(ctx, args);
	}
});

export const updateUserProfile = mutation({
	args: {
		sessionId: v.string(),
		targetUserId: v.id('users'),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		profileImageUrl: v.optional(v.string())
	},
	handler: async (ctx, args) => updateProfile(ctx, args)
});

// ============================================================================
// Account Linking Mutations
// ============================================================================

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

// ============================================================================
// Internal Helpers
// ============================================================================

async function upsertWorkosUser(
	ctx: MutationCtx,
	args: {
		workosId: string;
		email: string;
		firstName?: string | null;
		lastName?: string | null;
		emailVerified?: boolean;
	}
): Promise<Id<'users'>> {
	const identity = await ctx.auth.getUserIdentity();
	if (identity && identity.subject !== args.workosId) {
		throw createError(ErrorCodes.AUTH_REQUIRED, 'Not authenticated');
	}

	const existingUser = await ctx.db
		.query('users')
		.withIndex('by_workos_id', (q) => q.eq('workosId', args.workosId))
		.first();

	const now = Date.now();
	const name = calculateProfileName(args.firstName, args.lastName);

	if (existingUser) {
		await ctx.db.patch(existingUser._id, {
			email: args.email,
			firstName: args.firstName,
			lastName: args.lastName,
			name,
			emailVerified: args.emailVerified ?? true,
			updatedAt: now,
			lastLoginAt: now
		});
		return existingUser._id;
	}

	return await ctx.db.insert('users', {
		workosId: args.workosId,
		email: args.email,
		firstName: args.firstName,
		lastName: args.lastName,
		name,
		emailVerified: args.emailVerified ?? true,
		createdAt: now,
		updatedAt: now,
		lastLoginAt: now
	});
}

async function updateProfile(
	ctx: MutationCtx,
	args: {
		sessionId: string;
		targetUserId: Id<'users'>;
		firstName?: string | null;
		lastName?: string | null;
		profileImageUrl?: string | null;
	}
): Promise<{ success: true }> {
	await requireProfilePermission(ctx, args.sessionId, args.targetUserId);

	const updates: Partial<Doc<'users'>> & { updatedAt: number } = {
		updatedAt: Date.now()
	};

	if (args.firstName !== undefined) {
		updates.firstName = args.firstName;
	}

	if (args.lastName !== undefined) {
		updates.lastName = args.lastName;
	}

	if (args.profileImageUrl !== undefined) {
		updates.profileImageUrl = args.profileImageUrl;
	}

	if (args.firstName !== undefined || args.lastName !== undefined) {
		const user = await ctx.db.get(args.targetUserId);
		updates.name = calculateProfileName(
			args.firstName ?? user?.firstName,
			args.lastName ?? user?.lastName
		);
	}

	await ctx.db.patch(args.targetUserId, updates);

	return { success: true };
}

async function createDirectedLink(
	ctx: MutationCtx,
	primaryUserId: Id<'users'>,
	linkedUserId: Id<'users'>,
	linkType?: string
): Promise<void> {
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
): Promise<void> {
	await createDirectedLink(ctx, primaryUserId, linkedUserId, linkType);
	await createDirectedLink(ctx, linkedUserId, primaryUserId, linkType);
}

async function removeBidirectionalLink(
	ctx: MutationCtx,
	currentUserId: Id<'users'>,
	targetUserId: Id<'users'>
): Promise<void> {
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


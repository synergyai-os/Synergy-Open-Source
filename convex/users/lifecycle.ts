import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import type { Doc } from '../_generated/dataModel';
import { requireProfilePermission } from './access';
import { calculateProfileName } from './profile';
import { createError, ErrorCodes } from '../infrastructure/errors/codes';

export const ensureWorkosUser = mutation({
	args: {
		workosId: v.string(),
		email: v.string(),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		emailVerified: v.optional(v.boolean())
	},
	handler: async (ctx, args) => upsertWorkosUser(ctx, args)
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

async function upsertWorkosUser(
	ctx: Parameters<typeof ensureWorkosUser.handler>[0],
	args: Parameters<typeof ensureWorkosUser.handler>[1]
) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity || identity.subject !== args.workosId) {
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
	ctx: Parameters<typeof updateUserProfile.handler>[0],
	args: Parameters<typeof updateUserProfile.handler>[1]
) {
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

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { getAuthUserId } from './auth';
import { validateSession } from './sessionValidation';
import { requirePermission } from './rbac/permissions';

/**
 * Sync user from WorkOS to Convex database
 * Called during OAuth callback after WorkOS authentication
 *
 * Creates new user if doesn't exist, updates if exists
 * Returns the Convex userId for session storage
 */
export const syncUserFromWorkOS = mutation({
	args: {
		workosId: v.string(),
		email: v.string(),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		emailVerified: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		// Check if user already exists
		const existingUser = await ctx.db
			.query('users')
			.withIndex('by_workos_id', (q) => q.eq('workosId', args.workosId))
			.first();

		const now = Date.now();

		// Compute full name from firstName and lastName
		const name =
			args.firstName && args.lastName
				? `${args.firstName} ${args.lastName}`
				: args.firstName || args.lastName || undefined;

		if (existingUser) {
			// User exists - update their data and last login time
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
		} else {
			// New user - create record
			const userId = await ctx.db.insert('users', {
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

			return userId;
		}
	}
});

/**
 * Get user by Convex ID
 * Used to fetch user profile data
 */
export const getUserById = query({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.userId);
	}
});

/**
 * Get user by WorkOS ID
 * Used for admin lookups and debugging
 */
export const getUserByWorkosId = query({
	args: { workosId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('users')
			.withIndex('by_workos_id', (q) => q.eq('workosId', args.workosId))
			.first();
	}
});

/**
 * Get current authenticated user
 * This will work after Convex auth is properly set up
 * For now, returns null (auth context not yet configured)
 */
/**
 * Get current user by userId
 * 
 * TODO: Once WorkOS adds 'aud' claim to password auth tokens, migrate to JWT-based auth
 * and use ctx.auth.getUserIdentity() instead
 */
export const getCurrentUser = query({
	args: {
		userId: v.id('users') // Required: passed from authenticated SvelteKit session
	},
	handler: async (ctx, args) => {
		// Validate session (prevents impersonation)
		await validateSession(ctx, args.userId);
		
		// Return user record
		return await ctx.db.get(args.userId);
	}
});

/**
 * Update user profile
 * Requires "users.manage-profile" permission
 * Users can edit their own profile (scope: "own")
 * Admins can edit any profile (scope: "all")
 */
export const updateUserProfile = mutation({
	args: {
		targetUserId: v.id('users'),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		profileImageUrl: v.optional(v.string()),
		userId: v.optional(v.id('users')) // TODO: Remove once Convex auth context is set up
	},
	handler: async (ctx, args) => {
		// Try explicit userId first (client passes it), fallback to auth context
		const userId = args.userId ?? (await getAuthUserId(ctx));
		if (!userId) {
			throw new Error('Not authenticated');
		}

		// RBAC Permission Check: Check "users.manage-profile" permission
		// Users can edit their own profile
		// Admins can edit any profile
		await requirePermission(ctx, userId, 'users.manage-profile', {
			resourceOwnerId: args.targetUserId // Target user is the "owner" of their profile
		});

		const updates: any = {
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

		// Update computed name field if firstName or lastName changed
		if (args.firstName !== undefined || args.lastName !== undefined) {
			const user = await ctx.db.get(args.targetUserId);
			const firstName = args.firstName ?? user?.firstName;
			const lastName = args.lastName ?? user?.lastName;

			updates.name =
				firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || undefined;
		}

		await ctx.db.patch(args.targetUserId, updates);

		return { success: true };
	}
});

async function linkExists(
	ctx: MutationCtx | QueryCtx,
	primaryUserId: Id<'users'>,
	linkedUserId: Id<'users'>
): Promise<boolean> {
	// Same user = always linked
	if (primaryUserId === linkedUserId) {
		return true;
	}

	// Use BFS to find transitive links (A→B→C allows A to switch to C)
	const visited = new Set<string>();
	const queue: Id<'users'>[] = [primaryUserId];

	while (queue.length > 0) {
		const currentUserId = queue.shift()!;

		if (visited.has(currentUserId)) {
			continue;
		}
		visited.add(currentUserId);

		// Check direct links from current user
		const links = await ctx.db
			.query('accountLinks')
			.withIndex('by_primary', (q) => q.eq('primaryUserId', currentUserId))
			.collect();

		for (const link of links) {
			if (link.linkedUserId === linkedUserId) {
				return true; // Found the target!
			}
			// Add to queue to check transitive links
			if (!visited.has(link.linkedUserId)) {
				queue.push(link.linkedUserId);
			}
		}
	}

	return false;
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

export const linkAccounts = mutation({
	args: {
		primaryUserId: v.id('users'),
		linkedUserId: v.id('users'),
		linkType: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		if (args.primaryUserId === args.linkedUserId) {
			throw new Error('Cannot link the same account');
		}

		// Ensure both users exist
		const primary = await ctx.db.get(args.primaryUserId);
		const linked = await ctx.db.get(args.linkedUserId);

		if (!primary || !linked) {
			throw new Error('One or both accounts no longer exist');
		}

		await createDirectedLink(ctx, args.primaryUserId, args.linkedUserId, args.linkType ?? undefined);
		await createDirectedLink(ctx, args.linkedUserId, args.primaryUserId, args.linkType ?? undefined);

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
	args: {
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const links = await ctx.db
			.query('accountLinks')
			.withIndex('by_primary', (q) => q.eq('primaryUserId', args.userId))
			.collect();

		const results = [];

		for (const link of links) {
			const user = await ctx.db.get(link.linkedUserId);
			if (!user) continue;

			results.push({
				userId: link.linkedUserId,
				email: (user as any).email ?? null,
				name: (user as any).name ?? null,
				firstName: (user as any).firstName ?? null,
				lastName: (user as any).lastName ?? null,
				linkType: link.linkType ?? null,
				verifiedAt: link.verifiedAt
			});
		}

		return results;
	}
});

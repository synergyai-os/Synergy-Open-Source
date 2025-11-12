import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { getAuthUserId } from './auth';
import { validateSession, validateSessionAndGetUserId } from './sessionValidation';
import { requirePermission } from './rbac/permissions';

/**
 * Account Linking Limits
 * 
 * These limits prevent DoS attacks via circular account links
 * and keep query costs reasonable.
 * 
 * MAX_LINK_DEPTH: Maximum number of hops in BFS traversal
 * - A→B→C→D = 3 hops (acceptable)
 * - A→B→C→D→E = 4 hops (rejected)
 * 
 * MAX_TOTAL_ACCOUNTS: Maximum accounts a user can have linked
 * - Prevents abuse (1000s of linked accounts)
 * - Matches industry standard (Slack: ~5-10)
 * 
 * RATIONALE:
 * - Slack uses depth=3 for workspace switching
 * - 99% of users have ≤3 email addresses
 * - Performance: O(N) where N ≤ 10 (acceptable)
 */
const MAX_LINK_DEPTH = 3;
const MAX_TOTAL_ACCOUNTS = 10;

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
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		return await ctx.db.get(userId);
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
		sessionId: v.string() // Session validation (derives userId securely)
	},
	handler: async (ctx, args) => {
		// Validate session and get userId (prevents impersonation)
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		
		// Return user record
		return await ctx.db.get(userId);
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

/**
 * Check if two users are linked (directly or transitively)
 * 
 * Uses BFS with depth and account limits to prevent abuse.
 * 
 * @param ctx - Query or mutation context
 * @param primaryUserId - Starting user
 * @param linkedUserId - Target user to check
 * @returns true if linked (within depth limit), false otherwise
 * 
 * Examples:
 * - A→B: linkExists(A, B) = true (depth 1)
 * - A→B→C: linkExists(A, C) = true (depth 2)
 * - A→B→C→D: linkExists(A, D) = true (depth 3)
 * - A→B→C→D→E: linkExists(A, E) = false (depth 4, exceeds limit)
 */
async function linkExists(
	ctx: MutationCtx | QueryCtx,
	primaryUserId: Id<'users'>,
	linkedUserId: Id<'users'>
): Promise<boolean> {
	// Same user = always linked
	if (primaryUserId === linkedUserId) {
		return true;
	}

	// BFS with depth and account limits
	const visited = new Set<string>();
	const queue: Array<{ userId: Id<'users'>; depth: number }> = [
		{ userId: primaryUserId, depth: 0 }
	];

	while (queue.length > 0) {
		const current = queue.shift()!;

		// Check depth limit
		if (current.depth >= MAX_LINK_DEPTH) {
			continue; // Skip this branch, but continue with others
		}

		// Check if we've seen this user before (prevent cycles)
		if (visited.has(current.userId)) {
			continue;
		}
		visited.add(current.userId);

		// Check account limit (prevent abuse)
		if (visited.size > MAX_TOTAL_ACCOUNTS) {
			console.warn(`User ${primaryUserId} has too many linked accounts (>${MAX_TOTAL_ACCOUNTS})`);
			return false; // Reject the entire link graph (suspicious)
		}

		// Get all direct links from current user
		const links = await ctx.db
			.query('accountLinks')
			.withIndex('by_primary', (q) => q.eq('primaryUserId', current.userId))
			.collect();

		for (const link of links) {
			// Found the target!
			if (link.linkedUserId === linkedUserId) {
				return true;
			}

			// Add to queue for next depth level
			if (!visited.has(link.linkedUserId)) {
				queue.push({
					userId: link.linkedUserId,
					depth: current.depth + 1
				});
			}
		}
	}

	return false; // Not linked within depth limit
}

/**
 * Get all transitively linked accounts up to max depth
 * 
 * Used to validate link graphs before creating new links.
 */
async function getTransitiveLinks(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	maxDepth: number
): Promise<Set<Id<'users'>>> {
	const visited = new Set<Id<'users'>>();
	const queue: Array<{ userId: Id<'users'>; depth: number }> = [{ userId, depth: 0 }];

	while (queue.length > 0) {
		const current = queue.shift()!;

		// Skip if already visited
		if (visited.has(current.userId)) {
			continue;
		}
		
		// Always add to visited set (even at maxDepth) to count the node
		visited.add(current.userId);

		// Stop exploring further if at max depth
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

/**
 * Check if creating a link would exceed depth or account limit
 * 
 * This is a dry-run validation before creating the link.
 * 
 * @returns true if link would exceed limits, false if safe to create
 */
async function checkLinkDepth(
	ctx: QueryCtx | MutationCtx,
	userId1: Id<'users'>,
	userId2: Id<'users'>
): Promise<boolean> {
	// Get all accounts linked to user1
	const user1Links = await getTransitiveLinks(ctx, userId1, MAX_LINK_DEPTH);

	// Get all accounts linked to user2
	const user2Links = await getTransitiveLinks(ctx, userId2, MAX_LINK_DEPTH);

	// If combined set > MAX_TOTAL_ACCOUNTS, reject
	const combined = new Set([...user1Links, ...user2Links, userId1, userId2]);

	return combined.size > MAX_TOTAL_ACCOUNTS;
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

		// Check if linking would exceed account limit
		const existingLinks = await ctx.db
			.query('accountLinks')
			.withIndex('by_primary', (q) => q.eq('primaryUserId', args.primaryUserId))
			.collect();

		if (existingLinks.length >= MAX_TOTAL_ACCOUNTS - 1) {
			throw new Error(`Cannot link more than ${MAX_TOTAL_ACCOUNTS} accounts`);
		}

		// Check if linking would create too-deep chain or exceed account limit
		const wouldExceedDepth = await checkLinkDepth(ctx, args.primaryUserId, args.linkedUserId);
		if (wouldExceedDepth) {
			throw new Error(`Cannot link accounts: would exceed maximum depth of ${MAX_LINK_DEPTH} or account limit of ${MAX_TOTAL_ACCOUNTS}`);
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

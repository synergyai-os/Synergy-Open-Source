/**
 * Feature Flags - Convex Backend
 *
 * Provides server-side feature flag evaluation with support for:
 * - User-based targeting
 * - Percentage-based rollouts
 * - Domain-based access (e.g., team members only)
 * - A/B testing preparation
 */

import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';

/**
 * Check if a feature flag is enabled for a specific user
 *
 * Evaluation order:
 * 1. If flag doesn't exist or is disabled globally → false
 * 2. If user is in allowedUserIds → true
 * 3. If user email is in allowedDomains → true
 * 4. If rolloutPercentage is set → check user's bucket
 * 5. Otherwise → follow global enabled setting
 */
export const checkFlag = query({
	args: {
		flag: v.string(),
		userId: v.optional(v.id('users'))
	},
	handler: async (ctx, { flag, userId }) => {
		// Get flag configuration
		const flagConfig = await ctx.db
			.query('featureFlags')
			.withIndex('by_flag', (q) => q.eq('flag', flag))
			.first();

		// If flag doesn't exist, default to disabled
		if (!flagConfig) {
			return false;
		}

		// If globally disabled, return false immediately
		if (!flagConfig.enabled) {
			return false;
		}

		// If no user context, return global setting
		if (!userId) {
			return flagConfig.enabled;
		}

		// Get user for additional checks
		const user = await ctx.db.get(userId);
		if (!user) {
			return false;
		}

		// Check if user is explicitly allowed
		if (flagConfig.allowedUserIds?.includes(userId)) {
			return true;
		}

		// Check domain-based access
		if (user.email && flagConfig.allowedDomains?.length) {
			const emailDomain = user.email.split('@')[1];
			const isAllowed = flagConfig.allowedDomains.some(
				(domain) => domain.replace('@', '').toLowerCase() === emailDomain.toLowerCase()
			);
			if (isAllowed) {
				return true;
			}
		}

		// Check percentage-based rollout
		if (flagConfig.rolloutPercentage !== undefined) {
			// Use consistent hashing so same user always gets same result
			const bucket = getUserRolloutBucket(userId, flag);
			return bucket < flagConfig.rolloutPercentage;
		}

		// Default to global enabled setting
		return flagConfig.enabled;
	}
});

/**
 * List all feature flags (admin only)
 */
export const listFlags = query({
	args: {},
	handler: async (ctx) => {
		// TODO: Add admin permission check
		// const identity = await ctx.auth.getUserIdentity();
		// if (!identity || !isAdmin(identity)) throw new Error('Unauthorized');

		return await ctx.db.query('featureFlags').collect();
	}
});

/**
 * Get a specific feature flag configuration
 */
export const getFlag = query({
	args: { flag: v.string() },
	handler: async (ctx, { flag }) => {
		return await ctx.db
			.query('featureFlags')
			.withIndex('by_flag', (q) => q.eq('flag', flag))
			.first();
	}
});

/**
 * Create or update a feature flag
 */
export const upsertFlag = mutation({
	args: {
		flag: v.string(),
		enabled: v.boolean(),
		rolloutPercentage: v.optional(v.number()),
		allowedUserIds: v.optional(v.array(v.id('users'))),
		allowedDomains: v.optional(v.array(v.string()))
	},
	handler: async (ctx, args) => {
		// TODO: Add admin permission check
		// const identity = await ctx.auth.getUserIdentity();
		// if (!identity || !isAdmin(identity)) throw new Error('Unauthorized');

		const existing = await ctx.db
			.query('featureFlags')
			.withIndex('by_flag', (q) => q.eq('flag', args.flag))
			.first();

		const now = Date.now();

		if (existing) {
			// Update existing flag
			await ctx.db.patch(existing._id, {
				enabled: args.enabled,
				rolloutPercentage: args.rolloutPercentage,
				allowedUserIds: args.allowedUserIds,
				allowedDomains: args.allowedDomains,
				updatedAt: now
			});
			return existing._id;
		} else {
			// Create new flag
			return await ctx.db.insert('featureFlags', {
				flag: args.flag,
				enabled: args.enabled,
				rolloutPercentage: args.rolloutPercentage,
				allowedUserIds: args.allowedUserIds,
				allowedDomains: args.allowedDomains,
				createdAt: now,
				updatedAt: now
			});
		}
	}
});

/**
 * Quick enable/disable a flag
 */
export const toggleFlag = mutation({
	args: {
		flag: v.string(),
		enabled: v.boolean()
	},
	handler: async (ctx, { flag, enabled }) => {
		// TODO: Add admin permission check

		const existing = await ctx.db
			.query('featureFlags')
			.withIndex('by_flag', (q) => q.eq('flag', flag))
			.first();

		if (!existing) {
			throw new Error(`Flag ${flag} not found`);
		}

		await ctx.db.patch(existing._id, {
			enabled,
			updatedAt: Date.now()
		});
	}
});

/**
 * Update rollout percentage
 */
export const updateRollout = mutation({
	args: {
		flag: v.string(),
		percentage: v.number()
	},
	handler: async (ctx, { flag, percentage }) => {
		// TODO: Add admin permission check

		if (percentage < 0 || percentage > 100) {
			throw new Error('Percentage must be between 0 and 100');
		}

		const existing = await ctx.db
			.query('featureFlags')
			.withIndex('by_flag', (q) => q.eq('flag', flag))
			.first();

		if (!existing) {
			throw new Error(`Flag ${flag} not found`);
		}

		await ctx.db.patch(existing._id, {
			rolloutPercentage: percentage,
			updatedAt: Date.now()
		});
	}
});

/**
 * Delete a feature flag (use sparingly - usually just disable instead)
 */
export const deleteFlag = mutation({
	args: { flag: v.string() },
	handler: async (ctx, { flag }) => {
		// TODO: Add admin permission check

		const existing = await ctx.db
			.query('featureFlags')
			.withIndex('by_flag', (q) => q.eq('flag', flag))
			.first();

		if (!existing) {
			throw new Error(`Flag ${flag} not found`);
		}

		await ctx.db.delete(existing._id);
	}
});

/**
 * Helper: Hash function for consistent percentage-based rollouts
 * Same user + same flag = same result every time
 */
function getUserRolloutBucket(userId: Id<'users'>, flag: string): number {
	let hash = 0;
	const str = `${userId}:${flag}`;

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	return Math.abs(hash) % 100;
}

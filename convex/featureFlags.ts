/**
 * Feature Flags - Convex Backend
 *
 * Provides server-side feature flag evaluation with support for:
 * - User-based targeting
 * - Percentage-based rollouts
 * - Domain-based access (e.g., team members only)
 * - A/B testing preparation
 * - PostHog analytics tracking
 */

import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { validateSessionAndGetUserId } from './sessionValidation';
import type { Id } from './_generated/dataModel';

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
		sessionId: v.string() // Required - follows sessionId pattern (#L1200)
	},
	handler: async (ctx, { flag, sessionId }) => {
		// CRITICAL: Must destructure to get userId (pattern #L1200, #L850)
		// If sessionId is invalid, validateSessionAndGetUserId will throw (correct behavior)
		const { userId } = await validateSessionAndGetUserId(ctx, sessionId);
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

		// Get user for additional checks
		const user = await ctx.db.get(userId);
		if (!user) {
			return false;
		}

		// Determine result based on targeting rules
		let result = false;

		// Check if targeting rules are configured
		// Empty arrays ([]) mean targeting is configured but restrictive → should return false
		// Only undefined/null means no targeting rules → can default to global enabled
		const hasTargetingRules =
			flagConfig.allowedUserIds !== undefined ||
			flagConfig.allowedOrganizationIds !== undefined ||
			flagConfig.allowedDomains !== undefined ||
			flagConfig.rolloutPercentage !== undefined;

		// Check if user is explicitly allowed
		if (flagConfig.allowedUserIds?.includes(userId)) {
			result = true;
		}
		// Check organization-based access
		else if (flagConfig.allowedOrganizationIds?.length) {
			// Get user's organizations
			const memberships = await ctx.db
				.query('organizationMembers')
				.withIndex('by_user', (q) => q.eq('userId', userId))
				.collect();

			const userOrgIds = memberships.map((m) => m.organizationId);
			const hasOrgAccess = flagConfig.allowedOrganizationIds.some((orgId) =>
				userOrgIds.includes(orgId)
			);

			if (hasOrgAccess) {
				result = true;
			}
		}
		// Check domain-based access
		else if (user.email && flagConfig.allowedDomains?.length) {
			const emailDomain = user.email.split('@')[1];
			const isAllowed = flagConfig.allowedDomains.some(
				(domain) => domain.replace('@', '').toLowerCase() === emailDomain.toLowerCase()
			);
			if (isAllowed) {
				result = true;
			}
		}
		// Check percentage-based rollout
		else if (flagConfig.rolloutPercentage !== undefined) {
			// Use consistent hashing so same user always gets same result
			const bucket = getUserRolloutBucket(userId, flag);
			result = bucket < flagConfig.rolloutPercentage;
		}
		// Only default to global enabled if NO targeting rules are configured
		// SECURITY: Default to false (secure by default) - require explicit configuration
		// If targeting rules exist but don't match, return false (secure by default)
		else if (!hasTargetingRules) {
			result = false; // Secure default - require explicit targeting configuration
		}
		// Targeting rules exist but user doesn't match → false (secure by default)
		else {
			result = false;
		}

		// Note: PostHog tracking happens client-side (queries are read-only)
		// See useFeatureFlag composable for tracking implementation

		return result;
	}
});

/**
 * Check multiple feature flags at once (batch query for performance)
 * Reduces network round trips and session validation overhead
 */
export const checkFlags = query({
	args: {
		flags: v.array(v.string()),
		sessionId: v.string() // Required - follows sessionId pattern (#L1200)
	},
	handler: async (ctx, { flags, sessionId }) => {
		// CRITICAL: Must destructure to get userId (pattern #L1200, #L850)
		// Validate session once for all flags
		const { userId } = await validateSessionAndGetUserId(ctx, sessionId);

		// Get user once if needed (for domain checks)
		const user = await ctx.db.get(userId);

		// Fetch all flag configs in parallel
		const flagConfigs = await Promise.all(
			flags.map((flag) =>
				ctx.db
					.query('featureFlags')
					.withIndex('by_flag', (q) => q.eq('flag', flag))
					.first()
			)
		);

		// Evaluate all flags
		const results: Record<string, boolean> = {};
		for (let i = 0; i < flags.length; i++) {
			const flag = flags[i];
			const flagConfig = flagConfigs[i];

			// If flag doesn't exist or is globally disabled, return false
			if (!flagConfig || !flagConfig.enabled) {
				results[flag] = false;
				continue;
			}

			// User is guaranteed to exist (sessionId is required, validateSessionAndGetUserId throws if invalid)
			if (!user) {
				results[flag] = false;
				continue;
			}

			// Determine result based on targeting rules (same logic as checkFlag)
			let result = false;

			// Check if targeting rules are configured
			// Empty arrays ([]) mean targeting is configured but restrictive → should return false
			// Only undefined/null means no targeting rules → can default to global enabled
			const hasTargetingRules =
				flagConfig.allowedUserIds !== undefined ||
				flagConfig.allowedOrganizationIds !== undefined ||
				flagConfig.allowedDomains !== undefined ||
				flagConfig.rolloutPercentage !== undefined;

			// Check if user is explicitly allowed
			if (flagConfig.allowedUserIds?.includes(userId)) {
				result = true;
			}
			// Check organization-based access
			else if (flagConfig.allowedOrganizationIds?.length) {
				// Get user's organizations (reuse query from checkFlag)
				const memberships = await ctx.db
					.query('organizationMembers')
					.withIndex('by_user', (q) => q.eq('userId', userId))
					.collect();

				const userOrgIds = memberships.map((m) => m.organizationId);
				const hasOrgAccess = flagConfig.allowedOrganizationIds.some((orgId) =>
					userOrgIds.includes(orgId)
				);

				if (hasOrgAccess) {
					result = true;
				}
			}
			// Check domain-based access
			else if (user.email && flagConfig.allowedDomains?.length) {
				const emailDomain = user.email.split('@')[1];
				const isAllowed = flagConfig.allowedDomains.some(
					(domain) => domain.replace('@', '').toLowerCase() === emailDomain.toLowerCase()
				);
				if (isAllowed) {
					result = true;
				}
			}
			// Check percentage-based rollout
			else if (flagConfig.rolloutPercentage !== undefined) {
				const bucket = getUserRolloutBucket(userId, flag);
				result = bucket < flagConfig.rolloutPercentage;
			}
			// Only default to global enabled if NO targeting rules are configured
			// SECURITY: Default to false (secure by default) - require explicit configuration
			// If targeting rules exist but don't match, return false (secure by default)
			else if (!hasTargetingRules) {
				result = false; // Secure default - require explicit targeting configuration
			}
			// Targeting rules exist but user doesn't match → false (secure by default)
			else {
				result = false;
			}

			results[flag] = result;
		}

		return results;
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
 * DEBUG: Get feature flag evaluation details for a user
 * This helps debug why flags are enabled/disabled for specific users
 */
export const debugFlagEvaluation = query({
	args: {
		flag: v.string(),
		sessionId: v.string()
	},
	handler: async (ctx, { flag, sessionId }) => {
		const { userId } = await validateSessionAndGetUserId(ctx, sessionId);
		const user = await ctx.db.get(userId);
		const flagConfig = await ctx.db
			.query('featureFlags')
			.withIndex('by_flag', (q) => q.eq('flag', flag))
			.first();

		if (!flagConfig) {
			return {
				flag,
				userId,
				userEmail: user?.email ?? null,
				flagExists: false,
				result: false,
				reason: 'Flag does not exist'
			};
		}

		if (!flagConfig.enabled) {
			return {
				flag,
				userId,
				userEmail: user?.email ?? null,
				flagExists: true,
				flagConfig: {
					enabled: flagConfig.enabled,
					allowedUserIds: flagConfig.allowedUserIds,
					allowedOrganizationIds: flagConfig.allowedOrganizationIds,
					allowedDomains: flagConfig.allowedDomains,
					rolloutPercentage: flagConfig.rolloutPercentage
				},
				result: false,
				reason: 'Flag is globally disabled'
			};
		}

		if (!user) {
			return {
				flag,
				userId,
				userEmail: null,
				flagExists: true,
				flagConfig: {
					enabled: flagConfig.enabled,
					allowedUserIds: flagConfig.allowedUserIds,
					allowedOrganizationIds: flagConfig.allowedOrganizationIds,
					allowedDomains: flagConfig.allowedDomains,
					rolloutPercentage: flagConfig.rolloutPercentage
				},
				result: false,
				reason: 'User not found'
			};
		}

		const hasTargetingRules =
			flagConfig.allowedUserIds !== undefined ||
			flagConfig.allowedOrganizationIds !== undefined ||
			flagConfig.allowedDomains !== undefined ||
			flagConfig.rolloutPercentage !== undefined;

		let result = false;
		let reason = '';

		// Check if user is explicitly allowed
		if (flagConfig.allowedUserIds?.includes(userId)) {
			result = true;
			reason = `User is in allowedUserIds`;
		}
		// Check organization-based access
		else if (flagConfig.allowedOrganizationIds?.length) {
			const memberships = await ctx.db
				.query('organizationMembers')
				.withIndex('by_user', (q) => q.eq('userId', userId))
				.collect();

			const userOrgIds = memberships.map((m) => m.organizationId);
			const hasOrgAccess = flagConfig.allowedOrganizationIds.some((orgId) =>
				userOrgIds.includes(orgId)
			);

			if (hasOrgAccess) {
				result = true;
				reason = `User is member of allowed organization`;
			} else {
				reason = `User is not member of any allowed organizations`;
			}
		}
		// Check domain-based access
		else if (user.email && flagConfig.allowedDomains?.length) {
			const emailDomain = user.email.split('@')[1];
			const isAllowed = flagConfig.allowedDomains.some(
				(domain) => domain.replace('@', '').toLowerCase() === emailDomain.toLowerCase()
			);
			if (isAllowed) {
				result = true;
				reason = `User email domain matches allowedDomains`;
			} else {
				reason = `User email domain ${emailDomain} does not match allowedDomains`;
			}
		}
		// Check percentage-based rollout
		else if (flagConfig.rolloutPercentage !== undefined) {
			const bucket = getUserRolloutBucket(userId, flag);
			result = bucket < flagConfig.rolloutPercentage;
			reason = `Rollout check: bucket ${bucket} < ${flagConfig.rolloutPercentage}% = ${result}`;
		}
		// Only default to global enabled if NO targeting rules are configured
		// SECURITY: Default to false (secure by default) - require explicit configuration
		else if (!hasTargetingRules) {
			result = false; // Secure default - require explicit targeting configuration
			reason = `No targeting rules configured, defaulting to false (secure by default)`;
		}
		// Targeting rules exist but user doesn't match → false (secure by default)
		else {
			result = false;
			reason = `Targeting rules exist but user does not match`;
		}

		return {
			flag,
			userId,
			userEmail: user.email,
			flagExists: true,
			flagConfig: {
				enabled: flagConfig.enabled,
				allowedUserIds: flagConfig.allowedUserIds,
				allowedOrganizationIds: flagConfig.allowedOrganizationIds,
				allowedDomains: flagConfig.allowedDomains,
				rolloutPercentage: flagConfig.rolloutPercentage
			},
			hasTargetingRules,
			result,
			reason
		};
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
		allowedOrganizationIds: v.optional(v.array(v.id('organizations'))),
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
				allowedOrganizationIds: args.allowedOrganizationIds,
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
				allowedOrganizationIds: args.allowedOrganizationIds,
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

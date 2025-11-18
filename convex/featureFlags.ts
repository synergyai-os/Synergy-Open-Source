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
import { requireSystemAdmin } from './rbac/permissions';
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
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		return await ctx.db.query('featureFlags').collect();
	}
});

/**
 * List all organizations (admin only)
 * Used for organization targeting in feature flags
 */
export const listAllOrganizations = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const organizations = await ctx.db.query('organizations').collect();

		return organizations.map((org) => ({
			_id: org._id,
			name: org.name,
			slug: org.slug,
			createdAt: org.createdAt
		}));
	}
});

/**
 * Get impact statistics for feature flags (admin only)
 * Returns estimated user counts by targeting method
 */
export const getImpactStats = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		// Get total user count
		const allUsers = await ctx.db.query('users').collect();
		const totalUsers = allUsers.length;

		// Count users by domain
		const usersByDomain = new Map<string, number>();
		for (const user of allUsers) {
			const email = (user as unknown as { email?: string })?.email;
			if (email && email.includes('@')) {
				const domain = '@' + email.split('@')[1];
				usersByDomain.set(domain, (usersByDomain.get(domain) || 0) + 1);
			}
		}

		// Get all flags
		const flags = await ctx.db.query('featureFlags').collect();

		// Calculate impact for each flag
		const flagImpacts = flags.map((flag) => {
			let estimatedAffected = 0;
			const breakdown: {
				byDomain: number;
				byRollout: number;
				byUserIds: number;
				byOrgIds: number;
			} = {
				byDomain: 0,
				byRollout: 0,
				byUserIds: 0,
				byOrgIds: 0
			};

			if (!flag.enabled) {
				return {
					flag: flag.flag,
					enabled: false,
					estimatedAffected: 0,
					breakdown
				};
			}

			// Count by domain
			if (flag.allowedDomains?.length) {
				for (const domain of flag.allowedDomains) {
					breakdown.byDomain += usersByDomain.get(domain) || 0;
				}
			}

			// Count by user IDs
			if (flag.allowedUserIds?.length) {
				breakdown.byUserIds = flag.allowedUserIds.length;
			}

			// Count by organization IDs (estimate - would need to query org members)
			if (flag.allowedOrganizationIds?.length) {
				// Estimate: assume average 10 users per org (can be improved later)
				breakdown.byOrgIds = flag.allowedOrganizationIds.length * 10;
			}

			// Calculate rollout percentage
			if (flag.rolloutPercentage !== undefined) {
				// Estimate based on total users minus those already covered by other targeting
				const alreadyCovered = breakdown.byDomain + breakdown.byUserIds + breakdown.byOrgIds;
				const remainingUsers = Math.max(0, totalUsers - alreadyCovered);
				breakdown.byRollout = Math.round((remainingUsers * flag.rolloutPercentage) / 100);
			}

			// Total affected (union of all targeting methods)
			estimatedAffected = Math.max(
				breakdown.byDomain,
				breakdown.byUserIds,
				breakdown.byOrgIds,
				breakdown.byRollout
			);

			return {
				flag: flag.flag,
				enabled: flag.enabled,
				estimatedAffected,
				breakdown
			};
		});

		return {
			totalUsers,
			usersByDomain: Object.fromEntries(usersByDomain),
			flagImpacts
		};
	}
});

/**
 * Get flags affecting a specific user (admin only)
 */
export const getFlagsForUser = query({
	args: {
		sessionId: v.string(),
		userEmail: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		// Find user by email
		const user = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', args.userEmail.toLowerCase()))
			.first();

		if (!user) {
			return {
				userEmail: args.userEmail,
				userId: null,
				flags: []
			};
		}

		const userId = user._id;
		const userDomain = '@' + args.userEmail.split('@')[1];

		// Get all flags
		const allFlags = await ctx.db.query('featureFlags').collect();

		// Evaluate each flag for this user
		const flags = await Promise.all(
			allFlags.map(async (flag) => {
				let result = false;
				let reason = '';

				if (!flag.enabled) {
					return {
						flag: flag.flag,
						enabled: false,
						result: false,
						reason: 'Flag is disabled globally'
					};
				}

				// Check user ID targeting
				if (flag.allowedUserIds?.includes(userId)) {
					result = true;
					reason = 'User ID explicitly allowed';
				}
				// Check domain targeting
				else if (flag.allowedDomains?.includes(userDomain)) {
					result = true;
					reason = `Domain match (${userDomain})`;
				}
				// Check organization targeting
				else if (flag.allowedOrganizationIds?.length) {
					const memberships = await ctx.db
						.query('organizationMembers')
						.withIndex('by_user', (q) => q.eq('userId', userId))
						.collect();

					const userOrgIds = memberships.map((m) => m.organizationId);
					const hasOrgAccess = flag.allowedOrganizationIds.some((orgId) =>
						userOrgIds.includes(orgId)
					);

					if (hasOrgAccess) {
						result = true;
						reason = 'Organization membership match';
					}
				}

				// Check rollout percentage
				if (!result && flag.rolloutPercentage !== undefined) {
					const bucket = getUserRolloutBucket(userId, flag.flag);
					if (bucket < flag.rolloutPercentage) {
						result = true;
						reason = `${flag.rolloutPercentage}% rollout (hash match)`;
					} else {
						reason = `${flag.rolloutPercentage}% rollout (not in bucket)`;
					}
				}

				if (
					!result &&
					!flag.allowedUserIds &&
					!flag.allowedDomains &&
					!flag.allowedOrganizationIds &&
					flag.rolloutPercentage === undefined
				) {
					reason = 'No targeting rules configured';
				}

				return {
					flag: flag.flag,
					enabled: flag.enabled,
					result,
					reason
				};
			})
		);

		return {
			userEmail: args.userEmail,
			userId: userId,
			flags
		};
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
 * Create or update a feature flag (admin only)
 */
export const upsertFlag = mutation({
	args: {
		sessionId: v.string(),
		flag: v.string(),
		description: v.optional(v.string()),
		enabled: v.boolean(),
		rolloutPercentage: v.optional(v.number()),
		allowedUserIds: v.optional(v.array(v.id('users'))),
		allowedOrganizationIds: v.optional(v.array(v.id('organizations'))),
		allowedDomains: v.optional(v.array(v.string()))
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const existing = await ctx.db
			.query('featureFlags')
			.withIndex('by_flag', (q) => q.eq('flag', args.flag))
			.first();

		const now = Date.now();

		if (existing) {
			// Update existing flag
			await ctx.db.patch(existing._id, {
				description: args.description,
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
				description: args.description,
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
 * Quick enable/disable a flag (admin only)
 */
export const toggleFlag = mutation({
	args: {
		sessionId: v.string(),
		flag: v.string(),
		enabled: v.boolean()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const existing = await ctx.db
			.query('featureFlags')
			.withIndex('by_flag', (q) => q.eq('flag', args.flag))
			.first();

		if (!existing) {
			throw new Error(`Flag ${args.flag} not found`);
		}

		await ctx.db.patch(existing._id, {
			enabled: args.enabled,
			updatedAt: Date.now()
		});
	}
});

/**
 * Update rollout percentage (admin only)
 */
export const updateRollout = mutation({
	args: {
		sessionId: v.string(),
		flag: v.string(),
		percentage: v.number()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		if (args.percentage < 0 || args.percentage > 100) {
			throw new Error('Percentage must be between 0 and 100');
		}

		const existing = await ctx.db
			.query('featureFlags')
			.withIndex('by_flag', (q) => q.eq('flag', args.flag))
			.first();

		if (!existing) {
			throw new Error(`Flag ${args.flag} not found`);
		}

		await ctx.db.patch(existing._id, {
			rolloutPercentage: args.percentage,
			updatedAt: Date.now()
		});
	}
});

/**
 * Delete a feature flag (admin only, use sparingly - usually just disable instead)
 */
export const deleteFlag = mutation({
	args: {
		sessionId: v.string(),
		flag: v.string()
	},
	handler: async (ctx, args) => {
		await requireSystemAdmin(ctx, args.sessionId);

		const existing = await ctx.db
			.query('featureFlags')
			.withIndex('by_flag', (q) => q.eq('flag', args.flag))
			.first();

		if (!existing) {
			throw new Error(`Flag ${args.flag} not found`);
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

/**
 * Documentation 404 Tracking
 *
 * Tracks broken links in documentation to maintain documentation health.
 * Logs 404 errors and provides queries/mutations for viewing and resolving them.
 */

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';
import { validateSessionAndGetUserId } from '../infrastructure/sessionValidation';

/**
 * Log a 404 error for a documentation URL
 *
 * Allows anonymous logging (sessionId optional) for better tracking
 * AUTH EXEMPT: public docs analytics logging (session optional; used when available for audit)
 */
export const log404 = mutation({
	args: {
		sessionId: v.optional(v.string()),
		url: v.string(),
		referrer: v.optional(v.string()),
		userAgent: v.optional(v.string()),
		ipAddress: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		let userId: Id<'users'> | undefined = undefined;
		if (args.sessionId) {
			try {
				const derived = await validateSessionAndGetUserId(ctx, args.sessionId);
				userId = derived.userId;
			} catch {
				userId = undefined;
			}
		}

		const existing = await ctx.db
			.query('doc404Errors')
			.withIndex('by_url', (q) => q.eq('url', args.url))
			.filter((q) => q.eq(q.field('resolved'), false))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				count: existing.count + 1,
				lastSeenAt: now,
				referrer: args.referrer || existing.referrer,
				userAgent: args.userAgent || existing.userAgent,
				ipAddress: args.ipAddress || existing.ipAddress,
				sessionId: args.sessionId || existing.sessionId,
				userId: userId || existing.userId
			});
			return existing._id;
		}

		const id = await ctx.db.insert('doc404Errors', {
			url: args.url,
			referrer: args.referrer,
			userAgent: args.userAgent,
			ipAddress: args.ipAddress,
			userId,
			sessionId: args.sessionId,
			count: 1,
			firstSeenAt: now,
			lastSeenAt: now,
			resolved: false
		});
		return id;
	}
});

/**
 * Get all unresolved 404 errors, sorted by most recent
 */
export const listUnresolved = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);
		const errors = await ctx.db
			.query('doc404Errors')
			.withIndex('by_resolved', (q) => q.eq('resolved', false))
			.collect();

		// Sort by lastSeenAt descending (most recent first)
		return errors.sort((a, b) => b.lastSeenAt - a.lastSeenAt);
	}
});

/**
 * Get all 404 errors (including resolved), sorted by most recent
 */
export const listAll = query({
	args: {
		sessionId: v.string(),
		limit: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);
		const limit = args.limit || 100;
		const errors = await ctx.db
			.query('doc404Errors')
			.withIndex('by_last_seen', (q) => q.gte('lastSeenAt', 0))
			.collect();

		// Sort by lastSeenAt descending and take limit
		return errors.sort((a, b) => b.lastSeenAt - a.lastSeenAt).slice(0, limit);
	}
});

/**
 * Mark a 404 error as resolved
 *
 * SECURITY: Requires sessionId to authenticate user
 */
export const resolve404 = mutation({
	args: {
		sessionId: v.string(),
		id: v.id('doc404Errors'),
		note: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);

		await ctx.db.patch(args.id, {
			resolved: true,
			resolvedAt: Date.now(),
			resolvedBy: userId,
			resolutionNote: args.note
		});
	}
});

/**
 * Get statistics about 404 errors
 */
export const getStats = query({
	args: { sessionId: v.string() },
	handler: async (ctx, args) => {
		await validateSessionAndGetUserId(ctx, args.sessionId);
		const all = await ctx.db.query('doc404Errors').collect();
		const unresolved = all.filter((e) => !e.resolved);
		const resolved = all.filter((e) => e.resolved);

		return {
			total: all.length,
			unresolved: unresolved.length,
			resolved: resolved.length,
			totalHits: all.reduce((sum, e) => sum + e.count, 0),
			unresolvedHits: unresolved.reduce((sum, e) => sum + e.count, 0)
		};
	}
});

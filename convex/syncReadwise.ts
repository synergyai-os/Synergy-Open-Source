/**
 * Readwise Sync Orchestration
 *
 * Main sync function to fetch data from Readwise API and populate Axon database.
 * Handles normalization, duplicate prevention, and incremental sync.
 */

'use node';

import { action, internalAction } from './_generated/server';
import { v } from 'convex/values';
import { fetchReadwiseHighlightsHandler, withReadwiseSyncHandler } from './readwise/sync';

/**
 * Main sync function - fetches all Readwise data and populates database
 * Public action - called from UI
 */
export const fetchReadwiseHighlights = action({
	args: {
		sessionId: v.string(),
		// Time-based import
		dateRange: v.optional(
			v.union(
				v.literal('7d'),
				v.literal('30d'),
				v.literal('90d'),
				v.literal('180d'),
				v.literal('365d'),
				v.literal('all')
			)
		),
		// Custom date range
		customStartDate: v.optional(v.string()), // ISO 8601 date string
		customEndDate: v.optional(v.string()), // ISO 8601 date string
		// Quantity-based import
		quantity: v.optional(
			v.union(
				v.literal(5),
				v.literal(10),
				v.literal(25),
				v.literal(50),
				v.literal(100),
				v.literal(250),
				v.literal(500),
				v.literal(1000)
			)
		)
	},
	handler: (ctx, args) => fetchReadwiseHighlightsHandler(ctx, args)
});

/**
 * Internal sync action - does the actual work
 */
export const withReadwiseSync = internalAction({
	args: {
		userId: v.id('users'),
		apiKey: v.string(),
		updatedAfter: v.optional(v.string()), // ISO 8601 date string (overrides lastSyncAt if provided)
		updatedBefore: v.optional(v.string()), // ISO 8601 date string (for custom date ranges)
		limit: v.optional(v.number()) // Maximum number of highlights to import (for quantity-based)
	},
	handler: (ctx, args) => withReadwiseSyncHandler(ctx, args)
});

/**
 * Developer Tool: Clean Readwise Sync Data
 *
 * Deletes all Readwise-synced data to allow re-testing the sync process.
 * This includes:
 * - All inboxItems of type readwise_highlight
 * - All highlights
 * - All sources
 * - All sourceAuthors links
 * - All sourceTags links
 * - Orphaned authors (authors with no sources)
 * - Orphaned tags (tags with no sources or highlights)
 * - Resets lastReadwiseSyncAt timestamp
 *
 * Uses an action pattern that calls internal mutations in tiny batches to avoid read limits.
 * Each batch processes only 5 items at a time to stay well under the 4096 read limit.
 */

import { action, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import type { Doc } from './_generated/dataModel';
import { v } from 'convex/values';

// Internal mutation to delete a batch of inbox items
export const deleteInboxItemsBatch = internalMutation({
	args: {
		itemIds: v.array(v.id('inboxItems'))
	},
	handler: async (ctx, args) => {
		for (const id of args.itemIds) {
			await ctx.db.delete(id);
		}
		return args.itemIds.length;
	}
});

// Internal mutation to delete multiple highlights and their tags
export const deleteHighlightBatch = internalMutation({
	args: {
		highlightIds: v.array(v.id('highlights'))
	},
	handler: async (ctx, args) => {
		const results: Array<{ sourceId: string; tagIds: string[] }> = [];

		for (const highlightId of args.highlightIds) {
			const highlight = await ctx.db.get(highlightId);
			if (!highlight) continue;

			// Get and delete highlightTags
			const tags = await ctx.db
				.query('highlightTags')
				.withIndex('by_highlight', (q) => q.eq('highlightId', highlightId))
				.collect();

			const tagIds: string[] = [];
			for (const link of tags) {
				tagIds.push(link.tagId);
				await ctx.db.delete(link._id);
			}

			await ctx.db.delete(highlightId);

			results.push({
				sourceId: highlight.sourceId,
				tagIds
			});
		}

		return {
			deleted: results.length,
			results
		};
	}
});

// Internal mutation to delete multiple sources and their junction links
export const deleteSourceBatch = internalMutation({
	args: {
		sourceIds: v.array(v.id('sources'))
	},
	handler: async (ctx, args) => {
		const results: Array<{ authorIds: string[]; tagIds: string[] }> = [];

		for (const sourceId of args.sourceIds) {
			const source = await ctx.db.get(sourceId);
			if (!source) continue;

			const authorIds: string[] = [source.authorId];
			const tagIds: string[] = [];

			// Delete sourceAuthors links
			const sourceAuthors = await ctx.db
				.query('sourceAuthors')
				.withIndex('by_source', (q) => q.eq('sourceId', sourceId))
				.collect();
			for (const link of sourceAuthors) {
				authorIds.push(link.authorId);
				await ctx.db.delete(link._id);
			}

			// Delete sourceTags links
			const sourceTags = await ctx.db
				.query('sourceTags')
				.withIndex('by_source', (q) => q.eq('sourceId', sourceId))
				.collect();
			for (const link of sourceTags) {
				tagIds.push(link.tagId);
				await ctx.db.delete(link._id);
			}

			await ctx.db.delete(sourceId);

			results.push({ authorIds, tagIds });
		}

		return {
			deleted: results.length,
			results
		};
	}
});

// Internal mutation to delete a batch of authors
export const deleteAuthorsBatch = internalMutation({
	args: {
		userId: v.id('users'),
		limit: v.number()
	},
	handler: async (ctx, args) => {
		const authors = await ctx.db
			.query('authors')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.take(args.limit);

		for (const author of authors) {
			await ctx.db.delete(author._id);
		}

		return {
			deleted: authors.length,
			hasMore: authors.length === args.limit
		};
	}
});

// Internal mutation to delete a batch of tags
export const deleteTagsBatch = internalMutation({
	args: {
		userId: v.id('users'),
		limit: v.number()
	},
	handler: async (ctx, args) => {
		const tags = await ctx.db
			.query('tags')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.take(args.limit);

		for (const tag of tags) {
			await ctx.db.delete(tag._id);
		}

		return {
			deleted: tags.length,
			hasMore: tags.length === args.limit
		};
	}
});

// Main action that orchestrates the cleanup
export const cleanReadwiseData = action({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await ctx.runQuery(internal.settings.getUserIdFromSessionId, {
			sessionId: args.sessionId
		});
		if (!userId) {
			throw new Error('Not authenticated');
		}

		console.log(`[cleanReadwiseData] Starting cleanup for user ${userId}`);

		// Step 1: Delete inbox items in batches
		console.log(`[cleanReadwiseData] Deleting inbox items...`);
		let inboxItemsDeleted = 0;
		const batchSize = 10;

		while (true) {
			const inboxItems = (await ctx.runQuery(internal.readwiseCleanup.listInboxItems, {
				userId,
				limit: batchSize
			})) as Array<Doc<'inboxItems'>>;

			if (inboxItems.length === 0) break;

			const itemIds = inboxItems.map((item) => item._id);
			const deleted = (await ctx.runMutation(internal.readwiseCleanup.deleteInboxItemsBatch, {
				itemIds
			})) as number;
			inboxItemsDeleted += deleted;
		}

		console.log(`[cleanReadwiseData] Deleted ${inboxItemsDeleted} inbox items`);

		// Step 2: Delete highlights in batches
		console.log(`[cleanReadwiseData] Processing highlights...`);
		let highlightsDeleted = 0;
		let highlightTagsDeleted = 0;
		const allTagIds = new Set<string>();
		const allSourceIds = new Set<string>();
		let batchCount = 0;

		while (true) {
			const highlights = (await ctx.runQuery(internal.readwiseCleanup.listHighlights, {
				userId,
				limit: 20 // Process 20 at a time
			})) as Array<Doc<'highlights'>>;

			if (highlights.length === 0) break;

			batchCount++;
			console.log(
				`[cleanReadwiseData] Processing highlight batch ${batchCount} (${highlights.length} items)...`
			);

			const highlightIds = highlights.map((h) => h._id);
			const result = (await ctx.runMutation(internal.readwiseCleanup.deleteHighlightBatch, {
				highlightIds
			})) as { deleted: number; results: Array<{ sourceId: string; tagIds: string[] }> };

			highlightsDeleted += result.deleted;
			for (const item of result.results) {
				highlightTagsDeleted += item.tagIds.length;
				allSourceIds.add(item.sourceId);
				for (const tagId of item.tagIds) {
					allTagIds.add(tagId);
				}
			}

			console.log(
				`[cleanReadwiseData] Deleted ${result.deleted} highlights in this batch (total: ${highlightsDeleted})`
			);
		}

		console.log(
			`[cleanReadwiseData] Deleted ${highlightsDeleted} highlights and ${highlightTagsDeleted} highlightTags`
		);

		// Step 3: Delete sources in batches
		console.log(`[cleanReadwiseData] Processing sources...`);
		let sourcesDeleted = 0;
		let sourceAuthorsDeleted = 0;
		let sourceTagsDeleted = 0;
		const allAuthorIds = new Set<string>();
		let sourceBatchCount = 0;

		while (true) {
			const sources = (await ctx.runQuery(internal.readwiseCleanup.listSources, {
				userId,
				limit: 20 // Process 20 at a time
			})) as Array<Doc<'sources'>>;

			if (sources.length === 0) break;

			sourceBatchCount++;
			console.log(
				`[cleanReadwiseData] Processing source batch ${sourceBatchCount} (${sources.length} items)...`
			);

			const sourceIds = sources.map((s) => s._id);
			const result = (await ctx.runMutation(internal.readwiseCleanup.deleteSourceBatch, {
				sourceIds
			})) as { deleted: number; results: Array<{ authorIds: string[]; tagIds: string[] }> };

			sourcesDeleted += result.deleted;
			for (const item of result.results) {
				sourceAuthorsDeleted += item.authorIds.length;
				sourceTagsDeleted += item.tagIds.length;
				for (const authorId of item.authorIds) {
					allAuthorIds.add(authorId);
				}
				for (const tagId of item.tagIds) {
					allTagIds.add(tagId);
				}
			}

			console.log(
				`[cleanReadwiseData] Deleted ${result.deleted} sources in this batch (total: ${sourcesDeleted})`
			);
		}

		console.log(
			`[cleanReadwiseData] Deleted ${sourcesDeleted} sources, ${sourceAuthorsDeleted} sourceAuthors, and ${sourceTagsDeleted} sourceTags`
		);

		// Step 4: Delete ALL authors and tags for this user (clean slate for retesting)
		console.log(`[cleanReadwiseData] Deleting all authors and tags...`);
		let totalAuthorsDeleted = 0;
		let totalTagsDeleted = 0;
		const cleanupBatchSize = 50;

		// Delete all authors in batches
		while (true) {
			const result = (await ctx.runMutation(internal.readwiseCleanup.deleteAuthorsBatch, {
				userId,
				limit: cleanupBatchSize
			})) as { deleted: number; hasMore: boolean };

			totalAuthorsDeleted += result.deleted;

			if (result.deleted > 0) {
				console.log(
					`[cleanReadwiseData] Deleted ${result.deleted} authors in this batch (total: ${totalAuthorsDeleted})`
				);
			}

			if (!result.hasMore) break;
		}

		// Delete all tags in batches (separate from authors)
		while (true) {
			const result = (await ctx.runMutation(internal.readwiseCleanup.deleteTagsBatch, {
				userId,
				limit: cleanupBatchSize
			})) as { deleted: number; hasMore: boolean };

			if (result.deleted > 0) {
				totalTagsDeleted += result.deleted;
				console.log(
					`[cleanReadwiseData] Deleted ${result.deleted} tags in this batch (total: ${totalTagsDeleted})`
				);
			}

			if (!result.hasMore) break;
		}

		console.log(
			`[cleanReadwiseData] Deleted ${totalAuthorsDeleted} authors and ${totalTagsDeleted} tags total`
		);

		// Step 5: Reset lastReadwiseSyncAt timestamp
		console.log(`[cleanReadwiseData] Resetting sync timestamp...`);
		await ctx.runMutation(internal.readwiseCleanup.resetSyncTimestamp, { userId });

		const summary: {
			inboxItemsDeleted: number;
			highlightsDeleted: number;
			sourcesDeleted: number;
			orphanedAuthorsDeleted: number;
			orphanedTagsDeleted: number;
		} = {
			inboxItemsDeleted,
			highlightsDeleted,
			sourcesDeleted,
			orphanedAuthorsDeleted: totalAuthorsDeleted,
			orphanedTagsDeleted: totalTagsDeleted
		};

		console.log(`[cleanReadwiseData] Cleanup complete:`, summary);

		return summary;
	}
});

// Internal queries to list items in batches
export const listInboxItems = internalQuery({
	args: {
		userId: v.id('users'),
		limit: v.number()
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('inboxItems')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.filter((q) => q.eq(q.field('type'), 'readwise_highlight'))
			.take(args.limit);
	}
});

export const listHighlights = internalQuery({
	args: {
		userId: v.id('users'),
		limit: v.number()
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('highlights')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.take(args.limit);
	}
});

export const listSources = internalQuery({
	args: {
		userId: v.id('users'),
		limit: v.number()
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('sources')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.take(args.limit);
	}
});

export const resetSyncTimestamp = internalMutation({
	args: {
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const settings = await ctx.db
			.query('userSettings')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.first();

		if (settings) {
			await ctx.db.patch(settings._id, {
				lastReadwiseSyncAt: undefined
			});
		}
	}
});

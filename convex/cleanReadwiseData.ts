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

import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Internal mutation to delete a batch of inbox items
export const deleteInboxItemsBatch = internalMutation({
  args: {
    itemIds: v.array(v.id("inboxItems")),
  },
  handler: async (ctx, args) => {
    for (const id of args.itemIds) {
      await ctx.db.delete(id);
    }
    return args.itemIds.length;
  },
});

// Internal mutation to delete multiple highlights and their tags
export const deleteHighlightBatch = internalMutation({
  args: {
    highlightIds: v.array(v.id("highlights")),
  },
  handler: async (ctx, args) => {
    const results: Array<{ sourceId: string; tagIds: string[] }> = [];
    
    for (const highlightId of args.highlightIds) {
      const highlight = await ctx.db.get(highlightId);
      if (!highlight) continue;

      // Get and delete highlightTags
      const tags = await ctx.db
        .query("highlightTags")
        .withIndex("by_highlight", (q) => q.eq("highlightId", highlightId))
        .collect();

      const tagIds: string[] = [];
      for (const link of tags) {
        tagIds.push(link.tagId);
        await ctx.db.delete(link._id);
      }

      await ctx.db.delete(highlightId);

      results.push({
        sourceId: highlight.sourceId,
        tagIds,
      });
    }

    return {
      deleted: results.length,
      results,
    };
  },
});

// Internal mutation to delete multiple sources and their junction links
export const deleteSourceBatch = internalMutation({
  args: {
    sourceIds: v.array(v.id("sources")),
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
        .query("sourceAuthors")
        .withIndex("by_source", (q) => q.eq("sourceId", sourceId))
        .collect();
      for (const link of sourceAuthors) {
        authorIds.push(link.authorId);
        await ctx.db.delete(link._id);
      }

      // Delete sourceTags links
      const sourceTags = await ctx.db
        .query("sourceTags")
        .withIndex("by_source", (q) => q.eq("sourceId", sourceId))
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
      results,
    };
  },
});

// Internal mutation to delete orphaned authors/tags
export const deleteOrphanedEntities = internalMutation({
  args: {
    authorIds: v.array(v.string()),
    tagIds: v.array(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    let authorsDeleted = 0;
    let tagsDeleted = 0;

    // Delete orphaned authors
    for (const authorIdStr of args.authorIds.slice(0, 50)) {
      const authorId = authorIdStr as any;
      const author = await ctx.db.get(authorId);
      if (author && 'userId' in author && author.userId === args.userId) {
        const remainingSources = await ctx.db
          .query("sources")
          .withIndex("by_author", (q) => q.eq("authorId", authorId))
          .first();
        
        const remainingLinks = await ctx.db
          .query("sourceAuthors")
          .withIndex("by_author", (q) => q.eq("authorId", authorId))
          .first();

        if (!remainingSources && !remainingLinks) {
          await ctx.db.delete(authorId);
          authorsDeleted++;
        }
      }
    }

    // Delete orphaned tags
    for (const tagIdStr of args.tagIds.slice(0, 50)) {
      const tagId = tagIdStr as any;
      const tag = await ctx.db.get(tagId);
      if (tag && 'userId' in tag && tag.userId === args.userId) {
        const remainingSourceTags = await ctx.db
          .query("sourceTags")
          .withIndex("by_tag", (q) => q.eq("tagId", tagId))
          .first();

        const remainingHighlightTags = await ctx.db
          .query("highlightTags")
          .withIndex("by_tag", (q) => q.eq("tagId", tagId))
          .first();

        if (!remainingSourceTags && !remainingHighlightTags) {
          await ctx.db.delete(tagId);
          tagsDeleted++;
        }
      }
    }

    return { authorsDeleted, tagsDeleted };
  },
});

// Main action that orchestrates the cleanup
export const cleanReadwiseData = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    console.log(`[cleanReadwiseData] Starting cleanup for user ${userId}`);

    // Step 1: Delete inbox items in batches
    console.log(`[cleanReadwiseData] Deleting inbox items...`);
    let inboxItemsDeleted = 0;
    const batchSize = 10;
    
    while (true) {
      const inboxItems = await ctx.runQuery(internal.cleanReadwiseData.listInboxItems, {
        userId,
        limit: batchSize,
      }) as any[];

      if (inboxItems.length === 0) break;

      const itemIds = inboxItems.map((item: any) => item._id);
      const deleted = await ctx.runMutation(internal.cleanReadwiseData.deleteInboxItemsBatch, {
        itemIds,
      }) as number;
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
      const highlights = await ctx.runQuery(internal.cleanReadwiseData.listHighlights, {
        userId,
        limit: 20, // Process 20 at a time
      }) as any[];

      if (highlights.length === 0) break;

      batchCount++;
      console.log(`[cleanReadwiseData] Processing highlight batch ${batchCount} (${highlights.length} items)...`);

      const highlightIds = highlights.map((h: any) => h._id);
      const result = await ctx.runMutation(internal.cleanReadwiseData.deleteHighlightBatch, {
        highlightIds,
      }) as { deleted: number; results: Array<{ sourceId: string; tagIds: string[] }> };

      highlightsDeleted += result.deleted;
      for (const item of result.results) {
        highlightTagsDeleted += item.tagIds.length;
        allSourceIds.add(item.sourceId);
        for (const tagId of item.tagIds) {
          allTagIds.add(tagId);
        }
      }

      console.log(`[cleanReadwiseData] Deleted ${result.deleted} highlights in this batch (total: ${highlightsDeleted})`);
    }

    console.log(`[cleanReadwiseData] Deleted ${highlightsDeleted} highlights and ${highlightTagsDeleted} highlightTags`);

    // Step 3: Delete sources in batches
    console.log(`[cleanReadwiseData] Processing sources...`);
    let sourcesDeleted = 0;
    let sourceAuthorsDeleted = 0;
    let sourceTagsDeleted = 0;
    const allAuthorIds = new Set<string>();
    let sourceBatchCount = 0;

    while (true) {
      const sources = await ctx.runQuery(internal.cleanReadwiseData.listSources, {
        userId,
        limit: 20, // Process 20 at a time
      }) as any[];

      if (sources.length === 0) break;

      sourceBatchCount++;
      console.log(`[cleanReadwiseData] Processing source batch ${sourceBatchCount} (${sources.length} items)...`);

      const sourceIds = sources.map((s: any) => s._id);
      const result = await ctx.runMutation(internal.cleanReadwiseData.deleteSourceBatch, {
        sourceIds,
      }) as { deleted: number; results: Array<{ authorIds: string[]; tagIds: string[] }> };

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

      console.log(`[cleanReadwiseData] Deleted ${result.deleted} sources in this batch (total: ${sourcesDeleted})`);
    }

    console.log(`[cleanReadwiseData] Deleted ${sourcesDeleted} sources, ${sourceAuthorsDeleted} sourceAuthors, and ${sourceTagsDeleted} sourceTags`);

    // Step 4: Delete orphaned authors and tags
    console.log(`[cleanReadwiseData] Cleaning up orphaned entities...`);
    const orphanedResults = await ctx.runMutation(internal.cleanReadwiseData.deleteOrphanedEntities, {
      authorIds: Array.from(allAuthorIds),
      tagIds: Array.from(allTagIds),
      userId,
    }) as { authorsDeleted: number; tagsDeleted: number };

    console.log(`[cleanReadwiseData] Deleted ${orphanedResults.authorsDeleted} orphaned authors and ${orphanedResults.tagsDeleted} orphaned tags`);

    // Step 5: Reset lastReadwiseSyncAt timestamp
    console.log(`[cleanReadwiseData] Resetting sync timestamp...`);
    await ctx.runMutation(internal.cleanReadwiseData.resetSyncTimestamp, { userId });

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
      orphanedAuthorsDeleted: orphanedResults.authorsDeleted,
      orphanedTagsDeleted: orphanedResults.tagsDeleted,
    };

    console.log(`[cleanReadwiseData] Cleanup complete:`, summary);

    return summary;
  },
});

// Internal queries to list items in batches
export const listInboxItems = internalQuery({
  args: {
    userId: v.id("users"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inboxItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), "readwise_highlight"))
      .take(args.limit);
  },
});

export const listHighlights = internalQuery({
  args: {
    userId: v.id("users"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("highlights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(args.limit);
  },
});

export const listSources = internalQuery({
  args: {
    userId: v.id("users"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sources")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(args.limit);
  },
});

export const resetSyncTimestamp = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (settings) {
      await ctx.db.patch(settings._id, {
        lastReadwiseSyncAt: undefined,
      });
    }
  },
});

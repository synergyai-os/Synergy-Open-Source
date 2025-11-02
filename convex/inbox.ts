/**
 * Inbox Queries and Mutations
 * 
 * Handles querying inbox items and marking them as processed.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all inbox items for the current user
 * Optionally filter by type (readwise_highlight, photo_note, manual_text, etc.)
 * Returns items with basic display info (title, snippet, tags) for inbox list
 */
export const listInboxItems = query({
  args: {
    filterType: v.optional(v.string()), // Optional type filter
    processed: v.optional(v.boolean()), // Optional processed filter
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let itemsQuery = ctx.db
      .query("inboxItems")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    // Apply processed filter if provided
    if (args.processed !== undefined) {
      itemsQuery = ctx.db
        .query("inboxItems")
        .withIndex("by_user_processed", (q) =>
          q.eq("userId", userId).eq("processed", args.processed as boolean)
        );
    }

    const items = await itemsQuery.collect();

    // Filter by type if provided
    let filteredItems = args.filterType
      ? items.filter((item) => item.type === args.filterType)
      : items;

    // Enrich items with display info based on type
    const enrichedItems = await Promise.all(
      filteredItems.map(async (item) => {
        if (item.type === "readwise_highlight") {
          // Get highlight for title/snippet
          const highlight = await ctx.db.get(item.highlightId);
          if (!highlight) {
            return {
              ...item,
              title: "Unknown Highlight",
              snippet: "",
              tags: [],
            };
          }

          // Get source for title
          const source = await ctx.db.get(highlight.sourceId);
          const title = source ? source.title : "Unknown Source";

          // Get tags
          const highlightTags = await ctx.db
            .query("highlightTags")
            .withIndex("by_highlight", (q) => q.eq("highlightId", highlight._id))
            .collect();

          const sourceTags = source
            ? await ctx.db
                .query("sourceTags")
                .withIndex("by_source", (q) => q.eq("sourceId", source._id))
                .collect()
            : [];

          const allTagIds = [
            ...highlightTags.map((ht) => ht.tagId),
            ...sourceTags.map((st) => st.tagId),
          ];
          const uniqueTagIds = Array.from(new Set(allTagIds));
          const tags = await Promise.all(
            uniqueTagIds.map((tagId) => ctx.db.get(tagId))
          );
          const tagNames = tags
            .filter((t) => t !== null)
            .map((t) => t!.displayName);

          // Snippet is first part of highlight text (max 100 chars)
          const snippet =
            highlight.text.length > 100
              ? highlight.text.substring(0, 100) + "..."
              : highlight.text;

          return {
            ...item,
            title,
            snippet,
            tags: tagNames,
          };
        }

        // For other types, return with placeholder data
        return {
          ...item,
          title: "Unknown Item",
          snippet: "",
          tags: [],
        };
      })
    );

    // Sort by createdAt descending (newest first)
    return enrichedItems.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get a single inbox item by ID
 */
export const getInboxItem = query({
  args: {
    inboxItemId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const item = await ctx.db.get(args.inboxItemId);
    
    // Verify the item belongs to the user
    if (!item || item.userId !== userId) {
      return null;
    }

    return item;
  },
});

/**
 * Get inbox item with full details (author, source, tags, etc.)
 * This is useful for displaying detailed information in the inbox UI
 */
export const getInboxItemWithDetails = query({
  args: {
    inboxItemId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const item = await ctx.db.get(args.inboxItemId);
    
    // Verify the item belongs to the user
    if (!item || item.userId !== userId) {
      return null;
    }

    // Get details based on item type
    if (item.type === "readwise_highlight") {
      // Get highlight details
      const highlight = await ctx.db.get(item.highlightId);
      if (!highlight) {
        return {
          ...item,
          highlight: null,
          source: null,
          author: null,
          tags: [],
        };
      }

      // Get source details
      const source = await ctx.db.get(highlight.sourceId);
      if (!source) {
        return {
          ...item,
          highlight,
          source: null,
          author: null,
          tags: [],
        };
      }

      // Get primary author
      const author = await ctx.db.get(source.authorId);

      // Get all authors for this source
      const sourceAuthors = await ctx.db
        .query("sourceAuthors")
        .withIndex("by_source", (q) => q.eq("sourceId", source._id))
        .collect();

      const allAuthorIds = [
        source.authorId,
        ...sourceAuthors.map((sa) => sa.authorId),
      ];
      const uniqueAuthorIds = Array.from(new Set(allAuthorIds));
      const allAuthors = await Promise.all(
        uniqueAuthorIds.map((authorId) => ctx.db.get(authorId))
      );

      // Get tags for the highlight (if any)
      const highlightTags = await ctx.db
        .query("highlightTags")
        .withIndex("by_highlight", (q) => q.eq("highlightId", highlight._id))
        .collect();

      const tagIds = highlightTags.map((ht) => ht.tagId);
      const tags = await Promise.all(tagIds.map((tagId) => ctx.db.get(tagId)));

      // Get tags for the source (if any)
      const sourceTags = await ctx.db
        .query("sourceTags")
        .withIndex("by_source", (q) => q.eq("sourceId", source._id))
        .collect();

      const sourceTagIds = sourceTags.map((st) => st.tagId);
      const sourceTagsData = await Promise.all(
        sourceTagIds.map((tagId) => ctx.db.get(tagId))
      );

      // Combine highlight and source tags (unique)
      const allTagIds = Array.from(new Set([...tagIds, ...sourceTagIds]));
      const allTagsData = await Promise.all(
        allTagIds.map((tagId) => ctx.db.get(tagId))
      );

      return {
        ...item,
        highlight,
        source,
        author, // Primary author
        authors: allAuthors.filter((a) => a !== null), // All authors
        tags: allTagsData.filter((t) => t !== null),
      };
    }

    // For other types, just return the item
    return item;
  },
});

/**
 * Mark an inbox item as processed
 * This removes it from the inbox workflow (user has reviewed it)
 */
export const markProcessed = mutation({
  args: {
    inboxItemId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const item = await ctx.db.get(args.inboxItemId);
    
    // Verify the item belongs to the user
    if (!item || item.userId !== userId) {
      throw new Error("Inbox item not found or access denied");
    }

    // Mark as processed
    await ctx.db.patch(args.inboxItemId, {
      processed: true,
      processedAt: Date.now(),
    });

    return args.inboxItemId;
  },
});

/**
 * Query: Get sync progress for current user
 */
export const getSyncProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const progress = await ctx.db
      .query("syncProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return progress ? {
      step: progress.step,
      current: progress.current,
      total: progress.total,
      message: progress.message,
    } : null;
  },
});


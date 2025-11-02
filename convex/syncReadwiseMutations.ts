/**
 * Readwise Sync Mutations
 * 
 * Internal mutations for syncing Readwise data.
 * These must be in a separate file without "use node" because mutations
 * cannot be defined in Node.js files (only actions can).
 */

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import {
  normalizeAuthorName,
  parseISODate,
  normalizeTagName,
} from "./readwiseUtils";

/**
 * Internal mutation: Find or create author
 */
export const findOrCreateAuthor = internalMutation({
  args: {
    userId: v.id("users"),
    authorName: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, authorName } = args;
    const normalizedName = normalizeAuthorName(authorName);

    // Check if author exists
    const existing = await ctx.db
      .query("authors")
      .withIndex("by_user_name", (q) => q.eq("userId", userId).eq("name", normalizedName))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new author
    const authorId = await ctx.db.insert("authors", {
      userId,
      name: normalizedName,
      displayName: authorName,
      createdAt: Date.now(),
    });

    return authorId;
  },
});

/**
 * Internal mutation: Find or create source
 */
export const findOrCreateSource = internalMutation({
  args: {
    userId: v.id("users"),
    primaryAuthorId: v.id("authors"),
    readwiseSource: v.any(), // Readwise source object
  },
  handler: async (ctx, args) => {
    const { userId, primaryAuthorId, readwiseSource } = args;
    const externalId = String(readwiseSource.id);

    // Check if source exists
    const existing = await ctx.db
      .query("sources")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
      .first();

    const now = Date.now();
    const updatedAt = parseISODate(readwiseSource.updated) || now;
    const lastHighlightAt = parseISODate(readwiseSource.last_highlight_at);

    const sourceData = {
      userId,
      authorId: primaryAuthorId,
      title: readwiseSource.title,
      category: readwiseSource.category,
      sourceType: readwiseSource.source,
      externalId,
      sourceUrl: readwiseSource.source_url || undefined,
      coverImageUrl: readwiseSource.cover_image_url || undefined,
      highlightsUrl: readwiseSource.highlights_url || undefined,
      asin: readwiseSource.asin || undefined,
      documentNote: readwiseSource.document_note || undefined,
      numHighlights: readwiseSource.num_highlights || 0,
      lastHighlightAt,
      updatedAt,
      createdAt: existing?.createdAt || now,
    };

    if (existing) {
      // Update existing source
      await ctx.db.patch(existing._id, sourceData);
      return existing._id;
    } else {
      // Create new source
      const sourceId = await ctx.db.insert("sources", sourceData);
      return sourceId;
    }
  },
});

/**
 * Internal mutation: Link author to source
 */
export const linkAuthorToSource = internalMutation({
  args: {
    sourceId: v.id("sources"),
    authorId: v.id("authors"),
  },
  handler: async (ctx, args) => {
    const { sourceId, authorId } = args;

    // Check if link already exists
    const existing = await ctx.db
      .query("sourceAuthors")
      .withIndex("by_source_author", (q) =>
        q.eq("sourceId", sourceId).eq("authorId", authorId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    // Create link
    return await ctx.db.insert("sourceAuthors", {
      sourceId,
      authorId,
    });
  },
});

/**
 * Internal mutation: Find or create tag
 */
export const findOrCreateTag = internalMutation({
  args: {
    userId: v.id("users"),
    tagName: v.string(),
    externalId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, tagName, externalId } = args;
    const normalizedName = normalizeTagName(tagName);

    // Check if tag exists
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_user_name", (q) => q.eq("userId", userId).eq("name", normalizedName))
      .first();

    if (existing) {
      // Update externalId if provided and missing
      if (externalId && !existing.externalId) {
        await ctx.db.patch(existing._id, { externalId });
      }
      return existing._id;
    }

    // Create new tag
    const tagId = await ctx.db.insert("tags", {
      userId,
      name: normalizedName,
      displayName: tagName,
      externalId,
      createdAt: Date.now(),
    });

    return tagId;
  },
});

/**
 * Internal mutation: Link tag to source
 */
export const linkTagToSource = internalMutation({
  args: {
    sourceId: v.id("sources"),
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    const { sourceId, tagId } = args;

    // Check if link already exists
    const existing = await ctx.db
      .query("sourceTags")
      .withIndex("by_source_tag", (q) => q.eq("sourceId", sourceId).eq("tagId", tagId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create link
    return await ctx.db.insert("sourceTags", {
      sourceId,
      tagId,
    });
  },
});

/**
 * Internal mutation: Find or create highlight
 */
export const findOrCreateHighlight = internalMutation({
  args: {
    userId: v.id("users"),
    sourceId: v.id("sources"),
    readwiseHighlight: v.any(), // Readwise highlight object
  },
  handler: async (ctx, args) => {
    const { userId, sourceId, readwiseHighlight } = args;
    const externalId = String(readwiseHighlight.id);

    // Check if highlight exists
    const existing = await ctx.db
      .query("highlights")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
      .first();

    const now = Date.now();
    const updatedAt = parseISODate(readwiseHighlight.updated) || now;
    const highlightedAt = parseISODate(readwiseHighlight.highlighted_at);

    const highlightData = {
      userId,
      sourceId,
      text: readwiseHighlight.text,
      location: readwiseHighlight.location || undefined,
      locationType: readwiseHighlight.location_type || undefined,
      note: readwiseHighlight.note || undefined,
      color: readwiseHighlight.color || undefined,
      externalId,
      externalUrl: readwiseHighlight.url || "", // Convert null to empty string (schema requires string)
      highlightedAt,
      updatedAt,
      createdAt: existing?.createdAt || now,
      lastSyncedAt: now,
    };

    if (existing) {
      // Update existing highlight
      await ctx.db.patch(existing._id, highlightData);
      return existing._id;
    } else {
      // Create new highlight
      const highlightId = await ctx.db.insert("highlights", highlightData);
      return highlightId;
    }
  },
});

/**
 * Internal mutation: Find or create inbox item
 */
export const findOrCreateInboxItem = internalMutation({
  args: {
    userId: v.id("users"),
    highlightId: v.id("highlights"),
  },
  handler: async (ctx, args) => {
    const { userId, highlightId } = args;

    // Check if inbox item already exists for this highlight
    const existing = await ctx.db
      .query("inboxItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "readwise_highlight"),
          q.eq(q.field("highlightId"), highlightId)
        )
      )
      .first();

    if (existing) {
      // Inbox item exists, check if it was already processed
      // If processed, we might want to recreate it if highlight was updated
      // For now, just return the existing one
      return existing._id;
    }

    // Create new inbox item
    const inboxItemId = await ctx.db.insert("inboxItems", {
      type: "readwise_highlight" as const,
      userId,
      highlightId,
      processed: false,
      createdAt: Date.now(),
    });

    return inboxItemId;
  },
});

/**
 * Internal mutation: Update last sync time
 */
export const updateLastSyncTime = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;
    const now = Date.now();

    // Find or create user settings
    let settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (settings) {
      // Update existing
      await ctx.db.patch(settings._id, {
        lastReadwiseSyncAt: now,
      });
    } else {
      // Create new (shouldn't happen, but handle it)
      await ctx.db.insert("userSettings", {
        userId,
        lastReadwiseSyncAt: now,
      });
    }
  },
});


/**
 * Notes Queries and Mutations
 * 
 * Handles CRUD operations for rich text notes with AI detection and blog workflow
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";

/**
 * Create a new note
 */
export const createNote = mutation({
  args: {
    title: v.optional(v.string()),
    content: v.string(), // ProseMirror JSON
    contentMarkdown: v.optional(v.string()),
    isAIGenerated: v.optional(v.boolean()),
    organizationId: v.optional(v.union(v.id("organizations"), v.null())),
    teamId: v.optional(v.id("teams")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    
    const noteId = await ctx.db.insert("inboxItems", {
      type: "note",
      userId,
      processed: false, // New notes start unprocessed
      createdAt: now,
      updatedAt: now,
      title: args.title,
      content: args.content,
      contentMarkdown: args.contentMarkdown,
      isAIGenerated: args.isAIGenerated,
      aiGeneratedAt: args.isAIGenerated ? now : undefined,
      organizationId: args.organizationId === null ? undefined : args.organizationId,
      teamId: args.teamId,
      ownershipType: args.organizationId
        ? "organization"
        : args.teamId
          ? "team"
          : "user",
    });

    return noteId;
  },
});

/**
 * Update an existing note
 */
export const updateNote = mutation({
  args: {
    noteId: v.id("inboxItems"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    contentMarkdown: v.optional(v.string()),
    isAIGenerated: v.optional(v.boolean()),
    blogCategory: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    
    if (!note || note.userId !== userId) {
      throw new Error("Note not found or access denied");
    }

    if (note.type !== "note") {
      throw new Error("Item is not a note");
    }

    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updateData.title = args.title;
    if (args.content !== undefined) updateData.content = args.content;
    if (args.contentMarkdown !== undefined) updateData.contentMarkdown = args.contentMarkdown;
    if (args.blogCategory !== undefined) updateData.blogCategory = args.blogCategory;
    if (args.slug !== undefined) updateData.slug = args.slug;
    
    if (args.isAIGenerated !== undefined) {
      updateData.isAIGenerated = args.isAIGenerated;
      if (args.isAIGenerated && !note.aiGeneratedAt) {
        updateData.aiGeneratedAt = Date.now();
      }
    }

    await ctx.db.patch(args.noteId, updateData);

    return args.noteId;
  },
});

/**
 * Mark note as AI-generated
 */
export const markAsAIGenerated = mutation({
  args: {
    noteId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    
    if (!note || note.userId !== userId) {
      throw new Error("Note not found or access denied");
    }

    if (note.type !== "note") {
      throw new Error("Item is not a note");
    }

    await ctx.db.patch(args.noteId, {
      isAIGenerated: true,
      aiGeneratedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.noteId;
  },
});

/**
 * Mark note for blog export
 */
export const markForBlogExport = mutation({
  args: {
    noteId: v.id("inboxItems"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    
    if (!note || note.userId !== userId) {
      throw new Error("Note not found or access denied");
    }

    if (note.type !== "note") {
      throw new Error("Item is not a note");
    }

    await ctx.db.patch(args.noteId, {
      blogCategory: "BLOG",
      slug: args.slug,
      updatedAt: Date.now(),
    });

    return args.noteId;
  },
});

/**
 * Mark note as published to blog file
 */
export const markAsPublished = mutation({
  args: {
    noteId: v.id("inboxItems"),
    publishedTo: v.string(), // File path
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    
    if (!note || note.userId !== userId) {
      throw new Error("Note not found or access denied");
    }

    if (note.type !== "note") {
      throw new Error("Item is not a note");
    }

    await ctx.db.patch(args.noteId, {
      publishedTo: args.publishedTo,
      processed: true, // Published notes are considered processed
      processedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.noteId;
  },
});

/**
 * Delete a note
 */
export const deleteNote = mutation({
  args: {
    noteId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    
    if (!note || note.userId !== userId) {
      throw new Error("Note not found or access denied");
    }

    if (note.type !== "note") {
      throw new Error("Item is not a note");
    }

    await ctx.db.delete(args.noteId);

    return { success: true };
  },
});

/**
 * Export note to dev docs (set slug for /dev-docs/notes/[slug] route)
 */
export const exportToDevDocs = mutation({
  args: {
    noteId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    
    if (!note || note.userId !== userId) {
      throw new Error("Note not found or access denied");
    }

    if (note.type !== "note") {
      throw new Error("Item is not a note");
    }

    // Generate slug from title or use note ID
    const title = note.title || "untitled";
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    await ctx.db.patch(args.noteId, {
      slug: slug || note._id,
      updatedAt: Date.now(),
    });

    return { slug: slug || note._id };
  },
});

/**
 * List all notes for current user
 */
export const listNotes = query({
  args: {
    processed: v.optional(v.boolean()),
    blogOnly: v.optional(v.boolean()),
    organizationId: v.optional(v.union(v.id("organizations"), v.null())),
    teamId: v.optional(v.id("teams")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let itemsQuery = ctx.db
      .query("inboxItems")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", userId).eq("type", "note")
      );

    let items = await itemsQuery.collect();

    // Filter by workspace context
    if (args.organizationId === null) {
      // Personal workspace
      items = items.filter((item) => !item.organizationId && !item.teamId);
    } else if (args.organizationId !== undefined) {
      // Organization workspace
      if (args.teamId) {
        items = items.filter((item) => item.teamId === args.teamId);
      } else {
        items = items.filter(
          (item) => item.organizationId === args.organizationId && !item.teamId
        );
      }
    }

    // Filter by processed status
    if (args.processed !== undefined) {
      items = items.filter((item) => item.processed === args.processed);
    }

    // Filter for blog posts only
    if (args.blogOnly) {
      items = items.filter(
        (item) => item.type === "note" && item.blogCategory === "BLOG"
      );
    }

    // Sort by updatedAt or createdAt descending
    return items.sort((a, b) => {
      const aTime = a.type === "note" && a.updatedAt ? a.updatedAt : a.createdAt;
      const bTime = b.type === "note" && b.updatedAt ? b.updatedAt : b.createdAt;
      return bTime - aTime;
    });
  },
});

/**
 * Get a single note by ID
 */
export const getNote = query({
  args: {
    noteId: v.id("inboxItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const note = await ctx.db.get(args.noteId);
    
    if (!note || note.userId !== userId) {
      return null;
    }

    if (note.type !== "note") {
      return null;
    }

    return note;
  },
});


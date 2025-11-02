import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  // User settings - one per user
  userSettings: defineTable({
    userId: v.id("users"), // Reference to the authenticated user
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))), // Theme preference
    claudeApiKey: v.optional(v.string()), // Claude API key (encrypted/secure)
    readwiseApiKey: v.optional(v.string()), // Readwise API key (encrypted/secure)
    // Sync tracking
    lastReadwiseSyncAt: v.optional(v.number()), // Timestamp of last Readwise sync
    // Future: displayName, email preferences, etc.
  })
    .index("by_user", ["userId"]), // Index for quick lookup by user

  // Authors table - normalized author names
  // Note: Readwise provides authors as strings, we normalize them
  authors: defineTable({
    userId: v.id("users"),
    name: v.string(), // Author name (normalized, lowercase for matching)
    displayName: v.string(), // Original author name as provided
    // Future: bio, avatar, etc.
    createdAt: v.number(), // When first added
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]), // Unique author per user

  // Sources table (books, articles, tweets, etc.)
  // Represents the source that highlights come from
  sources: defineTable({
    userId: v.id("users"),
    authorId: v.id("authors"), // Primary author (for multiple authors, we'll handle separately)
    title: v.string(),
    category: v.string(), // "books", "articles", "tweets", "pdfs", etc.
    sourceType: v.string(), // "kindle", "reader", etc.
    externalId: v.string(), // Readwise source/book ID
    sourceUrl: v.optional(v.string()), // Original source URL (for articles/web)
    coverImageUrl: v.optional(v.string()), // Cover/thumbnail image
    highlightsUrl: v.optional(v.string()), // Link to highlights in Readwise
    asin: v.optional(v.string()), // Amazon ASIN (for Kindle books)
    documentNote: v.optional(v.string()), // User's top-level note on source
    numHighlights: v.number(), // Count of highlights (from Readwise)
    lastHighlightAt: v.optional(v.number()), // Timestamp of most recent highlight
    updatedAt: v.number(), // When source was last updated (from Readwise)
    createdAt: v.number(), // When first added to Axon
  })
    .index("by_user", ["userId"])
    .index("by_author", ["authorId"])
    .index("by_external_id", ["externalId"]) // Prevent duplicates
    .index("by_user_category", ["userId", "category"])
    .index("by_user_source_type", ["userId", "sourceType"]),

  // Multiple authors per source (many-to-many relationship)
  // Some sources have comma-separated authors, we store them separately
  sourceAuthors: defineTable({
    sourceId: v.id("sources"),
    authorId: v.id("authors"),
  })
    .index("by_source", ["sourceId"])
    .index("by_author", ["authorId"])
    .index("by_source_author", ["sourceId", "authorId"]), // Unique constraint

  // Highlights table - individual highlights from sources
  // Note: processed status is tracked in inboxItems table, not here
  highlights: defineTable({
    userId: v.id("users"),
    sourceId: v.id("sources"), // Link to source/book
    text: v.string(), // Highlight text content
    location: v.optional(v.number()), // Location in source (offset/page number)
    locationType: v.optional(v.string()), // "offset", "page", "chapter", etc.
    note: v.optional(v.string()), // User's note on highlight
    color: v.optional(v.string()), // Highlight color
    externalId: v.string(), // Readwise highlight ID
    externalUrl: v.string(), // Link to highlight in Readwise
    highlightedAt: v.optional(v.number()), // When user made the highlight (timestamp)
    updatedAt: v.number(), // When highlight was last updated (from Readwise)
    createdAt: v.number(), // When first added to Axon
    lastSyncedAt: v.optional(v.number()), // Last time synced from Readwise
  })
    .index("by_user", ["userId"])
    .index("by_source", ["sourceId"])
    .index("by_external_id", ["externalId"]) // Prevent duplicates
    .index("by_user_source", ["userId", "sourceId"]),

  // Universal Inbox Items table - polymorphic table for all inbox content
  // Uses discriminated unions to support different source types
  inboxItems: defineTable(
    v.union(
      // Readwise Highlight - links to highlights table
      v.object({
        type: v.literal("readwise_highlight"),
        userId: v.id("users"),
        processed: v.boolean(), // User has reviewed/processed this item
        processedAt: v.optional(v.number()), // When processed
        createdAt: v.number(), // When first added to inbox
        highlightId: v.id("highlights"), // Link to highlights table
      }),
      // Photo Note (for future)
      v.object({
        type: v.literal("photo_note"),
        userId: v.id("users"),
        processed: v.boolean(),
        processedAt: v.optional(v.number()),
        createdAt: v.number(),
        imageFileId: v.id("_storage"), // Convex file storage ID
        transcribedText: v.optional(v.string()), // OCR result
        source: v.optional(v.string()), // Where photo came from
        ocrStatus: v.optional(
          v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"))
        ),
      }),
      // Manual Text (for future)
      v.object({
        type: v.literal("manual_text"),
        userId: v.id("users"),
        processed: v.boolean(),
        processedAt: v.optional(v.number()),
        createdAt: v.number(),
        text: v.string(),
        bookTitle: v.optional(v.string()), // Optional manual attribution
        pageNumber: v.optional(v.number()),
      }),
    )
  )
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_processed", ["userId", "processed"]),

  // Tags table - proper relational table for filtering
  tags: defineTable({
    userId: v.id("users"),
    name: v.string(), // Tag name (normalized, lowercase for matching)
    displayName: v.string(), // Original tag name as provided
    externalId: v.optional(v.number()), // Readwise tag ID (if available)
    color: v.optional(v.string()), // Future: user-assigned color
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]), // Unique tag per user

  // Many-to-many: Sources ↔ Tags
  // Tags are attached to sources in Readwise
  sourceTags: defineTable({
    sourceId: v.id("sources"),
    tagId: v.id("tags"),
  })
    .index("by_source", ["sourceId"])
    .index("by_tag", ["tagId"])
    .index("by_source_tag", ["sourceId", "tagId"]), // Unique constraint

  // Many-to-many: Highlights ↔ Tags (if highlights can have tags)
  // Note: In examples, highlight tags are empty, but we support it for future
  highlightTags: defineTable({
    highlightId: v.id("highlights"),
    tagId: v.id("tags"),
  })
    .index("by_highlight", ["highlightId"])
    .index("by_tag", ["tagId"])
    .index("by_highlight_tag", ["highlightId", "tagId"]), // Unique constraint

  // Sync Progress tracking - temporary table for tracking sync state
  // One row per user, cleaned up after sync completes or fails
  syncProgress: defineTable({
    userId: v.id("users"),
    step: v.string(), // Current step: "fetching_books", "fetching_highlights", "processing"
    current: v.number(), // Current count (items processed)
    total: v.optional(v.number()), // Total items to process (if known)
    message: v.optional(v.string()), // User-friendly message
    startedAt: v.number(), // When sync started
    updatedAt: v.number(), // Last update timestamp
  })
    .index("by_user", ["userId"]),
});

export default schema;


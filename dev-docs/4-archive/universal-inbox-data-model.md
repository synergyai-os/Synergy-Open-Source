# Universal Inbox Data Model Analysis

## Overview

Axon's CODE framework (Collect → Organise → Distill → Express) requires a **universal inbox** that can handle content from ANY source. The data structure must be designed to accommodate:

1. **Readwise Highlights** (current focus)
2. **Readwise Reader Documents** (future)
3. **Photos** (manual upload, OCR text extraction)
4. **Manual Text** (direct text input)
5. **URLs** (Chrome extension capture)
6. **Emails** (dedicated email address forwarding)

And potentially many more sources in the future.

## Design Principles

### 1. Universal Inbox Abstraction

- **All sources** → Same inbox workflow
- **Polymorphic structure** → Discriminated unions per source type
- **Common fields** → userId, processed, createdAt, etc.
- **Type-specific fields** → Stored in polymorphic union variant

### 2. Source-Specific Needs

#### Readwise Highlights

- Links to `sources` table (books/articles)
- Links to `authors` table
- Has location (page/offset)
- Has notes
- Has tags (from Readwise)

#### Readwise Reader Documents

- Similar structure to highlights but represents full documents
- May have HTML content
- Different API structure

#### Photos

- Image file storage (Convex file storage)
- OCR text extraction
- Source metadata (where photo was taken, etc.)
- No author/source relationship (or manual attribution)

#### Manual Text

- Just text content
- User-defined metadata
- No external source
- No author (unless user manually adds one)

#### URLs (Chrome Extension)

- URL capture
- Page title/meta
- Possibly full content scrape
- Source URL as primary identifier
- No author (unless extracted from page)

#### Emails

- Email content (subject, body, sender)
- Sender as "author"
- Email metadata (date, attachments, etc.)
- Source = email address/thread

## Current Schema Analysis

### What We Have Now

```typescript
// Current schema focuses on Readwise highlights:
- authors table
- sources table (books/articles)
- sourceAuthors table (many-to-many)
- highlights table
- tags table
- sourceTags table
- highlightTags table
```

### Problem: Too Readwise-Specific

The current schema assumes:

- All content has an author
- All content comes from a source (book/article)
- Highlights are the primary content type

This doesn't work for:

- Manual text (no author/source)
- Photos (no author, no source)
- URLs (no author unless extracted)
- Emails (sender as author, but different structure)

## Proposed Universal Data Model

### Option 1: Unified InboxItems Table (Polymorphic Union)

Use Convex's discriminated union pattern for a single `inboxItems` table:

```typescript
inboxItems: defineTable(
	v.union(
		// Readwise Highlight
		v.object({
			type: v.literal('readwise_highlight'),
			userId: v.id('users'),
			// Common fields
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			// Type-specific
			sourceId: v.id('sources'), // Link to sources table
			text: v.string(),
			location: v.optional(v.number()),
			locationType: v.optional(v.string()),
			note: v.optional(v.string()),
			externalId: v.string(), // Readwise highlight ID
			externalUrl: v.string(),
			highlightedAt: v.optional(v.number())
		}),
		// Readwise Reader Document
		v.object({
			type: v.literal('readwise_reader_document'),
			userId: v.id('users'),
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			// Type-specific
			sourceId: v.optional(v.id('sources')), // May link to source if exists
			documentId: v.string(), // Readwise document ID
			title: v.string(),
			url: v.string(),
			htmlContent: v.optional(v.string()),
			externalUrl: v.string()
		}),
		// Photo Note
		v.object({
			type: v.literal('photo_note'),
			userId: v.id('users'),
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			// Type-specific
			imageFileId: v.id('_storage'), // Convex file storage ID
			transcribedText: v.optional(v.string()), // OCR result
			source: v.optional(v.string()), // Where photo came from
			ocrStatus: v.optional(v.string()) // "pending", "completed", "failed"
		}),
		// Manual Text
		v.object({
			type: v.literal('manual_text'),
			userId: v.id('users'),
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			// Type-specific
			text: v.string(),
			bookTitle: v.optional(v.string()), // Optional manual attribution
			pageNumber: v.optional(v.number())
		}),
		// URL Capture
		v.object({
			type: v.literal('url_capture'),
			userId: v.id('users'),
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			// Type-specific
			url: v.string(),
			title: v.optional(v.string()),
			description: v.optional(v.string()),
			htmlContent: v.optional(v.string()), // Full page content if scraped
			author: v.optional(v.string()) // Extracted from page
		}),
		// Email
		v.object({
			type: v.literal('email'),
			userId: v.id('users'),
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			// Type-specific
			emailId: v.string(), // Unique email identifier
			subject: v.string(),
			body: v.string(),
			sender: v.string(), // Email address
			senderName: v.optional(v.string()),
			receivedAt: v.number(),
			threadId: v.optional(v.string())
		})
	)
)
	.index('by_user', ['userId'])
	.index('by_user_type', ['userId', 'type'])
	.index('by_user_processed', ['userId', 'processed']);
```

**Pros:**

- ✅ Single table for all inbox items
- ✅ Type-safe discriminated unions
- ✅ Common fields shared
- ✅ Type-specific fields per variant
- ✅ Easy to query all inbox items
- ✅ Scales to new source types easily

**Cons:**

- ⚠️ Type-specific queries require type checking
- ⚠️ Some fields are optional (sourceId, authorId) making queries complex

### Option 2: Hybrid Approach (Recommended)

Keep specialized tables for complex relationships, but add a unified `inboxItems` abstraction:

```typescript
// Specialized tables (for complex relationships)
- authors table (for filtering/grouping)
- sources table (for Readwise books/articles)
- sourceAuthors table
- tags table
- sourceTags table
- highlightTags table

// Unified inbox table (polymorphic)
inboxItems: defineTable(
  v.union(
    v.object({
      type: v.literal("readwise_highlight"),
      userId: v.id("users"),
      processed: v.boolean(),
      // Reference to specialized table
      highlightId: v.id("highlights"), // Links to highlights table
    }),
    v.object({
      type: v.literal("photo_note"),
      userId: v.id("users"),
      processed: v.boolean(),
      // Inline data for simple types
      imageFileId: v.id("_storage"),
      transcribedText: v.optional(v.string()),
      source: v.optional(v.string()),
    }),
    // ... other types
  )
)
```

**Pros:**

- ✅ Best of both worlds
- ✅ Complex relationships in specialized tables
- ✅ Simple types directly in inbox
- ✅ Easy to query all inbox items
- ✅ Type-safe discriminated unions

**Cons:**

- ⚠️ More complex schema
- ⚠️ Need to join tables for some queries

### Option 3: Separate Tables Per Type

```typescript
- readwiseHighlights (extends highlights table with processed field)
- photoNotes
- manualTextNotes
- urlCaptures
- emails
```

**Pros:**

- ✅ Type-specific queries are simple
- ✅ No type checking needed

**Cons:**

- ❌ Hard to query "all inbox items"
- ❌ Duplicate common fields across tables
- ❌ Doesn't scale well (new source = new table)

## Recommendation: Option 1 (Pure Polymorphic)

For Axon's universal inbox vision, **Option 1** (single polymorphic table) is best because:

1. **Universal Inbox** - Single query for all items regardless of source
2. **Scalability** - Add new source type = add new union variant
3. **Type Safety** - Convex discriminated unions provide compile-time safety
4. **Simplicity** - One table to manage, one set of indexes

### Handling Complex Relationships

For sources that need relationships (like Readwise highlights with authors/sources):

1. **Still use specialized tables** (authors, sources, tags) for filtering/grouping
2. **Link from inbox item** - `sourceId` field in the variant
3. **Optional relationships** - Not all types need authors/sources

## Updated Schema Design

### Core Universal Table

```typescript
inboxItems: defineTable(
	v.union(
		// Readwise Highlight
		v.object({
			type: v.literal('readwise_highlight'),
			userId: v.id('users'),
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			lastSyncedAt: v.optional(v.number()),
			// Links to specialized tables
			sourceId: v.id('sources'),
			highlightId: v.id('highlights') // Or embed highlight data here
		}),
		// Photo Note
		v.object({
			type: v.literal('photo_note'),
			userId: v.id('users'),
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			// Inline data
			imageFileId: v.id('_storage'),
			transcribedText: v.optional(v.string()),
			source: v.optional(v.string()),
			ocrStatus: v.optional(
				v.union(v.literal('pending'), v.literal('completed'), v.literal('failed'))
			)
		}),
		// Manual Text
		v.object({
			type: v.literal('manual_text'),
			userId: v.id('users'),
			processed: v.boolean(),
			processedAt: v.optional(v.number()),
			createdAt: v.number(),
			text: v.string(),
			bookTitle: v.optional(v.string()),
			pageNumber: v.optional(v.number())
		})
		// Add more types as needed...
	)
)
	.index('by_user', ['userId'])
	.index('by_user_type', ['userId', 'type'])
	.index('by_user_processed', ['userId', 'processed']);
```

### Specialized Tables (Still Needed)

```typescript
// For filtering/grouping capabilities
- authors
- sources
- tags
- sourceTags
- highlightTags (or inboxItemTags for universal tagging)
```

## Questions to Resolve

### 1. Reader API Integration

**Question**: Should Reader API documents go into `inboxItems` or separate flow?

**Answer**: Put in `inboxItems` as `readwise_reader_document` type. They're still inbox items that need review/processing.

### 2. Author Attribution

**Question**: How to handle authors for non-Readwise sources?

**Answer**:

- Manual text: Optional `authorId` field (user can attribute)
- Photos: No author (unless manually added)
- URLs: Extract author from page metadata (if available)
- Emails: `sender` field (can link to authors table if desired)

### 3. Source Attribution

**Question**: Should all inbox items have a "source"?

**Answer**:

- Readwise: Links to `sources` table
- Photos: Optional `source` string field
- Manual: Optional `bookTitle` (informal source)
- URLs: `url` field serves as source
- Emails: Email thread as source

### 4. Tagging System

**Question**: Should tags be universal or type-specific?

**Answer**: **Universal tagging** - All inbox items can have tags via `inboxItemTags` table:

```typescript
inboxItemTags: defineTable({
	inboxItemId: v.id('inboxItems'),
	tagId: v.id('tags')
});
```

### 5. Duplicate Prevention

**Question**: How to prevent duplicates across different source types?

**Answer**: Type-specific external IDs:

- Readwise highlights: `externalId` field
- URLs: URL as unique identifier
- Emails: Email ID/thread ID
- Photos: File hash or user-provided ID

## Reader API Structure Review

Based on the API docs provided, Reader API documents have:

- `id` (document ID)
- `url` (unique URL identifier)
- `title`, `author`, `summary`
- `category` (article, email, rss, etc.)
- `tags` (array)
- `htmlContent` (optional, if requested)

**Recommendation**: Treat Reader documents as **sources** in the `sources` table, not as inbox items directly. They become inbox items when user wants to review/process them for flashcard generation.

Or: Reader documents can be a new inbox item type `readwise_reader_document` if user wants to review the whole document for processing.

## Final Recommendation

1. **Use polymorphic `inboxItems` table** with discriminated unions
2. **Keep specialized tables** (authors, sources, tags) for complex relationships
3. **Link from inbox items** to specialized tables where needed
4. **Universal tagging** via `inboxItemTags` table
5. **Type-specific external IDs** for duplicate prevention

This design:

- ✅ Scales to any future source type
- ✅ Maintains complex relationships where needed
- ✅ Keeps simple types simple
- ✅ Enables universal inbox queries
- ✅ Type-safe with discriminated unions

## Next Steps

1. **Update schema** with universal `inboxItems` table
2. **Keep existing tables** (authors, sources, tags) for Readwise
3. **Design sync logic** to populate `inboxItems` from Readwise
4. **Plan for future sources** (photos, manual, URLs, emails)

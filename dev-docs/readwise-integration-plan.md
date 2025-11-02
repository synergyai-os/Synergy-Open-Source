# Readwise Integration Plan (Revised)

⚠️ **STATUS: UNDER REVIEW** ⚠️

**Important**: This plan is being reviewed before implementation. We need to design a **universal inbox data structure** that supports all future source types (Readwise highlights, Reader documents, photos, manual text, URLs, emails, etc.) not just Readwise.

See:
- `dev-docs/universal-inbox-data-model.md` - Universal data model analysis
- `dev-docs/data-structure-questions.md` - Critical design questions

## Overview

This document outlines the plan for integrating Readwise API (highlights) into Axon's universal inbox system. **We will test the API first to understand the actual data structure, then design our schema accordingly.**

**Update**: Before building, we're reconsidering the data structure to ensure it supports the universal inbox vision (all source types, not just Readwise).

## Key Decisions

1. **Focus on Readwise API (highlights)** first - Reader API can come later
2. **Test-first approach**: Fetch real API data before designing schema
3. **Proper relational structure**: Authors → Sources → Highlights (separate tables)
4. **Tags as separate table**: Not arrays, for proper filtering and search
5. **Sync trigger locations**:
   - Button in empty inbox state
   - Option in inbox header menu (three dots dropdown)

## Phase 1: API Testing & Data Discovery

### Goal
Understand the actual structure of data returned by Readwise API.

### 1.1 Create Test Action
**File**: `convex/testReadwiseApi.ts`

Create a test action that:
- Fetches a sample of highlights from Readwise API
- Logs the full response structure
- Returns the raw data for inspection

**Purpose**: 
- See all fields returned
- Understand relationships (highlight → book/source → author)
- Identify what we need vs what we can ignore
- Plan proper normalization strategy

### 1.2 Test with Real Account
- Use actual Readwise account with API key
- Fetch small sample (5-10 highlights)
- Document the response structure
- Identify all possible fields

### 1.3 Data Analysis
Once we have real data, analyze:
- What fields exist in highlight response?
- How are sources/books structured?
- How are authors represented?
- What tag structure exists?
- What metadata is available (dates, locations, etc.)?

## Phase 2: Schema Design (After Testing)

### Goal
Design proper relational schema based on actual API data.

### 2.1 Core Tables (Preliminary - to be refined after testing)

```typescript
// Authors table
authors: defineTable({
  userId: v.id("users"),
  name: v.string(), // Author name
  externalId: v.optional(v.string()), // If Readwise has author IDs
  // Future: bio, avatar, etc.
})
  .index("by_user", ["userId"])
  .index("by_user_name", ["userId", "name"]);

// Sources table (books, articles, etc.)
sources: defineTable({
  userId: v.id("users"),
  authorId: v.optional(v.id("authors")), // Link to author
  title: v.string(),
  category: v.string(), // e.g., "books", "articles", "tweets"
  externalId: v.optional(v.string()), // Readwise book/source ID
  url: v.optional(v.string()), // Source URL
  coverImageUrl: v.optional(v.string()),
  // Future: publication date, publisher, etc.
})
  .index("by_user", ["userId"])
  .index("by_author", ["authorId"])
  .index("by_external_id", ["externalId"]);

// Highlights table (inbox items)
highlights: defineTable({
  userId: v.id("users"),
  sourceId: v.id("sources"), // Link to source
  text: v.string(), // Highlight text
  location: v.optional(v.number()), // Page number, etc.
  locationType: v.optional(v.string()), // "page", "chapter", etc.
  note: v.optional(v.string()), // User's note on highlight
  externalId: v.string(), // Readwise highlight ID
  externalUrl: v.optional(v.string()), // Link back to Readwise
  highlightedAt: v.optional(v.number()), // Timestamp when highlighted
  processed: v.boolean(), // User has reviewed/processed
  processedAt: v.optional(v.number()),
  createdAt: v.number(), // When added to Axon
  lastSyncedAt: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_source", ["sourceId"])
  .index("by_user_processed", ["userId", "processed"])
  .index("by_external_id", ["externalId"]); // Prevent duplicates

// Tags table (proper relational table)
tags: defineTable({
  userId: v.id("users"),
  name: v.string(), // Tag name (lowercase, normalized)
  color: v.optional(v.string()), // Future: user-assigned color
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_name", ["userId", "name"]); // Unique per user

// Many-to-many: Highlights ↔ Tags
highlightTags: defineTable({
  highlightId: v.id("highlights"),
  tagId: v.id("tags"),
})
  .index("by_highlight", ["highlightId"])
  .index("by_tag", ["tagId"])
  .index("by_highlight_tag", ["highlightId", "tagId"]); // Unique constraint
```

### 2.2 Design Considerations (To Validate with Testing)

**Questions to Answer**:
1. Does Readwise provide author IDs or just names?
2. How are sources structured? Books vs articles vs tweets?
3. Are tags hierarchical or flat?
4. What date fields exist? (highlighted date, updated date, etc.)
5. What location information is available?

**After Testing**: Refine schema based on actual data.

## Phase 3: API Client Implementation

### 3.1 Readwise API Client
**File**: `convex/readwiseApi.ts`

Functions:
- `fetchReadwiseHighlights(apiKey, updatedAfter?)` - Fetch highlights
- `fetchReadwiseBooks(apiKey)` - Fetch books/sources
- Handle pagination
- Error handling (rate limits, auth errors)

### 3.2 Sync Orchestration
**File**: `convex/syncReadwise.ts`

Functions:
- `syncReadwiseHighlights(userId)` - Main sync function
  - Fetch highlights
  - Fetch books (if needed)
  - Normalize data (authors, sources, highlights)
  - Insert/update in proper tables
  - Link highlights to sources
  - Create/assign tags
  - Handle duplicates

**Normalization Logic**:
1. For each highlight:
   - Find or create author
   - Find or create source (linked to author)
   - Create highlight (linked to source)
   - Create/assign tags

## Phase 4: UI Integration

### 4.1 Sync Button Locations

#### A. Empty Inbox State
**File**: `src/routes/(authenticated)/inbox/+page.svelte`

When inbox is empty, show:
```
"No items in inbox. Great job! 🎉"
[Sync Readwise Highlights] button
```

#### B. Inbox Header Menu
**File**: `src/lib/components/inbox/InboxHeader.svelte`

Add to dropdown menu (three dots):
- "Sync Readwise Highlights"
- Separator
- "Delete all"
- "Delete all read"
- etc.

### 4.2 Sync Status
- Show loading state during sync
- Show success/error messages
- Display sync progress (optional, for large imports)

## Phase 5: Testing & Validation

### 5.1 Test Scenarios
- Small import (< 10 highlights)
- Large import (100+ highlights)
- Duplicate prevention
- Incremental sync
- Error handling (invalid key, rate limits)

### 5.2 Data Validation
- Authors correctly linked
- Sources correctly linked to authors
- Highlights correctly linked to sources
- Tags properly assigned
- No duplicates

## Implementation Order

1. **Phase 1**: Test API (get real data structure)
2. **Phase 2**: Design schema (based on real data)
3. **Phase 3**: Build API client & sync logic
4. **Phase 4**: Add UI sync buttons
5. **Phase 5**: Test & refine

## Files to Create/Modify

### New Files
- `convex/testReadwiseApi.ts` - Test action to fetch sample data
- `convex/readwiseApi.ts` - Readwise API client
- `convex/syncReadwise.ts` - Sync orchestration

### Modified Files
- `convex/schema.ts` - Add authors, sources, highlights, tags, highlightTags tables
- `src/routes/(authenticated)/inbox/+page.svelte` - Add sync button in empty state
- `src/lib/components/inbox/InboxHeader.svelte` - Add sync option to menu

## Next Step

**Start with Phase 1**: Create test action to fetch real Readwise data and log the structure.

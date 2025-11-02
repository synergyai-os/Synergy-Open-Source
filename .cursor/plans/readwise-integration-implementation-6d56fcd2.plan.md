<!-- 6d56fcd2-6686-460a-bb6b-4a97f40a9ce5 a42dd591-9c1f-4efb-832e-943709e0f1f6 -->
# Readwise Integration Implementation Plan

## Overview

Implement Readwise API integration with a universal inbox data structure that supports future source types (photos, manual text, URLs, emails). Use polymorphic `inboxItems` table with discriminated unions, keep specialized tables for complex relationships, and add sync functionality.

## Phase 1: Update Schema for Universal Inbox

### 1.1 Add Universal InboxItems Table

**File**: `convex/schema.ts`

Add polymorphic `inboxItems` table using discriminated unions:

- Common fields: `userId`, `processed`, `processedAt`, `createdAt`, `type` (discriminator)
- `readwise_highlight` variant: Links to `highlights` table via `highlightId`
- `photo_note` variant: `imageFileId`, `transcribedText`, `ocrStatus`, `source` (for future)
- `manual_text` variant: `text`, `bookTitle`, `pageNumber` (for future)
- Add indexes: `by_user`, `by_user_type`, `by_user_processed`

### 1.2 Update Highlights Table

**File**: `convex/schema.ts`

Remove `processed` field from `highlights` table (moved to `inboxItems`). Highlights will be linked from inboxItems rather than being inbox items directly.

### 1.3 Add Universal Tagging

**File**: `convex/schema.ts`

Add `inboxItemTags` table for universal tagging:

- Links `inboxItems` to `tags` (many-to-many)
- Indexes: `by_inbox_item`, `by_tag`, `by_inbox_item_tag`

## Phase 2: Readwise API Client

### 2.1 Create Readwise API Client

**File**: `convex/readwiseApi.ts` (new)

Functions:

- `fetchHighlights(apiKey, pageCursor?)` - Fetch highlights with pagination
- `fetchBooks(apiKey, pageCursor?)` - Fetch books/sources with pagination
- Handle rate limiting (429 responses with Retry-After header)
- Error handling for auth failures, network errors

### 2.2 Data Normalization Utilities

**File**: `convex/readwiseUtils.ts` (new)

Helper functions:

- `normalizeAuthorName(name: string)` - Parse comma-separated authors, normalize names
- `parseAuthorString(authors: string)` - Split and normalize multiple authors
- `parseISODate(dateStr: string)` - Convert ISO dates to timestamps
- `normalizeTagName(tag: string)` - Lowercase, trim tag names

## Phase 3: Sync Orchestration

### 3.1 Sync Readwise Highlights

**File**: `convex/syncReadwise.ts` (new)

Main sync function `syncReadwiseHighlights`:

1. Get encrypted API key from userSettings
2. Decrypt API key (server-side only)
3. Fetch all books (paginated)
4. Normalize and insert/update authors (handle comma-separated)
5. Insert/update sources (link to authors via sourceAuthors)
6. Create/assign tags from source tags
7. Fetch all highlights (paginated)
8. For each highlight:

   - Find or create source
   - Insert/update highlight in `highlights` table
   - Create inbox item in `inboxItems` table (type: `readwise_highlight`)
   - Link highlight via `highlightId`

9. Update `lastReadwiseSyncAt` in userSettings

### 3.2 Duplicate Prevention

- Use `externalId` index on `sources` table
- Use `externalId` index on `highlights` table
- Check if source/highlight exists before inserting
- Update if exists (based on `updatedAt` from Readwise)

### 3.3 Incremental Sync Support

- Use `lastReadwiseSyncAt` to track sync timestamp
- Fetch only highlights/sources updated after last sync (via API filters)
- Update `updatedAt` fields when syncing

## Phase 4: Convex Functions & Queries

### 4.1 Inbox Queries

**File**: `convex/inbox.ts` (new)

Functions:

- `listInboxItems(userId, filterType?)` - Query inboxItems by user, optionally filter by type
- `getInboxItem(inboxItemId)` - Get single inbox item with full details
- `markProcessed(inboxItemId)` - Mark inbox item as processed
- `getInboxItemWithDetails(inboxItemId)` - Get inbox item with related data (author, source, tags)

### 4.2 Sync Actions

**File**: `convex/syncReadwise.ts`

Actions:

- `syncReadwiseHighlights(userId)` - Public action for syncing (called from UI)
- Internal helpers for normalization and data insertion

## Phase 5: UI Integration

### 5.1 Replace Mock Data with Real Queries

**File**: `src/routes/(authenticated)/inbox/+page.svelte`

- Replace `mockInboxItems` with Convex query `inbox:listInboxItems`
- Use real-time subscription for live updates
- Update `InboxItem` type to match schema
- Handle polymorphic types in detail view selection

### 5.2 Add Sync Button - Empty State

**File**: `src/routes/(authenticated)/inbox/+page.svelte`

- When inbox is empty, show sync button
- On click: Call `syncReadwise:syncReadwiseHighlights` action
- Show loading state during sync
- Show success/error message after sync

### 5.3 Add Sync Option to Inbox Menu

**File**: `src/lib/components/inbox/InboxHeader.svelte`

- Add "Sync Readwise Highlights" menu item to dropdown (three dots menu)
- Place before "Delete all" options
- Call sync action on click
- Show loading indicator in menu item

### 5.4 Update Detail Views

**File**: `src/lib/components/inbox/ReadwiseDetail.svelte`

- Update to use real data structure from Convex
- Fetch highlight details via `inbox:getInboxItemWithDetails`
- Display author, source, tags from linked tables
- Show external link to Readwise

## Phase 6: Data Migration & Testing

### 6.1 Test with Small Dataset

- Test sync with 5-10 highlights first
- Verify authors created correctly
- Verify sources linked to authors
- Verify highlights linked to sources
- Verify inbox items created

### 6.2 Test Duplicate Prevention

- Run sync twice with same data
- Verify no duplicate sources/highlights
- Verify updates work correctly

### 6.3 Test Incremental Sync

- Sync initial data
- Wait, then sync again
- Verify only new/updated items synced

### 6.4 Test Edge Cases

- Sources with multiple authors (comma-separated)
- Sources with no author
- Highlights with no tags
- Large datasets (100+ highlights)

## Implementation Details

### Schema Pattern

```typescript
inboxItems: defineTable(
  v.union(
    v.object({
      type: v.literal("readwise_highlight"),
      userId: v.id("users"),
      processed: v.boolean(),
      processedAt: v.optional(v.number()),
      createdAt: v.number(),
      highlightId: v.id("highlights"), // Link to highlights table
    }),
    // Future types: photo_note, manual_text, etc.
  )
)
```

### Sync Flow

1. User clicks sync → Calls action
2. Action fetches API key (decrypted)
3. Fetches books → Normalizes authors → Inserts sources
4. Fetches highlights → Inserts highlights → Creates inbox items
5. Updates sync timestamp
6. UI updates via real-time subscription

### Error Handling

- Invalid API key → Show user-friendly error
- Rate limiting → Show message, suggest retry later
- Network errors → Show error, allow retry
- Partial failures → Log errors, continue with successful items

## Files to Create/Modify

### New Files

- `convex/readwiseApi.ts` - API client
- `convex/readwiseUtils.ts` - Normalization utilities
- `convex/syncReadwise.ts` - Sync orchestration
- `convex/inbox.ts` - Inbox queries

### Modified Files

- `convex/schema.ts` - Add inboxItems table, update highlights table, add inboxItemTags
- `src/routes/(authenticated)/inbox/+page.svelte` - Replace mock data, add sync button
- `src/lib/components/inbox/InboxHeader.svelte` - Add sync menu option
- `src/lib/components/inbox/ReadwiseDetail.svelte` - Update for real data

## Success Criteria

- Readwise highlights sync successfully into inbox
- Authors, sources, highlights properly normalized and linked
- Tags properly assigned
- No duplicates on multiple syncs
- UI shows real data with real-time updates
- Sync works from both empty state button and menu option
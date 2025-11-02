# Data Structure Design Questions

## Critical Questions Before Building

### 1. Reader API Integration

**Question**: Should Reader API documents be inbox items or sources?

**Analysis**:
- Reader documents are full articles/documents (not highlights)
- User may want to review entire document for processing
- OR: Document becomes a "source" and user creates highlights within it

**Options**:
- **Option A**: Reader documents → `sources` table, user creates manual highlights from them
- **Option B**: Reader documents → `inboxItems` as `readwise_reader_document` type for review
- **Option C**: Reader documents → Both (source for reference, inbox item if user wants to process)

**Recommendation**: Option B - Treat as inbox items. User can review full document and decide to process it (extract key points, generate flashcards, etc.)

### 2. Photo Processing Workflow

**Question**: How do photos flow through the system?

**Workflow**:
1. User uploads photo → Stored in Convex file storage
2. Photo appears in inbox as `photo_note` type
3. OCR runs (async) → Extracts text
4. User reviews photo + extracted text
5. User can generate flashcards from text or add manual notes
6. Photo becomes a processed item

**Schema Needs**:
- `imageFileId` (Convex file storage ID)
- `transcribedText` (OCR result, optional)
- `ocrStatus` (pending/completed/failed)
- `source` (where photo came from - manual upload, mobile capture, etc.)

### 3. Manual Text Workflow

**Question**: How is manual text different from other sources?

**Workflow**:
1. User types text directly into inbox
2. Appears as `manual_text` type
3. Optional attribution (book title, page number) for context
4. User reviews and processes

**Schema Needs**:
- `text` (the content)
- `bookTitle` (optional - user-provided context)
- `pageNumber` (optional)
- No author/source relationships (unless user manually adds)

### 4. Chrome Extension URL Capture

**Question**: What data do we capture from URLs?

**Workflow**:
1. User clicks extension → Captures current page
2. Extension sends URL + metadata to Axon
3. Optionally: Full page content scrape
4. Appears in inbox as `url_capture` type
5. User reviews and processes

**Schema Needs**:
- `url` (unique identifier)
- `title` (from page metadata)
- `description` (from page metadata)
- `htmlContent` (optional - full scrape if enabled)
- `author` (optional - extracted from page)
- `capturedAt` (when extension captured)

**Considerations**:
- URL as external ID for duplicate prevention
- May want to link to `sources` table if URL represents an article/book

### 5. Email Integration

**Question**: How do emails flow into the system?

**Workflow**:
1. User forwards email to dedicated address (e.g., `axon@synergyai.nl`)
2. Email service (Resend?) receives and parses
3. Appears in inbox as `email` type
4. User reviews and processes

**Schema Needs**:
- `emailId` (unique identifier)
- `subject`
- `body` (HTML and/or text)
- `sender` (email address)
- `senderName` (display name)
- `receivedAt` (timestamp)
- `threadId` (optional - for email threads)
- Attachments? (future)

**Considerations**:
- Sender could link to `authors` table (if we create author records for email senders)
- Email thread = source

### 6. Universal Tagging

**Question**: Should all inbox items support tags?

**Answer**: **YES** - Universal tagging via `inboxItemTags` table:
```typescript
inboxItemTags: defineTable({
  inboxItemId: v.id("inboxItems"),
  tagId: v.id("tags"),
})
  .index("by_inbox_item", ["inboxItemId"])
  .index("by_tag", ["tagId"]);
```

**Benefits**:
- Filter by tag across all source types
- Consistent tagging experience
- Enables powerful queries

### 7. Author Attribution Across Sources

**Question**: How to handle authors for different source types?

**Approach**:
- **Readwise highlights**: Link to `authors` table via `sources` table
- **Reader documents**: Link to `authors` table if author exists in sources
- **Manual text**: Optional `authorId` field (user manually attributes)
- **Photos**: No author (unless manually added)
- **URLs**: Optional `authorId` (extracted from page or manually added)
- **Emails**: `sender` field (can optionally link to `authors` table)

**Schema Pattern**:
```typescript
// Some inbox item types have optional authorId
v.object({
  type: v.literal("manual_text"),
  // ...
  authorId: v.optional(v.id("authors")), // User can manually attribute
})
```

### 8. Source Attribution Across Sources

**Question**: What is a "source" for each type?

**Mapping**:
- **Readwise highlights**: `sources` table (book/article)
- **Reader documents**: Could be `sources` table entry or inline
- **Photos**: Optional `source` string (where photo came from)
- **Manual text**: Optional `bookTitle` (informal source)
- **URLs**: URL itself or `sources` table entry if represents article
- **Emails**: Email thread or sender

**Pattern**: 
- Use `sources` table for formal sources (books, articles)
- Use inline fields for informal sources (photo source, manual book title)

### 9. Duplicate Prevention

**Question**: How to prevent duplicates for each source type?

**Strategies**:
- **Readwise highlights**: `externalId` = Readwise highlight ID
- **Reader documents**: `externalId` = Readwise document ID
- **Photos**: File hash or user-provided unique identifier
- **Manual text**: No external ID (user intentionally creates)
- **URLs**: URL as unique identifier (normalized)
- **Emails**: Email ID or (sender + subject + receivedAt) hash

**Index Pattern**:
```typescript
.index("by_external_id", ["externalId"]) // For types with externalId
.index("by_url", ["url"]) // For url_capture type
.index("by_email_id", ["emailId"]) // For email type
```

### 10. Inbox Workflow Consistency

**Question**: Do all source types follow the same workflow?

**Answer**: **YES** - All follow CODE framework:
1. **Collect**: Source → Inbox (via sync, upload, manual entry)
2. **Organise**: User reviews in inbox (`processed = false`)
3. **Distill**: User triggers AI processing → Generate flashcards/notes
4. **Express**: User studies flashcards, uses notes

**Common Fields Needed**:
- `userId` (who owns it)
- `processed` (has user reviewed/processed)
- `processedAt` (when processed)
- `createdAt` (when added to inbox)
- `type` (discriminator)

## Summary

All source types should:
1. ✅ Go into unified `inboxItems` table with discriminated unions
2. ✅ Support universal tagging
3. ✅ Follow same inbox workflow (review → process → study)
4. ✅ Have type-specific fields for their unique needs
5. ✅ Link to specialized tables (authors, sources, tags) where relevant
6. ✅ Support duplicate prevention via type-specific external IDs

This design supports the universal inbox vision while maintaining flexibility for each source type's unique characteristics.


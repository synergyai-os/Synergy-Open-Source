# Readwise API Data Structure Analysis

Based on actual API responses from Readwise API.

## Highlights API Response

### Endpoint: `GET /api/v2/highlights/`

### Response Structure

```typescript
{
  count: number,           // Total number of highlights
  next: string | null,     // Next page URL
  previous: string | null, // Previous page URL
  results: Highlight[]     // Array of highlights
}
```

### Highlight Object

```typescript
{
  id: number,                    // Readwise highlight ID (unique)
  book_id: number,               // Reference to source/book
  text: string,                   // Highlight text content
  location: number,               // Location in source (offset/page number)
  location_type: string,         // "offset", "page", "chapter", etc.
  highlighted_at: string,         // ISO 8601 datetime
  updated: string,                // ISO 8601 datetime
  url: string,                    // Link to highlight in Readwise
  note: string,                   // User's note on highlight (can be empty)
  color: string,                 // Highlight color (can be empty)
  tags: []                        // Array of tags (usually empty for highlights)
}
```

**Key Observations:**

- `book_id` is just a number - need to join with books endpoint to get source details
- Tags are arrays but appear empty in examples (may be used for highlight-level tags)
- Location is numeric (offset or page number)
- `highlighted_at` is when user made the highlight
- `updated` is when highlight was last modified

## Books/Sources API Response

### Endpoint: `GET /api/v2/books/`

### Response Structure

```typescript
{
  count: number,           // Total number of books/sources
  next: string | null,     // Next page URL
  previous: string | null, // Previous page URL
  results: Source[]        // Array of books/sources
}
```

### Source/Book Object

```typescript
{
  id: number,                    // Readwise source ID (unique) - matches highlight.book_id
  title: string,                 // Source title
  author: string,                 // Author name(s) - comma-separated for multiple authors
  category: string,              // "books", "articles", "tweets", "pdfs", etc.
  source: string,                // "kindle", "reader", etc.
  source_url: string | null,     // Original source URL (for articles/web), null for Kindle books
  cover_image_url: string,       // Cover/thumbnail image URL
  highlights_url: string,        // Link to all highlights for this source
  num_highlights: number,        // Count of highlights
  last_highlight_at: string | null, // ISO 8601 datetime of most recent highlight
  asin: string | null,           // Amazon ASIN (for Kindle books only)
  tags: Tag[] | [],              // Array of tags on the source
  document_note: string,         // User's top-level note on the source
  updated: string                 // ISO 8601 datetime
}
```

### Tag Object (on Sources)

```typescript
{
  id: number,              // Readwise tag ID
  name: string,            // Tag name
  user_book: number        // Source/book ID this tag is applied to
}
```

**Key Observations:**

- Authors are strings (not separate objects with IDs from Readwise)
- One author string can contain multiple authors (comma-separated)
- Tags exist at the source level with structured objects (`{id, name, user_book}`)
- Sources can have different categories: "books", "articles", "tweets", "pdfs", etc.
- Sources can have different origins: "kindle", "reader", etc.
- `asin` is only present for Kindle books
- `source_url` is only present for web articles/documents

## Relationships

### In Readwise API:

```
Author (string) → Source/Book (id) → Highlights (id, book_id)
Tags → Sources (user_book)
```

### Notes:

- **Authors**: Just strings, no IDs. Same author name may appear across multiple sources.
- **Sources**: Have unique IDs, linked to highlights via `book_id`.
- **Tags**: Attached to sources (books), not individual highlights in the examples.
- **One-to-Many**: One source has many highlights.
- **Many-to-Many**: Tags ↔ Sources (via tag structure).

## Data Normalization Strategy

### For Our Schema:

1. **Authors Table**
   - Author names are just strings (no Readwise author IDs)
   - Need to normalize author names (handle comma-separated, etc.)
   - Same author name across sources = same author record

2. **Sources Table**
   - Store Readwise source ID (`externalId`)
   - Link to author(s) via `authorId` (many-to-one or many-to-many if multiple authors)
   - Store category, source type, URLs, etc.

3. **Highlights Table**
   - Store Readwise highlight ID (`externalId`)
   - Link to source via `sourceId`
   - Store text, location, notes, dates, etc.

4. **Tags Table**
   - Store Readwise tag ID (`externalId`)
   - Tag names (normalized)
   - Link to sources via many-to-many relationship

## Questions to Resolve

1. **Multiple Authors**: One source can have comma-separated authors - should we:
   - Parse and create separate author records?
   - Store as single string?
   - Create many-to-many relationship?

2. **Tags on Highlights**: Examples show empty tags arrays - do highlights ever have tags?

3. **Tag Uniqueness**: Tags are global per user in Readwise, but attached to specific sources?

4. **Location Types**: What are all possible `location_type` values?

5. **Source Categories**: What are all possible `category` values?

## Next Steps

1. Design schema tables based on this structure
2. Plan normalization logic (author parsing, tag handling)
3. Design sync strategy (fetch books first, then highlights, link them)

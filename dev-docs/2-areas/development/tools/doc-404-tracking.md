# Documentation 404 Tracking

**Purpose**: Automatically track broken links in documentation to maintain documentation health.

---

## Overview

The documentation system automatically logs all 404 errors to Convex, allowing you to:
- See which links are broken
- Track how often they're accessed
- Mark them as resolved when fixed
- Get statistics on documentation health

---

## How It Works

1. **Automatic Logging**: When a user hits a 404 in `/dev-docs/*`, it's automatically logged to Convex
2. **Deduplication**: Multiple hits to the same URL increment a counter instead of creating duplicate records
3. **Admin View**: View all unresolved 404s in the admin panel

## When We Log vs Skip

### ✅ **SKIP LOGGING** (Redirect - File Found)

**When**: File exists but accessed via wrong path (e.g., `/dev-docs/2-areas/system-architecture` → redirects to `/dev-docs/2-areas/architecture/system-architecture`)

**Why Skip**:
- File exists (successful resolution)
- Redirect fixes the issue automatically
- 404 log should only track actual missing files
- Prevents noise in 404 tracking

**Example**:
- User accesses: `/dev-docs/2-areas/system-architecture`
- System finds: `/dev-docs/2-areas/architecture/system-architecture.md`
- Action: Redirect (301) to correct path
- Result: **No 404 logged** ✅

### ❌ **LOG 404** (File Not Found)

**When**: File doesn't exist after trying all path variations

**Why Log**:
- Track broken links that need fixing
- Identify missing documentation that should exist
- Discover common typos or patterns to add to redirects
- Monitor documentation health

**Example**:
- User accesses: `/dev-docs/2-areas/nonexistent-page`
- System tries: All variations (exact path, with parent dirs, README.md, etc.)
- Result: File not found anywhere
- Action: **404 logged** ❌

---

## Admin Interface

**Location**: `/admin/doc-404s` _(coming soon)_

**Features**:
- List all unresolved 404s
- See hit counts and timestamps
- Mark errors as resolved
- View statistics

---

## Convex Functions

### `log404` (mutation)
Logs a 404 error. Called automatically by the error handler.

**Args**:
- `url`: The URL that returned 404
- `referrer`: Optional - where the link came from
- `userAgent`: Optional - user agent string
- `ipAddress`: Optional - IP address
- `sessionId`: Optional - user session ID

### `listUnresolved` (query)
Get all unresolved 404 errors, sorted by most recent.

### `listAll` (query)
Get all 404 errors (including resolved), sorted by most recent.

**Args**:
- `limit`: Optional - max number of results (default: 100)

### `resolve404` (mutation)
Mark a 404 error as resolved.

**Args**:
- `sessionId`: Required - authenticated session
- `id`: The 404 error ID
- `note`: Optional - resolution notes

### `getStats` (query)
Get statistics about 404 errors.

**Returns**:
- `total`: Total number of 404 errors
- `unresolved`: Number of unresolved errors
- `resolved`: Number of resolved errors
- `totalHits`: Total number of hits across all errors
- `unresolvedHits`: Total hits for unresolved errors

---

## Database Schema

**Table**: `doc404Errors`

**Fields**:
- `url`: The broken URL
- `referrer`: Where the link came from
- `userAgent`: User agent string
- `ipAddress`: IP address
- `userId`: User who encountered the error (if authenticated)
- `sessionId`: Session ID
- `count`: Number of times this URL was accessed
- `firstSeenAt`: When first encountered
- `lastSeenAt`: When last encountered
- `resolved`: Whether fixed
- `resolvedAt`: When resolved
- `resolvedBy`: Who resolved it
- `resolutionNote`: Notes about resolution

**Indexes**:
- `by_url`: Fast lookup by URL
- `by_resolved`: Get unresolved errors
- `by_last_seen`: Sort by most recent

---

## Usage Example

```typescript
// In admin page
import { useQuery, useMutation } from 'convex-svelte';
import { api } from '$convex/_generated/api';

// Get unresolved 404s
const unresolved = useQuery(api.doc404Tracking.listUnresolved);

// Get stats
const stats = useQuery(api.doc404Tracking.getStats);

// Resolve a 404
const resolve = useMutation(api.doc404Tracking.resolve404);
await resolve({ sessionId, id: errorId, note: 'Fixed link in README.md' });
```

---

## Future Enhancements

- [ ] Admin UI page (`/admin/doc-404s`)
- [ ] Automatic link validation script
- [ ] Email notifications for new 404s
- [ ] Integration with CI/CD to prevent broken links

---

**Last Updated**: 2025-01-XX


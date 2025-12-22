# URL Strategy

**Status**: ✅ Implemented (SYOS-611, SYOS-612)  
**Last Updated**: 2025-01-30

---

## Overview

SynergyOS uses path-based workspace routing (`/w/:slug/...`) for all workspace-scoped features. This provides clean, shareable, bookmarkable URLs that remain stable even when workspace names change.

---

## URL Structure

### Workspace Routes

**Pattern**: `/w/[slug]/[feature]`

**Examples**:
- `/w/acme-corp/circles` - Circles for "Acme Corp" workspace
- `/w/acme-corp/meetings` - Meetings for "Acme Corp" workspace
- `/w/acme-corp/inbox` - Inbox for "Acme Corp" workspace
- `/w/acme-corp/settings` - Workspace settings

### User Routes

**Pattern**: `/account/[feature]`

**Examples**:
- `/account` - User profile and account settings
- `/account/security` - Security settings (no workspace context)

---

## URL State (Query Params)

Path segments define **workspace + feature**. Query parameters define **UI state inside a feature** that should be shareable/bookmarkable (e.g., stacked panels, selected tabs).

### Principles

- **Namespaced keys**: each feature must own its query keys to avoid collisions.
	- Example: org-chart uses `nav` (stacked panels) + `circleTab` / `roleTab` (tab state).
- **Merge, don’t overwrite**: URL writers must patch the current URL (keep unrelated params intact).
- **Shallow routing only**: when updating query params from the client, use SvelteKit’s `pushState`/`replaceState` (never `window.history.*`).
- **Relative URLs only**: pass `pathname + search + hash` to `pushState/replaceState` (not `.href`).

### Example: Org Chart Deep Link

- `/w/acme-corp/chart?nav=c:abc123.r:def456&circleTab=members`
	- `nav=...` restores stacked panels (circle → role)
	- `circleTab=members` restores the active tab within the circle panel

### Key Implementations

- **Stacked navigation URL sync**: `src/lib/composables/useStackedNavigation.svelte.ts` (`nav` param)
- **Generic query-param sync**: `src/lib/composables/useUrlSearchParamSync.svelte.ts` (reusable for tabs/filters)
- **TabbedPanel URL support**: `src/lib/components/molecules/TabbedPanel.svelte` (opt-in via `urlParam`)

---

## Slug vs ID Strategy

### Why Slugs?

**Slugs** (e.g., `acme-corp`) are human-readable, SEO-friendly identifiers that:
- ✅ Are shareable and bookmarkable
- ✅ Provide context in URLs
- ✅ Are easier to remember than IDs
- ✅ Work well for subdomains/custom domains (future)

**IDs** (e.g., `j123abc...`) are:
- ❌ Not human-readable
- ❌ Hard to share/bookmark
- ❌ Provide no context
- ✅ Stable (never change)

**Decision**: Use slugs as primary identifier, with ID fallback for stability.

---

## URL Resolution Logic

When a user visits `/w/[slug]/...`, the system resolves the workspace in this order:

1. **Current Slug** → If slug matches current workspace slug, serve page
2. **Workspace ID** → If slug is actually a workspace ID, redirect to current slug
3. **Alias (Old Slug)** → If slug matches an old slug (from rename), redirect to current slug
4. **Not Found** → Redirect to first available workspace or onboarding

**Implementation**: `src/routes/(authenticated)/w/[slug]/+layout.server.ts`

---

## URL Stability (Aliases)

### Problem

When a workspace renames (e.g., `Agency Partner` → `Client-technologies`), old bookmarks and shared links break.

### Solution

**Workspace Aliases** preserve old slugs indefinitely:

- When workspace slug changes, old slug is saved as an alias
- Old URLs (`/w/old-slug/...`) automatically redirect to new slug (`/w/new-slug/...`)
- Aliases never expire (or very long TTL)
- Workspace IDs in URLs also redirect to current slug

**Schema**: `convex/workspaceAliases` table

**Example Flow**:
1. Workspace created with slug `Agency Partner`
2. User shares link: `/w/Agency Partner/circles`
3. Workspace renamed to `Client-technologies`
4. Old slug `Agency Partner` saved as alias
5. Old link `/w/Agency Partner/circles` → redirects to `/w/Client-technologies/circles` (301 permanent)

---

## Reserved Slugs

These slugs cannot be used for workspace URLs (conflict with system routes):

- `mail`, `api`, `app`, `www`
- `admin`, `blog`, `docs`, `help`, `support`, `status`
- `auth`, `login`, `signup`, `pricing`, `about`, `legal`
- `w` (workspace route prefix)
- `account`, `settings`, `profile`
- `invite`, `join`
- `dashboard`, `inbox`
- `dev`, `staging`, `test`
- `cdn`, `assets`, `static`

**Implementation**: `convex/workspaces.ts` → `RESERVED_SLUGS` array

**Validation**: Checked on workspace creation and slug updates

---

## Future Considerations

### Subdomains

**Future Pattern**: `acme-corp.synergyos.ai/circles`

- Requires DNS configuration
- Needs subdomain routing middleware
- Current path-based routing (`/w/:slug/`) is prerequisite

### Custom Domains

**Future Pattern**: `circles.acme-corp.com`

- Requires DNS + SSL certificate management
- Needs domain verification
- Current path-based routing (`/w/:slug/`) is prerequisite

### URL Shortening

**Future Pattern**: `synergyos.ai/s/acme-corp-circles`

- Short links for sharing
- Redirects to full path (`/w/acme-corp/circles`)
- Can track click analytics

---

## Implementation Details

### Schema

```typescript
// Workspaces table
workspaces: defineTable({
  name: v.string(),
  slug: v.string(), // URL-friendly identifier
  // ...
}).index('by_slug', ['slug'])

// Workspace aliases (for URL stability)
workspaceAliases: defineTable({
  workspaceId: v.id('workspaces'),
  slug: v.string(), // Old slug (before rename)
  createdAt: v.number()
}).index('by_slug', ['slug'])
```

### Key Functions

**Backend** (`convex/workspaces.ts`):
- `getBySlug(slug, sessionId)` - Resolve workspace by current slug
- `getById(workspaceId, sessionId)` - Resolve workspace by ID (for redirects)
- `updateSlug(workspaceId, newSlug)` - Update slug and create alias for old slug

**Backend** (`convex/workspaceAliases.ts`):
- `getBySlug(slug, sessionId)` - Resolve alias by old slug
- `createAlias(workspaceId, slug)` - Create alias record (internal)

**Frontend** (`src/routes/(authenticated)/w/[slug]/+layout.server.ts`):
- `resolveWorkspace(client, slugOrId, sessionId)` - Resolution logic (slug → ID → alias)

---

## Migration Notes

**SYOS-611**: Migrated from `?org=<id>` query params to `/w/:slug/` path-based routing

**SYOS-612**: Added URL stability with aliases and ID fallback

**No Backward Compatibility**: Clean cut-over (0 users at migration time)

---

## References

- **Parent Issue**: SYOS-611 - URL Architecture: Path-based Workspace Routing
- **Implementation**: SYOS-612 - URL Stability: Workspace Slug Aliases & ID Fallback
- **Schema**: `convex/schema.ts`
- **Backend**: `convex/workspaces.ts`, `convex/workspaceAliases.ts`
- **Frontend**: `src/routes/(authenticated)/w/[slug]/+layout.server.ts`


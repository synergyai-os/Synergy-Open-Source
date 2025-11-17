# URL Patterns Architecture

**Purpose**: Comprehensive guide to URL design principles, patterns, and best practices for SynergyOS.

**Last Updated**: 2025-11-17  
**Status**: Active Design Document

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Resource Identification](#resource-identification)
3. [Multi-Tenancy Context](#multi-tenancy-context)
4. [Current Patterns](#current-patterns)
5. [Migration Guide](#migration-guide)
6. [Validation Checklist](#validation-checklist)

---

## Core Principles

### 1. Resource Identification (Zalando REST API Guidelines)

**Principle**: Use path segments for resources, IDs for identification.

- ✅ **Use IDs in paths**: `/org/teams/{teamId}` (stable, never changes)
- ❌ **Avoid slugs in paths**: `/org/teams/{slug}` (breaks when name changes)
- ✅ **Nested resources**: Sub-resources belong in parent paths
- ✅ **Query parameters for context**: Use `?org={id}` for scoping, not path segments

**Key Rule**: "Each sub-path should be a valid reference" — `/org/teams` and `/org/teams/{id}` should both be valid.

### 2. Multi-Tenancy Context (Laravel Multi-tenancy Patterns)

**Principle**: Explicit tenant context in URLs enables shareability and debugging.

- ✅ **Explicit context**: Always include `?org={id}` in org-scoped URLs
- ❌ **Implicit context**: Relying on session/state (not shareable)
- ✅ **Context before queries**: Set tenant context before executing queries

**Pattern**: Tenant ID in URL → Set context → Execute queries

### 3. Shallow Nesting (Rails Routing Patterns)

**Principle**: Avoid deep nesting; use shallow routes for better UX.

- ✅ **Shallow nesting**: `/org/teams/{teamId}` (one level)
- ❌ **Deep nesting**: `/org/{orgId}/teams/{teamId}` (verbose, harder to maintain)
- ✅ **Resource-centric**: URLs represent resources (nouns), not actions (verbs)

**Rails Pattern**: `/magazines/{magazine_id}/ads/{ad_id}` but also `/ads/{ad_id}` (shallow)

### 4. Stable URLs (General Best Practices)

**Principle**: URLs should remain valid even when resource properties change.

- ✅ **IDs are stable**: Database IDs never change
- ❌ **Slugs can change**: Derived from names, break when renamed
- ✅ **Shareable links**: URLs work when shared/bookmarked

---

## Resource Identification

### Path Segments

**Format**: `/resources/{resource-id}/sub-resources/{sub-resource-id}`

**Examples**:
```
/org/circles/{circleId}              # Circle detail
/org/teams/{teamId}                  # Team detail (use ID, not slug)
/meetings/{meetingId}               # Meeting detail
```

### Query Parameters

**Purpose**: Context, filtering, pagination (not primary identification)

**Format**: `?org={orgId}&sort={field}&offset={number}`

**Examples**:
```
/org/circles?org={orgId}                    # List with org context
/org/teams/{teamId}?org={orgId}            # Detail with org context
/meetings/{meetingId}?org={orgId}         # Detail with org context
```

### Naming Conventions

- **Path segments**: `kebab-case` (e.g., `/org/teams`, `/meeting-templates`)
- **Query parameters**: `snake_case` (e.g., `?org_id={id}`, `?sort_by={field}`)
- **Resource names**: Plural nouns (e.g., `/teams`, `/circles`, `/meetings`)

---

## Multi-Tenancy Context

### Explicit Context Pattern (Recommended)

**Pattern**: Always include `?org={id}` in org-scoped URLs

**Why**:
- Shareable/bookmarkable URLs
- Explicit context (easier debugging)
- Context set before queries (prevents race conditions)
- Consistent pattern across all routes

**Examples**:
```
/org/circles?org={orgId}                    # List
/org/circles/{circleId}?org={orgId}        # Detail
/org/teams?org={orgId}                      # List
/org/teams/{teamId}?org={orgId}            # Detail
/org/members?org={orgId}                    # List
/meetings/{meetingId}?org={orgId}         # Detail (if org-scoped)
```

### Context Processing Flow

1. **URL contains `?org={id}`** → Extract from query params
2. **Set `activeOrganizationId`** → Update `useOrganizations` composable
3. **Wait for context** → Ensure `activeOrganizationId` is set before queries
4. **Execute queries** → Use `organizationId()` from context
5. **Clean up URL** → Remove `?org={id}` param after processing (optional)

**Implementation**:
```typescript
// ✅ CORRECT: Wait for org context before querying
$effect(() => {
  const orgId = organizationId(); // From URL param
  if (!orgId) return; // Wait for context
  // Now safe to query
});

// ❌ WRONG: Query runs before context is set
const teamQuery = useQuery(api.teams.getTeam, () => ({
  organizationId: organizationId() // May be undefined!
}));
```

---

## Current Patterns

### ✅ Correct Patterns (Keep)

1. **Circles use ID**: `/org/circles/[id]` ✅
2. **Meetings use ID**: `/meetings/[id]` ✅
3. **Resource-centric URLs**: Nouns, not verbs ✅
4. **Shallow nesting**: One level deep ✅

### ❌ Issues Found (Fix Required)

1. **Teams use slug**: `/org/teams/[slug]` ❌
   - **Problem**: Slug changes when name changes → broken URLs
   - **Fix**: Change to `/org/teams/[id]`

2. **Inconsistent org context**: 
   - Some routes: `/org/circles?org={id}` (explicit) ✅
   - Other routes: `/org/teams/[slug]` (implicit) ❌
   - **Fix**: Always include `?org={id}` in org-scoped URLs

3. **Race condition**: Queries may run before org context is set
   - **Fix**: Wait for `activeOrganizationId` before querying

---

## Migration Guide

### Step 1: Change Team Route from Slug to ID

**Current**:
```
/org/teams/[slug]/+page.svelte
redirectUrl = `/org/teams/${result.teamSlug}?org=${result.organizationId}`
```

**Target**:
```
/org/teams/[id]/+page.svelte
redirectUrl = `/org/teams/${result.teamId}?org=${result.organizationId}`
```

**Files to modify**:
- `src/routes/(authenticated)/org/teams/[slug]/+page.svelte` → Rename to `[id]`
- `convex/teams.ts` → Update `acceptTeamInvite` to return `teamId` instead of `teamSlug`
- `src/routes/invite/+page.svelte` → Update redirect to use `teamId`
- `src/lib/composables/useTeams.svelte.ts` → Update `getTeamBySlug` to `getTeamById`

### Step 2: Ensure Org Context in All URLs

**Current**:
```
/org/circles/{circleId}                    # Missing org param
/org/teams/{teamId}                        # Missing org param
```

**Target**:
```
/org/circles/{circleId}?org={orgId}        # Explicit org context
/org/teams/{teamId}?org={orgId}            # Explicit org context
```

**Files to modify**:
- All redirects: Add `?org={orgId}` to org-scoped URLs
- All links: Include org param when navigating to org-scoped routes
- `src/lib/components/Sidebar.svelte` → Update navigation links

### Step 3: Fix Query Race Condition

**Current**:
```typescript
// Query may run before org context is set
const teamQuery = useQuery(api.teams.getTeam, () => ({
  organizationId: organizationId() // May be undefined!
}));
```

**Target**:
```typescript
// Wait for org context before querying
$effect(() => {
  const orgId = organizationId();
  if (!orgId) return; // Wait for context
  // Now safe to query
});
```

**Files to modify**:
- `src/lib/composables/useTeams.svelte.ts` → Add context check
- `src/routes/(authenticated)/org/teams/[id]/+page.svelte` → Wait for context
- `src/routes/(authenticated)/org/circles/[id]/+page.svelte` → Wait for context

---

## Validation Checklist

### ✅ URL Pattern Validation

- [ ] **All resource routes use IDs** (not slugs)
  - [ ] `/org/teams/[id]` (not `[slug]`)
  - [ ] `/org/circles/[id]` ✅
  - [ ] `/meetings/[id]` ✅

- [ ] **All org-scoped URLs include `?org={id}`**
  - [ ] `/org/circles?org={id}` ✅
  - [ ] `/org/circles/{id}?org={id}`
  - [ ] `/org/teams?org={id}`
  - [ ] `/org/teams/{id}?org={id}`
  - [ ] `/org/members?org={id}`

- [ ] **All redirects use correct pattern**
  - [ ] Invite acceptance redirects include `?org={id}`
  - [ ] Navigation links include `?org={id}` when org-scoped
  - [ ] Deep links work when shared/bookmarked

- [ ] **Queries wait for org context**
  - [ ] `useTeams` waits for `organizationId()` before querying
  - [ ] `useCircles` waits for `organizationId()` before querying
  - [ ] No race conditions where queries run before context is set

### ✅ Backend Validation

- [ ] **Mutations return IDs** (not slugs)
  - [ ] `acceptTeamInvite` returns `teamId` (not `teamSlug`)
  - [ ] `createTeam` returns `teamId` (not `teamSlug`)

- [ ] **Queries accept IDs** (not slugs)
  - [ ] `getTeamById` exists (not just `getTeamBySlug`)
  - [ ] All team queries use `teamId` parameter

### ✅ Frontend Validation

- [ ] **Route files use correct pattern**
  - [ ] `/org/teams/[id]/+page.svelte` exists (not `[slug]`)
  - [ ] All route params use `id` (not `slug`)

- [ ] **Composables handle IDs**
  - [ ] `useTeams` accepts `teamId` (not `teamSlug`)
  - [ ] `getTeamById` query exists and works

- [ ] **Navigation uses correct URLs**
  - [ ] All `goto()` calls include `?org={id}` for org-scoped routes
  - [ ] All `href` links include `?org={id}` for org-scoped routes
  - [ ] `resolveRoute()` used for all internal navigation

---

## Examples

### ✅ Correct: Team Detail with Org Context

```typescript
// Route: /org/teams/[id]/+page.svelte
const teamId = $derived($page.params['id'] as string);
const organizationId = $derived(() => {
  if (!organizations) return undefined;
  return organizations.activeOrganizationId ?? undefined;
});

// Wait for org context before querying
$effect(() => {
  if (browser && !organizationId()) {
    goto(resolveRoute('/org/onboarding'));
  }
});

// Query uses ID and waits for org context
const teamQuery = browser && getSessionId() && organizationId() && teamId
  ? useQuery(api.teams.getTeamById, () => {
      const sessionId = getSessionId();
      const orgId = organizationId();
      const id = teamId;
      if (!sessionId || !orgId || !id)
        throw new Error('sessionId, organizationId, and teamId required');
      return {
        sessionId,
        organizationId: orgId as Id<'organizations'>,
        teamId: id as Id<'teams'>
      };
    })
  : null;
```

### ✅ Correct: Redirect After Invite Acceptance

```typescript
// src/routes/invite/+page.svelte
if (invite.type === 'team') {
  const result = await convexClient.mutation(api.teams.acceptTeamInvite, {
    sessionId,
    code: inviteCode
  });

  // ✅ Use teamId (not teamSlug) + include org param
  redirectUrl = resolveRoute(
    `/org/teams/${result.teamId}?org=${result.organizationId}`
  );
}
```

### ✅ Correct: Backend Returns ID

```typescript
// convex/teams.ts
export const acceptTeamInvite = mutation({
  // ...
  handler: async (ctx, args) => {
    // ... accept invite logic ...
    
    return {
      teamId: invite.teamId,  // ✅ Return ID, not slug
      organizationId: invite.organizationId
    };
  }
});
```

---

## References

- **Zalando REST API Guidelines**: Resource identification, query parameters
- **Laravel Multi-tenancy**: Tenant identification patterns
- **Rails Routing**: Shallow nesting, resource-centric design
- **Next.js Routing**: Dynamic segments, query parameters
- **Pattern Index**: `dev-docs/2-areas/patterns/INDEX.md` (pattern #L3400)

---

**Related Documents**:
- `dev-docs/2-areas/patterns/ui-patterns.md` - Navigation patterns
- `dev-docs/2-areas/architecture/multi-tenancy/multi-tenancy-migration.md` - Multi-tenancy architecture
- `dev-docs/2-areas/patterns/convex-integration.md` - Convex integration patterns


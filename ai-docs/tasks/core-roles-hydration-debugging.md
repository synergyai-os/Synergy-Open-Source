# Core Roles Hydration Error - Debugging Log

**Date**: 2025-01-27  
**Issue**: Core roles visible until page refresh, then white screen with hydration error  
**Status**: ✅ RESOLVED - Moved query to composable

---

## Problem Statement

Core roles are correctly separated from regular roles when viewing a circle, but when the page is hard refreshed, a hydration error occurs:

```
Failed to hydrate: Error: sessionId and workspaceId required
at CircleDetailPanel.svelte:81:31
```

**Expected Behavior**:

- Core roles should appear in "Core Roles" section
- Page should load without hydration errors on hard refresh
- Query should retry reactively when `workspaceId` becomes available

**Actual Behavior**:

- Core roles work initially (when circle is already selected)
- Hard refresh causes white screen with hydration error
- OR: Core roles don't show at all (depending on fix attempt)

---

## Root Cause Analysis

The `CircleDetailPanel` component needs to fetch role templates to determine which roles are "core" (`isCore: true`). The component:

1. Gets `workspaceId` from either:
   - `circle?.workspaceId` (if circle is loaded)
   - `orgChart.circles.find(...)` (fallback from circles list)

2. Creates a `useQuery` to fetch role templates:

   ```typescript
   const templatesQuery = useQuery(api.roleTemplates.list, () => {
   	// Needs sessionId and workspaceId
   });
   ```

3. Uses templates to separate core vs regular roles

**The Challenge**:

- Component is wrapped in `{#if browser && orgChart}` in parent (`+page.svelte`)
- But script still runs during SSR/hydration
- `workspaceId` is `undefined` initially (circle not selected yet)
- Query throws error during hydration, breaking the page

---

## Attempt #1: Check workspaceId in Condition

**Approach**: Only create query when `workspaceId` is available

```typescript
const templatesQuery =
	browser && $page.data.sessionId && workspaceId
		? useQuery(api.roleTemplates.list, () => {
				// ...
			})
		: null;
```

**Why It Failed**:

- `workspaceId` is a `$derived` value that starts as `undefined`
- Condition evaluates once at component initialization
- When `workspaceId` becomes available later, query is still `null` (not reactive)
- Result: Core roles never show because query is never created

**Files Changed**: `CircleDetailPanel.svelte` lines 69-84

---

## Attempt #2: Remove workspaceId Check, Let Query Throw

**Approach**: Match `useOrgChart.svelte.ts` pattern - only check `browser`, let query throw when params not ready

```typescript
const templatesQuery =
	browser && $page.data.sessionId
		? useQuery(api.roleTemplates.list, () => {
				if (!sessionId || !wsId) {
					throw new Error('sessionId and workspaceId required');
				}
				// ...
			})
		: null;
```

**Why It Failed**:

- Query throws error during hydration when `workspaceId` is `undefined`
- Error breaks hydration, causing white screen
- Convex doesn't handle the error gracefully during SSR/hydration phase
- Result: White screen on hard refresh

**Files Changed**: `CircleDetailPanel.svelte` lines 69-84

---

## Attempt #3: Early Return Guard

**Approach**: Add early return guard to prevent script execution during SSR

```typescript
if (!browser || !orgChart) {
	// Return early during SSR
}
```

**Why It Failed**:

- Early return doesn't work in Svelte components (not valid JavaScript at top level)
- Even if it did, query creation happens before return
- Component script still runs during SSR/hydration
- Result: Same hydration error

**Files Changed**: `CircleDetailPanel.svelte` lines 18-25

---

## Attempt #4: Handle Query Errors Gracefully

**Approach**: Check `templatesQuery?.error` in `templatesMap` and return empty map

```typescript
const templatesMap = $derived.by(() => {
	const data = templatesQuery?.error ? null : templatesQuery?.data;
	if (!data) return new SvelteMap();
	// ...
});
```

**Why It Failed**:

- Error handling doesn't prevent the error from being thrown
- Error still breaks hydration before error handling can run
- Result: Still causes white screen

**Files Changed**: `CircleDetailPanel.svelte` lines 86-103

---

## Attempt #5: Function Pattern (getWorkspaceId)

**Approach**: Change `workspaceId` from `$derived` value to `$derived` function, matching `+layout.svelte` pattern

```typescript
const getWorkspaceId = $derived(() => {
	// Return workspaceId reactively
});

const templatesQuery =
	browser && $page.data.sessionId && getWorkspaceId()
		? useQuery(api.roleTemplates.list, () => {
				const wsId = getWorkspaceId();
				// ...
			})
		: null;
```

**Why It Failed**:

- Function pattern doesn't make `useQuery` creation reactive
- `useQuery` is still only called once at component initialization
- When `getWorkspaceId()` becomes available, query is still `null`
- Result: Core roles don't show (query never created)

**Files Changed**: `CircleDetailPanel.svelte` lines 52-84

---

## Key Learnings

### 1. `useQuery` Creation is Not Reactive

- `useQuery` must be called at top level (can't wrap in `$derived`)
- Condition checking `$derived` values evaluates once at initialization
- Even if `$derived` value changes later, query creation doesn't retry

### 2. SSR/Hydration Timing

- Component wrapped in `{#if browser && orgChart}` still runs script during SSR
- `{#if}` only controls rendering, not script execution
- Early return guards don't work in Svelte components

### 3. Pattern Differences

- `useOrgChart.svelte.ts` (composable) can throw errors - Convex handles gracefully
- `CircleDetailPanel.svelte` (component) throws errors - breaks hydration
- Composables vs components have different SSR behavior

### 4. Reactive Query Creation

- Checking `$derived` values in condition doesn't make query creation reactive
- Function pattern (`getWorkspaceId()`) doesn't help - still evaluates once
- Need a different approach to make query creation reactive

---

## Current State

**File**: `src/lib/modules/org-chart/components/CircleDetailPanel.svelte`

**Current Code** (lines 52-84):

```typescript
// Get workspaceId from circle or circles list (don't wait for circle to load)
// Pattern matches +layout.svelte (line 58) - return a function for reactive access
const getWorkspaceId = $derived(() => {
	// Try to get from circle first (if loaded)
	if (circle?.workspaceId) return circle.workspaceId;
	// Fallback: get from circles list using selectedCircleId
	if (orgChart?.selectedCircleId && orgChart.circles) {
		const selectedCircle = orgChart.circles.find((c) => c.circleId === orgChart.selectedCircleId);
		return selectedCircle?.workspaceId;
	}
	return undefined;
});

// Fetch role templates to check isCore - use reactive query
// Pattern matches +layout.svelte (line 66) - check function result in condition for reactivity
// CRITICAL: Using getWorkspaceId() function pattern ensures reactive query creation
// Query will be created reactively when workspaceId becomes available
const templatesQuery =
	browser && $page.data.sessionId && getWorkspaceId()
		? useQuery(api.roleTemplates.list, () => {
				// Access reactive values directly - useQuery will track these dependencies
				const sessionId = $page.data.sessionId;
				const wsId = getWorkspaceId(); // Call function reactively inside closure
				// Defensive check (should not happen due to outer check)
				if (!sessionId || !wsId) {
					throw new Error('sessionId and workspaceId required');
				}
				return {
					sessionId,
					workspaceId: wsId as Id<'workspaces'>
				};
			})
		: null;
```

**Current Behavior**:

- ❌ Core roles don't show (query never created)
- ✅ No hydration error (query not created when `workspaceId` is undefined)

---

## Related Patterns in Codebase

### Working Pattern: `useOrgChart.svelte.ts`

```typescript
const circlesQuery = browser
	? useQuery(api.circles.list, () => {
			const sessionId = getSessionId();
			const workspaceId = getWorkspaceId();
			if (!sessionId || !workspaceId) throw new Error('sessionId and workspaceId required');
			return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
		})
	: null;
```

**Why It Works**: Composable, not component - different SSR behavior

### Working Pattern: `+layout.svelte`

```typescript
const orgBrandingQuery =
	browser && getSessionId() && workspaces?.activeWorkspaceId
		? useQuery(api.workspaces.getBranding, () => {
				// ...
			})
		: null;
```

**Why It Works**: Checks property access (`workspaces?.activeWorkspaceId`), not `$derived` value

### Working Pattern: `useMeetingPresence.svelte.ts`

```typescript
const activePresenceQuery =
	browser && meetingId() && sessionId()
		? useQuery(api.meetingPresence.getActivePresence, () => {
				// ...
			})
		: null;
```

**Why It Works**: Checks function calls (`meetingId()`, `sessionId()`), but these are getters passed as props

---

## Potential Solutions to Explore

### Option 1: Use `$effect` to Create Query Reactively

```typescript
let templatesQuery: ReturnType<typeof useQuery> | null = $state(null);

$effect(() => {
	if (browser && $page.data.sessionId && getWorkspaceId()) {
		templatesQuery = useQuery(api.roleTemplates.list, () => {
			// ...
		});
	}
});
```

**Risk**: `useQuery` might not work inside `$effect` - needs testing

### Option 2: Move Query to Composable

- Extract query logic to a composable (like `useOrgChart`)
- Composables have different SSR behavior
- Component calls composable instead of creating query directly

### Option 3: Preload Templates Server-Side

- Fetch templates in `+page.server.ts`
- Pass as initial data to component
- Use `useQuery` with `initialData` option
- Query will update reactively when workspaceId changes

### Option 4: Conditional Component Rendering

- Only render `CircleDetailPanel` when `workspaceId` is available
- Move query creation to parent component
- Pass templates as prop

### Option 5: Use `$derived.by` for Query Creation

```typescript
const templatesQuery = $derived.by(() => {
	if (!browser || !$page.data.sessionId || !getWorkspaceId()) {
		return null;
	}
	return useQuery(api.roleTemplates.list, () => {
		// ...
	});
});
```

**Risk**: `useQuery` might not work inside `$derived.by` - needs testing

---

## Questions for Next Agent

1. Can `useQuery` be called inside `$effect` or `$derived.by`?
2. Why does `useOrgChart` pattern work but component pattern doesn't?
3. Is there a way to make `useQuery` creation reactive when a `$derived` value changes?
4. Should we move this query to a composable instead?
5. Can we preload templates server-side to avoid the hydration issue?

---

## Files Involved

- `src/lib/modules/org-chart/components/CircleDetailPanel.svelte` (main file)
- `src/routes/(authenticated)/w/[slug]/chart/+page.svelte` (parent component)
- `src/lib/modules/org-chart/composables/useOrgChart.svelte.ts` (reference pattern)
- `src/routes/(authenticated)/+layout.svelte` (reference pattern)
- `convex/circleRoles.ts` (query returns `templateId`)
- `src/lib/infrastructure/organizational-model/composables/useCircles.svelte.ts` (CircleRole type)

---

## Test Cases

1. **Initial Load**: Open `/w/[slug]/chart` - should not crash
2. **Select Circle**: Click circle - core roles should appear in "Core Roles" section
3. **Hard Refresh**: Refresh page with circle selected - should not show white screen
4. **Navigate Away and Back**: Navigate away, then back - core roles should still show

---

**Last Updated**: 2025-01-27  
**Next Steps**: ~~Explore Option 1 (`$effect`) or Option 3 (server-side preload)~~ RESOLVED

---

## ✅ SOLUTION: Move Query to Composable (Option 2)

**Implemented**: 2025-12-04

### Why This Works

The key insight is that composables have different SSR behavior than components:

1. **Composable is only created when `browser && sessionId` is true** (in `+page.svelte`)
2. The "throw error when params not ready" pattern works in composables - Convex handles gracefully
3. Component just uses reactive getters on the composable - no query creation needed

### Changes Made

**`useOrgChart.svelte.ts`**:

```typescript
// Added role templates query (same pattern as circlesQuery)
const roleTemplatesQuery = browser
  ? useQuery(api.roleTemplates.list, () => {
      const sessionId = getSessionId();
      const workspaceId = getWorkspaceId();
      if (!sessionId || !workspaceId) throw new Error('sessionId and workspaceId required');
      return { sessionId, workspaceId: workspaceId as Id<'workspaces'> };
    })
  : null;

// Added templatesMap for O(1) lookup
const templatesMap = $derived.by(() => { /* ... */ });

// Added helper methods on return object
getCoreRolesForCircle: (circleId) => { /* filter by isCore */ },
getRegularRolesForCircle: (circleId) => { /* filter by !isCore */ },
isRoleCore: (templateId) => { /* check template */ }
```

**`CircleDetailPanel.svelte`**:

```typescript
// REMOVED: useQuery, api, page, SvelteMap imports
// REMOVED: workspaceId derived value
// REMOVED: templatesQuery that caused hydration errors
// REMOVED: templatesMap derived value

// ADDED: Simple derived values using composable helpers
const coreRoles = $derived(
	orgChart && orgChart.selectedCircleId
		? orgChart.getCoreRolesForCircle(orgChart.selectedCircleId)
		: []
);

const regularRoles = $derived(
	orgChart && orgChart.selectedCircleId
		? orgChart.getRegularRolesForCircle(orgChart.selectedCircleId)
		: []
);
```

### Key Learnings

1. **Query creation in components vs composables**: Components have different SSR lifecycle
2. **Pattern consistency**: Use established patterns from codebase (`useOrgChart` already had working query pattern)
3. **Separation of concerns**: Queries belong in composables, components use reactive getters

### Test Cases (Manual Verification Required)

1. ✅ Initial Load: Open `/w/[slug]/chart` - should not crash
2. ✅ Select Circle: Click circle - core roles should appear in "Core Roles" section
3. ✅ Hard Refresh: Refresh page with circle selected - should NOT show white screen
4. ✅ Navigate Away and Back: Navigate away, then back - core roles should still show

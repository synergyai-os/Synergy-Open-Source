# Patterns & Lessons Learned

This document captures reusable solutions, common issues, and architectural patterns discovered during development. Use this as a reference to avoid repeating mistakes and leverage proven solutions.

---

## Sidebar/Detail View Reactivity Issues

**Date**: 2025-01-02  
**Issue**: Sidebar component not updating when switching items, or showing stale data from previous selection.

### Problem

When switching between inbox items:
- Sidebar (detail view) would not update with new item's data
- Sometimes showed tags/metadata from previously selected item
- Component would initialize with stale data during async loading

### Root Cause

Race condition between component remounting and async data loading:

1. When `selectedItemId` changes → `{#key selectedItemId}` remounts component immediately
2. But `selectedItem` still contains old data (async query hasn't completed)
3. Component initializes state (like `selectedTagIds`) from stale data
4. When query completes, component state may not update correctly

### Solution

**Pattern**: Use data-based keys instead of ID-based keys for async data

```svelte
<!-- ❌ WRONG: Remounts before data loads -->
{#key selectedItemId}
  <ReadwiseDetail item={selectedItem} />
{/key}

<!-- ✅ CORRECT: Remounts only when actual data changes -->
{#key selectedItem._id}
  <ReadwiseDetail item={selectedItem} />
{/key}
```

**Why it works**:
- Component only remounts when `selectedItem` actually changes (after query completes)
- Component initializes with correct data from the start
- No stale data initialization

### Additional Patterns Used

1. **Query tracking for race conditions**:
   ```javascript
   let currentQueryId: string | null = null;
   
   $effect(() => {
     const queryId = selectedItemId;
     currentQueryId = queryId;
     
     convexClient.query(...)
       .then((result) => {
         // Only update if still current query
         if (currentQueryId === queryId) {
           selectedItem = result;
         }
       });
   });
   ```

2. **$effect vs $derived for async operations**:
   - Use `$effect` for side effects (API calls, subscriptions)
   - Use `$derived` for computed values
   - `$effect` provides cleanup functions for proper resource management

### Key Takeaway

When using `{#key}` blocks with async data:
- **Don't** key on the ID that triggers the async operation
- **Do** key on the actual data result (e.g., `selectedItem._id`)
- This ensures component remounts with correct data, not stale data

---

## Composables with Svelte 5 Runes

**Date**: 2025-01-02  
**Issue**: TypeScript linter errors when using `$state` runes in composable functions stored in `.ts` files.

### Problem

When extracting reusable logic into composables (like `useInboxSync.ts`):
- TypeScript linter errors: "Cannot assign to 'showSyncConfig' because it is a constant"
- `$state` runes don't work properly in regular `.ts` files
- State variables declared with `const` and `$state()` cannot be reassigned

### Root Cause

Svelte 5 runes (`$state`, `$derived`, `$effect`) are compiler features that need special processing:
- Regular `.ts` files are processed by TypeScript compiler only
- Svelte compiler needs to process files to transform runes
- Files with `.svelte.ts` extension are processed by Svelte compiler

### Solution

**Pattern**: Use `.svelte.ts` extension for composables that use runes

```
// ❌ WRONG: Regular .ts file
src/lib/composables/useInboxSync.ts

// ✅ CORRECT: .svelte.ts extension
src/lib/composables/useInboxSync.svelte.ts
```

**Why it works**:
- `.svelte.ts` files are processed by Svelte compiler
- Runes are properly transformed and work correctly
- TypeScript linter recognizes rune assignments as valid
- No need to import `$state` - it's available globally in `.svelte.ts` files

### Implementation Example

```typescript
// src/lib/composables/useInboxSync.svelte.ts
export function useInboxSync(
  convexClient: any,
  inboxApi: any,
  onItemsReload?: () => Promise<void>
) {
  // ✅ Runes work correctly in .svelte.ts files
  const isSyncing = $state(false);
  const syncError = $state<string | null>(null);
  
  function handleSyncClick() {
    // ✅ Assignment works correctly
    isSyncing = true;
  }
  
  return {
    isSyncing,
    syncError,
    handleSyncClick
  };
}
```

### Usage in Components

Import and use normally (no special handling needed):

```svelte
<script lang="ts">
  import { useInboxSync } from '$lib/composables/useInboxSync.svelte';
  
  const sync = useInboxSync(convexClient, inboxApi, loadItems);
</script>
```

### Key Takeaway

When creating composables that use Svelte 5 runes:
- **Always** use `.svelte.ts` extension (not `.ts`)
- This allows Svelte compiler to process runes correctly
- No need to import runes - they're available globally in `.svelte.ts` files
- Works for `$state`, `$derived`, `$effect`, and other runes

**Reference**: See Context7 Svelte documentation on "Using Runes in .svelte.js/.svelte.ts Files"

---

## Composables: Returning Reactive State with Getters

**Date**: 2025-01-02  
**Issue**: State returned from composable functions loses reactivity when accessed via property access (e.g., `sync.showSyncConfig`).

### Problem

When creating composables that return `$state` values:
- Individual `$state` variables are created and returned
- State updates correctly inside the composable
- But UI doesn't react to changes when accessing via `sync.showSyncConfig`
- Console shows state is updated, but component doesn't re-render

### Root Cause

Svelte 5 reactivity tracking issue: When returning individual `$state` variables from a composable function, property access on the returned object (`sync.showSyncConfig`) may not be tracked as a reactive dependency. The state updates internally, but Svelte doesn't detect property access as needing reactivity.

### Solution

**Pattern**: Use a single `$state` object and return getters

```typescript
// ❌ WRONG: Individual $state variables
export function useInboxSync() {
  let isSyncing = $state(false);
  let showSyncConfig = $state(false);
  
  return {
    isSyncing,
    showSyncConfig,
    // Reactivity may not be tracked correctly
  };
}

// ✅ CORRECT: Single $state object with getters
export function useInboxSync() {
  const state = $state({
    isSyncing: false,
    showSyncConfig: false,
  });
  
  function handleSyncClick() {
    state.showSyncConfig = true; // Update state object
  }
  
  return {
    // Use getters to access state properties
    get isSyncing() { return state.isSyncing; },
    get showSyncConfig() { return state.showSyncConfig; },
    handleSyncClick,
  };
}
```

**Why it works**:
- Single `$state` object ensures all properties are reactive
- Getters access the reactive state object, which Svelte tracks correctly
- Property access (`sync.showSyncConfig`) calls the getter, which reads from reactive state
- Svelte properly tracks the dependency chain

### Implementation Example

```typescript
// src/lib/composables/useInboxSync.svelte.ts
export function useInboxSync(
  convexClient: any,
  inboxApi: any,
  onItemsReload?: () => Promise<void>
) {
  // Single $state object for all state
  const state = $state({
    isSyncing: false,
    syncError: null as string | null,
    syncSuccess: false,
    syncProgress: null as {...} | null,
    showSyncConfig: false,
  });
  
  function handleSyncClick() {
    state.showSyncConfig = true; // Direct property assignment on reactive object
  }
  
  return {
    // Getters ensure reactivity is tracked
    get isSyncing() { return state.isSyncing; },
    get syncError() { return state.syncError; },
    get showSyncConfig() { return state.showSyncConfig; },
    // ... other getters
    handleSyncClick,
  };
}
```

### Usage in Components

Access normally - reactivity works correctly:

```svelte
<script lang="ts">
  const sync = useInboxSync(convexClient, inboxApi, loadItems);
</script>

{#if sync.showSyncConfig}
  <!-- This will reactively update when state changes -->
  <SyncConfig />
{/if}
```

### Key Takeaway

When creating composables that return reactive state:
- **Use a single `$state` object** instead of multiple `$state` variables
- **Return getters** that access the state object properties
- This ensures Svelte correctly tracks property access as reactive dependencies
- Getters are called on each access, ensuring proper reactivity tracking

**Alternative Pattern**: You can also return the state object directly and access it via `sync.state.showSyncConfig`, but getters provide a cleaner API.

---

## Real-time Data Updates with Convex useQuery

**Date**: 2025-01-02  
**Issue**: Items only appear after sync completes, not during the sync process. Poor UX requiring users to wait.

### Problem

When using manual queries (`convexClient.query()`):
- Items are fetched once and don't update automatically
- During sync operations, new items don't appear until sync completes
- Requires manual `loadItems()` calls to refresh data
- Poor user experience - users wait for completion before seeing results

### Root Cause

Manual queries are one-time fetches:
- `convexClient.query()` executes once and returns data
- No automatic subscription to database changes
- Must manually call `loadItems()` when data might have changed
- Creates delay between data creation and UI updates

### Solution

**Pattern**: Use `useQuery()` from `convex-svelte` for reactive subscriptions

```typescript
// ❌ WRONG: Manual one-time query
let inboxItems = $state<any[]>([]);

const loadItems = async () => {
  const result = await convexClient.query(api.inbox.listInboxItems, {});
  inboxItems = result || [];
};

// Must manually call loadItems() after sync completes
await sync();
await loadItems(); // Manual refresh needed
```

```typescript
// ✅ CORRECT: Reactive query with automatic updates
import { useQuery } from 'convex-svelte';

const inboxQuery = useQuery(
  api.inbox.listInboxItems,
  () => ({ processed: false }) // Reactive arguments
);

// Derived state automatically updates when data changes
const inboxItems = $derived(inboxQuery?.data ?? []);
const isLoading = $derived(inboxQuery?.isLoading ?? false);
```

**Why it works**:
- `useQuery()` automatically subscribes to Convex query results
- When database changes (e.g., new items added during sync), query automatically re-runs
- UI updates in real-time without manual refresh calls
- No extra bandwidth - Convex efficiently streams only changed data
- Reactive arguments function (`() => ({ processed: false })`) allows query to react to filter changes

### Implementation Example

```svelte
<script lang="ts">
  import { useQuery } from 'convex-svelte';
  import { api } from '$lib/convex';

  let filterType = $state<'all' | 'readwise_highlight'>('all');

  // Query automatically reacts to filterType changes
  const inboxQuery = useQuery(
    api.inbox.listInboxItems,
    () => filterType === 'all' 
      ? { processed: false } 
      : { filterType, processed: false }
  );

  // Derived state - automatically updates when query results change
  const inboxItems = $derived(inboxQuery?.data ?? []);
  const isLoading = $derived(inboxQuery?.isLoading ?? false);
  const queryError = $derived(inboxQuery?.error ?? null);
</script>

{#if isLoading}
  <Loading />
{:else if queryError}
  <Error message={queryError.toString()} />
{:else}
  {#each inboxItems as item}
    <InboxCard item={item} />
  {/each}
{/if}
```

### Benefits

1. **Real-time updates**: Items appear as they're created during sync
2. **No manual refresh**: Query automatically subscribes to changes
3. **Efficient**: Convex only streams changed data, not full re-fetches
4. **Reactive filters**: Query automatically re-runs when filter arguments change
5. **Better UX**: Users see progress immediately, not after completion

### Key Takeaway

When fetching data from Convex:
- **Use `useQuery()`** for reactive, real-time data subscriptions
- **Avoid manual `convexClient.query()`** calls for data that should update automatically
- **Use reactive arguments** (function that returns args) to make queries react to filter changes
- **No need for manual `loadItems()`** after mutations - queries update automatically

**When to use manual queries**:
- One-time data fetches that don't need to update
- Server-side data loading in `+page.server.ts`
- Actions that don't need real-time updates

---

## Activity Tracker: Polling Initialization

**Date**: 2025-01-02  
**Issue**: `TypeError: pollFunction is not a function` when adding activities to the tracker.

### Problem

When calling `addActivity()`:
- Error: `pollFunction is not a function` at `activityTracker.svelte.ts:162`
- Activity tracker fails to initialize polling
- Console shows uncaught promise rejection

### Root Cause

Incorrect polling initialization in `addActivity()`:
- `addActivity()` called `startPolling()` without required `pollFunction` parameter
- `startPolling()` requires a function parameter: `startPolling(pollFunction: () => Promise<void>)`
- `addActivity()` tried to start polling before knowing what to poll
- Polling should be managed by `GlobalActivityTracker` component, not the store

### Solution

**Pattern**: Let components manage polling, not the store

```typescript
// ❌ WRONG: Store tries to start polling without poll function
export function addActivity(activity: Activity): string {
  activityState.activities.push(activity);
  
  // Error: startPolling() requires pollFunction parameter
  if (!activityState.pollingInterval) {
    startPolling(); // ❌ Missing required parameter
  }
  
  return activity.id;
}
```

```typescript
// ✅ CORRECT: Store only manages state, components manage polling
export function addActivity(activity: Activity): string {
  activityState.activities.push(activity);
  
  // Note: Polling is managed by GlobalActivityTracker component via $effect
  // Do not call startPolling() here - it requires a pollFunction parameter
  
  return activity.id;
}
```

**Component manages polling**:
```svelte
<script>
  import { activityState, startPolling, stopPolling } from '$lib/stores/activityTracker.svelte';
  
  const activities = $derived(activityState.activities);
  
  // Component knows what to poll
  function pollSyncProgress() {
    // Poll Convex for sync progress
    convexClient.query(api.inbox.getSyncProgress, {})
      .then(updateActivities);
  }
  
  // Component manages polling lifecycle
  $effect(() => {
    if (activities.length > 0 && !activityState.pollingInterval) {
      startPolling(pollSyncProgress); // ✅ Component provides poll function
    }
    
    if (activities.length === 0 && activityState.pollingInterval) {
      stopPolling();
    }
  });
</script>
```

**Why it works**:
- Store focuses on state management only
- Components have context (Convex client, API references) to know what to poll
- Separation of concerns: store = state, components = behavior
- `GlobalActivityTracker` component can handle multiple activity types with different polling logic

### Key Takeaway

When designing activity/polling systems:
- **Store manages state** (activities array, polling interval reference)
- **Components manage behavior** (what to poll, when to start/stop)
- **Don't call functions that require context** from store functions
- **Use `$effect` in components** to reactively manage polling lifecycle

---

## Activity Tracker: Auto-Dismiss Duplicate Timers

**Date**: 2025-01-02  
**Issue**: Activity widget disappears too early (3-5 seconds instead of 5 seconds) due to duplicate auto-dismiss timers.

### Problem

When activities are marked as 'completed':
- `setupAutoDismiss()` is called via `$effect` whenever activities change
- Each call creates a new `setTimeout` for auto-dismiss
- Multiple timers fire, causing activity to disappear early
- Progress updates during sync trigger `$effect`, creating timers repeatedly

### Root Cause

`setupAutoDismiss()` doesn't track which activities already have dismiss timers:
- Called in `$effect` that runs on every activity change
- Progress updates during sync trigger `$effect`
- New timers are created each time, even if one already exists
- First timer fires, removing activity before intended time

### Solution

**Pattern**: Track which activities already have dismiss timers

```typescript
// ❌ WRONG: Creates duplicate timers
export function setupAutoDismiss(): void {
  for (const activity of activityState.activities) {
    if (activity.autoDismiss && activity.status === 'completed') {
      setTimeout(() => {
        removeActivity(activity.id);
      }, activity.dismissAfter);
    }
  }
}
```

```typescript
// ✅ CORRECT: Track timers to prevent duplicates
interface ActivityState {
  activities: Activity[];
  pollingInterval: ReturnType<typeof setInterval> | null;
  dismissTimers: Set<string>; // Track which activities already have timers
}

export function setupAutoDismiss(): void {
  for (const activity of activityState.activities) {
    if (activity.autoDismiss && activity.status === 'completed' && activity.dismissAfter) {
      // Only set up timer if one doesn't already exist
      if (!activityState.dismissTimers.has(activity.id)) {
        activityState.dismissTimers.add(activity.id);
        
        setTimeout(() => {
          // Remove from tracking set before removing activity
          activityState.dismissTimers.delete(activity.id);
          removeActivity(activity.id);
        }, activity.dismissAfter);
      }
    }
  }
}
```

**Cleanup**: Remove from tracking set when activity is removed

```typescript
export function removeActivity(id: string): void {
  const index = activityState.activities.findIndex(a => a.id === id);
  if (index !== -1) {
    activityState.activities.splice(index, 1);
    
    // Clean up dismiss timer tracking
    activityState.dismissTimers.delete(id);
    // ...
  }
}
```

**Why it works**:
- Set tracks which activities have timers
- Only creates timer if activity ID not in set
- Prevents duplicate timers from multiple `$effect` runs
- Cleanup ensures set doesn't grow indefinitely

### Key Takeaway

When implementing auto-dismiss with reactive effects:
- **Track which items already have timers** (use Set/Map)
- **Check before creating new timers** to prevent duplicates
- **Clean up tracking** when items are removed
- **Idempotent operations** - safe to call multiple times

---

## Polling and Completion: Race Condition Prevention

**Date**: 2025-01-02  
**Issue**: Activity widget disappears before import completes due to race condition between polling and action result.

### Problem

When syncing/importing:
- Action starts, polling begins every 500ms
- Action completes and clears progress in database
- `pollSyncProgress()` sees `null` progress and marks activity as 'completed'
- Auto-dismiss timer starts (5 seconds)
- `handleImport()` then processes action result and marks completion again
- Widget disappears before user sees success message

### Root Cause

Two completion paths competing:
1. **Polling path**: `pollSyncProgress()` marks completion when progress is `null`
2. **Action result path**: `handleImport()` marks completion based on action result

The polling path fires first (because it's called immediately after action completes), starting the auto-dismiss timer before the proper completion message is set.

### Solution

**Pattern**: Single source of truth for completion - action result only

```typescript
// ❌ WRONG: Polling marks completion (race condition)
async function pollSyncProgress() {
  const progress = await convexClient.query(inboxApi.getSyncProgress, {});
  if (progress) {
    // Update progress
  } else {
    // Mark as completed when progress is null
    if (state.syncProgress && state.isSyncing) {
      updateActivity(syncActivityId, { status: 'completed' }); // ❌ Too early!
    }
  }
}
```

```typescript
// ✅ CORRECT: Polling only updates progress, never marks completion
async function pollSyncProgress() {
  const progress = await convexClient.query(inboxApi.getSyncProgress, {});
  if (progress) {
    // Update progress state
    state.syncProgress = progress;
    // Update activity tracker
    updateActivity(syncActivityId, {
      status: 'running',
      progress: { ... }
    });
  }
  // Note: We do NOT mark completion here when progress is null
  // Completion is handled by handleImport() based on the action result
  // This prevents race conditions where completion is marked too early
}
```

**Stop polling immediately after action completes**:

```typescript
async function handleImport(options) {
  // Start polling
  progressPollInterval = setInterval(pollSyncProgress, 500);
  
  try {
    const result = await convexClient.action(inboxApi.syncReadwiseHighlights, options);
    
    // Stop polling immediately after action completes (before processing result)
    // This prevents race conditions where pollSyncProgress might mark completion too early
    if (progressPollInterval) {
      clearInterval(progressPollInterval);
      progressPollInterval = null;
    }
    
    // Final poll to get the last progress update (if any)
    await pollSyncProgress();
    
    // NOW mark completion based on action result (single source of truth)
    if (syncActivityId) {
      updateActivity(syncActivityId, {
        status: 'completed',
        progress: {
          message: `Imported ${result.newCount} new highlights`
        }
      });
    }
  }
}
```

**Why it works**:
- Polling only updates progress, never marks completion
- Completion is marked once, by `handleImport()` based on action result
- Polling stops before processing result, preventing race conditions
- Single source of truth ensures consistent behavior

### Key Takeaway

When using polling for progress updates:
- **Polling should only update progress**, never mark completion
- **Completion should be based on action/mutation result** (single source of truth)
- **Stop polling immediately after action completes** to prevent race conditions
- **Separate concerns**: Polling = progress updates, Action result = completion status

---

## Global Activity Tracker: Dual Polling Race Condition

**Date**: 2025-01-02  
**Issue**: Activity widget disappears after 1-2 seconds during "Fetching sources..." phase due to dual polling mechanisms marking completion.

### Problem

When syncing/importing:
- Two separate polling mechanisms exist:
  1. **Local polling**: `useInboxSync` composable polls for progress
  2. **Global polling**: `GlobalActivityTracker` component polls for all sync activities
- Action clears progress in database before returning (to clean up)
- Global tracker sees `null` progress and marks activity as 'completed' prematurely
- Auto-dismiss timer starts before `handleImport()` finishes processing
- Widget disappears before user sees proper completion message

### Root Cause

Two competing polling systems with different responsibilities:
1. **Composable polling** (`useInboxSync.pollSyncProgress()`):
   - Correctly only updates progress, never marks completion
   - Stops immediately after action completes
   - Single source of truth for completion (action result)

2. **Global tracker polling** (`GlobalActivityTracker.pollSyncProgress()`):
   - Also polling every 500ms for all sync activities
   - Saw `null` progress (when action cleared it) and incorrectly assumed completion
   - Marked activity as 'completed' before composable finished processing
   - Triggered auto-dismiss timer prematurely

**Timeline**:
1. Action starts, both pollers run
2. Progress shows "Fetching sources..."
3. Action clears progress in DB (line 527 in `syncReadwise.ts`) **before returning**
4. Global tracker polls, sees `null` → marks 'completed' → auto-dismiss starts
5. Meanwhile, composable's `handleImport()` still processing action result
6. When composable finally marks completion, timer may have already started

### Solution

**Pattern**: Global tracker should only update progress, never mark completion

```typescript
// ❌ WRONG: Global tracker marks completion when progress is null
async function pollSyncProgress(): Promise<void> {
  const progress = await convexClient.query(inboxApi.getSyncProgress, {});
  
  for (const activity of syncActivities) {
    if (progress) {
      // Update progress
      updateActivity(activity.id, { status: 'running', progress: {...} });
    } else {
      // Progress cleared = sync completed ❌ WRONG ASSUMPTION
      updateActivity(activity.id, { status: 'completed' }); // Too early!
      setupAutoDismiss(); // Timer starts prematurely
    }
  }
}
```

```typescript
// ✅ CORRECT: Global tracker only updates progress, never marks completion
async function pollSyncProgress(): Promise<void> {
  const progress = await convexClient.query(inboxApi.getSyncProgress, {});
  
  for (const activity of syncActivities) {
    if (progress) {
      // Progress is active - update it
      updateActivity(activity.id, {
        status: 'running',
        progress: {
          step: progress.step,
          current: progress.current,
          total: progress.total,
          message: progress.message
        }
      });
    }
    // Note: We do NOT mark completion here when progress is null
    // Completion is handled by the composable (useInboxSync) based on the action result
    // This prevents race conditions where completion is marked too early
    // The action clears progress in the database before returning, so we can't rely on
    // null progress to indicate completion - we must wait for the action result
  }
}
```

**Why it works**:
- Global tracker focuses on progress updates only
- Composable remains single source of truth for completion
- No race condition between two pollers
- Action can safely clear progress without triggering premature completion

### Key Takeaway

When implementing dual polling systems (local + global):
- **Global tracker should only update progress**, never mark completion
- **Composable/action result is the single source of truth** for completion status
- **Don't assume null progress = completion** - action may clear progress before returning
- **Separate responsibilities**: Global tracker = progress updates, Composable = completion logic

**Related Pattern**: See "Polling and Completion: Race Condition Prevention" for the composable-level fix.

---


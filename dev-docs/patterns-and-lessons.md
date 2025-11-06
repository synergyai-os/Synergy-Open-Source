# Patterns & Lessons Learned

This document captures reusable solutions, common issues, and architectural patterns discovered during development. **Use this as a reference to avoid repeating mistakes and leverage proven solutions.**

> **For AI/LLM**: This file is optimized for `/save` (adding patterns) and `/root-cause` (finding patterns). See sections below for usage instructions.

---

## 🚨 Quick Diagnostic: Common Issues → Patterns

**Use this section when running `/root-cause` to quickly find relevant patterns based on symptoms:**

| Symptom | Likely Pattern | Link |
|---------|---------------|------|
| State not updating in UI | Returning Reactive State with Getters | [#returning-reactive-state](#composables-returning-reactive-state-with-getters) |
| Component shows stale/old data | Sidebar/Detail View Reactivity Issues | [#sidebar-detail-view](#sidebardetail-view-reactivity-issues) |
| TypeScript error: "Cannot assign to constant" with `$state` | Composables with Svelte 5 Runes | [#svelte-5-runes](#composables-with-svelte-5-runes) |
| Composable receives stale values | Passing Reactive Values as Function Parameters | [#passing-reactive-values](#composables-passing-reactive-values-as-function-parameters) |
| Data doesn't update automatically | Real-time Data Updates with Convex useQuery | [#convex-usequery](#real-time-data-updates-with-convex-usequery) |
| Race condition / premature completion | Polling and Completion: Race Condition Prevention | [#polling-completion](#polling-and-completion-race-condition-prevention) |
| Duplicate timers / early dismissal | Auto-Dismiss Duplicate Timers | [#auto-dismiss-timers](#activity-tracker-auto-dismiss-duplicate-timers) |
| Type safety issues / `any` everywhere | TypeScript Types for Composables | [#typescript-types](#typescript-types-for-composables-shared-type-definitions) |
| Can't narrow types on polymorphic data | Discriminated Union Types | [#discriminated-unions](#typescript-discriminated-union-types-for-polymorphic-data) |
| Widget disappears too early | Global Activity Tracker: Dual Polling | [#dual-polling](#global-activity-tracker-dual-polling-race-condition) |
| Users logged out on browser close | Persistent Session Configuration | [#persistent-session](#persistent-session-configuration) |
| Settings scattered across codebase | Centralized Configuration Pattern | [#centralized-config](#centralized-configuration-pattern) |
| Redundant API paths (api.x.x) | Convex API Naming Convention | [#convex-api-naming](#convex-api-naming-convention-pattern) |
| File not found in Convex | Convex File System Access Pattern | [#convex-file-system](#convex-file-system-access-and-template-management-pattern) |
| InvalidConfig: hyphens in filename | Convex File System Access Pattern | [#convex-file-system](#convex-file-system-access-and-template-management-pattern) |

---

## 📋 How to Use This Document

### For `/root-cause` Command

1. **Start here**: Check [Quick Diagnostic](#-quick-diagnostic-common-issues--patterns) table above
2. **Search by symptom**: Look for your issue in the table → follow link to pattern
3. **Search by technology**: Check [Index by Technology](#index-by-technology) below
4. **Search by issue type**: Check [Index by Issue Type](#index-by-issue-type) below
5. **Read pattern**: Each pattern has Problem → Root Cause → Solution → Key Takeaway

### For `/save` Command

1. **Analyze work session**: Review what was fixed/changed
2. **Check if pattern exists**: Search this document for similar issues
3. **Add new pattern**: Use [Pattern Template](#pattern-template) below
4. **Update existing pattern**: If pattern exists but needs refinement, update it
5. **Location**: Add new patterns in chronological order at the end of the "Patterns" section
6. **Update indexes**: Add pattern to relevant index sections (Technology, Issue Type, Pattern Name)

---

## 📝 Pattern Template

**Use this template when adding new patterns via `/save`:**

```markdown
## [Pattern Name: Brief Description]

**Tags**: `tag1`, `tag2`, `tag3` (comma-separated, lowercase, kebab-case)  
**Date**: YYYY-MM-DD  
**Issue**: Brief one-line description of the issue.

### Problem

Clear description of what was wrong:
- Symptom 1
- Symptom 2
- Symptom 3

### Root Cause

Why it happened:
1. Reason 1
2. Reason 2
3. Reason 3

### Solution

**Pattern**: One-line pattern description

```typescript
// ❌ WRONG: What not to do
code example

// ✅ CORRECT: What to do
code example
```

**Why it works**:
- Explanation point 1
- Explanation point 2

### Implementation Example

```typescript
// Full working example from codebase
```

### Key Takeaway

When [situation]:
- **Do** this
- **Don't** do that
- Important note

**Related Patterns**: See [Other Pattern Name](#link) for related concepts.
```

**Required sections**: Problem, Root Cause, Solution, Key Takeaway  
**Optional sections**: Implementation Example, Additional Patterns Used, When to Use This Pattern

---

## Index by Technology

### Svelte 5 Runes
- [Composables with Svelte 5 Runes](#composables-with-svelte-5-runes) - Use `.svelte.ts` extension
- [Returning Reactive State with Getters](#composables-returning-reactive-state-with-getters) - Single `$state` object with getters
- [Passing Reactive Values as Function Parameters](#composables-passing-reactive-values-as-function-parameters) - Pass functions that return reactive values
- [$derived: Avoid Redundant Defaults](#derived-avoid-redundant-defaults) - Trust upstream defaults

### UI/UX Patterns
- [Queue-Based Card Removal Pattern (Tinder-like)](#queue-based-card-removal-pattern-tinder-like) - Queue-based removal with animation
- [Visual Feedback Pattern for User Actions](#visual-feedback-pattern-for-user-actions) - Immediate visual confirmation
- [Edit Mode Toggle Pattern](#edit-mode-toggle-pattern) - Separate edit and view modes
- [Edit Mode Visual Indicators](#edit-mode-visual-indicators) - Clear edit state indication
- [Centered Card Layout with Fixed Default Size](#centered-card-layout-with-fixed-default-size) - Centered layout with default size
- [Textarea Auto-Resize to Match Static Text](#textarea-auto-resize-to-match-static-text) - Textarea matching paragraph styling

### Convex
- [Real-time Data Updates with Convex useQuery](#real-time-data-updates-with-convex-usequery) - Use `useQuery()` instead of manual queries
- [Persistent Session Configuration](#persistent-session-configuration) - Configure cookie maxAge for persistent sessions
- [Convex API Naming Convention Pattern](#convex-api-naming-convention-pattern) - File = module (noun), Function = action (verb)
- [Convex File System Access and Template Management Pattern](#convex-file-system-access-and-template-management-pattern) - Use TypeScript imports instead of file system reads

### TypeScript
- [TypeScript Types for Composables](#typescript-types-for-composables-shared-type-definitions) - Shared type definitions
- [Discriminated Union Types for Polymorphic Data](#typescript-discriminated-union-types-for-polymorphic-data) - Discriminated unions for type narrowing
- [Enum to Database String Conversion Pattern](#enum-to-database-string-conversion-pattern) - Converting enums to/from database strings

### Activity Tracker
- [Polling Initialization](#activity-tracker-polling-initialization) - Components manage polling, stores manage state
- [Auto-Dismiss Duplicate Timers](#activity-tracker-auto-dismiss-duplicate-timers) - Track timers to prevent duplicates
- [Polling and Completion: Race Condition Prevention](#polling-and-completion-race-condition-prevention) - Single source of truth for completion
- [Global Activity Tracker: Dual Polling Race Condition](#global-activity-tracker-dual-polling-race-condition) - Global tracker only updates progress

---

## Index by Issue Type

### Reactivity Issues
- [Sidebar/Detail View Reactivity Issues](#sidebardetail-view-reactivity-issues) - Use data-based keys for async data
- [Returning Reactive State with Getters](#composables-returning-reactive-state-with-getters) - Single `$state` object with getters
- [Passing Reactive Values as Function Parameters](#composables-passing-reactive-values-as-function-parameters) - Pass functions that return reactive values

### UI/UX Issues
- [Queue-Based Card Removal Pattern (Tinder-like)](#queue-based-card-removal-pattern-tinder-like) - Cards not removing after rating
- [Visual Feedback Pattern for User Actions](#visual-feedback-pattern-for-user-actions) - No confirmation for user actions
- [Edit Mode Toggle Pattern](#edit-mode-toggle-pattern) - Accidental edits during study
- [Edit Mode Visual Indicators](#edit-mode-visual-indicators) - Edit mode not clearly indicated
- [Textarea Auto-Resize to Match Static Text](#textarea-auto-resize-to-match-static-text) - Textarea appears as small scrollable frame
- [Centered Card Layout with Fixed Default Size](#centered-card-layout-with-fixed-default-size) - Cards not centered or breaking with long content

### Race Conditions
- [Sidebar/Detail View Reactivity Issues](#sidebardetail-view-reactivity-issues) - Query tracking for race conditions
- [Polling and Completion: Race Condition Prevention](#polling-and-completion-race-condition-prevention) - Single source of truth for completion
- [Global Activity Tracker: Dual Polling Race Condition](#global-activity-tracker-dual-polling-race-condition) - Global tracker only updates progress

### File Extensions
- [Composables with Svelte 5 Runes](#composables-with-svelte-5-runes) - Use `.svelte.ts` extension for runes

### Type Safety
- [TypeScript Types for Composables](#typescript-types-for-composables-shared-type-definitions) - Shared type definitions
- [Discriminated Union Types for Polymorphic Data](#typescript-discriminated-union-types-for-polymorphic-data) - Discriminated unions for type narrowing
- [Enum to Database String Conversion Pattern](#enum-to-database-string-conversion-pattern) - Converting enums to/from database strings

### Configuration
- [Centralized Configuration Pattern](#centralized-configuration-pattern) - Single config file for app settings

### File System / Serverless
- [Convex File System Access and Template Management Pattern](#convex-file-system-access-and-template-management-pattern) - Use TypeScript imports instead of file system reads

### Naming Conventions
- [Convex API Naming Convention Pattern](#convex-api-naming-convention-pattern) - File = module (noun), Function = action (verb)

### Data Fetching
- [Real-time Data Updates with Convex useQuery](#real-time-data-updates-with-convex-usequery) - Use `useQuery()` for reactive subscriptions

### Timer/Polling Issues
- [Auto-Dismiss Duplicate Timers](#activity-tracker-auto-dismiss-duplicate-timers) - Track timers to prevent duplicates
- [Polling Initialization](#activity-tracker-polling-initialization) - Components manage polling

---

## Index by Pattern Name

1. [Sidebar/Detail View Reactivity Issues](#sidebardetail-view-reactivity-issues) - Use data-based keys for async data
2. [Composables with Svelte 5 Runes](#composables-with-svelte-5-runes) - Use `.svelte.ts` extension for runes
3. [Composables: Returning Reactive State with Getters](#composables-returning-reactive-state-with-getters) - Single `$state` object with getters
4. [Composables: Passing Reactive Values as Function Parameters](#composables-passing-reactive-values-as-function-parameters) - Pass functions that return reactive values
5. [Real-time Data Updates with Convex useQuery](#real-time-data-updates-with-convex-usequery) - Use `useQuery()` instead of manual queries
6. [Activity Tracker: Polling Initialization](#activity-tracker-polling-initialization) - Components manage polling, stores manage state
7. [Activity Tracker: Auto-Dismiss Duplicate Timers](#activity-tracker-auto-dismiss-duplicate-timers) - Track timers to prevent duplicates
8. [Polling and Completion: Race Condition Prevention](#polling-and-completion-race-condition-prevention) - Single source of truth for completion
9. [Global Activity Tracker: Dual Polling Race Condition](#global-activity-tracker-dual-polling-race-condition) - Global tracker only updates progress
10. [TypeScript Types for Composables: Shared Type Definitions](#typescript-types-for-composables-shared-type-definitions) - Shared type definitions in `$lib/types/convex.ts`
11. [TypeScript: Discriminated Union Types for Polymorphic Data](#typescript-discriminated-union-types-for-polymorphic-data) - Discriminated unions for type narrowing
12. [$derived: Avoid Redundant Defaults](#derived-avoid-redundant-defaults) - Trust upstream defaults
13. [Queue-Based Card Removal Pattern (Tinder-like)](#queue-based-card-removal-pattern-tinder-like) - Queue-based removal with animation feedback
14. [Visual Feedback Pattern for User Actions](#visual-feedback-pattern-for-user-actions) - Immediate visual confirmation for user actions
15. [Edit Mode Toggle Pattern](#edit-mode-toggle-pattern) - Separate edit and view modes for components
16. [Centered Card Layout with Fixed Default Size](#centered-card-layout-with-fixed-default-size) - Centered layout with default size and flexible expansion
17. [Textarea Auto-Resize to Match Static Text](#textarea-auto-resize-to-match-static-text) - Textarea matching paragraph styling
18. [Edit Mode Visual Indicators](#edit-mode-visual-indicators) - Clear edit state indication
19. [Enum to Database String Conversion Pattern](#enum-to-database-string-conversion-pattern) - Converting enums to/from database strings
20. [Centralized Configuration Pattern](#centralized-configuration-pattern) - Single config file for app settings
21. [Persistent Session Configuration](#persistent-session-configuration) - Configure cookie maxAge for persistent sessions
22. [Convex API Naming Convention Pattern](#convex-api-naming-convention-pattern) - File = module (noun), Function = action (verb)
23. [Convex File System Access and Template Management Pattern](#convex-file-system-access-and-template-management-pattern) - Use TypeScript imports instead of file system reads

---

## Patterns

---

## Sidebar/Detail View Reactivity Issues

**Tags**: `reactivity`, `async-data`, `race-condition`, `{#key}`, `component-remounting`  
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

**Related Patterns**: See [Polling and Completion: Race Condition Prevention](#polling-and-completion-race-condition-prevention) for similar race condition handling.

---

## Composables with Svelte 5 Runes

**Tags**: `svelte-5`, `runes`, `composables`, `file-extensions`, `.svelte.ts`, `$state`, `$derived`, `$effect`  
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

**Reference**: Context7 Svelte documentation confirms `.svelte.js` and `.svelte.ts` files are processed by Svelte compiler for runes support.

**Related Patterns**: See [Composables: Returning Reactive State with Getters](#composables-returning-reactive-state-with-getters) for best practices when returning reactive state.

---

## Composables: Returning Reactive State with Getters

**Tags**: `composables`, `reactivity`, `$state`, `getters`, `return-values`  
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

**Related Pattern**: See [Composables: Passing Reactive Values as Function Parameters](#composables-passing-reactive-values-as-function-parameters) for the opposite pattern (receiving reactive values from components).

---

## Composables: Passing Reactive Values as Function Parameters

**Tags**: `composables`, `reactivity`, `function-parameters`, `callbacks`, `stale-data`  
**Date**: 2025-01-02  
**Issue**: When composables need access to reactive values from the calling component, direct property access doesn't stay reactive.

### Problem

When creating composables that need reactive values from the component:
- Composable receives reactive values directly (e.g., `items.filteredItems`)
- Values are captured at composable creation time
- Updates to reactive values in component don't update composable
- Composable operates on stale data

### Root Cause

Direct property access captures values at initialization:
- `const items = filteredItems` - captures value at that moment
- When `filteredItems` updates in component, `items` in composable doesn't update
- Composable needs to re-read reactive values each time it uses them

### Solution

**Pattern**: Pass functions that return reactive values instead of values directly

```typescript
// ❌ WRONG: Direct value access - captures stale data
export function useKeyboardNavigation(
  filteredItems: any[],  // Captured at creation time
  selectedItemId: string | null  // Captured at creation time
) {
  function navigateItems() {
    const currentIndex = filteredItems.findIndex(...); // Uses stale data!
  }
}
```

```typescript
// ✅ CORRECT: Function parameters that return reactive values
export function useKeyboardNavigation(
  filteredItems: () => any[],  // Function that returns current items
  selectedItemId: () => string | null,  // Function that returns current selection
  onSelectItem: (itemId: string) => void  // Callback function
) {
  function navigateItems(direction: 'up' | 'down') {
    const items = filteredItems();  // Call function to get current value
    const currentId = selectedItemId();  // Call function to get current value
    // Now using latest reactive values
  }
}
```

**Usage in component**:

```svelte
<script lang="ts">
  const items = useInboxItems();
  const selected = useSelectedItem(convexClient, inboxApi);
  
  // Pass functions that return reactive values
  const keyboard = useKeyboardNavigation(
    () => items.filteredItems,           // Function returns current items
    () => selected.selectedItemId,       // Function returns current selection
    (itemId) => selected.selectItem(itemId)  // Callback to update selection
  );
</script>
```

**Why it works**:
- Functions are called each time composable needs the value
- Each call gets the latest reactive value from the component
- No stale data - composable always has current state
- Reactive values are read fresh on each use

### Implementation Example

```typescript
// src/lib/composables/useKeyboardNavigation.svelte.ts
export function useKeyboardNavigation(
  filteredItems: () => any[],
  selectedItemId: () => string | null,
  onSelectItem: (itemId: string) => void
) {
  function navigateItems(direction: 'up' | 'down') {
    // Call functions to get current reactive values
    const items = filteredItems();
    const currentId = selectedItemId();
    
    if (items.length === 0) return;
    
    const currentIndex = currentId 
      ? items.findIndex(item => item._id === currentId)
      : -1;
    
    // ... navigation logic using current values
    
    // Use callback to update selection
    onSelectItem(newItem._id);
  }
  
  function getCurrentItemIndex(): number {
    // Call functions again to get latest values
    const items = filteredItems();
    const currentId = selectedItemId();
    if (!currentId || items.length === 0) return -1;
    return items.findIndex(item => item._id === currentId);
  }
  
  return {
    navigateItems,
    getCurrentItemIndex,
    // ...
  };
}
```

### When to Use This Pattern

**Use function parameters when**:
- Composable needs reactive values from component
- Composable doesn't manage its own state for these values
- Values change frequently and composable needs latest version
- Composable needs to call back to component to update state

**Don't use when**:
- Composable manages its own reactive state (use `$state` object with getters)
- Values are static or don't need to be reactive
- Composable can own the state directly

### Key Takeaway

When composables need reactive values from the component:
- **Pass functions that return reactive values** instead of values directly
- **Call the functions** each time you need the value (not just once)
- **Functions are called fresh** on each use, ensuring latest reactive values
- **Use callbacks** for updating state back in the component

**Related Pattern**: See [Composables: Returning Reactive State with Getters](#composables-returning-reactive-state-with-getters) for the opposite pattern (returning reactive state from composables).

---

## Real-time Data Updates with Convex useQuery

**Tags**: `convex`, `useQuery`, `reactivity`, `data-fetching`, `real-time`, `subscriptions`  
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

**Tags**: `activity-tracker`, `polling`, `separation-of-concerns`, `stores`, `components`  
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

**Related Patterns**: See [Polling and Completion: Race Condition Prevention](#polling-and-completion-race-condition-prevention) for how to properly handle polling completion.

---

## Activity Tracker: Auto-Dismiss Duplicate Timers

**Tags**: `activity-tracker`, `timers`, `auto-dismiss`, `$effect`, `idempotent`, `duplicate-prevention`  
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

**Tags**: `polling`, `race-condition`, `completion`, `single-source-of-truth`, `activity-tracker`  
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

**Related Patterns**: See [Global Activity Tracker: Dual Polling Race Condition](#global-activity-tracker-dual-polling-race-condition) for handling multiple polling systems.

---

## Global Activity Tracker: Dual Polling Race Condition

**Tags**: `polling`, `race-condition`, `global-tracker`, `dual-polling`, `activity-tracker`  
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

**Related Pattern**: See [Polling and Completion: Race Condition Prevention](#polling-and-completion-race-condition-prevention) for the composable-level fix.

---

## TypeScript Types for Composables: Shared Type Definitions

**Tags**: `typescript`, `type-safety`, `composables`, `convex`, `shared-types`, `FunctionReference`  
**Date**: 2025-01-02  
**Issue**: Using `any` for function parameters reduces type safety, eliminates IntelliSense, and allows errors to slip through at runtime.

### Problem

When refactoring composables, we initially used `any` for function parameters like `convexClient` and `inboxApi`. This reduces type safety, eliminates IntelliSense, and allows errors to slip through at runtime.

### Solution: Shared Type Definitions

Create a shared types file (`src/lib/types/convex.ts`) with proper interfaces and types:

```typescript
// src/lib/types/convex.ts
import type { FunctionReference } from 'convex/server';

// Convex client interface - matches useConvexClient() return type
export interface ConvexClient {
	query<Query extends FunctionReference<'query'>>(
		query: Query,
		args?: unknown
	): Promise<unknown>;
	action<Action extends FunctionReference<'action'>>(
		action: Action,
		args?: unknown
	): Promise<unknown>;
	mutation<Mutation extends FunctionReference<'mutation'>>(
		mutation: Mutation,
		args?: unknown
	): Promise<unknown>;
}

// API functions interface - use FunctionReference for type safety
export interface InboxApi {
	getInboxItemWithDetails: FunctionReference<'query', 'public', { inboxItemId: string }>;
	syncReadwiseHighlights: FunctionReference<'action', 'public', {
		dateRange?: '7d' | '30d' | '90d' | '180d' | '365d' | 'all';
		// ... other options
	}>;
	getSyncProgress: FunctionReference<'query', 'public', {}>;
}

// Result types
export interface SyncReadwiseResult {
	success: boolean;
	sourcesCount: number;
	highlightsCount: number;
	newCount: number;
	skippedCount: number;
	errorsCount: number;
}
```

Then use these types in composables:

```typescript
// ✅ CORRECT: Properly typed parameters
import type { ConvexClient, InboxApi, SyncReadwiseResult } from '$lib/types/convex';

export function useInboxSync(
	convexClient: ConvexClient | null,
	inboxApi: InboxApi | null,
	// ...
) {
	// Use type assertions when calling client methods
	const result = await convexClient.action(
		inboxApi.syncReadwiseHighlights, 
		options
	) as SyncReadwiseResult;
	
	const progress = await convexClient.query(
		inboxApi.getSyncProgress, 
		{}
	) as SyncProgress;
}
```

### Why This Works

1. **Type Safety**: TypeScript catches errors at compile time
2. **IntelliSense**: IDE autocomplete works for all parameters
3. **Maintainability**: Types are defined once, used everywhere
4. **Documentation**: Types serve as inline documentation

### Key Takeaways

- **Create shared types** for complex objects used across composables
- **Use `FunctionReference`** from `convex/server` for API function types
- **Use type assertions** (`as Type`) when calling client methods (they return `Promise<unknown>`)
- **Accept `any` only when necessary** - document why (see `typescript-any-usage.md`)

### Related Patterns

- See `dev-docs/typescript-any-usage.md` for guidelines on when `any` is acceptable
- See [Composables: Returning Reactive State with Getters](#composables-returning-reactive-state-with-getters) for return value patterns
- See [TypeScript: Discriminated Union Types for Polymorphic Data](#typescript-discriminated-union-types-for-polymorphic-data) for advanced typing patterns

---

## TypeScript: Discriminated Union Types for Polymorphic Data

**Tags**: `typescript`, `discriminated-unions`, `type-narrowing`, `polymorphic-data`, `type-safety`  
**Date**: 2025-01-02  
**Issue**: Using `any` for polymorphic data structures loses type safety and prevents TypeScript from narrowing types correctly.

### Problem

When working with polymorphic data structures (like inbox items with different types), using `any` loses type safety. We need proper types that allow TypeScript to narrow types based on a discriminator field (like `type`).

### Solution: Discriminated Union Types

Create a union type where each variant shares a common discriminator field (`type`) but has type-specific properties:

```typescript
// Base structure shared by all variants
type BaseInboxItem = {
	_id: string;
	type: 'readwise_highlight' | 'photo_note' | 'manual_text';
	userId: string;
	processed: boolean;
	processedAt?: number;
	createdAt: number;
};

// Variant 1: Readwise highlight with full details
export type ReadwiseHighlightWithDetails = BaseInboxItem & {
	type: 'readwise_highlight'; // Discriminator - must match literal
	highlightId: string;
	highlight: { /* ... */ } | null;
	source: { /* ... */ } | null;
	author: { /* ... */ } | null;
	authors: Array<{ /* ... */ }>;
	tags: Array<{ /* ... */ }>;
};

// Variant 2: Photo note
export type PhotoNoteWithDetails = BaseInboxItem & {
	type: 'photo_note'; // Discriminator
	imageFileId?: string;
};

// Variant 3: Manual text
export type ManualTextWithDetails = BaseInboxItem & {
	type: 'manual_text'; // Discriminator
	text?: string;
};

// Union type - TypeScript can narrow based on `type` field
export type InboxItemWithDetails = 
	| ReadwiseHighlightWithDetails 
	| PhotoNoteWithDetails 
	| ManualTextWithDetails;
```

Then use it with type narrowing:

```typescript
function processItem(item: InboxItemWithDetails) {
	// TypeScript narrows based on discriminator
	if (item.type === 'readwise_highlight') {
		// TypeScript knows: item is ReadwiseHighlightWithDetails
		// Full access to highlight, source, author, etc.
		console.log(item.highlight?.text);
		console.log(item.source?.title);
	} else if (item.type === 'photo_note') {
		// TypeScript knows: item is PhotoNoteWithDetails
		console.log(item.imageFileId);
	} else {
		// TypeScript knows: item is ManualTextWithDetails
		console.log(item.text);
	}
}
```

### Why This Works

1. **Type Safety**: TypeScript can narrow types based on the discriminator
2. **IntelliSense**: Full autocomplete for type-specific properties
3. **Compile-time Checks**: Prevents accessing properties that don't exist on a variant
4. **Self-documenting**: Types clearly show what data is available for each variant

### Key Takeaways

- **Use discriminated unions** for polymorphic data structures
- **Shared base type** ensures common properties are typed
- **Literal types** in discriminator field enable type narrowing
- **Intersection types** (`&`) extend base type with variant-specific properties
- **Type narrowing** works automatically with `if`/`switch` on discriminator

### Related Patterns

- See [TypeScript Types for Composables](#typescript-types-for-composables-shared-type-definitions) for parameter and return types
- See `dev-docs/typescript-any-usage.md` for when to avoid `any`

---

## $derived: Avoid Redundant Defaults

**Tags**: `svelte-5`, `$derived`, `redundancy`, `defaults`, `performance`  
**Date**: 2025-01-02  
**Issue**: Redundant default checks when using `$derived` that are already handled upstream.

### Problem

When using `$derived`, it's easy to add redundant defaults that are already handled upstream:

```typescript
// ❌ REDUNDANT: inboxItems already defaults to []
const inboxItems = $derived((inboxQuery?.data ?? []) as InboxItem[]);
const filteredItems = $derived(inboxItems || []); // || [] is redundant
```

### Solution: Trust Upstream Defaults

Remove redundant defaults since `$derived` values are already guaranteed to be defined:

```typescript
// ✅ CORRECT: inboxItems already defaults to []
const inboxItems = $derived((inboxQuery?.data ?? []) as InboxItem[]);
const filteredItems = $derived(inboxItems); // No redundant default needed
```

### Why This Matters

- **Cleaner code**: Less redundancy
- **Better performance**: One less check
- **Clearer intent**: Shows that `inboxItems` is always defined

### When Redundancy is Acceptable

- When the upstream default might change in the future
- When you want to be defensive about edge cases
- When the default serves as documentation

### Key Takeaway

**Trust your upstream defaults** - if `$derived` already handles defaults (via `??`), don't add redundant `||` checks downstream.

---

## Queue-Based Card Removal Pattern (Tinder-like)

**Tags**: `ui-ux`, `animation`, `state-management`, `queue`, `user-feedback`  
**Date**: 2025-01-27  
**Issue**: Cards should be removed from review queue immediately after rating, with smooth animation feedback.

### Problem

- Cards remain in view after rating, requiring manual navigation
- No clear visual feedback that action was registered
- User doesn't know if card was processed
- Cluttered interface with multiple action buttons

### Root Cause

- Using index-based navigation instead of queue-based removal
- No animation state to provide visual feedback
- Actions don't immediately remove cards from active review set

### Solution

**Pattern**: Use a queue-based approach where cards are removed from the active queue immediately after rating, with animation feedback.

```typescript
// ❌ WRONG: Index-based navigation, cards stay in list
let currentIndex = $state(0);
let approvedIndices = $state<Set<number>>(new Set());

function handleApproveCurrent() {
  approvedIndices.add(currentIndex);
  currentIndex++; // Card still in list, just hidden
}

// ✅ CORRECT: Queue-based removal, cards disappear
let reviewQueue = $state<Flashcard[]>([]);
let approvedCards = $state<Flashcard[]>([]);
let isAnimating = $state(false);

function handleApproveCurrent() {
  if (isAnimating || reviewQueue.length === 0) return;
  
  const card = reviewQueue[0];
  approvedCards.push(card);
  isAnimating = true;
  
  // Animate out
  setTimeout(() => {
    reviewQueue = reviewQueue.slice(1); // Remove from queue
    isAnimating = false;
  }, 400);
}
```

**Why it works**:
- Cards are immediately removed from active queue
- Animation provides clear visual feedback
- Next card appears automatically
- No manual navigation needed
- Cleaner, more focused experience

### Implementation Example

```typescript
// In FlashcardReviewModal.svelte
let reviewQueue = $state<Flashcard[]>([]);
let approvedCards = $state<Flashcard[]>([]);
let rejectedCards = $state<Flashcard[]>([]);
let showFeedback = $state<'approved' | 'rejected' | null>(null);
let isAnimating = $state(false);

const currentCard = $derived(reviewQueue[0]); // Always first card in queue

function handleApproveCurrent() {
  if (isAnimating || reviewQueue.length === 0) return;
  
  const card = reviewQueue[0];
  approvedCards.push(card);
  showFeedback = 'approved';
  isAnimating = true;
  
  setTimeout(() => {
    reviewQueue = reviewQueue.slice(1); // Remove from queue
    showFeedback = null;
    isAnimating = false;
  }, 400);
}
```

### Key Takeaway

When implementing card review interfaces:
- **Do** use queue-based removal (`queue.slice(1)`) for immediate card removal
- **Do** add animation state (`isAnimating`) to prevent double-actions
- **Do** show visual feedback (`showFeedback`) before removing card
- **Don't** use index-based navigation that keeps cards in the list
- **Don't** allow actions during animation (disable buttons)

**Related Patterns**: See [Visual Feedback Pattern](#visual-feedback-pattern-for-user-actions) for feedback implementation.

---

## Visual Feedback Pattern for User Actions

**Tags**: `ui-ux`, `user-feedback`, `animation`, `accessibility`  
**Date**: 2025-01-27  
**Issue**: Users need immediate visual confirmation that their actions were registered.

### Problem

- No visual feedback when approving/rejecting cards
- Users uncertain if action registered
- Potential for double-clicks
- Poor user experience

### Root Cause

- Actions happen too quickly without feedback
- No intermediate state between action and result
- Missing visual indicators

### Solution

**Pattern**: Show immediate visual feedback (overlay, icon, color change) before processing the action.

```typescript
// ❌ WRONG: No feedback, action happens instantly
function handleApprove() {
  approvedCards.push(card);
  reviewQueue = reviewQueue.slice(1);
}

// ✅ CORRECT: Show feedback, then process
let showFeedback = $state<'approved' | 'rejected' | null>(null);

function handleApprove() {
  showFeedback = 'approved'; // Immediate visual feedback
  setTimeout(() => {
    approvedCards.push(card);
    reviewQueue = reviewQueue.slice(1);
    showFeedback = null;
  }, 400);
}
```

**Why it works**:
- User sees immediate confirmation
- Prevents uncertainty and double-clicks
- Provides better UX with clear feedback
- Can use color, icon, or animation

### Implementation Example

```svelte
<!-- Visual Feedback Overlay -->
{#if showFeedback}
  <div
    class="absolute inset-0 z-10 flex items-center justify-center rounded-lg {showFeedback === 'approved'
      ? 'bg-green-500/20'
      : 'bg-red-500/20'}"
  >
    <svg
      class="w-20 h-20 {showFeedback === 'approved' ? 'text-green-500' : 'text-red-500'}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {#if showFeedback === 'approved'}
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      {:else}
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      {/if}
    </svg>
  </div>
{/if}
```

### Key Takeaway

When implementing user actions:
- **Do** show immediate visual feedback (overlay, icon, color)
- **Do** use brief delay (300-500ms) to ensure feedback is visible
- **Do** disable actions during feedback animation
- **Don't** process actions instantly without feedback
- **Don't** rely solely on state changes for feedback

**Related Patterns**: See [Queue-Based Card Removal Pattern](#queue-based-card-removal-pattern-tinder-like) for removal implementation.

---

## Edit Mode Toggle Pattern

**Tags**: `ui-ux`, `state-management`, `modes`, `user-control`  
**Date**: 2025-01-27  
**Issue**: Components should have separate edit and view modes to prevent accidental edits during focused tasks.

### Problem

- Cards always editable, breaking study flow
- Users accidentally edit while trying to flip
- No clear distinction between viewing and editing
- Distraction during focused study sessions

### Root Cause

- Single `editable` prop always set to true
- No mode separation between study and edit
- Missing explicit user control over edit state

### Solution

**Pattern**: Add explicit edit mode toggle that user controls, separate from study mode.

```typescript
// ❌ WRONG: Always editable
<FlashcardComponent
  editable={true}
  ...
/>

// ✅ CORRECT: Edit mode controlled by user
let editMode = $state(false);

<FlashcardComponent
  editable={editMode}
  ...
/>

<Button onclick={() => (editMode = !editMode)}>
  {editMode ? 'Done Editing' : 'Edit'}
</Button>
```

**Why it works**:
- User explicitly chooses when to edit
- Prevents accidental edits during study
- Clear visual distinction between modes
- Better focus during study sessions

### Implementation Example

```svelte
<script>
  let editMode = $state(false);
  let isFlipped = $state(false);
</script>

<Button.Root
  onclick={() => (editMode = !editMode)}
  class="px-header py-header text-sm text-primary hover:bg-hover-solid rounded-md"
>
  {editMode ? 'Done Editing' : 'Edit'}
</Button.Root>

<FlashcardComponent
  flashcard={currentCard}
  editable={editMode && isFlipped} // Only editable when in edit mode AND flipped
  ...
/>
```

### Key Takeaway

When implementing editable components:
- **Do** add explicit edit mode toggle controlled by user
- **Do** separate edit mode from view/study mode
- **Do** disable editing by default during focused tasks
- **Don't** make components always editable
- **Don't** allow editing during active workflows (like study sessions)

**Related Patterns**: See [Queue-Based Card Removal Pattern](#queue-based-card-removal-pattern-tinder-like) for study mode implementation.

---

## Centered Card Layout with Fixed Default Size

**Tags**: `ui-ux`, `layout`, `responsive`, `flexbox`, `sizing`  
**Date**: 2025-01-27  
**Issue**: Cards not centered and too small - need fixed default size with responsive constraints.

### Problem

- Cards not centered (vertically/horizontally)
- Cards too small (content unreadable)
- No professional default size

### Solution

**Pattern**: Fixed dimensions with max constraints for responsive behavior, centered with flexbox.

```svelte
<!-- ✅ CORRECT: Fixed size, centered, responsive -->
<div class="flex-1 flex items-center justify-center p-inbox-container overflow-auto">
  <div style="width: 500px; height: 700px; max-width: calc(100% - 2rem); max-height: calc(100% - 2rem);">
    <FlashcardComponent ... />
  </div>
</div>
```

**Why it works**:
- Fixed dimensions provide professional default size
- Max constraints make it responsive on small screens
- Flexbox centers both axes
- Content inside handles overflow with `overflow-auto`

### Key Takeaway

When centering cards:
- **Do** use fixed width/height for default size (e.g., 500x700px)
- **Do** add max-width/max-height for responsive behavior
- **Do** use `flex items-center justify-center` for centering
- **Don't** use only min-height (too small) or only max-height (no default size)

---

## Textarea Auto-Resize to Match Static Text

**Tags**: `textarea`, `auto-resize`, `field-sizing`, `styling`, `ui-ux`  
**Date**: 2025-01-27  
**Issue**: Textarea appears as small scrollable frame, doesn't match static text appearance.

### Problem

- Textarea constrained by `h-full` wrapper
- Appears as small iframe-like scrollable box
- Doesn't match paragraph text styling
- Long text not fully visible

### Solution

**Pattern**: Remove height constraints, use `field-sizing-content` for auto-resize, match paragraph structure.

```svelte
<!-- ❌ WRONG: Height constraint prevents expansion -->
<div class="w-full h-full flex items-center justify-center">
  <textarea class="w-full h-full ..." />
</div>

<!-- ✅ CORRECT: No height constraint, auto-resize -->
<div class="w-full flex items-center justify-center min-w-0">
  <textarea
    class="... field-sizing-content"
    style="overflow: hidden;"
  />
</div>
```

**Why it works**:
- Removing `h-full` allows natural expansion
- `field-sizing-content` auto-resizes to content
- Same wrapper structure as paragraph ensures matching layout
- `overflow: hidden` prevents scrollbars

### Key Takeaway

When making textarea match static text:
- **Do** remove height constraints from wrapper
- **Do** use `field-sizing-content` for auto-resize
- **Do** match paragraph wrapper structure exactly
- **Don't** use `h-full` on textarea wrapper

---

## Edit Mode Visual Indicators

**Tags**: `ui-ux`, `edit-mode`, `visual-feedback`, `accessibility`  
**Date**: 2025-01-27  
**Issue**: Edit mode looks identical to preview mode, users don't know they're editing.

### Problem

- No visual distinction between edit and preview
- Users unsure if changes will save
- No clear indication of edit state

### Solution

**Pattern**: Multi-signal approach: footer text change, background tint, focus ring.

```svelte
<!-- Footer: Text + background change -->
<div
  class="... transition-colors {isEditing
    ? 'bg-accent-primary/20'
    : 'bg-base/10'}"
>
  {#if isEditing}
    <span class="text-accent-primary font-medium">
      • Editing... (Click outside to save)
    </span>
  {:else}
    <span class="text-secondary">• Click to edit</span>
  {/if}
</div>

<!-- Textarea: Focus ring -->
<textarea
  class="... focus:ring-2 focus:ring-accent-primary/50"
/>
```

**Why it works**:
- Footer text clearly indicates state
- Background tint provides subtle visual cue
- Focus ring shows active editing
- Multiple signals ensure clarity

### Key Takeaway

When indicating edit mode:
- **Do** change footer text to show state
- **Do** add subtle background tint
- **Do** use focus ring on textarea
- **Do** use multiple signals for clarity

---

## Centralized Configuration Pattern

**Tags**: `configuration`, `app-settings`, `maintainability`, `single-source-of-truth`  
**Date**: 2025-01-28  
**Issue**: App settings scattered across codebase, making it difficult to adjust values like session duration, timeouts, or feature flags.

### Problem

When app-wide settings are hardcoded or scattered:
- Session duration hardcoded in multiple places
- Difficult to adjust settings without code changes
- No single place to see all configurable values
- Risk of inconsistent values across codebase

### Root Cause

- Settings embedded directly in implementation code
- No centralized configuration file
- Values calculated inline instead of from config
- No clear separation between code and configuration

### Solution

**Pattern**: Create a single `src/lib/config.ts` file for all app-wide settings

```typescript
// ❌ WRONG: Hardcoded values scattered across codebase
// hooks.server.ts
const { handleAuth } = createConvexAuthHooks({
  cookieConfig: { maxAge: 2592000 } // What is this number?
});

// ❌ WRONG: Magic numbers with comments
const SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
```

```typescript
// ✅ CORRECT: Centralized config file
// src/lib/config.ts
const SESSION_DURATION_DAYS = 30;

export const config = {
  auth: {
    sessionDurationDays: SESSION_DURATION_DAYS,
    sessionMaxAgeSeconds: SESSION_DURATION_DAYS * 24 * 60 * 60
  }
} as const;

// hooks.server.ts
import { config } from '$lib/config';

const { handleAuth } = createConvexAuthHooks({
  cookieConfig: { maxAge: config.auth.sessionMaxAgeSeconds }
});
```

**Why it works**:
- Single source of truth for all settings
- Easy to adjust values (change once, updates everywhere)
- Self-documenting (clear what values mean)
- Type-safe with `as const`
- Can add more settings as needed

### Implementation Example

```typescript
// src/lib/config.ts
/**
 * Application configuration
 * Centralized settings for the app that can be easily adjusted
 */

const SESSION_DURATION_DAYS = 30;

export const config = {
  auth: {
    // Session duration in days (default: 30 days)
    sessionDurationDays: SESSION_DURATION_DAYS,
    // Calculate maxAge in seconds for cookie configuration
    sessionMaxAgeSeconds: SESSION_DURATION_DAYS * 24 * 60 * 60
  }
  // Future settings can be added here:
  // api: { timeout: 5000 },
  // features: { enableBeta: false }
} as const;
```

### Key Takeaway

When creating app-wide settings:
- **Do** create a single `src/lib/config.ts` file
- **Do** use descriptive constant names (e.g., `SESSION_DURATION_DAYS`)
- **Do** calculate derived values from base constants
- **Do** export a `config` object with organized sections
- **Don't** hardcode values in implementation files
- **Don't** scatter settings across multiple files
- **Don't** use magic numbers without context

**Related Patterns**: See [Persistent Session Configuration](#persistent-session-configuration) for using config in auth setup.

---

## Persistent Session Configuration

**Tags**: `authentication`, `sessions`, `cookies`, `convex-auth`, `sveltekit`, `persistence`  
**Date**: 2025-01-28  
**Issue**: Users are logged out when they close their browser because authentication cookies are session-only.

### Problem

- Users must log in every time they open the browser
- Sessions expire when browser closes (session cookies)
- Poor user experience requiring frequent re-authentication
- No way to configure session duration

### Root Cause

- `createConvexAuthHooks()` uses default cookie configuration (session cookies)
- No `maxAge` set on cookies, so they expire on browser close
- Session duration not configurable

### Solution

**Pattern**: Configure `cookieConfig` with `maxAge` in `createConvexAuthHooks()` to enable persistent sessions

```typescript
// ❌ WRONG: Default session cookies (expire on browser close)
const { handleAuth, isAuthenticated } = createConvexAuthHooks();
```

```typescript
// ✅ CORRECT: Persistent cookies with configurable duration
import { config } from '$lib/config';

const { handleAuth, isAuthenticated } = createConvexAuthHooks({
  cookieConfig: {
    maxAge: config.auth.sessionMaxAgeSeconds // 30 days in seconds
  }
});
```

**Why it works**:
- `maxAge` sets cookie expiration in seconds
- Cookies persist across browser restarts
- Users stay logged in until expiration or explicit logout
- Duration configurable via config file

### Implementation Example

```typescript
// src/hooks.server.ts
import { createConvexAuthHooks } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import { config } from '$lib/config';

// Configure persistent cookies using session duration from config
const { handleAuth, isAuthenticated } = createConvexAuthHooks({
  cookieConfig: {
    maxAge: config.auth.sessionMaxAgeSeconds
  }
});
```

**Logout implementation**:
```svelte
<!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
  import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
  
  const auth = useAuth();
  const { signOut } = auth;
</script>

<SidebarHeader
  onLogout={async () => {
    await signOut();
    await goto('/login');
  }}
/>
```

### Key Takeaway

When implementing persistent sessions:
- **Do** configure `cookieConfig.maxAge` in `createConvexAuthHooks()`
- **Do** use a config file for session duration (see [Centralized Configuration Pattern](#centralized-configuration-pattern))
- **Do** implement proper logout using `signOut()` from `useAuth()`
- **Do** redirect to login page after logout
- **Don't** rely on default session cookies for persistent sessions
- **Don't** hardcode `maxAge` values (use config)

**Related Patterns**: See [Centralized Configuration Pattern](#centralized-configuration-pattern) for config file setup.

---

## Convex API Naming Convention Pattern

**Tags**: `convex`, `naming-conventions`, `api-structure`, `file-organization`  
**Date**: 2025-01-28  
**Issue**: Redundant API paths like `api.generateFlashcard.generateFlashcard` when file name matches function name.

### Problem

When Convex file names match exported function names:
- Creates redundant API paths: `api.generateFlashcard.generateFlashcard`
- Unclear naming convention
- Inconsistent with other modules like `api.flashcards.createFlashcards`

### Root Cause

Convex generates API paths as `{filename}:{exportedFunctionName}`:
- File: `convex/generateFlashcard.ts`
- Export: `export const generateFlashcard`
- Result: `api.generateFlashcard.generateFlashcard` (redundant)

### Solution

**Pattern**: File names = domain/module (nouns), Function names = actions/verbs

```typescript
// ❌ WRONG: File name matches function name (redundant)
// convex/generateFlashcard.ts
export const generateFlashcard = action({ ... });
// Result: api.generateFlashcard.generateFlashcard

// ✅ CORRECT: File = module, Function = action
// Option 1: Move to domain module
// convex/flashcards.ts
export const generateFlashcard = action({ ... });
// Result: api.flashcards.generateFlashcard

// Option 2: Rename file to module name
// convex/flashcardGeneration.ts
export const generateFlashcard = action({ ... });
// Result: api.flashcardGeneration.generateFlashcard
```

**Naming Rules**:
1. **File names**: Domain/module names (nouns, plural or singular)
   - ✅ `flashcards.ts`, `inbox.ts`, `settings.ts`, `tags.ts`
   - ✅ `flashcardGeneration.ts`, `syncReadwise.ts`
   - ❌ `generateFlashcard.ts` (matches function name)

2. **Function names**: Actions/verbs (what they do)
   - ✅ `createFlashcards`, `listInboxItems`, `getUserSettings`
   - ✅ `generateFlashcard`, `syncReadwiseHighlights`
   - ❌ `flashcards` (noun, not an action)

3. **Result**: Clean API paths
   - ✅ `api.flashcards.createFlashcards`
   - ✅ `api.inbox.listInboxItems`
   - ✅ `api.settings.getUserSettings`
   - ✅ `api.flashcards.generateFlashcard` (if moved to flashcards.ts)

### Implementation Example

**Current structure**:
```typescript
// convex/generateFlashcard.ts
export const generateFlashcard = action({ ... });
// Usage: api.generateFlashcard.generateFlashcard ❌

// Recommended: Move to domain module
// convex/flashcards.ts
export const createFlashcard = mutation({ ... });
export const createFlashcards = mutation({ ... });
export const generateFlashcard = action({ ... }); // Add here
// Usage: api.flashcards.generateFlashcard ✅
```

**Alternative for single-purpose actions**:
```typescript
// convex/flashcardGeneration.ts (module name, not function name)
export const generateFlashcard = action({ ... });
// Usage: api.flashcardGeneration.generateFlashcard ✅
```

### Key Takeaway

When creating Convex functions:
- **File names** = domain/module (nouns): `flashcards.ts`, `inbox.ts`
- **Function names** = actions/verbs: `createFlashcards`, `listInboxItems`
- **Avoid** matching file name to function name (creates redundancy)
- **Group related functions** in domain modules when possible
- **Result**: Clean, intuitive API paths like `api.flashcards.createFlashcards`

**Related Patterns**: See [TypeScript Types for Composables](#typescript-types-for-composables-shared-type-definitions) for API type definitions.

---

## Convex File System Access and Template Management Pattern

**Tags**: `convex`, `serverless`, `file-system`, `templates`, `prompts`, `imports`, `file-naming`  
**Date**: 2025-01-28  
**Issue**: `readFileSync` fails in Convex serverless environment, and file names with hyphens cause deployment errors.

### Problem

When trying to load external files (like prompt templates) in Convex:
- `readFileSync` throws "file not found" errors in serverless environment
- Files with hyphens in names cause `InvalidConfig` errors
- Convex bundling doesn't include subdirectories reliably
- File system access is unreliable in deployed Convex functions

### Root Cause

Convex serverless environment limitations:
1. **File system access**: `readFileSync` and `fs` module work differently in Convex's bundled serverless environment
2. **File naming**: Convex only allows alphanumeric characters, underscores, and periods in module file names (no hyphens)
3. **Bundling**: External files in subdirectories may not be included in the bundle
4. **Path resolution**: `__dirname` and `import.meta.url` may not resolve correctly in serverless

### Solution

**Pattern**: Use TypeScript imports instead of file system reads, export templates as string constants

```typescript
// ❌ WRONG: File system access in Convex
"use node";
import { readFileSync } from 'fs';
import { join } from 'path';

export function loadPrompt(promptName: string) {
  const promptPath = join(__dirname, 'prompts', `${promptName}.xml`);
  return readFileSync(promptPath, 'utf-8'); // Fails in serverless
}
```

```typescript
// ❌ WRONG: Hyphen in file name
// convex/prompt-utils.ts
// Error: InvalidConfig - hyphens not allowed

// ✅ CORRECT: TypeScript export, camelCase file name
// convex/prompts/flashcardGeneration.ts
export const flashcardGenerationTemplate = `<prompt>
  <instructions>...</instructions>
</prompt>`;

// convex/promptUtils.ts (no "use node" needed)
import { flashcardGenerationTemplate } from './prompts/flashcardGeneration';

const promptTemplates: Record<string, string> = {
  'flashcard-generation': flashcardGenerationTemplate,
};

export function loadPrompt(promptName: string, variables?: Record<string, any>): string {
  const template = promptTemplates[promptName];
  if (!template) {
    throw new Error(`Prompt template "${promptName}" not found`);
  }
  // Interpolate variables...
  return interpolateVariables(template, variables || {});
}
```

**Why it works**:
- TypeScript imports are bundled by Convex reliably
- No file system access needed - templates are in code
- File names follow Convex naming rules (camelCase, no hyphens)
- Templates are type-checked and available at compile time
- No `"use node"` directive needed (no Node.js APIs)

### File Naming Rules

Convex module file names must:
- ✅ Use alphanumeric characters, underscores, periods
- ✅ Use camelCase: `promptUtils.ts`, `flashcardGeneration.ts`
- ❌ No hyphens: `prompt-utils.ts` (causes `InvalidConfig`)

### Implementation Example

```typescript
// convex/prompts/flashcardGeneration.ts
/**
 * Flashcard generation prompt template
 * Variables: {{text}}, {{source.title}}, {{source.author}}
 */
export const flashcardGenerationTemplate = `<prompt>
  <instructions>
    Given the following text, generate flashcards...
    <context>
      Source: {{source.title}}
      Author: {{source.author}}
    </context>
  </instructions>
  <input>
    <text>{{text}}</text>
  </input>
</prompt>`;

// convex/promptUtils.ts
import { flashcardGenerationTemplate } from './prompts/flashcardGeneration';

const promptTemplates: Record<string, string> = {
  'flashcard-generation': flashcardGenerationTemplate,
};

export function loadPrompt(promptName: string, variables?: Record<string, any>): string {
  const template = promptTemplates[promptName];
  if (!template) {
    throw new Error(
      `Prompt template "${promptName}" not found. Available: ${Object.keys(promptTemplates).join(', ')}`
    );
  }
  return interpolateVariables(template, variables || {});
}
```

### When to Use This Pattern

**Use TypeScript exports when**:
- Loading templates, prompts, or static content in Convex
- Content needs to be bundled with code
- File system access is unreliable

**Use file system reads when**:
- Running in Node.js environment (not Convex serverless)
- Files are truly external and change frequently
- Files are too large to include in bundle

### Key Takeaway

When loading external files in Convex:
- **Do** use TypeScript imports and exports for templates/content
- **Do** use camelCase file names (no hyphens)
- **Do** export templates as string constants
- **Don't** use `readFileSync` or `fs` module in Convex functions
- **Don't** use hyphens in Convex module file names
- **Don't** rely on `__dirname` or file system paths in serverless

**Related Patterns**: See [Convex API Naming Convention Pattern](#convex-api-naming-convention-pattern) for file naming rules.

---

## Enum to Database String Conversion Pattern

**Tags**: `typescript`, `enums`, `database`, `type-conversion`, `external-libraries`  
**Date**: 2025-01-27  
**Issue**: External libraries use TypeScript enums, but database schemas store strings. Direct casting causes TypeScript errors.

### Problem

When integrating external libraries (like `ts-fsrs`) with database schemas:
- Library uses TypeScript enums (e.g., `State.New`, `State.Learning`)
- Database schema stores lowercase strings (e.g., `'new'`, `'learning'`)
- Direct type casting (`as 'new'`) causes TypeScript errors
- Type mismatch between enum and string literal types

### Root Cause

TypeScript enums and string literals are different types:
- Enums are numeric or string-based types
- String literals are specific string values
- TypeScript doesn't allow direct casting between incompatible types
- Need explicit conversion functions

### Solution

**Pattern**: Create explicit conversion functions between enum and string values.

```typescript
// ❌ WRONG: Direct casting causes TypeScript errors
fsrsState: newCardState.state as 'new' | 'learning' | 'review' | 'relearning', // Error!

// ✅ CORRECT: Explicit conversion functions
function stateToString(state: State): 'new' | 'learning' | 'review' | 'relearning' {
  switch (state) {
    case State.New:
      return 'new';
    case State.Learning:
      return 'learning';
    case State.Review:
      return 'review';
    case State.Relearning:
      return 'relearning';
    default:
      return 'new';
  }
}

function stringToState(state: string): State {
  switch (state) {
    case 'new':
      return State.New;
    case 'learning':
      return State.Learning;
    case 'review':
      return State.Review;
    case 'relearning':
      return State.Relearning;
    default:
      return State.New;
  }
}

// Usage
fsrsState: stateToString(newCardState.state), // ✅ Works correctly
```

**Why it works**:
- Explicit conversion ensures type safety
- Switch statements handle all enum values
- Default cases provide fallback behavior
- Functions are reusable across codebase
- TypeScript can verify exhaustiveness

### Implementation Example

```typescript
// convex/flashcards.ts
import { State } from 'ts-fsrs';

function stateToString(state: State): 'new' | 'learning' | 'review' | 'relearning' {
  switch (state) {
    case State.New:
      return 'new';
    case State.Learning:
      return 'learning';
    case State.Review:
      return 'review';
    case State.Relearning:
      return 'relearning';
    default:
      return 'new';
  }
}

function stringToState(state: string): State {
  switch (state) {
    case 'new':
      return State.New;
    case 'learning':
      return State.Learning;
    case 'review':
      return State.Review;
    case 'relearning':
      return State.Relearning;
    default:
      return State.New;
  }
}

// When saving to database
await ctx.db.insert('flashcards', {
  fsrsState: stateToString(fsrsCard.state), // Convert enum to string
  // ...
});

// When reading from database
const fsrsCard: Card = {
  state: stringToState(flashcard.fsrsState || 'new'), // Convert string to enum
  // ...
};
```

### Key Takeaway

When integrating external libraries with database schemas:
- **Do** create explicit conversion functions for enum ↔ string
- **Do** use switch statements for exhaustive handling
- **Do** provide default cases for safety
- **Don't** use direct type casting (`as`) between incompatible types
- **Don't** assume enums can be directly stored as strings

**Related Patterns**: See [TypeScript: Discriminated Union Types](#typescript-discriminated-union-types-for-polymorphic-data) for type narrowing patterns.

---

## Notes for AI/LLM

### When Adding Patterns (`/save` command)

1. **Location**: Add new patterns at the end of the "Patterns" section (before "Notes for AI/LLM")
2. **Format**: Use the [Pattern Template](#pattern-template) above
3. **Indexes**: Update all three index sections:
   - [Index by Technology](#index-by-technology)
   - [Index by Issue Type](#index-by-issue-type)
   - [Index by Pattern Name](#index-by-pattern-name)
4. **Quick Diagnostic**: If the pattern solves a common symptom, add it to the [Quick Diagnostic](#-quick-diagnostic-common-issues--patterns) table
5. **Tags**: Use lowercase, kebab-case tags that are searchable and descriptive

### When Finding Patterns (`/root-cause` command)

1. **Start with Quick Diagnostic**: Check the table at the top for symptom → pattern mapping
2. **Search indexes**: Use technology or issue type indexes to find relevant patterns
3. **Read full pattern**: Each pattern has Problem → Root Cause → Solution → Key Takeaway
4. **Check related patterns**: Follow "Related Patterns" links for connected concepts
5. **Verify with Context7**: If pattern references external docs, verify with Context7 MCP

### Pattern Quality Checklist

When adding/updating patterns, ensure:
- ✅ Clear problem description with symptoms
- ✅ Root cause analysis (why it happened)
- ✅ ❌ WRONG and ✅ CORRECT code examples
- ✅ Key takeaway with actionable guidance
- ✅ Tags for searchability
- ✅ Links to related patterns
- ✅ Date for tracking when pattern was discovered

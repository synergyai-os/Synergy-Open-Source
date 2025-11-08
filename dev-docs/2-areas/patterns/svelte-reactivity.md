# Svelte 5 Reactivity Patterns

> **Validated with Context7**: All patterns verified against Svelte 5 official documentation.

---

## #L10: Reactive State with Getters [🔴 CRITICAL]

**Symptom**: `sync.showSyncConfig` doesn't trigger UI updates  
**Root Cause**: Individual `$state` variables lose reactivity when returned from composables. Svelte 5 requires getter pattern for proper tracking.  
**Fix**: 

```typescript
// ❌ WRONG: Individual $state variables
export function useInboxSync() {
  let showSyncConfig = $state(false);
  return { showSyncConfig }; // ❌ Reactivity lost
}

// ✅ CORRECT: Single $state object + getters (Context7 validated)
export function useInboxSync() {
  const state = $state({
    showSyncConfig: false,
    isSyncing: false,
  });
  
  return {
    get showSyncConfig() { return state.showSyncConfig; },
    get isSyncing() { return state.isSyncing; },
    open: () => { state.showSyncConfig = true; },
  };
}
```

**Why**: Getters access reactive `$state` object on each read, ensuring Svelte tracks dependencies correctly.  
**Apply when**: Composables return reactive state to components  
**Related**: #L80 (Passing reactive values), #L180 (.svelte.ts extension)

---

## #L80: Passing Reactive Values as Function Parameters [🔴 CRITICAL]

**Symptom**: Composable uses stale data from parent component  
**Root Cause**: Direct parameter captures value at init time, not reactive  
**Fix**:

```typescript
// ❌ WRONG: Direct value capture
export function useKeyboard(
  items: InboxItem[],          // ❌ Captured at init
  selectedId: string | null    // ❌ Never updates
) {
  const current = items[0];    // Always stale
}

// ✅ CORRECT: Function parameters (Context7 validated)
export function useKeyboard(
  items: () => InboxItem[],           // ✅ Function
  selectedId: () => string | null,    // ✅ Function
  onSelect: (id: string) => void      // ✅ Callback
) {
  const currentItems = items();       // Get latest value
  const current = currentItems[0];    // Always fresh
}

// Usage in component
const keyboard = useKeyboard(
  () => filteredItems,         // ✅ Arrow function
  () => selected.id,           // ✅ Arrow function
  (id) => selected.select(id)  // ✅ Callback
);
```

**Why**: Functions are called on each access, returning latest reactive values.  
**Apply when**: Composable needs reactive values from parent  
**Related**: #L10 (Returning reactive state), #L220 (useQuery pattern)

---

## #L140: Key on Data Not ID [🔴 CRITICAL]

**Symptom**: Detail view shows stale data when switching items  
**Root Cause**: `{#key}` remounts before async query completes, initializing with stale data  
**Fix**:

```svelte
<!-- ❌ WRONG: Keys on ID that triggers load -->
{#key selectedItemId}
  <Detail item={selectedItem} />  <!-- ❌ selectedItem still old -->
{/key}

<!-- ✅ CORRECT: Keys on actual data (Context7 validated) -->
{#key selectedItem._id}
  <Detail item={selectedItem} />  <!-- ✅ Waits for data -->
{/key}
```

**Why**: Component remounts only after data loads, initializes with correct values.  
**Apply when**: Using `{#key}` with async data  
**Related**: #L220 (useQuery auto-handles this)

---

## #L180: .svelte.ts Extension Required [🔴 CRITICAL]

**Symptom**: `"Cannot assign to constant"` error with `$state`  
**Root Cause**: Svelte 5 runes need Svelte compiler, not just TypeScript  
**Fix**:

```
// ❌ WRONG: Regular .ts file
src/lib/composables/useInboxSync.ts       // ❌ Runes don't work

// ✅ CORRECT: .svelte.ts extension (Context7 validated)
src/lib/composables/useInboxSync.svelte.ts  // ✅ Svelte compiler processes
```

**Why**: `.svelte.ts` files processed by Svelte compiler, enabling rune transformations.  
**Apply when**: File uses `$state`, `$derived`, `$effect` runes  
**Related**: #L10 (Composable patterns)

---

## #L220: useQuery for Real-Time Updates [🟡 IMPORTANT]

**Symptom**: Data only appears after sync completes, not during  
**Root Cause**: Manual `convexClient.query()` is one-time fetch, no subscription  
**Fix**:

```typescript
// ❌ WRONG: Manual one-time query
let items = $state<InboxItem[]>([]);
const loadItems = async () => {
  items = await convexClient.query(api.inbox.list, {});
};
await sync();
await loadItems(); // ❌ Manual refresh needed

// ✅ CORRECT: Reactive subscription (Context7 validated)
import { useQuery } from 'convex-svelte';

const query = useQuery(
  api.inbox.list,
  () => ({ processed: false })  // Reactive args
);

const items = $derived(query?.data ?? []); // ✅ Auto-updates
```

**Why**: `useQuery` subscribes to changes, Convex streams updates automatically.  
**Apply when**: Data should update in real-time  
**Related**: #L10 ($derived pattern), #L140 (Async data handling)

---

## #L280: Polling Updates Only, Not Completion [🟡 IMPORTANT]

**Symptom**: Widget disappears before action completes (race condition)  
**Root Cause**: Both polling and action result try to mark completion  
**Fix**:

```typescript
// ❌ WRONG: Polling marks completion
async function poll() {
  const progress = await query(api.getSyncProgress, {});
  if (!progress) {
    updateActivity(id, { status: 'completed' }); // ❌ Too early!
  }
}

// ✅ CORRECT: Polling updates progress only
async function poll() {
  const progress = await query(api.getSyncProgress, {});
  if (progress) {
    updateActivity(id, { status: 'running', progress }); // ✅ Updates only
  }
  // ✅ No completion logic here - action result handles it
}

async function handleSync() {
  const interval = setInterval(poll, 500);
  const result = await action(api.sync, {});
  clearInterval(interval);          // ✅ Stop polling first
  await poll();                     // ✅ Final update
  updateActivity(id, {              // ✅ Single completion source
    status: 'completed',
    progress: { message: `Done: ${result.count}` }
  });
}
```

**Why**: Action result is single source of truth for completion.  
**Apply when**: Polling for progress during async operations  
**Related**: #L340 (Duplicate timers)

---

## #L340: Track Timers to Prevent Duplicates [🟡 IMPORTANT]

**Symptom**: Auto-dismiss fires early (3s instead of 5s)  
**Root Cause**: Multiple `setTimeout` created by `$effect` re-runs  
**Fix**:

```typescript
// ❌ WRONG: No tracking, creates duplicates
export function setupAutoDismiss() {
  for (const activity of state.activities) {
    if (activity.status === 'completed') {
      setTimeout(() => remove(activity.id), 5000); // ❌ Called every $effect run
    }
  }
}

// ✅ CORRECT: Track with Set (Context7 validated)
interface ActivityState {
  activities: Activity[];
  dismissTimers: Set<string>; // ✅ Track which have timers
}

export function setupAutoDismiss() {
  for (const activity of state.activities) {
    if (activity.status === 'completed' && !state.dismissTimers.has(activity.id)) {
      state.dismissTimers.add(activity.id); // ✅ Mark as having timer
      setTimeout(() => {
        state.dismissTimers.delete(activity.id); // ✅ Clean up
        remove(activity.id);
      }, 5000);
    }
  }
}
```

**Why**: Set prevents creating duplicate timers on `$effect` re-runs.  
**Apply when**: Using timers inside `$effect` or reactive contexts  
**Related**: #L280 (Polling patterns)

---

## #L390: Avoid Redundant Defaults [🟢 REFERENCE]

**Symptom**: Unnecessary `|| []` checks when default already set  
**Root Cause**: Defensive programming on already-guaranteed values  
**Fix**:

```typescript
// ❌ WRONG: Redundant defaults
const items = $derived(query?.data ?? []); // ✅ Already defaults to []
const filtered = $derived(items || []);     // ❌ Redundant

// ✅ CORRECT: Trust upstream defaults (Context7 validated)
const items = $derived(query?.data ?? []);  // ✅ Defaults to []
const filtered = $derived(items);           // ✅ No redundant check
```

**Why**: `$derived` values are always defined when upstream handles defaults.  
**Apply when**: Chaining derived values with defaults  
**Related**: #L10 ($derived pattern)

---

## #L440: $effect for Side Effects, $derived for Computation [🟢 REFERENCE]

**Symptom**: Using `$effect` when `$derived` is better  
**Root Cause**: Misunderstanding when to use each rune  
**Fix**:

```svelte
<!-- ❌ WRONG: $effect for computed values -->
<script>
  let count = $state(0);
  let doubled = $state(0);
  
  $effect(() => {
    doubled = count * 2; // ❌ Should use $derived
  });
</script>

<!-- ✅ CORRECT: Use appropriate rune (Context7 validated) -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2); // ✅ Computed value
  
  $effect(() => {
    // ✅ Side effects only (logging, API calls, cleanup)
    console.log('Count changed:', count);
  });
</script>
```

**Why**: `$derived` is optimized for computed values, `$effect` for side effects.  
**Apply when**: Choosing between $derived and $effect  
**Related**: #L10 (State patterns)

---

## #L400: SSR-Unsafe Browser Libraries (ProseMirror, Monaco, etc.) [🔴 CRITICAL]

**Symptom**: 500 Server Error, "ReferenceError: window is not defined" during SSR  
**Root Cause**: Browser-only libraries (ProseMirror, Monaco, Chart.js) execute on server  
**Fix**: 

```svelte
// ❌ WRONG - Imports execute during SSR
<script>
  import { EditorView } from 'prosemirror-view';
  import NoteEditor from './NoteEditor.svelte';
</script>

<NoteEditor />

// ✅ CORRECT - Guard with browser check
<script>
  import { browser } from '$app/environment';
  import type { EditorView } from 'prosemirror-view'; // Type-only import
  import NoteEditor from './NoteEditor.svelte';
</script>

{#if browser}
  <NoteEditor />
{:else}
  <!-- SSR placeholder -->
  <div class="placeholder">Loading editor...</div>
{/if}
```

**Apply when**:
- Using browser-only libraries (ProseMirror, Monaco Editor, Chart.js, PDF.js)
- Component uses `window`, `document`, or browser APIs
- Linter shows "ReferenceError: X is not defined" during build

**Why it breaks**:
- SvelteKit runs components on server first (SSR)
- Import statements execute immediately (top-level code)
- ProseMirror/Monaco try to access `window` → server crash

**SSR-Safe Pattern**:
1. Use `type` imports for browser-only types: `import type { X } from 'lib'`
2. Wrap component in `{#if browser}` block
3. Provide SSR placeholder for better UX
4. Don't use `onMount` alone - imports still execute!

**Related**: #L10 (State), #L180 (File extensions)

---

## #L450: ProseMirror $ Property Name Collision [🟡 IMPORTANT]

**Symptom**: "The $ prefix is reserved" error with ProseMirror selection  
**Root Cause**: ProseMirror uses `$from`/`$to` properties, Svelte 5 reserves `$` for runes  
**Fix**: 

```typescript
// ❌ WRONG - $ prefix conflicts with Svelte 5 runes
const { $from, to } = editorState.selection;
editorState.doc.nodesBetween($from.pos, to, callback);

// ✅ CORRECT - Rename destructured variable
const { $from: from, to } = editorState.selection;
editorState.doc.nodesBetween(from.pos, to, callback);
```

**Apply when**:
- Using ProseMirror with Svelte 5
- Error: "The $ prefix is reserved, and cannot be used for variables and imports"
- Accessing `$from`, `$to`, `$cursor`, `$anchor`, or `$head` from selection

**ProseMirror Properties to Rename**:
- `$from` → `from`
- `$to` → `to`
- `$cursor` → `cursor`
- `$anchor` → `anchor`
- `$head` → `head`

**Related**: #L400 (SSR browser libraries), #L730 (ProseMirror integration in ui-patterns.md)

---

## #L500: $effect with Browser Check - Event Listeners [🔴 CRITICAL]

**Symptom**: Event listeners not working, keyboard shortcuts don't fire, no errors  
**Root Cause**: Module-level `if (browser)` prevents `$effect` from being defined during SSR  
**Fix**: 

```typescript
// ❌ WRONG - Module-level if check prevents $effect registration
if (browser) {
  $effect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });
}

// ✅ CORRECT - Browser check inside $effect
$effect(() => {
  if (!browser) return;
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
});
```

**Apply when**:
- Composables setting up event listeners
- $effect needs browser APIs (window, document, localStorage)
- Event listeners mysteriously not firing

**Why it breaks**:
- `.svelte.ts` files evaluated during SSR where `browser = false`
- Module-level `if (browser)` block skipped entirely
- `$effect` never defined → never runs on client
- Client hydration doesn't re-evaluate module → effect stays undefined

**Correct Pattern**:
1. Always define `$effect` unconditionally
2. Put browser check INSIDE the effect: `if (!browser) return;`
3. `$effect` only runs in browser anyway, but must be defined
4. Cleanup function still works correctly

**Related**: #L400 (SSR browser libraries), #L10 (State patterns)

---

## #L550: Phantom Dependencies in Config Break Build [🔴 CRITICAL]

**Symptom**: Build fails with "ENOENT: no such file or directory" referencing non-existent files, dev server won't start  
**Root Cause**: SvelteKit config references files/libraries that don't exist. Vite's dependency optimizer fails during preprocessing, crashing entire build.  
**Fix**: 

```javascript
// ❌ WRONG - Config references non-existent files
// svelte.config.js
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';

const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],
  preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)]  // ❌ Breaks build
};

// mdsvex.config.js
export default {
  layout: {
    docs: './src/lib/components/docs/DocLayout.svelte',  // ❌ File doesn't exist
  }
};

// ✅ CORRECT - Remove unused dependencies entirely
// svelte.config.js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  extensions: ['.svelte'],
  preprocess: [vitePreprocess()]  // ✅ Only what's needed
};

// package.json - Remove from devDependencies
{
  "devDependencies": {
    // "mdsvex": "^0.12.6",           // ❌ Removed
    // "rehype-autolink-headings": "^7.1.0",  // ❌ Removed
    // "rehype-slug": "^6.0.0"        // ❌ Removed
  }
}
```

**Apply when**:
- Build fails with "ENOENT" or "Error during dependency optimization"
- Error mentions preprocessing or file not found
- Library is installed but files it references don't exist
- Added library for future feature but not using it yet

**Why it breaks**:
- SvelteKit config runs during build initialization
- Preprocessors (mdsvex, etc.) execute during Vite's dependency optimization
- Referenced files must exist even if not actively used
- Build crashes before dev server can start

**Resolution Steps**:
1. Identify the library causing the error from stack trace
2. Check if you're actually using it (search for markdown files, etc.)
3. If not in use: Remove from `svelte.config.js`, `package.json`, delete config file
4. Run `npm install` to clean up package-lock.json
5. Restart dev server

**Related**: #L400 (SSR issues), #L180 (File extensions)

---

**Pattern Count**: 12  
**Last Validated**: 2025-11-08  
**Context7 Source**: `/sveltejs/svelte`


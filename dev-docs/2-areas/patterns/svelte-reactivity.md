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
		isSyncing: false
	});

	return {
		get showSyncConfig() {
			return state.showSyncConfig;
		},
		get isSyncing() {
			return state.isSyncing;
		},
		open: () => {
			state.showSyncConfig = true;
		}
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
	items: InboxItem[], // ❌ Captured at init
	selectedId: string | null // ❌ Never updates
) {
	const current = items[0]; // Always stale
}

// ✅ CORRECT: Function parameters (Context7 validated)
export function useKeyboard(
	items: () => InboxItem[], // ✅ Function
	selectedId: () => string | null, // ✅ Function
	onSelect: (id: string) => void // ✅ Callback
) {
	const currentItems = items(); // Get latest value
	const current = currentItems[0]; // Always fresh
}

// Usage in component
const keyboard = useKeyboard(
	() => filteredItems, // ✅ Arrow function
	() => selected.id, // ✅ Arrow function
	(id) => selected.select(id) // ✅ Callback
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
	<Detail item={selectedItem} /> <!-- ❌ selectedItem still old -->
{/key}

<!-- ✅ CORRECT: Keys on actual data (Context7 validated) -->
{#key selectedItem._id}
	<Detail item={selectedItem} /> <!-- ✅ Waits for data -->
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
	() => ({ processed: false }) // Reactive args
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
	clearInterval(interval); // ✅ Stop polling first
	await poll(); // ✅ Final update
	updateActivity(id, {
		// ✅ Single completion source
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

// ✅ CORRECT: Track with SvelteSet (Context7 validated)
import { SvelteSet } from 'svelte/reactivity';

interface ActivityState {
	activities: Activity[];
	dismissTimers: SvelteSet<string>; // ✅ Track which have timers (reactive)
}

export const activityState = $state<ActivityState>({
	activities: [],
	dismissTimers: new SvelteSet()
});

export function setupAutoDismiss() {
	for (const activity of activityState.activities) {
		if (activity.status === 'completed' && !activityState.dismissTimers.has(activity.id)) {
			activityState.dismissTimers.add(activity.id); // ✅ Reactive - triggers UI updates
			setTimeout(() => {
				activityState.dismissTimers.delete(activity.id); // ✅ Reactive cleanup
				remove(activity.id);
			}, 5000);
		}
	}
}
```

**Why**: `SvelteSet` is reactive - `.add()` and `.delete()` trigger UI updates. Regular `Set` inside `$state` doesn't trigger reactivity when mutated.  
**Apply when**: Using timers inside `$effect` or reactive contexts  
**Related**: #L280 (Polling patterns), #L360 (Map/Set reactivity)

---

## #L360: Map/Set Not Reactive - Use SvelteMap/SvelteSet [🔴 CRITICAL]

**Symptom**: Tag selection, keyboard shortcuts, or other Map/Set mutations don't update UI  
**Root Cause**: JavaScript `Map`/`Set` are not reactive in Svelte 5. Mutations (`.set()`, `.add()`, `.delete()`) don't trigger re-renders, causing silent bugs and stale UI.  
**Fix**:

```typescript
// ❌ WRONG: Regular Map/Set not reactive
const selected = new Map<string, boolean>();
selected.set('key', true); // ❌ No UI update

const items = new Set<string>();
items.add('item'); // ❌ No UI update

const params = new URLSearchParams();
params.set('key', 'value'); // ❌ No UI update

// ✅ CORRECT: Use Svelte reactivity classes (Context7 validated)
import { SvelteMap, SvelteSet, SvelteURLSearchParams } from 'svelte/reactivity';

const selected = new SvelteMap<string, boolean>();
selected.set('key', true); // ✅ Triggers UI update

const items = new SvelteSet<string>();
items.add('item'); // ✅ Triggers UI update

const params = new SvelteURLSearchParams();
params.set('key', 'value'); // ✅ Triggers UI update

// ✅ CORRECT: For simple cases, use plain objects/arrays
const selected = $state<Record<string, boolean>>({});
selected['key'] = true; // ✅ Reactive

const items = $state<string[]>([]);
items.push('item'); // ✅ Reactive (array mutation tracked)
```

**Why**: `SvelteMap`, `SvelteSet`, and `SvelteURLSearchParams` are reactive wrappers that trigger UI updates when mutated. Regular `Map`/`Set` inside `$state` don't track mutations.  
**Apply when**: 
- Using `Map`/`Set` for collections that need reactivity
- Tag selection, keyboard shortcuts, activity tracking
- URL parameter manipulation
- Any collection mutations that should update UI

**Note**: `SvelteURL` doesn't exist. For URL manipulation, use `SvelteURLSearchParams` for search params and `window.location.pathname` for pathname.

**Related**: #L340 (Timer tracking with SvelteSet), #L10 (Reactive state patterns)

---

## #L390: Avoid Redundant Defaults [🟢 REFERENCE]

**Symptom**: Unnecessary `|| []` checks when default already set  
**Root Cause**: Defensive programming on already-guaranteed values  
**Fix**:

```typescript
// ❌ WRONG: Redundant defaults
const items = $derived(query?.data ?? []); // ✅ Already defaults to []
const filtered = $derived(items || []); // ❌ Redundant

// ✅ CORRECT: Trust upstream defaults (Context7 validated)
const items = $derived(query?.data ?? []); // ✅ Defaults to []
const filtered = $derived(items); // ✅ No redundant check
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

## #L600: Top-Level Await in Config Files [🔴 CRITICAL]

**Symptom**: Server crashes on startup, "Cannot use 'import.meta' outside a module", 500 errors on all routes  
**Root Cause**: Node.js config files (mdsvex.config.js, etc.) can't use top-level await. Module loads before async resolution completes.  
**Fix**:

```javascript
// ❌ WRONG - Top-level await breaks config loading
import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
  themes: ['github-dark'],
  langs: ['javascript']
});

export default defineConfig({
  highlight: {
    highlighter: (code) => highlighter.codeToHtml(code)
  }
});

// ✅ CORRECT - Lazy initialization with caching
let highlighterPromise;
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: ['javascript']
    });
  }
  return highlighterPromise;
}

export default defineConfig({
  highlight: {
    highlighter: async (code) => {
      const highlighter = await getHighlighter();
      return highlighter.codeToHtml(code);
    }
  }
});
```

**Apply when**:

- Config files need async initialization (highlighters, plugins, external data)
- Build crashes with module/import errors
- 500 errors on all routes immediately after adding config
- Using libraries that require async setup (Shiki, database connections, etc.)

**Why it breaks**:

- Config files load during Node.js require() phase (synchronous)
- Top-level await only works in ES modules with proper setup
- SvelteKit/Vite config loading doesn't support top-level await
- Server crashes before any routes can load

**Correct Pattern**:

1. Create lazy initializer function
2. Cache promise to avoid multiple initializations
3. Call async function inside actual usage (highlighter callback)
4. Let the callback handle the await

**Related**: #L550 (Phantom dependencies), #L400 (SSR browser checks)

---

## #L650: onMount vs $effect for Route Changes [🟡 IMPORTANT]

**Symptom**: Component data doesn't update when navigating to different pages (TOC shows old headings, sidebars show stale data)  
**Root Cause**: `onMount()` only runs once when component first mounts. Doesn't re-run on route changes.  
**Fix**:

```typescript
// ❌ WRONG - Only extracts headings once
import { onMount } from 'svelte';

let headings = $state<Heading[]>([]);

onMount(() => {
	const elements = document.querySelectorAll('h1, h2, h3');
	headings = Array.from(elements).map((el) => ({
		id: el.id,
		text: el.textContent || ''
	}));
});

// ✅ CORRECT - Re-extracts on every route change
import { browser } from '$app/environment';
import { page } from '$app/stores';

let headings = $state<Heading[]>([]);

$effect(() => {
	if (!browser) return;

	// Access pathname to track route changes
	$page.url.pathname;

	// Use setTimeout to ensure DOM has updated
	setTimeout(() => {
		const elements = document.querySelectorAll('h1, h2, h3');
		headings = Array.from(elements).map((el) => ({
			id: el.id,
			text: el.textContent || ''
		}));
	}, 50);
});
```

**Apply when**:

- Component needs to react to route changes (navigation, TOC, breadcrumbs)
- Extracting data from DOM that changes per page
- Updating component state based on current URL/path
- Building layout components that wrap dynamic content

**Why it works**:

- `$effect()` re-runs when dependencies change
- Accessing `$page.url.pathname` makes it a dependency
- SvelteKit updates `$page` store on navigation
- `setTimeout` ensures DOM has updated with new content before extraction

**Correct Pattern**:

1. Use `$effect()` instead of `onMount()` for route-reactive logic
2. Import and access `$page.url.pathname` to create dependency
3. Add browser check to prevent SSR errors
4. Use short timeout (50ms) if extracting from DOM
5. Clean up observers/listeners in return function

**Related**: #L220 (useQuery reactivity), #L400 (SSR browser checks)

---

## #L700: $effect Reading/Writing Same State Causes Infinite Loop [🔴 CRITICAL]

**Symptom**: Page freezes, browser console shows `effect_update_depth_exceeded`, infinite re-renders  
**Root Cause**: $effect reads and writes the same `$state` variable, creating infinite reactive dependency chain  
**Fix**:

```typescript
// ❌ WRONG - $effect reads/writes $state causing infinite loop
let lastPath = $state<string | null>(null);
let isProcessing = $state(false);

$effect(() => {
	const currentPath = $page.url.pathname;

	// Reading $state variables creates reactive dependencies
	if (lastPath === currentPath) return; // ← Reads $state

	lastPath = currentPath; // ← Writes $state → triggers re-run → LOOP!
	isProcessing = true; // ← Writes $state → triggers re-run → LOOP!

	// ... do work
});

// ✅ CORRECT - Use untrack() for non-reactive state, or plain variables
import { untrack } from 'svelte';

let lastPath: string | null = null; // Plain variable (not $state)
let isProcessing = false; // Plain variable (not $state)

$effect(() => {
	const currentPath = $page.url.pathname;

	// Untracked reads don't create reactive dependencies
	const shouldSkip = untrack(() => lastPath === currentPath);
	if (shouldSkip) return;

	// Untracked writes don't trigger re-runs
	untrack(() => {
		lastPath = currentPath;
		isProcessing = true;
	});

	// ... do work

	return () => {
		untrack(() => {
			isProcessing = false;
		});
	};
});
```

**Apply when**:

- $effect needs to track state variables but not trigger on their changes
- Implementing debouncing, throttling, or tracking "previous" values
- Managing flags like `isLoading`, `hasInitialized`, `lastValue`
- Processing URL parameters that trigger state updates
- Error: `effect_update_depth_exceeded` appears in console

**Why it breaks**:

- Svelte 5 $effect automatically tracks all `$state` reads as dependencies
- Any write to a tracked `$state` triggers the effect to re-run
- Reading + writing same $state = instant infinite loop
- Browser freezes trying to resolve infinite reactive updates

**Correct Pattern**:

1. **Option A**: Use plain variables (not `$state`) for tracking state that shouldn't trigger reactivity
2. **Option B**: Wrap reads in `untrack(() => variable)` to prevent dependency tracking
3. **Option C**: Wrap writes in `untrack(() => { variable = value })` to prevent re-triggers
4. Only use `$state` for values that should cause UI updates when changed

**When to use each option**:

- **Plain variables**: Best for internal tracking (lastValue, counters, flags)
- **untrack() reads**: When you need `$state` benefits but conditional skipping
- **untrack() writes**: When updating `$state` shouldn't re-trigger the effect
- **$state**: Only for values that directly affect rendered output

**Example: URL Parameter Processing**:

```typescript
// ❌ WRONG - URL param triggers infinite loop
$effect(() => {
	const urlOrgParam = $page.url.searchParams.get('org'); // ← Reactive read
	if (urlOrgParam && urlOrgParam !== state.activeOrganizationId) {
		state.activeOrganizationId = urlOrgParam; // ← Writes $state → LOOP!
		// URL still has ?org=... → effect runs again → infinite loop
	}
});

// ✅ CORRECT - untrack() + URL cleanup
import { untrack } from 'svelte';
import { replaceState } from '$app/navigation';

// Module-level tracking (plain variable, not $state)
let lastProcessedOrgParam: string | null = null;

$effect(() => {
	if (!browser) return;

	const urlOrgParam = getOrgFromUrl(); // Reactive read from URL

	// Skip if already processed (untrack prevents reactive dependency)
	if (
		untrack(
			() => urlOrgParam === lastProcessedOrgParam && urlOrgParam === state.activeOrganizationId
		)
	) {
		return;
	}

	if (urlOrgParam && urlOrgParam !== state.activeOrganizationId) {
		// Update tracking without triggering re-run
		untrack(() => {
			lastProcessedOrgParam = urlOrgParam;
		});

		state.activeOrganizationId = urlOrgParam;

		// Clean up URL param immediately (prevents reprocessing)
		const url = new URL(window.location.href);
		url.searchParams.delete('org');
		replaceState(url.pathname + url.search, {});
	}
});
```

**Why URL cleanup matters**: Removing the URL parameter immediately after processing prevents the effect from seeing it again on the next reactive update, breaking the loop.

**Example: Meeting Presence Heartbeat (SYOS-227)**:

```typescript
// ❌ WRONG - Composable methods read reactive state → infinite loop
const presence = useMeetingPresence({
	meetingId: () => meeting._id,
	sessionId: () => data.sessionId
});

$effect(() => {
	if (!browser) return;
	
	// Calling methods that read internal $state triggers infinite re-runs
	presence.startHeartbeat(); // ← Reads composable $state
	
	return () => {
		presence.stopHeartbeat(); // ← Reads composable $state
	};
});

// ✅ CORRECT - untrack() to prevent reactive dependencies (Svelte 5 standard)
import { untrack } from 'svelte';

$effect(() => {
	if (!browser) return;
	
	// Call methods without tracking their internal reactive dependencies
	untrack(() => {
		presence.startHeartbeat();
	});
	
	return () => {
		untrack(() => {
			presence.stopHeartbeat();
		});
	};
});
```

**Why this happens**: Composable methods (`startHeartbeat()`, `stopHeartbeat()`) may read internal `$state` variables (intervals, flags). When called inside `$effect`, Svelte tracks these reads as dependencies. If the methods also write to `$state`, it creates a read→write→re-run cycle. `untrack()` breaks this by preventing dependency tracking for function calls.

**Apply for**: Lifecycle methods (start/stop), event handlers called from effects, any composable method that manages internal state.

**Related**: #L220 (useQuery reactivity), #L650 (onMount vs $effect), #L400 (SSR browser checks), #L730 (Router initialization timing)

---

## #L730: Router Not Initialized During Initial $effect [🔴 CRITICAL]

**Symptom**: `Error: Cannot call replaceState(...) before router is initialized` when loading page with URL parameters  
**Root Cause**: `replaceState()` called in `$effect` during initial page hydration, before SvelteKit router is ready. Router initializes after component mount.  
**Fix**:

```typescript
// ❌ WRONG - replaceState() in $effect without guard
$effect(() => {
	const urlParam = getParamFromUrl();
	if (urlParam) {
		state.value = urlParam;

		// Crashes on initial page load
		const url = new URL(window.location.href);
		url.searchParams.delete('param');
		replaceState(url.pathname + url.search, {});
	}
});

// ✅ CORRECT - Try-catch guard for router readiness (Context7 validated)
$effect(() => {
	const urlParam = getParamFromUrl();
	if (urlParam) {
		state.value = urlParam;

		// Guard for initial page load when router isn't initialized yet
		try {
			const url = new URL(window.location.href);
			url.searchParams.delete('param');
			replaceState(url.pathname + url.search, {});
		} catch (e) {
			// Router not ready - URL persists but won't cause issues
			// if proper tracking (e.g., lastProcessedParam) prevents reprocessing
			console.debug('Router not ready, deferring URL cleanup');
		}
	}
});
```

**Why it works**: Try-catch allows code to proceed gracefully when router isn't ready. URL parameter will be cleaned on next navigation, but won't cause reprocessing if proper tracking is implemented (see #L700).

**Apply when**:

- Using `replaceState()`, `pushState()`, or `goto()` in `$effect`
- Processing URL parameters during initial page load
- Error mentions "Cannot call [navigation function] before router is initialized"

**Alternative approach**: Use `afterNavigate()` hook for URL cleanup (runs after router ready):

```typescript
import { afterNavigate } from '$app/navigation';

let pendingUrlCleanup = false;

$effect(() => {
	const urlParam = getParamFromUrl();
	if (urlParam) {
		state.value = urlParam;
		pendingUrlCleanup = true;
	}
});

afterNavigate(() => {
	if (pendingUrlCleanup) {
		const url = new URL(window.location.href);
		url.searchParams.delete('param');
		replaceState(url.pathname + url.search, {});
		pendingUrlCleanup = false;
	}
});
```

**Related**: #L700 (URL param infinite loops), #L650 (onMount vs $effect), #L500 (Browser checks in effects)

---

## #L740: Race Condition Between replaceState() and $page.url Reactivity [🔴 CRITICAL]

**Symptom**: Manual organization switches revert back to URL param org, causing infinite loops. URL param persists even after `replaceState()` cleanup.  
**Root Cause**: `replaceState()` updates `window.location` synchronously, but `$page.url` store updates asynchronously. Reading from `$page.url.searchParams` after `replaceState()` returns stale values, causing the effect to reprocess the URL param.  
**Fix**:

```typescript
// ❌ WRONG - Reading from $page.url after replaceState() causes race condition
import { page } from '$app/stores';

$effect(() => {
	const urlOrgParam = $page.url.searchParams.get('org'); // ← Reads from reactive store
	
	if (urlOrgParam && urlOrgParam !== currentOrgId) {
		setActiveOrganization(urlOrgParam);
		
		// Clean up URL param
		const url = new URL(window.location.href);
		url.searchParams.delete('org');
		replaceState(url.pathname + url.search, {}); // ← Updates window.location synchronously
		
		// Problem: $page.url hasn't updated yet!
		// Next effect run still sees old URL param → infinite loop
	}
});

// ✅ CORRECT - Read directly from window.location.search (synchronous)
import { SvelteURLSearchParams } from 'svelte/reactivity';
import { replaceState } from '$app/navigation';

$effect(() => {
	if (!browser) return;
	
	// Read directly from window.location.search (updates synchronously with replaceState)
	const urlParams = new SvelteURLSearchParams(window.location.search);
	const urlOrgParam = urlParams.get('org');
	const currentOrgId = activeOrganizationId();
	
	// Check if org was changed manually (not from URL)
	if (
		urlOrgParam &&
		lastProcessedOrgParam &&
		urlOrgParam === lastProcessedOrgParam &&
		currentOrgId !== urlOrgParam
	) {
		// Manual switch detected - clean up URL param and reset tracking
		urlParams.delete('org');
		const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
		try {
			replaceState(newUrl, {});
		} catch (_e) {
			console.debug('Router not ready, deferring URL cleanup');
		}
		untrack(() => {
			lastProcessedOrgParam = null;
		});
		return; // Don't process URL param - manual switch takes precedence
	}
	
	if (urlOrgParam && urlOrgParam !== currentOrgId) {
		untrack(() => {
			lastProcessedOrgParam = urlOrgParam;
		});
		setActiveOrganization(urlOrgParam);
		
		// Clean up URL param
		urlParams.delete('org');
		const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
		try {
			replaceState(newUrl, {});
		} catch (_e) {
			console.debug('Router not ready, deferring URL cleanup');
		}
	}
});
```

**Why it works**: `window.location.search` updates synchronously with `replaceState()`, eliminating the race condition. Manual switch detection prevents URL params from overriding user actions.

**Apply when**:

- Using `replaceState()` to clean up URL params in `$effect`
- Reading URL params from `$page.url.searchParams` after navigation
- Manual state changes are being overridden by URL params
- Infinite loops occur when switching organizations/workspaces manually

**Why it breaks**:

- `replaceState()` updates `window.location` immediately (synchronous)
- `$page.url` is a SvelteKit reactive store that updates asynchronously
- Reading from `$page.url.searchParams` after `replaceState()` returns stale values
- Effect re-runs with stale URL param → processes it again → infinite loop

**Correct Pattern**:

1. Read URL params directly from `window.location.search` using `SvelteURLSearchParams`
2. Detect manual switches by comparing URL param with current state
3. Clean up URL param immediately when manual switch detected
4. Use `untrack()` for tracking variables to prevent reactive dependencies

**Related**: #L730 (Router initialization guard), #L700 (URL param infinite loops), #L650 (onMount vs $effect)

---

## #L750: Use untrack() in Cleanup Handlers to Prevent State Mutation Errors [🔴 CRITICAL]

**Symptom**: `state_unsafe_mutation` error: "Updating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden"  
**Root Cause**: Event handlers (like ProseMirror `blur`) fire during component cleanup/teardown, trying to mutate `$state` during reactive evaluation  
**Fix**:

```typescript
// ❌ WRONG: State mutation in event handler called during cleanup
let isFocused = $state(false);

const editorView = new EditorView(container, {
	handleDOMEvents: {
		blur: () => {
			isFocused = false; // ❌ Error: state_unsafe_mutation
			return false;
		}
	}
});
// When modal closes, blur fires during cleanup → error

// ✅ CORRECT: Wrap state mutation in untrack()
import { untrack } from 'svelte';

let isFocused = $state(false);

const editorView = new EditorView(container, {
	handleDOMEvents: {
		blur: () => {
			untrack(() => {
				isFocused = false; // ✅ Safe: not tracked during cleanup
			});
			return false;
		}
	}
});
```

**Why**: During component cleanup, Svelte is in a reactive evaluation context. Mutating `$state` during this phase violates Svelte's reactivity rules. `untrack()` prevents the mutation from being tracked as a reactive update.

**Apply when**:

- Event handlers mutate `$state` (focus/blur, scroll, resize)
- Using third-party libraries that call handlers during cleanup (ProseMirror, Monaco)
- Modal/component teardown triggers state updates
- `state_unsafe_mutation` errors in console

**Related**: #L700 (Effect update depth), #L400 (SSR browser checks)

---

## #L800: Browser-Only Tests Need .svelte.test.ts Extension [🔴 CRITICAL]

**Symptom**: Tests fail with "encryptSession can only be called in the browser" or "expected false to be true" for `isWebCryptoSupported()`  
**Root Cause**: Tests with `.test.ts` extension run in Node environment (server project). Web Crypto API only exists in browser.  
**Fix**:

```bash
# ❌ WRONG: .test.ts runs in Node (server project)
src/lib/client/crypto.test.ts          # ❌ No Web Crypto API
src/lib/client/crypto.perf.test.ts     # ❌ No Web Crypto API

# ✅ CORRECT: .svelte.test.ts runs in browser (client project)
src/lib/client/crypto.svelte.test.ts       # ✅ Web Crypto API available
src/lib/client/crypto.perf.svelte.test.ts  # ✅ Web Crypto API available
```

**vitest.config.ts shows two projects:**

```typescript
test: {
	projects: [
		{
			name: 'client',
			environment: 'browser', // Playwright browser
			browser: { enabled: true, provider: 'playwright' },
			include: ['src/**/*.svelte.{test,spec}.{js,ts}'] // ← .svelte.test.ts
		},
		{
			name: 'server',
			environment: 'node', // Node.js
			include: ['src/**/*.{test,spec}.{js,ts}'], // ← .test.ts
			exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
		}
	];
}
```

**Why**: Browser-only APIs (Web Crypto, localStorage, IndexedDB, canvas) need real browser environment. Vitest uses Playwright to run `.svelte.test.ts` files in actual Chromium.

**Apply when**:

- Testing Web Crypto API (encryption, hashing)
- Testing browser storage (localStorage, sessionStorage, IndexedDB)
- Testing browser APIs (Geolocation, Notifications, canvas, WebGL)
- Component tests that need real DOM
- Tests fail with "X is not defined" for browser globals

**Performance**: Browser tests slower (~100-500ms startup) than Node tests (~1-5ms). Use Node for pure logic, browser for APIs.

**Related**: #L400 (SSR-unsafe libraries), #L500 ($effect browser checks)

---

## #L850: Always Use Keys in {#each} Blocks [🔴 CRITICAL]

**Symptom**: ESLint `require-each-key` errors (~50 instances), DOM thrashing, list re-render bugs, components show wrong data when list order changes  
**Root Cause**: Svelte needs keys to track which items changed, moved, or were removed. Without keys, Svelte reuses DOM nodes incorrectly, causing state to persist across items.  
**Fix**:

```svelte
<!-- ❌ WRONG: No key - causes ~50 linting errors -->
{#each items as item}
	<div>{item.name}</div>
{/each}

{#each tags as tag}
	<TagBadge {tag} />
{/each}

<!-- ✅ CORRECT: Use unique identifier (preferred) -->
{#each items as item (item._id)}
	<div>{item.name}</div>
{/each}

{#each tags as tag (tag._id)}
	<TagBadge {tag} />
{/each}

<!-- ✅ CORRECT: Use href/id for navigation items -->
{#each navItems as item (item.href)}
	<a href={item.href}>{item.title}</a>
{/each}

<!-- ✅ CORRECT: Use composite key for nested structures -->
{#each Array.from(groups.entries()) as [parentId, children] (parentId)}
	{#each children as child (child._id)}
		<div>{child.name}</div>
	{/each}
{/each}

<!-- ✅ CORRECT: Use index only for static lists (rare) -->
{#each colors as color, index (index)}
	<div>{color}</div>
{/each}
```

**Key Selection Strategy**:

1. **Convex documents**: Use `_id` (e.g., `item._id`, `tag._id`)
2. **External data**: Use `id` if available (e.g., `item.id`)
3. **Navigation items**: Use `href` or `id` (e.g., `item.href`, `item.id`)
4. **Composite keys**: Use parent ID for outer loop, item ID for inner loop
5. **Static arrays**: Use `index` only if items never reorder (rare)

**Why**: Keys enable Svelte to:
- Track which items changed vs moved
- Preserve component state correctly
- Optimize DOM updates (no unnecessary re-renders)
- Prevent bugs where data from one item appears in another

**Apply when**: Every `{#each}` block MUST have a key expression `(key)`.  
**ESLint Rule**: `svelte/require-each-key` enforces this pattern.  
**Related**: #L140 (Key on data not ID), #L10 (Reactive state patterns)

---

## #L1085: Component Refs (bind:this) Must Use $state [🟡 IMPORTANT]

**Symptom**: svelte-check warning: "`editorRef` is updated, but is not declared with `$state(...)`. Changing its value will not correctly trigger updates"  
**Root Cause**: Component references assigned via `bind:this` are updated by Svelte, but svelte-check requires them to be declared with `$state` for proper reactivity tracking  
**Fix**:

```svelte
<!-- ❌ WRONG: Component ref without $state -->
<script>
	let editorRef: NoteEditorComponent | undefined;
</script>

<NoteEditor bind:this={editorRef} />

<!-- ✅ CORRECT: Component ref with $state -->
<script>
	let editorRef = $state<NoteEditorComponent | undefined>(undefined);
</script>

<NoteEditor bind:this={editorRef} />
```

**Why**: While component refs don't need reactivity for UI updates (they're just references), svelte-check requires `$state` declaration when variables are updated. This ensures proper tracking and prevents warnings.  
**Apply when**: 
- Using `bind:this` to get component instance references
- svelte-check warns about non-reactive updates
- Component refs used to call methods (e.g., `editorRef?.focusTitle()`)

**Note**: Component refs are typically used for calling methods, not for reactivity. The `$state` declaration satisfies svelte-check's requirements while maintaining correct behavior.  
**Related**: #L10 (Reactive state patterns), #L80 (Passing reactive values)

---

## #L1150: Date Mutations in Reactive Context - Use Immutable Timestamps [🟡 IMPORTANT]

**Symptom**: ESLint error `svelte/prefer-svelte-reactivity`: "Found a mutable instance of the built-in Date class. Use SvelteDate instead"  
**Root Cause**: Mutating `Date` objects (`.setDate()`, `.setMonth()`) inside `$derived`, `$effect`, or reactive contexts violates Svelte 5's immutability principle. JavaScript's `Date` is mutable by design, but reactive contexts require immutability.  
**Fix**: Use timestamp arithmetic instead of Date mutations

```typescript
// ❌ WRONG: Date mutations in reactive context
const upcomingMeetings = $derived.by(() => {
	let currentDate = new Date(startDate);
	currentDate.setDate(currentDate.getDate() + 7); // ❌ Mutation
	return currentDate;
});

// ✅ CORRECT: Immutable timestamp calculations
const upcomingMeetings = $derived.by(() => {
	const currentTime = startDate.getTime() + 7 * 24 * 60 * 60 * 1000;
	return new Date(currentTime);
});

// ❌ WRONG: Mutating in loop
for (let i = 0; i < 7; i++) {
	date.setDate(date.getDate() + 1); // ❌ Mutation
	dates.push(date);
}

// ✅ CORRECT: Create new instances
for (let i = 0; i < 7; i++) {
	const time = startTime + i * 24 * 60 * 60 * 1000;
	dates.push(new Date(time));
}

// ❌ WRONG: Finding next matching day
let nextDate = new Date(currentTime);
while (!daysOfWeek.includes(nextDate.getDay())) {
	nextDate.setDate(nextDate.getDate() + 1); // ❌ Mutation
}

// ✅ CORRECT: Helper function + timestamp arithmetic
function getDayOfWeek(timestamp: number): number {
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	return new Date(timestamp).getDay();
}

let nextTime = currentTime;
while (!daysOfWeek.includes(getDayOfWeek(nextTime))) {
	nextTime += 24 * 60 * 60 * 1000;
}
```

**Exception**: When Date mutations are unavoidable (e.g., month boundaries with `.setMonth()`), use ESLint disable comments:

```typescript
// For monthly recurrence, month boundaries require Date methods
// eslint-disable-next-line svelte/prefer-svelte-reactivity
const date = new Date(currentTime);
// eslint-disable-next-line svelte/prefer-svelte-reactivity
const newDate = new Date(
	date.getFullYear(),
	date.getMonth() + interval,
	date.getDate()
);
```

**Why**: Reactive contexts (`$derived`, `$effect`) require immutability. Mutating objects breaks change detection and violates Svelte's reactivity model. Timestamp arithmetic is immutable and more performant.  
**Apply when**:
- Working with dates in `$derived` or `$effect` blocks
- Calculating date ranges, recurring patterns, or schedules
- ESLint reports `svelte/prefer-svelte-reactivity` errors

**Related**: #L360 (Map/Set mutations), #L750 (State mutations in cleanup), #L700 (Effect loops)

---

## #L1200: Role-Based Rendering for Real-Time Editors [🟡 IMPORTANT]

**Symptom**: Content disappears when editor types, or editor remounts on every update, losing focus/selection  
**Root Cause**: Single component handles both editor and viewer modes. Editor's own saves trigger backend updates → remount logic fires → editor loses local state  
**Fix**:

```svelte
<!-- ❌ WRONG: Single mode with remount logic -->
{#key item.notes}
	<NoteEditor
		content={notes.localNotes}
		onContentChange={notes.handleNotesChange}
		readonly={!isSecretary}
	/>
{/key}
<!-- Problem: Remounts on backend update, even for secretary's own saves -->

<!-- ✅ CORRECT: Separate rendering paths -->
{#if isSecretary}
	<!-- EDITOR MODE: Local state, no remount -->
	<NoteEditor
		content={notes.localNotes}
		onContentChange={notes.handleNotesChange}
		readonly={false}
		showToolbar={true}
	/>
{:else}
	<!-- READER MODE: Backend state, remount on changes -->
	{#key item.notes}
		<NoteEditor
			content={item.notes || ''}
			readonly={true}
			showToolbar={false}
		/>
	{/key}
{/if}
```

**Composable Pattern** (useAgendaNotes.svelte.ts):

```typescript
// ✅ CORRECT: Secretary mode - local state is source of truth
export function useAgendaNotes(params: UseAgendaNotesParams) {
	const state = $state({
		localNotes: params.initialNotes() || '',
		saveState: 'idle' as 'idle' | 'saving' | 'saved' | 'error'
	});

	// Debounced auto-save (500ms-2s)
	function handleNotesChange(newContent: string) {
		state.localNotes = newContent;
		state.saveState = 'saving';
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => saveNotes(), 500);
	}

	async function saveNotes() {
		await convexClient.mutation(api.meetingAgendaItems.updateNotes, {
			sessionId: params.sessionId(),
			itemId: params.agendaItemId(),
			notes: state.localNotes
		});
		state.saveState = 'saved';
	}

	return {
		get localNotes() { return state.localNotes; },
		get saveState() { return state.saveState; },
		handleNotesChange,
		saveImmediately: saveNotes
	};
}
```

**Backend** (real-time via Convex):

```typescript
// Reader mode gets updates via useQuery subscription
const item = useQuery(api.meetingAgendaItems.get, () => ({
	sessionId: getSessionId(),
	itemId: activeItemId
}));
// Auto-updates when secretary saves (Convex real-time)
```

**Why**: Separating editor and viewer modes prevents the editor from remounting on its own updates. Secretary maintains local state (instant typing), viewers watch backend state (real-time updates via `{#key}`). This is the "1 editor, N readers" pattern - not full collaborative editing.

**Performance**:
- Secretary: Instant (local state), saves after 500ms-2s debounce
- Viewers: <1s latency (Convex real-time subscriptions)
- Cost: 1 mutation per save + N reads (N = number of viewers)

**Apply when**:
- Building real-time editors with secretary/facilitator model
- Content disappears when typing (remount bug)
- Need instant typing for editor, real-time viewing for others
- Not full collaborative editing (Google Docs style)

**Related**: #L140 ({#key} for data updates), #L220 (useQuery for real-time), #L700 ($effect infinite loops), #L1350 in convex-integration.md (useQuery throw pattern)

---

---

## #L900: Call $derived Functions When Passing as Props [🔴 CRITICAL]

**Symptom**: `$derived` values don't update in child components, props show as functions instead of values  
**Root Cause**: `$derived(() => ...)` returns a function. When passed as props without calling, child receives function, not value.  
**Fix**:

```typescript
// ❌ WRONG: Passing $derived function directly
const organizationSummaries = $derived(() => {
	if (!organizations) return [];
	return organizations.organizations ?? [];
});

<ChildComponent organizations={organizationSummaries} /> // ❌ Receives function

// ✅ CORRECT: Call $derived function when passing as prop
<ChildComponent organizations={organizationSummaries()} /> // ✅ Receives array

// Also fix other $derived props
<ChildComponent
	organizations={organizationSummaries()}
	activeOrganizationId={activeOrganizationId()}
	activeOrganization={activeOrganization()}
/>
```

**In Templates**: Also call explicitly in `{#each}` blocks:

```svelte
<!-- ❌ WRONG: May not execute -->
{#each allOrganizations as org (org.id)}
	{org.name}
{/each}

<!-- ✅ CORRECT: Explicit call ensures execution -->
{#each allOrganizations() as org (org.id)}
	{org.name}
{/each}
```

**Why**: `$derived(() => ...)` creates a function that must be called to get the value. Svelte 5 templates should auto-call, but explicit calls ensure reliability.  
**Apply when**: Passing `$derived(() => ...)` values as props or using in templates  
**Related**: #L10 (Getter pattern), #L80 (Function parameters), SYOS-228 (Getter reactivity tracking)

---

## #L910: Access Getter Properties from Context Without Optional Chaining [🔴 CRITICAL]

**Symptom**: `$derived` values don't execute, return functions instead of values, reactivity breaks  
**Root Cause**: Optional chaining (`?.`) in `$derived` expressions prevents Svelte from tracking getter property access from context  
**Fix**:

```typescript
// ❌ WRONG: Optional chaining breaks reactivity tracking
const organizations = getContext<UseOrganizations | undefined>('organizations');
const organizationSummaries = $derived(() => organizations?.organizations ?? []); // ❌ Not tracked

// ✅ CORRECT: Check object existence first, then access getter directly
const organizationSummaries = $derived(() => {
	if (!organizations) return [];
	return organizations.organizations ?? []; // ✅ Svelte tracks getter access
});

// Pattern for all getter properties
const activeOrganizationId = $derived(() => {
	if (!organizations) return null;
	return organizations.activeOrganizationId ?? null;
});
```

**Why**: Svelte 5 tracks property access for reactivity. Optional chaining (`?.`) can interfere with tracking getter properties from context objects. Checking existence first, then accessing the getter directly ensures proper reactivity.  
**Apply when**: Accessing getter properties from context composables in `$derived` expressions  
**Related**: #L10 (Getter pattern), SYOS-228 (Full pattern documentation)

---

## #L920: Extract Primitives from $derived Before Passing to Convex Queries [🔴 CRITICAL]

**Symptom**: `state_snapshot_uncloneable` error: "The following properties cannot be cloned with `$state.snapshot`"  
**Root Cause**: Passing `$derived` function (not primitive value) to Convex `useQuery`. Convex tries to serialize arguments, Svelte's `$state.snapshot` fails on functions.  
**Fix**:

```typescript
// ❌ WRONG: Passing $derived function to Convex
const organizationId = $derived(() => {
	if (!organizations) return undefined;
	return organizations.activeOrganizationId ?? undefined;
});

const getOrganizationId = () => organizationId; // ❌ Returns function

useQuery(api.circles.list, () => {
	const orgId = getOrganizationId(); // ❌ Function, not primitive
	return { sessionId, organizationId: orgId }; // ❌ snapshot fails
});

// ✅ CORRECT: Call $derived function to get primitive
const getOrganizationId = () => organizationId(); // ✅ Returns primitive

useQuery(api.circles.list, () => {
	const orgId = getOrganizationId(); // ✅ Primitive string
	return { sessionId, organizationId: orgId }; // ✅ Works
});

// Also fix in $effect checks
$effect(() => {
	if (!organizationId()) { // ✅ Call function
		goto('/onboarding');
	}
});
```

**Why**: Convex queries serialize arguments using `$state.snapshot`. Functions cannot be cloned. Extract primitive values by calling `$derived` functions before passing to Convex.  
**Apply when**: Passing `$derived` values to Convex queries or mutations  
**Related**: #L900 (Call $derived functions), #L10 (Convex undefined values)

---

## #L1460: Composite Keys for Shared Resources [🔴 CRITICAL]

**Symptom**: `each_key_duplicate` error when multiple users/accounts have access to same organization  
**Root Cause**: Using organizationId alone as key when multiple users can belong to same organization creates duplicate keys  
**Fix**:

```svelte
<!-- ❌ WRONG: Single ID when multiple users share same resource -->
{#each linkedAccountsWithOrgs() as account}
	{#each account.organizations as org (org.organizationId)}
		<!-- ❌ Error: If account1 and account2 both have orgX, duplicate key -->
	{/each}
{/each}

<!-- ✅ CORRECT: Composite key combining resource ID + context (user ID) -->
{#each linkedAccountsWithOrgs() as account (account.userId)}
	{#each account.organizations as org (`${org.organizationId}-${account.userId}`)}
		<!-- ✅ Unique: Each org-user combination has unique key -->
		<div>{org.name} - {account.email}</div>
	{/each}
{/each}
```

**Why**: When the same resource (organization) appears in multiple contexts (different users), you need a composite key that combines both the resource ID and the context ID to ensure uniqueness.

**Apply when**:
- Multiple users/accounts can access the same resource (organizations, teams, projects)
- Resource appears in different sections grouped by user/account
- Getting `each_key_duplicate` error with IDs that should be unique

**Related**: #L850 (Basic each keys), #L900 (Calling $derived functions)

---

## #L1510: Variable Scope in Try-Catch with Async/Await [🔴 CRITICAL]

**Symptom**: `ReferenceError: [variable] is not defined` when accessing variable from try block in cleanup code  
**Root Cause**: Variable declared inside try block is not accessible in code that runs after the try-catch (different scope)  
**Fix**:

```typescript
// ❌ WRONG: Variable declared inside try, accessed outside
try {
	const response = await fetch('/api/data');
	const data = await response.json();
	
	// ... process data ...
} catch (error) {
	console.error('Failed:', error);
}

// ❌ ReferenceError: data is not defined
if (data.items) {
	// cleanup code
}

// ✅ CORRECT: Declare variable before try, assign inside
let data = null;
try {
	const response = await fetch('/api/data');
	data = await response.json();
	
	// ... process data ...
} catch (error) {
	console.error('Failed:', error);
}

// ✅ Now accessible
if (data?.items) {
	// cleanup code works
}

// ✅ BETTER: Move cleanup inside try block
try {
	const response = await fetch('/api/data');
	const data = await response.json();
	
	// ... process data ...
	
	// Cleanup immediately after processing (same scope)
	if (data.items) {
		// cleanup code
	}
} catch (error) {
	console.error('Failed:', error);
}
```

**Why**: Variables declared inside a block (try, if, for, etc.) are scoped to that block and not accessible outside.

**Apply when**:
- Getting "ReferenceError: [variable] is not defined"
- Need to access data from async operation in cleanup/post-processing
- Variable declared inside try block but used after catch

**Related**: #L730 (Try-catch with replaceState), #L700 ($effect reactivity loops)

---

---

## #L1600: Page Data Access for Composable Functions [🔴 CRITICAL]

**Symptom**: Hydration error `$.get(...) is not a function` or `TypeError: Cannot call undefined`  
**Root Cause**: Using `$derived($page.data.sessionId)` creates a reactive value, not a function. Composables expecting functions receive a value instead.  
**Fix**:

```typescript
// ❌ WRONG: $derived creates reactive value, not function
const sessionId = $derived($page.data.sessionId);
const getSessionId = () => sessionId(); // ❌ sessionId is value, not function

useMeetings({
	sessionId: getSessionId // ❌ Passes function that calls non-function
});

// ✅ CORRECT: Direct function access pattern (Context7 validated)
const getSessionId = () => $page.data.sessionId;

useMeetings({
	sessionId: getSessionId // ✅ Function that returns reactive value
});

// Usage in useQuery
const query = browser && getSessionId()
	? useQuery(api.featureFlags.checkFlag, () => {
			const session = getSessionId();
			if (!session) throw new Error('sessionId required');
			return { sessionId: session };
		})
	: null;
```

**Why**: Composables expect function parameters `() => value` for reactivity. `$derived` creates a reactive value that must be called, but when wrapped incorrectly it breaks. Direct function access ensures proper reactivity tracking.  
**Apply when**: Passing page data to composables or useQuery that expect function parameters  
**Related**: #L80 (Function parameters), #L920 (Extract primitives), #L1350 (Conditional hooks)

---

**Pattern Count**: 27  
**Last Validated**: 2025-11-19  
**Context7 Source**: `/sveltejs/svelte`, `@sveltejs/kit`, `/get-convex/convex-js`

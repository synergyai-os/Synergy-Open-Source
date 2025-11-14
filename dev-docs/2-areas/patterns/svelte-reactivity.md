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

**Pattern Count**: 18  
**Last Validated**: 2025-11-13  
**Context7 Source**: `/sveltejs/svelte`, `@sveltejs/kit`

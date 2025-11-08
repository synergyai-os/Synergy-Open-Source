# SSR 500 Error Troubleshooting

## Issue
Getting 500 Internal Server Error when accessing /flashcards after adding notes system.

## Root Cause
Server-Side Rendering (SSR) incompatibility with client-only code in the layout.

## Fixes Applied

### 1. Browser Guard for useGlobalShortcuts ✅
```typescript
// Before (WRONG)
const shortcuts = useGlobalShortcuts();

// After (CORRECT)
const shortcuts = browser ? useGlobalShortcuts() : null;
```

### 2. Reorganized State Initialization ✅
- Moved all `$state()` declarations together
- Initialized browser-dependent values inside `if (browser)` block
- Ensured SSR-safe defaults

## Troubleshooting Steps

### Step 1: Clear Build Cache
```bash
# Stop the dev server (Ctrl+C)
rm -rf .svelte-kit
rm -rf node_modules/.vite
npm run dev
```

### Step 2: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for actual error message
4. Check Network tab for 500 response details

### Step 3: Check Terminal/Server Logs
Look for error stack trace in the terminal running `npm run dev`.

### Step 4: Verify Convex is Running
```bash
# In separate terminal
npx convex dev
```

## Common SSR Errors

### Error: `$state is not defined`
**Fix**: Guard with browser check or ensure composable uses `.svelte.ts` extension

### Error: `window is not defined`
**Fix**: Wrap window/localStorage access in `if (browser)`

### Error: `document is not defined`
**Fix**: Wrap DOM access in `if (browser)` or use `$effect`

## Testing the Fix

1. Stop dev server (Ctrl+C)
2. Clear cache: `rm -rf .svelte-kit`
3. Restart: `npm run dev`
4. Navigate to: http://localhost:5176/flashcards
5. Check if page loads
6. Press C key to test CreateMenu

## If Still Getting 500 Error

### Check These Files:
1. `src/lib/composables/useGlobalShortcuts.svelte.ts` - Should have `.svelte.ts` extension
2. `src/lib/components/sidebar/CreateMenu.svelte` - Check for client-only code
3. `src/routes/(authenticated)/+layout.svelte` - All state should be SSR-safe

### Get Actual Error Message:
```bash
# Run with verbose logging
DEBUG=* npm run dev
```

### Nuclear Option - Fresh Install:
```bash
rm -rf node_modules
rm -rf .svelte-kit
rm package-lock.json
npm install
npm run dev
```

## Pattern to Remember

**✅ CORRECT Pattern for SSR-Safe Composables:**
```typescript
// In +layout.svelte or +page.svelte
import { browser } from '$app/environment';
import { useMyComposable } from '$lib/composables/useMyComposable.svelte';

// Guard composable initialization
const myComposable = browser ? useMyComposable() : null;

// Guard effects
$effect(() => {
  if (!myComposable) return; // SSR safe
  myComposable.doSomething();
});

// Guard browser APIs
let myState = $state(false); // OK - default value
if (browser) {
  myState = window.innerWidth < 768; // Browser API usage
}
```

**❌ WRONG Pattern:**
```typescript
// DON'T do this - runs during SSR
const shortcuts = useGlobalShortcuts(); // ❌
const width = window.innerWidth; // ❌ window not available during SSR
```

## Related Patterns
See `dev-docs/patterns/svelte-reactivity.md#L180` for more SSR patterns.


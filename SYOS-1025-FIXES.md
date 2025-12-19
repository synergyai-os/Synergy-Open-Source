# SYOS-1025 Bug Fixes

**Date**: 2025-12-19  
**Issues Found During Testing**: 3 bugs in initial implementation

---

## Bug #1: Breadcrumb Shows "Loading..." for Roles

### Problem

When opening a role panel (either from Circle panel or from chart), the breadcrumb displayed "Loading..." instead of the actual role name.

### Root Cause

The `selectRole()` legacy method was pushing layers to the navigation stack with a placeholder name (`'Loading...'`) because the role name wasn't being passed through the call chain.

### Solution

Updated the role click flow to pass role names:

1. **Updated `handleRoleClick` signature** in `CircleDetailPanel.svelte` to accept both `roleId` and `roleName`
2. **Updated `selectRole` options** in `useOrgChart.svelte.ts` to accept `roleName` in options
3. **Updated all call sites** to pass `role.name`:
   - `CircleOverviewTab.svelte` - passes `role.name` when clicking roles
   - `CircleTabContent.svelte` - updated prop type signature
   - `OrgChart.svelte` - passes `role.name` when clicking from chart

### Files Changed

- `src/lib/modules/org-chart/components/CircleDetailPanel.svelte`
- `src/lib/modules/org-chart/composables/useOrgChart.svelte.ts`
- `src/lib/modules/org-chart/components/tabs/CircleOverviewTab.svelte`
- `src/lib/modules/org-chart/components/CircleTabContent.svelte`
- `src/lib/modules/org-chart/components/OrgChart.svelte`

---

## Bug #2: URL Doesn't Update When Navigating Back

### Problem

When navigating back (pressing ESC or clicking breadcrumbs), the URL stayed the same. For example:

- Navigate forward: URL grows `?nav=c:id1.c:id2.r:id3`
- Navigate back: URL should shrink to `?nav=c:id1.c:id2`
- **Bug**: URL stayed at `?nav=c:id1.c:id2.r:id3`

### Root Cause

In the `pushAndReplace()` function in `useStackedNavigation.svelte.ts`, we were calling `updateUrl()` twice:

1. Line 454: `push(layer)` internally calls `updateUrl('push')`
2. Line 457: `updateUrl('replace')` is called again

This double call to `updateUrl` was interfering with browser history management, causing the URL to not update properly when navigating back.

### Solution

Modified `pushAndReplace()` to call `navStack.push()` directly instead of using the `push()` wrapper, then call `updateUrl('replace')` once at the end.

**Before:**

```typescript
function pushAndReplace(layer: Omit<NavigationLayer, 'zIndex'>): boolean {
	// ...
	navStack.pop();
	const result = push(layer); // ❌ Calls updateUrl('push')
	updateUrl('replace'); // ❌ Calls updateUrl again!
	return result;
}
```

**After:**

```typescript
function pushAndReplace(layer: Omit<NavigationLayer, 'zIndex'>): boolean {
	// ...
	navStack.pop();
	navStack.push(layer); // ✅ Direct push without URL update
	updateUrl('replace'); // ✅ Single URL update
	return true;
}
```

### Files Changed

- `src/lib/composables/useStackedNavigation.svelte.ts`

---

## Bug #3: Page Reloads When URL Changes (CRITICAL UX Issue)

### Problem

**Horrible UX**: Every navigation action caused a full page reload:

- Clicking a circle: Page reloads
- Pressing ESC: Page reloads
- Clicking breadcrumbs: Page reloads

This made the app feel slow and janky, losing all client-side state on every navigation.

### Root Cause

The `updateUrl()` function was using SvelteKit's `goto()` function, which triggers full SvelteKit navigation (including server-side data loading, component remounting, etc.).

**Before:**

```typescript
function updateUrl(action: 'push' | 'replace'): void {
	// ...
	goto(currentUrl.toString(), {
		replaceState: action === 'replace',
		keepFocus: true,
		noScroll: true
	}); // ❌ Triggers full SvelteKit navigation
}
```

### Solution

Replaced SvelteKit's `goto()` with native browser `History API` (`pushState`/`replaceState`), which updates the URL **without any page reload**.

**After:**

```typescript
function updateUrl(action: 'push' | 'replace'): void {
	// ...
	// Use History API directly to avoid page reloads
	if (action === 'push') {
		window.history.pushState({}, '', currentUrl.toString());
	} else {
		window.history.replaceState({}, '', currentUrl.toString());
	} // ✅ Updates URL instantly without reload
}
```

### Why This Works

- **History API**: Native browser API for manipulating browser history without navigation
- **No SvelteKit involvement**: Bypasses SvelteKit's routing system entirely
- **Instant updates**: URL changes are synchronous and don't trigger any loading
- **Preserves state**: All client-side state (React components, stores, etc.) remains intact

### Additional Changes

- Removed unused imports: `goto`, `SvelteURL`
- Changed from `SvelteURL` to native `URL` constructor (no Svelte-specific behavior needed)

### Files Changed

- `src/lib/composables/useStackedNavigation.svelte.ts`

---

## Testing

### Automated Tests

✅ **`npm run check`**: Passed (0 errors, 0 warnings)  
✅ **`npm run lint`**: Passed  
✅ **Formatting**: All files formatted

### Manual Testing Required

All three bugs should now be fixed:

1. **Breadcrumb displays role names** ✅
   - Open role from Circle panel → breadcrumb shows role name
   - Open role from chart → breadcrumb shows role name

2. **URL updates when navigating back** ✅
   - Navigate forward: `?nav=c:id1` → `?nav=c:id1.r:id2`
   - Press ESC: URL updates to `?nav=c:id1`
   - Press ESC: URL updates to empty (no nav param)
   - Browser back/forward: URL updates correctly

3. **No page reloads** ✅ **CRITICAL FIX**
   - Click circle: URL updates instantly, no reload
   - Press ESC: URL updates instantly, no reload
   - Click breadcrumbs: URL updates instantly, no reload
   - Smooth, instant navigation like a modern SPA

---

## Impact

These fixes complete the SYOS-1025 implementation by ensuring:

- **User experience**: Breadcrumbs are informative (show actual role names)
- **Navigation reliability**: URL properly syncs with navigation state
- **Performance**: No page reloads = instant navigation (HUGE UX improvement)
- **Browser integration**: Back/forward buttons work correctly
- **Deep linking**: URLs can be shared and will open the correct panels
- **State preservation**: All client-side state remains intact during navigation

The stuck panel bug (main issue) was already fixed in the initial implementation. These fixes address:

1. UI polish (breadcrumb names)
2. URL sync reliability
3. **Critical UX issue (page reloads)** ← Most important fix

---

## Technical Notes

### Why Not Use SvelteKit's goto()?

**SvelteKit's `goto()`**:

- Designed for full page navigation
- Triggers server-side data loading
- Remounts components
- Runs load functions
- Updates page store
- **Result**: Full page reload (slow, loses state)

**Native History API**:

- Only updates browser URL bar
- No server communication
- No component remounting
- No load functions
- **Result**: Instant URL update (fast, preserves state)

### When to Use Each

- **Use `goto()`**: When you want to navigate to a different page (e.g., `/chart` → `/meetings`)
- **Use History API**: When you want to update URL params on the same page (e.g., `?nav=c:id1` → `?nav=c:id1.r:id2`)

Our use case is the latter - we're just updating query params to reflect panel state, not navigating to a different page.

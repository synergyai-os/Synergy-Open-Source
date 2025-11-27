# Svelte Reactivity Patterns

Patterns for Svelte 5 runes, reactivity, composables, and state management.

---

## #L10: Composable Reactivity Break [🔴 CRITICAL]

**Symptom**: Props passed to composable/helper function don't update when parent props change. Data appears stale or empty.

**Root Cause**: When you pass props to a function at component initialization, the values are **captured once**. Inside the function, `$derived` tracks the local variable reference, not the original reactive prop.

**Example of broken code**:
```typescript
// ❌ BROKEN: Composable receives values at call time, not reactive signals
const { currentAccountOrganizations, linkedAccountsWithOrgs } = useOrganizationSwitcherData({
    organizations,    // Captured at call time!
    linkedAccounts    // Captured at call time!
});

// Inside composable - $derived tracks local variable, not prop
export function useOrganizationSwitcherData(options) {
    const { organizations, linkedAccounts } = options; // Captured once
    
    const linkedAccountsWithOrgs = $derived.by(() => {
        // This tracks `linkedAccounts` local variable, NOT the prop
        return linkedAccounts.filter(a => a.userId);
    });
}
```

**Fix**: Inline `$derived` directly in component OR pass getter functions:

```svelte
<!-- ✅ CORRECT: Inline $derived directly tracks props -->
<script lang="ts">
    let { organizations, linkedAccounts } = $props();
    
    // $derived directly tracks the prop - updates when prop changes
    const currentAccountOrganizations = $derived(
        organizations.filter(org => org.organizationId).map(org => ({
            organizationId: org.organizationId,
            name: org.name,
            isFromLinkedAccount: false
        }))
    );
    
    const linkedAccountsWithOrgs = $derived(
        linkedAccounts.filter(account => account.userId)
    );
</script>
```

**Alternative** (if composable pattern needed):
```typescript
// Pass getter functions to maintain reactivity
const data = useOrganizationSwitcherData({
    getOrganizations: () => organizations,
    getLinkedAccounts: () => linkedAccounts
});

// Inside composable - call getters in $derived
const linkedAccountsWithOrgs = $derived.by(() => {
    return options.getLinkedAccounts().filter(a => a.userId);
});
```

**Apply when**: 
- Data from composable appears empty/stale
- Props change but composable doesn't re-render
- Using helper functions that receive props as arguments

**Related**: 
- Svelte 5 Runes documentation
- `$derived` vs `$derived.by` usage

---

## #L60: Effect with requestAnimationFrame [🟢 REFERENCE]

**Symptom**: Need to perform DOM manipulation after state change (e.g., reset scroll position)

**Root Cause**: DOM may not be updated when `$effect` runs. Need to wait for next frame.

**Fix**:
```typescript
// ✅ CORRECT: Use requestAnimationFrame for DOM operations
$effect(() => {
    if (menuOpen && viewportRef) {
        requestAnimationFrame(() => {
            viewportRef!.scrollTop = 0;
        });
    }
});
```

**Apply when**: 
- Resetting scroll position
- Focusing elements after state change
- Any DOM measurement/manipulation in effects

**Note**: Svelte MCP autofixer will warn about `requestAnimationFrame` in `$effect`. This is acceptable for DOM manipulation - you're NOT reassigning state, just performing side effects.

---

## #L70: $derived Values Are Not Functions [🔴 CRITICAL]

**Keywords**: $derived, function call, TypeError, $.get is not a function, Svelte 5 runes, reactive values

**Symptom**: 
- Error: `Uncaught TypeError: $.get(...) is not a function`
- Component doesn't render or entire component tree breaks
- Error occurs at component line where `$derived` value()` is called

**Root Cause**: In Svelte 5, `$derived` creates a **reactive value**, not a function. Calling it with `()` tries to invoke a value as a function, causing a runtime error.

**Example of broken code**:
```svelte
<script lang="ts">
    const switchClasses = $derived([toggleSwitchRecipe({ checked, disabled })]);
    const switchStyle = $derived(`background-color: var(--color-component-toggle-off);`);
</script>

<!-- ❌ BROKEN: Calling $derived value as function -->
<button class={switchClasses()} style={switchStyle()}>
    Content
</button>
```

**Fix**: Access `$derived` values directly without calling them:

```svelte
<script lang="ts">
    const switchClasses = $derived([toggleSwitchRecipe({ checked, disabled })]);
    const switchStyle = $derived(`background-color: var(--color-component-toggle-off);`);
</script>

<!-- ✅ CORRECT: Access $derived value directly -->
<button class={switchClasses} style={switchStyle}>
    Content
</button>
```

**Why this breaks everything**: When a component throws an error during rendering, Svelte stops rendering the entire component tree. If the error occurs in a child component (e.g., ToggleSwitch), parent components (e.g., Dialog modal) may appear to render (overlay shows) but content doesn't render because the error prevents the tree from completing.

**Detection**:
- Check browser console for `TypeError: $.get(...) is not a function`
- Error stack trace points to component file and line number
- Component appears broken or parent components don't render content

**Apply when**: 
- Using `$derived` in Svelte 5 components
- Component doesn't render or throws runtime errors
- Parent components appear broken when child component has error
- Error mentions `$.get` or function call on reactive value

**Anti-Patterns**:
- ❌ `class={derivedClasses()}` - Calling $derived as function
- ❌ `style={derivedStyle()}` - Calling $derived as function
- ✅ `class={derivedClasses}` - Accessing $derived directly
- ✅ `style={derivedStyle}` - Accessing $derived directly

**Related**: 
- Svelte 5 Runes documentation
- `$derived` vs `$derived.by` usage
- Component rendering errors breaking parent components

---

**Last Updated**: 2025-01-27


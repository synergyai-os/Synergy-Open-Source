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

**Last Updated**: 2025-11-26


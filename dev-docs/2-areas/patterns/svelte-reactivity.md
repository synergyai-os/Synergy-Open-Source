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
    workspaces,    // Captured at call time!
    linkedAccounts    // Captured at call time!
});

// Inside composable - $derived tracks local variable, not prop
export function useOrganizationSwitcherData(options) {
    const { workspaces, linkedAccounts } = options; // Captured once
    
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
    let { workspaces, linkedAccounts } = $props();
    
    // $derived directly tracks the prop - updates when prop changes
    const currentAccountOrganizations = $derived(
        workspaces.filter(org => org.workspaceId).map(org => ({
            workspaceId: org.workspaceId,
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
    getOrganizations: () => workspaces,
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

## #L120: Bidirectional $effect Sync Causes Infinite Loop [🔴 CRITICAL]

**Keywords**: $effect, infinite loop, freeze, frozen, bidirectional sync, two-way binding, form state, composable state, setField, formValues, local state, untrack, controlled input

**Principle**: Never use two `$effect` blocks to sync state in both directions. Use `$derived` for reading and callbacks for writing.

**Symptom**: 
- App freezes completely (must reload page)
- Browser becomes unresponsive
- Happens when interacting with form or trying to close modal/panel
- No visible error (infinite loop consumes all resources)

**Root Cause**: Two `$effect` blocks watching each other's outputs creates a cycle:

```
Effect 1: formValues changes → writes localValue
Effect 2: localValue changes → calls setField() → mutates composable state
Composable: state mutates → formValues (derived) recalculates → NEW object reference
Effect 1: sees "new" formValues → writes localValue again
→ INFINITE LOOP → FREEZE
```

**Example of broken code**:
```svelte
<script lang="ts">
    // ❌ BROKEN: Bidirectional $effect sync causes infinite loop
    let nameValue = $state('');
    
    // Effect 1: Sync FROM composable TO local
    $effect(() => {
        const formValues = editCircle.formValues;
        nameValue = formValues.name; // WRITES to local state
    });
    
    // Effect 2: Sync FROM local TO composable
    $effect(() => {
        editCircle.setField('name', nameValue); // READS local state, WRITES to composable
    });
</script>

<FormInput bind:value={nameValue} />
```

**Fix**: Use `$derived` for reading (one-way) and explicit callbacks for writing:

```svelte
<script lang="ts">
    // ✅ CORRECT: $derived for reading, callbacks for writing
    // Single source of truth = composable state
    const nameValue = $derived(editCircle.formValues.name);
</script>

<!-- Use oninput callback to write, value prop to read -->
<FormInput 
    value={nameValue}
    oninput={(e) => editCircle.setField('name', e.currentTarget.value)}
/>
```

**Alternative with `untrack()`** (when you MUST write in an effect):
```svelte
<script lang="ts">
    import { untrack } from 'svelte';
    
    // Only track leadAuthority, not related fields
    $effect(() => {
        const leadAuthority = editCircle.formValues.leadAuthority;
        const currentField = untrack(() => editCircle.formValues.relatedField);
        
        // This won't cause a loop because relatedField isn't tracked
        if (!isValidField(currentField, leadAuthority)) {
            editCircle.setField('relatedField', getDefaultField(leadAuthority));
        }
    });
</script>
```

**Form Component Pattern** (enable controlled inputs):
```svelte
<!-- FormInput.svelte - add oninput prop -->
<script lang="ts">
    let {
        value = $bindable(''),
        oninput  // Allow controlled input pattern
    }: Props = $props();
</script>

<input bind:value {oninput} />
```

**Apply when**: 
- Building edit forms with composables
- Syncing local component state with external state manager
- Any bidirectional state synchronization
- App freezes when opening/closing panels or interacting with forms

**Anti-Patterns**:
- ❌ Two `$effect` blocks that read/write to each other's dependencies
- ❌ `$effect` that both reads and writes the same state
- ❌ Using `bind:value` with local state that syncs to composable via `$effect`

**Correct Patterns**:
- ✅ `$derived` for reading + callbacks for writing
- ✅ Single source of truth (either local OR composable, not both)
- ✅ `untrack()` to break specific dependency chains when needed
- ✅ Controlled input pattern: `value={derivedValue}` + `oninput={callback}`

**Related**: 
- #L10 (Composable Reactivity Break) - related reactivity issue
- Svelte 5 docs: "Anti-pattern for Bidirectional State Sync with $effect"
- `untrack()` documentation

---

**Last Updated**: 2025-12-05


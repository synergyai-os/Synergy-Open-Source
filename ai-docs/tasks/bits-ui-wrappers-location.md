# Bits UI Wrapper Components Location

**Date**: 2025-01-27  
**Purpose**: Document where all Bits UI wrapper components are located

---

## Location

**All Bits UI wrappers are located in:**

```
src/lib/components/atoms/
```

---

## Pure Module Re-Exports (13 components)

These are **module-level exports only** - they just re-export Bits UI components without any wrapper component:

| Component       | File                 | Exports                                                     | Type                                 |
| --------------- | -------------------- | ----------------------------------------------------------- | ------------------------------------ |
| **Checkbox**    | `Checkbox.svelte`    | `Root`, `Group`, `GroupLabel`                               | Module re-export                     |
| **Switch**      | `Switch.svelte`      | `Root`, `Thumb`                                             | Module re-export                     |
| **Label**       | `Label.svelte`       | `Root`                                                      | Module re-export                     |
| **Progress**    | `Progress.svelte`    | `Root`                                                      | Module re-export                     |
| **Tooltip**     | `Tooltip.svelte`     | `Provider`, `Root`, `Trigger`, `Portal`, `Content`, `Arrow` | Module re-export                     |
| **AspectRatio** | `AspectRatio.svelte` | `Root`                                                      | Module re-export                     |
| **RadioGroup**  | `RadioGroup.svelte`  | `Root`, `Item`                                              | Module re-export                     |
| **Slider**      | `Slider.svelte`      | `Root`, `Range`, `Thumb`, `Tick`                            | Module re-export                     |
| **Toggle**      | `Toggle.svelte`      | `Root`                                                      | Module re-export                     |
| **Tabs**        | `Tabs.svelte`        | `Root`, `List`, `Trigger`, `Content`                        | Module re-export                     |
| **Meter**       | `Meter.svelte`       | `Root`                                                      | Module re-export                     |
| **ScrollArea**  | `ScrollArea.svelte`  | `Root`, `Viewport`, `Scrollbar`, `Thumb`, `Corner`          | Module re-export                     |
| **ToggleGroup** | `ToggleGroup.svelte` | `Root`, `Item`                                              | Module re-export (has global styles) |

**Usage Pattern:**

```typescript
// Import as namespace
import * as Checkbox from '$lib/components/atoms/Checkbox.svelte';

// Use Bits UI components
<Checkbox.Root>
  {#snippet children({ checked })}
    <!-- Custom UI -->
  {/snippet}
</Checkbox.Root>
```

**Exported from `index.ts` as:**

```typescript
export * as Checkbox from './Checkbox.svelte';
export * as RadioGroup from './RadioGroup.svelte';
// etc.
```

---

## Components That USE Bits UI (4 components)

These are **actual components** that use Bits UI internally but have their own logic/styling:

| Component      | File                | Bits UI Used                                 | Type                            |
| -------------- | ------------------- | -------------------------------------------- | ------------------------------- |
| **Button**     | `Button.svelte`     | `BitsButton.Root`                            | Full component (uses recipe)    |
| **Combobox**   | `Combobox.svelte`   | `BitsCombobox.Root`, `Trigger`, `Item`, etc. | Full component (uses recipes)   |
| **FormSelect** | `FormSelect.svelte` | `Select.Root`, `Trigger`, `Content`, etc.    | Full component (uses recipe)    |
| **PinInput**   | `PinInput.svelte`   | `PinInputPrimitive.Root`, `Cell`             | Full component (manual styling) |

**Usage Pattern:**

```typescript
// Import as default component
import { Button } from '$lib/components/atoms';

// Use as regular component
<Button variant="primary" size="md">Click me</Button>
```

**Exported from `index.ts` as:**

```typescript
export { default as Button } from './Button.svelte';
export { default as Combobox } from './Combobox.svelte';
// etc.
```

---

## Summary

### Pure Wrappers (Module Re-exports)

- **Location**: `src/lib/components/atoms/`
- **Count**: 13 components
- **Pattern**: `export const Root = BitsComponent.Root;`
- **Export**: `export * as ComponentName from './ComponentName.svelte';`
- **No recipes needed**: They're just re-exports

### Components Using Bits UI

- **Location**: `src/lib/components/atoms/`
- **Count**: 4 components
- **Pattern**: Full component with Bits UI used internally
- **Export**: `export { default as ComponentName } from './ComponentName.svelte';`
- **Recipes**: Button, Combobox, FormSelect have recipes ✅

---

## File Structure

```
src/lib/components/atoms/
├── Checkbox.svelte          ← Pure wrapper (module re-export)
├── Switch.svelte             ← Pure wrapper (module re-export)
├── Label.svelte              ← Pure wrapper (module re-export)
├── Progress.svelte           ← Pure wrapper (module re-export)
├── Tooltip.svelte            ← Pure wrapper (module re-export)
├── AspectRatio.svelte        ← Pure wrapper (module re-export)
├── RadioGroup.svelte         ← Pure wrapper (module re-export)
├── Slider.svelte             ← Pure wrapper (module re-export)
├── Toggle.svelte             ← Pure wrapper (module re-export)
├── Tabs.svelte               ← Pure wrapper (module re-export)
├── Meter.svelte              ← Pure wrapper (module re-export)
├── ScrollArea.svelte         ← Pure wrapper (module re-export)
├── ToggleGroup.svelte        ← Pure wrapper (module re-export + global styles)
│
├── Button.svelte             ← Uses Bits UI (full component with recipe)
├── Combobox.svelte           ← Uses Bits UI (full component with recipes)
├── FormSelect.svelte         ← Uses Bits UI (full component with recipe)
└── PinInput.svelte           ← Uses Bits UI (full component, manual styling)
```

---

## Key Differences

### Pure Wrappers

- ✅ No default export
- ✅ Only module-level exports (`export const Root = ...`)
- ✅ No component logic
- ✅ No styling (consumers apply design tokens)
- ✅ No recipes needed

### Components Using Bits UI

- ✅ Has default export
- ✅ Has component logic (props, state, handlers)
- ✅ Has styling (recipes or manual)
- ✅ Can have variants/sizes
- ✅ Recipes recommended for consistency

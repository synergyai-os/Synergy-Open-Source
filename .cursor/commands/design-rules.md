# Design Rules

Core rules for consistent UI. Follow these always.

---

## 1. Size Variants

**Default is `md` for everything.**

### Core Standard

All recipes with size variants MUST:
- Include `sm`, `md`, `lg` as the core three sizes
- Set `defaultVariants: { size: 'md' }` (always `md`, never `base`)

```ts
variants: {
  size: {
    sm: '...',  // Small
    md: '...',  // Medium (DEFAULT)
    lg: '...'   // Large
  }
},
defaultVariants: {
  size: 'md'  // Always md, never 'base'
}
```

### Extended Sizes (When Needed)

Some components may need extended ranges:
- **Smaller**: `xs` (or `xxs` for very small) - e.g., Avatar, Icon
- **Larger**: `xl` (or `xxl` for very large) - e.g., Icon, Stepper

**Rule**: Only add extended sizes when the component genuinely needs them. Most components should stick to `sm`, `md`, `lg`.

### Examples

```ts
// ✅ Standard (most components)
size: { sm: '...', md: '...', lg: '...' }

// ✅ Extended (when needed - Avatar, Icon)
size: { xxs: '...', xs: '...', sm: '...', md: '...', lg: '...', xl: '...', xxl: '...' }

// ❌ Wrong - using 'base' instead of 'md'
size: { sm: '...', base: '...', lg: '...' }  // NO - use 'md'
```

---

## 2. Spacing Tokens

**Never hardcode spacing. Use semantic tokens.**

| Pattern | Token | Value |
|---------|-------|-------|
| Section gaps | `gap-section` | 24px |
| Section margins | `mb-section` | 24px |
| Header → content | `mb-header` | 12px |
| Form fields | `gap-form` | 12px |
| Tight groups | `gap-fieldGroup` | 8px |
| Card padding | `card-padding` | 24px |
| Page padding | `px-page`, `py-page` | 24px, 32px |

```svelte
<!-- ✅ Correct -->
<div class="gap-section mb-header">

<!-- ❌ Wrong -->
<div class="gap-6 mb-3">
```

---

## 3. Color Tokens

**Use semantic colors, never base colors.**

| Use | Not |
|-----|-----|
| `bg-surface` | `bg-neutral-0` |
| `text-primary` | `text-neutral-900` |
| `text-secondary` | `text-neutral-600` |
| `border-default` | `border-neutral-200` |
| `bg-accent-primary` | `bg-brand-primary` |

---

## 4. Typography

**Use semantic text utilities or Text component.**

| Use | For |
|-----|-----|
| `text-h1`, `text-h2`, `text-h3` | Headings |
| `text-body` | Body text |
| `text-label` | Labels, buttons |
| `text-small` | Small text |
| `<Text variant="body">` | Preferred for text |

---

## 5. Border Radius

**Use semantic radius tokens.**

| Use | Not |
|-----|-----|
| `rounded-button` | `rounded-md` |
| `rounded-card` | `rounded-lg` |
| `rounded-input` | `rounded-md` |
| `rounded-modal` | `rounded-xl` |

---

## 6. Recipes vs Layout Classes

**Critical distinction: Recipes handle styling, Layout classes handle positioning/sizing.**

### The Rule

**Recipes** = Component styling (design tokens, visual appearance)
- Colors (`bg-tertiary`, `text-primary`)
- Borders (`rounded-card`)
- Padding/spacing (`p-px`)
- Visual effects (`transition-opacity`)
- **Reusable** - same look everywhere

**Layout Classes** = Positioning/sizing (context-dependent)
- `h-full`, `w-full` - Fill parent dimensions
- `flex`, `grid` - Layout direction
- `mx-auto` - Centering
- `max-w-container` - Container width
- **Context-specific** - different sizes in different places

### Pattern

```svelte
<!-- ✅ CORRECT: Recipe + Layout classes together -->
<ScrollArea.Root class={[scrollAreaRootRecipe(), 'h-full']}>
  <!--                    ↑ Recipe (styling)    ↑ Layout (sizing) -->
  <ScrollArea.Viewport class={[scrollAreaViewportRecipe(), 'h-full', 'w-full']}>
    <!-- Content -->
  </ScrollArea.Viewport>
</ScrollArea.Root>

<!-- ✅ CORRECT: Different layout, same recipe -->
<ScrollArea.Root class={[scrollAreaRootRecipe()]} style="max-height: 70vh;">
  <!-- Dropdown: fixed height, not full height -->
</ScrollArea.Root>
```

### Why Both?

- **Recipes** ensure consistent styling (design tokens)
- **Layout classes** allow flexibility (different sizes per context)
- **Together** = Reusable components that adapt to context

### Rules

1. **Recipes NEVER include layout classes** (`h-full`, `w-full`, `flex`, `grid`)
   - Layout is context-dependent, recipes are reusable
   - Exception: Component-specific layout (e.g., `flex` for button groups) is OK

2. **Layout classes applied at usage sites**
   - Each usage decides sizing/positioning
   - Same recipe, different layouts

3. **Use array syntax for combining**
   ```svelte
   class={[recipe({ variant }), 'h-full', className]}
   ```

### Examples

```svelte
<!-- ✅ Full-page ScrollArea -->
<ScrollArea.Root class={[scrollAreaRootRecipe(), 'h-full']}>
  <!-- Full height for page scrolling -->
</ScrollArea.Root>

<!-- ✅ Dropdown ScrollArea -->
<ScrollArea.Root class={[scrollAreaRootRecipe()]} style="max-height: 70vh;">
  <!-- Fixed max height for dropdown -->
</ScrollArea.Root>

<!-- ✅ Button with layout -->
<Button variant="primary" class={[buttonRecipe({ variant: 'primary' }), 'w-full']}>
  <!-- Full-width button -->
</Button>
```

---

## 7. Compound Components Pattern

**IMPORTANT**: Compound components require **manual recipe application**. This is a Svelte limitation.

### The Pattern

```svelte
<script lang="ts">
  // 1. Import component
  import { ToggleGroup } from '$lib/components/atoms';
  
  // 2. Import recipes
  import { toggleGroupRootRecipe, toggleGroupItemRecipe } from '$lib/design-system/recipes';
</script>

<!-- 3. Apply recipes manually -->
<ToggleGroup.Root type="multiple" bind:value={selected} class={toggleGroupRootRecipe()}>
  <ToggleGroup.Item value="mon" class={toggleGroupItemRecipe()}>Mon</ToggleGroup.Item>
  <ToggleGroup.Item value="tue" class={toggleGroupItemRecipe()}>Tue</ToggleGroup.Item>
</ToggleGroup.Root>
```

### Why Manual?

- **Svelte limitation**: Module exports can't wrap components while maintaining compound API
- **Industry standard**: shadcn-svelte uses the same pattern
- **Maintains flexibility**: Can override styles with `class` prop

### Compound Components

| Component | Recipes Needed |
|-----------|---------------|
| ToggleGroup | `toggleGroupRootRecipe`, `toggleGroupItemRecipe` |
| ScrollArea | `scrollAreaRootRecipe`, `scrollAreaViewportRecipe`, `scrollAreaScrollbarRecipe`, `scrollAreaThumbRecipe` |
| Tabs | `tabsListRecipe`, `tabsTriggerRecipe`, `tabsContentRecipe` |
| Checkbox | `checkboxRootRecipe`, `checkboxBoxRecipe`, `checkboxIconRecipe` |
| RadioGroup | `radioGroupIndicatorRecipe`, `radioGroupDotRecipe` |

**Note**: Single components (Button, Text, FormInput) auto-apply recipes. Only compound components require manual application.

---

## 8. Exceptions (Allowed)

These are acceptable:
- `z-10`, `z-50` (layout layering)
- `rounded-full` (avatars, pills)
- Bits UI data attributes
- CSS variables for component colors: `var(--color-component-*)`

---

## Quick Reference

```
Sizing:     md = default
Spacing:    gap-section, mb-header, gap-form
Colors:     bg-surface, text-primary, border-default
Typography: text-body, text-label, Text component
Radius:     rounded-button, rounded-card
Recipes:    Component styling (design tokens)
Layout:     h-full, w-full, flex, grid (context-specific)
Compound:   Manual recipe application (ToggleGroup, ScrollArea, Tabs)
```

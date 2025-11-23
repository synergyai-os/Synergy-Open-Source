# Recipe System Patterns (CVA)

**Purpose**: Document CVA (Class Variance Authority) recipe system patterns, limitations, and best practices for component variant management.

**Status**: ACTIVE (Phase 1 POC completed - SYOS-514)

---

## Pattern: Component Variant Recipes

**Use Case**: Components with size/variant props (Button, Badge, Card, Input, etc.)

**✅ Recipe-Compatible Components** (CSS-based):
- Button, Input, Select, Checkbox, Radio, Toggle
- Card, Badge, Alert, Toast, Dialog, Modal
- Avatar (CSS-based circles, not SVG)
- Form components, Layout components

**❌ Recipe-Incompatible Components** (SVG-based):
- Loading (SVG spinner)
- Icon (SVG icons)

**Why incompatible**: CVA recipes return CSS class names. SVG elements ignore CSS `width`/`height` properties set via classes due to browser limitations. SVG requires explicit HTML attributes or inline `style` for sizing.

---

## Recipe Pattern (CSS Components)

### Recipe Definition

```typescript
// src/lib/design-system/recipes/button.recipe.ts
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonRecipe = cva('rounded font-semibold transition-colors', {
  variants: {
    variant: {
      solid: 'bg-accent-primary text-white hover:bg-accent-hover',
      outline: 'border-2 border-accent-primary text-accent-primary',
      ghost: 'text-accent-primary hover:bg-elevated'
    },
    size: {
      sm: 'px-button-x-sm py-button-y-sm text-small',
      md: 'px-button-x py-button-y text-button',
      lg: 'px-button-x-lg py-button-y-lg text-h4'
    }
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md'
  }
});

export type ButtonVariants = VariantProps<typeof buttonRecipe>;
```

### Component Usage

```svelte
<script lang="ts">
  import { buttonRecipe, type ButtonVariants } from '$lib/design-system/recipes';
  
  interface Props extends ButtonVariants {
    // Other props
  }
  
  let { variant = 'solid', size = 'md', ...props }: Props = $props();
  
  // ✅ CORRECT: Use $derived, no function call in template
  const classes = $derived(buttonRecipe({ variant, size }));
</script>

<!-- ✅ CORRECT: Use value directly -->
<button class={classes} {...props}>
  <slot />
</button>
```

---

## Common Pitfalls

### ❌ Pitfall #1: Calling Recipe Result as Function

**Wrong**:
```svelte
<script>
  const classes = $derived(buttonRecipe({ variant, size }));
</script>

<button class={classes()}> ← ERROR: classes is not a function
```

**Correct**:
```svelte
<script>
  const classes = $derived(buttonRecipe({ variant, size }));
</script>

<button class={classes}> ← CORRECT: Use value directly
```

**Why**: CVA recipe returns a string. `$derived` wraps it in reactivity. The result is a reactive value, not a function. Use directly in template.

---

### ❌ Pitfall #2: Using Recipes for SVG Components

**Wrong**:
```typescript
// button.recipe.ts
export const loadingRecipe = cva({
  variants: {
    size: {
      sm: 'icon-xs',  // CSS class
      md: 'icon-sm',
      lg: 'icon-md'
    }
  }
});

// Loading.svelte
<svg class={loadingRecipe({ size })}> ← Won't size correctly
```

**Correct** (Manual approach for SVG):
```svelte
<script>
  const sizeStyle = $derived(
    size === 'sm' ? 'width: var(--size-icon-sm); height: var(--size-icon-sm);'
    : size === 'lg' ? 'width: var(--size-icon-lg); height: var(--size-icon-lg);'
    : 'width: var(--size-icon-md); height: var(--size-icon-md);'
  );
</script>

<svg class="animate-spin text-accent-primary" style={sizeStyle}>
```

**Why**: Browsers ignore CSS `width`/`height` on SVG. SVG needs explicit dimensions via `style` attribute or HTML attributes.

---

### ❌ Pitfall #3: Using CSS Values in Recipes

**Wrong**:
```typescript
export const buttonRecipe = cva({
  variants: {
    size: {
      sm: '12px',  // ❌ CSS value, not class name
      md: '16px',
      lg: '20px'
    }
  }
});
```

**Correct**:
```typescript
export const buttonRecipe = cva({
  variants: {
    size: {
      sm: 'size-iconsm',  // ✅ CSS class name
      md: 'size-iconmd',
      lg: 'size-iconlg'
    }
  }
});
```

**Why**: CVA recipes must return CSS class names (strings), not CSS values. The validation script (`npm run recipes:validate`) catches this error.

---

## SVG Component Pattern (Manual Approach)

**Use Case**: Loading spinners, icons, SVG-based components

**Pattern**:

```svelte
<script lang="ts">
  /**
   * Loading Component
   *
   * Note: Uses manual style mapping for SVG sizing due to browser CSS limitations.
   * CVA recipe system doesn't work reliably for SVG elements.
   */
  interface Props {
    size?: 'sm' | 'md' | 'lg';
  }
  
  let { size = 'md' }: Props = $props();
  
  // Map size to CSS custom properties for SVG dimensions
  const sizeStyle = $derived(
    size === 'sm' ? 'width: var(--size-icon-sm); height: var(--size-icon-sm);'
    : size === 'lg' ? 'width: var(--size-icon-lg); height: var(--size-icon-lg);'
    : 'width: var(--size-icon-md); height: var(--size-icon-md);'
  );
</script>

<svg class="animate-spin text-accent-primary" style={sizeStyle}>
  <!-- SVG content -->
</svg>
```

**Why this works**:
- ✅ Uses design tokens via CSS custom properties
- ✅ ESLint clean (no hardcoded values)
- ✅ Browser gets explicit dimensions via `style` attribute
- ✅ Cross-browser compatible
- ✅ Industry standard (Chakra UI, Material UI use similar pattern)

---

## Validation

### Recipe Validation Script

**Purpose**: Validates recipe classes exist in design system utilities

**Usage**:
```bash
npm run recipes:validate
```

**What it checks**:
- Recipe classes exist as `@utility` definitions in CSS
- No CSS values (e.g., `'12px'`) used as class names
- No typos (e.g., `'icon-sm'` → suggests `'size-iconsm'`)

**Integration**:
- CI/CD pipeline (`npm run ci:quick`, `npm run ci:local`)
- Pre-commit hook (`.husky/pre-commit`)
- `/go` command (Step 5.4)

---

## Decision Matrix: Recipe vs Manual

| Component Type | Use Recipe? | Reason |
|---------------|-------------|--------|
| Button | ✅ Yes | CSS-based, variants work with classes |
| Badge | ✅ Yes | CSS-based, simple sizing |
| Card | ✅ Yes | CSS-based, layout variants |
| Input | ✅ Yes | CSS-based, form element |
| Loading (SVG) | ❌ No | SVG, needs explicit dimensions |
| Icon (SVG) | ❌ No | SVG, needs explicit dimensions |
| Avatar (CSS) | ✅ Yes | CSS-based circles (not SVG) |

**Rule of Thumb**:
- If component uses `<svg>` element → Manual approach
- If component uses CSS for sizing → Recipe system

---

## Related Patterns

- **Design Tokens** (`design-tokens.md`) - Token system recipes reference
- **Svelte Reactivity** (`svelte-reactivity.md`) - `$derived` usage with recipes
- **Component Architecture** (`ui-patterns.md`) - Component variant patterns

---

**Last Updated**: 2025-11-23  
**Status**: ACCEPTED (Phase 1 POC validated, SVG limitation documented)  
**Validation**: SYOS-514 (POC), Context7 (CVA best practices), Production testing


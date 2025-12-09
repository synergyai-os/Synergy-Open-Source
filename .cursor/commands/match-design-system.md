# match-design-system

Refactor components to design system compliance.

**Reference**: `dev-docs/master-docs/design-system.md` (complete documentation)

---

## Non-Negotiable Rules

### 1. Never Edit Generated CSS

```
src/styles/utilities/*.css  ← AUTO-GENERATED - NEVER EDIT
```

To add utility: `design-tokens-semantic.json` → `npm run tokens:build`

### 2. Use Recipe System

```typescript
// ✅ Recipe handles styling
const classes = $derived(buttonRecipe({ variant, size }));

// ❌ Manual class mapping
const classes = size === 'sm' ? 'px-2' : 'px-4';
```

### 3. Semantic Tokens Only

```svelte
<!-- ✅ Semantic tokens -->
<div class="bg-surface text-primary gap-button">

<!-- ❌ Hardcoded Tailwind -->
<div class="bg-gray-100 text-gray-900 gap-2">
```

### 4. Validate Before Completing

```bash
npm run validate:design-system  # MUST PASS
```

---

## Workflow

### 1. Determine Component Type

**Reference**: `dev-docs/master-docs/architecture.md` (Frontend Architecture section)

| Type | Location | Styling |
|------|----------|---------|
| Atom | `components/atoms/` | Has recipe |
| Molecule | `components/molecules/` | Uses atom recipes |
| Organism | `components/organisms/` | Composes atoms/molecules |
| Feature | `modules/[module]/components/` | Uses shared recipes |

### 2. Create/Update Recipe

**Location**: `src/lib/design-system/recipes/[component].recipe.ts`

```typescript
import { cva } from 'class-variance-authority';

export const componentRecipe = cva(
  // Base classes (semantic tokens only)
  'bg-surface text-primary rounded-button',
  {
    variants: {
      variant: {
        primary: 'bg-accent-primary text-inverse',
        secondary: 'bg-surface border border-default'
      },
      size: {
        sm: 'px-menu-item py-menu-item text-small',
        md: 'px-button-x py-button-y text-body',  // DEFAULT
        lg: 'px-button-x py-button-y text-body'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'  // Always 'md', never 'base'
    }
  }
);
```

Export from `recipes/index.ts`.

### 3. Update Component

```svelte
<script lang="ts">
  import { componentRecipe } from '$lib/design-system/recipes';
  
  let { variant = 'primary', size = 'md', class: className = '' } = $props();
  
  const classes = $derived([componentRecipe({ variant, size }), className]);
</script>

<div class={classes}>
  <slot />
</div>
```

**Key patterns:**
- Use `$derived` with array syntax for classes
- Props match recipe variants
- No styling in component, recipe handles it

### 4. Update Usage Sites

Replace hardcoded classes with props:

```svelte
<!-- Before -->
<Button class="bg-blue-500 px-4">Click</Button>

<!-- After -->
<Button variant="primary" size="md">Click</Button>
```

### 5. Validate

```bash
# During development
npm run validate:tokens [path/to/file]

# Before completing
npm run validate:design-system
npm run check
```

---

## Component Rules

### Atoms

- Single element
- Has its own recipe
- No internal atoms

### Molecules

- Compose 2-3 atoms
- Use `<Text>` component for labels
- Layout classes only (no recipes)

```svelte
<!-- Molecule uses Text atom for label -->
<label>
  <Text variant="body" size="sm" as="span">{label}</Text>
</label>
<Input {value} />
```

### Feature Components

- Use shared components (atoms/molecules/organisms)
- Can have feature-specific recipe for states (selected/unselected)
- Business logic allowed
- Never cross-module imports

---

## Size Variants Standard

**Always `sm`, `md`, `lg` with `md` as default.**

```typescript
variants: {
  size: {
    sm: '...',
    md: '...',  // DEFAULT
    lg: '...'
  }
},
defaultVariants: { size: 'md' }
```

Extended sizes (`xs`, `xl`) only when genuinely needed.

---

## Spacing Tokens Quick Reference

| Use | Token |
|-----|-------|
| Section gaps | `gap-section` |
| Header margins | `mb-header` |
| Form fields | `gap-form` |
| Tight groups | `gap-fieldGroup` |
| Button padding | `px-button`, `py-button` |
| Card padding | `card-padding` |

See `dev-docs/master-docs/design-system.md` section 9.2 for complete list.

---

## Compound Components

Manual recipe application required (Svelte limitation):

```svelte
<ToggleGroup.Root class={toggleGroupRootRecipe()}>
  <ToggleGroup.Item class={toggleGroupItemRecipe()}>Mon</ToggleGroup.Item>
</ToggleGroup.Root>
```

See design-system.md section 6.8 for full list.

---

## Validation Checklist

Before marking complete:

- [ ] `npm run validate:design-system` passes
- [ ] `npm run check` passes
- [ ] Recipe uses semantic tokens only
- [ ] Component uses `$derived([recipe(), className])`
- [ ] All usage sites updated
- [ ] No hardcoded Tailwind classes

---

## Edge Cases

### Missing Utility

1. Check if token exists in `design-tokens-semantic.json`
2. If yes but utility missing → Check `scripts/style-dictionary/transforms.js`
3. Add pattern if needed → `npm run tokens:build`
4. **Never manually edit CSS files**

### Hardcoded Value Required

1. Document in `ai-docs/tasks/missing-styles.md`
2. Add `// WORKAROUND: [reason]` comment
3. Create follow-up task to add proper token

---

## Key Principle

**Move: Hardcoded → Recipe → Design Token**

The cascade: `tokens.json` → `npm run tokens:build` → `utilities/*.css`

Never break this cascade by editing generated files.

---

## Full Documentation

For complete patterns, edge cases, and examples, see:
- `dev-docs/master-docs/design-system.md`
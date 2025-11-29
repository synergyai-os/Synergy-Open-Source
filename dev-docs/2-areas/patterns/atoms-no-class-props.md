# Atoms Should NOT Accept `class` Props

**Keywords**: atom, class prop, className, design system, pure components, self-contained, Icon, Text, Button, Card, Avatar, Heading

**Status**: 🟢 **REFERENCE** - Design System Rule

---

## Rule

**Atoms MUST NOT accept `class` props.**

Atoms are pure, self-contained components. All styling comes from design tokens via recipes, not custom classes.

---

## Why This Rule Exists

### Problems with `class` Props on Atoms

1. **Breaks Design System Consistency**
   - Custom classes override design tokens
   - Creates inconsistent styling across the app
   - Hard to maintain and update

2. **Hides Missing Variants**
   - Developers use `class` as workaround instead of proper variants
   - Prevents discovering needed design system features
   - Example: `<Text class="font-medium">` instead of `<Text weight="medium">`

3. **Makes Atoms Unpredictable**
   - Can't trust atom output without checking parent classes
   - Breaks encapsulation principle
   - Hard to reason about component behavior

4. **Validation Becomes Impossible**
   - Can't validate design system compliance
   - Custom classes bypass token system
   - Hard to catch violations

---

## Correct Patterns

### ✅ Use Props/Variants

```svelte
<!-- ✅ CORRECT: Use variant prop -->
<Text variant="body" size="sm" weight="medium">Hello</Text>

<!-- ✅ CORRECT: Use size prop -->
<Button variant="primary" size="md">Click</Button>

<!-- ✅ CORRECT: Use variant prop -->
<Card variant="elevated" padding="md">Content</Card>
```

### ✅ Wrap in Parent for Layout

```svelte
<!-- ✅ CORRECT: Layout in parent wrapper -->
<div class="w-full">
  <Button variant="primary">Click</Button>
</div>

<!-- ✅ CORRECT: Spacing in parent -->
<div class="flex flex-col gap-card">
  <Card variant="default">Card 1</Card>
  <Card variant="default">Card 2</Card>
</div>
```

### ✅ Add Variants When Needed

If atom needs new styling, **add a variant/prop** to the recipe:

```typescript
// ✅ CORRECT: Add weight prop to Text recipe
export const textRecipe = cva(
  'text-body',
  {
    variants: {
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold'
      }
    }
  }
);
```

---

## Anti-Patterns

### ❌ Custom Classes on Atoms

```svelte
<!-- ❌ WRONG: Custom class on atom -->
<Text variant="body" size="sm" class="font-medium">Hello</Text>

<!-- ❌ WRONG: Custom class on atom -->
<Button variant="primary" class="w-full">Click</Button>

<!-- ❌ WRONG: Custom class on atom -->
<Card variant="default" class={customClasses}>Content</Card>
```

### ❌ String Concatenation

```svelte
<!-- ❌ WRONG: Merging custom classes -->
const classes = $derived(
  textRecipe({ variant, size }) + (className ? ` ${className}` : '')
);
```

---

## Migration Strategy

### Step 1: Audit Current Usage

Find all atoms with `class` props:
```bash
grep -r "class\?:" src/lib/components/atoms
grep -r "<.*class=" src/lib --include="*.svelte" | grep -E "(Text|Button|Card|Avatar|Icon|Heading)"
```

### Step 2: Categorize Usage

1. **Font weights** → Add `weight` prop to Text/Heading
2. **Layout (w-full, flex)** → Move to parent wrapper
3. **Spacing (mt-*, mb-*)** → Move to parent wrapper
4. **Colors** → Add color variant to recipe
5. **Sizes** → Add size variant to recipe

### Step 3: Add Missing Variants

For each category, add proper variants to recipes:

```typescript
// Example: Add weight prop to Text
export const textRecipe = cva(
  'text-body',
  {
    variants: {
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold'
      }
    }
  }
);
```

### Step 4: Remove `class` Props

Remove `class?: string` from atom Props types:

```typescript
// ❌ BEFORE
type Props = {
  variant?: TextVariant;
  size?: TextSize;
  class?: string; // Remove this
};

// ✅ AFTER
type Props = {
  variant?: TextVariant;
  size?: TextSize;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'; // Add proper prop
};
```

### Step 5: Update Usages

```svelte
<!-- ❌ BEFORE -->
<Text variant="body" size="sm" class="font-medium">Hello</Text>

<!-- ✅ AFTER -->
<Text variant="body" size="sm" weight="medium">Hello</Text>
```

---

## Current Status

### Atoms with `class` Props (Status)

**✅ Completed Migrations:**
- `Icon.svelte` - Removed `class` prop, added `color` prop, `flex-shrink-0` in recipe base classes
- `Text.svelte` - Removed `class` prop, added `weight` prop

**⚠️ Pending Migrations (12 files):**
- `Button.svelte`
- `Card.svelte`
- `Avatar.svelte`
- `Heading.svelte`
- `FormInput.svelte`
- `FormTextarea.svelte`
- `Chip.svelte`
- `Badge.svelte`
- `Card/Root.svelte`
- `Card/Header.svelte`
- `Card/Content.svelte`
- `Card/Footer.svelte`

### Common Usage Patterns Found

1. **Font weights**: `class="font-medium"`, `class="font-semibold"`
2. **Layout**: `class="w-full"`, `class="flex-shrink-0"`
3. **Spacing**: `class="mt-fieldGroup"`, `class="mb-form-field-gap"`
4. **Colors**: `class="text-text-tertiary"`
5. **Recipe overrides**: `class={cardClasses}` (module components)

---

## Examples

### Example 1: Font Weight

```svelte
<!-- ❌ BEFORE -->
<Text variant="body" size="sm" class="font-medium">Hello</Text>

<!-- ✅ AFTER -->
<Text variant="body" size="sm" weight="medium">Hello</Text>
```

**Action**: Add `weight` prop to `Text` and `Heading` atoms.

### Example 2: Layout

```svelte
<!-- ❌ BEFORE -->
<Button variant="primary" class="w-full">Click</Button>

<!-- ✅ AFTER -->
<div class="w-full">
  <Button variant="primary">Click</Button>
</div>
```

**Action**: Move layout classes to parent wrapper.

### Example 3: Module Component Recipe

```svelte
<!-- ❌ BEFORE -->
<Card variant="default" padding="md" class={cardClasses}>Content</Card>

<!-- ✅ AFTER -->
<Card variant="default" padding="md">Content</Card>
<!-- Or use Card wrapper with recipe on wrapper div -->
<div class={cardClasses}>
  <Card variant="default" padding="md">Content</Card>
</div>
```

**Action**: Move module-specific recipe to wrapper div, not Card atom.

### Example 4: Icon Color and Layout

```svelte
<!-- ❌ BEFORE: Color class on Icon -->
<Icon type="info" size="md" class="text-text-tertiary" />

<!-- ✅ AFTER: Use color prop -->
<Icon type="info" size="md" color="tertiary" />
```

```svelte
<!-- ❌ BEFORE: Layout + color classes -->
<Icon type="clock" size="xl" class="text-text-tertiary mx-auto" />

<!-- ✅ AFTER: Wrap in div for layout, use color prop -->
<div class="mx-auto">
  <Icon type="clock" size="xl" color="tertiary" />
</div>
```

```svelte
<!-- ❌ BEFORE: flex-shrink-0 class -->
<Icon type="chevron-down" size="sm" class="flex-shrink-0 text-secondary" />

<!-- ✅ AFTER: flex-shrink-0 in recipe base classes, color prop -->
<Icon type="chevron-down" size="sm" color="secondary" />
```

**Action**: 
- Add `color` prop to Icon recipe (with variants: `default`, `primary`, `secondary`, `tertiary`, `error`, `warning`, `success`, `info`)
- Add `flex-shrink-0` to Icon recipe base classes (prevents icons from shrinking in flex containers)
- Wrap Icon in `div` for layout classes (`mx-auto`, `w-full`, etc.)

### Example 5: Icon Migration - Complete Audit Pattern

When migrating Icon atoms across codebase:

1. **Search for all Icon usages with `class` props:**
   ```bash
   grep -r "<Icon.*class=" src/lib src/routes
   ```

2. **Categorize by usage type:**
   - Color classes (`text-text-tertiary`, `text-secondary`, `text-brand`) → Use `color` prop
   - Layout classes (`mx-auto`, `flex-shrink-0`) → Wrap in `div` or add to recipe base
   - Combined (color + layout) → Wrap in `div` + use `color` prop

3. **Common patterns found:**
   - `class="text-text-tertiary"` → `color="tertiary"`
   - `class="text-secondary"` → `color="secondary"`
   - `class="text-brand"` → `color="primary"`
   - `class="text-success"` → `color="success"`
   - `class="mx-auto text-text-tertiary"` → `<div class="mx-auto"><Icon color="tertiary" />`
   - `class="flex-shrink-0"` → Already in recipe base classes

**Migration Result**: Fixed 17 Icon instances across 9 files, zero `class` props remaining on Icon atoms.

---

## Related Patterns

- **#L100**: Component Style Matching (Recipe System)
- **#L300**: Module Card Component Pattern
- Design System Architecture: Atoms are pure, Molecules/Organisms can have custom styling

---

**Last Updated**: 2025-01-27
**Status**: 🟢 Reference Pattern - Design System Rule

**Recent Updates**:
- 2025-01-27: Added Icon migration examples (Example 4-5), updated status to show Icon and Text migrations complete


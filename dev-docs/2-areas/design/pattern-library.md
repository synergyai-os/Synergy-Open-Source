# Pattern Library - Incorrect → Correct Examples

> **Purpose**: Self-service pattern library for agents and developers. Learn common mistakes and correct patterns before writing code.

**See Also**:
- [Design Tokens](design-tokens.md) - Complete token reference
- [Component Architecture](component-architecture.md) - How tokens → utilities → patterns → components work together
- [Design Principles](design-principles.md) - Visual philosophy and UX principles

---

## 🎯 How to Use This Library

1. **Before writing code**: Scan incorrect patterns → find your mistake → use correct pattern
2. **When ESLint blocks**: Check "Common Violations" section → find matching pattern → fix
3. **When adding components**: Check "Component Examples" section → copy correct pattern → adapt
4. **Quick lookup**: Use "Quick Reference" section → find token by component or property

**Format**: Each pattern shows ❌ **WRONG** (what not to do) and ✅ **CORRECT** (what to do)

---

## ❌ Incorrect → ✅ Correct Patterns

### 1. Hardcoded Spacing Values

**❌ WRONG - Hardcoded spacing (ESLint blocks these):**

```svelte
<!-- Hardcoded padding -->
<div class="px-2 py-1.5">Content</div>
<div class="p-[12px]">Content</div>
<div class="mt-[24px] mb-[16px]">Content</div>

<!-- Hardcoded gaps -->
<div class="flex gap-2">Items</div>
<div class="grid gap-[8px]">Items</div>
```

**✅ CORRECT - Semantic tokens:**

```svelte
<!-- Semantic padding tokens -->
<div class="px-nav-item py-nav-item">Content</div>
<div class="p-button-icon">Content</div>
<div class="mt-content-padding mb-marketing-text">Content</div>

<!-- Semantic gap tokens -->
<div class="flex gap-icon">Items</div>
<div class="grid gap-accordion">Items</div>
```

**Why**: Tokens adapt to light/dark mode, change globally, and are self-documenting.

---

### 2. Hardcoded Color Values

**❌ WRONG - Hardcoded colors (ESLint blocks these):**

```svelte
<!-- Hardcoded Tailwind colors -->
<div class="bg-gray-900 text-white">Dark card</div>
<div class="bg-gray-100 text-gray-800">Light card</div>
<div class="border-gray-300">Border</div>

<!-- Hardcoded hex colors -->
<div class="bg-[#3b82f6] text-[#ffffff]">Blue button</div>
```

**✅ CORRECT - Semantic color tokens:**

```svelte
<!-- Semantic color tokens (adapt to theme) -->
<div class="bg-sidebar text-sidebar-primary">Dark card</div>
<div class="bg-elevated text-primary">Light card</div>
<div class="border-base">Border</div>

<!-- Semantic accent colors -->
<div class="bg-accent-primary text-primary">Blue button</div>
```

**Why**: Semantic tokens automatically adapt to light/dark mode. Change once in `app.css`, updates everywhere.

---

### 3. Hardcoded Size Values

**❌ WRONG - Hardcoded sizes (ESLint blocks these):**

```svelte
<!-- Hardcoded dimensions -->
<button class="min-h-[2.75rem] w-[120px]">Button</button>
<span class="w-[44px] h-[44px]">Icon</span>
<div class="max-w-[512px]">Dialog</div>
```

**✅ CORRECT - Semantic size tokens:**

```svelte
<!-- Semantic size tokens -->
<button class="min-h-button w-auto">Button</button>
<span class="icon-xl">Icon</span>
<div class="max-w-dialog">Dialog</div>
```

**Why**: Consistent sizing across components, accessibility-compliant (44px minimum touch targets).

---

### 4. Hardcoded Typography Values

**❌ WRONG - Hardcoded font sizes:**

```svelte
<!-- Hardcoded text sizes -->
<h1 class="text-[36px] font-bold">Title</h1>
<p class="text-[14px]">Body text</p>
<span class="text-[10px]">Label</span>
```

**✅ CORRECT - Semantic typography tokens:**

```svelte
<!-- Semantic typography tokens -->
<h1 class="text-h1">Title</h1>
<p class="text-body">Body text</p>
<span class="text-label">Label</span>
```

**Why**: Consistent typography scale, easy to update globally, self-documenting hierarchy.

---

### 5. Duplicate Token Creation

**❌ WRONG - Creating new token when existing token exists:**

```svelte
<!-- Creating px-card-2 when px-card already exists -->
<div class="px-card-2 py-card">Card</div>
```

**✅ CORRECT - Reuse existing tokens:**

```svelte
<!-- Reuse existing token -->
<div class="px-card py-card">Card</div>
```

**Why**: Reduces token bloat, maintains consistency, easier maintenance.

**How to check**: Search `app.css` for existing tokens before creating new ones:

```bash
grep -r "spacing-card" src/app.css
```

---

### 6. Wrong Semantic Token Usage

**❌ WRONG - Using nav tokens for buttons:**

```svelte
<!-- Using nav-item tokens for button (wrong semantic meaning) -->
<button class="px-nav-item py-nav-item">Click me</button>
```

**✅ CORRECT - Use component-specific tokens:**

```svelte
<!-- Use button-specific tokens -->
<button class="px-button-x py-button-y">Click me</button>
```

**Why**: Semantic tokens communicate intent. Nav tokens are for navigation, button tokens are for buttons.

---

### 7. Missing Token (When to Add New Token)

**❌ WRONG - Hardcoding because token doesn't exist:**

```svelte
<!-- Hardcoding instead of adding token -->
<div class="px-[16px] py-[12px]">New component</div>
```

**✅ CORRECT - Add token systematically:**

**Step 1**: Add to `@theme` block in `app.css`:

```css
/* src/app.css */
@theme {
  --spacing-my-component-x: var(--spacing-4); /* 16px - references base scale */
  --spacing-my-component-y: var(--spacing-3); /* 12px - references base scale */
}
```

**Step 2**: Create utility class:

```css
@utility px-my-component {
  padding-inline: var(--spacing-my-component-x);
}

@utility py-my-component {
  padding-block: var(--spacing-my-component-y);
}
```

**Step 3**: Use in component:

```svelte
<div class="px-my-component py-my-component">New component</div>
```

**Step 4**: Document in `design-tokens.md`

**Why**: Systematic token creation ensures consistency and maintainability.

---

### 8. Inline Styles for Design Values

**❌ WRONG - Inline styles for spacing/colors:**

```svelte
<!-- Inline styles for design values -->
<div style="padding: 12px; background: #f3f4f6;">Content</div>
```

**✅ CORRECT - Use utility classes:**

```svelte
<!-- Use utility classes -->
<div class="p-button-icon bg-elevated">Content</div>
```

**Exception**: Inline styles are acceptable for:
- **Functional CSS** (behavior, not design): `word-break: break-word`, `overflow-wrap: anywhere`
- **Dynamic values** (from API/user): `background-color: {user.avatarColor}`
- **Calculated values** (state-driven): `transform: translateX({offset}px)`

**Why**: Utility classes are theme-aware, maintainable, and consistent.

---

### 9. Arbitrary Tailwind Values

**❌ WRONG - Using arbitrary Tailwind values:**

```svelte
<!-- Arbitrary values (ESLint blocks these) -->
<div class="w-[200px] h-[100px]">Box</div>
<div class="rounded-[8px]">Rounded</div>
<div class="shadow-[0_4px_6px_rgba(0,0,0,0.1)]">Shadow</div>
```

**✅ CORRECT - Use semantic tokens:**

```svelte
<!-- Semantic tokens -->
<div class="w-auto h-auto">Box</div>
<div class="rounded-card">Rounded</div>
<div class="shadow-card">Shadow</div>
```

**Why**: Arbitrary values bypass design system, break consistency, and fail ESLint.

---

### 10. Conditional Classes Without $derived

**❌ WRONG - Manual class concatenation:**

```svelte
<script>
  let isActive = $state(false);
  let classes = isActive ? 'bg-accent-primary' : 'bg-elevated';
</script>

<div class={classes}>Content</div>
```

**✅ CORRECT - Use $derived for reactive classes:**

```svelte
<script>
  let isActive = $state(false);
  const classes = $derived(
    isActive ? 'bg-accent-primary' : 'bg-elevated'
  );
</script>

<div class={classes}>Content</div>
```

**Why**: `$derived` ensures reactivity, updates automatically when state changes.

---

### 11. Component-Specific Hardcoded Values

**❌ WRONG - Hardcoded values in component:**

```svelte
<!-- Hardcoded component styles -->
<div class="rounded-lg p-4 shadow-md hover:shadow-lg">
  Card content
</div>
```

**✅ CORRECT - Use component tokens:**

```svelte
<!-- Component tokens -->
<div class="rounded-card px-card py-card shadow-card hover:shadow-card-hover">
  Card content
</div>
```

**Why**: Component tokens ensure consistency across all instances of the component.

---

### 12. Missing Icon Size Tokens

**❌ WRONG - Hardcoded icon sizes:**

```svelte
<!-- Hardcoded icon dimensions -->
<svg class="w-4 h-4">Icon</svg>
<svg class="w-5 h-5">Icon</svg>
<svg class="w-6 h-6">Icon</svg>
```

**✅ CORRECT - Use icon size tokens:**

```svelte
<!-- Semantic icon sizes -->
<svg class="icon-sm">Icon</svg>
<svg class="icon-md">Icon</svg>
<svg class="icon-lg">Icon</svg>
```

**Why**: Consistent icon sizing, easy to update globally, self-documenting.

---

## Component Examples

### Button Component

**❌ WRONG - Hardcoded button styles:**

```svelte
<button class="min-h-[2.75rem] px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold">
  Click me
</button>
```

**✅ CORRECT - Button with tokens:**

```svelte
<button class="min-h-button px-button-x py-button-y bg-accent-primary text-primary rounded-button text-button">
  Click me
</button>
```

**Icon-only button:**

```svelte
<!-- ❌ WRONG -->
<button class="w-[44px] h-[44px] p-2 rounded-md">
  <svg class="w-5 h-5">...</svg>
</button>

<!-- ✅ CORRECT -->
<button class="p-button-icon min-h-button rounded-button">
  <svg class="icon-md">...</svg>
</button>
```

**See**: [Button Tokens](design-tokens.md#button-component-tokens) for complete reference

---

### Card Component

**❌ WRONG - Hardcoded card styles:**

```svelte
<div class="rounded-lg p-5 bg-white shadow-md hover:shadow-lg border border-gray-200">
  Card content
</div>
```

**✅ CORRECT - Card with tokens:**

```svelte
<div class="rounded-card px-card py-card bg-elevated shadow-card hover:shadow-card-hover border border-base">
  Card content
</div>
```

**See**: [Card Tokens](design-tokens.md#card-component-tokens) for complete reference

---

### Badge Component

**❌ WRONG - Hardcoded badge styles:**

```svelte
<span class="px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">
  New
</span>
```

**✅ CORRECT - Badge with tokens:**

```svelte
<span class="px-badge py-badge text-badge bg-tag text-tag rounded-badge">
  New
</span>
```

**See**: [Badge Tokens](design-tokens.md#badge-component-tokens) for complete reference

---

### Chip Component

**❌ WRONG - Hardcoded chip styles:**

```svelte
<span class="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
  Filter
  <button class="w-4 h-4 p-0.5">×</button>
</span>
```

**✅ CORRECT - Chip with tokens:**

```svelte
<span class="inline-flex items-center gap-chip px-chip py-chip text-chip bg-tag/50 text-tag rounded-chip border border-base/50">
  Filter
  <button class="p-chip-close icon-xs">×</button>
</span>
```

**Key differences from Badge**:
- **Chip**: Larger padding (12px vs 6px), pill shape, interactive
- **Badge**: Compact padding (6px), square corners, static

**See**: [Chip Tokens](design-tokens.md#chip-component-tokens) for complete reference

---

### Dialog Component

**❌ WRONG - Hardcoded dialog styles:**

```svelte
<div class="max-w-[512px] rounded-lg p-6 bg-white shadow-xl border border-gray-200">
  Dialog content
</div>
```

**✅ CORRECT - Dialog with tokens:**

```svelte
<div class="max-w-dialog rounded-dialog p-modal bg-elevated shadow-card-hover border border-base">
  Dialog content
</div>
```

**Wide dialog:**

```svelte
<!-- ✅ CORRECT -->
<div class="max-w-dialog-wide rounded-dialog p-modal bg-elevated">
  Wide dialog content
</div>
```

**See**: [Dialog Tokens](design-tokens.md#dialog-component-tokens) for complete reference

---

### Accordion Component

**❌ WRONG - Hardcoded accordion styles:**

```svelte
<button class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 border-b border-gray-200">
  Trigger text
</button>
<div class="px-4 py-3">
  Content
</div>
```

**✅ CORRECT - Accordion with tokens:**

```svelte
<button class="w-full px-accordion py-accordion flex items-center justify-between hover:bg-hover-solid border-b border-base">
  Trigger text
</button>
<div class="px-accordion py-accordion gap-accordion flex flex-col">
  Content
</div>
```

**See**: [Accordion Tokens](design-tokens.md#accordion-component-tokens) for complete reference

---

### Tabs Component

**❌ WRONG - Hardcoded tab styles:**

```svelte
<div class="h-10 rounded-md p-1 bg-gray-100">
  <button class="px-3 py-1.5 rounded text-sm">Tab 1</button>
  <button class="px-3 py-1.5 rounded text-sm">Tab 2</button>
</div>
```

**✅ CORRECT - Tabs with tokens:**

```svelte
<div class="size-tab rounded-tab-container">
  <button class="px-tab py-tab rounded-tab-item">Tab 1</button>
  <button class="px-tab py-tab rounded-tab-item">Tab 2</button>
</div>
```

**See**: [Tabs Tokens](design-tokens.md#tabs-component-tokens) for complete reference

---

### FormField Component

**❌ WRONG - Hardcoded form field styles:**

```svelte
<label class="block text-sm font-medium text-gray-700 mb-1">
  Label
</label>
<input class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
<span class="text-xs text-red-600 mt-1">Error message</span>
```

**✅ CORRECT - FormField with tokens:**

```svelte
<label class="block text-small font-medium text-primary mb-1">
  Label
</label>
<input class="w-full px-input py-input border border-base rounded-input text-body" />
<span class="text-small text-error mt-1">Error message</span>
```

**Note**: FormField tokens may need to be added if not in `app.css`. Follow "Missing Token" pattern above.

---

## Common Mistakes

### 1. Hardcoded Values (ESLint Blocks)

**Symptom**: ESLint error: "Hardcoded Tailwind value detected"

**Common violations**:
- `px-[12px]`, `py-[8px]` → Use `px-button-x`, `py-button-y`
- `min-h-[2.75rem]` → Use `min-h-button`
- `w-[44px] h-[44px]` → Use `icon-xl`
- `bg-gray-900`, `text-white` → Use `bg-sidebar`, `text-sidebar-primary`
- `rounded-[8px]` → Use `rounded-card` or `rounded-button`

**Fix**: Replace with semantic token utility class. Check `design-tokens.md` for available tokens.

---

### 2. Duplicate Tokens

**Symptom**: Creating new token when existing token exists

**Example**:
- Creating `px-card-2` when `px-card` already exists
- Creating `spacing-button-padding` when `spacing-button-x` exists

**Fix**: Search `app.css` for existing tokens before creating new ones:

```bash
grep -r "spacing-card" src/app.css
grep -r "spacing-button" src/app.css
```

**Prevention**: Always check `design-tokens.md` first.

---

### 3. Wrong Semantic Token Usage

**Symptom**: Using nav tokens for buttons, button tokens for cards, etc.

**Example**:
- `px-nav-item` for button → Should use `px-button-x`
- `py-button-y` for card → Should use `py-card`

**Fix**: Use component-specific tokens. Check component examples above.

**Rule**: Tokens should match component context (nav → nav tokens, button → button tokens).

---

### 4. Missing Tokens (When to Add)

**Symptom**: Need token that doesn't exist

**Process**:
1. **Check if token exists**: Search `app.css` and `design-tokens.md`
2. **Check if similar token exists**: Can you reuse? (e.g., `px-card` for similar component)
3. **If truly new**: Follow "Missing Token" pattern above (add to `@theme` → create utility → document)

**Don't**: Hardcode values because token doesn't exist. Always add token systematically.

---

### 5. Inline Styles for Design Values

**Symptom**: Using `style="padding: 12px"` instead of utility classes

**Fix**: Use utility classes: `class="p-button-icon"`

**Exception**: Inline styles OK for:
- Functional CSS: `word-break: break-word`
- Dynamic values: `background-color: {user.color}`
- Calculated values: `transform: translateX({offset}px)`

---

### 6. Arbitrary Tailwind Values

**Symptom**: Using `w-[200px]`, `rounded-[8px]`, `shadow-[...]`

**Fix**: Use semantic tokens: `w-auto`, `rounded-card`, `shadow-card`

**Why**: Arbitrary values bypass design system and fail ESLint.

---

## Quick Reference Guide

### Token Lookup by Component

| Component | Padding X | Padding Y | Border Radius | Shadow | Size |
|-----------|-----------|-----------|---------------|--------|------|
| **Button** | `px-button-x` | `py-button-y` | `rounded-button` | - | `min-h-button` |
| **Card** | `px-card` | `py-card` | `rounded-card` | `shadow-card` | - |
| **Badge** | `px-badge` | `py-badge` | `rounded-badge` | - | - |
| **Chip** | `px-chip` | `py-chip` | `rounded-chip` | - | - |
| **Dialog** | `p-modal` | `p-modal` | `rounded-dialog` | `shadow-card-hover` | `max-w-dialog` |
| **Accordion** | `px-accordion` | `py-accordion` | - | - | - |
| **Tabs** | `px-tab` | `py-tab` | `rounded-tab-item` | - | `size-tab` |

### Token Lookup by Property

| Property | Common Tokens | Usage |
|----------|---------------|-------|
| **Spacing** | `px-nav-item`, `py-nav-item`, `px-button-x`, `py-button-y`, `px-card`, `py-card` | Component padding |
| **Colors** | `bg-sidebar`, `bg-elevated`, `bg-accent-primary`, `text-primary`, `text-secondary`, `border-base` | Theme-aware colors |
| **Sizes** | `min-h-button`, `icon-sm`, `icon-md`, `icon-lg`, `icon-xl`, `max-w-dialog` | Component dimensions |
| **Typography** | `text-h1`, `text-h2`, `text-body`, `text-small`, `text-label` | Font sizes |
| **Borders** | `rounded-button`, `rounded-card`, `rounded-badge`, `rounded-chip`, `border-base` | Border radius and colors |
| **Shadows** | `shadow-card`, `shadow-card-hover` | Card shadows |

### Common Patterns Cheat Sheet

```svelte
<!-- Button -->
<button class="min-h-button px-button-x py-button-y bg-accent-primary text-primary rounded-button text-button">
  Click me
</button>

<!-- Card -->
<div class="rounded-card px-card py-card bg-elevated shadow-card hover:shadow-card-hover border border-base">
  Content
</div>

<!-- Badge -->
<span class="px-badge py-badge text-badge bg-tag text-tag rounded-badge">
  New
</span>

<!-- Chip (removable) -->
<span class="inline-flex items-center gap-chip px-chip py-chip text-chip bg-tag/50 text-tag rounded-chip">
  Filter
  <button class="p-chip-close icon-xs">×</button>
</span>

<!-- Dialog -->
<div class="max-w-dialog rounded-dialog p-modal bg-elevated shadow-card-hover border border-base">
  Dialog content
</div>

<!-- Icon -->
<svg class="icon-md">...</svg>
```

---

## Related Documentation

- **[Design Tokens](design-tokens.md)** - Complete token reference with all available tokens
- **[Component Architecture](component-architecture.md)** - How tokens → utilities → patterns → components work together
- **[Design Principles](design-principles.md)** - Visual philosophy and UX principles
- **[Coding Standards](../development/coding-standards.md)** - Critical rules for AI agents

---

**Last Updated**: 2025-11-21  
**Pattern Count**: 12 incorrect→correct patterns + 8 component examples  
**Purpose**: Self-service pattern library to reduce duplicate violations


# Design System Migration Guide

> **Purpose**: Step-by-step instructions for migrating existing code to use design tokens and atomic components.

---

## 🎯 Overview

**Migration Goals**:

1. Replace hardcoded values with design tokens
2. Replace raw HTML with atomic components
3. Migrate to atomic design structure (atoms/molecules/organisms)
4. Validate cascade (token changes propagate automatically)

**Timeline**: Incremental migration, module by module.

---

## 🔍 Step 1: Find Violations

### Run Audit Script

```bash
# Find hardcoded Tailwind values
npm run audit:design-system

# Or manually search
grep -r "\[.*\]" src/ --include="*.svelte" | grep -E "(px-|py-|bg-|text-|w-|h-)"
```

### Common Violations

**Hardcoded spacing**:

```svelte
<!-- ❌ WRONG -->
<div class="px-4 py-2 gap-2">
```

**Hardcoded colors**:

```svelte
<!-- ❌ WRONG -->
<div class="bg-gray-900 text-white">
```

**Hardcoded typography**:

```svelte
<!-- ❌ WRONG -->
<h1 class="text-[36px] font-bold">
```

**Raw HTML**:

```svelte
<!-- ❌ WRONG -->
<button class="px-4 py-2 rounded-md">Click</button>
```

---

## 🔧 Step 2: Migrate Module by Module

### Example: Meetings Module

**Before** (12 violations):

```svelte
<!-- MeetingCard.svelte -->
<div class="px-4 py-3 rounded-lg bg-gray-900 border border-gray-800">
	<h2 class="text-xl font-bold text-white">Meeting Title</h2>
	<button class="px-3 py-1.5 rounded-md bg-blue-600 text-white">
		Start
	</button>
</div>
```

**After** (using tokens and components):

```svelte
<!-- MeetingCard.svelte -->
<Card variant="default" class="px-card py-card">
	<Heading level={2} class="text-h2">Meeting Title</Heading>
	<Button variant="primary" onclick={handleStart}>
		Start
	</Button>
</Card>
```

**Migration steps**:

1. **Replace hardcoded spacing**:
   ```diff
   - class="px-4 py-3"
   + class="px-card py-card"
   ```

2. **Replace hardcoded colors**:
   ```diff
   - class="bg-gray-900 border border-gray-800"
   + class="bg-elevated border border-base"
   ```

3. **Replace raw HTML with components**:
   ```diff
   - <button class="px-3 py-1.5 rounded-md bg-blue-600 text-white">
   + <Button variant="primary">
   ```

4. **Replace hardcoded typography**:
   ```diff
   - <h2 class="text-xl font-bold text-white">
   + <Heading level={2} class="text-h2">
   ```

---

## 📋 Step 3: Token Migration Patterns

### Spacing Tokens

**Find and replace patterns**:

| Old (Hardcoded) | New (Token) | Notes |
|----------------|-------------|-------|
| `px-2` | `px-nav-item` | Navigation items |
| `px-4` | `px-card` | Cards |
| `px-3 py-1.5` | `px-button-x py-button-y` | Buttons |
| `gap-2` | `gap-icon` | Icon spacing |
| `p-4` | `p-card` | Card padding |

**Process**:

1. Search for hardcoded value: `grep -r "px-4" src/lib/modules/meetings/`
2. Check if token exists: `grep -r "px-card" src/app.css`
3. Replace: `px-4` → `px-card`
4. Test: Verify visual appearance unchanged

### Color Tokens

**Find and replace patterns**:

| Old (Hardcoded) | New (Token) | Notes |
|----------------|-------------|-------|
| `bg-gray-900` | `bg-base` | Base background |
| `bg-gray-800` | `bg-surface` | Surface background |
| `bg-white` | `bg-elevated` | Elevated surfaces |
| `text-white` | `text-primary` | Primary text |
| `text-gray-600` | `text-secondary` | Secondary text |
| `border-gray-800` | `border-base` | Base borders |

**Process**:

1. Search for hardcoded color: `grep -r "bg-gray-900" src/lib/modules/meetings/`
2. Check token: `grep -r "bg-base" src/app.css`
3. Replace: `bg-gray-900` → `bg-base`
4. Test: Verify light/dark mode works correctly

### Typography Tokens

**Find and replace patterns**:

| Old (Hardcoded) | New (Token) | Notes |
|----------------|-------------|-------|
| `text-[36px] font-bold` | `text-h1` | H1 headings |
| `text-[28px] font-semibold` | `text-h2` | H2 headings |
| `text-[20px] font-semibold` | `text-h3` | H3 headings |
| `text-sm` | `text-body` | Body text |
| `text-[10px]` | `text-label` | Labels |

**Process**:

1. Search for hardcoded typography: `grep -r "text-\[" src/lib/modules/meetings/`
2. Check token: `grep -r "text-h1" src/app.css`
3. Replace: `text-[36px] font-bold` → `text-h1`
4. Test: Verify font sizes unchanged

---

## 🧩 Step 4: Component Migration

### Replace Raw HTML with Atomic Components

**Button migration**:

```diff
- <button class="px-4 py-2 rounded-md bg-blue-600 text-white" onclick={handleClick}>
- 	Click me
- </button>
+ <Button variant="primary" onclick={handleClick}>
+ 	Click me
+ </Button>
```

**Card migration**:

```diff
- <div class="px-4 py-3 rounded-lg bg-gray-900 border border-gray-800">
+ <Card variant="default" class="px-card py-card">
```

**Heading migration**:

```diff
- <h1 class="text-[36px] font-bold text-white">Title</h1>
+ <Heading level={1} class="text-h1">Title</Heading>
```

**Badge migration**:

```diff
- <span class="px-2 py-1 rounded bg-gray-700 text-gray-300 text-sm">New</span>
+ <Badge variant="default">New</Badge>
```

### Import Pattern

**Old** (from `ui/`):

```typescript
import { Button, Card } from '$lib/components/ui';
```

**New** (from `atoms/`):

```typescript
import { Button, Card } from '$lib/components/atoms';
```

**Both work** (backward compatible during transition).

---

## ✅ Step 5: Validate Cascade

### Test Token Cascade

**Goal**: Verify that changing a token in `app.css` automatically updates components.

**Process**:

1. **Document current token value**:
   ```css
   /* src/app.css */
   --spacing-button-x: 1.5rem; /* 24px */
   ```

2. **Change token to test value**:
   ```css
   --spacing-button-x: 3rem; /* 48px - noticeable change */
   ```

3. **Start dev server**:
   ```bash
   npm run dev
   ```

4. **Navigate to test page** (e.g., `/meetings`)

5. **Inspect element** (DevTools):
   - Verify token value applied: `padding-inline: var(--spacing-button-x)`
   - Visual check: Button should be wider

6. **Rollback token change**:
   ```css
   --spacing-button-x: 1.5rem; /* Restore original */
   ```

**Expected result**: Button width changes automatically without code changes ✅

**If cascade doesn't work**:

- Check if component uses token (not hardcoded value)
- Check if utility class exists: `grep -r "px-button-x" src/app.css`
- Verify component imports utility class

---

## 🔄 Step 6: Rollback Procedure

### If Migration Breaks Something

**Step 1: Revert changes**:

```bash
git checkout src/lib/modules/meetings/
```

**Step 2: Identify issue**:

- Check build errors: `npm run build`
- Check lint errors: `npm run lint`
- Check visual regressions: Compare before/after screenshots

**Step 3: Fix incrementally**:

- Migrate one component at a time
- Test after each change
- Commit working changes before continuing

---

## 📊 Migration Checklist

**Before starting**:

- [ ] Run audit script: `npm run audit:design-system`
- [ ] Identify module to migrate (start with smallest)
- [ ] Document current state (screenshots if needed)

**During migration**:

- [ ] Replace hardcoded spacing with tokens
- [ ] Replace hardcoded colors with tokens
- [ ] Replace hardcoded typography with tokens
- [ ] Replace raw HTML with atomic components
- [ ] Update imports (use `atoms/` instead of `ui/`)
- [ ] Test visual appearance (unchanged)
- [ ] Test light/dark mode (colors adapt)
- [ ] Run build: `npm run build`
- [ ] Run lint: `npm run lint`

**After migration**:

- [ ] Validate cascade (change token → verify update)
- [ ] Test functionality (no regressions)
- [ ] Commit changes
- [ ] Update migration tracker (if exists)

---

## 🎯 Module-by-Module Migration

### Recommended Order

1. **Core module** (200+ violations) - Largest impact
2. **Meetings module** (115 violations) - High visibility
3. **Inbox module** (80 violations) - Frequently used
4. **Flashcards module** (23 violations) - Smallest, quick win

### Per-Module Process

**1. Audit**:

```bash
# Find violations in module
grep -r "\[.*\]" src/lib/modules/meetings/ --include="*.svelte" | grep -E "(px-|py-|bg-|text-)"
```

**2. Categorize**:

- Hardcoded spacing → Token migration
- Hardcoded colors → Token migration
- Raw HTML → Component migration

**3. Migrate**:

- Start with one component
- Test after each change
- Commit working changes

**4. Validate**:

- Visual check (unchanged)
- Cascade test (token change → component update)
- Build/lint check

---

## 📝 Examples

### Example 1: Button Migration

**Before**:

```svelte
<button
	class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
	onclick={handleClick}
>
	Click me
</button>
```

**After**:

```svelte
<Button variant="primary" onclick={handleClick}>
	Click me
</Button>
```

**Benefits**:

- ✅ Design tokens applied automatically
- ✅ Light/dark mode support built-in
- ✅ Accessibility handled (Bits UI)
- ✅ Type-safe props

### Example 2: Card Migration

**Before**:

```svelte
<div class="px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 shadow-md">
	<h2 class="text-xl font-bold text-white">Title</h2>
	<p class="text-gray-300">Content</p>
</div>
```

**After**:

```svelte
<Card variant="default" class="px-card py-card">
	<Heading level={2} class="text-h2">Title</Heading>
	<Text class="text-secondary">Content</Text>
</Card>
```

**Benefits**:

- ✅ Consistent styling (design tokens)
- ✅ Semantic components (Heading, Text)
- ✅ Easy to update (change Card, updates everywhere)

### Example 3: Form Migration

**Before**:

```svelte
<div class="flex flex-col gap-2">
	<label class="text-sm font-medium text-gray-700">Name</label>
	<input
		class="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900"
		type="text"
		bind:value={name}
	/>
</div>
```

**After**:

```svelte
<FormInput label="Name" type="text" bind:value={name} />
```

**Benefits**:

- ✅ Single component (Label + Input + Error handling)
- ✅ Design tokens applied automatically
- ✅ Accessibility built-in (label association)
- ✅ Consistent styling

---

## 🔗 Related

- [Quick Start Guide](quick-start.md) - Getting started with design system
- [Design Tokens](design-tokens.md) - Complete token reference
- [Component Architecture](component-architecture.md) - Component structure
- [Deprecation Policy](deprecation-policy.md) - Token/component deprecation process

---

## 🆘 Troubleshooting

### Issue: Token not found

**Error**: `px-my-token` not found

**Solution**:

1. Check if token exists: `grep -r "px-my-token" src/app.css`
2. If missing: Add token to `src/app.css` @theme block
3. Create utility class: `@utility px-my-token { padding-inline: var(--spacing-my-token); }`
4. Document in `design-tokens.md`

### Issue: Component not found

**Error**: `Cannot find module '$lib/components/atoms'`

**Solution**:

1. Check if component exists: `ls src/lib/components/ui/Button.svelte`
2. Check if exported: `grep -r "Button" src/lib/components/atoms/index.ts`
3. If missing: Add export to barrel file

### Issue: Cascade doesn't work

**Problem**: Changing token doesn't update component

**Solution**:

1. Check if component uses token (not hardcoded): `grep -r "px-button-x" src/lib/components/ui/Button.svelte`
2. Check if utility class exists: `grep -r "@utility px-button-x" src/app.css`
3. Verify component imports utility class
4. Check for CSS specificity issues (inline styles override)

---

**Last Updated**: November 2025  
**Status**: 🟢 Active  
**Owner**: Design System Team


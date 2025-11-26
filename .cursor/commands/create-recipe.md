# Create Recipe Command

**Purpose**: Create type-safe CVA recipe for CSS-based components with automated validation.

**When to use**: User requests "create recipe for [component]" or needs variant system.

**Critical**: This command includes mandatory validation checks discovered during badge recipe debugging (SYOS-540).

---

## 🚨 STEP 0: Decision Tree (CSS vs SVG)

**BEFORE creating recipe, determine component type:**

```
Q: Is this component CSS-based or SVG-based?

CSS-Based Component (Button, Badge, Card, Input, Avatar)
  ✅ USE THIS COMMAND (create recipe)
  ✅ Recipe System is PRIMARY pattern
  ✅ Type-safe, AI-friendly, scalable

SVG-Based Component (Loading, Icon, OrgChart, D3 visualizations)
  ❌ DO NOT USE THIS COMMAND
  ❌ Recipes don't work for SVG (browser limitations)
  ✅ Use manual approach with SYOS-522 exception comment
```

**If SVG component → STOP HERE**, use manual token approach instead.

**Reference**: `dev-docs/master-docs/design-system.md#4.4` (When to Use Recipe System)

---

## STEP 1: Verify Required Tokens Exist

**🚨 CRITICAL**: Before writing recipe, check if ALL required tokens exist in design system.

### 1.1 Read Existing Recipes for Patterns

```bash
# Check button recipe for established patterns
cat src/lib/design-system/recipes/button.recipe.ts
```

**What to look for**:

- ✅ **NO opacity modifiers** (`/10`, `/20`, `/50` on custom utilities)
- ✅ **Tailwind built-in opacity** (`opacity-50`, `opacity-disabled`) OK
- ✅ **Solid background tokens** (`bg-accent-primary`, `bg-error`, `bg-success`)

### 1.2 Check design-system.json for Missing Tokens

**Example: Creating badge recipe with `warning` variant**

```bash
# Check if warning background token exists
grep -A 5 '"warning"' design-system.json
```

**Expected**:

```json
"warning": {
  "text": { "$value": "..." },  // ✅ Exists
  "bg": { "$value": "..." }      // ✅ Must exist for bg-warning utility
}
```

**If token MISSING**:

1. ❌ **DO NOT create recipe with workarounds**
2. ✅ **Add missing token to design-system.json first**
3. ✅ **Run `npm run tokens:build`**
4. ✅ **Then create recipe**

### 1.3 Verify Utilities Exist After Token Build

```bash
# Check if utility was generated
grep "^@utility bg-warning" src/app.css
```

**If utility NOT found** → Token missing or Style Dictionary config broken.

---

## STEP 2: Create Recipe File

**Location**: `src/lib/design-system/recipes/[component].recipe.ts`

**Template** (from `ai-docs/reference/recipe-template.md`):

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * [Component] Recipe (CVA)
 *
 * Type-safe variant system for [Component] component.
 * Uses design tokens for all styling (no hardcoded values).
 *
 * Variants: [list variants]
 * Sizes: [list sizes]
 */
export const [component]Recipe = cva(
	// Base classes - applied to all variants
	'[base-classes]',
	{
		variants: {
			variant: {
				default: '[token-based-classes]',
				primary: '[token-based-classes]',
				// ... more variants
			},
			size: {
				sm: '[token-based-classes]',
				md: '[token-based-classes]',
				lg: '[token-based-classes]'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'md'
		}
	}
);

export type [Component]VariantProps = VariantProps<typeof [component]Recipe>;
```

### 2.1 Recipe Rules (MANDATORY)

**✅ ALLOWED**:

- Token-based utilities: `bg-accent-primary`, `px-button-x`, `text-small`
- Tailwind built-in opacity: `opacity-50`, `opacity-disabled` (Tailwind classes)
- Tailwind modifiers: `hover:`, `disabled:`, `focus:`, `dark:`

**❌ FORBIDDEN**:

- Hardcoded values: `'12px'`, `'1rem'`, `'#3b82f6'`
- Arbitrary Tailwind: `w-[32px]`, `bg-[#fff]`, `text-[10px]`
- **Opacity modifiers on custom utilities**: `bg-accent-primary/10` ❌ (unreliable in Tailwind CSS 4)
- CSS values as class names: `size: { sm: '12px' }`

### 2.2 Opacity Pattern (CRITICAL)

**❌ WRONG** (discovered in badge recipe validation):

```typescript
variant: {
  primary: 'bg-accent-primary/10',  // ❌ Opacity modifier on custom utility
  warning: 'bg-accent-primary/10'   // ❌ Same background for different variants
}
```

**✅ CORRECT** (button recipe pattern):

```typescript
variant: {
  primary: 'bg-accent-primary text-primary disabled:opacity-disabled',
  secondary: 'bg-elevated text-secondary disabled:opacity-disabled'
}
```

**Rule**: Use Tailwind's built-in `opacity-*` utilities, NOT opacity modifiers on custom utilities.

---

## STEP 3: Export Recipe from Barrel File

**File**: `src/lib/design-system/recipes/index.ts`

```typescript
export { [component]Recipe, type [Component]VariantProps } from './[component].recipe';
```

---

## STEP 4: Validate Recipe (MANDATORY)

### 4.1 Recipe Validation Script

```bash
npm run recipes:validate
```

**What it checks**:

- ✅ All class names exist in design system utilities (`src/app.css`)
- ✅ No CSS values used as class names
- ✅ No typos (suggests correct class names)

**Expected output**:

```
✓ All recipes validated successfully
```

**If validation FAILS**:

1. Read error message (e.g., "Class 'bg-warning' not found")
2. Check if token exists in `design-system.json`
3. Run `npm run tokens:build`
4. Re-validate

### 4.2 Manual Validation Checklist

**Before proceeding, verify**:

- [ ] **NO opacity modifiers on custom utilities** (`bg-accent-primary/10`)
- [ ] **All background tokens exist** (`bg-warning`, `bg-error`, `bg-success`)
- [ ] **Variants are visually distinct** (warning ≠ primary)
- [ ] **Follows button recipe pattern** (use it as reference)
- [ ] **No hardcoded values** (no `'12px'`, `'1rem'`, `'#fff'`)
- [ ] **`npm run recipes:validate` passes** ✅

---

## STEP 5: Update Component to Use Recipe

**Pattern** (from `ai-docs/reference/recipe-template.md`):

```svelte
<script lang="ts">
	import { [component]Recipe } from '$lib/design-system/recipes';
	import type { [Component]VariantProps } from '$lib/design-system/recipes/[component].recipe';

	type Props = [Component]VariantProps & {
		// ... component-specific props
	};

	let { variant = 'default', size = 'md', ...rest }: Props = $props();

	// ✅ CORRECT: Use $derived with recipe (NOT a function call)
	const classes = $derived([component]Recipe({ variant, size }));
</script>

<div class={classes}>
	<slot />
</div>
```

**Common Svelte 5 mistake**:

```svelte
<!-- ❌ WRONG: Calling as function -->
<div class={classes()}>

<!-- ✅ CORRECT: Using value directly -->
<div class={classes}>
```

---

## STEP 6: Create Storybook Stories

**File**: `src/lib/components/atoms/[Component].stories.svelte`

```svelte
<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import [Component] from './[Component].svelte';

	const { Story } = defineMeta({
		component: [Component],
		title: 'Design System/Atoms/[Component]',
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'primary', 'secondary', ...]
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg']
			}
		}
	});
</script>

<Story name="Default" args={{ variant: 'default', size: 'md' }}>
	{#snippet template(args)}
		<[Component] variant={args.variant} size={args.size}>
			Content
		</[Component]>
	{/snippet}
</Story>

<!-- Add story for each variant -->
```

---

## STEP 7: Validate in Storybook

```bash
npm run storybook
```

**Visual checks**:

- [ ] All variants render correctly
- [ ] All sizes render correctly
- [ ] No console errors
- [ ] Variants are visually distinct (e.g., warning ≠ primary)

---

## STEP 8: Final Validation

### 8.1 Automated Validation

```bash
# Full validation suite
npm run recipes:validate  # Recipe classes exist
npm run lint              # ESLint + Prettier
npm run check             # TypeScript
```

**All checks MUST pass** before committing.

### 8.2 Cascade Test (Manual)

**Verify token cascade works**:

1. Open `design-system.json`
2. Change a token value used in recipe (e.g., `spacing.badge.x`)
3. Run `npm run tokens:build`
4. Open Storybook → Check if component updated
5. **Expected**: Component styling updates automatically ✅

**If cascade FAILS** → Recipe is using hardcoded values (investigate).

---

## Common Mistakes (CRITICAL - Learn from Badge Recipe)

### ❌ Mistake #1: Opacity Modifiers on Custom Utilities

**Agent wrote**:

```typescript
variant: {
  primary: 'bg-accent-primary/10'  // ❌ REJECTED
}
```

**Why wrong**: Opacity modifiers (`/10`, `/20`) unreliable with custom `@utility` definitions in Tailwind CSS 4.

**Correct**:

```typescript
variant: {
  primary: 'bg-accent-primary text-primary disabled:opacity-disabled'  // ✅ APPROVED
}
```

### ❌ Mistake #2: Missing Background Token

**Agent wrote**:

```typescript
variant: {
  warning: 'bg-accent-primary/10 text-warning'  // ❌ Used primary bg for warning
}
```

**Why wrong**: No `bg-warning` token exists, agent used workaround.

**Correct**:

1. Add `color.warning.bg` to `design-system.json`
2. Run `npm run tokens:build`
3. Use generated `bg-warning` utility

### ❌ Mistake #3: Identical Variants

**Agent wrote**:

```typescript
variant: {
  primary: 'bg-accent-primary/10',  // ❌ Same background
  warning: 'bg-accent-primary/10'   // ❌ Same background
}
```

**Why wrong**: Variants MUST be visually distinct.

**Correct**:

```typescript
variant: {
  primary: 'bg-accent-primary text-primary',
  warning: 'bg-warning text-warning'
}
```

---

## Reference Documentation

**Must-read before creating recipe**:

- **Recipe Patterns**: `dev-docs/2-areas/patterns/recipe-system.md` ⭐ (complete patterns, SVG exception, decision matrix, critical rules)
- **Recipe Template**: `ai-docs/reference/recipe-template.md` (complete example)
- **Master Doc**: `dev-docs/master-docs/design-system.md#4` (Recipe System section with critical rules)
- **Working Example**: `ai-docs/reference/cva-svelte-example/` (Button component)
- **Button Recipe**: `src/lib/design-system/recipes/button.recipe.ts` (production reference)

**Related Commands**:

- `/go` - Implementation workflow (includes recipe validation)
- `/design-manager` - Design system guidance (use before creating)

---

## Output Format

**After completing all steps, respond with**:

```markdown
## ✅ Recipe Created: [Component]

**File**: `src/lib/design-system/recipes/[component].recipe.ts`

**Variants**: [list]
**Sizes**: [list]

**Validation**:

- ✅ `npm run recipes:validate` - PASSED
- ✅ `npm run lint` - PASSED
- ✅ Visual check in Storybook - PASSED
- ✅ Cascade test - PASSED

**Next Steps**:

1. Component updated to use recipe
2. Storybook stories created
3. Ready for Linear ticket update
```

---

**Last Updated**: 2025-11-24  
**Critical Checks Added**: Opacity modifiers, missing tokens, visual distinction  
**Reference Issue**: Badge recipe validation (SYOS-540)

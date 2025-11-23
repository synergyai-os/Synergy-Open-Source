# SynergyOS Design System

**Purpose**: Single source of truth for design system architecture, vision, and implementation patterns.

**Audience**: Human developers + AI agents

**Status**: Living document - Updated as system evolves

**Last Updated**: 2025-11-23

---

## 📖 Table of Contents

1. [Vision & Principles](#1-vision--principles)
2. [Architecture Overview](#2-architecture-overview)
3. [Token System](#3-token-system)
4. [Recipe System (CSS Components)](#4-recipe-system-css-components)
5. [Component Architecture](#5-component-architecture)
6. [Enforcement & Validation](#6-enforcement--validation)
7. [Accessibility (WCAG 2.1 AA)](#7-accessibility-wcag-21-aa)
8. [Dark Mode](#8-dark-mode)
9. [Storybook Organization](#9-storybook-organization)
10. [Migration Paths](#10-migration-paths)
11. [Common Mistakes (AI Agents)](#11-common-mistakes-ai-agents)
12. [Related Documentation](#12-related-documentation)

---

## 1. Vision & Principles

### 1.1 Design Philosophy

**SynergyOS is built on four core principles:**

1. **Privacy First**: Design decisions prioritize user privacy and data ownership
2. **Outcomes Over Outputs**: Focus on user outcomes, not feature count
3. **Token-Driven Architecture**: Single source of truth for all design decisions
4. **AI-Friendly Patterns**: Design system optimized for AI agent collaboration

### 1.2 Architectural Goals

Our design system is architected to achieve:

#### **Cascade Behavior** ⭐ **MOST IMPORTANT**

> "Change a design token once → All UI updates automatically"

**Example**:
```
Change --spacing-button-x from 1.5rem to 2rem
  ↓
px-button-x utility updates automatically
  ↓
All Button components update automatically
  ↓
All pages using Button update automatically
```

**This is non-negotiable**. If changing a token requires manual updates, the cascade is broken.

#### **Type Safety**

> "Recipe System prevents invalid component variants"

**Example**:
```typescript
// ✅ TypeScript autocomplete suggests valid variants
<Button variant="primary" size="md" />

// ❌ TypeScript error: "invalid" is not a valid variant
<Button variant="invalid" size="md" />
```

#### **Scalability**

> "50+ AI 'vibe coders' can contribute without breaking system"

**Requirements**:
- Type-safe patterns (Recipe System, TypeScript)
- Automated validation (ESLint, recipes:validate, tokens:validate)
- Clear guidelines (this document + cursor rules)
- Learning system (iterative template training)

#### **Maintainability**

> "Single source of truth for all design decisions"

**Implementation**:
- `design-system.json` (DTCG format) - All token values
- `design-system.md` (this doc) - All architecture decisions
- Recipe files - All component variant logic

---

## 2. Architecture Overview

### 2.1 Five-Layer Cascade System

```
Layer 1: Base Tokens (design-system.json)
  ↓ (references)
Layer 2: Semantic Tokens (reference base)
  ↓ (generates)
Layer 3: Utilities (@utility classes)
  ↓ (uses)
Layer 4: Components (Atoms/Molecules/Organisms)
  ↓ (composes)
Layer 5: Pages (Compose components)
```

**Key Principle**: Changes cascade automatically through layers.

### 2.2 Cascade Test (Use This to Validate)

**Before claiming "design system compliance," run this test**:

```markdown
## Cascade Test

**Test 1: Change Token Value**
1. Open `design-system.json`
2. Change `spacing.button.x` from `{spacing.6}` to `{spacing.8}`
3. Run `npm run tokens:build`
4. Navigate to `/meetings`
5. **Expected**: All buttons wider (no code changes needed) ✅

**Test 2: Change Brand Color**
1. Open `design-system.json`
2. Change `color.brand.primary` from `{color.palette.blue.600}` to `{color.palette.orange.500}`
3. Run `npm run tokens:build`
4. Navigate to any page
5. **Expected**: All accent colors orange (light + dark mode) ✅
```

**If cascade test FAILS** → System is broken, fix before proceeding.

### 2.3 Current State & Roadmap

#### **✅ COMPLETE**
- ✅ Spacing tokens (Base scale → Semantic tokens → Utilities)
- ✅ Typography tokens (Font sizes, line heights, letter spacing)
- ✅ Font tokens (Base fonts → Semantic fonts)
- ✅ Size tokens (Icon, button, sidebar dimensions)
- ✅ Breakpoint tokens (Responsive design)
- ✅ Opacity tokens (Semantic opacity values)
- ✅ Recipe System POC (Button.svelte - SYOS-514)
- ✅ 3-layer enforcement system (Cursor rule + ESLint + Pre-commit)

#### **🚧 IN PROGRESS**
- 🚧 Visual regression testing (Chromatic setup - enables safe recipe rollout)
- 🚧 Token usage tracking system (unblocks color migration - SYOS-524)
- 🚧 Recipe System rollout (Badge, Card - SYOS-515-516)
- 🚧 Color System migration (Hardcoded OKLCH → Palette architecture - SYOS-524)
- 🚧 Documentation updates (Post-recipe + color migration - SYOS-498-501)

#### **📋 PLANNED**
- 📋 Recipe templates (AI agent consistency)
- 📋 AI Agent Governance Playbook (SYOS-529)
- 📋 Component audit & migration (HIGH/LOW priority components - SYOS-521-523)
- 📋 Accessibility validation automation (`npm run test:a11y`)
- 📋 Lighthouse CI (performance monitoring - optional)

---

## 3. Token System

### 3.1 Token Philosophy

**Token = Single source of truth for a design decision**

**Example**:
```
Decision: "Button horizontal padding should be 24px"
Token: spacing.button.x = {spacing.6} (references base scale)
Usage: px-button-x utility class
Result: All buttons use 24px padding, update in ONE place
```

### 3.2 Token Categories (14 Total)

| Category | Base Layer | Semantic Layer | Example |
|----------|------------|----------------|---------|
| **Spacing** | 4px unit scale (1-80) | button-x, icon, card-padding | `--spacing-button-x: var(--spacing-6)` |
| **Colors** | OKLCH palette | Brand → Semantic (accent, bg, text) | `--color-accent-primary: var(--color-brand-primary)` |
| **Typography** | Font sizes (xs-4xl) | Semantic (h1, body, label) | `--font-size-h1: var(--font-size-4xl)` |
| **Fonts** | Base fonts (sans, mono, serif) | Semantic (heading, body, code) | `--fonts-heading: var(--fonts-sans)` |
| **Sizes** | Dimensions (icon, button, sidebar) | Semantic (icon-sm/md/lg) | `--size-icon-sm: 1rem` |
| **Border Radius** | px values (sm-2xl) | Semantic (button, card, input) | `--border-radius-button: var(--border-radius-md)` |
| **Shadow** | Elevation values (sm-2xl) | Semantic (card, dialog) | `--shadow-card: var(--shadow-lg)` |
| **Opacity** | 0-100 scale | Semantic (disabled, hover, backdrop) | `--opacity-disabled: var(--opacity-50)` |
| **Breakpoints** | px values (sm-2xl) | Responsive utilities (md:, lg:) | `--breakpoint-md: 768px` |
| **Transition** | Duration + easing | Semantic (colors, transform) | `--transition-colors: 150ms ease` |
| **Z-Index** | Layering scale (0-9999) | Semantic (dropdown, modal, toast) | `--z-index-modal: 1000` |

**Total**: 255+ tokens across 14 categories

**Reference**: `design-tokens.md` for complete token catalog

### 3.3 Token Naming Convention

**Pattern**: `[category]-[context]-[variant?]`

**Examples**:
```css
/* ✅ CORRECT: Semantic, clear usage */
--spacing-button-x         /* Button horizontal padding */
--spacing-card-padding-x   /* Card horizontal padding */
--color-accent-primary     /* Primary accent color */
--size-icon-sm            /* Small icon size */

/* ❌ WRONG: Base tokens used directly (not semantic) */
--spacing-6               /* Base token (use semantic instead) */
--font-sans              /* Base font (use font-heading/font-body) */
--color-blue-600         /* Palette token (use semantic color.accent.primary) */
```

**Rule**: Components ALWAYS use semantic tokens, NEVER base tokens directly.

### 3.4 Color System Architecture ⭐ **CRITICAL**

**Current Issue**: Colors are hardcoded OKLCH values in semantic tokens, violating cascade principle.

**Example of BROKEN architecture**:
```json
{
  "color": {
    "accent": {
      "primary": { "$value": "oklch(55.4% 0.218 251.813)" }  // ❌ Hardcoded
    }
  }
}
```

**Problem**: Changing brand color requires manually updating 50+ tokens.

---

**Target Architecture**: **3-Layer Color Cascade** (Palette → Brand → Semantic)

```
Layer 1: Palette (base OKLCH values organized by color family)
  "color.palette.blue.600" = "oklch(55.4% 0.218 251.813)"
  "color.palette.orange.500" = "oklch(65% 0.15 60)"
  
Layer 2: Brand (references palette, enables easy brand color switching)
  "color.brand.primary" = "{color.palette.blue.600}"
  "color.brand.primaryHover" = "{color.palette.blue.700}"
  
Layer 3: Semantic (references brand, provides context-specific usage)
  "color.accent.primary" = "{color.brand.primary}"
  "color.bg.selected" = "{color.brand.primary}"
```

**Benefits**:
- ✅ Change brand color ONCE (color.brand.primary) → 50+ semantic tokens update automatically
- ✅ Scalable theming (light/dark mode, custom themes)
- ✅ Consistent with spacing/typography architecture (base → semantic)
- ✅ DTCG compliant (industry-standard token structure)

**Status**: SYOS-524 in progress (5 phases: Validation → Palette → Brand → Semantic → Cascade Test)

**Reference**: `color-system-architecture.md`

### 3.5 Token Governance Rules

#### **Rule 1: NO Hardcoded Values in Components**

```svelte
<!-- ❌ WRONG: Hardcoded values (even if they match token values) -->
<div style="padding: 1.5rem">  <!-- Cascade broken -->
<svg width="32px" height="32px">  <!-- Cascade broken -->
const spacing = '24px';  <!-- Cascade broken -->

<!-- ✅ CORRECT: Token references -->
<div class="px-button-x py-button-y">  <!-- Uses var(--spacing-button-x) -->
<svg class="w-icon-md h-icon-md">  <!-- Uses var(--size-icon-md) -->
<div style="width: var(--size-icon-sm)">  <!-- Direct token reference -->
```

#### **Rule 2: Semantic Tokens MUST Reference Base Tokens**

```json
{
  "spacing": {
    "button": {
      "x": {
        "$value": "{spacing.6}",  // ✅ References base scale
        "$description": "Button horizontal padding"
      }
    }
  }
}
```

**Validation**: Run `npm run tokens:validate-semantic` to check references.

#### **Rule 3: Base Tokens = Single OKLCH/px/rem Value**

```json
{
  "spacing": {
    "6": {
      "$value": "1.5rem",  // ✅ Single value (base scale)
      "$type": "dimension"
    }
  }
}
```

#### **Rule 4: Components Use Utility Classes (NOT Direct CSS Properties)**

```svelte
<!-- ✅ CORRECT: Utility classes -->
<button class="px-button-x py-button-y rounded-button bg-accent-primary">

<!-- ❌ WRONG: Direct CSS properties (even with CSS variables) -->
<button style="padding-inline: var(--spacing-button-x); background: var(--color-accent-primary);">
```

**Why**: Utility classes are validated by `recipes:validate`, CSS properties are not.

---

## 4. Recipe System (CSS Components) ⭐ **PRIMARY PATTERN**

### 4.1 What is Recipe System?

**Recipe System** = Type-safe, CVA-based variant system for CSS components.

**CVA (Class Variance Authority)**: A utility for creating component variant systems with TypeScript support.

**Core Concept**:
```typescript
// Recipe defines ALL variants and their utility classes
export const buttonRecipe = cva('base-classes', {
  variants: {
    variant: { primary: 'bg-accent-primary', secondary: 'bg-elevated', outline: 'border-base' },
    size: { sm: 'px-nav-item py-nav-item', md: 'px-button-x py-button-y', lg: 'px-button-x-lg' }
  }
});

// Component uses recipe (no manual token mapping)
const classes = $derived(buttonRecipe({ variant, size }));
```

**Result**: TypeScript autocomplete, type safety, no hardcoded values, AI-friendly.

### 4.2 Why Recipe System?

**Problem**: Manual token mapping fails with AI agents.

**Example of manual mapping (REJECTED)**:
```svelte
<script lang="ts">
  // ❌ AI agents consistently get this wrong
  const classes = $derived(
    size === 'sm' ? 'h-button-sm px-button-x-sm' :
    size === 'md' ? 'h-button-md px-button-x' :
    'h-button-lg px-button-x-lg'
  );
</script>
```

**Issues**:
- ❌ AI maps wrong tokens (e.g., `md` → `icon-xl` instead of `button-md`)
- ❌ No type safety (can pass invalid size values)
- ❌ No autocomplete (must remember valid options)
- ❌ Requires domain knowledge AI doesn't have
- ❌ Not scalable (50 AI agents = 50 different mappings)

**Solution**: Recipe System (APPROVED):
```svelte
<script lang="ts">
  import { buttonRecipe } from '$lib/design-system/recipes';
  
  // ✅ Type-safe, foolproof, AI-friendly
  const classes = $derived(buttonRecipe({ variant, size }));
</script>
```

**Benefits**:
- ✅ Type safety (TypeScript autocomplete for variants)
- ✅ Single source of truth (recipe file defines ALL mappings)
- ✅ AI-friendly (no manual mapping needed)
- ✅ Scalable (50 AI agents use same recipe)
- ✅ Validated (`recipes:validate` checks all classes exist)

### 4.3 Recipe System Pattern

**File Structure**:
```
src/lib/design-system/recipes/
  ├── button.recipe.ts       // Button variants
  ├── badge.recipe.ts        // Badge variants (in progress)
  ├── card.recipe.ts         // Card variants (planned)
  └── index.ts               // Barrel export
```

**Recipe File Pattern**:
```typescript
// src/lib/design-system/recipes/button.recipe.ts
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button Recipe (CVA)
 * 
 * Type-safe variant system for Button component.
 * Uses design tokens for all styling (no hardcoded values).
 * 
 * Variants: primary, secondary, outline
 * Sizes: sm, md, lg
 */
export const buttonRecipe = cva(
  // Base classes - applied to all buttons
  'font-body inline-flex items-center justify-center rounded-button transition-colors-token',
  {
    variants: {
      variant: {
        primary: 'bg-accent-primary text-primary hover:bg-accent-hover disabled:opacity-disabled',
        secondary: 'bg-elevated border border-base text-primary hover:border-accent-primary disabled:opacity-disabled',
        outline: 'border border-base text-primary hover:bg-hover-solid disabled:opacity-disabled'
      },
      size: {
        sm: 'px-nav-item py-nav-item gap-icon text-small',
        md: 'px-button-x py-button-y gap-icon text-button',
        lg: 'px-button-x py-button-y gap-icon text-body'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonRecipe>;
```

**Component Usage**:
```svelte
<script lang="ts">
  import { buttonRecipe } from '$lib/design-system/recipes';
  import type { ButtonVariant, ButtonSize } from '$lib/components/types';
  
  type Props = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: Snippet;
  };
  
  let { variant = 'primary', size = 'md', children }: Props = $props();
  
  // ✅ Use $derived (NOT a function call)
  const classes = $derived(buttonRecipe({ variant, size }));
</script>

<button class={classes}>
  {@render children()}
</button>
```

**Critical**: `$derived(buttonRecipe(...))` NOT `$derived(buttonRecipe()())` (common Svelte 5 mistake).

### 4.4 When to Use Recipe System

**Decision Tree**:

```
Q: Is this a CSS-based component (Button, Card, Badge, Input, etc.)?
→ YES: ✅ USE RECIPE SYSTEM
   - Create recipe in src/lib/design-system/recipes/
   - Component uses recipe (no manual mapping)
   - Validate with `npm run recipes:validate`

Q: Is this an SVG-based component (Loading, Icon, OrgChart, D3 viz)?
→ YES: ❌ DON'T USE RECIPE SYSTEM (SVG Exception)
   - CSS sizing unreliable for SVG in some browsers
   - Use explicit HTML attributes or inline styles
   - Document exception with SYOS-522 comment
```

**Examples**:
- ✅ Button → Recipe System (CSS component)
- ✅ Badge → Recipe System (CSS component)
- ✅ Card → Recipe System (CSS component)
- ❌ Loading spinner → SVG Exception (SVG component)
- ❌ Icon → SVG Exception (SVG component)
- ❌ OrgChart → SVG Exception (SVG/D3 visualization)

### 4.5 SVG Component Exception

**Why SVG needs exception**: Browsers often ignore CSS `width`/`height` on SVG elements, requiring explicit HTML attributes.

**Pattern**:
```svelte
<script lang="ts">
  /**
   * DESIGN SYSTEM EXCEPTION: SVG/D3 Visualization (SYOS-522)
   * 
   * This component uses SVG with hardcoded pixel dimensions because:
   * 1. CSS-based sizing (recipes/utility classes) unreliable for SVG in some browsers
   * 2. Requires explicit HTML width/height attributes
   * 3. Token mapping via JavaScript computed styles (where dynamic needed)
   * 
   * Approved exception - see dev-docs/master-docs/design-system.md
   */
  
  type Props = {
    size?: 'sm' | 'md' | 'lg';
  };
  
  let { size = 'md' }: Props = $props();
</script>

<svg width="{size === 'sm' ? '12px' : '16px'}" height="{size === 'sm' ? '12px' : '16px'}">
  <!-- SVG content -->
</svg>
```

**Requirements**:
1. ✅ Exception comment at top of `<script>` block
2. ✅ Reference SYOS-522 in comment
3. ✅ Explain WHY exception is needed
4. ✅ Reference this document

**Reference**: `recipe-system.md`

### 4.6 Recipe Validation

**Command**: `npm run recipes:validate`

**What it checks**:
- ✅ All class names in recipes exist in design system utilities
- ✅ No typos or invalid class names
- ✅ Suggests correct class names if mismatch found

**Example**:
```bash
npm run recipes:validate

# ✓ All recipes validated successfully
# OR
# ✗ Line 17: Class 'icon-sm' not found
# → Did you mean: 'size-iconsm'?
```

**When to run**:
- After creating new recipe
- After modifying recipe variants
- Before committing code (pre-commit hook)
- During CI/CD pipeline

---

## 5. Component Architecture

### 5.1 Atomic Design Layers

**SynergyOS follows atomic design methodology** (standardized with Storybook):

```
Atoms (Single elements)
  ↓
Molecules (2-3 atoms composed)
  ↓
Organisms (Complex sections)
  ↓
Templates (Page layouts)
  ↓
Pages (Actual routes)
```

### 5.2 Component Types & Locations

#### **Atoms** (`src/lib/components/atoms/`)

**Definition**: Single interactive element with variants

**Characteristics**:
- Wraps Bits UI primitive + design tokens
- Has variants (primary/secondary, sm/md/lg)
- Used by multiple modules
- No business logic

**Examples**:
- `Button.svelte` - Primary/secondary/outline variants, sm/md/lg sizes
- `Badge.svelte` - Status badges (success, warning, error)
- `Card.svelte` - Container with variants (default, elevated, outlined)
- `Input.svelte` - Form input with validation states

**Pattern**:
```svelte
<script lang="ts">
  import { Button as BitsButton } from 'bits-ui';
  import { buttonRecipe } from '$lib/design-system/recipes';
  
  type Props = {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
  };
  
  let { variant = 'primary', size = 'md' }: Props = $props();
  
  const classes = $derived(buttonRecipe({ variant, size }));
</script>

<BitsButton.Root class={classes}>
  <slot />
</BitsButton.Root>
```

#### **Molecules** (`src/lib/components/molecules/`)

**Definition**: Composition of 2-3 atoms

**Characteristics**:
- Combines atoms (e.g., Label + Input + Error)
- Reusable across modules
- Minimal business logic

**Examples**:
- `FormField.svelte` - Label + Input + Error message
- `SearchBar.svelte` - Input + Search icon
- `MetadataBar.svelte` - Composition of tags and timestamps

#### **Organisms** (`src/lib/components/organisms/`)

**Definition**: Complex section with multiple molecules/atoms

**Characteristics**:
- Complex interaction patterns
- May have internal state
- Reusable across modules

**Examples**:
- `Dialog.svelte` - Complex overlay with header, body, footer
- `Accordion.svelte` - Expandable sections with state management
- `Header.svelte` - App header with navigation, search, user menu

#### **Feature Components** (`src/lib/modules/[module]/components/`)

**Definition**: Module-specific components with business logic

**Characteristics**:
- Used by ONLY ONE module
- Contains business logic
- May connect to Convex backend

**Examples**:
- `MeetingCard.svelte` - Meetings module only
- `InboxCard.svelte` - Inbox module only
- `ActionItemsList.svelte` - Meetings module only

### 5.3 Component Classification Decision Tree

**Use this to decide where a component belongs**:

```
Q: Is component used by multiple modules?
├─ YES: Shared component (src/lib/components/)
│   └─ Q: How complex is the component?
│       ├─ Single element: Atom
│       ├─ 2-3 atoms composed: Molecule
│       └─ Complex section: Organism
│
└─ NO: Feature component (src/lib/modules/[module]/components/)
```

**Examples**:

```
TagSelector component:
Q: Used by multiple modules? YES (Flashcards, Inbox, Notes)
Q: How complex? Single select element
A: Atom (src/lib/components/atoms/TagSelector.svelte)

FormField component:
Q: Used by multiple modules? YES (Settings, Meetings, Auth)
Q: How complex? Composed (Label + Input + Error)
A: Molecule (src/lib/components/molecules/FormField.svelte)

MeetingCard component:
Q: Used by multiple modules? NO (Meetings only)
A: Feature component (src/lib/modules/meetings/components/MeetingCard.svelte)
```

### 5.4 Component Boundaries (Module System)

**Rule**: Feature components MUST NOT cross module boundaries.

```typescript
// ❌ WRONG: Cross-module import (creates dependency)
// In Flashcards module:
import { InboxCard } from '$lib/modules/inbox/components';

// ✅ CORRECT: Import from shared components
import { Card } from '$lib/components/atoms';

// ✅ CORRECT: Feature component within own module
import { FlashcardComponent } from './FlashcardComponent.svelte';
```

**Why**: Cross-module dependencies create tight coupling, preventing modularity.

**Reference**: `dev-docs/2-areas/architecture/modularity-refactoring-analysis.md`

---

## 6. Enforcement & Validation

### 6.1 Three-Layer Enforcement System

**Design System enforcement uses 3 layers** (prevents hardcoded values at every stage):

#### **Layer 1: Cursor Rule** (Design-time guidance)

**File**: `.cursor/rules/design-tokens-enforcement.mdc`

**When**: Auto-loads for EVERY `.svelte` file opened in Cursor

**What it does**:
- Provides real-time guidance (examples, patterns, anti-patterns)
- Shows "Recipe System for CSS, SVG Exception for SVG" decision tree
- Emphasizes "Matching ≠ Using" (hardcoded `'1rem'` ≠ using `w-icon-sm`)
- References this master document

**Example guidance**:
```
CSS Component (Button) → Use Recipe System
SVG Component (Loading) → Document exception (SYOS-522)
```

#### **Layer 2: Immediate ESLint** (Implementation-time validation)

**When**: RIGHT after writing code (Step 8 in `/go` command)

**What it does**:
- Catches hardcoded values during implementation (BEFORE user reviews)
- Validates token usage, no arbitrary Tailwind values
- Blocks hardcoded pixel/rem/hex values

**Command**: `npx eslint [file]`

**Example**:
```bash
npx eslint src/lib/components/atoms/Button.svelte

# ✗ Line 12: Hardcoded pixel value '32px' detected
#   → Use design token utility: w-icon-md
```

**CRITICAL**: AI agents CANNOT see red squiggles in real-time. They MUST run ESLint explicitly.

#### **Layer 3: Pre-commit Hook** (Commit-time safety net)

**File**: `.husky/pre-commit`

**When**: Before every commit

**What it does**:
- Blocks commits with design token violations
- Runs full validation suite (lint, recipes:validate, tokens:validate)
- Final safety net (catches what Layers 1-2 missed)

**Commands run**:
```bash
npm run lint                    # ESLint + Prettier
npm run recipes:validate        # Recipe classes exist
npm run tokens:validate        # Semantic tokens reference base
```

### 6.2 Validation Commands

**Complete validation suite**:

```bash
# Recipe validation (checks recipe classes exist in design system)
npm run recipes:validate

# Token build (generates CSS from design-system.json)
npm run tokens:build

# Semantic token validation (checks references)
npm run tokens:validate-semantic

# Combined validation (semantic + build validation)
npm run tokens:validate

# Full linting (ESLint + Prettier - blocks commits)
npm run lint

# Full CI pipeline (matches GitHub Actions exactly)
npm run ci:local
```

**Run order** (for manual validation):
1. `npm run recipes:validate` - Validate recipes first
2. `npm run tokens:build` - Build tokens
3. `npm run tokens:validate` - Validate semantic references
4. `npm run lint` - Lint all code

### 6.3 ESLint Rules

**Active ESLint rules for design system**:

1. **`synergyos/no-hardcoded-design-values`** - Blocks hardcoded pixel/rem/hex values
2. **`@limegrass/better-tailwindcss/no-arbitrary-value`** - Blocks arbitrary Tailwind (`w-[32px]`)
3. **`svelte/no-unused-svelte-ignore`** - Prevents ESLint disables without reason

**Example violations**:
```svelte
<!-- ❌ Violation: Hardcoded pixel value -->
<div style="width: 32px">

<!-- ❌ Violation: Arbitrary Tailwind value -->
<div class="w-[32px]">

<!-- ❌ Violation: Hardcoded color -->
<div class="bg-[#3b82f6]">
```

**Reference**: `eslint-rules/no-hardcoded-design-values.js`

### 6.4 Visual Regression Testing (Chromatic)

**Purpose**: Automate cascade testing - verify token changes don't break UI.

**Why Chromatic**:
- Automates manual cascade test (Section 2.2)
- Snapshots every commit → Blocks PRs with visual regressions
- Scales to 1000+ stories with zero additional effort
- CI gate prevents AI agents from merging broken UI

**How it works**:
1. **Every PR**: Chromatic takes snapshots of all Storybook stories
2. **Visual diff**: Compares snapshots to baseline
3. **Review workflow**: UI review interface for accepting/rejecting changes
4. **CI integration**: GitHub Actions blocks merge if regressions found

**Setup** (Open-source tier - $0/month):

**✅ Phase 1: Installation Complete** (SYOS-534)
- ✅ Chromatic Storybook addon installed (`@chromatic-com/storybook@^4.1.3`)
- ✅ Chromatic CLI installed (`chromatic@^13.3.4`)
- ✅ Addon configured in `.storybook/main.ts` (line 34)
- ✅ Storybook starts without errors (addon appears in addon panel)

**Next Steps** (Future tickets):
```bash
# Create Chromatic project (open-source tier)
# Visit chromatic.com → Sign in with GitHub → Create project

# Add GitHub Actions workflow
# .github/workflows/chromatic.yml (provided by Chromatic)

# Configure chromatic.config.json (after project creation)
```

**Configuration** (`chromatic.config.json`):
```json
{
  "$schema": "https://www.chromatic.com/config-file.schema.json",
  "projectId": "Project:...",
  "onlyChanged": true,
  "zip": true
}
```

**Build command** (TurboSnap - only test changed stories):
```json
{
  "scripts": {
    "build-storybook": "build-storybook --stats-json"
  }
}
```

**When to run**:
- Every PR (GitHub Actions)
- After token changes (verify cascade)
- Before recipe rollout (baseline existing stories)

**Validation workflow**:
1. Change token value in `design-system.json`
2. Run `npm run tokens:build`
3. Push to PR → Chromatic runs automatically
4. Review visual diffs in Chromatic UI
5. Accept changes if expected, reject if regression

**Cost**: $149/month after open-source tier (5000 snapshots/month free)

**ROI**: Prevents 8-16 hours manual testing/month = 1073% monthly return

**Reference**: [Chromatic Storybook Docs](https://www.chromatic.com/docs/storybook)

---

## 7. Accessibility (WCAG 2.1 AA)

### 7.1 Accessibility Requirements

**SynergyOS targets WCAG 2.1 AA compliance** (minimum standard for production apps).

#### **Color Contrast**

- **Text**: 4.5:1 minimum (normal text)
- **Large Text** (18pt+): 3:1 minimum
- **Interactive Elements**: 3:1 minimum (buttons, links, form controls)

**Validation**: Use browser DevTools (Chrome Lighthouse, Firefox Accessibility Inspector)

#### **Focus States**

- **Visible Focus Indicator**: 2px outline minimum
- **Focus Order**: Matches visual order
- **No Keyboard Traps**: All interactive elements reachable via keyboard

**Example**:
```css
/* ✅ CORRECT: 2px visible outline */
button:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

#### **ARIA Labels**

- **Icon-Only Buttons**: MUST have `aria-label` or `aria-labelledby`
- **Decorative Images**: MUST have `alt=""` (empty string)
- **Form Inputs**: MUST have associated `<label>` or `aria-label`

**Example**:
```svelte
<!-- ✅ CORRECT: Icon-only button with aria-label -->
<Button iconOnly ariaLabel="Close dialog">
  <Icon name="close" />
</Button>

<!-- ❌ WRONG: Icon-only button without aria-label -->
<Button iconOnly>
  <Icon name="close" />
</Button>
```

#### **Semantic HTML**

- **No `<div>` buttons**: Use `<button>` for interactive elements
- **Heading Hierarchy**: `<h1>` → `<h2>` → `<h3>` (no skips)
- **Landmark Regions**: `<header>`, `<nav>`, `<main>`, `<footer>`

#### **Keyboard Navigation**

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons
- **Arrow Keys**: Navigate within composite widgets (dialogs, dropdowns)
- **Escape**: Close modals, dismiss dropdowns

### 7.2 Accessibility Validation

**Manual Testing**:
1. **Keyboard-Only Navigation**: Unplug mouse, navigate with Tab/Enter/Space/Arrows
2. **Screen Reader**: Test with VoiceOver (macOS), NVDA (Windows), JAWS (Windows)
3. **Color Contrast**: Chrome DevTools → Lighthouse → Accessibility audit

**Automated Testing** (future):
- `npm run test:a11y` (planned - SYOS-529)
- Integrates `axe-core` for automated WCAG checks

**Reference**: `design-principles.md`

---

## 8. Dark Mode

### 8.1 Dark Mode Strategy

**SynergyOS uses semantic tokens + CSS custom properties** for dark mode.

**Pattern**:
```css
/* Semantic tokens automatically handle light/dark mode */
--color-bg-base: oklch(20% 0.002 247.839);  /* Dark mode */
--color-text-primary: oklch(98.5% 0.002 247.839);  /* Dark mode */
```

**Component usage**:
```svelte
<!-- ✅ Automatic dark mode (no manual classes) -->
<div class="bg-base text-primary">
  <!-- Automatically uses dark mode colors -->
</div>

<!-- ❌ Manual light/dark classes (anti-pattern) -->
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">
  <!-- Manual switching, not scalable -->
</div>
```

### 8.2 Light Mode Support (Future)

**Current**: Dark mode only (OKLCH values optimized for dark backgrounds)

**Planned** (SYOS-524): DTCG conditional tokens for light/dark mode

**Pattern**:
```json
{
  "color": {
    "bg": {
      "base": {
        "$value": {
          "dark": "oklch(20% 0.002 247.839)",
          "light": "oklch(98% 0.002 247.839)"
        }
      }
    }
  }
}
```

**Reference**: `design-tokens.md`

---

## 9. Storybook Organization

### 9.1 Storybook Hierarchy

**SynergyOS uses hierarchical Storybook organization** (aligned with atomic design):

```
Storybook Navigation:
├─ 📘 Docs
│   ├─ Token Reference
│   └─ Design Principles
│
├─ 🎨 Design System
│   ├─ Atoms
│   │   ├─ Button
│   │   ├─ Badge
│   │   └─ Card
│   ├─ Molecules
│   │   ├─ FormField
│   │   └─ SearchBar
│   └─ Organisms
│       ├─ Dialog
│       └─ Accordion
│
└─ 📦 Modules
    ├─ Meetings
    │   ├─ MeetingCard
    │   └─ ActionItemsList
    ├─ Inbox
    │   └─ InboxCard
    └─ OrgChart
        └─ OrgChart
```

### 9.2 Story File Naming & Location

**Pattern**: Co-locate stories with components

```
src/lib/components/atoms/
  ├─ Button.svelte
  └─ Button.stories.svelte       # ✅ Co-located

src/lib/modules/meetings/components/
  ├─ MeetingCard.svelte
  └─ MeetingCard.stories.svelte  # ✅ Co-located
```

**Title Pattern**:
```typescript
// Design System (shared UI)
'Design System/Atoms/Button'
'Design System/Molecules/FormField'
'Design System/Organisms/Dialog'

// Modules (feature-specific)
'Modules/Meetings/MeetingCard'
'Modules/Inbox/InboxCard'
```

### 9.3 Story Structure

**Pattern**:
```svelte
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    component: Button,
    title: 'Design System/Atoms/Button',
    tags: ['autodocs'],
    argTypes: {
      variant: {
        control: { type: 'select' },
        options: ['primary', 'secondary', 'outline']
      },
      size: {
        control: { type: 'select' },
        options: ['sm', 'md', 'lg']
      }
    }
  });
</script>

<Story name="Primary" args={{ variant: 'primary', size: 'md' }}>
  {#snippet template(args)}
    <Button variant={args.variant} size={args.size}>Button</Button>
  {/snippet}
</Story>
```

**Reference**: `/go` command (Storybook section)

---

## 10. Migration Paths

### 10.1 Hardcoded Values → Design Tokens

**Scenario**: Component uses hardcoded pixel/rem/hex values

**Migration workflow**:

1. **Identify hardcoded values**:
```svelte
<!-- ❌ BEFORE: Hardcoded values -->
<div style="padding: 24px; background: #3b82f6; border-radius: 8px;">
```

2. **Find corresponding tokens** (`design-tokens.md`):
```
padding: 24px → --spacing-button-x (1.5rem)
background: #3b82f6 → --color-accent-primary
border-radius: 8px → --border-radius-button
```

3. **Replace with utility classes**:
```svelte
<!-- ✅ AFTER: Token-based utilities -->
<div class="px-button-x bg-accent-primary rounded-button">
```

4. **Validate**:
```bash
npm run lint  # ESLint should pass
```

**Reference**: `migration-guide.md`

### 10.2 Manual Token Mapping → Recipe System

**Scenario**: Component manually maps props to token utilities

**Migration workflow**:

1. **Identify manual mapping**:
```svelte
<!-- ❌ BEFORE: Manual token mapping -->
<script lang="ts">
  const classes = $derived(
    size === 'sm' ? 'h-button-sm px-nav-item' :
    size === 'md' ? 'h-button-md px-button-x' :
    'h-button-lg px-button-x-lg'
  );
</script>
```

2. **Create recipe file**:
```typescript
// src/lib/design-system/recipes/component.recipe.ts
export const componentRecipe = cva('base-classes', {
  variants: {
    size: {
      sm: 'h-button-sm px-nav-item',
      md: 'h-button-md px-button-x',
      lg: 'h-button-lg px-button-x-lg'
    }
  }
});
```

3. **Update component to use recipe**:
```svelte
<!-- ✅ AFTER: Recipe system -->
<script lang="ts">
  import { componentRecipe } from '$lib/design-system/recipes';
  const classes = $derived(componentRecipe({ size }));
</script>
```

4. **Validate**:
```bash
npm run recipes:validate  # Recipe should pass
npm run lint              # ESLint should pass
```

**Reference**: `recipe-system.md`

### 10.3 Hardcoded Colors → Palette Architecture

**Scenario**: Semantic color tokens use hardcoded OKLCH values

**Migration workflow** (SYOS-524 - 5 phases):

**Phase 0: Validation Setup**
- Create `scripts/validate-color-references.js`
- Check for hardcoded OKLCH in semantic tokens

**Phase 1: Create Base Palette**
- Extract all OKLCH values to `color.palette.*`
- Organize by color family (gray, blue, orange, red, green)

**Phase 2: Add Brand Layer**
- Create `color.brand.*` tokens that reference palette
- Example: `color.brand.primary = {color.palette.blue.600}`

**Phase 3: Update Semantic Tokens**
- Update all `color.accent.*`, `color.bg.*`, `color.text.*` to reference brand/palette
- Example: `color.accent.primary = {color.brand.primary}`

**Phase 4: Validate Cascade**
- Change `color.brand.primary` to different palette color
- Verify all UI updates automatically

**Reference**: `color-system-architecture.md`

---

## 11. Common Mistakes (AI Agents)

### 11.1 The #1 Mistake: "Matching Values" ≠ "Using Tokens"

**Agent thinking**:
```
Token: --size-icon-sm = 1rem
Agent: "I'll use 1rem - it matches the token!"
Result: ❌ Hardcoded (cascade broken)
```

**Why wrong**: Hardcoded `'1rem'` doesn't update when token changes.

**Correct thinking**:
```
Token: --size-icon-sm = 1rem
Agent: "I'll use w-icon-sm utility - it REFERENCES the token"
Result: ✅ Token reference (cascade works)
```

**Rule**: If you're typing a NUMBER/COLOR/SIZE as a STRING, you're hardcoding.

### 11.2 Mistake #2: Manual Token Mapping for CSS Components

**Agent approach**:
```svelte
<!-- ❌ WRONG: Manual mapping -->
<script lang="ts">
  const classes = $derived(
    size === 'sm' ? 'h-button-sm' : 'h-button-md'
  );
</script>
```

**Why wrong**: Not scalable, AI agents fail at manual mapping.

**Correct approach**:
```svelte
<!-- ✅ CORRECT: Recipe system -->
<script lang="ts">
  import { buttonRecipe } from '$lib/design-system/recipes';
  const classes = $derived(buttonRecipe({ size }));
</script>
```

### 11.3 Mistake #3: SVG "Attributes Need Values" Rationalization

**Agent rationalization**:
> "SVG attributes need actual values, so I'll hardcode `1rem`, `2rem`"

**Why wrong**: Hardcoded values break cascade (even for SVG).

**Correct approach** (if truly SVG limitation):
```svelte
<script lang="ts">
  /**
   * DESIGN SYSTEM EXCEPTION: SVG/D3 Visualization (SYOS-522)
   * 
   * CSS-based sizing unreliable for SVG in some browsers.
   * Requires explicit HTML attributes.
   * 
   * Approved exception - see dev-docs/master-docs/design-system.md
   */
</script>

<svg width="16" height="16">
  <!-- Documented exception -->
</svg>
```

### 11.4 Mistake #4: Using Base Tokens Instead of Semantic

**Agent approach**:
```svelte
<!-- ❌ WRONG: Base token (no context) -->
<div class="font-sans">
```

**Why wrong**: Base tokens don't provide semantic context.

**Correct approach**:
```svelte
<!-- ✅ CORRECT: Semantic token (clear usage) -->
<div class="font-heading">
```

### 11.5 Mistake #5: Skipping Cascade Test

**Agent assumption**:
> "I used tokens, cascade must work!"

**Why wrong**: Cascade test validates token changes propagate.

**Correct approach**:
```bash
# 1. Change token value in design-system.json
# 2. Run npm run tokens:build
# 3. Navigate to affected page
# 4. Expected: UI updates automatically (no code changes)
```

**Reference**: `.cursor/rules/design-tokens-enforcement.mdc`

---

## 12. Related Documentation

### 12.1 Design System Core

**Primary Documents** (read these first):
- **`design-system.json`** - Source of truth (DTCG format) - 1333 lines, 255+ tokens
- **`design-tokens.md`** - Complete token reference (14 categories, all tokens listed)
- **`color-system-architecture.md`** - Color palette architecture (Palette → Brand → Semantic)
- **`recipe-system.md`** - CVA Recipe System patterns (CSS components)
- **`component-architecture.md`** - 4-layer system + atomic design + module boundaries
- **`design-principles.md`** - Visual philosophy, accessibility (WCAG 2.1 AA), UX principles

### 12.2 Implementation Guides

**How-To Documents**:
- **`quick-start.md`** - Getting started guide for new developers
- **`migration-guide.md`** - Hardcoded values → tokens migration patterns
- **`deprecation-policy.md`** - Breaking change policy (2-version buffer)

### 12.3 AI Agent Workflows

**Command Files** (Cursor IDE):
- **`.cursor/commands/go.md`** - Implementation workflow (pattern-first, recipe system, token validation)
- **`.cursor/commands/design-manager.md`** - Design system manager workflow (guide, not execute)
- **`.cursor/commands/start.md`** - Task initialization workflow (ticket creation)
- **`.cursor/commands/save.md`** - Pattern documentation workflow

**Rule Files** (Auto-loaded):
- **`.cursor/rules/design-tokens-enforcement.mdc`** - Token enforcement (mandatory, auto-loads for `.svelte` files)
- **`.cursor/rules/svelte-typescript-patterns.mdc`** - Svelte 5 patterns (runes, composables)
- **`.cursor/rules/way-of-working.mdc`** - Project-level coding standards

### 12.4 Validation & Testing

**Testing Documentation**:
- **`CI-LOCAL-TESTING.md`** - Local CI validation (`npm run ci:local`)
- **`dev-docs/2-areas/patterns/ci-cd.md`** - CI/CD patterns (GitHub Actions)

**Visual Regression Testing**:
- **Chromatic** - Automated visual testing for Storybook stories (Section 6.4)
- **GitHub Actions** - `.github/workflows/chromatic.yml` - CI integration
- **Storybook Addon** - `@chromatic-com/storybook` - Visual testing addon

**Validation Scripts**:
- **`scripts/validate-recipes.js`** - Recipe validation (checks classes exist)
- **`scripts/validate-semantic-references.js`** - Semantic token validation
- **`scripts/build-tokens.js`** - Style Dictionary build
- **`scripts/analyze-token-usage.js`** - Token usage tracking (identifies orphaned tokens)
- **`scripts/validate-tokens.js`** - Token validation (checks orphaned + deprecated tokens)
- **`scripts/audit-tokens.js`** - Token audit (lists orphaned tokens, CI mode available)
- **`npm run tokens:usage`** - Generate token usage report
- **`npm run tokens:audit`** - List orphaned tokens (exits 1 if found, for CI)
- **`npm run tokens:validate`** - Validate tokens (orphaned + deprecated checks)

**Token Usage Tracking Workflow** (SYOS-538):

**Purpose**: Prevent deprecated token usage and identify orphaned tokens before they accumulate.

**Pre-Commit Hook** (`.husky/pre-commit`):
- ✅ **Deprecated Token Check**: Blocks commits if deprecated tokens are used
  - Runs: `node scripts/validate-tokens.js --fail-on-deprecated`
  - Fails if any deprecated tokens found in codebase
  - Shows migration path (replacement token, reason, removal version)

**CI Pipeline** (`.github/workflows/quality-gates.yml`):
- ✅ **Token Audit**: Flags orphaned tokens (non-blocking initially)
  - Runs: `npm run tokens:audit -- --ci`
  - Lists tokens with 0 usages (excluding base/legacy tokens)
  - Can be made blocking after initial cleanup

**When to Use**:

1. **Before deprecating a token**:
   ```bash
   # Check current usage
   npm run tokens:usage | grep "token-name"
   ```

2. **After marking token as deprecated**:
   ```bash
   # Verify deprecated token check works
   npm run tokens:validate
   ```

3. **During token cleanup**:
   ```bash
   # Find orphaned tokens
   npm run tokens:audit
   ```

**Migration Workflow**:

1. **Mark token as deprecated** in `design-system.json`:
   ```json
   {
     "spacing": {
       "old-token": {
         "$value": "1rem",
         "$deprecated": {
           "since": "2025-11-23",
           "removed": "2026-01-01",
           "replacement": "--spacing-new-token",
           "reason": "Renamed for consistency"
         }
       }
     }
   }
   ```

2. **Pre-commit hook blocks** if deprecated token still used

3. **Migrate code** to replacement token

4. **Commit succeeds** after migration complete

**See**: `dev-docs/2-areas/patterns/ci-cd.md#L1900` - Token usage tracking patterns

### 12.5 Task Planning (In Progress)

**Active Work**:
- **`ai-docs/tasks/recipe-system-migration.md`** - Recipe System rollout (SYOS-513-519)
- **`dev-docs/2-areas/design/color-system-architecture.md`** - Color migration plan (SYOS-524)
- **SYOS-529** - AI Agent Design Governance Playbook (draft)

**Completed Work**:
- **SYOS-520** - Component Audit Report (identified broken components)
- **SYOS-521** - Phase 1: HIGH Priority Components (Sidebar, Layout, StackedPanel)
- **SYOS-522** - Phase 2: SVG Exception Documentation
- **SYOS-523** - Phase 3: LOW Priority Components
- **SYOS-514** - Recipe System POC (Button.svelte)

### 12.6 Architecture & Patterns

**System Architecture**:
- **`dev-docs/2-areas/architecture/system-architecture.md`** - Overall system architecture
- **`dev-docs/2-areas/architecture/modularity-refactoring-analysis.md`** - Module boundaries
- **`dev-docs/2-areas/patterns/INDEX.md`** - Pattern lookup (symptom → solution)
- **`dev-docs/2-areas/patterns/svelte-reactivity.md`** - Svelte 5 runes, composables
- **`dev-docs/2-areas/patterns/convex-integration.md`** - Convex patterns
- **`dev-docs/2-areas/patterns/ui-patterns.md`** - UI/UX patterns

### 12.7 Context7 Integration

**Design Library References** (for validation):
- **Material UI** (`/mui/material-ui`) - Google's design system, component architecture
- **Chakra UI** (`/chakra-ui/chakra-ui`) - Accessibility-first, token architecture
- **Radix UI** (`/radix-ui/primitives`) - Headless components (same as Bits UI)
- **Bits UI** (`/huntabyte/bits-ui`) - Svelte headless components (used in SynergyOS)
- **Storybook** - Component documentation, hierarchical organization

---

## 13. Feedback & Contributions

### 13.1 Reporting Issues

**Found a design system issue?**

1. **Check this document first** - Issue might be documented/planned
2. **Check active tickets** - SYOS-524 (Color System), SYOS-529 (AI Governance)
3. **Create Linear ticket** - Use `#design-system` tag

### 13.2 Suggesting Improvements

**Propose design system improvements** via:
1. Linear ticket (tag: `#design-system`, `#tech-debt`)
2. Reference this document in proposals
3. Include cascade test validation

### 13.3 Updating This Document

**When to update `design-system.md`**:
- ✅ New architectural decision (e.g., Recipe System adoption)
- ✅ New token category added (e.g., fonts, breakpoints, opacity)
- ✅ Migration path documented (e.g., Color System migration)
- ✅ Common mistake identified (update Section 11)
- ✅ Enforcement rule changed (update Section 6)

**How to update**:
1. Make changes to this document
2. Update "Last Updated" date at top
3. Update related docs if needed (footer links)
4. Commit with message: `docs: Update design-system.md - [what changed]`

---

**Last Updated**: 2025-11-23
**Maintained By**: Design System Team
**Questions**: Refer to related documentation above or ask in `#design-system`
**Version**: 1.0.0 (Initial master document)


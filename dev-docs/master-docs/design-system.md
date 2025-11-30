# SynergyOS Design System

**Purpose**: Single source of truth for design system architecture and implementation.

**Audience**: Human developers + AI agents

**Status**: Living document - Updated as system evolves

**Last Updated**: 2025-11-29

---

## 📖 Table of Contents

1. [Core Principles](#1-core-principles)
2. [Token Architecture](#2-token-architecture)
3. [Brand Identity](#3-brand-identity)
4. [CSS Utilities](#4-css-utilities)
5. [Component Architecture](#5-component-architecture)
6. [Recipe System](#6-recipe-system)
   - 6.8 [Compound Components Pattern](#68-compound-components-pattern)
7. [Dark Mode](#7-dark-mode)
8. [Validation](#8-validation)
9. [Visual Design Principles](#9-visual-design-principles)
10. [Common Mistakes](#10-common-mistakes)

---

## 1. Core Principles

### 1.1 The Cascade Rule ⭐ **MOST IMPORTANT**

> "Change a design token once → All UI updates automatically"

```
Designer edits design-tokens-base.json
  ↓
Run: npm run tokens:build
  ↓
CSS variables regenerate
  ↓
All components using those tokens update
  ↓
NO code changes required
```

**If this doesn't work, the system is broken.**

### 1.2 Two-File Architecture

| File | Purpose | Who Edits |
|------|---------|-----------|
| `design-tokens-base.json` | Base tokens (colors, spacing, typography) | **Designers** |
| `design-tokens-semantic.json` | Semantic tokens (references base tokens) | **Engineers** (with approval) |

**Rule**: Designers edit base tokens. Semantic tokens cascade automatically.

### 1.3 Design Philosophy

1. **Token-Driven**: Every design value is a token
2. **AI-Friendly**: Patterns that AI agents can follow consistently
3. **Cascade-First**: Changes propagate automatically
4. **Type-Safe**: Recipe system prevents invalid variants

---

## 2. Token Architecture

### 2.1 Five-Layer Cascade

```
Layer 1: Base Tokens (design-tokens-base.json)
  ↓ referenced by
Layer 2: Semantic Tokens (design-tokens-semantic.json)
  ↓ generates
Layer 3: CSS Utilities (@utility classes)
  ↓ used by
Layer 4: Components (Atoms/Molecules/Organisms)
  ↓ composed into
Layer 5: Pages
```

### 2.2 Token Files

#### `design-tokens-base.json` (DESIGNER FILE)

Contains all primitive/base values:

| Category | Examples |
|----------|----------|
| **Brand Colors** | `color.brand.primary`, `color.brand.secondary` |
| **Neutral Scale** | `color.neutral.0` through `color.neutral.1000` |
| **Status Colors** | `color.status.error`, `color.status.success`, etc. |
| **Accent Palette** | `color.accent.coral`, `color.accent.purple`, etc. |
| **Spacing** | `spacing.1` through `spacing.96` (4px unit scale) |
| **Typography** | Font families, sizes, weights, line heights |
| **Effects** | Border radius, shadows, transitions |
| **Sizes** | Icon sizes, sidebar dimensions |

**To change the brand**: Edit `color.brand.primary` and `color.brand.secondary` in this file.

#### `design-tokens-semantic.json` (SYSTEM FILE)

Contains context-specific tokens that REFERENCE base tokens:

```json
{
  "color": {
    "text": {
      "primary": {
        "$value": {
          "light": "{color.neutral.900}",
          "dark": "{color.neutral.50}"
        }
      }
    },
    "interactive": {
      "primary": {
        "$value": {
          "light": "{color.brand.primary}",
          "dark": "{color.brand.primary}"
        }
      }
    }
  }
}
```

**Rule**: Semantic tokens MUST use `{token.path}` references, NEVER hardcoded values.

### 2.3 Generated CSS Output

After running `npm run tokens:build`:

```
src/styles/tokens/
  ├── colors.css      # Color CSS variables + conditional (light/dark)
  ├── spacing.css     # Spacing CSS variables
  ├── typography.css  # Typography CSS variables
  ├── effects.css     # Border radius, shadows
  ├── breakpoints.css # Responsive breakpoints
  └── opacity.css     # Opacity values

src/styles/utilities/
  ├── color-utils.css     # bg-*, text-*, border-* utilities
  ├── spacing-utils.css   # px-*, py-*, gap-* utilities
  ├── typography-utils.css # text-h1, text-body, etc.
  ├── component-utils.css  # rounded-*, shadow-* utilities
  └── opacity-utils.css    # opacity-disabled, etc.
```

---

## 3. Brand Identity

### 3.1 Brand Colors

| Token | Value | Description |
|-------|-------|-------------|
| `color.brand.primary` | `oklch(55% 0.15 195)` | **Deep Teal** - Intelligence, innovation, trust |
| `color.brand.primaryLight` | `oklch(65% 0.12 195)` | Lighter teal for hover states |
| `color.brand.primaryDark` | `oklch(45% 0.15 195)` | Darker teal for pressed states |
| `color.brand.secondary` | `oklch(75% 0.14 65)` | **Warm Amber** - Energy, community, warmth |
| `color.brand.secondaryLight` | `oklch(82% 0.12 65)` | Lighter amber for hover |
| `color.brand.secondaryDark` | `oklch(65% 0.14 65)` | Darker amber for pressed |

### 3.2 Typography

| Token | Value | Usage |
|-------|-------|-------|
| `typography.fontFamily.sans` | Plus Jakarta Sans | Primary font (body, UI) |
| `typography.fontFamily.heading` | Plus Jakarta Sans | Headings |
| `typography.fontFamily.mono` | JetBrains Mono | Code, technical text |
| `typography.fontFamily.serif` | Merriweather | Long-form reading (optional) |

**Font Loading**: Fonts are loaded via `<link>` in `src/app.html` (Google Fonts).

### 3.3 Color Philosophy

- **OKLCH color space**: Perceptually uniform, better for accessibility
- **Neutral scale**: 11 steps (0-1000) for maximum flexibility
- **Status colors**: Error (red), Warning (orange), Success (green), Info (blue)
- **Accent palette**: Coral, Purple, Blue, Teal, Lime, Gold for tags/categories

---

## 4. CSS Utilities

### 4.1 Utility Naming Convention

| Pattern | Example | CSS Property |
|---------|---------|--------------|
| `bg-{token}` | `bg-surface`, `bg-accent-primary` | `background-color` |
| `text-{token}` | `text-primary`, `text-error` | `color` |
| `border-{token}` | `border-default`, `border-focus` | `border-color` |
| `rounded-{token}` | `rounded-button`, `rounded-card` | `border-radius` |
| `shadow-{token}` | `shadow-card`, `shadow-modal` | `box-shadow` |
| `px-{token}` | `px-button`, `px-page` | `padding-inline` |
| `py-{token}` | `py-button`, `py-page` | `padding-block` |
| `gap-{token}` | `gap-button`, `gap-section` | `gap` |

### 4.2 Alias Utilities (Backwards Compatibility)

We provide alias utilities that map common names to semantic tokens:

| Alias Utility | Maps To | Purpose |
|---------------|---------|---------|
| `bg-accent-primary` | `--color-interactive-primary` | Primary CTA background |
| `bg-accent-hover` | `--color-interactive-primaryHover` | Hover state |
| `text-accent-primary` | `--color-interactive-primary` | Accent text |
| `border-accent-primary` | `--color-interactive-primary` | Accent border |
| `bg-error` | `--color-status-error` | Error background |
| `border-base` | `--color-border-default` | Default border |
| `px-button-x` | `--spacing-button-x` | Button horizontal padding |
| `py-button-y` | `--spacing-button-y` | Button vertical padding |
| `text-h1`, `text-h2`, etc. | Typography composites | Heading styles |
| `text-body`, `text-small` | Typography composites | Body text styles |

**Why aliases?** Components use names like `bg-accent-primary` which are more intuitive than `bg-interactive-primary`. Aliases bridge this gap without changing component code.

### 4.3 Usage Examples

```svelte
<!-- ✅ CORRECT: Use utility classes -->
<button class="bg-accent-primary text-inverse px-button-x py-button-y rounded-button">
  Click me
</button>

<!-- ✅ CORRECT: Use text utilities -->
<h1 class="text-h1 text-primary">Heading</h1>
<p class="text-body text-secondary">Body text</p>

<!-- ❌ WRONG: Hardcoded values -->
<button style="background: oklch(55% 0.15 195); padding: 1rem;">
  Click me
</button>
```

---

## 5. Component Architecture

### 5.1 Atomic Design Layers

```
src/lib/components/
  ├── atoms/       # Single elements (Button, Badge, Card, Input)
  ├── molecules/   # 2-3 atoms combined (FormField, SearchBar)
  └── organisms/   # Complex sections (Dialog, Header)

src/lib/modules/[module]/components/
  └── *.svelte     # Module-specific components
```

### 5.2 Component Classification

| Type | Location | Characteristics |
|------|----------|-----------------|
| **Atoms** | `src/lib/components/atoms/` | Single element, has variants, used everywhere |
| **Molecules** | `src/lib/components/molecules/` | Combines 2-3 atoms, reusable |
| **Organisms** | `src/lib/components/organisms/` | Complex, may have state |
| **Feature** | `src/lib/modules/*/components/` | Module-specific, has business logic |

### 5.3 Import Rules

```typescript
// ✅ CORRECT: Import from shared components
import { Button, Card, Badge } from '$lib/components/atoms';
import { ToggleSwitch, DropdownMenu } from '$lib/components/molecules';

// ❌ WRONG: Cross-module imports
import { InboxCard } from '$lib/modules/inbox/components'; // From flashcards module
```

**Rule**: Feature components MUST NOT cross module boundaries.

---

## 6. Recipe System

### 6.1 What is Recipe System?

Recipe System = CVA (Class Variance Authority) based variant system.

### 6.2 Recipe System vs Component Logic

**Critical Distinction:**

**Recipes = CSS Styling Variants (HOW it looks)**
- Recipes return CSS class strings for visual styling
- Handle: colors (`bg-surface`, `border-focus`), spacing (`px-3`, `gap-2`), sizes (`text-sm`, `icon-md`), visual states (`hover:bg-hover`, `selected`)
- Example: `inboxCardRecipe({ selected: true })` → `"bg-surface border-2 border-focus bg-selected"`

**Components = Content/Data/Business Logic (WHAT it displays)**
- Components return actual content (text, icons, computed values)
- Handle: data mapping (type → icon emoji), business logic (computed values), content (text, icons, images), API calls, state management
- Example: `getTypeIcon('note')` → `"📝"` (emoji string, not CSS classes)

**Why This Separation?**

1. **Recipes are reusable** - Same styling logic can be used across components
2. **Components are domain-specific** - Business logic belongs in the component
3. **Type safety** - Recipes ensure CSS classes are valid; components handle data types

**Example Pattern:**

```svelte
<script lang="ts">
  // ✅ RECIPE: Returns CSS classes
  const cardClasses = inboxCardRecipe({ selected: true });
  // → "bg-surface border-2 border-focus bg-selected"

  // ✅ COMPONENT: Returns content/data  
  const icon = item.icon ?? getTypeIcon(item.type);
  // → "📝"
</script>
```

**If you wanted icon styling variants** (e.g., different sizes/colors), that would go in a recipe. But selecting which icon to display is business logic and stays in the component.

```typescript
// src/lib/design-system/recipes/button.recipe.ts
import { cva } from 'class-variance-authority';

export const buttonRecipe = cva(
  // Base classes
  'inline-flex items-center justify-center rounded-button transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-accent-primary text-inverse hover:bg-accent-hover',
        secondary: 'bg-surface border border-default text-primary',
        outline: 'border border-default text-primary hover:bg-hover'
      },
      size: {
        sm: 'px-menu-item py-menu-item text-small',
        md: 'px-button-x py-button-y text-body',
        lg: 'px-button-x py-button-y text-body'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);
```

### 6.3 Using Recipes

```svelte
<script lang="ts">
  import { buttonRecipe } from '$lib/design-system/recipes';
  
  let { variant = 'primary', size = 'md' } = $props();
  
  const classes = $derived(buttonRecipe({ variant, size }));
</script>

<button class={classes}>
  <slot />
</button>
```

### 6.4 When to Use Recipe vs Manual Classes

| Scenario | Use |
|----------|-----|
| CSS component with variants (Button, Card, Badge) | **Recipe System** |
| SVG component (Loading, Icon) | **Manual classes** (with exception comment) |
| One-off styling | **Utility classes directly** |

### 6.5 Size Variant Naming Standard

**Unified Standard**: All recipes with size variants follow a consistent naming convention.

#### Core Standard: `sm`, `md`, `lg`

**Every recipe with size variants MUST:**
- Include `sm`, `md`, `lg` as the core three sizes
- Set `defaultVariants: { size: 'md' }` (always `md`, never `base`)

```typescript
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

**Why `md` not `base`?**
- `md` is the industry standard (Carbon, Coinbase, Material Design)
- `base` is non-standard and confusing
- Consistency across all components improves developer experience

#### Extended Sizes (When Needed)

Some components may need extended ranges beyond the core three:

- **Smaller**: `xs` (or `xxs` for very small) - e.g., Avatar for compact UIs
- **Larger**: `xl` (or `xxl` for very large) - e.g., Icon for hero sections

**Rule**: Only add extended sizes when the component genuinely needs them. Most components should stick to `sm`, `md`, `lg`.

**Examples of Extended Sizes:**
- **Avatar**: `xxs`, `xs`, `sm`, `md`, `lg` (needs very small sizes for compact sidebars)
- **Icon**: `sm`, `md`, `lg`, `xl`, `xxl` (needs larger sizes for hero sections)

#### Current Recipe Standards

| Component | Size Variants | Default |
|-----------|---------------|---------|
| Button | `sm`, `md`, `lg` | `md` ✅ |
| Text | `sm`, `md`, `lg` | `md` ✅ |
| Badge | `sm`, `md`, `lg` | `md` ✅ |
| FormInput | `sm`, `md`, `lg` | `md` ✅ |
| Avatar | `xxs`, `xs`, `sm`, `md`, `lg` | `md` ✅ |
| Icon | `sm`, `md`, `lg`, `xl`, `xxl` | `md` ✅ |

### 6.6 Input Size Variants (Compact-First)

FormInput and related recipes now support size variants:

```typescript
// formInputRecipe size variants
size: {
  sm: 'text-xs'      // 10px×6px padding, 11px text - Dense UIs
  md: 'text-sm'      // 14px×8px padding, 12px text - DEFAULT (Linear-inspired)
  lg: 'text-base'    // 16px×12px padding, 14px text - Touch/accessibility
}
```

**Usage:**
```svelte
<FormInput size="md" />  <!-- Default compact -->
<FormInput size="lg" />  <!-- Larger for touch targets -->
```

**Recipes that inherit from formInputRecipe:**
- `timeInputRecipe` - inherits size variants
- `dateInputRecipe` - inherits size variants
- `durationInputRecipe` - inherits size variants
- `comboboxTriggerRecipe` - inherits size variants
- `comboboxInputRecipe` - inherits size variants

### 6.7 SVG Exception Pattern

```svelte
<script lang="ts">
  /**
   * DESIGN SYSTEM EXCEPTION: SVG Component
   * 
   * CSS-based sizing unreliable for SVG in some browsers.
   * Using explicit HTML attributes.
   */
</script>

<svg width="24" height="24" class="text-accent-primary">
  <!-- SVG content -->
</svg>
```

### 6.8 Compound Components Pattern

**IMPORTANT**: Compound components (ToggleGroup, ScrollArea, Tabs, etc.) require **manual recipe application**. This is a Svelte limitation, not a design choice.

#### Why Manual Recipes?

**Svelte's module export pattern** (`export const Root = ...`) re-exports components but cannot wrap them while maintaining the compound API. This means:

- ✅ **Single components** (Button, Text, FormInput): Recipes auto-applied internally
- ⚠️ **Compound components** (ToggleGroup, ScrollArea, Tabs): Recipes must be applied manually

**This pattern matches industry standards** - shadcn-svelte uses the exact same approach.

#### Usage Pattern

```svelte
<script lang="ts">
  // 1. Import component
  import { ToggleGroup } from '$lib/components/atoms';
  
  // 2. Import recipes
  import { toggleGroupRootRecipe, toggleGroupItemRecipe } from '$lib/design-system/recipes';
  
  let selected = $state(['mon', 'wed']);
</script>

<!-- 3. Apply recipes manually -->
<ToggleGroup.Root type="multiple" bind:value={selected} class={toggleGroupRootRecipe()}>
  <ToggleGroup.Item value="mon" class={toggleGroupItemRecipe()}>Mon</ToggleGroup.Item>
  <ToggleGroup.Item value="tue" class={toggleGroupItemRecipe()}>Tue</ToggleGroup.Item>
  <ToggleGroup.Item value="wed" class={toggleGroupItemRecipe()}>Wed</ToggleGroup.Item>
</ToggleGroup.Root>
```

#### Compound Components List

| Component | Recipes Needed | Example |
|-----------|---------------|---------|
| **ToggleGroup** | `toggleGroupRootRecipe`, `toggleGroupItemRecipe` | Days of week selector |
| **ScrollArea** | `scrollAreaRootRecipe`, `scrollAreaViewportRecipe`, `scrollAreaScrollbarRecipe`, `scrollAreaThumbRecipe` | Scrollable containers |
| **Tabs** | `tabsListRecipe`, `tabsTriggerRecipe`, `tabsContentRecipe` | Tabbed interfaces |
| **Checkbox** | `checkboxRootRecipe`, `checkboxBoxRecipe`, `checkboxIconRecipe` | Checkboxes |
| **RadioGroup** | `radioGroupIndicatorRecipe`, `radioGroupDotRecipe` | Radio buttons |
| **Tooltip** | `tooltipContentRecipe`, `tooltipArrowRecipe` | Tooltips |

#### Why Not Auto-Apply?

**Technical Limitation:**
- Svelte module exports (`export const Root = ...`) re-export components
- Cannot wrap components while maintaining compound API (`Component.Root`, `Component.Item`)
- Wrapping would break the composition pattern

**Design Decision:**
- Maintains flexibility (can override styles with `class` prop)
- Matches Bits UI architecture (headless primitives)
- Consistent with ecosystem (shadcn-svelte uses same pattern)

**Alternative:** For single toggle buttons, use `Button` component which auto-applies recipes.

---

## 7. Dark Mode

### 7.1 Dark Mode Color Considerations

**Background Colors for Cards:**

- **Container**: Uses `bg-surface` (`neutral.900` in dark mode = 20% lightness)
- **Cards on surface**: Can use `bg-surface` to match container (rely on borders for separation) OR `bg-elevated` (`neutral.800` = 27% lightness) for subtle contrast
- **If cards feel too dark**: Try `bg-surface` to match container background, use borders for visual separation
- **Selected state**: Uses `bg-selected` (brand color with opacity overlay)

### 7.2 How It Works

Semantic tokens define light AND dark values:

```json
{
  "color": {
    "bg": {
      "base": {
        "$value": {
          "light": "{color.neutral.0}",
          "dark": "{color.neutral.900}"
        }
      }
    }
  }
}
```

Generated CSS uses `:root` for light mode and `.dark` class for dark mode:

```css
:root {
  --color-bg-base: var(--color-neutral-0);
}

.dark {
  --color-bg-base: var(--color-neutral-900);
}
```

### 7.3 Using Dark Mode

```svelte
<!-- ✅ CORRECT: Automatic dark mode -->
<div class="bg-base text-primary">
  Content adapts to light/dark automatically
</div>

<!-- ❌ WRONG: Manual dark mode classes -->
<div class="bg-white dark:bg-gray-900">
  Don't do this
</div>
```

---

## 8. Validation

### 8.1 Build Tokens

```bash
npm run tokens:build
```

Regenerates all CSS from token JSON files.

### 8.2 Validation Commands

```bash
# Validate recipes use existing utilities
npm run recipes:validate

# Validate semantic tokens reference base tokens
npm run tokens:validate

# Full lint (ESLint + Prettier)
npm run lint
```

### 8.3 Cascade Test

**Run this test to verify cascade works:**

1. Open `design-tokens-base.json`
2. Change `color.brand.primary` to a different color
3. Run `npm run tokens:build`
4. Refresh browser
5. **Expected**: All brand-colored elements change automatically

**If this fails, cascade is broken.**

---

## 9. Visual Design Principles

### 9.1 Premium Look & Feel (Linear/Notion Inspired)

#### Spacing Philosophy (Compact-First)

**Updated 2025-11-29**: Shifted from "generous" to "compact but breathable" (Linear-inspired).

| Element | Value | Token |
|---------|-------|-------|
| Input padding | 14px × 8px | `px-input`, `py-input` |
| Button padding | 16px × 8px | `px-button`, `py-button` |
| Card padding | 24px | `card-padding` |
| Header → Content gap | 12px | `mb-header` |
| Between sections | 24px | `mb-section`, `gap-section` |
| Form field gaps | 12px | `gap-form` |
| Form section gaps | 16px | `gap-form-sectionGap` |
| Content gaps | 12px | `gap-content` |
| Page padding | 24px × 32px | `px-page`, `py-page` |

**Key Principle**: Tight but breathable. Dense information without feeling cramped.
- **Semantic tokens for all spacing**: Never use `gap-2`, always use `gap-fieldGroup`

#### Shadows & Depth
- **Soft, diffused shadows**: Multi-layered for natural depth
- Primary shadow: `0 8px 24px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.05)`
- Never harsh single-layer shadows
- Shadows should feel like ambient light, not flashlights

#### Border Radius
- Modern, generous curves: 8px for inputs/buttons, 12px for cards, 16px for modals
- Consistent across similar elements

#### Micro-Animations
- **CSS transitions**: 200ms duration, ease-out for all interactive elements
- **Button hover**: Subtle lift (`-translate-y-0.5`) + shadow increase
- **Input focus**: Border color transition + subtle glow ring
- **Svelte transitions**: Use for elements entering/leaving DOM
  - `in:fly={{ y: 16, duration: 400, delay: 100, easing: cubicOut }}`
  - Always respect `prefersReducedMotion`

#### Color & Contrast
- **WCAG compliance**: Primary buttons use `text-inverse` (white) on dark backgrounds
- Brand color at low opacity for subtle effects (5-10%)
- Consistent use of brand hue (195 for teal) in oklch

#### Gradients (Use Sparingly)
- **Subtle radial glow**: Behind focal points, 5-10% opacity
- Use brand hue for consistency
- Never multi-color rainbows
- Page-level effects documented inline (not design tokens)

#### Dropdown Menu Premium Styling
- **Background**: Use `bg-surface` (not `bg-elevated`) for cleaner look
- **Gradient overlay**: Add subtle radial gradient with brand hue (195) at 5% opacity:
  ```svelte
  <DropdownMenu.Content class="relative overflow-hidden rounded-modal border border-base bg-surface shadow-md">
    <!-- Gradient overlay -->
    <div class="pointer-events-none absolute inset-0 bg-radial-[at_50%_0%] from-[oklch(55%_0.12_195_/_0.05)] via-[oklch(55%_0.06_195_/_0.02)] to-transparent" aria-hidden="true"></div>
    <!-- Content with relative positioning -->
    <div class="relative">...</div>
  </DropdownMenu.Content>
  ```
- **Hover states**: Use `hover:bg-subtle` (NOT `hover:bg-hover-solid` which doesn't exist)
- **Menu items**: Add `mx-1 rounded-button` for inset, polished look
- **Transitions**: Use `transition-all duration-200` for smooth feedback

### 9.2 Semantic Spacing Tokens

#### Available Spacing Utilities

```css
/* Padding (compact, Linear-inspired) */
px-button, py-button     /* Button padding (16px × 8px) */
px-input, py-input       /* Input padding (14px × 8px) */
px-page, py-page         /* Page padding */
card-padding             /* Card padding (24px) */

/* Gaps */
gap-button               /* Icon/text gap in buttons */
gap-header               /* Header element gaps (12px) */
gap-form                 /* Form field gaps (12px - compact) */
gap-fieldGroup           /* Tight element gaps (8px) */
gap-card                 /* Card element gaps (16px) */
gap-section              /* Section gaps (24px) */
gap-content              /* Content gaps (12px - compact) */

/* Margins */
mb-header                /* Header → content margin (12px) */
mb-section               /* Section bottom margin (24px) */
mb-alert                 /* Alert bottom margin (24px) */
mt-fieldGroup            /* Field group top margin (8px) */

/* Sizes */
size-icon-sm             /* Small icon (16px) */
size-icon-md             /* Medium icon (20px) */
size-icon-lg             /* Large icon (24px) */

/* Radius */
rounded-input            /* Input border radius */
rounded-button           /* Button border radius */
rounded-card             /* Card border radius */
rounded-modal            /* Modal border radius */

/* Stack - Universal vertical rhythm for internal structure */
py-stack-item            /* Item vertical padding (8px) - menu items, card rows, settings */
py-stack-header          /* Section header vertical padding (10px) - labels, titles */
my-stack-divider         /* Divider vertical margin (8px above + below) */

/* Inset - Container edge padding */
inset-xs                 /* Extra small all-sides (4px) - compact containers */
inset-sm                 /* Small all-sides (8px) - default dropdowns */
inset-md                 /* Medium all-sides (12px) - cards, panels */
inset-lg                 /* Large all-sides (16px) - modals */
py-inset-xs              /* Extra small vertical (4px) - compact menu containers */
py-inset-sm              /* Small vertical (8px) - default dropdown containers */

/* Opacity */
opacity-disabled         /* 50% opacity for disabled states */
```

### 9.3 Stack & Inset Pattern

Universal spacing pattern for any component with headers, items, and dividers:

```
┌─────────────────────────────────────┐  ← py-inset-xs (container top)
│  SECTION LABEL                      │  ← py-stack-header
│  ┌─────────────────────────────────┐│
│  │ Item 1                          ││  ← py-stack-item
│  │ Item 2                          ││  ← py-stack-item
│  │ Item 3                          ││  ← py-stack-item
│  └─────────────────────────────────┘│
│  ───────────────────────────────────│  ← my-stack-divider
│  ANOTHER SECTION                    │  ← py-stack-header
│  ┌─────────────────────────────────┐│
│  │ Item A                          ││  ← py-stack-item
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘  ← py-inset-xs (container bottom)
```

**Applies to**: Dropdown menus, sidebars, cards with sections, settings panels, modals with lists, accordions, tables

### 9.4 Page Header Pattern

Standard pattern for page headers with title and divider. Ensures consistent spacing across all pages.

#### Pattern Structure

```
┌─────────────────────────────────────┐
│  Page Title                          │  ← Header content
│  ───────────────────────────────────│  ← Border divider (border-subtle)
└─────────────────────────────────────┘
```

#### Implementation

**Required Spacing:**
- **Height**: `2.5rem` (40px) - Fixed height for consistent vertical rhythm
- **Padding inline**: `var(--spacing-4)` (16px) - Horizontal padding
- **Padding block**: `var(--spacing-2)` (8px) - Vertical padding (top and bottom)
- **Border**: `border-b border-subtle` - Bottom divider

**Example:**

```svelte
<!-- ✅ CORRECT: Page header with consistent spacing -->
<div
  class="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b border-subtle bg-surface"
  style="height: 2.5rem; padding-inline: var(--spacing-4); padding-block: var(--spacing-2);"
>
  <h2 class="text-small flex items-center gap-2 font-normal text-secondary">
    Page Title
  </h2>
  <!-- Optional: Actions, filters, etc. -->
</div>
```

**Key Rules:**
1. **Always use the same height** (`2.5rem`) for all page headers
2. **Always use the same padding** (`var(--spacing-4)` inline, `var(--spacing-2)` block)
3. **Always include the divider** (`border-b border-subtle`)
4. **Sticky positioning** is optional but recommended for scrollable content

**Applies to**: All page headers (Inbox, Meetings, Dashboard, etc.)

#### When to Add New Tokens

If you need a spacing value that doesn't exist:
1. Check if a semantic token exists in `design-tokens-semantic.json`
2. If not, add it to the semantic file under the appropriate category
3. Run `npm run tokens:build` to generate the utility
4. Verify utility exists: `grep "^@utility" src/styles/utilities/*.css`

---

## 10. Common Mistakes

### 10.1 Hardcoding Values That "Match" Tokens

```svelte
<!-- ❌ WRONG: Hardcoded value (even if it matches token) -->
<div style="padding: 1rem">

<!-- ✅ CORRECT: Uses token utility -->
<div class="px-button-x">
```

**Why wrong**: Hardcoded `1rem` doesn't update when token changes.

### 10.2 Wrong Import Paths

```typescript
// ❌ WRONG: Importing from bits-ui
import { ToggleSwitch } from 'bits-ui';

// ✅ CORRECT: Import from our components
import { ToggleSwitch } from '$lib/components/molecules';
```

### 10.3 Using Base Tokens Directly

```svelte
<!-- ❌ WRONG: Base token -->
<div class="bg-neutral-900">

<!-- ✅ CORRECT: Semantic token -->
<div class="bg-base">
```

### 10.4 Manual Token Mapping

```svelte
<!-- ❌ WRONG: Manual mapping -->
<script>
  const classes = size === 'sm' ? 'px-2' : 'px-4';
</script>

<!-- ✅ CORRECT: Use recipe -->
<script>
  import { buttonRecipe } from '$lib/design-system/recipes';
  const classes = $derived(buttonRecipe({ size }));
</script>
```

### 10.5 Z-Index Values

Z-index utilities (`z-10`, `z-50`) are **acceptable** - they're layout/layering concerns, not design tokens.

```svelte
<!-- ✅ ACCEPTABLE: Z-index for layering -->
<div class="z-50">Modal content</div>

<!-- ✅ ALSO ACCEPTABLE: CSS variable -->
<div style="z-index: var(--zIndex-modal);">Modal content</div>
```

---

## Quick Reference

### Files to Know

| File | Purpose |
|------|---------|
| `design-tokens-base.json` | Edit this to change design values |
| `design-tokens-semantic.json` | System file (don't edit without approval) |
| `src/styles/app.css` | Main CSS entry point |
| `src/app.html` | Font loading (Google Fonts link) |
| `src/lib/design-system/recipes/` | CVA recipe files |
| `scripts/style-dictionary/` | Token build scripts |

### Commands

| Command | Purpose |
|---------|---------|
| `npm run tokens:build` | Build CSS from tokens |
| `npm run dev` | Start dev server |
| `npm run lint` | Lint code |
| `npm run recipes:validate` | Validate recipe classes |

### Utility Quick Reference

| Need | Use |
|------|-----|
| Primary button background | `bg-accent-primary` |
| Primary text color | `text-primary` |
| Secondary text color | `text-secondary` |
| Page background | `bg-base` |
| Card background | `bg-surface` |
| Default border | `border-default` |
| Button padding | `px-button-x py-button-y` |
| Card border radius | `rounded-card` |
| Card shadow | `shadow-card` |

---

**Last Updated**: 2025-11-29
**Version**: 2.1.0 (Design System Compactness v2 - Linear-inspired compact defaults)


# SynergyOS Design System Audit & Optimization Guide

## Purpose

Guide AI tools and developers in systematically auditing and optimizing SynergyOS's **existing 50+ component design system** to achieve 95%+ token coverage and maintain production stability during Phase 3 enhancements.

---

## Current System State

### ✅ Already Implemented (Phases 1-2)

- **50+ atomic components** in `src/lib/components/ui/`
- **CSS-first token system** via Tailwind 4 `@theme`
- **Source of truth**: `design-system-test.json`
- **ESLint governance** blocking hardcoded values
- **Pre-commit hooks** + CI/CD validation
- **4-layer component architecture** documented

### 🔄 Phase 3 Focus (Current Sprint)

- **SYOS-403**: Add comprehensive base spacing scale
- **SYOS-390**: Create specialized components (Avatar, EmptyState, Skeleton)
- **SYOS-373**: Split `app.css` into 11 modular files
- **SYOS-389**: Integrate Storybook + visual testing

### 🎯 Audit Goals

- **Token coverage**: 85% → 95%+
- **Component compliance**: 90% → 98%+
- **Documentation coverage**: 75% → 100%
- **Zero production regressions** during optimization

---

## Phase 1: Token Compliance Audit

### Objective

Identify and fix remaining 15% of components not using semantic tokens.

### Automated Audit Commands

#### 1.1 Find Arbitrary Tailwind Values

```bash
# Search for arbitrary color values
grep -rn "class.*\[#" src/lib/components/

# Search for arbitrary spacing
grep -rn "class.*\[[0-9]" src/lib/components/

# Search for arbitrary font sizes
grep -rn "text-\[[0-9]" src/lib/components/
```

**Expected Output Example:**

```
src/lib/components/ui/badge/Badge.svelte:23: class="bg-[#3b82f6] text-white"
src/lib/components/ui/tooltip/Tooltip.svelte:45: class="p-[8px] rounded-[4px]"
src/lib/inbox/components/InboxMessage.svelte:67: class="text-[14px] font-[500]"
```

#### 1.2 Find Raw Tailwind Scale Usage

```bash
# Find direct use of Tailwind color scale
grep -rn "bg-blue-[0-9]" src/lib/components/
grep -rn "text-gray-[0-9]" src/lib/components/
grep -rn "border-red-[0-9]" src/lib/components/

# Find direct use of Tailwind spacing scale
grep -rn "\\bp-[0-9]\\b" src/lib/components/
grep -rn "\\bm-[0-9]\\b" src/lib/components/
grep -rn "\\bgap-[0-9]\\b" src/lib/components/
```

**Expected Output Example:**

```
src/lib/components/ui/input/Input.svelte:34: class="bg-blue-500 text-white"
src/lib/components/ui/card/Card.svelte:12: class="p-6 rounded-lg"
src/lib/meetings/components/MeetingCard.svelte:89: class="m-4 gap-2"
```

#### 1.3 Find Inline Styles

```bash
# Find components with style attributes
grep -rn 'style="' src/lib/components/
grep -rn "style='" src/lib/components/
```

**Expected Output Example:**

```
src/lib/flashcards/components/FlashcardView.svelte:56: style="padding: 16px; margin: 8px;"
src/lib/components/ui/progress/Progress.svelte:23: style="width: 75%;"
```

### Fix Patterns

#### Pattern 1: Arbitrary Color → Semantic Token

```svelte
<!-- ❌ Before -->
<button class="bg-[#3b82f6] text-white hover:bg-[#2563eb]">

<!-- ✅ After -->
<button class="bg-primary text-primary-foreground hover:bg-primary-hover">
```

**Steps:**

1. Identify intent (e.g., `#3b82f6` is primary brand color)
2. Map to semantic token (`--color-primary`)
3. Use generated utility (`bg-primary`)

#### Pattern 2: Arbitrary Spacing → Semantic Token

```svelte
<!-- ❌ Before -->
<div class="p-[16px] m-[8px] gap-[12px]">

<!-- ✅ After (assuming SYOS-403 spacing scale) -->
<div class="p-4 m-2 gap-3">
<!-- OR with semantic tokens when available -->
<div class="p-card-padding m-md gap-md">
```

**Steps:**

1. Convert px to rem (16px = 1rem = --spacing-4)
2. Use base scale token (4 = 1rem)
3. If semantic alias exists, use it (`p-card-padding`)

#### Pattern 3: Raw Tailwind Scale → Semantic Token

```svelte
<!-- ❌ Before -->
<button class="bg-blue-500 text-white p-4">

<!-- ✅ After -->
<button class="bg-primary text-primary-foreground p-button-padding-md">
```

**Steps:**

1. Map `blue-500` to semantic token (`primary`)
2. Map `p-4` to semantic spacing (`button-padding-md`)
3. Update component to use semantic utilities

#### Pattern 4: Inline Styles → Tailwind Utilities

```svelte
<!-- ❌ Before -->
<div style="padding: 16px; background: #f3f4f6; border-radius: 8px;">

<!-- ✅ After -->
<div class="p-card-padding bg-surface rounded-md">
```

**Steps:**

1. Extract inline style values
2. Map to semantic tokens
3. Use Tailwind utilities

### Audit Report Template

After running audit scripts, generate report:

```markdown
## Token Compliance Audit Report

**Date**: 2024-11-20
**Auditor**: [Your name/AI tool]

### Summary

- **Arbitrary values found**: 23 instances
- **Raw Tailwind scale usage**: 45 instances
- **Inline styles**: 7 instances
- **Current token coverage**: 85%
- **Target token coverage**: 95%+

### Critical Violations (Production Impact)

1. **Badge.svelte:23** - `bg-[#3b82f6]` → Should be `bg-primary`
2. **InboxMessage.svelte:67** - `text-[14px]` → Should be `text-body-sm`
3. **Card.svelte:12** - `p-6` → Should be `p-card-padding`

### High Priority Violations (Module-Level)

#### Inbox Module (8 instances)

- InboxMessage.svelte - 3 arbitrary values
- InboxFilters.svelte - 2 raw spacing
- InboxHeader.svelte - 3 inline styles

#### Meetings Module (12 instances)

- MeetingCard.svelte - 5 arbitrary values
- MeetingList.svelte - 4 raw spacing
- MeetingHeader.svelte - 3 raw colors

### Migration Plan

**Week 1**: Fix critical violations (3 files)
**Week 2**: Migrate Inbox module (3 files)
**Week 3**: Migrate Meetings module (3 files)
**Week 4**: Migrate Flashcards module (remaining files)

### Expected Outcome

- **Token coverage**: 85% → 95%+
- **Violations**: 75 → <5
- **Production regressions**: 0 (incremental testing)
```

---

## Phase 2: Component Hierarchy Audit

### Objective

Ensure all components are correctly classified into 4-layer architecture.

### Audit Steps

#### 2.1 Identify Misclassified Components

```bash
# Check for complex organisms in ui/ folder (should be in feature/)
ls -la src/lib/components/ui/ | grep -E "(Form|Dashboard|Panel|Section)"

# Check for simple atoms in feature folders (should be in ui/)
find src/lib/*/components/ -name "Button*.svelte" -o -name "Input*.svelte"
```

**Classification Rules:**

- **Layer 1 (Primitives)**: No styling, ARIA only → `ui/primitives/`
- **Layer 2 (Styled)**: Single interactive element → `ui/`
- **Layer 3 (Composites)**: 2-3 atoms combined → `ui/composites/`
- **Layer 4 (Features)**: Domain-specific → `[feature]/components/`

#### 2.2 Check for Direct HTML Usage

```bash
# Pages should not use raw HTML form elements
grep -rn "<button" src/routes/
grep -rn "<input" src/routes/
grep -rn "<select" src/routes/
grep -rn "<textarea" src/routes/

# Feature components should use Layer 2 components
grep -rn "<button" src/lib/*/components/
```

**Expected Violations:**

```
src/routes/inbox/+page.svelte:45: <button class="...">Send</button>
src/routes/meetings/+page.svelte:67: <input type="text" class="...">
src/lib/inbox/components/InboxActions.svelte:23: <button class="...">
```

#### 2.3 Verify Component Independence

For each component in `src/lib/components/ui/`, check:

```svelte
<!-- ✅ Independent component -->
<script>
  // Accepts props, no external state dependencies
  interface Props {
    variant: string;
    size: string;
  }
  let { variant, size }: Props = $props();
</script>

<!-- Component uses only props, no parent context -->
<button class="...">

<!-- ❌ Dependent component -->
<script>
  // Relies on parent context or global state
  import { getContext } from 'svelte';
  const theme = getContext('theme'); // ❌ Not independent
</script>
```

### Fix Patterns

#### Misclassified Component

```bash
# ❌ Complex form in ui/ folder
src/lib/components/ui/user-registration-form/

# ✅ Move to feature or composites
src/lib/auth/components/UserRegistrationForm.svelte
# OR
src/lib/components/ui/composites/user-registration-form/
```

#### Raw HTML Usage

```svelte
<!-- ✅ After: Use design system Button -->
<script>
	import { Button } from '$lib/components/ui';
</script>

<!-- ❌ Before: Raw HTML in page -->
<button class="bg-blue-500 px-4 py-2 text-white"> Send Email </button>

<Button variant="primary">Send Email</Button>
```

### Hierarchy Audit Report

```markdown
## Component Hierarchy Audit Report

**Date**: 2024-11-20

### Summary

- **Total components audited**: 50+
- **Correctly classified**: 45 (90%)
- **Misclassified**: 5 (10%)
- **Raw HTML usage in routes**: 12 instances
- **Non-independent components**: 3

### Misclassifications

1. **ui/complex-form/** → Should be `composites/complex-form/`
2. **inbox/components/Button.svelte** → Should be `ui/button/`
3. **ui/user-card/** → Should be `composites/user-card/`

### Raw HTML Usage

#### Routes

- `/inbox/+page.svelte` - 4 instances
- `/meetings/+page.svelte` - 3 instances
- `/settings/+page.svelte` - 5 instances

#### Feature Components

- `inbox/components/InboxActions.svelte` - 2 instances
- `meetings/components/MeetingActions.svelte` - 1 instance

### Refactoring Plan

**Priority 1**: Move misclassified components to correct folders
**Priority 2**: Replace raw HTML in routes
**Priority 3**: Fix non-independent components

### Expected Outcome

- **Classification accuracy**: 90% → 100%
- **Raw HTML usage**: 12 → 0
- **Independent components**: 47 → 50
```

---

## Phase 3: Spacing Scale Implementation (SYOS-403)

### Objective

Add comprehensive base spacing scale (0-96) + semantic aliases.

### Implementation Steps

#### 3.1 Define Base Scale

```css
/* src/app.css - Add to @theme */
@theme {
	/* Base spacing scale (Tailwind-compatible) */
	--spacing-0: 0;
	--spacing-px: 1px;
	--spacing-0.5: 0.125rem; /* 2px */
	--spacing-1: 0.25rem; /* 4px */
	--spacing-1.5: 0.375rem; /* 6px */
	--spacing-2: 0.5rem; /* 8px */
	--spacing-2.5: 0.625rem; /* 10px */
	--spacing-3: 0.75rem; /* 12px */
	--spacing-3.5: 0.875rem; /* 14px */
	--spacing-4: 1rem; /* 16px */
	--spacing-5: 1.25rem; /* 20px */
	--spacing-6: 1.5rem; /* 24px */
	--spacing-7: 1.75rem; /* 28px */
	--spacing-8: 2rem; /* 32px */
	--spacing-9: 2.25rem; /* 36px */
	--spacing-10: 2.5rem; /* 40px */
	--spacing-11: 2.75rem; /* 44px */
	--spacing-12: 3rem; /* 48px */
	--spacing-14: 3.5rem; /* 56px */
	--spacing-16: 4rem; /* 64px */
	--spacing-20: 5rem; /* 80px */
	--spacing-24: 6rem; /* 96px */
	--spacing-28: 7rem; /* 112px */
	--spacing-32: 8rem; /* 128px */
	--spacing-36: 9rem; /* 144px */
	--spacing-40: 10rem; /* 160px */
	--spacing-44: 11rem; /* 176px */
	--spacing-48: 12rem; /* 192px */
	--spacing-52: 13rem; /* 208px */
	--spacing-56: 14rem; /* 224px */
	--spacing-60: 15rem; /* 240px */
	--spacing-64: 16rem; /* 256px */
	--spacing-72: 18rem; /* 288px */
	--spacing-80: 20rem; /* 320px */
	--spacing-96: 24rem; /* 384px */
}
```

#### 3.2 Add Semantic Aliases

```css
@theme {
	/* Semantic spacing aliases (component-specific) */

	/* Button spacing */
	--spacing-button-padding-sm: var(--spacing-2) var(--spacing-3); /* 8px 12px */
	--spacing-button-padding-md: var(--spacing-3) var(--spacing-4); /* 12px 16px */
	--spacing-button-padding-lg: var(--spacing-4) var(--spacing-6); /* 16px 24px */

	/* Input spacing */
	--spacing-input-padding: var(--spacing-3); /* 12px */
	--spacing-input-padding-sm: var(--spacing-2); /* 8px */
	--spacing-input-padding-lg: var(--spacing-4); /* 16px */

	/* Card spacing */
	--spacing-card-padding: var(--spacing-6); /* 24px */
	--spacing-card-padding-sm: var(--spacing-4); /* 16px */
	--spacing-card-padding-lg: var(--spacing-8); /* 32px */

	/* Layout spacing */
	--spacing-section: var(--spacing-16); /* 64px */
	--spacing-content: var(--spacing-8); /* 32px */
	--spacing-element: var(--spacing-4); /* 16px */

	/* Component gaps */
	--spacing-gap-sm: var(--spacing-2); /* 8px */
	--spacing-gap-md: var(--spacing-4); /* 16px */
	--spacing-gap-lg: var(--spacing-6); /* 24px */
}
```

#### 3.3 Test Cascade

```bash
# 1. Change a semantic token temporarily
# Edit src/app.css:
--spacing-button-padding-md: var(--spacing-6) var(--spacing-8);  # Increased

# 2. Start dev server
npm run dev

# 3. Visually verify buttons are larger
# Navigate to /inbox, /meetings, /settings

# 4. Revert change
--spacing-button-padding-md: var(--spacing-3) var(--spacing-4);  # Original

# 5. Verify buttons return to normal
```

#### 3.4 Migrate Components

**Priority Order (5 key components):**

1. Button.svelte
2. Input.svelte
3. Card.svelte
4. Badge.svelte
5. Avatar.svelte (if exists, else next most-used)

**Migration Pattern:**

```svelte
<!-- Before -->
<button class="px-4 py-2">

<!-- After (using base scale) -->
<button class="px-4 py-2">  <!-- Unchanged, references --spacing-4 & --spacing-2 -->

<!-- After (using semantic alias) -->
<button class="px-button-padding-md py-button-padding-sm">
```

### Spacing Audit Report

```markdown
## Spacing Scale Implementation Report (SYOS-403)

**Date**: 2024-11-20
**Phase**: 3.1 - Foundation

### Implementation Status

✅ **Base scale defined** (0-96) in `src/app.css`
✅ **Semantic aliases added** (button, input, card, layout)
✅ **Cascade test passed** (visual verification)
✅ **5 key components migrated** (Button, Input, Card, Badge, Avatar)
🔄 **Remaining components** (45 to migrate incrementally)

### Cascade Test Results

- **Test token**: `--spacing-button-padding-md`
- **Original value**: `12px 16px`
- **Test value**: `24px 32px`
- **Visual result**: ✅ All buttons increased size
- **Revert result**: ✅ All buttons returned to normal

### Component Migration

1. ✅ **Button.svelte** - Migrated to `px-button-padding-md`
2. ✅ **Input.svelte** - Migrated to `p-input-padding`
3. ✅ **Card.svelte** - Migrated to `p-card-padding`
4. ✅ **Badge.svelte** - Migrated to base scale
5. ✅ **Avatar.svelte** - Migrated to base scale

### Next Steps

**Week 2**: Migrate Inbox module components (10 files)
**Week 3**: Migrate Meetings module components (12 files)
**Week 4**: Migrate Flashcards module components (8 files)
**Week 5**: Migrate remaining UI components (15 files)

### Expected Outcome

- **Spacing consistency**: 100% across all components
- **Token coverage for spacing**: 100%
- **Easier theme changes**: Update one token, cascade everywhere
```

---

## Phase 4: Modular CSS Split (SYOS-373)

### Objective

Split monolithic `src/app.css` into 11 domain-specific files for better maintainability.

### Target Structure

```
src/styles/
├── 00-tokens/
│   ├── colors.css          # Color token definitions
│   ├── spacing.css         # Spacing scale + semantic aliases
│   ├── typography.css      # Font families, sizes, weights
│   ├── borders.css         # Border radius, widths
│   └── shadows.css         # Elevation shadows
├── 01-base/
│   ├── reset.css           # CSS reset/normalize
│   └── typography.css      # Base typography styles
├── 02-utilities/
│   └── custom-utilities.css  # Custom Tailwind utilities
├── 03-components/
│   └── component-overrides.css  # Component-specific overrides
├── 04-layouts/
│   └── grid.css            # Grid system utilities
└── app.css                 # Main import file
```

### Migration Steps

#### Step 1: Create Directory Structure

```bash
mkdir -p src/styles/00-tokens
mkdir -p src/styles/01-base
mkdir -p src/styles/02-utilities
mkdir -p src/styles/03-components
mkdir -p src/styles/04-layouts
```

#### Step 2: Extract Color Tokens

```css
/* src/styles/00-tokens/colors.css */
@theme {
	/* Base colors */
	--color-primary: oklch(0.5 0.2 250);
	--color-secondary: oklch(0.6 0.15 200);
	--color-accent: oklch(0.7 0.18 150);

	/* UI colors */
	--color-background: oklch(1 0 0);
	--color-surface: oklch(0.98 0 0);
	--color-foreground: oklch(0.15 0 0);

	/* State colors */
	--color-primary-hover: oklch(0.45 0.22 250);
	--color-primary-active: oklch(0.4 0.24 250);
	--color-primary-disabled: oklch(0.7 0.1 250);

	/* etc. */
}
```

#### Step 3: Extract Spacing Tokens

```css
/* src/styles/00-tokens/spacing.css */
@theme {
	/* Base spacing scale (from SYOS-403) */
	--spacing-0: 0;
	--spacing-1: 0.25rem;
	/* ... full scale ... */
	--spacing-96: 24rem;

	/* Semantic aliases */
	--spacing-button-padding-md: var(--spacing-3) var(--spacing-4);
	--spacing-card-padding: var(--spacing-6);
	/* etc. */
}
```

#### Step 4: Extract Typography

```css
/* src/styles/00-tokens/typography.css */
@theme {
	/* Font families */
	--font-sans: 'Inter', sans-serif;
	--font-mono: 'JetBrains Mono', monospace;

	/* Font sizes */
	--font-size-xs: 0.75rem;
	--font-size-sm: 0.875rem;
	--font-size-base: 1rem;
	--font-size-lg: 1.125rem;
	/* etc. */

	/* Semantic typography */
	--font-heading-xl: var(--font-size-5xl) var(--font-sans) 700;
	--font-body-md: var(--font-size-base) var(--font-sans) 400;
	/* etc. */
}
```

#### Step 5: Update Main Import File

```css
/* src/styles/app.css */
@import './00-tokens/colors.css';
@import './00-tokens/spacing.css';
@import './00-tokens/typography.css';
@import './00-tokens/borders.css';
@import './00-tokens/shadows.css';

@import './01-base/reset.css';
@import './01-base/typography.css';

@import './02-utilities/custom-utilities.css';

@import './03-components/component-overrides.css';

@import './04-layouts/grid.css';

@import 'tailwindcss';
```

#### Step 6: Update Svelte Config

```javascript
// svelte.config.js - Ensure CSS imports work
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			'@styles': 'src/styles'
		}
	}
};
```

#### Step 7: Test Full Cascade

```bash
# 1. Start dev server with new structure
npm run dev

# 2. Navigate to ALL pages
# - /inbox
# - /meetings
# - /flashcards
# - /settings

# 3. Verify NO visual regressions
# - Colors unchanged
# - Spacing unchanged
# - Typography unchanged
# - Interactions working

# 4. Test token change cascade
# Edit src/styles/00-tokens/colors.css
--color-primary: oklch(0.6 0.2 250);  # Lighter blue

# 5. Verify change cascades to ALL primary elements

# 6. Revert
--color-primary: oklch(0.5 0.2 250);  # Original
```

### Modular CSS Audit Report

```markdown
## Modular CSS Implementation Report (SYOS-373)

**Date**: 2024-11-20
**Phase**: 3.2 - Architecture

### Implementation Status

✅ **Directory structure created** (5 folders, 11 files)
✅ **Tokens extracted** (colors, spacing, typography, borders, shadows)
✅ **Base styles extracted** (reset, typography)
✅ **Utilities preserved** (custom utilities still work)
✅ **Main import file updated** (app.css imports all)
✅ **Full cascade test passed** (no visual regressions)

### File Structure
```

src/styles/
├── 00-tokens/ ✅ 5 files
├── 01-base/ ✅ 2 files
├── 02-utilities/ ✅ 1 file
├── 03-components/ ✅ 1 file
├── 04-layouts/ ✅ 1 file
└── app.css ✅ Main import

```

### Visual Regression Test
- ✅ **Inbox module**: No changes
- ✅ **Meetings module**: No changes
- ✅ **Flashcards module**: No changes
- ✅ **Settings module**: No changes

### Token Cascade Test
- **Test**: Changed `--color-primary` to lighter shade
- **Result**: ✅ All buttons, links, accents updated
- **Revert**: ✅ All elements returned to original

### Benefits Achieved
1. ✅ **Easier navigation** - Find tokens by domain
2. ✅ **Clearer ownership** - Each file has single responsibility
3. ✅ **Faster editing** - Smaller files, quicker edits
4. ✅ **Better collaboration** - Less merge conflicts
5. ✅ **Simpler debugging** - Isolated concerns

### Next Steps
**Week 3**: Team training on new structure
**Week 4**: Update documentation to reference new file paths
**Ongoing**: Maintain structure as new tokens added
```

---

## Phase 5: Storybook Integration (SYOS-389)

### Objective

Add visual component playground + automated visual regression testing.

### Implementation Steps

#### 5.1 Install Storybook

```bash
npx storybook@latest init --type svelte
npm install --save-dev @storybook/addon-essentials
npm install --save-dev @storybook/addon-a11y
npm install --save-dev chromatic  # Optional: visual regression service
```

#### 5.2 Configure Storybook

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/svelte';
import '../src/styles/app.css'; // Import token system

const preview: Preview = {
	parameters: {
		backgrounds: {
			default: 'light',
			values: [
				{ name: 'light', value: '#ffffff' },
				{ name: 'dark', value: '#111827' }
			]
		},
		actions: { argTypesRegex: '^on[A-Z].*' },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/
			}
		}
	}
};

export default preview;
```

#### 5.3 Create Story Template

```typescript
// src/lib/components/ui/button/Button.stories.ts
import type { Meta, StoryObj } from '@storybook/svelte';
import Button from './Button.svelte';

const meta = {
	title: 'UI/Button',
	component: Button,
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['primary', 'secondary', 'ghost', 'destructive'],
			description: 'Visual style of the button'
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Size of the button'
		},
		disabled: {
			control: 'boolean',
			description: 'Whether button is disabled'
		}
	},
	parameters: {
		docs: {
			description: {
				component: 'Primary button component with multiple variants and sizes.'
			}
		}
	}
} satisfies Meta<Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Primary: Story = {
	args: {
		children: 'Button'
	}
};

// Variant stories
export const Secondary: Story = {
	args: {
		variant: 'secondary',
		children: 'Secondary Button'
	}
};

export const Destructive: Story = {
	args: {
		variant: 'destructive',
		children: 'Delete'
	}
};

// Size stories
export const Small: Story = {
	args: {
		size: 'sm',
		children: 'Small Button'
	}
};

export const Large: Story = {
	args: {
		size: 'lg',
		children: 'Large Button'
	}
};

// State stories
export const Disabled: Story = {
	args: {
		disabled: true,
		children: 'Disabled Button'
	}
};

// Playground story
export const Playground: Story = {
	args: {
		variant: 'primary',
		size: 'md',
		disabled: false,
		children: 'Playground'
	}
};
```

#### 5.4 Create Stories for All Layer 2 Components

**Priority Order:**

1. Button.svelte ✅ (Template above)
2. Input.svelte
3. Card.svelte
4. Badge.svelte
5. Avatar.svelte
6. ... (remaining 45+ components)

**Story Creation Workflow:**

```bash
# For each component:
# 1. Copy Button.stories.ts as template
cp src/lib/components/ui/button/Button.stories.ts src/lib/components/ui/input/Input.stories.ts

# 2. Update meta.title and component import
# 3. Update argTypes to match component props
# 4. Create stories for each variant
# 5. Test in Storybook
npm run storybook

# 6. Verify component renders correctly
# 7. Commit story file
git add src/lib/components/ui/input/Input.stories.ts
git commit -m "docs(storybook): add Input component stories"
```

#### 5.5 Set Up Visual Regression Testing (Optional - Chromatic)

```bash
# Install Chromatic
npm install --save-dev chromatic

# Add script to package.json
{
  "scripts": {
    "chromatic": "chromatic --project-token=YOUR_TOKEN"
  }
}

# Run visual tests
npm run chromatic

# Integrate into CI/CD
# .github/workflows/chromatic.yml
name: Chromatic
on: push
jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run chromatic
        env:
          CHROMATIC_PROJECT_TOKEN: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

### Storybook Audit Report

```markdown
## Storybook Integration Report (SYOS-389)

**Date**: 2024-11-20
**Phase**: 3.3 - Visual Testing

### Implementation Status

✅ **Storybook installed** (v8.0+)
✅ **Configuration complete** (tokens imported)
✅ **Story template created** (Button.stories.ts)
✅ **5 components documented** (Button, Input, Card, Badge, Avatar)
🔄 **Remaining components** (45 to document)
🔄 **Visual regression** (Chromatic integration pending)

### Stories Created

1. ✅ **Button** - 7 stories (variants, sizes, states)
2. ✅ **Input** - 6 stories (types, states, validation)
3. ✅ **Card** - 4 stories (variants, with/without header)
4. ✅ **Badge** - 5 stories (variants, sizes)
5. ✅ **Avatar** - 4 stories (sizes, with/without image)

### Documentation Coverage

- **Layer 1 (Primitives)**: Not applicable (unstyled)
- **Layer 2 (Styled)**: 5/50 (10%) ✅ Started
- **Layer 3 (Composites)**: 0/15 (0%) 🔄 Pending
- **Layer 4 (Features)**: Not applicable (domain-specific)

### Next Steps

**Week 4**: Document remaining Layer 2 components (45 stories)
**Week 5**: Document Layer 3 composites (15 stories)
**Week 6**: Set up Chromatic visual regression
**Week 7**: Integrate visual testing into CI/CD

### Expected Outcome

- **Documentation coverage**: 100% for Layer 2 + 3
- **Visual regression**: Automated testing on every PR
- **Developer onboarding**: Faster with component playground
- **Design consistency**: Easier to verify across components
```

---

## Continuous Monitoring & Metrics

### Monthly Token Audit

```bash
# Run automated audit
npm run audit:tokens

# Expected output:
{
  "date": "2024-11-20",
  "token_coverage": "92%",
  "arbitrary_values": 15,
  "raw_tailwind_usage": 23,
  "inline_styles": 3,
  "violations_by_module": {
    "inbox": 8,
    "meetings": 12,
    "flashcards": 18
  }
}
```

### Quarterly Component Audit

```bash
# Run hierarchy audit
npm run audit:components

# Expected output:
{
  "date": "2024-11-20",
  "total_components": 50,
  "correctly_classified": 48,
  "misclassified": 2,
  "raw_html_usage": 5,
  "non_independent": 1
}
```

### Metrics Dashboard (Target State)

```markdown
## Design System Health Dashboard

**Last Updated**: 2024-11-20

### Token Compliance

- **Coverage**: 92% / 95% target ⚠️
- **Arbitrary values**: 15 / 0 target ❌
- **Raw Tailwind**: 23 / 0 target ❌
- **Trend**: ↑ Improving (was 85% last month)

### Component Health

- **Classification accuracy**: 96% / 100% target ⚠️
- **Independence**: 98% / 100% target ✅
- **Documentation**: 60% / 100% target ❌
- **Trend**: ↑ Improving (Storybook in progress)

### Governance Effectiveness

- **ESLint violations**: 2 / month ✅
- **Pre-commit blocks**: 12 / month ✅
- **CI/CD failures**: 3 / month ✅
- **Trend**: → Stable

### Phase 3 Progress

- **SYOS-403** (Base spacing): ✅ Complete
- **SYOS-390** (Specialized components): 🔄 70% complete
- **SYOS-373** (Modular CSS): ✅ Complete
- **SYOS-389** (Storybook): 🔄 30% complete
```

---

## Conclusion

This audit guide provides systematic, measurable improvement of SynergyOS's design system while maintaining production stability. Focus on:

1. ✅ **Incremental changes** (module by module)
2. ✅ **Comprehensive testing** (visual + automated)
3. ✅ **Clear metrics** (track progress)
4. ✅ **Zero regressions** (production-first mindset)

**Current Priority**: Execute SYOS-403 → 390 → 373 → 389 in order. Each builds on the previous. 🎯

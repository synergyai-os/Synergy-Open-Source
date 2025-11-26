# Missing Styles

Styles that are referenced in code but don't exist in the design system.

## Text Colors

### `text-error-secondary`
- **Location**: `src/routes/login/+page.svelte` (line 186)
- **Usage**: Error link text on error background (needs lighter error color for contrast)
- **Status**: Missing utility class
- **Current Workaround**: Using `class="text-error-secondary"` directly (may not work)
- **Proposed Solution**: Add to semantic tokens as `color.text.error.secondary` for text on error backgrounds
- **Note**: Using `color="error"` prop on Text component works for error text, but we need a secondary variant for better contrast on error backgrounds

## Typography Utilities Bug (FIXED ✅)

### ALL Typography Utilities Use Wrong CSS Property
- **Location**: `src/styles/utilities/typography-utils.css`
- **Issue**: **ALL** typography utilities used `font-size:` property instead of correct CSS properties
- **Status**: ✅ **FIXED** on 2025-11-25
- **Solution Applied**: Updated `scripts/style-dictionary/transforms.js` to map utility types to correct CSS properties:
  - `font-sans/heading/mono/serif` → `font-family:` ✅
  - `text-2xs/xs/sm/base/lg/xl/...` → `font-size:` ✅
  - `font-thin/light/regular/medium/semibold/bold/...` → `font-weight:` ✅
  - `leading-none/tight/snug/normal/relaxed/loose` → `line-height:` ✅
  - `tracking-tighter/tight/normal/wide/wider/widest` → `letter-spacing:` ✅

## Form Input Utilities

### `text-label-primary`
- **Location**: `src/lib/components/atoms/FormInput.svelte` (previously line 54, now in recipe)
- **Usage**: Label text color for form inputs
- **Status**: Missing utility class
- **Current Workaround**: Using `text-primary` in `formInputLabelRecipe`
- **Proposed Solution**: Add to semantic tokens as `color.text.label.primary`

### `text-accent-primary` (FIXED)
- **Location**: `src/lib/components/atoms/FormInput.svelte` (line 42)
- **Usage**: Required asterisk color
- **Status**: ~~Missing utility class~~ **FIXED** - Now using `text-brand` (design token utility)
- **Previous Workaround**: Was using Tailwind `text-accent-primary` (didn't exist)
- **Current Solution**: Using `text-brand` which maps to `brand-primary` (design token)

### `component-input-bg` Bug
- **Location**: `src/styles/utilities/color-utils.css` (line 265)
- **Issue**: Uses `color:` property instead of `background-color:`
- **Status**: Bug in token generation
- **Current Workaround**: Using `bg-base` (maps to same neutral-0 value, works correctly)
- **Proposed Solution**: Fix token generation to use correct CSS property

### `component-input-border` Bug
- **Location**: `src/styles/utilities/color-utils.css` (line 269)
- **Issue**: Uses `color:` property instead of `border-color:`
- **Status**: Bug in token generation
- **Current Workaround**: Using `border-strong` (maps to same neutral-300 value, works correctly)
- **Proposed Solution**: Fix token generation to use correct CSS property

### Focus Ring Color Missing
- **Location**: `src/lib/design-system/recipes/formInput.recipe.ts`
- **Usage**: Focus ring color for form inputs
- **Status**: Missing utility class (no `ring-*` utilities exist)
- **Current Workaround**: Removed focus ring, using only `focus:border-focus` for focus indication
- **Proposed Solution**: Add ring color utilities to design tokens or use border-only focus indication

## Button Padding Utilities

### `px-button-sm` (Small Button Horizontal Padding)
- **Location**: `src/lib/design-system/recipes/button.recipe.ts` (line 51)
- **Usage**: Horizontal padding for small buttons (8px). Currently using hardcoded `px-2`
- **Status**: Missing utility class
- **Current Workaround**: Using hardcoded `px-2` (8px) in button recipe
- **Proposed Solution**: Add to `design-tokens-semantic.json` as `spacing.button.sm.x` with value `{spacing.2}` (8px). Utility class will be auto-generated on next `npm run tokens:build`
- **Note**: Base token `spacing.2` (8px) already exists in `design-tokens-base.json`, just needs semantic mapping

### `p-button-icon`
- **Location**: `src/lib/components/atoms/Button.svelte` (line 56)
- **Usage**: Square padding for icon-only buttons (md/lg sizes). Should be 12px (`spacing.3`)
- **Status**: Missing utility class
- **Current Workaround**: Using `p-button-icon` directly (may not work until utility is added)
- **Proposed Solution**: Add to `design-tokens-semantic.json` as `spacing.button.icon` with value `{spacing.3}` (12px). Utility class will be auto-generated on next `npm run tokens:build`
- **Note**: Base token `spacing.3` (12px) already exists in `design-tokens-base.json`, just needs semantic mapping

### `p-nav-item`
- **Location**: `src/lib/components/atoms/Button.svelte` (line 55)
- **Usage**: Square padding for small icon-only buttons. Used in navigation contexts
- **Status**: Missing utility class
- **Current Workaround**: Using `p-nav-item` directly (may not work until utility is added)
- **Proposed Solution**: Add to `design-tokens-semantic.json` as `spacing.nav.item` with value `{spacing.2}` (8px). Utility class will be auto-generated on next `npm run tokens:build`
- **Note**: Base token `spacing.2` (8px) already exists in `design-tokens-base.json`, just needs semantic mapping

## Card Padding Utilities

### `px-card-compact` / `py-card-compact`
- **Location**: `src/lib/modules/inbox/components/InboxCard.svelte` (line 63)
- **Usage**: Compact padding for inbox cards (12px horizontal, 8px vertical) - smaller than regular card padding (32px)
- **Status**: Missing utility classes
- **Current Workaround**: Using inline CSS variables `padding-inline: var(--spacing-3); padding-block: var(--spacing-2)`
- **Proposed Solution**: Add to `design-tokens-semantic.json` as `spacing.card.compact.x` with value `{spacing.3}` (12px) and `spacing.card.compact.y` with value `{spacing.2}` (8px). Utility classes will be auto-generated on next `npm run tokens:build`
- **Note**: Base tokens `spacing.3` (12px) and `spacing.2` (8px) already exist in `design-tokens-base.json`, just need semantic mapping

## IconButton Utilities

### `opacity-disabled`
- **Location**: `src/lib/design-system/recipes/iconButton.recipe.ts` (lines 21, 24), `src/lib/design-system/recipes/button.recipe.ts` (lines 33, 35, 37)
- **Usage**: Disabled state opacity for buttons (typically 50% opacity)
- **Status**: Missing utility class
- **Current Workaround**: Using `disabled:opacity-disabled` in recipes (matches button recipe pattern for consistency)
- **Proposed Solution**: Add to `design-tokens-semantic.json` as `opacity.disabled` with value `0.5` (50%). Utility class will be auto-generated on next `npm run tokens:build`
- **Note**: Currently using same pattern as button recipe. If this doesn't work, may need to use `disabled:opacity-50` (Tailwind default) as fallback

### `size-icon-xl`
- **Location**: `src/lib/components/atoms/IconButton.svelte` (line 30)
- **Usage**: Extra large icon size (32px) for icon buttons. Currently using `size-icon-lg` (24px) as closest available semantic token
- **Status**: Missing utility class
- **Current Workaround**: Using `size-icon-lg` (24px) instead of `size-icon-xl` (32px)
- **Proposed Solution**: Add to `design-tokens-semantic.json` as `spacing.icon.xl` with value `{spacing.8}` (32px). Utility class will be auto-generated on next `npm run tokens:build`
- **Note**: Base token `spacing.8` (32px) already exists in `design-tokens-base.json`, just needs semantic mapping. Original component used `icon-xl` class (legacy)

## Sidebar Badge Colors

### `bg-sidebar-badge` / `text-sidebar-badge`
- **Location**: `src/lib/components/molecules/SidebarMenuItem.svelte` (lines 33-36), `src/lib/modules/core/components/Sidebar.svelte` (multiple locations)
- **Usage**: Badge background and text colors for sidebar navigation items (count badges)
- **Status**: Missing utility classes
- **Current Workaround**: Using hardcoded Tailwind classes `bg-sidebar-badge` and `text-sidebar-badge` directly
- **Proposed Solution**: Add to `design-tokens-semantic.json` as `color.component.sidebar.badge.bg` and `color.component.sidebar.badge.text` with appropriate light/dark values. Utility classes will be auto-generated on next `npm run tokens:build`
- **Note**: These should match the sidebar badge styling used throughout the Sidebar component. Currently using arbitrary Tailwind values that may not exist.

## Component Background Utilities Missing

### `bg-component-sidebar-itemHover` (FIXED ✅)
- **Location**: `src/lib/components/molecules/WorkspaceSelector.svelte` (lines 26-30, 51-57)
- **Usage**: Background color for sidebar variant avatar and skeleton loading states
- **Status**: ✅ **FIXED** on 2025-11-26 - Using CSS variable `var(--color-component-sidebar-itemHover)` directly
- **Issue**: Component colors (`color.component.sidebar.itemHover`) don't generate `bg-*` utilities automatically. The transform only generates utilities for `text-*`, `bg-*`, `border-*`, `interactive-*`, `accent-*`, `brand-*`, and `status-*` prefixes, but NOT `component-*` prefixes.
- **Solution Applied**: Use CSS variables directly: `style="background-color: var(--color-component-sidebar-itemHover);"`
- **Why Tests Didn't Catch**: `validate:tokens` only checks for hardcoded Tailwind patterns (like `gap-2`, `text-gray-500`). It doesn't verify that utility classes actually exist in the generated utilities. The pattern `/\bbg-(interactive|status|component|hover)-\w+\b/` allows `bg-component-*` classes, but doesn't verify they exist.
- **Note**: This affects all component colors. Consider adding validation to check if utility classes actually exist, or document that component colors must use CSS variables directly.

### `bg-accent-primary` (WIDESPREAD ISSUE ⚠️)
- **Location**: Multiple files (Avatar.svelte, Chip.svelte, ToggleSwitch.svelte, ColorCascade.svelte, SplitButton.svelte, and many Storybook stories)
- **Usage**: Primary accent background color for avatars, chips, toggles, and other components
- **Status**: **MISSING** - Used in 40+ locations but utility doesn't exist
- **Current Workaround**: Components use `bg-accent-primary` but it doesn't exist in generated utilities
- **Proposed Solution**: 
  1. Add `color.accent.primary` to `design-tokens-semantic.json` (or use existing `color.interactive.primary`)
  2. OR replace all usages with `bg-interactive-primary` (which exists)
  3. Run `npm run tokens:build` to generate utility
- **Why Tests Didn't Catch**: Same as above - `validate:tokens` doesn't verify utilities exist, only checks for hardcoded Tailwind patterns. `bg-accent-primary` doesn't match hardcoded patterns, so it passes validation even though it doesn't exist.
- **Impact**: HIGH - Used in many core components (Avatar, Chip, ToggleSwitch, etc.)

## Validation Gap: Non-Existent Utilities Not Caught

### Problem
The `validate:tokens` script only checks for:
1. **Hardcoded Tailwind patterns** (like `gap-2`, `text-gray-500`) - ✅ Catches these
2. **Allowed patterns** (like `bg-interactive-primary`) - ✅ Allows these

**But it does NOT verify that utility classes actually exist** in the generated utilities files.

### Examples of Missed Issues
1. **`bg-component-sidebar-itemHover`** - Matches allowed pattern `/\bbg-(interactive|status|component|hover)-\w+\b/` but utility doesn't exist
2. **`bg-accent-primary`** - Doesn't match hardcoded patterns, so passes validation, but utility doesn't exist
3. **Any custom utility class** - If it doesn't match hardcoded patterns, it passes validation even if it doesn't exist

### Why This Happens
The validation script (`scripts/validate-design-tokens.js`) uses regex patterns to allow/disallow classes, but doesn't:
- Read the generated utility files (`src/styles/utilities/*.css`)
- Verify that `@utility` declarations exist for each class
- Check if CSS variables referenced by utilities exist

### Proposed Solution
Add a new validation step that:
1. Reads all generated utility files
2. Extracts all `@utility` declarations
3. Checks that every utility class used in components actually exists
4. Reports missing utilities as errors

**Example Implementation**:
```javascript
// New function: validateUtilitiesExist()
// 1. Parse all @utility declarations from src/styles/utilities/*.css
// 2. Extract class names from component files
// 3. Check if each class has a corresponding @utility declaration
// 4. Report missing utilities
```

**Alternative**: Add this check to `npm run recipes:validate` or create `npm run validate:utilities`

## Avatar Image Border Radius

### `rounded-full` (EXCEPTION - SYOS-585)
- **Location**: `src/lib/components/molecules/WorkspaceSelector.svelte` (line 42)
- **Usage**: Avatar image border radius for perfect circle shape
- **Status**: Documented exception - matches Avatar component pattern
- **Current Workaround**: Using `rounded-full` (9999px) for avatar images
- **Note**: This is a documented design system exception (SYOS-585). Avatar components use `rounded-full` for perfect circle shape. See `src/lib/components/atoms/Avatar.svelte` for reference.


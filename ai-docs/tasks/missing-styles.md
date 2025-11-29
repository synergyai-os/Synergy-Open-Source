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

## AttendeeSelector Component Workarounds

### `text-sm` Typography Utility

- **Location**: `src/lib/modules/meetings/components/AttendeeSelector.svelte` (lines 40, 69, 93, 122, 137, 173)
- **Usage**: Form input and button text sizing in Bits UI components
- **Status**: Using valid generated utility but flagged by validation script
- **Current Workaround**: Using `text-sm` directly on form elements
- **Proposed Solution**: Validation script should allow `text-*` utilities since they are generated from design tokens
- **Note**: Bits UI components require manual text sizing; Text component not suitable for input/button elements

### `z-50` Z-Index Utility

- **Location**: `src/lib/modules/meetings/components/AttendeeSelector.svelte` (line 107)
- **Usage**: Dropdown overlay positioning above other content
- **Status**: No semantic z-index tokens exist in design system
- **Current Workaround**: Using `z-50` for combobox dropdown layering
- **Proposed Solution**: Add semantic z-index tokens like `z-dropdown`, `z-modal`, `z-tooltip` to design system
- **Note**: Layout primitive for component layering; common pattern across UI libraries

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

## Scroll Area Utilities

### Scrollbar Width (No Semantic Token)

- **Location**: `src/lib/modules/core/workspaces/components/OrganizationSwitcher.svelte` (line 241)
- **Usage**: Scrollbar width for bits-ui ScrollArea component
- **Status**: No semantic token exists for scrollbar-specific widths
- **Current Workaround**: Using inline style `style="width: 0.5rem;"` (8px)
- **Proposed Solution**: Could add `spacing.scrollbar.width` to semantic tokens if this pattern is reused
- **Note**: Scrollbar widths are component-specific and may vary. Using inline style is acceptable for one-off cases.

## Page Header Padding Tokens

### `px-page-header` / `py-page-header` (Page Header Padding)

- **Location**: `src/lib/components/molecules/PageHeader.svelte` (line 49)
- **Usage**: Horizontal and vertical padding for page headers (sticky headers with title + divider pattern)
- **Status**: Missing utility classes
- **Current Workaround**: Using inline CSS variables `padding-inline: var(--spacing-4); padding-block: var(--spacing-2);` (16px horizontal, 8px vertical)
- **Proposed Solution**: Add to `design-tokens-semantic.json` as `spacing.pageHeader.x` with value `{spacing.4}` (16px) and `spacing.pageHeader.y` with value `{spacing.2}` (8px). Utility classes will be auto-generated on next `npm run tokens:build`
- **Note**: Base tokens `spacing.4` (16px) and `spacing.2` (8px) already exist in `design-tokens-base.json`, just need semantic mapping. This pattern is used consistently across page headers (Inbox, Meetings, etc.) with fixed height of 2.5rem (40px). Now centralized in `PageHeader` component.

### `text-small` (Small Text Utility)

- **Location**: `src/lib/components/molecules/PageHeader.svelte` (line 62)
- **Usage**: Small text size for page header titles (14px)
- **Status**: Missing utility class (but resolved via Text component)
- **Current Workaround**: Using Text component with `variant="label" size="sm"` (recommended approach)
- **Proposed Solution**: Use existing `text-sm` utility or Text component. `text-small` is not a standard utility name - should use `text-sm` or Text component for consistency.
- **Note**: `text-sm` utility exists and maps to 14px. For semantic consistency, use Text component with `variant="label" size="sm"` instead of raw utility classes. PageHeader component now uses Text component by default.

### Z-Index Utilities (`z-dropdown`, `z-sticky`, etc.)

- **Location**: `src/lib/components/molecules/PageHeader.svelte` (line 50)
- **Usage**: Z-index values for layering (sticky headers, dropdowns, modals)
- **Status**: Missing utility classes
- **Current Workaround**: Using CSS variables `style="z-index: var(--zIndex-dropdown);"` (for z-10) or `style="z-index: var(--zIndex-sticky);"` (for z-20)
- **Proposed Solution**: Add z-index utilities to design tokens. Z-index tokens exist in `design-tokens-base.json` (`zIndex.dropdown` = 10, `zIndex.sticky` = 20, etc.) but don't generate utilities. Could add utilities like `z-dropdown`, `z-sticky`, `z-modal`, etc. OR document that z-index should use CSS variables directly.
- **Note**: Z-index tokens exist but utilities don't. Using CSS variables is acceptable workaround. Alternatively, could add z-index utilities to `transforms.js` if pattern becomes common. Now centralized in `PageHeader` component.

## Meeting Card Row Padding

### `py-card-row` / `py-card` (Card Row Vertical Padding)

- **Location**: `src/lib/modules/meetings/components/MeetingCard.svelte` (lines 98, 148)
- **Usage**: Vertical padding for meeting card rows in list view (32px - same as card padding)
- **Status**: Missing utility classes
- **Current Workaround**: Using inline CSS variable `style="padding-block: var(--spacing-card-padding);"` (32px)
- **Proposed Solution**: Add to `design-tokens-semantic.json` as `spacing.card.row.y` with value `{spacing.card.padding}` (32px). Utility class will be auto-generated on next `npm run tokens:build`
- **Note**: Base token `spacing.card.padding` (32px) already exists, just needs semantic mapping for row context. Alternatively, could reuse `spacing.card.padding` directly if row padding should match card padding.

### Date Badge Width/Padding

- **Location**: `src/lib/modules/meetings/components/MeetingCard.svelte` (line 90)
- **Usage**: Fixed width (80px) and top padding (12px) for date badge in meeting card
- **Status**: Missing utility classes
- **Current Workaround**: Using inline CSS variables `style="width: var(--spacing-20); padding-top: var(--spacing-3);"`
- **Proposed Solution**: Add to `design-tokens-semantic.json` as `spacing.meetingCard.dateBadge.width` with value `{spacing.20}` (80px) and `spacing.meetingCard.dateBadge.paddingTop` with value `{spacing.3}` (12px). Utility classes will be auto-generated on next `npm run tokens:build`
- **Note**: Base tokens `spacing.20` (80px) and `spacing.3` (12px) already exist, just need semantic mapping for meeting card context.

## Acceptable Exceptions (CreateMeetingModal Refactoring)

### Z-Index Values (`z-40`, `z-50`)

- **Location**: `CreateMeetingModal.svelte` Dialog overlay and content
- **Usage**: Layout/layering concerns, not design tokens
- **Status**: Acceptable - z-index values are framework/layout concerns
- **Pattern**: Overlay uses `z-40`, modal content uses `z-50` (matches Dialog.stories pattern)
- **Note**: Z-index tokens exist in design-tokens-base.json but don't generate utilities. These are layout concerns, not design tokens.

### Bits UI Animation Classes (`data-[state=*]:slide-*`, `data-[state=*]:animate-*`)

- **Location**: `CreateMeetingModal.svelte` Dialog components using Bits UI
- **Usage**: Framework-specific animation data attributes
- **Status**: Acceptable - Bits UI framework classes, not design tokens
- **Pattern**: `data-[state=open]:animate-in`, `data-[state=closed]:slide-out-to-left-1/2`, etc.
- **Note**: These are Bits UI framework classes for animations. Not design tokens, acceptable to use.

### FormSelect Gap Override (`[&>div]:gap-0`)

- **Location**: `CreateMeetingModal.svelte` line 211
- **Usage**: Remove FormSelect wrapper gap when used inline without label
- **Status**: Workaround - acceptable for inline usage
- **Current Workaround**: `class="flex-1 [&>div]:gap-0"` removes gap when FormSelect is inline
- **Proposed Solution**: Add `noLabel` prop to FormSelect to conditionally remove gap
- **Note**: FormSelect always adds `gap-form-field-gap` wrapper, but inline usage doesn't need it.

### Dropdown Menu Padding (`py-1`, `p-1`)

- **Location**: `FormSelect.svelte` (lines 93, 96), `ActionMenu.svelte`, `SplitButton.svelte`
- **Usage**: Minimal padding for dropdown menu containers (4px)
- **Status**: Acceptable exception (common pattern across dropdown menus)
- **Current Workaround**: Using `py-1` (4px vertical padding) for Select.Content, `p-1` (4px padding) for Select.Viewport
- **Note**: These are minimal padding values used consistently across all dropdown menus. Base token `spacing.1` (4px) exists but doesn't have semantic mapping for dropdown menus. This is a layout concern, not a design token.
- **Pattern**: All dropdown menus use `py-1` for content padding and `p-1` for viewport padding

### Bits UI Disabled State Opacity (`data-disabled:opacity-50`)

- **Location**: `FormSelect.svelte` (line 102)
- **Usage**: Disabled state opacity for Bits UI Select items
- **Status**: Acceptable exception (framework-specific data attribute)
- **Current Workaround**: Using `data-disabled:opacity-50` (Bits UI data attribute)
- **Note**: This is a Bits UI framework-specific data attribute for disabled states. Not a design token, acceptable to use.

## Toggle Switch Background Utilities

### `bg-component-toggle-off` / `bg-component-toggle-on`

- **Location**: `src/lib/components/molecules/ToggleSwitch.svelte` (line 30)
- **Usage**: Background colors for toggle switch on/off states
- **Status**: Missing utility classes
- **Current Workaround**: Using inline CSS variables `style="background-color: var(--color-component-toggle-off);"` and `style="background-color: var(--color-component-toggle-on);"`
- **Proposed Solution**:
  1. Update `scripts/style-dictionary/transforms.js` to generate `bg-*` utilities for `color.component.*` tokens
  2. OR add `color.toggle.off` and `color.toggle.on` to semantic tokens (outside component namespace) to generate utilities automatically
  3. Run `npm run tokens:build` to generate utilities
- **Note**: CSS variables `--color-component-toggle-off` and `--color-component-toggle-on` exist, but background utilities don't. The transform logic only generates utilities for `text-*`, `bg-*`, `border-*`, `interactive-*`, `accent-*`, `brand-*`, and `status-*` prefixes, but NOT `component-*` prefixes. This is similar to the `bg-component-sidebar-itemHover` issue above.

## Border Width Utilities

### `border-l-2` (2px left)

- **Location**: `src/lib/modules/meetings/components/RecurrenceField.svelte` (line 86)
- **Usage**: Left border for visual emphasis on nested recurrence section (2px width)
- **Status**: Missing semantic token for border width
- **Current Workaround**: Using `border-l-2` (Tailwind default - 2px border width)
- **Proposed Solution**: Add `borderWidth` to semantic tokens (e.g., `borderWidth.emphasized: 2px`) or document as acceptable layout primitive
- **Note**: Border width is a structural concern (2px vs 1px vs 4px), not a design token. Similar to how `border-l-4` is used elsewhere for emphasis. Consider documenting border widths as acceptable layout primitives.

## Button Height Alignment with AttendeeChip

### `text-sm` and `font-normal` Overrides (Button Height Alignment)

- **Location**: `src/lib/modules/meetings/components/AttendeeSelector.svelte` (line 93)
- **Usage**: Override button's `text-label` and `font-medium` to match AttendeeChip height exactly
- **Status**: Workaround - Both are standard Tailwind classes but flagged by validator
- **Current Workaround**: Using `class="px-button text-sm font-normal"` to match chip's Text component styling
- **Why Needed**:
  1. **Line-height mismatch**: Button recipe's `size="sm"` includes `text-label` which has `line-height: 1.0` (none), while chip's Text component uses `text-sm` with `line-height: 1.5` (normal). This causes height misalignment.
  2. **Font-weight mismatch**: Button recipe uses `font-medium` (500), while chip's Text component uses `font-normal` (400) default. This also affects visual height.
  3. Both components use `py-button-sm` (2px vertical padding), but typography differences cause misalignment.
- **Proposed Solution**:
  1. Add `fontWeight` variant to button recipe (e.g., `normal`, `medium`, `semibold`)
  2. Add `lineHeight` variant to button recipe or remove `text-label` from `size="sm"`
  3. OR create chip-specific button variant that matches chip styling exactly
  4. OR document `text-sm` and `font-normal` as allowed layout primitives
- **Note**:
  - `text-sm` is actually a generated utility from design tokens (should be allowed)
  - `font-normal` is standard Tailwind class (should be allowed like `font-medium`, `font-semibold`)
  - Validator may be too strict - these are necessary to match chip's exact styling

## Status Color Text and Border Utilities

### `text-status-info`, `text-status-warning`, `text-status-success`

- **Location**: `src/lib/components/molecules/InfoCard.svelte` (lines 23-34)
- **Usage**: Text color for InfoCard variants (info, warning, success)
- **Status**: Missing utility classes
- **Current Workaround**: Using CSS variables directly (`var(--color-status-infoDark)`, etc.)
- **Proposed Solution**: Add `text-status-*` utilities to transforms.js OR add semantic tokens `color.text.status.info`, `color.text.status.warning`, `color.text.status.success` to `design-tokens-semantic.json`
- **Note**: Base status colors (`--color-status-info`, `--color-status-infoDark`, etc.) exist, but text utilities don't. Similar to how `--color-text-success` exists but `text-status-success` utility doesn't.

### `border-status-info`, `border-status-warning`, `border-status-success`

- **Location**: `src/lib/components/molecules/InfoCard.svelte` (lines 36-47)
- **Usage**: Border color for InfoCard variants (info, warning, success)
- **Status**: Missing utility classes
- **Current Workaround**: Using CSS variables directly (`var(--color-status-info)`, etc.)
- **Proposed Solution**: Add `border-status-*` utilities to transforms.js OR add semantic tokens `color.border.status.info`, `color.border.status.warning`, `color.border.status.success` to `design-tokens-semantic.json`
- **Note**: Base status colors exist, but border utilities don't. Similar to how `--color-border-error` exists but `border-status-error` utility doesn't.

## Follow-up Tasks

- [ ] Add `spacing.card.row.y` to `design-tokens-semantic.json`
- [ ] Add `spacing.meetingCard.dateBadge.width` and `spacing.meetingCard.dateBadge.paddingTop` to `design-tokens-semantic.json`
- [ ] Run `npm run tokens:build` to generate utilities
- [ ] Remove workarounds from `src/lib/modules/meetings/components/MeetingCard.svelte`
- [ ] Add "more" icon (three dots vertical) to icon registry
- [ ] Consider adding `noLabel` prop to FormSelect to handle inline usage without gap
- [ ] Fix toggle switch background utilities: Update transforms.js to generate `bg-component-toggle-off/on` OR move toggle colors outside component namespace
- [ ] Consider adding `fontWeight` variant to button recipe or documenting `font-normal` as allowed layout primitive
- [ ] Add `text-status-*` and `border-status-*` utilities for InfoCard component (or add semantic tokens and update transforms.js)

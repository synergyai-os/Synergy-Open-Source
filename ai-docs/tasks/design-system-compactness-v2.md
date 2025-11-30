# Design System Compactness Overhaul v2

**Goal**: Make the entire design system match DateInput's compact, tidy appearance as the default for medium-sized components. Linear/Notion-inspired density.

**Date**: 2025-01-29

**Philosophy**: `md` = default = compact (what DateInput currently is)

---

## 🎯 Success Criteria

After this work is complete:

1. ✅ Changing a value in `design-tokens-base.json` → `npm run tokens:build` → entire app updates
2. ✅ All inputs (FormInput, TimeInput, DateInput, Select) have consistent compact appearance
3. ✅ Toggle switches are proportional (not oversized)
4. ✅ Section spacing is tight but breathable (Linear-like)
5. ✅ No broken utilities (all used classes actually exist)

---

## 📊 Current State vs Target

### Input Components

| Property  | Current            | Target (DateInput)   | Change   |
| --------- | ------------------ | -------------------- | -------- |
| Font size | 14px (`text-base`) | 12px (`text-sm`)     | -14%     |
| Padding X | 16px (`spacing.4`) | 14px (`spacing.3.5`) | -12%     |
| Padding Y | 12px (`spacing.3`) | 8px (`spacing.2`)    | **-33%** |

### Toggle Switch

| Property | Current | Target | Change |
| -------- | ------- | ------ | ------ |
| Height   | 24px    | 20px   | -17%   |
| Width    | 44px    | 36px   | -18%   |
| Thumb    | 16px    | 12px   | -25%   |

### Section Spacing (Key Issue!)

| Token                    | Current | Target | Usage                       |
| ------------------------ | ------- | ------ | --------------------------- |
| `spacing.header.mb`      | 32px    | 12px   | Section title → content gap |
| `spacing.section.gap`    | 32px    | 24px   | Between major sections      |
| `spacing.fieldGroup.gap` | 8px     | 6px    | Tight element groups        |

---

## ✅ Implementation Checklist

### Phase 0: Fix Utility Generation Bugs (PREREQUISITE) ✅ COMPLETED

These MUST be fixed first or the cascade won't work.

- [x] **Fix `bg-accent-primary`** - Used in 91+ places, utility didn't exist
  - **Solution**: Added `color.accent.primary`, `color.accent.hover`, `color.accent.active` to semantic tokens
  - Also added `color.text.accent.primary` and `color.border.accent.primary`
  - All point to brand colors for consistency
  - Utilities now generated: `bg-accent-primary`, `bg-accent-hover`, `bg-accent-active`, `text-accent-primary`, `border-accent-primary`
- [x] **`bg-component-*` utilities** - Documented as intentional pattern
  - CSS variables exist (`--color-component-toggle-on`, etc.)
  - Component colors should use CSS variables directly: `style="background-color: var(--color-component-toggle-on);"`
  - This is the correct pattern for component-specific colors
- [x] **Run validation after fixes**
  ```bash
  npm run tokens:build  # ✅ Builds successfully
  # Accent utilities now generate correctly
  ```

### Phase 1: Base Token Updates ✅ COMPLETED

- [x] **Add toggle switch sizing to `design-tokens-base.json`**
  - Added `sizing.toggle.height` = 1.25rem (20px)
  - Added `sizing.toggle.width` = 2.25rem (36px)
  - Added `sizing.toggle.thumb` = 0.75rem (12px)
  - Fixed `style-dictionary.config.js` to filter for `sizing` (was `size`)
  - CSS variables now generated: `--sizing-toggle-height`, `--sizing-toggle-width`, `--sizing-toggle-thumb`

### Phase 2: Semantic Token Updates ✅ COMPLETED

- [x] **Update input padding** in `design-tokens-semantic.json`
  - `spacing.input.x`: `{spacing.4}` → `{spacing.3.5}` (16px → 14px)
  - `spacing.input.y`: `{spacing.3}` → `{spacing.2}` (12px → 8px)
- [x] **Update section spacing** in `design-tokens-semantic.json`
  - `spacing.header.mb`: `{spacing.8}` → `{spacing.3}` (32px → 12px)
  - `spacing.section.gap`: `{spacing.8}` → `{spacing.6}` (32px → 24px)
- [x] **Toggle sizing semantic tokens** - NOT NEEDED
  - Base tokens `sizing.toggle.*` are sufficient (already well-named)
  - Components will reference `var(--sizing-toggle-height)` directly
  - Semantic aliases would overwrite base tokens (same path collision)

- [x] **Run tokens:build** - All tokens generated successfully

### Phase 3: Recipe Audit & Updates ✅ COMPLETED

**Full audit of 27 recipes** - improvements made for consistency and DRY!

- [x] **formInputRecipe** - Enhanced with size variants (sm/md/lg)
  - `sm`: Extra compact (10px×6px, 11px text) for dense UIs
  - `md`: Default compact (14px×8px, 12px text) - Linear-inspired
  - `lg`: Generous (16px×12px, 14px text) for touch/accessibility
- [x] **comboboxTriggerRecipe** - Now extends formInputRecipe (DRY fix!)
- [x] **comboboxInputRecipe** - Now extends formInputRecipe (DRY fix!)
  - Both now correctly inherit text-sm and size variants
- [x] **dateInputRecipe** - Cleaned up redundant overrides
- [x] **timeInputRecipe, durationInputRecipe** - Extend formInputRecipe, inherit all variants ✅
- [x] **All other recipes** - Already using semantic tokens correctly

### Phase 4: Component Updates ✅ COMPLETED

- [x] **Update ToggleSwitch.svelte**
  - Now uses `var(--sizing-toggle-height)` (20px, was 24px)
  - Now uses `var(--sizing-toggle-width)` (36px, was 44px)
  - Now uses `var(--sizing-toggle-thumb)` (12px, was 16px)
  - Thumb transform calculated dynamically from tokens

- [x] **Button & Card tokens updated** (added to Phase 3)
  - `spacing.button.x`: 20px → 16px
  - `spacing.button.y`: 10px → 8px
  - `spacing.button.icon`: 12px → 10px
  - `spacing.card.padding`: 32px → 24px
  - `spacing.card.gap`: 20px → 16px

### Phase 5: Fix Spacing Inconsistencies ✅ COMPLETED

- [x] **Added `mb-section` token** to `design-tokens-semantic.json`
  - `spacing.section.mb` = 24px (for margin between major sections)
  - Utility `mb-section` now generated

- [x] **Fixed meetings page - double mb-header**
  - Changed outer wrapper from `mb-header` to `mb-section` (24px between sections)
  - Inner heading row keeps `mb-header` (12px header-to-content gap)
  - Fixed both "Today" and "This Week" sections

- [ ] **Audit other pages for spacing issues**
  - Inbox page
  - Dashboard page
  - Settings pages

### Phase 6: Validation & Testing ✅ COMPLETED

- [x] **Token cascade verified working**
  - `--spacing-input-x/y`: 14px/8px (was 16px/12px) ✅
  - `--spacing-header-mb`: 12px (was 32px) ✅
  - `--spacing-section-gap/mb`: 24px (was 32px) ✅
  - `--sizing-toggle-*`: 20px/36px/12px ✅

- [x] **All utilities generated correctly**
  - `px-input`, `py-input`, `mb-header`, `mb-section`, `gap-section`
  - `px-button`, `py-button` (now compact)

- [x] **Pre-existing issues (out of scope)**
  - 1636 hardcoded Tailwind classes (pre-existing tech debt)

### Phase 7: Documentation Updates ✅ COMPLETED

- [x] **Updated `design-system.md`**
  - Section 9.1: Updated spacing philosophy from "generous" to "compact-first"
  - Section 9.2: Updated token values to match new compact values
  - Section 6.4: Added new section on formInputRecipe size variants
  - Updated "Last Updated" date to 2025-01-29

---

## Phase 8: Full Bloat Audit ✅ COMPLETED

Additional compactness fixes after comprehensive codebase audit:

### Token Updates

| Token                        | Before | After    |
| ---------------------------- | ------ | -------- |
| `spacing.form.gap`           | 20px   | **12px** |
| `spacing.form.sectionGap`    | 24px   | **16px** |
| `spacing.content.gap`        | 16px   | **12px** |
| `spacing.content.sectionGap` | 32px   | **24px** |
| `spacing.page.x`             | 32px   | **24px** |
| `spacing.page.y`             | 48px   | **32px** |

### Component Updates

- **Stepper.svelte**: Default size `xl` (32px) → `lg` (24px)
- **CreateMeetingModal.svelte**:
  - `rounded-dialog` → `rounded-modal`
  - `p-modal` → `card-padding`
  - `p-form` → `inset-md`
  - Removed redundant inner card-padding

- [ ] **Archive/close items in `missing-styles.md`**
  - Mark fixed items as resolved
  - Remove duplicates

---

## ⚠️ Risk Mitigation

### If inputs feel too tight:

- Add size variants to formInputRecipe (sm, md, lg)
- `md` = compact default, `lg` = current "generous" style

### If toggle is hard to click on mobile:

- Keep current dimensions but document for future iteration
- Mobile touch targets should be >= 44px

### If cascade breaks:

- Revert token changes
- Document what broke and why
- Fix generation issues before retrying

---

## 📝 Notes

### Why `mb-header` is 32px

Looking at the semantic tokens, `spacing.header.mb` = `{spacing.8}` = 32px.
This was set for "premium, generous" spacing but is too much for Linear-like density.

### Linear's actual spacing

From screenshots, Linear uses approximately:

- Section title → content: 8-12px
- Between sections: 24-32px
- Between form fields: 16-20px
- Input vertical padding: 6-8px

### The "md = default" philosophy

- `sm` = Dense mode (data tables, compact lists)
- `md` = Default mode (what DateInput currently is)
- `lg` = Spacious mode (hero sections, marketing)

---

## 🔗 Related Documents

- `ai-docs/tasks/missing-styles.md` - Utility generation bugs to fix
- `dev-docs/master-docs/design-system.md` - Source of truth (needs updating after)
- `.cursor/commands/match-design-system.md` - Component migration guide

---

**Last Updated**: 2025-01-29

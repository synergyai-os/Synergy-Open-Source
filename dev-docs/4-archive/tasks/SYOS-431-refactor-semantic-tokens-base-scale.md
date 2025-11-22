# Refactor Semantic Tokens to Reference Base Scale

**Linear Ticket**: [SYOS-431](https://linear.app/younghumanclub/issue/SYOS-431)

**Goal**: Refactor all semantic spacing tokens in `src/styles/tokens/spacing.css` to reference the base scale (`var(--spacing-*)`) instead of using hardcoded rem values. Ensure consistent cascade behavior and single source of truth for spacing values.

---

## Problem Analysis

**Current State**:

The design system has a 3-tier token architecture:

1. **Base Scale (Tier 1)**: Defined in `spacing.css` lines 17-32 (`--spacing-0` through `--spacing-32`)
2. **Semantic Tokens (Tier 2)**: Component-specific tokens (e.g., `--spacing-button-x`, `--spacing-nav-item-y`)
3. **Utility Classes (Tier 3)**: CSS utilities that reference semantic tokens (e.g., `px-button-x`)

**Pain Points**:

- **Most semantic tokens use hardcoded values** instead of referencing base scale:
  - Example: `--spacing-nav-item-x: 0.5rem;` should be `var(--spacing-2)`
  - Example: `--spacing-button-y: 0.75rem;` should be `var(--spacing-3)`
- **Inconsistent pattern**: New components (Chips) use correct pattern, legacy tokens don't
- **Violates single source of truth**: Changing base scale values won't cascade to semantic tokens
- **Harder to maintain**: Can't see relationships between tokens (which semantic tokens share same base value?)

**User Impact**:

- Design system governance incomplete - tokens don't fully cascade
- Future token updates require manual changes across multiple files
- No visual way to see token relationships and consistency
- Harder for new developers to understand token hierarchy

**Investigation**:

- ✅ Reviewed `src/styles/tokens/spacing.css` (182 lines total)
- ✅ Checked base scale implementation (lines 17-32) - CORRECT
- ✅ Checked semantic tokens (lines 39-165) - **80+ tokens use hardcoded values**
- ✅ Found correct pattern examples:
  - `--spacing-button-x: var(--spacing-6)` (line 91-93) - ✅ CORRECT
  - `--spacing-chip-x: var(--spacing-2)` (line 152) - ✅ CORRECT
  - `--spacing-chip-gap: var(--spacing-1)` (line 154) - ✅ CORRECT
- ✅ Validated against `design-system.json` (lines 95-119) - base scale matches spec

---

## Approach Options

### Approach A: Automated Script Migration

**How it works**: Write Node.js script to parse `spacing.css`, detect hardcoded values matching base scale, replace with `var(--spacing-*)` references.

**Pros**:

- Fast (~5 minutes to run)
- Consistent formatting
- Can generate report of changes
- Reusable for future migrations

**Cons**:

- Risk of over-replacement (might replace intentional hardcoded values)
- Script complexity (needs CSS parsing)
- Still requires manual validation of output
- Won't catch non-standard values (e.g., `0.375rem` = 6px, not in base scale)

**Complexity**: Medium

**Dependencies**: Node.js, CSS parser library

---

### Approach B: Manual Refactoring with Validation

**How it works**: Manually review each semantic token, map to base scale, replace with `var()` reference, test cascade behavior.

**Pros**:

- Full control over each change
- Can document intentional exceptions (e.g., `0.125rem` for Chip padding)
- Opportunity to audit token naming and values
- No risk of automated over-replacement

**Cons**:

- Time-consuming (~80+ tokens to review)
- Human error risk (typos, missed tokens)
- Tedious repetitive work
- Harder to ensure consistency

**Complexity**: Low

**Dependencies**: None

---

### Approach C: Hybrid - Script + Manual Review

**How it works**: Generate mapping report (script identifies candidates), manually review and apply changes, verify with cascade test.

**Pros**:

- Best of both worlds: speed + control
- Script generates clear report for review
- Human validates each change before applying
- Catches edge cases (non-standard values)

**Cons**:

- Two-step process (more overhead)
- Still requires script development
- Manual application step negates some automation benefits

**Complexity**: Medium

**Dependencies**: Node.js script for analysis

---

## Recommendation

**Selected**: Approach B (Manual Refactoring with Validation)

**Reasoning**:

1. **Token count manageable**: ~80 tokens across single file - manual review feasible
2. **Learning opportunity**: Audit token values, find inconsistencies, document exceptions
3. **No automation risk**: Human validates every change (no over-replacement)
4. **Simpler implementation**: No script development, can start immediately
5. **Better documentation**: Can add comments explaining exceptions during refactor

**Trade-offs accepted**:

- Time investment (~60-90 minutes for full refactor)
- Repetitive manual work

**Risk assessment**: **Low**

- Single file change (`spacing.css`)
- Existing cascade test validates no visual regressions
- ESLint + pre-commit hooks prevent violations
- Can revert easily if issues found

---

## Current State

**Existing Code**:

- `src/styles/tokens/spacing.css` (182 lines)
  - Lines 17-32: Base scale (✅ CORRECT - fully implemented)
  - Lines 39-165: Semantic tokens (❌ WRONG - hardcoded values)
  - Lines 152-155: Chip tokens (✅ CORRECT - use `var()` references)

**Dependencies**:

- None - pure CSS refactoring
- ESLint config (`eslint.config.js`) - validates no hardcoded Tailwind values (already configured)
- Husky pre-commit hook (`.husky/pre-commit`) - blocks violations (already configured)

**Patterns**:

- **Base scale structure**: `design-system.json` lines 95-107
- **Correct semantic token pattern**: Lines 152-154 in `spacing.css` (Chip component)
- **Cascade test pattern**: SYOS-387 (modify token, verify visual propagation)

**Constraints**:

- **Must maintain visual appearance**: Refactor should be value-neutral (0.5rem → var(--spacing-2) = same)
- **Must preserve intentional exceptions**: Some tokens use non-standard values for design reasons
- **Must document exceptions**: Add comments for any hardcoded values kept intentionally

---

## Design System Validation

**Source**: `design-system.json` (lines 95-119)
**Implementation**: `src/styles/tokens/spacing.css` (lines 17-32)

### Base Scale Validation

✅ **PASS**: Base scale matches spec

| Token                | Spec (design-system.json) | Implementation (spacing.css) | Status   |
| -------------------- | ------------------------- | ---------------------------- | -------- |
| `--spacing-1` (xs)   | 4px                       | 0.25rem (4px)                | ✅ Match |
| `--spacing-2` (sm)   | 8px                       | 0.5rem (8px)                 | ✅ Match |
| `--spacing-4` (md)   | 16px                      | 1rem (16px)                  | ✅ Match |
| `--spacing-6` (lg)   | 24px                      | 1.5rem (24px)                | ✅ Match |
| `--spacing-8` (xl)   | 32px                      | 2rem (32px)                  | ✅ Match |
| `--spacing-12` (2xl) | 48px                      | 3rem (48px)                  | ✅ Match |
| `--spacing-16` (3xl) | 64px                      | 4rem (64px)                  | ✅ Match |
| `--spacing-24` (4xl) | 96px                      | 6rem (96px)                  | ✅ Match |
| `--spacing-32` (5xl) | 128px                     | 8rem (128px)                 | ✅ Match |

### Semantic Token Validation (Sample)

❌ **FAIL**: Semantic tokens use hardcoded values instead of base scale references

| Token                       | Current Value    | Should Be                           | Ratio            |
| --------------------------- | ---------------- | ----------------------------------- | ---------------- |
| `--spacing-nav-item-x`      | `0.5rem` (8px)   | `var(--spacing-2)`                  | 8px = spacing-2  |
| `--spacing-nav-item-y`      | `0.375rem` (6px) | ⚠️ **Exception** (6px not in scale) | N/A              |
| `--spacing-section-y`       | `0.25rem` (4px)  | `var(--spacing-1)`                  | 4px = spacing-1  |
| `--spacing-badge-x`         | `0.375rem` (6px) | ⚠️ **Exception** (6px not in scale) | N/A              |
| `--spacing-header-x`        | `0.75rem` (12px) | `var(--spacing-3)`                  | 12px = spacing-3 |
| `--spacing-indent`          | `1.5rem` (24px)  | `var(--spacing-6)`                  | 24px = spacing-6 |
| `--spacing-inbox-container` | `1rem` (16px)    | `var(--spacing-4)`                  | 16px = spacing-4 |
| `--spacing-button-group`    | `0.5rem` (8px)   | `var(--spacing-2)`                  | 8px = spacing-2  |
| `--spacing-button-y`        | `0.75rem` (12px) | `var(--spacing-3)`                  | 12px = spacing-3 |

**Exceptions Found** (values not in base scale):

- `0.125rem` (2px) - Used for compact elements (badges, chips)
- `0.375rem` (6px) - Used for nav items, menu items
- `0.625rem` (10px) - Used for headers, inputs
- `0.875rem` (14px) - Used for marketing list spacing

**Recommendation**:

1. Map all standard values (4px, 8px, 12px, 16px, 24px, etc.) to base scale
2. Keep exceptions as hardcoded values with comments explaining why
3. Consider adding intermediate base scale values (spacing-1.5 = 6px, spacing-2.5 = 10px) in future

---

## Technical Requirements

**Files to Modify**:

- `src/styles/tokens/spacing.css` (refactor semantic tokens, lines 39-165)

**Refactoring Pattern**:

```css
/* BEFORE (hardcoded value) */
--spacing-nav-item-x: 0.5rem; /* 8px - px-2 equivalent */

/* AFTER (base scale reference) */
--spacing-nav-item-x: var(--spacing-2); /* 8px - references base scale */
```

**Exceptions Pattern** (for non-standard values):

```css
/* INTENTIONAL EXCEPTION: 6px not in base scale, optimal for compact nav items */
--spacing-nav-item-y: 0.375rem; /* 6px - py-1.5 equivalent */
```

**No Breaking Changes**:

- Visual appearance unchanged (values stay the same)
- Utility classes unaffected (reference semantic tokens correctly)
- No Svelte component changes needed

**Testing Requirements**:

- Visual cascade test (modify base scale value, verify semantic tokens update)
- ESLint validation (no new violations)
- Build validation (`npm run build`)
- Visual spot-checks on key pages (Inbox, Meetings, Settings)

---

## Success Criteria

**Functional**:

- ✅ All semantic tokens (where possible) reference base scale via `var(--spacing-*)`
- ✅ Intentional exceptions documented with comments
- ✅ Visual appearance unchanged (value-neutral refactor)
- ✅ Cascade behavior works (changing base scale updates semantic tokens)

**Performance**:

- ✅ No performance impact (CSS variable resolution is instant)
- ✅ Build time unchanged

**UX**:

- ✅ No visual regressions on any page
- ✅ Design tokens continue to work in light/dark mode

**Quality**:

- ✅ ESLint passes (`npm run lint`)
- ✅ Build succeeds (`npm run build`)
- ✅ Pre-commit hooks pass
- ✅ Documentation updated (add section explaining base scale references)

---

## Implementation Checklist

### Phase 1: Preparation (5 min)

- [ ] Read current `src/styles/tokens/spacing.css` (lines 17-165)
- [ ] Create mapping table: hardcoded value → base scale token
- [ ] Identify exceptions (values not in base scale: 2px, 6px, 10px, 14px)
- [ ] Document exception strategy (keep hardcoded with comments)

### Phase 2: Refactor Navigation/UI Tokens (10 min)

- [ ] Update `--spacing-nav-container-x` (0.5rem → var(--spacing-2))
- [ ] Update `--spacing-nav-container-y` (0.5rem → var(--spacing-2))
- [ ] Update `--spacing-nav-item-x` (0.5rem → var(--spacing-2))
- [ ] Keep `--spacing-nav-item-y` (0.375rem = 6px exception)
- [ ] Keep `--spacing-menu-item-x` (0.625rem = 10px exception)
- [ ] Keep `--spacing-menu-item-y` (0.375rem = 6px exception)
- [ ] Update `--spacing-section-x` (0.5rem → var(--spacing-2))
- [ ] Update `--spacing-section-y` (0.25rem → var(--spacing-1))
- [ ] Keep `--spacing-badge-x` (0.375rem = 6px exception)
- [ ] Keep `--spacing-badge-y` (0.125rem = 2px exception)
- [ ] Update `--spacing-header-x` (0.75rem → var(--spacing-3))
- [ ] Keep `--spacing-header-y` (0.625rem = 10px exception)
- [ ] Update `--spacing-icon-gap` (0.5rem → var(--spacing-2))
- [ ] Keep `--spacing-icon-gap-wide` (0.625rem = 10px exception)
- [ ] Update `--spacing-indent` (1.5rem → var(--spacing-6))

### Phase 3: Refactor System/Inbox Tokens (10 min)

- [ ] Update `--spacing-system-header-y` (0.75rem → var(--spacing-3))
- [ ] Update `--spacing-system-header-height` (4rem → var(--spacing-16))
- [ ] Update `--spacing-inbox-container` (1rem → var(--spacing-4))
- [ ] Update `--spacing-inbox-card-x` (0.75rem → var(--spacing-3))
- [ ] Update `--spacing-inbox-card-y` (0.75rem → var(--spacing-3))
- [ ] Update `--spacing-inbox-card-y-compact` (0.5rem → var(--spacing-2))
- [ ] Update `--spacing-inbox-list-gap` (0.5rem → var(--spacing-2))
- [ ] Update `--spacing-inbox-icon-gap` (0.5rem → var(--spacing-2))
- [ ] Update `--spacing-inbox-title-bottom` (1rem → var(--spacing-4))
- [ ] Update `--spacing-inbox-header-x` (1rem → var(--spacing-4))
- [ ] Update `--spacing-inbox-header-y` calc (0.25rem → var(--spacing-1))

### Phase 4: Refactor Settings/Modal/Form Tokens (10 min)

- [ ] Update `--spacing-settings-section-gap` (1.5rem → var(--spacing-6))
- [ ] Update `--spacing-settings-row-gap` (1rem → var(--spacing-4))
- [ ] Update `--spacing-settings-row-padding-x` (1rem → var(--spacing-4))
- [ ] Update `--spacing-settings-row-padding-y` (1rem → var(--spacing-4))
- [ ] Update `--spacing-modal-padding` (1.5rem → var(--spacing-6))
- [ ] Update `--spacing-form-field-gap` (0.5rem → var(--spacing-2))
- [ ] Update `--spacing-form-section-gap` (1rem → var(--spacing-4))
- [ ] Update `--spacing-input-x` (0.75rem → var(--spacing-3))
- [ ] Keep `--spacing-input-y` (0.625rem = 10px exception)

### Phase 5: Refactor Button/Content/Control Tokens (10 min)

- [ ] Update `--spacing-button-group` (0.5rem → var(--spacing-2))
- [ ] Verify `--spacing-button-x` (already var(--spacing-6)) ✅
- [ ] Update `--spacing-button-y` (0.75rem → var(--spacing-3))
- [ ] Update `--spacing-button-icon` (0.75rem → var(--spacing-3))
- [ ] Update `--spacing-content-padding` (1.5rem → var(--spacing-6))
- [ ] Update `--spacing-content-section` (1rem → var(--spacing-4))
- [ ] Update `--spacing-control-panel-padding` (0.75rem → var(--spacing-3))
- [ ] Update `--spacing-control-group-gap` (0.5rem → var(--spacing-2))
- [ ] Update `--spacing-control-item-gap` (0.25rem → var(--spacing-1))
- [ ] Update `--spacing-control-button-padding` (0.5rem → var(--spacing-2))
- [ ] Update `--spacing-control-divider` (0.5rem → var(--spacing-2))

### Phase 6: Refactor Marketing/Container Tokens (10 min)

- [ ] Update `--spacing-marketing-section-y` (7rem → var(--spacing-28))
- [ ] Update `--spacing-marketing-section-gap` (5rem → var(--spacing-20))
- [ ] Update `--spacing-marketing-container-x` (1.5rem → var(--spacing-6))
- [ ] Update `--spacing-marketing-title-to-lead` (1.5rem → var(--spacing-6))
- [ ] Update `--spacing-marketing-lead-to-content` (3rem → var(--spacing-12))
- [ ] Update `--spacing-marketing-card-padding` (2.5rem → var(--spacing-10))
- [ ] Update `--spacing-marketing-card-gap` (2rem → var(--spacing-8))
- [ ] Update `--spacing-marketing-element-gap` (1.5rem → var(--spacing-6))
- [ ] Update `--spacing-marketing-text-gap` (1rem → var(--spacing-4))
- [ ] Update `--spacing-marketing-hero-y` (5rem → var(--spacing-20))
- [ ] Update `--spacing-marketing-hero-bottom` (8rem → var(--spacing-32))
- [ ] Update `--spacing-marketing-cta-gap` (1rem → var(--spacing-4))
- [ ] Update `--spacing-marketing-badge-gap` (0.75rem → var(--spacing-3))
- [ ] Keep `--spacing-marketing-list-gap` (0.875rem = 14px exception)
- [ ] Update `--spacing-container-x` (1rem → var(--spacing-4))
- [ ] Update `--spacing-container-y` (1rem → var(--spacing-4))

### Phase 7: Refactor Meeting/Panel/Card Tokens (10 min)

- [ ] Update `--spacing-meeting-date-badge-width` (5rem → var(--spacing-20))
- [ ] Update `--spacing-meeting-card-gap` (0.5rem → var(--spacing-2))
- [ ] Update `--spacing-meeting-avatar-gap` (0.25rem → var(--spacing-1))
- [ ] Update `--spacing-meeting-section-gap` (2rem → var(--spacing-8))
- [ ] Update `--spacing-panel-breadcrumb-width` (3rem → var(--spacing-12))
- [ ] Update `--spacing-panel-breadcrumb-padding` (0.75rem → var(--spacing-3))
- [ ] Update `--spacing-card-padding-x` (1.25rem → var(--spacing-5))
- [ ] Update `--spacing-card-padding-y` (1.25rem → var(--spacing-5))
- [ ] Verify `--spacing-chip-x` (already var(--spacing-2)) ✅
- [ ] Verify `--spacing-chip-gap` (already var(--spacing-1)) ✅
- [ ] Keep `--spacing-chip-y` (0.125rem = 2px exception)
- [ ] Keep `--spacing-chip-close-padding` (0.125rem = 2px exception)

### Phase 8: Refactor Accordion/Tabs Tokens (5 min)

- [ ] Update `--spacing-accordion-padding-x` (1rem → var(--spacing-4))
- [ ] Update `--spacing-accordion-padding-y` (0.75rem → var(--spacing-3))
- [ ] Update `--spacing-accordion-gap` (0.5rem → var(--spacing-2))
- [ ] Update `--spacing-tab-padding-x` (0.75rem → var(--spacing-3))
- [ ] Keep `--spacing-tab-padding-y` (0.375rem = 6px exception)

### Phase 9: Update Responsive Container (5 min)

- [ ] Update responsive container (tablet: 1.5rem → var(--spacing-6))
- [ ] Update responsive container (desktop: 2rem → var(--spacing-8))

### Phase 10: Testing & Validation (20 min)

- [ ] Run `npm run lint` - verify no ESLint violations
- [ ] Run `npm run build` - verify build succeeds
- [ ] Run dev server (`npm run dev`)
- [ ] **Cascade Test**: Modify `--spacing-2` from `0.5rem` to `1rem`, verify all semantic tokens using `var(--spacing-2)` update
- [ ] Revert cascade test change
- [ ] Visual spot-check: Inbox page (nav, cards, buttons)
- [ ] Visual spot-check: Meetings page (cards, layout)
- [ ] Visual spot-check: Settings page (forms, inputs)
- [ ] Visual spot-check: Dark mode (verify no issues)
- [ ] Take screenshots before/after (compare for regressions)

### Phase 11: Documentation (10 min)

- [ ] Update `dev-docs/2-areas/design/design-tokens.md`
- [ ] Add section explaining base scale references pattern
- [ ] Document intentional exceptions (2px, 6px, 10px, 14px values)
- [ ] Add example showing cascade behavior
- [ ] Update file header comments in `spacing.css`

### Phase 12: Commit (5 min)

- [ ] Git add `src/styles/tokens/spacing.css`
- [ ] Git add `dev-docs/2-areas/design/design-tokens.md`
- [ ] Commit with message: `refactor(design-system): Use base scale references in semantic spacing tokens`
- [ ] Verify pre-commit hooks pass
- [ ] Push to remote

---

## Estimated Time

**Total**: 90 minutes

- Preparation: 5 min
- Refactoring (Phases 2-9): 70 min
- Testing: 20 min
- Documentation: 10 min
- Commit: 5 min

---

## Related Tickets

- **SYOS-403**: Add Base Spacing Scale Foundation (prerequisite - COMPLETE)
- **SYOS-387**: Execute SYOS-373 with Governance Protection (prerequisite - COMPLETE)
- **SYOS-386**: Phase 1: Quick Defense - ESLint + Pre-Commit (prerequisite - COMPLETE)
- **SYOS-373**: Split app.css into Modular Architecture (prerequisite - COMPLETE)

---

## Notes

**Why This Matters**:

- **Single source of truth**: Changing `--spacing-2` will cascade to all semantic tokens using it
- **Better maintainability**: Can see relationships between tokens (which share same base value?)
- **Consistent pattern**: New components already follow this pattern (Chips)
- **Design system maturity**: Completes 3-tier architecture implementation

**Exceptions to Keep**:

Some values intentionally don't map to base scale (optimized for specific components):

- `0.125rem` (2px) - Chip padding (compact design)
- `0.375rem` (6px) - Nav/menu items (optimal touch target)
- `0.625rem` (10px) - Headers, inputs (visual balance)
- `0.875rem` (14px) - Marketing list spacing (readability)

**Future Consideration**:

If exceptions become too common, consider expanding base scale:

- Add `--spacing-1.5: 0.375rem;` (6px)
- Add `--spacing-2.5: 0.625rem;` (10px)
- Add `--spacing-3.5: 0.875rem;` (14px)

But for now, keep exceptions explicit to maintain clarity.

---

**Created**: 2025-11-21  
**Purpose**: Complete 3-tier design token architecture - enable full cascade behavior from base scale to semantic tokens to utilities

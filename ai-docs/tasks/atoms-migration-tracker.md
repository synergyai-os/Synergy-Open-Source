# Atom Components Migration Tracker

**Date**: 2025-01-27  
**Purpose**: Track migration of Bits UI wrappers → styled components with recipes  
**Goal**: All atoms follow `atoms + recipes` pattern, no wrapper pattern

---

## Migration Status Overview

| Status             | Count | Description                          |
| ------------------ | ----- | ------------------------------------ |
| ✅ **Complete**    | 30    | Styled components with recipes       |
| 🔄 **In Progress** | 0     | Currently migrating                  |
| ⏳ **Pending**     | 0     | Wrapper components to convert        |
| 📝 **Exceptions**  | 2     | Documented (Loading, LoadingOverlay) |

**Total Atoms**: 32

---

## ✅ Styled Components (Complete - 17)

These components follow the `atoms + recipes` pattern:

| Component            | Recipe                                                                                                   | Bits UI Used           | Status      |
| -------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------- | ----------- |
| **Text**             | `textRecipe`                                                                                             | None (native)          | ✅ Complete |
| **Button**           | `buttonRecipe`                                                                                           | `BitsButton.Root`      | ✅ Complete |
| **Icon**             | `iconRecipe`                                                                                             | None (SVG)             | ✅ Complete |
| **Heading**          | `headingRecipe`                                                                                          | None (native)          | ✅ Complete |
| **Card**             | `cardRecipe`                                                                                             | None (native)          | ✅ Complete |
| **Badge**            | `badgeRecipe`                                                                                            | None (native)          | ✅ Complete |
| **Avatar**           | `avatarRecipe`                                                                                           | None (native)          | ✅ Complete |
| **Chip**             | `chipRecipe`, `chipCloseButtonRecipe`                                                                    | None (native)          | ✅ Complete |
| **FormInput**        | `formInputRecipe`                                                                                        | None (native)          | ✅ Complete |
| **FormSelect**       | `formInputRecipe`                                                                                        | `Select.*`             | ✅ Complete |
| **FormTextarea**     | `formTextareaRecipe`                                                                                     | None (native)          | ✅ Complete |
| **Combobox**         | `comboboxTriggerRecipe`, `comboboxInputRecipe`, etc.                                                     | `BitsCombobox.*`       | ✅ Complete |
| **TimeInput**        | `timeInputRecipe`                                                                                        | None (native)          | ✅ Complete |
| **DurationInput**    | `durationInputRecipe`                                                                                    | None (native)          | ✅ Complete |
| **StatusPill**       | `statusPillRecipe`, `statusPillIconRecipe`                                                               | None (native)          | ✅ Complete |
| **PinInput**         | `pinInputRootRecipe`, `pinInputCellRecipe`, etc.                                                         | `PinInputPrimitive.*`  | ✅ Complete |
| **KeyboardShortcut** | `keyboardShortcutRecipe`, `keyboardShortcutKeyRecipe`                                                    | None (native)          | ✅ Complete |
| **ScrollArea**       | `scrollAreaRootRecipe`, `scrollAreaViewportRecipe`, `scrollAreaScrollbarRecipe`, `scrollAreaThumbRecipe` | `BitsScrollArea.*`     | ✅ Complete |
| **Checkbox**         | `checkboxRootRecipe`, `checkboxBoxRecipe`, `checkboxIconRecipe`                                          | `BitsCheckbox.*`       | ✅ Complete |
| **Switch**           | `switchRootRecipe`, `switchThumbRecipe`                                                                  | `BitsSwitch.*`         | ✅ Complete |
| **Tooltip**          | `tooltipContentRecipe`, `tooltipArrowRecipe`                                                             | `BitsTooltip.*`        | ✅ Complete |
| **Tabs**             | `tabsListRecipe`, `tabsTriggerRecipe`, `tabsContentRecipe`                                               | `BitsTabs.*`           | ✅ Complete |
| **RadioGroup**       | `radioGroupIndicatorRecipe`, `radioGroupDotRecipe`                                                       | `BitsRadioGroup.*`     | ✅ Complete |
| **Label**            | `labelRootRecipe`                                                                                        | `BitsLabel.Root`       | ✅ Complete |
| **Progress**         | `progressRootRecipe`, `progressIndicatorRecipe`                                                          | `BitsProgress.Root`    | ✅ Complete |
| **Slider**           | `sliderRootRecipe`, `sliderTrackRecipe`, `sliderRangeRecipe`, `sliderThumbRecipe`, `sliderTickRecipe`    | `BitsSlider.*`         | ✅ Complete |
| **Toggle**           | `toggleRootRecipe`                                                                                       | `BitsToggle.Root`      | ✅ Complete |
| **ToggleGroup**      | `toggleGroupRootRecipe`, `toggleGroupItemRecipe`                                                         | `BitsToggleGroup.*`    | ✅ Complete |
| **AspectRatio**      | `aspectRatioRootRecipe`                                                                                  | `BitsAspectRatio.Root` | ✅ Complete |
| **Meter**            | `meterRootRecipe`, `meterIndicatorRecipe`                                                                | `BitsMeter.Root`       | ✅ Complete |

---

## ⏳ Wrapper Components (Pending Migration - 12)

These need to be converted from wrappers → styled components with recipes:

| Component       | Priority    | Production Usage                  | Recipe Needed                                                                                            | Status      |
| --------------- | ----------- | --------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------- |
| **ScrollArea**  | 🔴 **HIGH** | ✅ Yes (`meetings/+page.svelte`)  | `scrollAreaRootRecipe`, `scrollAreaViewportRecipe`, `scrollAreaScrollbarRecipe`, `scrollAreaThumbRecipe` | ✅ Complete |
| **Checkbox**    | 🟡 Medium   | ❌ No (Storybook only)            | `checkboxRootRecipe`, `checkboxBoxRecipe`, `checkboxIconRecipe`                                          | ✅ Complete |
| **Switch**      | 🟡 Medium   | ❌ No (Storybook only)            | `switchRootRecipe`, `switchThumbRecipe`                                                                  | ✅ Complete |
| **Tooltip**     | 🟡 Medium   | ❌ No (Storybook only)            | `tooltipContentRecipe`, `tooltipArrowRecipe`                                                             | ✅ Complete |
| **Tabs**        | 🟡 Medium   | ❌ No (Storybook only)            | `tabsListRecipe`, `tabsTriggerRecipe`, `tabsContentRecipe`                                               | ✅ Complete |
| **RadioGroup**  | 🟡 Medium   | ❌ No (Storybook only)            | `radioGroupIndicatorRecipe`, `radioGroupDotRecipe`                                                       | ✅ Complete |
| **Label**       | 🟢 Low      | ❌ No (Storybook only)            | `labelRootRecipe`                                                                                        | ✅ Complete |
| **Progress**    | 🟢 Low      | ❌ No (Storybook only)            | `progressRootRecipe`, `progressIndicatorRecipe`                                                          | ✅ Complete |
| **Slider**      | 🟢 Low      | ❌ No (Storybook only)            | `sliderRootRecipe`, `sliderTrackRecipe`, `sliderRangeRecipe`, `sliderThumbRecipe`, `sliderTickRecipe`    | ✅ Complete |
| **Toggle**      | 🟢 Low      | ❌ No (Storybook only)            | `toggleRootRecipe`                                                                                       | ✅ Complete |
| **ToggleGroup** | 🟢 Low      | ✅ Yes (`RecurrenceField.svelte`) | `toggleGroupRootRecipe`, `toggleGroupItemRecipe`                                                         | ✅ Complete |
| **AspectRatio** | 🟢 Low      | ❌ No (Storybook only)            | `aspectRatioRootRecipe`                                                                                  | ✅ Complete |
| **Meter**       | 🟢 Low      | ❌ No (Storybook only)            | `meterRootRecipe`, `meterIndicatorRecipe`                                                                | ✅ Complete |

**Priority Legend:**

- 🔴 **HIGH**: Used in production code
- 🟡 **Medium**: Likely to be used soon
- 🟢 **Low**: Rarely used, can wait

---

## 📝 Documented Exceptions (2)

These don't follow the standard pattern for valid reasons:

| Component          | Type              | Reason                                                 |
| ------------------ | ----------------- | ------------------------------------------------------ |
| **Loading**        | SVG exception     | SVG requires explicit pixel values, documented pattern |
| **LoadingOverlay** | Feature component | Complex state management, not pure styling             |

---

## Migration Checklist

For each wrapper component, complete these steps:

- [ ] **1. Create Recipe**
  - [ ] Create `[component]Recipe.ts` in `src/lib/design-system/recipes/`
  - [ ] Define variants (if needed)
  - [ ] Use semantic design tokens
  - [ ] Export `[Component]VariantProps` type
  - [ ] Add to `recipes/index.ts`

- [ ] **2. Convert Component**
  - [ ] Import Bits UI component
  - [ ] Import recipe
  - [ ] Add props interface with recipe variants
  - [ ] Apply recipe classes to Bits UI components
  - [ ] Add default export (styled component)
  - [ ] Remove module-level exports (wrapper pattern)

- [ ] **3. Update Exports**
  - [ ] Update `atoms/index.ts`: Change `export * as` → `export { default as }`
  - [ ] Update any production usage

- [ ] **4. Update Storybook** (optional)
  - [ ] Update `.stories.svelte` to use styled component
  - [ ] Or keep as-is for Bits UI documentation

- [ ] **5. Verify**
  - [ ] Test component works
  - [ ] Check design tokens are used
  - [ ] Verify no hardcoded values
  - [ ] Update this tracker ✅

---

## Migration Strategy

### Recommended Approach: **Validate First, Then Batch**

1. **Phase 1: Validate Pattern** (Start here)
   - ✅ Convert **ScrollArea** first (only production usage)
   - ✅ Test thoroughly
   - ✅ Validate recipe pattern works

2. **Phase 2: Batch Convert** (After validation)
   - Convert remaining 12 wrappers in batches
   - Group by complexity:
     - **Simple**: Label, Progress, Meter, AspectRatio (4)
     - **Medium**: Checkbox, Switch, Toggle, ToggleGroup (4)
     - **Complex**: Tooltip, Tabs, RadioGroup, Slider (4)

3. **Phase 3: Cleanup**
   - Remove wrapper pattern documentation
   - Update architecture docs
   - Mark migration complete ✅

---

## Current Usage Analysis

### Production Usage (Must Migrate)

- **ScrollArea**: `src/routes/(authenticated)/meetings/+page.svelte` (1 file)

### Storybook Only (Can Migrate Later)

- All other wrappers: Only used in `.stories.svelte` files (12 components)

---

## Notes

- **No primitives folder needed**: Import Bits UI directly when building new components
- **Pattern**: `atoms + recipes` = design system components
- **Direct imports**: `import { Dialog } from 'bits-ui'` when building new components
- **Goal**: All atoms are styled components with recipes, no wrapper pattern

---

## Progress Tracking

**Last Updated**: 2025-01-27

- **Started**: 2025-01-27
- **Completed**: 13/13 (100%) ✅
- **Status**: **MIGRATION COMPLETE** 🎉

# Design System Compactness Analysis

**Goal**: Make the entire design system match DateInput's compact, tidy appearance as the default for medium-sized components.

**Date**: 2025-01-27

---

## Current State Comparison

### DateInput (✅ Compact - Target Reference)

- **Font Size**: `text-sm` (12px)
- **Padding**:
  - Left: `spacing-3-5` (14px)
  - Right: `spacing-6` (24px)
  - Vertical: `spacing-2` (8px)
- **Appearance**: Sharp, tidy, compact, professional

### FormInput/TimeInput (❌ Bloated - Needs Update)

- **Font Size**: Default `text-base` (14px) - no explicit size in recipe
- **Padding**:
  - Horizontal: `px-input` = `spacing.4` (16px)
  - Vertical: `py-input` = `spacing.3` (12px)
- **Appearance**: Too spacious, feels bloated

### Toggle Switch (❌ Bloated - Needs Update)

- **Height**: `1.5rem` (24px) - hardcoded
- **Width**: `2.75rem` (44px) - hardcoded
- **Thumb Size**: `size-icon-sm` (16px)
- **Appearance**: Too large, disproportionate

---

## Required Changes

### 1. Input Padding Tokens (Semantic Tokens)

**File**: `design-tokens-semantic.json`

**Current**:

```json
"input": {
  "x": {
    "$value": "{spacing.4}",  // 16px
    "$description": "Input horizontal padding (16px - roomy feel)"
  },
  "y": {
    "$value": "{spacing.3}",  // 12px
    "$description": "Input vertical padding (12px - comfortable height)"
  }
}
```

**Proposed**:

```json
"input": {
  "x": {
    "$value": "{spacing.3-5}",  // 14px - matches DateInput left padding
    "$description": "Input horizontal padding (14px - compact, tidy)"
  },
  "y": {
    "$value": "{spacing.2}",  // 8px - matches DateInput vertical padding
    "$description": "Input vertical padding (8px - compact, sharp)"
  }
}
```

**Impact**:

- ✅ All inputs using `px-input`/`py-input` will automatically become more compact
- ✅ FormInput, TimeInput, and any other inputs using these tokens
- ⚠️ DateInput already overrides these, so no change needed there

### 2. FormInput Recipe Font Size

**File**: `src/lib/design-system/recipes/formInput.recipe.ts`

**Current**:

```typescript
export const formInputRecipe = cva(
	'rounded-input border border-strong bg-base px-input py-input text-primary ...'
	// No explicit font size - defaults to text-base (14px)
);
```

**Proposed**:

```typescript
export const formInputRecipe = cva(
	'rounded-input border border-strong bg-base px-input py-input text-sm text-primary ...'
	// Add text-sm (12px) to match DateInput
);
```

**Impact**:

- ✅ FormInput will use 12px font (matches DateInput)
- ✅ TimeInput extends formInputRecipe, so it will also get 12px
- ✅ All form inputs become more compact and sharp

### 3. Toggle Switch Dimensions

**File**: `src/lib/components/molecules/ToggleSwitch.svelte`

**Current**:

```typescript
const switchStyle = $derived(
	`background-color: var(--color-component-toggle-${checked ? 'on' : 'off'});
   height: 1.5rem;      // 24px
   width: 2.75rem;     // 44px
   ...`
);
const thumbClasses = $derived([toggleSwitchThumbRecipe({ checked }), 'size-icon-sm']); // 16px
```

**Proposed**:

```typescript
const switchStyle = $derived(
	`background-color: var(--color-component-toggle-${checked ? 'on' : 'off'});
   height: 1.25rem;    // 20px (was 24px) - 16% smaller
   width: 2.25rem;     // 36px (was 44px) - 18% smaller
   ...`
);
const thumbClasses = $derived([toggleSwitchThumbRecipe({ checked }), 'size-icon-xs']); // 12px (was 16px)
```

**Thumb Transform Adjustments**:

- Current: `translateX(1.5rem)` when checked, `translateX(0.25rem)` when unchecked
- Proposed: `translateX(1.25rem)` when checked (20px), `translateX(0.25rem)` when unchecked (4px)
- Or use: `translateX(calc(2.25rem - 1.25rem - 0.25rem))` = `translateX(0.75rem)` when checked

**Better Approach**: Use semantic tokens for toggle switch dimensions

**Add to `design-tokens-semantic.json`**:

```json
"sizing": {
  "toggle": {
    "height": {
      "$value": "{spacing.5}",  // 20px (1.25rem)
      "$description": "Toggle switch height (compact)"
    },
    "width": {
      "$value": "{spacing.9}",  // 36px (2.25rem)
      "$description": "Toggle switch width (compact)"
    },
    "thumb": {
      "$value": "{sizing.icon.xs}",  // 12px
      "$description": "Toggle switch thumb size (compact)"
    }
  }
}
```

---

## Implementation Plan

### Phase 1: Input Tokens (Low Risk)

1. ✅ Update `spacing.input.x` from `spacing.4` (16px) to `spacing.3-5` (14px)
2. ✅ Update `spacing.input.y` from `spacing.3` (12px) to `spacing.2` (8px)
3. ✅ Run `npm run tokens:build`
4. ✅ Test FormInput, TimeInput, DateInput (should remain same due to overrides)

### Phase 2: FormInput Recipe (Low Risk)

1. ✅ Add `text-sm` to `formInputRecipe` base classes
2. ✅ Test all form inputs across the app
3. ✅ Verify DateInput still works (already has `text-sm`)

### Phase 3: Toggle Switch (Medium Risk)

1. ✅ Add toggle sizing tokens to `design-tokens-semantic.json`
2. ✅ Update `ToggleSwitch.svelte` to use tokens instead of hardcoded values
3. ✅ Adjust thumb transform calculations
4. ✅ Test toggle switches across the app
5. ✅ Verify visual balance and usability

---

## Impact Analysis

### Components Affected

**Inputs** (will become more compact):

- ✅ `FormInput` - All text/email/password inputs
- ✅ `TimeInput` - Time selection inputs
- ✅ `DateInput` - Already compact, no change needed
- ✅ Any other inputs using `formInputRecipe` or `px-input`/`py-input`

**Toggles** (will become more compact):

- ✅ `ToggleSwitch` - All on/off switches
- ⚠️ May need to check other toggle components

**Potential Issues**:

- ⚠️ Some inputs might feel too tight (can be addressed with size variants later)
- ⚠️ Toggle switches might be harder to click on mobile (test required)
- ⚠️ Existing layouts might need minor adjustments

---

## Testing Checklist

- [ ] FormInput renders correctly with new padding
- [ ] TimeInput renders correctly with new padding
- [ ] DateInput still looks correct (should be unchanged)
- [ ] ToggleSwitch renders correctly with new dimensions
- [ ] All inputs have consistent, compact appearance
- [ ] Text is readable at 12px
- [ ] Toggle switches are still easily clickable
- [ ] No visual regressions in forms across the app

---

## Rollback Plan

If issues arise:

1. Revert token changes in `design-tokens-semantic.json`
2. Revert recipe changes in `formInput.recipe.ts`
3. Revert toggle switch changes
4. Run `npm run tokens:build`
5. Test and document issues for future iteration

---

## Future Enhancements

After this change, consider:

- Adding size variants to inputs (`sm`, `md`, `lg`) if needed
- Adding size variants to toggle switches
- Documenting compact vs. spacious design patterns
- Creating a design system guide for when to use compact vs. spacious

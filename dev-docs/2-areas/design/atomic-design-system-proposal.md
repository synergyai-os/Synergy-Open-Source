# Atomic Design System Proposal

**Status**: Proposal - Awaiting Review  
**Date**: 2025-01-XX  
**Related**: Design System Foundation (SYOS-353)

---

## Executive Summary

Our current design system has **semantic tokens** but lacks a **base spacing scale**. This proposal introduces an atomic design system pattern where:

1. **Base scale tokens** (`spacing-1`, `spacing-2`, etc.) define the foundation
2. **Semantic tokens** reference base scale tokens (not hardcoded values)
3. **Maximum control with minimal variables** - change base scale, everything updates

**Current Problem**: We claim to use a 4px base unit, but many values violate this rule (6px, 10px, 14px, etc.)

---

## Current State Analysis

### ❌ Problems Identified

1. **No Base Scale**: We have semantic tokens but no foundational scale
2. **Inconsistent Values**: Many tokens don't follow the 4px rule:
   - `--spacing-nav-item-y: 0.375rem` = **6px** ❌ (not multiple of 4px)
   - `--spacing-menu-item-x: 0.625rem` = **10px** ❌ (not multiple of 4px)
   - `--spacing-header-y: 0.625rem` = **10px** ❌ (not multiple of 4px)
   - `--spacing-input-y: 0.625rem` = **10px** ❌ (not multiple of 4px)
   - `--spacing-marketing-list-gap: 0.875rem` = **14px** ❌ (not multiple of 4px)
   - `--spacing-button-x: 3rem` = **48px** ❌ (should be 1.5rem = 24px per spec)

3. **Too Many Variables**: 50+ semantic tokens with hardcoded values
4. **No Single Source of Truth**: Can't change spacing globally by adjusting base scale

### ✅ What's Working

- Semantic naming is good (self-documenting)
- Token system exists and is enforced
- Documentation is comprehensive

---

## Proposed Solution: Atomic Design System

### Pattern: Base Scale + Semantic Aliases

Based on **Design Tokens Community Group (DTCG)** and **Style Dictionary** best practices:

1. **Base Scale Tokens** (Foundation)
   - `--spacing-1` = 0.25rem (4px)
   - `--spacing-2` = 0.5rem (8px)
   - `--spacing-3` = 0.75rem (12px)
   - `--spacing-4` = 1rem (16px)
   - `--spacing-5` = 1.25rem (20px)
   - `--spacing-6` = 1.5rem (24px)
   - `--spacing-8` = 2rem (32px)
   - `--spacing-10` = 2.5rem (40px)
   - `--spacing-12` = 3rem (48px)
   - `--spacing-16` = 4rem (64px)
   - `--spacing-20` = 5rem (80px)
   - `--spacing-28` = 7rem (112px)

2. **Semantic Tokens** (Aliases to Base Scale)
   ```css
   /* Instead of hardcoded values */
   --spacing-nav-item-x: var(--spacing-2); /* 8px */
   --spacing-nav-item-y: var(--spacing-2); /* 8px - was 6px, now consistent */
   --spacing-button-x: var(--spacing-6); /* 24px - was 48px, now correct */
   --spacing-button-y: var(--spacing-3); /* 12px */
   ```

### Benefits

✅ **Single Source of Truth**: Change `--spacing-2` from 8px to 10px, all tokens update  
✅ **Consistency**: All values are multiples of 4px  
✅ **Fewer Variables**: Base scale (12 tokens) + semantic aliases (50 tokens) vs 50+ hardcoded  
✅ **Scalability**: Easy to add new semantic tokens by referencing base scale  
✅ **Maintainability**: Update spacing globally by adjusting base scale  

---

## Implementation Plan

### Phase 1: Create Base Scale (Foundation)

```css
@theme {
  /* Base Spacing Scale - 4px base unit */
  /* These are the ONLY hardcoded spacing values */
  --spacing-0: 0;
  --spacing-1: 0.25rem; /* 4px */
  --spacing-2: 0.5rem;  /* 8px */
  --spacing-3: 0.75rem; /* 12px */
  --spacing-4: 1rem;    /* 16px */
  --spacing-5: 1.25rem; /* 20px */
  --spacing-6: 1.5rem;  /* 24px */
  --spacing-8: 2rem;    /* 32px */
  --spacing-10: 2.5rem; /* 40px */
  --spacing-12: 3rem;   /* 48px */
  --spacing-16: 4rem;   /* 64px */
  --spacing-20: 5rem;  /* 80px */
  --spacing-28: 7rem;  /* 112px */
}
```

### Phase 2: Convert Semantic Tokens to Aliases

**Before (Hardcoded):**
```css
--spacing-nav-item-x: 0.5rem; /* 8px */
--spacing-nav-item-y: 0.375rem; /* 6px ❌ */
--spacing-button-x: 3rem; /* 48px ❌ should be 24px */
```

**After (Aliases):**
```css
--spacing-nav-item-x: var(--spacing-2); /* 8px */
--spacing-nav-item-y: var(--spacing-2); /* 8px - fixed to be consistent */
--spacing-button-x: var(--spacing-6); /* 24px - fixed per spec */
```

### Phase 3: Value Corrections

**Values that need fixing** (not multiples of 4px):

| Current Token | Current Value | Current PX | Proposed Value | Proposed PX | Reason |
|--------------|---------------|------------|----------------|-------------|---------|
| `--spacing-nav-item-y` | 0.375rem | 6px | `var(--spacing-2)` | 8px | Consistency with nav-item-x |
| `--spacing-menu-item-x` | 0.625rem | 10px | `var(--spacing-3)` | 12px | Round up to 4px multiple |
| `--spacing-menu-item-y` | 0.375rem | 6px | `var(--spacing-2)` | 8px | Consistency |
| `--spacing-badge-x` | 0.375rem | 6px | `var(--spacing-2)` | 8px | Consistency |
| `--spacing-badge-y` | 0.125rem | 2px | `var(--spacing-1)` | 4px | Round up to 4px multiple |
| `--spacing-header-y` | 0.625rem | 10px | `var(--spacing-3)` | 12px | Round up to 4px multiple |
| `--spacing-icon-gap-wide` | 0.625rem | 10px | `var(--spacing-3)` | 12px | Round up to 4px multiple |
| `--spacing-input-y` | 0.625rem | 10px | `var(--spacing-3)` | 12px | Round up to 4px multiple |
| `--spacing-marketing-list-gap` | 0.875rem | 14px | `var(--spacing-4)` | 16px | Round up to 4px multiple |
| `--spacing-button-x` | 3rem | 48px | `var(--spacing-6)` | 24px | **BUG FIX** - per spec should be 24px |

**Note**: Some values may need design review before changing (e.g., badge-y from 2px to 4px might be too large).

---

## Example: Complete Token Structure

```css
@theme {
  /* ============================================
     BASE SCALE (Foundation - Only Hardcoded Values)
     ============================================ */
  --spacing-0: 0;
  --spacing-1: 0.25rem; /* 4px */
  --spacing-2: 0.5rem;  /* 8px */
  --spacing-3: 0.75rem; /* 12px */
  --spacing-4: 1rem;    /* 16px */
  --spacing-5: 1.25rem; /* 20px */
  --spacing-6: 1.5rem;  /* 24px */
  --spacing-8: 2rem;    /* 32px */
  --spacing-10: 2.5rem; /* 40px */
  --spacing-12: 3rem;   /* 48px */
  --spacing-16: 4rem;   /* 64px */
  --spacing-20: 5rem;  /* 80px */
  --spacing-28: 7rem;  /* 112px */

  /* ============================================
     SEMANTIC TOKENS (Aliases to Base Scale)
     ============================================ */
  
  /* Navigation */
  --spacing-nav-container-x: var(--spacing-2); /* 8px */
  --spacing-nav-container-y: var(--spacing-2); /* 8px */
  --spacing-nav-item-x: var(--spacing-2); /* 8px */
  --spacing-nav-item-y: var(--spacing-2); /* 8px - was 6px */
  
  /* Menu/Dropdown */
  --spacing-menu-item-x: var(--spacing-3); /* 12px - was 10px */
  --spacing-menu-item-y: var(--spacing-2); /* 8px - was 6px */
  
  /* Badges */
  --spacing-badge-x: var(--spacing-2); /* 8px - was 6px */
  --spacing-badge-y: var(--spacing-1); /* 4px - was 2px (needs design review) */
  
  /* Headers */
  --spacing-header-x: var(--spacing-3); /* 12px */
  --spacing-header-y: var(--spacing-3); /* 12px - was 10px */
  
  /* Icons */
  --spacing-icon-gap: var(--spacing-2); /* 8px */
  --spacing-icon-gap-wide: var(--spacing-3); /* 12px - was 10px */
  
  /* Buttons */
  --spacing-button-x: var(--spacing-6); /* 24px - was 48px (BUG FIX) */
  --spacing-button-y: var(--spacing-3); /* 12px */
  --spacing-button-icon: var(--spacing-3); /* 12px */
  --spacing-button-group: var(--spacing-2); /* 8px */
  
  /* Forms */
  --spacing-input-x: var(--spacing-3); /* 12px */
  --spacing-input-y: var(--spacing-3); /* 12px - was 10px */
  --spacing-form-field-gap: var(--spacing-2); /* 8px */
  --spacing-form-section-gap: var(--spacing-4); /* 16px */
  
  /* Cards */
  --spacing-card-padding-x: var(--spacing-5); /* 20px */
  --spacing-card-padding-y: var(--spacing-5); /* 20px */
  
  /* Content */
  --spacing-content-padding: var(--spacing-6); /* 24px */
  --spacing-content-section: var(--spacing-4); /* 16px */
  
  /* Inbox */
  --spacing-inbox-container: var(--spacing-4); /* 16px */
  --spacing-inbox-card-x: var(--spacing-3); /* 12px */
  --spacing-inbox-card-y: var(--spacing-3); /* 12px */
  --spacing-inbox-list-gap: var(--spacing-2); /* 8px */
  --spacing-inbox-icon-gap: var(--spacing-2); /* 8px */
  --spacing-inbox-title-bottom: var(--spacing-4); /* 16px */
  --spacing-inbox-header-x: var(--spacing-4); /* 16px */
  
  /* Settings */
  --spacing-settings-section-gap: var(--spacing-6); /* 24px */
  --spacing-settings-row-gap: var(--spacing-4); /* 16px */
  --spacing-settings-row-padding-x: var(--spacing-4); /* 16px */
  --spacing-settings-row-padding-y: var(--spacing-4); /* 16px */
  
  /* Modals */
  --spacing-modal-padding: var(--spacing-6); /* 24px */
  
  /* Control Panel */
  --spacing-control-panel-padding: var(--spacing-3); /* 12px */
  --spacing-control-group-gap: var(--spacing-2); /* 8px */
  --spacing-control-item-gap: var(--spacing-1); /* 4px */
  --spacing-control-button-padding: var(--spacing-2); /* 8px */
  --spacing-control-divider: var(--spacing-2); /* 8px */
  
  /* Marketing */
  --spacing-marketing-section-y: var(--spacing-28); /* 112px */
  --spacing-marketing-section-gap: var(--spacing-20); /* 80px */
  --spacing-marketing-container-x: var(--spacing-6); /* 24px */
  --spacing-marketing-title-to-lead: var(--spacing-6); /* 24px */
  --spacing-marketing-lead-to-content: var(--spacing-12); /* 48px */
  --spacing-marketing-card-padding: var(--spacing-10); /* 40px */
  --spacing-marketing-card-gap: var(--spacing-8); /* 32px */
  --spacing-marketing-element-gap: var(--spacing-6); /* 24px */
  --spacing-marketing-text-gap: var(--spacing-4); /* 16px */
  --spacing-marketing-hero-y: var(--spacing-20); /* 80px */
  --spacing-marketing-hero-bottom: var(--spacing-32); /* 128px - need spacing-32 */
  --spacing-marketing-cta-gap: var(--spacing-4); /* 16px */
  --spacing-marketing-badge-gap: var(--spacing-3); /* 12px */
  --spacing-marketing-list-gap: var(--spacing-4); /* 16px - was 14px */
  
  /* System-Level */
  --spacing-system-header-y: var(--spacing-3); /* 12px */
  --spacing-system-content-y: var(--spacing-system-header-y); /* 12px */
  --spacing-system-header-height: var(--spacing-16); /* 64px */
  
  /* Indent */
  --spacing-indent: var(--spacing-6); /* 24px */
  
  /* Readability */
  --spacing-readable-quote-y: var(--spacing-8); /* 32px */
}
```

---

## Migration Strategy

### Step 1: Add Base Scale (Non-Breaking)

Add base scale tokens alongside existing semantic tokens. No breaking changes.

### Step 2: Convert Semantic Tokens Gradually

Convert semantic tokens to aliases one category at a time:
1. Navigation tokens
2. Button tokens
3. Form tokens
4. etc.

### Step 3: Fix Value Inconsistencies

After converting to aliases, fix values that don't follow 4px rule (with design review).

### Step 4: Update Documentation

Update `design-tokens.md` to explain base scale + semantic alias pattern.

---

## Questions for Review

1. **Value Corrections**: Should we fix non-4px values immediately, or keep them for now?
   - Example: `--spacing-badge-y` from 2px → 4px might be too large visually
   
2. **Base Scale Range**: Do we need all base scale values (0-28), or can we add as needed?
   - Current max is `--spacing-28` (112px) for marketing sections
   
3. **Migration Timeline**: 
   - Phase 1 (Base scale): 1 day
   - Phase 2 (Convert tokens): 2-3 days
   - Phase 3 (Fix values): 1-2 days (with design review)
   - **Total**: ~1 week

4. **Breaking Changes**: Some value corrections will change visual spacing. Should we:
   - A) Fix all values immediately (breaking)
   - B) Keep current values, convert to aliases later (non-breaking)
   - C) Hybrid: Fix critical bugs (button-x), keep others for now

---

## References

- **Design Tokens Community Group**: Base tokens + alias tokens pattern
- **Style Dictionary**: Category/Type/Item structure, token aliasing
- **Coinbase Design System**: 8px base unit with multipliers (0.25, 0.5, 1, 1.5, 2, 3, etc.)
- **Current System**: `dev-docs/2-areas/design/design-tokens.md`

---

## Next Steps

1. **Review this proposal** with design team
2. **Decide on value corrections** (fix now vs. later)
3. **Approve migration timeline**
4. **Create Linear ticket** for implementation
5. **Start Phase 1** (add base scale tokens)


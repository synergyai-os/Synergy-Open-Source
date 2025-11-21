# SYOS-361: Cascade Test Procedure

**Date**: 2025-11-20  
**Purpose**: Manual testing procedure to validate design token cascade

---

## Overview

**Goal**: Prove that changing a token in `app.css` automatically cascades through components to pages without code changes.

**Why This Matters**: Validates Phase 1 foundation - ensures design system architecture works end-to-end.

---

## Prerequisites

✅ All prerequisites verified:

- Tokens exist in `app.css` (257 lines)
- Atomic components exist (Button, Card, Dialog, etc.)
- Subtasks 1-6 complete (components use tokens)

---

## Test Procedure (Per Token)

### Step 1: Document Current Value

```bash
# Open app.css and find token
grep "--border-radius-card" src/app.css
```

**Record**:

- Token name: `--border-radius-card`
- Current value: `0.875rem` (14px)
- Location: Line 129

### Step 2: Change Token Value

```css
/* src/app.css - Line 129 */
/* BEFORE */
--border-radius-card: 0.875rem; /* 14px */

/* AFTER (test) */
--border-radius-card: 1.5rem; /* 24px - noticeably more rounded */
```

### Step 3: Start Dev Server

```bash
npm run dev
# Wait for server to start (usually http://localhost:5173)
```

### Step 4: Navigate to Test Page

```
Open browser: http://localhost:5173/meetings
```

### Step 5: Inspect Element (DevTools)

1. Right-click a card element
2. Select "Inspect"
3. Check **Computed** tab
4. Search for `border-radius`
5. **Verify**: Shows `24px` (not `14px`)

### Step 6: Visual Confirmation

- **Look at cards** on the meetings page
- **Expected**: Cards have noticeably more rounded corners
- **Take screenshot** (before/after)

### Step 7: Rollback Change

```css
/* src/app.css - Rollback */
--border-radius-card: 0.875rem; /* 14px - RESTORED */
```

### Step 8: Document Result

```markdown
✅ **Test 1: Border Radius Cascade - PASSED**

- Token: `--border-radius-card`
- Changed: `0.875rem` → `1.5rem`
- Components affected: Card.Root (atomic component)
- Pages affected: /meetings (MeetingCard uses Card.Root)
- Zero code changes required
- Screenshot: [before] [after]
```

---

## 5 Cascade Tests

### Test 1: Border Radius Cascade

**Token**: `--border-radius-card`  
**Location**: `src/app.css:129`  
**Current**: `0.875rem` (14px)  
**Test value**: `1.5rem` (24px)

**Expected Cascade**:

```
Token changed → Card.Root component updates → MeetingCard visual change
```

**Test Page**: `/meetings`  
**Look for**: Card components with rounded corners  
**Expected**: Cards become noticeably more rounded (14px → 24px)

---

### Test 2: Button Padding Cascade

**Token**: `--spacing-button-x`  
**Location**: `src/app.css:85`  
**Current**: `1.5rem` (24px)  
**Test value**: `3rem` (48px)

**Expected Cascade**:

```
Token changed → Button component updates → Meeting action buttons wider
```

**Test Page**: `/meetings`  
**Look for**: "Start" button, "Add agenda item" button  
**Expected**: Buttons become wider (more horizontal padding)

---

### Test 3: Heading Size Cascade

**Token**: `--font-size-h1`  
**Location**: `src/app.css:159`  
**Current**: `2.25rem` (36px)  
**Test value**: `3rem` (48px)

**Expected Cascade**:

```
Token changed → Heading component updates → Page titles larger
```

**Test Page**: `/meetings`  
**Look for**: Meeting titles (if using Heading component)  
**Expected**: Titles become noticeably larger

---

### Test 4: Card Shadow Cascade

**Token**: `--shadow-card`  
**Location**: `src/app.css:130`  
**Current**: `0 2px 8px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.04)`  
**Test value**: `0 8px 24px rgb(0 0 0 / 0.15), 0 4px 8px rgb(0 0 0 / 0.1)`

**Expected Cascade**:

```
Token changed → Card.Root shadow updates → Meeting cards have deeper shadow
```

**Test Page**: `/meetings`  
**Look for**: Card components (hover not needed)  
**Expected**: Cards have deeper, more prominent shadow

---

### Test 5: Accent Color Cascade

**Token**: `--color-accent-primary`  
**Location**: `src/app.css:200`  
**Current**: `oklch(55.4% 0.218 251.813)` (blue)  
**Test value**: `oklch(69% 0.17 10)` (red/orange)

**Expected Cascade**:

```
Token changed → Button component updates → Primary buttons change color
```

**Test Page**: `/meetings`  
**Look for**: "Start" button (primary variant)  
**Expected**: Button background changes from blue to red/orange

**⚠️ Rollback immediately** - This change affects entire app UI

---

## Success Criteria (Per Test)

✅ **Must have**:

1. Component uses token (DevTools shows CSS var)
2. Page reflects change (visual confirmation)
3. Zero code changes required
4. Rollback works (test is repeatable)

✅ **Documentation**:

- Screenshot (before/after)
- Test result (passed/failed)
- Components affected
- Pages affected

---

## Troubleshooting

### Token change not visible?

**Check 1**: Clear browser cache (Cmd+Shift+R / Ctrl+Shift+F5)  
**Check 2**: Verify token name correct (typo?)  
**Check 3**: Check if component actually uses token:

```bash
grep "rounded-card" src/lib/components/ui/Card/Root.svelte
```

### Component doesn't use token?

**Problem**: Component might use hardcoded value instead  
**Solution**: Update component to use token (out of scope for SYOS-361)  
**Document**: Note component needs refactoring in Phase 2

### Dev server crashes?

**Check**: Syntax error in CSS?  
**Fix**: Validate CSS syntax, ensure no typos  
**Restart**: `npm run dev`

---

## Alternative: Static Analysis (Without Dev Server)

If dev server unavailable, validate cascade through code inspection:

### Step 1: Verify Token Defined

```bash
grep "--border-radius-card" src/app.css
# Output: --border-radius-card: 0.875rem;
```

### Step 2: Verify Utility Uses Token

```bash
grep "rounded-card" src/app.css
# Output: @utility rounded-card { border-radius: var(--border-radius-card); }
```

### Step 3: Verify Component Uses Utility

```bash
grep "rounded-card" src/lib/components/ui/Card/Root.svelte
# Output: class="rounded-card border bg-elevated..."
```

### Step 4: Verify Page Uses Component

```bash
grep "Card.Root" src/lib/modules/meetings/components/MeetingCard.svelte
# Output: <Card.Root>
```

**Conclusion**: Cascade path exists (token → utility → component → page) ✅

---

## Test Results Template

```markdown
## Cascade Test Results

**Test Date**: 2025-11-20  
**Tester**: [Your Name]  
**Environment**: Dev server (localhost:5173)

### Test 1: Border Radius Cascade

- **Status**: ✅ PASSED / ❌ FAILED
- **Token**: `--border-radius-card`
- **Changed**: `0.875rem` → `1.5rem`
- **Components affected**: Card.Root
- **Pages affected**: /meetings (MeetingCard)
- **Screenshots**: [attach before/after]
- **Notes**: Cards noticeably more rounded, no code changes required

(Repeat for Tests 2-5)

### Summary

- **Tests passed**: 5/5
- **Tests failed**: 0/5
- **Conclusion**: ✅ Design system cascade fully operational
```

---

## Validation Complete

**After running all 5 tests**:

1. ✅ All tokens cascade correctly
2. ✅ Zero manual updates required
3. ✅ Design system foundation validated
4. 📋 Document results in `component-architecture.md`

**Next**: Update documentation with test results

---

**Last Updated**: 2025-11-20  
**Related Tickets**: SYOS-354 (parent), SYOS-355-360 (dependencies)

# SYOS-361: Hardcoded Value Audit

**Date**: 2025-11-20  
**Purpose**: Identify molecules/organisms NOT using design tokens

---

## Summary

**Total Violations**: 418+ hardcoded values across 49 files  
**Modules Affected**: All modules (Core, Meetings, Inbox, Flashcards)  
**Severity**: Medium (molecules/organisms expected to have some hardcoded values)  
**Recommendation**: Phase 2 refactoring (future work)

---

## Breakdown by Module

### Core Module

- **Files**: 24 files
- **Violations**: 200+ hardcoded values
- **Severity**: High (most violations)
- **Key components**:
  - `QuickCreateModal.svelte` (16 violations)
  - `Sidebar.svelte` (24 violations)
  - `OrganizationSwitcher.svelte` (51 violations)
  - `NoteEditor.svelte`, `TagSelector.svelte`, etc.

### Meetings Module

- **Files**: 9 files
- **Violations**: 115 hardcoded values
- **Severity**: Medium
- **Key components**:
  - `MeetingCard.svelte` (11 violations)
  - `TodayMeetingCard.svelte` (5 violations)
  - `CreateMeetingModal.svelte` (28 violations)
  - `DecisionsList.svelte`, `ActionItemsList.svelte` (22 each)

### Inbox Module

- **Files**: 10 files
- **Violations**: 80 hardcoded values
- **Severity**: Medium
- **Key components**:
  - `SyncReadwiseConfig.svelte` (22 violations)
  - `ReadwiseDetail.svelte` (16 violations)
  - `InboxHeader.svelte` (6 violations)
  - `FlashcardReviewModal.svelte` (10 violations)

### Flashcards Module

- **Files**: 6 files
- **Violations**: 23 hardcoded values
- **Severity**: Low (fewest violations)
- **Key components**:
  - `FlashcardDetailModal.svelte` (8 violations)
  - `Flashcard.svelte` (6 violations)
  - `StudyCard.svelte` (4 violations)

---

## Common Violation Patterns

### 1. Padding/Margin (Most Common)

```svelte
<!-- ❌ Hardcoded -->
<div class="px-4 py-3">
<button class="px-3 py-1.5">
<div class="p-6">

<!-- ✅ Should use tokens -->
<div class="px-card py-card">
<button class="px-button-x py-button-y">
<div class="p-modal">
```

### 2. Border Radius

```svelte
<!-- ❌ Hardcoded -->
<div class="rounded-lg">
<button class="rounded-md">
<div class="rounded-full">

<!-- ✅ Should use tokens -->
<div class="rounded-card">
<button class="rounded-button">
<div class="rounded-full"> <!-- Exception: avatars -->
```

### 3. Gaps

```svelte
<!-- ❌ Hardcoded -->
<div class="gap-2">
<div class="gap-4">
<div class="gap-1">

<!-- ✅ Should use tokens -->
<div class="gap-icon">
<div class="gap-form-section">
<div class="gap-form-field">
```

### 4. Colors (Text/Background)

```svelte
<!-- ❌ Hardcoded -->
<div class="text-gray-600">
<div class="bg-gray-100">
<div class="border-gray-200">

<!-- ✅ Should use tokens -->
<div class="text-secondary">
<div class="bg-hover-solid">
<div class="border-base">
```

---

## Example Violations by Component

### MeetingCard.svelte (Line 90-148)

```svelte
<!-- ❌ Line 90: Hardcoded spacing -->
<div class="flex-1 space-y-2 py-2">

<!-- ❌ Line 92: Hardcoded gap -->
<div class="flex items-center gap-2">

<!-- ❌ Line 133: Hardcoded gap -->
<div class="flex items-center gap-1.5">

<!-- ❌ Line 145: Hardcoded gap -->
<div class="flex items-center gap-1">

<!-- ❌ Line 148: Hardcoded avatar size + padding -->
<div class="flex h-6 w-6 items-center justify-center rounded-full text-xs">

<!-- ❌ Line 172: Hardcoded padding -->
<button class="border p-1.5">
```

### TodayMeetingCard.svelte (Line 62-113)

```svelte
<!-- ✅ Line 62: GOOD - Uses tokens -->
<div class="gap-inbox-list rounded-card border px-card py-card shadow-card">

<!-- ❌ Line 112: Hardcoded avatar size -->
<div class="flex h-7 w-7 items-center justify-center rounded-full">

<!-- ❌ Line 121: Hardcoded avatar size -->
<div class="flex h-7 w-7 items-center justify-center rounded-full">
```

### OrganizationModals.svelte (Line 38-155)

```svelte
<!-- ❌ Line 38: Hardcoded border radius -->
<Dialog.Content class="rounded-lg border">

<!-- ❌ Line 55: Hardcoded gap -->
<label class="flex flex-col gap-1">

<!-- ❌ Line 58: Hardcoded input padding -->
<input class="rounded-md px-nav-item py-nav-item">

<!-- ❌ Line 69: Hardcoded button padding -->
<button class="rounded-md px-3 py-1.5">

<!-- ❌ Line 77: Hardcoded button padding -->
<button class="rounded-md px-3 py-1.5">
```

---

## Why These Exist (Context)

### Expected Behavior ✅

**Molecules/Organisms** (module components) are **expected** to have some hardcoded values:

- They're built FROM atoms (Button, Card, Dialog)
- They're feature-specific (not reusable across all modules)
- Some spacing is component-specific (not semantic)

### Atomic Design Hierarchy

```
Atoms (ui/Button.svelte)        → ✅ 100% tokens (DONE in SYOS-355-360)
Molecules (MeetingCard.svelte)  → ⚠️ Mix of tokens + hardcoded (THIS AUDIT)
Pages (meetings/+page.svelte)   → ⚠️ Mix of tokens + hardcoded
```

---

## Recommendations

### Phase 2 Refactoring (Future Work)

**Goal**: Replace hardcoded values in molecules with tokens

**Priority 1: Most Common Violations**

1. Avatar sizes: `h-6 w-6` → `size-avatar-sm` token
2. Button padding: `px-3 py-1.5` → Use atomic `<Button>` component
3. Gaps: `gap-2` → `gap-icon` or create semantic token
4. Border radius: `rounded-md` → `rounded-button` or token

**Priority 2: Create Missing Tokens**

- `--size-avatar-xs: 1.5rem` (24px) for small avatars
- `--spacing-element-gap: 0.5rem` (8px) for generic element gaps
- `--spacing-avatar-overlap: -0.25rem` (-4px) for overlapping avatars

**Priority 3: Component Extraction**

- Extract repeating patterns (avatar groups, badge clusters) to reusable components
- Move feature-specific molecules to use atomic components

### What NOT to Change

**Keep hardcoded for**:

- One-off spacing specific to a component
- Experimental features (not yet standardized)
- Layout-specific values (flexbox, grid)

---

## Validation for Phase 1

**Status**: ✅ **EXPECTED BEHAVIOR**

This audit confirms:

1. ✅ Atomic components (ui/) use tokens (validated in SYOS-355-360)
2. ✅ Molecules/organisms have hardcoded values (expected at this phase)
3. ✅ Foundation ready for Phase 2 (page refactoring)

**Cascade tests can proceed** - Atomic components will demonstrate token cascade even if molecules have hardcoded values.

---

## Example: Token Cascade Path

**Current State**:

```svelte
<!-- Atomic Button (uses tokens) -->
<Button variant="primary">Start</Button>
↓ Uses: --spacing-button-x, --border-radius-button, --color-accent-primary

<!-- Molecule MeetingCard (mix) -->
<div class="gap-2">
	<!-- ❌ Hardcoded -->
	<Button>Start</Button>
	<!-- ✅ Token cascade works here -->
</div>
```

**Phase 2 Goal**:

```svelte
<!-- Molecule uses tokens too -->
<div class="gap-meeting-actions">
	<!-- ✅ Semantic token -->
	<Button>Start</Button>
</div>
```

---

## Testing Strategy

### Cascade Test Impact

**Question**: Do hardcoded values block cascade tests?  
**Answer**: ❌ **NO** - Cascade tests target atomic components

**Why cascade still works**:

1. Atomic components (Button, Card) use tokens ✅
2. Change token → Atomic components update ✅
3. Molecules use atomic components → Visual change visible ✅
4. Hardcoded values in molecules don't interfere

**Example**:

- Change `--border-radius-button: 0.5rem` → `1rem`
- Atomic `<Button>` component updates ✅
- `MeetingCard.svelte` has `<Button>` → Button becomes more rounded ✅
- `MeetingCard.svelte` has `gap-2` hardcoded → Gap unchanged (expected)

---

## Next Steps

1. ✅ **Complete Phase 1**: Cascade validation tests
2. 📋 **Document Phase 2 scope**: Create tickets for molecule refactoring
3. 📋 **Prioritize violations**: Start with high-frequency patterns (avatars, gaps)
4. 📋 **Create missing tokens**: Add avatar-xs, element-gap tokens

---

**Conclusion**: Hardcoded values exist (expected for molecules), but do NOT block cascade validation. Atomic components use tokens correctly, proving Phase 1 foundation is solid.

**Status**: ✅ Ready for Cascade Tests

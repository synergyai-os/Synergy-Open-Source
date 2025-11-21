# Button Component Audit Report

**Date**: 2025-11-20  
**Scope**: Complete codebase audit for native `<button>` elements that should use `<Button>` component

---

## Summary

Found **30+ native button elements** across **20+ files** that should be converted to use the standardized `<Button>` component.

**Status**:

- ✅ **High Priority**: 19 buttons **FIXED** (across 8 files)
- 🔄 **Medium Priority**: ~15 buttons (specialized patterns) - **NEEDS DESIGN REVIEW**
- ⚠️ **Context-Specific**: ~5 buttons (need review)

---

## High Priority (Standard Action Buttons)

### 1. **ErrorBoundary.svelte** - 2 buttons

**File**: `src/lib/components/ui/ErrorBoundary.svelte`

- Line 136: "Try Again" button → `<Button variant="primary">`
- Line 137: "Reload Page" button → `<Button variant="outline">`

### 2. **NoteDetail.svelte** - 3 buttons

**File**: `src/lib/modules/inbox/components/NoteDetail.svelte`

- Line 170: Back button → `<Button variant="outline" size="sm">`
- Line 196: "Export to Docs" button → `<Button variant="outline">`
- Line 205: "Export to Blog" button → `<Button variant="primary">`

### 3. **SyncReadwiseConfig.svelte** - 2 buttons

**File**: `src/lib/modules/inbox/components/SyncReadwiseConfig.svelte`

- Line 272: "Cancel" button → `<Button variant="outline">`
- Line 279: "Import" button → `<Button variant="primary">`

### 4. **QuickCreateModal.svelte** - 5 buttons

**File**: `src/lib/modules/core/components/QuickCreateModal.svelte`

- Line 641: "Save as draft" button → `<Button variant="outline" size="sm">`
- Line 651: Fullscreen toggle button → `<Button variant="outline" iconOnly ariaLabel="...">`
- Line 679: Close button → `<Button variant="outline" iconOnly ariaLabel="Close">`
- Line 822: "Cancel" button → `<Button variant="outline">`
- Line 828: "Create" button → `<Button variant="primary">`

### 5. **InviteMemberModal.svelte** - 4 buttons

**File**: `src/lib/modules/core/organizations/components/InviteMemberModal.svelte`

- Line 178: "Cancel" button → `<Button variant="outline">`
- Line 186: "Invite User" button (submit) → `<Button variant="primary" type="submit">`
- Line 207: "Copy" button → `<Button variant="primary" size="sm">`
- Line 218: "Done" button → `<Button variant="primary">`

### 6. **InboxCard.svelte** - 1 button

**File**: `src/lib/modules/inbox/components/InboxCard.svelte`

- Line 37: Card clickable button → **Context-specific** (card pattern, may need custom component)

### 7. **ReadwiseDetail.svelte** - 1 button (already fixed 3, but missed 1)

**File**: `src/lib/modules/inbox/components/ReadwiseDetail.svelte`

- Line 642: "Skip" button → `<Button variant="outline">`

### 8. **PhotoDetail.svelte** - 1 button (already fixed back, but missed skip)

**File**: `src/lib/modules/inbox/components/PhotoDetail.svelte`

- Line 66: "Skip" button → Already uses `BitsButton.Root` (could convert to our Button)

### 9. **ManualDetail.svelte** - 1 button (already fixed back, but missed skip)

**File**: `src/lib/modules/inbox/components/ManualDetail.svelte`

- Line 54: "Skip" button → Already uses `BitsButton.Root` (could convert to our Button)

---

## Medium Priority (Specialized Patterns - May Need Custom Components)

### 10. **CreateMeetingModal.svelte** - Day selector buttons

**File**: `src/lib/modules/meetings/components/CreateMeetingModal.svelte`

- Line 577: Day of week toggle buttons (7 buttons) → **Specialized pattern** (toggle group)
- **Recommendation**: Consider creating `DaySelector` component or using `ToggleGroup`

### 11. **meetings/+page.svelte** - Tab buttons

**File**: `src/routes/(authenticated)/meetings/+page.svelte`

- Line 207, 216: Tab navigation buttons → **Specialized pattern** (tabs)
- **Recommendation**: Use existing `Tabs` component or create dedicated tab component

### 12. **MyMindHeader.svelte** - Filter buttons

**File**: `src/lib/components/my-mind/MyMindHeader.svelte`

- Multiple filter/clear buttons → **Specialized pattern** (filter UI)
- **Recommendation**: May need custom filter component

### 13. **dashboard/ActionItemsList.svelte** - Filter buttons

**File**: `src/lib/components/dashboard/ActionItemsList.svelte`

- Filter toggle buttons → **Specialized pattern** (filter UI)
- **Recommendation**: May need custom filter component

---

## Low Priority (Component Internals - May Be Intentional)

### 14. **ControlPanel.Button.svelte**

**File**: `src/lib/components/control-panel/ControlPanel.Button.svelte`

- **Status**: This IS a button component (wrapper), so native button is intentional
- **Action**: None needed

### 15. **StatusPill.svelte**, **ToggleSwitch.svelte**, etc.

**Files**: Various UI components

- **Status**: These are specialized components that use buttons internally
- **Action**: Review individually - may be intentional

---

## Context-Specific (Need Review)

### 16. **FlashcardReviewModal.svelte**

**File**: `src/lib/modules/inbox/components/FlashcardReviewModal.svelte`

- Line 231: Close button → Uses `Dialog.Close` (correct)

### 17. **OrganizationModals.svelte**

**File**: `src/lib/modules/core/organizations/components/OrganizationModals.svelte`

- Multiple close buttons → Check if using Dialog.Close

### 18. **SettingsSidebarHeader.svelte**

**File**: `src/lib/modules/core/components/SettingsSidebarHeader.svelte`

- Back button → May be specialized navigation pattern

---

## Files Already Fixed ✅

### Phase 1: High Priority Standard Buttons (19 buttons - COMPLETE)

1. ✅ `ErrorBoundary.svelte` - 2 buttons (Try Again, Reload)
2. ✅ `NoteDetail.svelte` - 3 buttons (Back, Export to Docs, Export to Blog)
3. ✅ `SyncReadwiseConfig.svelte` - 2 buttons (Cancel, Import)
4. ✅ `QuickCreateModal.svelte` - 5 buttons (Save draft, Fullscreen, Close, Cancel, Create)
5. ✅ `InviteMemberModal.svelte` - 4 buttons (Cancel, Invite, Copy, Done)
6. ✅ `ReadwiseDetail.svelte` - 1 button (Skip)
7. ✅ `PhotoDetail.svelte` - 1 button (Skip)
8. ✅ `ManualDetail.svelte` - 1 button (Skip)

### Previously Fixed (Initial Audit)

1. ✅ `ActionItemsList.svelte` (meetings module) - 7 buttons
2. ✅ `SecretarySelector.svelte` - 1 button
3. ✅ `ReadwiseDetail.svelte` - 3 buttons (back + nav)
4. ✅ `PhotoDetail.svelte` - 1 button (back)
5. ✅ `ManualDetail.svelte` - 1 button (back)
6. ✅ `org/circles/+page.svelte` - 2 buttons

---

## Priority Action Plan

### Phase 1: High Priority Standard Buttons (15 buttons)

1. ErrorBoundary.svelte (2)
2. NoteDetail.svelte (3)
3. SyncReadwiseConfig.svelte (2)
4. QuickCreateModal.svelte (5)
5. InviteMemberModal.svelte (4)
6. ReadwiseDetail.svelte (1 - skip button)
7. PhotoDetail.svelte (1 - skip button, convert BitsButton)
8. ManualDetail.svelte (1 - skip button, convert BitsButton)

### Phase 2: Specialized Patterns (Review & Custom Components)

1. CreateMeetingModal.svelte - Day selector (consider ToggleGroup)
2. meetings/+page.svelte - Tabs (use Tabs component)
3. MyMindHeader.svelte - Filters (review pattern)
4. dashboard/ActionItemsList.svelte - Filters (review pattern)

### Phase 3: Context Review

1. Review all component internals
2. Verify Dialog.Close usage
3. Check specialized navigation patterns

---

## Notes

- **InboxCard.svelte**: Card clickable button may need custom component (card pattern)
- **Specialized patterns**: Day selectors, tabs, filters may need dedicated components rather than Button
- **Bits UI components**: Some use `Button.Root` from bits-ui directly - consider converting to our wrapper
- **Dialog.Close**: Some buttons are Dialog.Close components (correct usage)

---

## Total Count

- **High Priority**: ~15 buttons ✅ **FIXED**
- **Medium Priority**: ~15 buttons (specialized patterns) - **NEEDS DESIGN REVIEW**
- **Low Priority**: ~5 buttons (component internals)
- **Total**: ~35 buttons across 20+ files

---

## Detailed Analysis: Specialized Patterns (For UI/UX Design Expert Review)

This section provides detailed analysis of specialized button patterns that require design system decisions. Each pattern has unique UX requirements that may need dedicated components rather than the standard `<Button>` component.

---

### 1. **CreateMeetingModal.svelte - Day Selector Toggle Group**

**File**: `src/lib/modules/meetings/components/CreateMeetingModal.svelte`  
**Lines**: 577-586  
**Pattern**: Multi-select toggle group for days of week

#### Current Implementation

```svelte
<div class="flex gap-icon">
	{#each dayNames as day, index (index)}
		{@const isSelected = state.recurrence.daysOfWeek.includes(index)}
		<button
			type="button"
			onclick={() => toggleDay(index)}
			class="size-input-lg text-body-sm flex items-center justify-center rounded-input border transition-colors {isSelected
				? 'border-accent-primary bg-accent-primary text-white'
				: 'bg-surface-base hover:bg-surface-hover border-border-base text-text-secondary'}"
		>
			{day}
		</button>
	{/each}
</div>
```

#### Use Case & Challenge

**Use Case**:

- User selects which days of the week a recurring meeting should occur
- Multiple days can be selected simultaneously (e.g., "Mon, Wed, Fri")
- Visual feedback shows selected vs. unselected state
- Compact horizontal layout (7 buttons in a row)

**UX Challenges**:

1. **Multi-select pattern**: Unlike standard buttons (single action), these toggle between selected/unselected states
2. **Visual grouping**: The 7 buttons form a cohesive group that should be visually connected
3. **State management**: Selected state needs clear visual distinction (currently: accent background + white text)
4. **Accessibility**: Screen readers need to understand this is a multi-select group, not individual action buttons
5. **Keyboard navigation**: Arrow keys should navigate between days, Space should toggle selection
6. **Touch targets**: Small buttons (size-input-lg) need to be easily tappable on mobile

**Design Questions**:

- Should this use `ToggleGroup` component from Bits UI? (Available: `src/lib/components/ui/ToggleGroup.svelte`)
- Should selected state use accent color (current) or a different visual treatment?
- Should we support keyboard shortcuts (e.g., "M" for Monday)?
- Should there be "Select All" / "Clear All" buttons for convenience?

**Recommendation**:

- **Option A**: Use Bits UI `ToggleGroup` component (multi-select mode) - provides proper ARIA attributes and keyboard navigation
- **Option B**: Create dedicated `DaySelector` component that wraps ToggleGroup with meeting-specific styling
- **Option C**: Keep as buttons but wrap in proper ARIA group role and add keyboard handlers

---

### 2. **meetings/+page.svelte - Tab Navigation**

**File**: `src/routes/(authenticated)/meetings/+page.svelte`  
**Lines**: 207-224  
**Pattern**: Horizontal tab navigation

#### Current Implementation

```svelte
<div class="flex border-b border-border-base">
	<button
		onclick={() => (state.activeTab = 'my-meetings')}
		class="border-b-2 px-form-section py-header text-button font-medium transition-colors {state.activeTab ===
		'my-meetings'
			? 'border-accent-primary text-accent-primary'
			: 'border-transparent text-text-secondary hover:text-text-primary'}"
	>
		My meetings
	</button>
	<button
		onclick={() => (state.activeTab = 'reports')}
		class="border-b-2 px-form-section py-header text-button font-medium transition-colors {state.activeTab ===
		'reports'
			? 'border-accent-primary text-accent-primary'
			: 'border-transparent text-text-secondary hover:text-text-primary'}"
	>
		Reports
	</button>
</div>
```

#### Use Case & Challenge

**Use Case**:

- User switches between two views: "My meetings" and "Reports"
- Only one tab can be active at a time (mutually exclusive)
- Active tab shows content below, inactive tab shows different content
- Common navigation pattern in dashboard/workspace UIs

**UX Challenges**:

1. **Tab semantics**: These are navigation tabs, not action buttons - different semantic meaning
2. **Active state indicator**: Uses bottom border (2px accent color) - standard tab pattern
3. **Content switching**: Clicking tab changes entire page content below (not just button state)
4. **Accessibility**: Should use proper ARIA tab roles (`role="tablist"`, `role="tab"`, `role="tabpanel"`)
5. **Keyboard navigation**: Arrow keys should navigate between tabs, Enter/Space should activate
6. **Visual connection**: Tabs should visually connect to content area below

**Design Questions**:

- Should we use existing `Tabs` component? (Available: `src/lib/components/ui/Tabs.svelte`)
- Current `Tabs` component uses Bits UI - does it match the current visual design?
- Should tabs have icons in addition to text?
- Should we support more than 2 tabs in the future?

**Recommendation**:

- **Option A**: Use existing `Tabs` component - provides proper ARIA and keyboard navigation
- **Option B**: Create `TabButton` component that wraps Button with tab-specific styling
- **Option C**: Keep as buttons but add proper ARIA tab roles and keyboard handlers

**Note**: Existing `Tabs` component uses Bits UI `Tabs` primitive, which provides proper accessibility. However, current implementation has custom styling that may not match.

---

### 3. **MyMindHeader.svelte - Filter Pills with Remove Buttons**

**File**: `src/lib/components/my-mind/MyMindHeader.svelte`  
**Lines**: 74-88, 209-223, 231-243  
**Pattern**: Filter pills with embedded remove buttons

#### Current Implementation

**Clear Search Button** (Line 74):

```svelte
<button
	type="button"
	onclick={() => onSearchChange('')}
	class="absolute top-1/2 right-3 -translate-y-1/2 text-tertiary transition-colors hover:text-primary"
	aria-label="Clear search"
>
	<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
</button>
```

**Filter Pill Remove Buttons** (Lines 209-223, 231-243):

```svelte
<span class="inline-flex items-center gap-1 rounded-full bg-tag px-3 py-1 text-sm text-tag">
	Search: "{searchQuery}"
	<button
		type="button"
		onclick={() => onSearchChange('')}
		class="transition-colors hover:text-primary"
		aria-label="Remove search filter"
	>
		<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 18L18 6M6 6l12 12"
			/>
		</svg>
	</button>
</span>
```

#### Use Case & Challenge

**Use Case**:

- User applies filters (search query, type filter) to narrow down "My Mind" items
- Active filters appear as pills/badges showing what's currently filtered
- User can remove individual filters by clicking X button inside pill
- Clear search button appears inside search input when text is entered

**UX Challenges**:

1. **Embedded button pattern**: Small icon-only buttons inside pills/inputs - different from standalone buttons
2. **Touch target size**: Small buttons (h-3 w-3, h-4 w-4) may be hard to tap on mobile
3. **Visual hierarchy**: Remove button should be secondary to pill content, not compete for attention
4. **Accessibility**: Icon-only buttons need proper aria-label (currently have them ✅)
5. **Hover states**: Subtle hover effect (color change) - appropriate for embedded actions
6. **Contextual placement**: Buttons appear conditionally (only when filter is active)

**Design Questions**:

- Should embedded remove buttons use Button component with `iconOnly` prop?
- Current size (h-3/h-4) may be too small - should we increase to meet touch target guidelines (44x44px)?
- Should remove buttons have more prominent hover state (background change)?
- Should we create a `FilterPill` component that encapsulates pill + remove button?

**Recommendation**:

- **Option A**: Create `FilterPill` component that wraps Button with pill-specific styling
- **Option B**: Use Button component with `iconOnly` prop but increase size for better touch targets
- **Option C**: Keep as native buttons but ensure minimum touch target size (44x44px)

**Note**: Clear search button inside input is a common pattern (Gmail, Linear, etc.) - may be acceptable as-is if touch targets are adequate.

---

### 4. **dashboard/ActionItemsList.svelte - Filter Tabs**

**File**: `src/lib/components/dashboard/ActionItemsList.svelte`  
**Lines**: 111-146  
**Pattern**: Horizontal filter tabs with counts

#### Current Implementation

```svelte
<div class="mb-content-section flex gap-2 border-b border-border-base">
	<button
		onclick={() => (state.activeFilter = 'all')}
		class="border-b-2 px-nav-item py-nav-item text-sm font-medium transition-colors {state.activeFilter ===
		'all'
			? 'border-accent-primary text-accent-primary'
			: 'border-transparent text-text-secondary hover:text-text-primary'}"
	>
		All ({actionItems.length})
	</button>
	<button
		onclick={() => (state.activeFilter = 'todo')}
		class="border-b-2 px-nav-item py-nav-item text-sm font-medium transition-colors {state.activeFilter ===
		'todo'
			? 'border-accent-primary text-accent-primary'
			: 'border-transparent text-text-secondary hover:text-text-primary'}"
	>
		To Do ({actionItems.filter((item) => item.status === 'todo').length})
	</button>
	<!-- ... more tabs ... -->
</div>
```

#### Use Case & Challenge

**Use Case**:

- User filters action items by status: All, To Do, In Progress, Done
- Each tab shows count of items in that category (e.g., "To Do (5)")
- Only one filter can be active at a time
- Filtering changes the list content below

**UX Challenges**:

1. **Dynamic counts**: Counts update reactively - need to ensure smooth updates without layout shift
2. **Tab semantics**: Similar to meetings tabs - navigation/filtering, not actions
3. **Visual pattern**: Uses bottom border indicator (same as meetings tabs) - consistent pattern
4. **Accessibility**: Should use proper ARIA tab roles
5. **Performance**: Count calculations run on every render - may need memoization
6. **Empty states**: Each filter has different empty state message

**Design Questions**:

- Should this use the same `Tabs` component as meetings page for consistency?
- Should counts be visually distinct (e.g., badge style) or inline with text?
- Should we support keyboard shortcuts (e.g., "1" for All, "2" for To Do)?
- Should tabs scroll horizontally on mobile if we add more filters?

**Recommendation**:

- **Option A**: Use existing `Tabs` component - provides consistency with meetings page
- **Option B**: Create `FilterTabs` component that extends Tabs with count display
- **Option C**: Keep as buttons but add proper ARIA roles and ensure counts don't cause layout shift

**Note**: This is essentially the same pattern as meetings tabs - should use same component for consistency.

---

### 5. **InboxCard.svelte - Clickable Card Pattern**

**File**: `src/lib/modules/inbox/components/InboxCard.svelte`  
**Lines**: 37-83  
**Pattern**: Entire card is clickable button

#### Current Implementation

```svelte
<button
  type="button"
  data-inbox-item-id={item._id}
  class="w-full rounded-button border bg-elevated text-left transition-all duration-150 outline-none"
  class:border-2={selected}
  class:border-selected={selected}
  class:border-base={!selected}
  class:hover:bg-hover-solid={!selected}
  class:hover:border-elevated={!selected}
  class:focus-visible:ring-2={!selected}
  class:focus-visible:ring-accent-primary={!selected}
  class:focus-visible:ring-offset-2={!selected}
  onclick={(e) => {
    (e.currentTarget as HTMLElement)?.blur();
    onClick();
  }}
>
  <!-- Card content: icon, title, snippet, tags -->
</button>
```

#### Use Case & Challenge

**Use Case**:

- User clicks anywhere on card to open inbox item detail view
- Card shows preview: icon, title, snippet, tags
- Selected state shows thicker border (2px vs 1px) with accent color
- Card appears in list/grid of inbox items

**UX Challenges**:

1. **Card vs button semantics**: Entire card acts as button - semantic mismatch (button contains complex content)
2. **Accessibility**: Screen readers need to understand this is a navigational card, not a form button
3. **Visual design**: Looks like a card (border, padding, content) but behaves like a button
4. **Selected state**: Uses border thickness change (1px → 2px) - subtle but clear
5. **Focus management**: Blurs after click to clear hover state - may interfere with keyboard navigation
6. **Touch targets**: Large clickable area is good for mobile, but may be too large for desktop

**Design Questions**:

- Should this be a `<div>` with `role="button"` and `tabindex` instead of `<button>`?
- Should we create a `ClickableCard` component that handles card + button semantics?
- Should selected state use more prominent visual treatment (background color change)?
- Should cards support secondary actions (e.g., right-click menu, long-press on mobile)?

**Recommendation**:

- **Option A**: Create `ClickableCard` component that uses proper semantic HTML (`<div role="button">`) with full keyboard/ARIA support
- **Option B**: Keep as button but ensure proper ARIA labels and keyboard navigation
- **Option C**: Use `<a>` tag if cards navigate to URLs (more semantic for navigation)

**Note**: This is a common pattern in modern UIs (Linear, Notion, etc.) - cards that are clickable. The challenge is maintaining accessibility while using button semantics for complex content.

---

### 6. **Dialog.Close Usage - Context Review**

**Files**: Multiple files use `Dialog.Close` from Bits UI  
**Pattern**: Close buttons inside dialogs/modals

#### Current Implementation Examples

**FlashcardReviewModal.svelte**:

```svelte
<Dialog.Close
	type="button"
	onclick={onClose}
	class="flex icon-xl flex-shrink-0 items-center justify-center rounded-button text-secondary transition-colors hover:bg-hover-solid hover:text-primary"
>
	<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
</Dialog.Close>
```

#### Use Case & Challenge

**Use Case**:

- User closes modal/dialog by clicking X button in header
- `Dialog.Close` component from Bits UI automatically handles ESC key, backdrop click, etc.
- Icon-only button with hover state

**UX Challenges**:

1. **Component integration**: `Dialog.Close` is a Bits UI primitive - wraps button with dialog-specific behavior
2. **Styling consistency**: Currently uses custom classes - should it use Button component styling?
3. **Accessibility**: Bits UI handles ARIA attributes automatically - good ✅
4. **Visual placement**: Usually top-right corner of dialog header
5. **Touch targets**: Icon-only button needs adequate size for mobile

**Design Questions**:

- Should `Dialog.Close` use our Button component internally, or keep as-is?
- Should we create a wrapper component `DialogCloseButton` that combines Dialog.Close + Button styling?
- Should close buttons always be icon-only, or support text labels for accessibility?

**Recommendation**:

- **Option A**: Create `DialogCloseButton` component that wraps `Dialog.Close` with Button styling
- **Option B**: Keep as-is (Dialog.Close handles behavior, custom classes handle styling)
- **Option C**: Verify all Dialog.Close usages have proper aria-label (currently some may be missing)

**Status**: ✅ **Mostly correct** - Dialog.Close is appropriate, but styling could be standardized

---

## Summary of Design Decisions Needed

### High Priority Decisions

1. **Day Selector (CreateMeetingModal)**:
   - Use ToggleGroup component?
   - Create DaySelector wrapper?
   - Keep as buttons with ARIA?

2. **Tab Navigation (meetings, dashboard)**:
   - Use existing Tabs component?
   - Create TabButton component?
   - Keep as buttons with ARIA?

3. **Clickable Cards (InboxCard)**:
   - Create ClickableCard component?
   - Use semantic div + role?
   - Keep as button?

### Medium Priority Decisions

4. **Filter Pills (MyMindHeader)**:
   - Create FilterPill component?
   - Increase touch target size?
   - Keep as-is?

5. **Dialog.Close Buttons**:
   - Create DialogCloseButton wrapper?
   - Standardize styling?
   - Keep as-is?

---

## Next Steps

1. **UI/UX Design Expert Review**: Review each pattern above and provide design system guidance
2. **Component Creation**: Create specialized components where needed (DaySelector, ClickableCard, FilterPill, etc.)
3. **Accessibility Audit**: Ensure all specialized patterns meet WCAG 2.1 AA standards
4. **Keyboard Navigation**: Add proper keyboard handlers for all interactive patterns
5. **Touch Target Audit**: Ensure all buttons meet minimum 44x44px touch target size

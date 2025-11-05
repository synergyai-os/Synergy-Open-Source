# Inbox Testing Strategy & Test Candidates

**Date**: 2025-01-02  
**Testing Tools**: Vitest (unit/component), Playwright (E2E), vitest-browser-svelte (Svelte component testing)

---

## Testing Philosophy

Following the **Testing Pyramid**:
- **Unit Tests** (70%): Pure functions, utilities, composables, business logic
- **Component Tests** (20%): UI components, user interactions, state changes
- **E2E Tests** (10%): Critical user flows, integration scenarios

**Principle**: Test behavior, not implementation. Write tests that give confidence without being brittle.

---

## Current Test Setup

✅ **Vitest** - Unit and component tests  
✅ **vitest-browser-svelte** - Svelte component testing (already configured)  
✅ **Playwright** - E2E tests  
⚠️ **Missing**: `@testing-library/svelte` or equivalent (vitest-browser-svelte provides this)

---

## Test Candidates by Priority

### 🔴 Priority 1: Foundation Tests (Start Here)

These are easy to write, high-value, and build testing confidence.

#### 1. **Utility Functions** (Unit Tests) ⭐ START HERE

**Why**: Pure functions are easiest to test, no mocking needed.

**Candidates**:
- ✅ `getTypeIcon()` in `InboxCard.svelte` (Lines 29-40)
  - **Type**: Unit test
  - **Complexity**: Very Low
  - **Value**: High (used everywhere)
  - **Test Cases**:
    - Returns correct icon for each type
    - Returns default icon for unknown type

- ✅ `normalizeTagName()` in `convex/readwiseUtils.ts` (if exists)
  - **Type**: Unit test  
  - **Complexity**: Low
  - **Value**: High (data consistency)
  - **Test Cases**:
    - Lowercases tag names
    - Trims whitespace
    - Handles special characters
    - Handles empty strings

- ✅ `validateCircularReference()` in `convex/tags.ts` (Lines 17-46)
  - **Type**: Unit test
  - **Complexity**: Medium
  - **Value**: High (prevents data corruption)
  - **Test Cases**:
    - Allows setting parent when no cycle exists
    - Prevents tag being its own parent
    - Prevents direct circular reference (A → B → A)
    - Prevents deep circular reference (A → B → C → A)
    - Handles orphaned tags gracefully

- ✅ `buildTagTree()` in `convex/tags.ts` (Lines 65-110)
  - **Type**: Unit test
  - **Complexity**: Medium
  - **Value**: High (core tag hierarchy logic)
  - **Test Cases**:
    - Builds flat list correctly
    - Calculates levels correctly (0 for root, 1 for children, etc.)
    - Handles orphaned tags (parent doesn't exist)
    - Handles tags with multiple levels

**After Refactoring** (extract these):
- `getNextItemIndex()` / `getPreviousItemIndex()` - Navigation utilities
- `formatSyncMessage()` - Sync result formatting

---

#### 2. **Simple Component** (Component Test)

**Why**: Build confidence in component testing before tackling complex ones.

**Candidate**:
- ✅ `InboxCard.svelte` (87 lines)
  - **Type**: Component test (vitest-browser-svelte)
  - **Complexity**: Low-Medium
  - **Value**: Medium (UI representation)
  - **Test Cases**:
    - Renders title and snippet
    - Shows correct icon for each type
    - Displays tags (up to 2)
    - Applies selected styling when `selected={true}`
    - Calls `onClick` when clicked
    - Handles missing title/snippet gracefully
    - Shows no tags when tags array is empty

**Why This One First?**
- Small, focused component
- Clear props interface
- No complex state or side effects
- Good learning exercise for component testing

---

### 🟡 Priority 2: Business Logic Tests

These test the core business rules and data transformations.

#### 3. **Query Tracking Logic** (Unit Test)

**When**: After extracting to `useSelectedItem` composable

- ✅ Race condition prevention logic
  - **Type**: Unit test
  - **Complexity**: Medium
  - **Value**: Very High (prevented bugs!)
  - **Test Cases**:
    - Ignores stale query results when selectedItemId changes
    - Only updates when queryId matches currentQueryId
    - Cleans up correctly on unmount

---

#### 4. **Tag State Management** (Component/Integration Test)

**When**: After refactoring `TagSelector`

- ✅ Tag selection/unselection
  - **Type**: Component test
  - **Test Cases**:
    - Toggles tag selection on click
    - Filters tags by search term
    - Shows "Create new tag" when no matches
    - Creates tag with selected color
    - Removes tag from selected list

---

### 🟢 Priority 3: Integration Tests

These test how multiple pieces work together.

#### 5. **Keyboard Navigation** (E2E Test)

**When**: After extracting to composable

- ✅ J/K navigation
  - **Type**: E2E test (Playwright)
  - **Complexity**: Low-Medium
  - **Value**: High (keyboard users depend on this)
  - **Test Cases**:
    - J key navigates to next item
    - K key navigates to previous item
    - Wraps around at boundaries (J at end → first, K at start → last)
    - Scrolls item into view
    - Doesn't trigger when typing in input/textarea
    - Works in both desktop and mobile views

**Why E2E?**
- Tests actual keyboard events
- Tests scroll behavior
- Tests focus management

---

#### 6. **Inbox Item Selection Flow** (E2E Test)

- ✅ Select item → view details → switch items
  - **Type**: E2E test (Playwright)
  - **Complexity**: Medium
  - **Value**: Very High (core user flow)
  - **Test Cases**:
    - Clicking inbox item shows detail view
    - Detail view shows correct data (source, author, tags)
    - Switching to another item updates detail view correctly
    - No stale data from previous selection
    - Works in desktop 3-column layout
    - Works in mobile single-view layout

---

#### 7. **Tag Creation & Assignment** (E2E Test)

- ✅ Create tag → assign to highlight → verify persistence
  - **Type**: E2E test (Playwright)
  - **Complexity**: Medium-High
  - **Value**: High (core feature)
  - **Test Cases**:
    - Press 'T' opens tag selector
    - Type non-existent tag name
    - Press Enter → color picker appears
    - Select color → tag created and assigned
    - Tag appears in sidebar immediately
    - Tag persists after page refresh
    - Tag appears in other inbox items (global availability)

---

#### 8. **Sync Flow** (E2E Test)

- ✅ Initiate sync → track progress → verify results
  - **Type**: E2E test (Playwright)
  - **Complexity**: High (requires mocking Convex)
  - **Value**: High (core feature)
  - **Test Cases**:
    - Click sync button opens config panel
    - Selecting options and clicking import starts sync
    - Progress updates appear
    - Success message shows on completion
    - New items appear in inbox list
    - Error handling when sync fails

---

## Recommended Test Implementation Order

### Phase 1: Foundation (Week 1)
1. ✅ `getTypeIcon()` - Pure function, instant win
2. ✅ `InboxCard.svelte` - Component testing practice
3. ✅ `normalizeTagName()` - Data consistency
4. ✅ `validateCircularReference()` - Critical business logic

**Goal**: Learn testing tools, build confidence, establish patterns

---

### Phase 2: During Refactoring (Week 2)
5. ✅ Extract `useKeyboardNavigation` → test it
6. ✅ Extract `useSelectedItem` → test query tracking
7. ✅ Extract navigation utilities → test them

**Goal**: Test extracted logic as we create it

---

### Phase 3: Integration (Week 3)
8. ✅ Keyboard navigation E2E test
9. ✅ Item selection flow E2E test
10. ✅ Tag creation E2E test

**Goal**: Ensure everything works together

---

## Testing Tools & Setup

### Unit Tests (Vitest)
```typescript
// src/lib/utils/getTypeIcon.test.ts
import { describe, it, expect } from 'vitest';
import { getTypeIcon } from './getTypeIcon';

describe('getTypeIcon', () => {
  it('returns correct icon for readwise_highlight', () => {
    expect(getTypeIcon('readwise_highlight')).toBe('📚');
  });
  // ... more tests
});
```

### Component Tests (vitest-browser-svelte)
```typescript
// src/lib/components/inbox/InboxCard.svelte.test.ts
import { render } from 'vitest-browser-svelte';
import { expect, test } from 'vitest';
import InboxCard from './InboxCard.svelte';

test('renders item title and snippet', async () => {
  const screen = render(InboxCard, {
    item: {
      _id: 'test-1',
      type: 'readwise_highlight',
      title: 'Test Title',
      snippet: 'Test snippet...',
      // ...
    },
    selected: false,
    onClick: () => {}
  });

  await expect.element(screen.getByText('Test Title')).toBeVisible();
  await expect.element(screen.getByText('Test snippet...')).toBeVisible();
});
```

### E2E Tests (Playwright)
```typescript
// e2e/inbox-navigation.test.ts
import { test, expect } from '@playwright/test';

test('keyboard navigation works', async ({ page }) => {
  await page.goto('/inbox');
  
  // Wait for inbox items to load
  await page.waitForSelector('[data-inbox-item-id]');
  
  // Press J to navigate down
  await page.keyboard.press('J');
  
  // Verify first item is selected
  const firstItem = page.locator('[data-inbox-item-id]').first();
  await expect(firstItem).toHaveClass(/border-selected/);
});
```

---

## Mocking Strategy

### Convex Queries/Mutations
- **Option 1**: Mock `useConvexClient()` in tests
- **Option 2**: Use Vitest's `vi.mock()` to mock Convex client
- **Option 3**: Create test fixtures with sample data

### Example Mock Setup:
```typescript
// src/lib/test-utils/mockConvex.ts
import { vi } from 'vitest';

export const mockConvexClient = {
  query: vi.fn(),
  mutation: vi.fn(),
  action: vi.fn(),
};
```

---

## Test Coverage Goals

### Initial Target (Phase 1)
- **Utilities**: 80%+ coverage
- **Simple Components**: 60%+ coverage
- **Critical Paths**: 100% coverage

### After Refactoring
- **Composables**: 80%+ coverage
- **All Components**: 60%+ coverage
- **E2E Critical Flows**: 100% coverage

---

## Test Organization

```
src/
├── lib/
│   ├── components/
│   │   └── inbox/
│   │       ├── InboxCard.svelte
│   │       └── InboxCard.svelte.test.ts
│   ├── composables/
│   │   ├── useInboxItems.ts
│   │   └── useInboxItems.test.ts
│   └── utils/
│       ├── inboxNavigation.ts
│       └── inboxNavigation.test.ts
convex/
├── tags.ts
└── tags.test.ts
e2e/
├── inbox-navigation.test.ts
├── inbox-selection.test.ts
└── tag-creation.test.ts
```

---

## Discussion Questions

Before we proceed, let's discuss:

1. **Which should we start with?**
   - My recommendation: `getTypeIcon()` + `InboxCard` (easiest wins)

2. **E2E vs Unit for sync logic?**
   - My recommendation: Unit test the composable, E2E test the full flow

3. **How much mocking for Convex?**
   - My recommendation: Mock at the client level, test logic with fixtures

4. **Test location strategy?**
   - My recommendation: Co-locate tests (`.test.ts` next to source)

---

## Next Steps

1. ✅ Review this strategy
2. Discuss priorities and approach
3. Start with Phase 1 tests
4. Document patterns in `dev-docs/patterns-and-lessons.md`
5. Integrate tests into refactoring plan


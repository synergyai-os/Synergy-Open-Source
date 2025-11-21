# SYOS-253 Testing Guide: Hierarchical Panel Navigation Refactor

## 🧪 Manual Testing Checklist

### Critical Paths (Must Test)

#### 1. Basic Panel Navigation

- [ ] **Open Circle Panel**: Click circle in org chart → panel slides in from right
- [ ] **Open Role Panel**: Click role in circle panel → role panel slides in (stacks on top)
- [ ] **Close Panel**: Click X button → panel closes, returns to previous state
- [ ] **Backdrop Click**: Click backdrop (dark overlay) → panel closes

#### 2. Breadcrumb Navigation

- [ ] **Breadcrumbs Appear**: Open circle → open role → breadcrumb bar appears on left
- [ ] **Breadcrumb Click**: Click breadcrumb → jumps to that layer (e.g., click circle breadcrumb → goes back to circle)
- [ ] **Breadcrumb Positioning**: Multiple breadcrumbs stack correctly (48px apart)
- [ ] **Breadcrumb Text**: Vertical text displays correctly (rotated, readable)

#### 3. ESC Key Handling

- [ ] **Single Panel ESC**: Open circle → press ESC → closes panel
- [ ] **Stacked Panels ESC**: Open circle → open role → press ESC → closes role (topmost), circle remains
- [ ] **ESC Topmost Check**: With circle + role open, ESC only closes role (not both)
- [ ] **ESC Empty Stack**: Close all panels → ESC does nothing (no errors)

#### 4. Z-Index Stacking

- [ ] **Panel Above Sidebar**: Panel z-index (60+) appears above sidebar (z-50)
- [ ] **Multiple Panels Stack**: Each panel has higher z-index (60, 70, 80...)
- [ ] **Backdrop Z-Index**: Backdrop appears below panel (z-index - 1)

#### 5. Panel Width Calculation

- [ ] **No Breadcrumbs**: First panel uses full width (no offset)
- [ ] **With Breadcrumbs**: Panel width adjusts (calc(100% - breadcrumbWidth))
- [ ] **Multiple Breadcrumbs**: Width adjusts for multiple breadcrumbs (48px × count)
- [ ] **Content Padding**: Panel content has left padding equal to breadcrumb width

#### 6. Edge Cases

- [ ] **Rapid Open/Close**: Quickly open and close panel → no double-close bug
- [ ] **Click Same Element**: Click element that opens panel → doesn't immediately close (100ms delay)
- [ ] **Empty Stack**: Navigate to empty stack → no errors
- [ ] **Deep Navigation**: Navigate 3+ levels deep → all breadcrumbs visible

### Visual Regression Checks

- [ ] **Panel Animation**: Panel slides smoothly (300ms transition)
- [ ] **Backdrop Opacity**: Backdrop has correct opacity (50% black, blur)
- [ ] **Breadcrumb Hover**: Breadcrumb bars highlight on hover
- [ ] **Panel Responsive**: Panel width adapts on different screen sizes
- [ ] **Dark Mode**: All elements visible in dark mode

### Browser Compatibility

- [ ] **Chrome**: All features work
- [ ] **Firefox**: All features work
- [ ] **Safari**: All features work
- [ ] **Mobile Viewport**: Panel responsive (if applicable)

---

## 🧩 Unit Test Scenarios

### 1. `useNavigationStack` Composable Tests

**File**: `tests/composables/useNavigationStack.test.ts`

```typescript
describe('useNavigationStack', () => {
	test('initializes with empty stack', () => {
		const stack = useNavigationStack();
		expect(stack.depth).toBe(0);
		expect(stack.currentLayer).toBeNull();
		expect(stack.previousLayer).toBeNull();
	});

	test('push adds layer with correct z-index', () => {
		const stack = useNavigationStack();
		stack.push({ type: 'circle', id: '1', name: 'Engineering' });

		expect(stack.depth).toBe(1);
		expect(stack.currentLayer?.zIndex).toBe(60); // baseZIndex
		expect(stack.currentLayer?.id).toBe('1');
	});

	test('z-index increments per layer', () => {
		const stack = useNavigationStack();
		stack.push({ type: 'circle', id: '1', name: 'Engineering' });
		stack.push({ type: 'role', id: '2', name: 'Lead' });

		expect(stack.stack[0].zIndex).toBe(60);
		expect(stack.stack[1].zIndex).toBe(70); // +10 increment
	});

	test('pop removes top layer', () => {
		const stack = useNavigationStack();
		stack.push({ type: 'circle', id: '1', name: 'Engineering' });
		stack.push({ type: 'role', id: '2', name: 'Lead' });

		stack.pop();

		expect(stack.depth).toBe(1);
		expect(stack.currentLayer?.id).toBe('1');
	});

	test('pop on empty stack does nothing', () => {
		const stack = useNavigationStack();
		stack.pop(); // Should not throw
		expect(stack.depth).toBe(0);
	});

	test('jumpTo removes layers above index', () => {
		const stack = useNavigationStack();
		stack.push({ type: 'circle', id: '1', name: 'Engineering' });
		stack.push({ type: 'circle', id: '2', name: 'Frontend' });
		stack.push({ type: 'role', id: '3', name: 'Lead' });

		stack.jumpTo(0); // Jump to first layer

		expect(stack.depth).toBe(1);
		expect(stack.currentLayer?.id).toBe('1');
	});

	test('jumpTo with invalid index does nothing', () => {
		const stack = useNavigationStack();
		stack.push({ type: 'circle', id: '1', name: 'Engineering' });

		stack.jumpTo(-1); // Invalid
		stack.jumpTo(10); // Out of bounds

		expect(stack.depth).toBe(1); // Unchanged
	});

	test('getLayer returns correct layer', () => {
		const stack = useNavigationStack();
		stack.push({ type: 'circle', id: '1', name: 'Engineering' });
		stack.push({ type: 'role', id: '2', name: 'Lead' });

		expect(stack.getLayer(0)?.id).toBe('1');
		expect(stack.getLayer(1)?.id).toBe('2');
		expect(stack.getLayer(2)).toBeNull();
	});

	test('clear removes all layers', () => {
		const stack = useNavigationStack();
		stack.push({ type: 'circle', id: '1', name: 'Engineering' });
		stack.push({ type: 'role', id: '2', name: 'Lead' });

		stack.clear();

		expect(stack.depth).toBe(0);
		expect(stack.currentLayer).toBeNull();
	});

	test('previousLayer returns second-to-last', () => {
		const stack = useNavigationStack();
		stack.push({ type: 'circle', id: '1', name: 'Engineering' });
		stack.push({ type: 'role', id: '2', name: 'Lead' });

		expect(stack.previousLayer?.id).toBe('1');
	});
});
```

### 2. `StackedPanel` Component Tests

**File**: `tests/components/ui/StackedPanel.test.ts`

```typescript
describe('StackedPanel', () => {
	test('renders when isOpen is true', () => {
		// Test panel visibility
	});

	test('does not render when isOpen is false', () => {
		// Test panel hidden
	});

	test('shows backdrop when open', () => {
		// Test backdrop visibility
	});

	test('backdrop has correct z-index (panel z-index - 1)', () => {
		// Test z-index calculation
	});

	test('calculates breadcrumb width correctly', () => {
		// Test: 0 breadcrumbs = 0px, 1 breadcrumb = 48px, 2 breadcrumbs = 96px
	});

	test('applies panel width offset when breadcrumbs exist', () => {
		// Test width calculation: calc(100% - totalBreadcrumbWidth)
	});

	test('applies content padding when breadcrumbs exist', () => {
		// Test padding-left equals breadcrumb width
	});

	test('calls onClose when backdrop clicked', () => {
		// Test backdrop click handler
	});

	test('ignores backdrop click within 100ms of opening', () => {
		// Test rapid open/close prevention
	});

	test('calls onClose when ESC pressed (topmost only)', () => {
		// Test ESC key handler with isTopmost check
	});

	test('does not call onClose when ESC pressed (not topmost)', () => {
		// Test ESC key handler respects topmost check
	});

	test('renders PanelBreadcrumbs when hasBreadcrumbs is true', () => {
		// Test breadcrumb component rendering
	});

	test('calls onBreadcrumbClick with correct index', () => {
		// Test breadcrumb click handler
	});
});
```

### 3. `PanelBreadcrumbs` Component Tests

**File**: `tests/components/ui/PanelBreadcrumbs.test.ts`

```typescript
describe('PanelBreadcrumbs', () => {
	test('renders breadcrumbs for all layers except current', () => {
		// Test: stack of 3 layers → 2 breadcrumbs shown
	});

	test('positions breadcrumbs correctly (48px apart)', () => {
		// Test left positioning: index * 48px
	});

	test('calls onBreadcrumbClick with correct index', () => {
		// Test click handler passes correct index
	});

	test('displays correct icon for circle type', () => {
		// Test circle icon rendering
	});

	test('displays correct icon for role type', () => {
		// Test role icon rendering
	});

	test('displays layer name correctly', () => {
		// Test text content
	});

	test('renders nothing when stack has 0 or 1 layers', () => {
		// Test empty state
	});
});
```

---

## 🔗 Integration Test Scenarios

### 1. Navigation Stack + Panel Integration

**File**: `tests/integration/panel-navigation.test.ts`

```typescript
describe('Panel Navigation Integration', () => {
	test('opening panel pushes to navigation stack', () => {
		// Test: Open panel → stack depth increases
		// Test: currentLayer matches opened panel
	});

	test('closing panel pops from navigation stack', () => {
		// Test: Close panel → stack depth decreases
		// Test: currentLayer updates correctly
	});

	test('breadcrumb click jumps to correct layer', () => {
		// Test: Stack [Circle, SubCircle, Role]
		// Test: Click breadcrumb[0] → jumpTo(0) → stack becomes [Circle]
	});

	test('ESC key closes topmost panel only', () => {
		// Test: Stack [Circle, Role]
		// Test: ESC → closes Role, Circle remains
		// Test: isTopmost() correctly identifies Role as topmost
	});

	test('panel z-index matches stack layer z-index', () => {
		// Test: Panel z-index equals navigationStack.currentLayer.zIndex
	});

	test('breadcrumb count matches stack depth - 1', () => {
		// Test: Stack depth 3 → breadcrumb count 2
	});
});
```

### 2. Org Chart + StackedPanel Integration

**File**: `tests/integration/org-chart-panel.test.ts`

```typescript
describe('Org Chart Panel Integration', () => {
	test('CircleDetailPanel uses StackedPanel correctly', () => {
		// Test: CircleDetailPanel wraps content in StackedPanel
		// Test: Passes correct props (isOpen, navigationStack, handlers)
	});

	test('RoleDetailPanel uses StackedPanel correctly', () => {
		// Test: RoleDetailPanel wraps content in StackedPanel
		// Test: Passes correct props
	});

	test('isTopmost correctly identifies circle panel', () => {
		// Test: Only circle panel open → isTopmost() returns true
		// Test: Role panel also open → circle isTopmost() returns false
	});

	test('isTopmost correctly identifies role panel', () => {
		// Test: Role panel is topmost when both panels open
	});

	test('handleClose navigates to previous layer correctly', () => {
		// Test: Close role → navigates back to circle
		// Test: Close circle (no previous) → closes everything
	});

	test('handleBreadcrumbClick navigates correctly', () => {
		// Test: Click breadcrumb → jumpTo() + re-open panel
	});
});
```

---

## 🎭 E2E Test Scenarios

### 1. Basic Panel Navigation Flow

**File**: `e2e/org-chart-panel-navigation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Org Chart Panel Navigation', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to org chart page
		await page.goto('/org-chart');
		await page.waitForLoadState('networkidle');
	});

	test('user can open and close circle panel', async ({ page }) => {
		// 1. Click circle in org chart
		// 2. Verify panel slides in from right
		// 3. Verify circle details visible
		// 4. Click close button
		// 5. Verify panel slides out
	});

	test('user can navigate circle → role → back', async ({ page }) => {
		// 1. Open circle panel
		// 2. Click role in circle panel
		// 3. Verify role panel opens (stacks on top)
		// 4. Verify breadcrumb appears
		// 5. Press ESC
		// 6. Verify role panel closes, circle panel remains
	});

	test('user can navigate via breadcrumbs', async ({ page }) => {
		// 1. Open circle → open sub-circle → open role
		// 2. Verify 2 breadcrumbs visible
		// 3. Click first breadcrumb (circle)
		// 4. Verify jumps back to circle panel
		// 5. Verify stack updated correctly
	});

	test('user can close panel via backdrop click', async ({ page }) => {
		// 1. Open circle panel
		// 2. Click backdrop (dark overlay)
		// 3. Verify panel closes
	});

	test('ESC key closes topmost panel only', async ({ page }) => {
		// 1. Open circle panel
		// 2. Open role panel
		// 3. Press ESC
		// 4. Verify only role panel closes
		// 5. Press ESC again
		// 6. Verify circle panel closes
	});

	test('panel does not close immediately after opening', async ({ page }) => {
		// 1. Click circle (opens panel)
		// 2. Immediately click backdrop
		// 3. Verify panel does NOT close (100ms delay protection)
		// 4. Wait 150ms
		// 5. Click backdrop again
		// 6. Verify panel closes
	});

	test('panel z-index stacks correctly', async ({ page }) => {
		// 1. Open circle panel
		// 2. Verify panel above sidebar
		// 3. Open role panel
		// 4. Verify role panel above circle panel
		// 5. Verify backdrop below panels
	});

	test('breadcrumb positioning is correct', async ({ page }) => {
		// 1. Open circle → sub-circle → role
		// 2. Verify breadcrumbs positioned at 0px, 48px
		// 3. Verify panel width adjusted for breadcrumbs
		// 4. Verify content padding matches breadcrumb width
	});
});
```

### 2. Edge Cases E2E

**File**: `e2e/org-chart-panel-edge-cases.spec.ts`

```typescript
test.describe('Panel Navigation Edge Cases', () => {
	test('rapid open/close does not cause double-close', async ({ page }) => {
		// Test rapid clicking
	});

	test('deep navigation (5+ levels) works correctly', async ({ page }) => {
		// Test maximum depth navigation
	});

	test('panel works after page refresh', async ({ page }) => {
		// Test state persistence (if applicable)
	});

	test('keyboard navigation works', async ({ page }) => {
		// Test Tab, Enter, Arrow keys
	});
});
```

---

## 📊 Test Coverage Goals

### Unit Tests

- **Target**: 90%+ coverage for:
  - `useNavigationStack` composable
  - `StackedPanel` component logic
  - `PanelBreadcrumbs` component logic

### Integration Tests

- **Target**: All integration points tested:
  - Navigation stack ↔ Panel interaction
  - Breadcrumb navigation flow
  - ESC key handling with multiple panels

### E2E Tests

- **Target**: Critical user flows:
  - Basic panel navigation
  - Breadcrumb navigation
  - ESC key behavior
  - Edge cases (rapid clicks, deep navigation)

---

## 🚀 Running Tests

### Unit Tests

```bash
npm run test:unit:server
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

### All Tests

```bash
npm run ci:local
```

---

## 📝 Test Implementation Notes

### Unit Test Setup

- Use Vitest for unit/integration tests
- Mock browser APIs (`window.addEventListener`, etc.)
- Test composables in isolation
- Test component logic without rendering (if possible)

### Integration Test Setup

- Test composable + component interaction
- Use Svelte Testing Library for component rendering
- Mock Convex queries (if needed)

### E2E Test Setup

- Use Playwright
- Follow existing E2E test patterns (`e2e/inbox-sync.test.ts`)
- Use saved auth state (from `e2e/auth.setup.ts`)
- Test in real browser environment

---

## ✅ Pre-Commit Checklist

Before committing, ensure:

- [ ] All manual tests pass
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] E2E tests written and passing (if applicable)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

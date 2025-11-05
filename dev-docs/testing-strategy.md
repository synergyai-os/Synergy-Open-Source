# Testing Strategy: Build & Ship with Confidence

**Goal**: Test smart, not everything. Focus on what breaks confidence.

---

## 🎯 Core Principle: Test What Matters

**Don't test**: Every function, every UI element, every edge case  
**Do test**: Business logic, user workflows, integration points

**Why**: Your time is limited. Focus on what gives you confidence to ship.

---

## 📊 What to Test (Prioritized)

### 1. **Business Logic** ⭐ HIGHEST PRIORITY
**What**: Functions that transform data, calculate values, make decisions  
**Why**: Bugs here break core functionality  
**Example**: 
- Filtering inbox items by type
- Calculating sync progress percentages
- Data transformation (Readwise → InboxItem)

**Test**: Pure functions, validation logic, state management

### 2. **Integration Points** ⭐ HIGH PRIORITY  
**What**: Connections between systems (API calls, database queries)  
**Why**: External dependencies fail silently  
**Example**:
- Convex queries/mutations
- Readwise API calls
- Authentication flow

**Test**: Mock external calls, verify data flow

### 3. **User Workflows** ⭐ MEDIUM PRIORITY
**What**: Critical paths users take  
**Why**: Broken workflows block users  
**Example**:
- Login → View inbox → Select item
- Sync Readwise → See progress → View new items
- Generate flashcard → Study

**Test**: End-to-end (E2E) tests for happy paths

### 4. **Edge Cases** ⚠️ LOW PRIORITY (Only Critical Ones)
**What**: Unusual but possible scenarios  
**Why**: Only test if they cause real problems  
**Example**:
- Empty inbox state
- API timeout handling
- Invalid API key

**Test**: Only after you've seen it break in real use

---

## ❌ What NOT to Test

### Don't Test These:
- **UI rendering** (unless it's critical to UX)
- **Styling/CSS** (visual testing is manual)
- **Third-party libraries** (they test themselves)
- **Simple getters/setters** (no logic = no test)
- **Framework code** (Svelte, Convex handle this)

**Rule**: If it's just passing data through, don't test it.

---

## 🛠️ Testing Types (What Tool for What Job)

### **Unit Tests** (Vitest) - Pure Logic
**Use for**: Composables, utility functions, data transformations

**Example**: Testing `useInboxItems` filtering logic
```typescript
// ✅ Good: Tests business logic
test('filters items by type', () => {
  const items = [
    { type: 'readwise_highlight', ... },
    { type: 'photo_note', ... }
  ];
  const filtered = filterByType(items, 'readwise_highlight');
  expect(filtered).toHaveLength(1);
});

// ❌ Bad: Testing Svelte reactivity (framework handles this)
test('useInboxItems returns reactive state', () => {
  // Don't test framework features
});
```

### **Integration Tests** (Vitest) - Connected Systems
**Use for**: Convex queries/mutations, API integrations

**Example**: Testing sync workflow
```typescript
// ✅ Good: Tests integration with Convex
test('syncReadwise imports highlights', async () => {
  const mockClient = createMockConvexClient();
  const result = await syncReadwise(mockClient, { quantity: 10 });
  expect(result.newCount).toBeGreaterThan(0);
});
```

### **E2E Tests** (Playwright) - User Workflows
**Use for**: Critical user paths, happy paths

**Example**: Testing complete sync flow
```typescript
// ✅ Good: Tests user workflow
test('user can sync Readwise highlights', async ({ page }) => {
  await page.goto('/inbox');
  await page.click('button:has-text("Sync")');
  await page.fill('[name="quantity"]', '10');
  await page.click('button:has-text("Import")');
  await expect(page.locator('text=Imported 10')).toBeVisible();
});
```

---

## 📝 How to Write Tests (Simple Pattern)

### Pattern: Arrange → Act → Assert

```typescript
test('description of what it does', () => {
  // ARRANGE: Set up test data
  const items = [
    { type: 'readwise_highlight', processed: false },
    { type: 'photo_note', processed: false }
  ];
  
  // ACT: Do the thing
  const filtered = filterByType(items, 'readwise_highlight');
  
  // ASSERT: Check the result
  expect(filtered).toHaveLength(1);
  expect(filtered[0].type).toBe('readwise_highlight');
});
```

### Keep Tests Simple
- **One assertion per test** (when possible)
- **Clear test names** (describe what happens)
- **Test behavior, not implementation**

---

## 🎯 Testing Checklist (Before Shipping)

Before you ship, ask: **"What would break my confidence?"**

### ✅ Must Have (Before Any Release)
- [ ] Critical user workflows work (E2E)
- [ ] Business logic functions correctly (Unit)
- [ ] Data sync works (Integration)

### ✅ Should Have (Before Major Features)
- [ ] Error handling works (try/catch scenarios)
- [ ] Edge cases that broke before (regression tests)

### ⚠️ Nice to Have (When Time Permits)
- [ ] UI component rendering (if complex)
- [ ] Performance under load (if relevant)

---

## 🚀 Quick Start Guide

### 1. Test Your First Function
Pick a pure function (no side effects) and test it:

```typescript
// src/lib/utils/filterInboxItems.ts
export function filterByType(items: InboxItem[], type: string) {
  return items.filter(item => item.type === type);
}

// src/lib/utils/filterInboxItems.test.ts
import { describe, it, expect } from 'vitest';
import { filterByType } from './filterInboxItems';

describe('filterByType', () => {
  it('filters items by type', () => {
    const items = [
      { type: 'readwise_highlight', id: '1' },
      { type: 'photo_note', id: '2' }
    ];
    
    const result = filterByType(items, 'readwise_highlight');
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
  
  it('returns empty array when no matches', () => {
    const items = [{ type: 'readwise_highlight', id: '1' }];
    const result = filterByType(items, 'photo_note');
    expect(result).toHaveLength(0);
  });
});
```

### 2. Test a Composable
Test the logic, not the reactivity:

```typescript
// Test the filtering logic, not Svelte runes
describe('useInboxItems filtering', () => {
  it('filters by type correctly', () => {
    // Test the filter function, not the composable itself
    // (Composables are harder to test, focus on pure functions)
  });
});
```

### 3. Test a User Workflow (E2E)
Pick one critical path and test it:

```typescript
// e2e/sync-readwise.test.ts
import { test, expect } from '@playwright/test';

test('user can sync Readwise highlights', async ({ page }) => {
  // Login (if needed)
  await page.goto('/inbox');
  
  // Click sync button
  await page.click('button:has-text("Sync")');
  
  // Configure sync
  await page.fill('[name="quantity"]', '10');
  await page.click('button:has-text("Import")');
  
  // Wait for success
  await expect(page.locator('text=/Imported \\d+/')).toBeVisible();
});
```

---

## 🔍 When to Write Tests

### ✅ Write Tests When:
- **Adding new business logic** (calculations, transformations)
- **Fixing a bug** (write test first to prevent regression)
- **Integrating with external APIs** (mock and verify)
- **Before refactoring** (tests give you confidence)

### ❌ Don't Write Tests When:
- **Just styling/UI** (manual check is faster)
- **Simple pass-through code** (no logic to test)
- **Exploring/prototyping** (test when it stabilizes)

---

## 🎓 Learning Path

### Week 1: Start Simple
- Write 1 unit test for a pure function
- Write 1 E2E test for a critical workflow
- Run tests before committing

### Week 2: Build Habits
- Test new business logic as you write it
- Test bug fixes before fixing them
- Keep tests simple and focused

### Week 3: Refine
- Remove tests that don't add value
- Focus on what breaks confidence
- Document patterns that work

---

## 💡 Pro Tips

1. **Test failures = learning opportunities**  
   When a test fails, you learned something about your code.

2. **Tests are documentation**  
   Good tests show how code is supposed to work.

3. **Start small, build confidence**  
   Don't try to test everything at once.

4. **Focus on user impact**  
   Test what users care about, not what's easy to test.

5. **Delete bad tests**  
   If a test doesn't give you confidence, delete it.

---

## 📚 Examples in This Codebase

### Good Test Examples
- `e2e/demo.test.ts` - Simple E2E test
- Future: Unit tests for composable logic

### What to Test Next
1. **Inbox filtering logic** (pure function)
2. **Sync progress calculation** (business logic)
3. **Readwise data transformation** (integration)
4. **Complete sync workflow** (E2E)

---

## 🎯 Remember

**Testing is about confidence, not coverage.**

- ✅ 10 good tests > 100 bad tests
- ✅ Test what matters to users
- ✅ Test what breaks confidence
- ✅ Keep it simple

**You don't need to test everything. Test what lets you ship with confidence.**


# Testing Priorities: What to Test First

**Real talk: Not all tests are equally important. Here's what actually matters.**

---

## 🎯 Critical Tests (Must Have)

These tests give you **confidence to ship**. If these break, the app doesn't work.

### 1. **Duplicate Detection** ⭐ MOST CRITICAL

**What**: Prevents importing the same highlight twice  
**Why**: If this breaks, users get duplicate items in inbox  
**Impact**: **HIGH** - Breaks core functionality

**Example test needed:**

```typescript
test('prevents duplicate highlights', async () => {
	// Import highlight first time
	await syncHighlight(highlight1);
	// Try to import same highlight again
	const result = await syncHighlight(highlight1);
	expect(result.skipped).toBe(true);
});
```

### 2. **Data Transformation** ⭐ CRITICAL

**What**: Converting Readwise API format → Inbox format  
**Why**: If this breaks, inbox items have wrong data or crash  
**Impact**: **HIGH** - Breaks sync workflow

**Example test needed:**

```typescript
test('transforms Readwise highlight to inbox item', () => {
	const readwiseData = { text: 'Hello', source: { title: 'Book' } };
	const inboxItem = transformToInboxItem(readwiseData);
	expect(inboxItem.title).toBe('Book');
	expect(inboxItem.text).toBe('Hello');
});
```

### 3. **Sync Workflow** ⭐ CRITICAL

**What**: End-to-end sync process  
**Why**: If this breaks, users can't import anything  
**Impact**: **HIGH** - Complete feature failure

**Test**: E2E test (Playwright)

```typescript
test('user can sync Readwise highlights', async ({ page }) => {
	await page.goto('/inbox');
	await page.click('button:has-text("Sync")');
	await expect(page.locator('text=/Imported/')).toBeVisible();
});
```

---

## ⚠️ Important Tests (Should Have)

These tests catch **quality issues**. App works, but data might be messy.

### 4. **Author Parsing** (What we have)

**What**: Parsing author strings correctly  
**Why**: If this breaks, duplicate sources or missing authors  
**Impact**: **MEDIUM** - Data quality issue, not a complete failure

**Current test**: ✅ `parseAuthorString` (we have this)

**Why test it:**

- Easy to test (pure function)
- Catches regressions if you modify it
- Documents expected behavior

**But**: It's not the MOST critical thing. If it breaks, sync still works, just messy data.

### 5. **Date Parsing**

**What**: Converting ISO dates correctly  
**Why**: If this breaks, dates might be wrong  
**Impact**: **MEDIUM** - Data quality issue

---

## 📝 Nice-to-Have Tests (When Time Permits)

These are **safety nets** but not critical for confidence.

### 6. **Edge Cases**

- Empty data handling
- Invalid API responses
- Network errors

**When to add**: After you've seen them break in real use.

---

## 🤔 How to Decide: Is This Critical?

Ask yourself:

1. **If this breaks, does the app stop working?**
   - ✅ YES → Critical test
   - ❌ NO → Not critical

2. **If this breaks, do users notice immediately?**
   - ✅ YES → Important test
   - ❌ NO → Nice-to-have

3. **Is this easy to test and maintain?**
   - ✅ YES → Worth testing even if not critical
   - ❌ NO → Skip unless critical

---

## 📊 Current Test Status

### ✅ What We Have

- `parseAuthorString` - Author parsing (Important, not Critical)
- `filterByType` - Inbox filtering (Important, not Critical)

### ❌ What We're Missing (Critical)

- **Duplicate detection** - No test yet ⚠️
- **Data transformation** - No test yet ⚠️
- **Sync workflow (E2E)** - Template only ⚠️

---

## 🎯 Recommended Next Steps

### Priority 1: Test Duplicate Detection

**Why**: This is the MOST critical. If duplicates get imported, users lose trust.

**Where**: Test the logic that checks if a highlight already exists before importing.

### Priority 2: Test Data Transformation

**Why**: If transformation breaks, inbox items have wrong data.

**Where**: Test the function that converts Readwise format → Inbox format.

### Priority 3: Keep Author Parsing Test

**Why**: It's already written, easy to maintain, catches regressions.

**But**: Understand it's not the most critical thing.

---

## 💡 Key Insight

**Not all tests are created equal.**

- **Critical tests** = Confidence to ship (must have)
- **Important tests** = Quality assurance (should have)
- **Nice-to-have tests** = Safety nets (when time permits)

**The author parsing test is "Important" - it's good to have, but not critical.**

**Focus on Critical tests first** (duplicate detection, data transformation, sync workflow).

---

## 🔍 Real Example: parseAuthorString

**Is it critical?** No.

**Why test it anyway?**

1. ✅ Easy to test (pure function, fast)
2. ✅ Documents expected behavior
3. ✅ Catches regressions if modified
4. ✅ Already written (low maintenance cost)

**What if we didn't test it?**

- If it breaks: Users might see duplicate sources
- But: Sync still works, inbox still works
- Impact: Data quality issue, not a complete failure

**Conclusion**: Good test, but not critical. Focus on duplicate detection first.

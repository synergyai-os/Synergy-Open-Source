# Testing Quick Reference

**Quick answers to: Where do I see results? When do I run tests?**

---

## 📺 Where to See Test Results

### Terminal Output
When you run tests, results appear **directly in your terminal**:

```bash
npm run test:unit -- --run
```

**Example output:**
```
✓ |server| convex/readwiseUtils.test.ts (14 tests) 2ms
✓ |server| src/lib/utils/filterInboxItems.test.ts (4 tests) 2ms

Test Files  2 passed (2)
     Tests  18 passed (18)
```

**What you see:**
- ✅ **Green checkmarks** = passing tests
- ❌ **Red X** = failing tests
- **Test file name** and number of tests
- **Summary** at the bottom (total passed/failed)

### Watch Mode (Live Updates)
Run tests in watch mode to see results automatically:

```bash
npm run test:unit
```

**What happens:**
- Tests run automatically when you save files
- Results update in terminal in real-time
- Press `q` to quit watch mode

---

## ⏰ When to Run Tests

### ✅ Run Tests Before Committing
**Before every commit**, run:
```bash
npm run test:unit -- --run
```

**Why**: Catch bugs before they get committed.

### ✅ Run Tests When Fixing Bugs
**When fixing a bug**, follow this pattern:

1. **Write test that reproduces the bug** (it should fail)
2. **Fix the bug**
3. **Test passes** ✅

**Example:**
```typescript
// 1. Test that fails (reproduces bug)
it('handles edge case with trailing comma', () => {
  const result = parseAuthorString('John Doe,');
  expect(result).toEqual(['John Doe']); // This fails initially
});

// 2. Fix the function
// 3. Test now passes ✅
```

### ✅ Run Tests When Adding New Logic
**When adding business logic**, write tests as you go:

```typescript
// Add function
export function calculateProgress(current: number, total: number) {
  return Math.round((current / total) * 100);
}

// Immediately write test
test('calculates progress correctly', () => {
  expect(calculateProgress(50, 100)).toBe(50);
  expect(calculateProgress(25, 100)).toBe(25);
});
```

### ✅ Run Tests in Watch Mode During Development
**While coding**, keep watch mode running:

```bash
npm run test:unit
```

**Why**: Get instant feedback as you write code.

### ⚠️ Don't Run Tests For
- **Styling changes** (CSS, Tailwind classes)
- **UI-only changes** (no logic changes)
- **Documentation updates**

---

## 🚀 Quick Commands

### Run All Tests Once
```bash
npm run test:unit -- --run
```

### Run Tests in Watch Mode
```bash
npm run test:unit
```

### Run Specific Test File
```bash
npm run test:unit -- --run convex/readwiseUtils.test.ts
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run All Tests (Unit + E2E)
```bash
npm test
```

---

## 📊 Understanding Test Results

### Passing Test
```
✓ parseAuthorString > handles single author (1ms)
```
- **Green checkmark** = test passed
- **Time shown** = how long test took

### Failing Test
```
× parseAuthorString > handles empty string (1ms)
  Error: Expected [] but got [' ']
```
- **Red X** = test failed
- **Error message** = what went wrong

### Summary
```
Test Files  2 passed | 1 failed (3)
     Tests  18 passed | 2 failed (20)
```
- **Total test files** and results
- **Total tests** and results

---

## 🎯 Recommended Workflow

### Daily Development
1. **Start watch mode** at beginning of session:
   ```bash
   npm run test:unit
   ```
2. **Write code** - tests run automatically
3. **See results** in terminal as you code

### Before Committing
1. **Stop watch mode** (press `q`)
2. **Run full test suite**:
   ```bash
   npm run test:unit -- --run
   ```
3. **Fix any failures**
4. **Commit** ✅

---

## 💡 Pro Tips

1. **Keep watch mode running** - See results instantly
2. **Run before committing** - Catch issues early
3. **Write tests for bugs** - Prevents regression
4. **Test business logic only** - Don't over-test

---

## 🔍 Troubleshooting

### Tests Not Running?
- Make sure you're in the project root
- Run `npm install` if dependencies are missing

### Can't See Results?
- Results appear in the terminal where you ran the command
- Check terminal output (scroll up if needed)

### Watch Mode Not Working?
- Press `q` to quit and restart
- Make sure files are being saved

---

## 📝 Summary

**Where**: Terminal output  
**When**: Before committing, when fixing bugs, when adding logic  
**How**: `npm run test:unit -- --run` (one-time) or `npm run test:unit` (watch mode)

**Remember**: Tests are about confidence, not coverage. Run them when you need to know if something works.


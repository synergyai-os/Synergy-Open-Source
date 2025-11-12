# Testing Workflow: Deploy with Confidence

> **Related:** [SYOS-44](https://linear.app/younghumanclub/issue/SYOS-44) - Improve CI/CD test automation

This document describes our complete testing strategy to deploy safer and more reliably with confidence.

---

## The Problem We Solved

**Before:** PR review found 19 critical bugs (missing destructuring) that our 49 unit tests didn't catch.

**Root Cause:** Unit tests tested functions in isolation, not how they're used in real code.

**Solution:** Multi-layer testing strategy with rapid feedback loops.

---

## Testing Layers

### 🔴 Layer 1: Static Analysis (< 5 seconds)

**Catches:** Missing destructuring, parameter mismatches, common patterns

```bash
npm run test:sessionid
```

**What it checks:**

- ❌ Missing destructuring from `validateSessionAndGetUserId()`
- ❌ Client code passing `userId` to migrated functions
- ⚠️ Convex functions still using `userId` args

**When it runs:**

- Pre-commit hook (automatic)
- GitHub Actions CI (automatic)
- Blocks commits with critical issues

**Example output:**

```bash
🔍 Checking for missing destructuring bugs...
❌ CRITICAL: Missing destructuring in convex/tags.ts
   Found: const userId = await validateSessionAndGetUserId(...)
   Should be: const { userId } = await validateSessionAndGetUserId(...)
```

---

### 🟡 Layer 2: Unit Tests (< 10 seconds)

**Catches:** Logic errors, edge cases, validation errors

```bash
npm run test:unit:server
```

**Coverage:**

- ✅ 49 tests for session validation
- ✅ Mocked dependencies
- ✅ Fast execution

**Example:**

```typescript
describe('validateSessionAndGetUserId', () => {
	it('should return userId for valid session', async () => {
		const result = await validateSessionAndGetUserId(ctx, sessionId);
		expect(result.userId).toBe(validUserId);
	});
});
```

---

### 🟢 Layer 3: Integration Tests (< 30 seconds) ⭐ NEW

**Catches:** Type errors, database issues, destructuring bugs, auth flow bugs

```bash
npm run test:integration
npm run test:integration:watch  # Watch mode
```

**Coverage:**

- ✅ Tags module (6 tests)
- ✅ Flashcards module (5 tests)
- 🔄 Organizations module (coming soon)
- 🔄 Users module (coming soon)
- 🔄 RBAC module (coming soon)

**Why this is critical:**

- Tests **actual** Convex functions, not mocks
- Would have caught the destructuring bug immediately
- Runs real database queries
- Validates return types

**Example:**

```typescript
it('should list user tags without type errors', async () => {
	const t = convexTest();
	const { sessionId, userId } = await createTestSession(t);

	// This fails if userId is an object (destructuring bug)
	const tags = await t.query(api.tags.listTags, { sessionId });

	expect(tags).toBeDefined();
	expect(Array.isArray(tags)).toBe(true);
});
```

**Test structure:**

```
tests/convex/integration/
├── README.md           - Documentation
├── setup.ts            - Test helpers
├── tags.integration.test.ts
└── flashcards.integration.test.ts
```

---

### 🔵 Layer 4: E2E Tests (< 5 minutes)

**Catches:** User workflow issues, UI bugs, cross-component issues

```bash
npm run test:e2e:critical      # Critical flows
npm run test:e2e:quick-create  # Quick Create Modal
npm run test:e2e:inbox         # Inbox Workflow
npm run test:e2e:settings      # Settings
```

**Coverage:**

- ✅ 16 tests passing
- ✅ Quick Create Modal
- ✅ Inbox Workflow
- ✅ Settings Security

---

## Development Workflow

### Before You Code

```bash
# Optional: Run tests in watch mode
npm run test:integration:watch
```

### While Coding

Write code → Save file → Tests auto-run (if in watch mode)

### Before Committing

```bash
# Pre-commit hook runs automatically:
# 1. Static analysis
# 2. Linter
# 3. Unit tests
# 4. Integration tests

git commit -m "feat: add new feature"
# ✅ All checks pass → commit succeeds
# ❌ Any check fails → commit blocked
```

### After Pushing (CI/CD)

GitHub Actions automatically runs:

1. ✅ Static analysis
2. ✅ Unit tests
3. ✅ Integration tests
4. ✅ Linter
5. ✅ E2E tests (if secrets configured)

**PR cannot be merged until all checks pass.**

---

## Writing Tests

### Integration Tests (Recommended for New Features)

```typescript
// tests/convex/integration/mymodule.integration.test.ts
import { describe, it, expect, afterEach } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from '../../../convex/_generated/api';
import { createTestSession, cleanupTestData } from './setup';

describe('My Module Integration Tests', () => {
	let userId: any;

	afterEach(async () => {
		if (userId) {
			const t = convexTest();
			await cleanupTestData(t, userId);
		}
	});

	it('should do something', async () => {
		const t = convexTest();
		const { sessionId, userId: testUserId } = await createTestSession(t);
		userId = testUserId;

		// Test your Convex function
		const result = await t.query(api.myModule.myFunction, {
			sessionId
			// ... other args
		});

		expect(result).toBeDefined();
	});
});
```

**Test Helpers Available:**

- `createTestSession(t)` - Create user + session
- `createTestTag(t, userId, name)` - Create test tag
- `createTestNote(t, userId, title)` - Create test note
- `createTestOrganization(t, name)` - Create test org
- `cleanupTestData(t, userId)` - Cleanup after test

### Unit Tests (For Utility Functions)

```typescript
// tests/convex/myUtil.test.ts
import { describe, it, expect } from 'vitest';
import { myUtilFunction } from '../../convex/myUtil';

describe('myUtilFunction', () => {
	it('should transform data correctly', () => {
		const result = myUtilFunction(input);
		expect(result).toBe(expected);
	});
});
```

### E2E Tests (For User Workflows)

```typescript
// e2e/my-workflow.spec.ts
import { test, expect } from '@playwright/test';

test('should complete workflow', async ({ page }) => {
	await page.goto('/');
	await page.click('[data-testid="my-button"]');
	await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

---

## Coverage Goals

| Layer             | Current   | Target | Status         |
| ----------------- | --------- | ------ | -------------- |
| Static Analysis   | ✅ Active | 100%   | ✅ Complete    |
| Unit Tests        | 49 tests  | 50+    | 🟢 Good        |
| Integration Tests | 11 tests  | 30+    | 🟡 In Progress |
| E2E Tests         | 16 tests  | 25+    | 🟡 In Progress |

---

## What Each Layer Catches

| Bug Type              | Static | Unit | Integration | E2E |
| --------------------- | ------ | ---- | ----------- | --- |
| Missing destructuring | ✅     | ❌   | ✅          | ❌  |
| Type errors           | ⚠️     | ⚠️   | ✅          | ✅  |
| Logic errors          | ❌     | ✅   | ✅          | ✅  |
| Database issues       | ❌     | ❌   | ✅          | ✅  |
| Auth flow bugs        | ❌     | ⚠️   | ✅          | ✅  |
| UI bugs               | ❌     | ❌   | ❌          | ✅  |
| User isolation        | ❌     | ⚠️   | ✅          | ✅  |

---

## Rapid Feedback Loops

### Development (< 1 second)

- TypeScript compiler errors in editor
- ESLint warnings in editor

### Pre-commit (< 30 seconds)

- Static analysis: ~5s
- Unit tests: ~10s
- Integration tests: ~15s
- **Total: ~30s**

### CI/CD (< 10 minutes)

- All tests + E2E: ~10min
- Blocks merge if any fail

---

## Success Metrics

✅ **Before SYOS-44:** 0 integration tests, destructuring bugs shipped

✅ **After SYOS-44:**

- 11 integration tests
- Static analysis catches destructuring bugs
- 30s pre-commit feedback
- Zero destructuring bugs can be committed

🎯 **Goal:** < 1 minute feedback loop, 95%+ bug detection before production

---

## Troubleshooting

### Static Analysis False Positives

Some warnings are expected:

- ⚠️ Schema definitions (not actual functions)
- ⚠️ Internal mutations (not public APIs)

These don't block commits.

### Integration Tests Failing

**Error: "Cannot find module convex-test"**

```bash
npm install
```

**Error: "Session not found"**

- Session creation failed
- Check test setup in `setup.ts`

**Error: "Database query failed"**

- Index missing or wrong
- Check schema matches test expectations

### Pre-commit Hook Not Running

```bash
# Reinstall husky (if using)
npm install husky --save-dev
npx husky install
chmod +x .husky/pre-commit
```

### Bypass Pre-commit (Emergency Only)

```bash
git commit --no-verify  # ⚠️ DON'T DO THIS unless emergency
```

---

## Next Steps

### P1 (Urgent)

- [ ] Add integration tests for remaining modules (Organizations, Users, RBAC)
- [ ] Fix E2E test execution in CI (SYOS-46)

### P2 (High Priority)

- [ ] Add type-aware ESLint rules (SYOS-48)
- [ ] Improve TypeScript strictness (SYOS-48)

### P3 (Nice to Have)

- [ ] Add contract tests (SYOS-49)
- [ ] Add mutation testing
- [ ] Add performance regression tests

---

## Team Training

**For new team members:**

1. Read this document
2. Run `npm run test:integration:watch`
3. Make a change that breaks a test
4. See the test fail immediately
5. Fix the change
6. See the test pass

**For existing team members:**

- Integration tests are now part of pre-commit
- Write integration tests for new features
- Use `createTestSession()` helper for quick setup

---

## Resources

- [Testing Strategy](./testing-strategy.md)
- [Testing Coverage](./testing-coverage.md)
- [Integration Test README](../tests/convex/integration/README.md)
- [SYOS-44: Testing Infrastructure](https://linear.app/younghumanclub/issue/SYOS-44)
- [SYOS-45: Integration Tests](https://linear.app/younghumanclub/issue/SYOS-45)
- [convex-test Documentation](https://www.npmjs.com/package/convex-test)

---

**Questions?** Check Linear tickets or ask in #engineering channel.

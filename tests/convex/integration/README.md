# Convex Integration Tests

Integration tests that run actual Convex functions end-to-end using `convex-test`.

## Why Integration Tests?

**Unit tests** test functions in isolation (mocked dependencies).
**Integration tests** test real function calls with real database operations.

### The Gap We're Filling

Our unit tests didn't catch the destructuring bug because:
- Unit tests: `expect(result.userId).toBe(...)` ✅ (correct pattern)
- Real code: `const userId = await validateSessionAndGetUserId(...)` ❌ (wrong pattern)

Integration tests run the actual Convex functions, so type errors and database query failures are caught immediately.

## Structure

```
tests/convex/integration/
├── README.md (this file)
├── setup.ts (test helpers and fixtures)
├── tags.integration.test.ts
├── flashcards.integration.test.ts
├── organizations.integration.test.ts
├── users.integration.test.ts
└── rbac.integration.test.ts
```

## Running Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific module
npm run test:integration -- tags.integration.test.ts

# Run in watch mode
npm run test:integration -- --watch
```

## Writing Tests

```typescript
import { convexTest } from 'convex-test';
import { api } from '../../../convex/_generated/api';
import { createTestSession } from './setup';

describe('Tags Module', () => {
  it('should list user tags', async () => {
    const t = convexTest();
    const { sessionId, userId } = await createTestSession(t);
    
    // This will fail if userId is an object instead of a string
    const tags = await t.query(api.tags.listTags, { sessionId });
    
    expect(tags).toBeDefined();
    expect(Array.isArray(tags)).toBe(true);
  });
});
```

## What These Tests Catch

✅ **Destructuring bugs** - If `userId` is an object, DB queries fail
✅ **Type errors** - Real function signatures must match
✅ **Database issues** - Indexes, field names, query logic
✅ **Session validation** - Auth flow works end-to-end
✅ **Return value contracts** - Functions return expected shapes

## CI/CD Integration

These tests run automatically:
- Pre-commit hook (fast tests only)
- GitHub Actions on every PR
- Block merge if tests fail

---

**Related:**
- [Testing Strategy](../../../dev-docs/testing-strategy.md)
- [Testing Coverage](../../../dev-docs/testing-coverage.md)
- [SYOS-45](https://linear.app/younghumanclub/issue/SYOS-45)


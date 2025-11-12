# Testing Quick Start

> **Full Documentation:** [dev-docs/testing-workflow.md](./dev-docs/testing-workflow.md)

## 🚀 Run Tests

```bash
# Static analysis (5s)
npm run test:sessionid

# Unit tests (10s)
npm run test:unit:server

# Integration tests (30s) ⭐ NEW
npm run test:integration
npm run test:integration:watch  # Watch mode

# E2E tests (5min)
npm run test:e2e:critical

# All tests
npm test
```

## 📝 Write Tests

### Integration Test (Recommended)

```typescript
// tests/convex/integration/mymodule.integration.test.ts
import { convexTest } from 'convex-test';
import { api } from '../../../convex/_generated/api';
import { createTestSession } from './setup';

describe('My Module', () => {
  it('should work', async () => {
    const t = convexTest();
    const { sessionId, userId } = await createTestSession(t);
    
    const result = await t.query(api.myModule.myFunction, {
      sessionId
    });
    
    expect(result).toBeDefined();
  });
});
```

## 🔍 What Runs When

**Pre-commit (automatic):**
- Static analysis
- Linter  
- Unit tests
- Integration tests

**CI/CD (automatic):**
- All tests
- E2E tests
- Blocks PR if any fail

## 🎯 Coverage Status

| Layer | Tests | Status |
|-------|-------|--------|
| Static Analysis | ✅ Active | Complete |
| Unit Tests | 49 | Good |
| **Integration Tests** | **11** | **In Progress** |
| E2E Tests | 16 | Good |

## 📚 Resources

- [Full Testing Workflow](./dev-docs/testing-workflow.md)
- [Integration Test README](./tests/convex/integration/README.md)
- [SYOS-44: Testing Infrastructure](https://linear.app/younghumanclub/issue/SYOS-44)
- [SYOS-45: Integration Tests](https://linear.app/younghumanclub/issue/SYOS-45)


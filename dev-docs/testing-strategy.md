# Testing Strategy for SessionID-Based Auth Refactor

## Overview

This document outlines the automated testing strategy to prevent regressions after migrating from client-supplied `userId` to server-validated `sessionId`.

## Test Pyramid

```
        E2E Tests (Playwright)
       Critical User Flows
              │
       Integration Tests
    Security & Authorization
              │
        Unit Tests (Vitest)
      Session Validation
```

## Current Test Coverage

### ✅ Unit Tests (Vitest)

**Location**: `tests/convex/sessionValidation.test.ts`

**Coverage**: 16 tests covering core security logic
- ✅ `validateSessionAndGetUserId()` - new secure pattern
- ✅ `getUserIdFromSession()` - null-safe variant
- ✅ Session expiration handling
- ✅ Session revocation handling
- ✅ Impersonation attack prevention
- ✅ Query efficiency (database index usage)
- ✅ Backward compatibility with deprecated `validateSession()`

**Why These Are Critical**:
- Tests the foundational security layer
- Verifies userId derivation from sessionId
- Prevents regression in impersonation protection

**Run Tests**:
```bash
npm run test:unit:server
```

### 🔄 Integration Tests (Needed)

**What's Missing**: Direct testing of query/mutation security

**Challenge**: Convex functions use framework wrappers (`query()`, `mutation()`) which aren't easily unit-testable without mocking the entire Convex runtime.

**Solution**: Use E2E tests for integration-level coverage

### ✅ E2E Tests (Playwright)

**Location**: `e2e/` directory

**Existing Tests**:
- `demo.test.ts` - Basic functionality
- `inbox-sync.test.ts` - Readwise sync flow
- `rate-limiting.test.ts` - Rate limit protection

**To Add** (for sessionId refactor):

1. **Auth Flow Test** (`e2e/auth-security.test.ts`)
   ```typescript
   - Test login creates valid session
   - Test expired session redirects to login
   - Test accessing protected routes without session
   ```

2. **Settings Security Test** (`e2e/settings-security.test.ts`)
   ```typescript
   - Test updating theme with valid session
   - Test API key operations require authentication
   - Test cannot access settings without session
   ```

3. **Notes Security Test** (`e2e/notes-security.test.ts`)
   ```typescript
   - Test creating note with valid session
   - Test updating own note succeeds
   - Test cannot access/modify other user's notes
   ```

4. **Inbox Security Test** (`e2e/inbox-security.test.ts`)
   ```typescript
   - Test listing inbox items with valid session
   - Test marking processed requires ownership
   - Test sync progress is user-specific
   ```

**Run E2E Tests**:
```bash
npm run test:e2e
```

## CI/CD Integration

### Pre-commit Hook

**File**: `.husky/pre-commit` (if using Husky)

```bash
#!/bin/sh
npm run lint
npm run test:unit:server
```

### GitHub Actions

**File**: `.github/workflows/test.yml`

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit:server
      - run: npm run test:e2e
```

## Security Test Checklist

Before merging PRs that touch auth code:

- [ ] Unit tests pass (`npm run test:unit:server`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Linter passes (`npm run lint`)
- [ ] Manual test: Login flow works
- [ ] Manual test: Protected routes require auth
- [ ] Manual test: User can only access their own data

## Test Data & Fixtures

### Mock Sessions

```typescript
const validSession = {
  sessionId: 'valid_session_123',
  convexUserId: 'user_123',
  isValid: true,
  expiresAt: Date.now() + 3600000,
  revokedAt: null
};

const expiredSession = {
  ...validSession,
  expiresAt: Date.now() - 1000 // Expired 1 second ago
};

const revokedSession = {
  ...validSession,
  isValid: false,
  revokedAt: Date.now() - 1000
};
```

### Test Users

```typescript
const testUsers = {
  alice: {
    userId: 'user_alice' as Id<'users'>,
    sessionId: 'session_alice',
    email: 'alice@test.com'
  },
  bob: {
    userId: 'user_bob' as Id<'users'>,
    sessionId: 'session_bob',
    email: 'bob@test.com'
  }
};
```

## Future Improvements

1. **Add Contract Tests**: Test API contracts between frontend and Convex
2. **Add Performance Tests**: Ensure session validation doesn't slow queries
3. **Add Load Tests**: Test session validation under heavy load
4. **Add Security Scanning**: OWASP ZAP or similar for auth vulnerabilities
5. **Add Mutation Tests**: Use mutation testing (Stryker) to verify test quality

## Key Learnings

### What Works Well

✅ **Unit tests for pure functions**: `sessionValidation.test.ts` works great because functions are pure (no Convex wrappers)

✅ **E2E tests for user flows**: Playwright tests verify real-world security

### What's Challenging

❌ **Testing Convex query/mutation wrappers**: Framework wrappers make direct testing difficult

**Solution**: Extract business logic into pure functions when possible, or rely on E2E tests

## References

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Convex Testing Best Practices](https://docs.convex.dev/testing)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)


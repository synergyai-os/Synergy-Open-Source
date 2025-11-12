# E2E Tests

## Setup

1. **Create `.env.test` file** in project root:

```bash
# Copy the template
cp .env.test.example .env.test

# Add test credentials
TEST_USER_EMAIL=randy+cicduser@synergyai.nl
TEST_USER_PASSWORD=djz5gxt2tjg@wjz4BAF
```

2. **Authenticate test user** (run once):

```bash
npm run test:e2e:setup
```

This logs in the test user and saves the authenticated state to `e2e/.auth/user.json`.

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suite
npm run test:e2e:quick-create  # Quick Create Modal tests
npm run test:e2e:auth          # Auth security tests

# Run with UI mode (recommended for development)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Debug a specific test
npx playwright test --debug e2e/quick-create.spec.ts
```

## Test Structure

```
e2e/
├── auth.setup.ts           # Authenticates test user (runs first)
├── .auth/
│   └── user.json          # Saved auth state (gitignored)
├── quick-create.spec.ts    # Quick Create Modal tests
└── auth-security.test.ts   # Auth security tests
```

## How Authentication Works

1. **Setup phase** (`auth.setup.ts`):
   - Logs in with test credentials
   - Saves authenticated state to `.auth/user.json`
   - Runs once before all tests

2. **Test phase**:
   - Tests use saved auth state via `test.use({ storageState: 'e2e/.auth/user.json' })`
   - No need to log in again for each test
   - Tests run faster and more reliably

## Writing New Tests

```typescript
import { test, expect } from '@playwright/test';

// Use authenticated state
test.use({ storageState: 'e2e/.auth/user.json' });

test('my test', async ({ page }) => {
  // User is already logged in
  await page.goto('/inbox');
  // ... test authenticated features
});
```

## Test User

**Email**: `randy+cicduser@synergyai.nl`
**Purpose**: Dedicated account for CI/CD testing
**Access**: Has sample data for testing (notes, flashcards, etc.)

## CI/CD Integration

In GitHub Actions, credentials are stored as secrets:

```yaml
- name: Run E2E tests
  env:
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
  run: npm run test:e2e
```

## Troubleshooting

### "Authentication failed"

1. Check `.env.test` has correct credentials
2. Run auth setup: `npm run test:e2e:setup`
3. Check if test user account is active in WorkOS

### "storageState not found"

Run auth setup first: `npm run test:e2e:setup`

### Tests timing out

1. Make sure dev server is running: `npm run dev`
2. Increase timeout in `playwright.config.ts`
3. Check if Convex is accessible

### "sessionId missing" errors

This means the auth migration has a bug! The E2E test successfully caught a regression.

1. Check console output for specific function
2. Run static analysis: `npm run test:sessionid`
3. Fix the component/function to use `sessionId`

## Best Practices

1. **Always use auth setup** - Don't log in manually in tests
2. **Test real user flows** - Use keyboard shortcuts, click buttons
3. **Check console errors** - Catch ArgumentValidationError
4. **Keep tests independent** - Each test should work standalone
5. **Clean up test data** - Delete created items after tests (future improvement)

## Further Reading

- [Playwright Authentication](https://playwright.dev/docs/auth)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Debugging](https://playwright.dev/docs/debug)


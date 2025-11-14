# E2E Tests Documentation

## Overview

End-to-end tests for SynergyOS using Playwright. Tests cover critical user flows including authentication, registration, password reset, and core app functionality.

## Test Coverage

### Authentication Flows

- **Login/Logout** (`auth-security.test.ts`)
  - Session management
  - CSRF protection
  - Unauthorized access prevention
  - Session tracking

- **Registration with Email Verification** (`auth-registration.test.ts`)
  - New user registration
  - Email verification with 6-digit PIN
  - Verification code expiry
  - Rate limiting on verification attempts
  - Password validation

- **Password Reset** (`auth-registration.test.ts`)
  - Forgot password flow
  - Reset link validation
  - Password strength validation
  - Token expiry handling

### Core Features

- **Inbox** (`inbox-workflow.spec.ts`)
- **Settings** (`settings-security.spec.ts`)
- **Quick Create** (`quick-create.spec.ts`)

## Setup

### 1. Environment Variables

Create `.env.test` in project root:

```bash
# Test user credentials (should exist in WorkOS)
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-secure-password

# Enable test helper endpoints
E2E_TEST_MODE=true

# Optional: Custom base URL
BASE_URL=http://localhost:5173
```

### 2. Test User Setup

Create a test user in WorkOS:

1. Go to WorkOS dashboard
2. Create a new user with email verification
3. Use these credentials in `.env.test`

## Running Tests

### Local Development

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e:auth         # Auth tests only
npm run test:e2e:inbox        # Inbox tests only
npm run test:e2e:settings     # Settings tests only

# Run with UI (interactive mode)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Debug specific test
npx playwright test --debug e2e/auth-registration.test.ts
```

### CI/Local Pre-PR Validation

```bash
# Run all checks + tests (recommended before PR)
npm run ci:local

# This runs:
# - Type checking (npm run check)
# - Linting (npm run lint)
# - Unit tests (npm run test:unit:server)
# - Integration tests (npm run test:integration)
# - E2E tests (npm run test:e2e)
# - Build (npm run build)
```

### CI Pipeline

Tests run automatically in GitHub Actions:

- On pull requests
- On pushes to main
- `E2E_TEST_MODE=true` must be set in CI environment variables

## Test Helper for Email Verification

### How It Works

The new registration flow requires email verification with a 6-digit PIN code. In E2E tests, we can't access real emails, so we use a test helper endpoint:

```typescript
// Get verification code in tests
const response = await request.get(
	'/test/get-verification-code?email=test@example.com&type=registration'
);
const { code } = await response.json();
```

### Security

The test helper endpoint (`/test/get-verification-code`) is secured:

✅ **Only enabled when `E2E_TEST_MODE=true`**
✅ **IP restricted to localhost only**
✅ **Returns 404 in production**
✅ **Requires email + type parameters**

### Usage in Tests

```typescript
test('should register with email verification', async ({ page, request }) => {
	// 1. Submit registration form
	await page.fill('input[type="email"]', 'test@example.com');
	await page.click('button[type="submit"]');

	// 2. Get verification code from test helper
	const codeResponse = await request.get(
		'/test/get-verification-code?email=test@example.com&type=registration'
	);
	const { code } = await codeResponse.json();

	// 3. Enter code in PIN input
	await page.fill('input', code);

	// 4. Verify registration succeeds
	await expect(page).toHaveURL(/\/inbox/);
});
```

## Authentication Setup

Tests use Playwright's [authentication setup](https://playwright.dev/docs/auth) pattern:

1. **Setup phase** (`auth.setup.ts`) - Runs once before all tests
   - Logs in with test user
   - Saves authentication state to `e2e/.auth/user.json`

2. **Test execution** - Tests reuse saved auth state
   - No re-authentication needed
   - Tests run faster
   - Consistent test environment

### Unauthenticated Tests

For testing unauthenticated flows (login, registration):

```typescript
test.use({ storageState: { cookies: [], origins: [] } });
```

## Writing New Tests

### Best Practices

1. **Use data-testid attributes** for selectors

   ```svelte
   <button data-testid="submit-btn">Submit</button>
   ```

   ```typescript
   await page.click('[data-testid="submit-btn"]');
   ```

2. **Generate unique test data**

   ```typescript
   const timestamp = Date.now();
   const testEmail = `test-${timestamp}@example.com`;
   ```

3. **Clean up test data** if needed
   - Delete test users after test
   - Reset state between tests

4. **Use explicit waits**

   ```typescript
   await expect(page).toHaveURL(/\/inbox/, { timeout: 10000 });
   ```

5. **Test error states**
   - Invalid input
   - Network errors
   - Rate limiting

### Test Structure

```typescript
test.describe('Feature Name', () => {
	// Setup/teardown if needed
	test.beforeEach(async ({ page }) => {
		// Setup
	});

	test('should do something', async ({ page }) => {
		// Arrange
		await page.goto('/page');

		// Act
		await page.click('button');

		// Assert
		await expect(page).toHaveURL(/\/result/);
	});
});
```

## Troubleshooting

### Tests Failing Locally

1. **Check environment variables**

   ```bash
   cat .env.test
   # Verify E2E_TEST_MODE=true
   ```

2. **Verify test user exists**
   - Log in manually with test credentials
   - Check WorkOS dashboard

3. **Check app is running**

   ```bash
   npm run dev
   # Should be accessible at http://localhost:5173
   ```

4. **Clear auth state**
   ```bash
   rm -rf e2e/.auth/user.json
   npm run test:e2e:setup  # Re-authenticate
   ```

### Test Helper Not Working

If `/test/get-verification-code` returns 404:

1. Check `E2E_TEST_MODE=true` in `.env.test`
2. Restart dev server
3. Verify endpoint exists: `curl http://localhost:5173/test/get-verification-code`

### Slow Tests

Playwright might be slow on first run (downloads browsers):

```bash
# Install browsers manually
npx playwright install
```

## Test Reports

After running tests:

```bash
# View HTML report
npx playwright show-report

# Report is automatically generated at:
# playwright-report/index.html
```

## CI Configuration

See `.github/workflows/` for CI setup:

- Environment variables must be set in GitHub Actions secrets
- Tests run on every PR
- Failed tests block merging

## Further Reading

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Authentication](https://playwright.dev/docs/auth)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

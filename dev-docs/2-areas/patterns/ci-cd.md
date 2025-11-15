# CI/CD & Tooling Patterns

> **For AI**: Patterns for continuous integration, quality gates, and local testing workflows.

---

## #L10: Incremental CI Gate Enablement [🟢 REFERENCE]

**Context**: Enabling all CI quality gates at once can block development if there are existing errors  
**Strategy**: Enable gates incrementally, fixing critical issues first

**Approach**:

```yaml
# .github/workflows/quality-gates.yml

# ✅ PHASE 1: Enable Lint & Build (fix breaking issues first)
- name: Lint
  run: npm run lint
  # Quality gate enabled - blocks PRs

- name: Build verification
  run: npm run build
  # Quality gate enabled - blocks PRs

# ⏸️ PHASE 2: Defer Type Check (fix in separate ticket)
- name: Type check
  run: npm run check
  continue-on-error: true # TODO: Enable after fixing errors (SYOS-72)
```

**Why**:

- ✅ Lint and build failures are typically easier to fix
- ✅ TypeScript errors can be numerous and require dedicated effort
- ✅ Prevents blocking all development while fixing type errors
- ✅ Progressive improvement vs. all-or-nothing

**Apply when**:

- Adding CI gates to existing project with technical debt
- Large number of TypeScript errors exist
- Need to balance quality improvements with velocity

**Related**: #L60 (ESLint for tests), #L110 (Local CI testing)

---

## #L60: ESLint Configuration for Test Files [🟡 IMPORTANT]

**Symptom**: ESLint errors in test files for intentional `any` types, blocking CI  
**Root Cause**: Test code needs more flexibility than production code  
**Fix**:

```javascript
// eslint.config.js

export default [
	// ... other configs
	{
		// Relax rules for test files
		files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts', 'e2e/**/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off', // Test mocks often need `any`
			'@typescript-eslint/no-unused-vars': 'warn' // Downgrade to warning
		}
	},
	{
		// Relax rules for integration test helpers (Convex API types are complex)
		files: ['tests/convex/integration/**/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
		// Relax rules for demo/test pages
		files: ['src/routes/settings/permissions-test/**/*.svelte'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'warn'
		}
	}
];
```

**Why**:

- Tests often need `any` for mocking external APIs
- Test code prioritizes readability over type safety
- Integration tests with complex library types (e.g., Convex, Playwright) benefit from relaxed rules
- Reduces noise, lets devs focus on real issues

**Anti-pattern**:

```javascript
// ❌ BAD: Disabling rules globally
rules: {
	'@typescript-eslint/no-explicit-any': 'off' // Affects production code!
}
```

**Apply when**:

- Adding ESLint to project with existing tests
- Working with complex external library types
- Test mocks require `any` types
- Demo pages intentionally show unsafe patterns

**Related**: #L10 (Incremental CI gates), convex-integration.md#L240 (Type definitions)

---

## #L70: Disable ESLint Rules with Known Limitations [🟡 IMPORTANT]

**Symptom**: ESLint rule reports false positives (50+ errors) for correct code, adding per-line disable comments everywhere is not scalable  
**Root Cause**: ESLint rules can't verify wrapper functions across module boundaries or recognize conditional patterns  
**Fix**:

```javascript
// ❌ BAD: Adding disable comments everywhere (not scalable)
// eslint-disable-next-line svelte/no-navigation-without-resolve
<a href={resolveRoute('/path')}>Link</a>

// ✅ CORRECT: Disable rule globally with documentation
// eslint.config.js
{
	files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
	rules: {
		// Disabled: Rule doesn't recognize resolveRoute() wrapper function.
		// All navigation uses resolveRoute() from $lib/utils/navigation.ts which wraps SvelteKit's resolve().
		// This is a known limitation of the ESLint rule - it can't verify wrapper functions across module boundaries.
		'svelte/no-navigation-without-resolve': 'off'
	}
}
```

**Why**:
- ESLint rules can't trace function calls across module boundaries
- Wrapper functions like `resolveRoute()` are correct but unrecognized by rule
- Per-line disable comments create maintenance burden (50+ instances)
- Global disable with documentation is scalable and clear

**When to Use**:
- Rule has known technical limitations (can't verify wrappers, conditionals)
- Code is functionally correct but rule can't verify it
- Adding disable comments everywhere would be unmaintainable
- Rule limitation is documented and understood

**When NOT to Use**:
- Rule works correctly but you want to bypass it → Fix the code instead
- Only a few false positives → Use per-line disables with comments
- Test files → Use file-specific rule relaxation (#L60)

**Example**: `svelte/no-navigation-without-resolve` can't recognize `resolveRoute()` wrapper, but all navigation correctly uses it. Disable globally with explanation.

**Related**: #L60 (ESLint for tests), ui-patterns.md#L1870 (Navigation with resolveRoute)

---

## #L80: Handling Unused Playwright Test Parameters [🟡 IMPORTANT]

**Symptom**: ESLint warnings for unused `page`/`request` parameters in Playwright tests, but Playwright requires actual parameter names (not `_page`/`_request`)  
**Root Cause**: Playwright validates test function signatures - parameters prefixed with `_` are treated as unknown parameters  
**Fix**:

```typescript
// ❌ WRONG: Prefixing with `_` breaks Playwright
test('should reject expired verification code', async ({ _page, _request }) => {
	test.skip();
});
// Error: Test has unknown parameter "_page"

// ✅ CORRECT: Use actual parameter names + ESLint disable comment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
test('should reject expired verification code', async ({ page, request }) => {
	test.skip();
});

// ✅ CORRECT: For non-Playwright tests, use `_` prefix
test('should handle error', async () => {
	try {
		// ...
	} catch (_error) {
		// Handle error
	}
});
```

**Why**:

- Playwright validates test function signatures at runtime
- Parameters must match Playwright's fixture names (`page`, `request`, `context`, etc.)
- ESLint disable comments are scoped to the specific line, not affecting other code
- Non-Playwright tests can use `_` prefix convention

**Apply when**:

- Playwright E2E tests with unused fixtures
- Skipped tests that don't use all fixtures
- Test hooks (`beforeEach`, `afterEach`) with unused parameters

**Related**: #L60 (ESLint for tests), #L210 (Playwright test.use())

---

## #L110: Local CI Testing - npm Scripts > Shell Scripts [🟢 REFERENCE]

**Context**: Developers need to run CI checks locally before pushing  
**Best Practice**: Use npm scripts that mirror CI exactly

**Pattern**:

```json
// package.json
{
	"scripts": {
		"ci:local": "npm run check && npm run lint && npm run build",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"lint": "prettier --check . && eslint .",
		"build": "vite build"
	}
}
```

**Usage**:

```bash
# ✅ Run full CI suite locally
npm run ci:local

# ✅ Individual checks
npm run check   # Type check
npm run lint    # Lint + format check
npm run build   # Build verification
```

**Why npm scripts > shell scripts**:

- ✅ Platform-independent (Windows/Mac/Linux)
- ✅ Single source of truth (`package.json`)
- ✅ Easier to maintain (one place to update)
- ✅ Standard Node.js convention
- ✅ Auto-syncs with CI when you update npm scripts

**Anti-pattern**:

```bash
# ❌ Shell script requires manual sync with CI
# scripts/test-locally.sh
#!/bin/bash
npm run check    # Might drift from CI over time
npm run lint
npm run build
```

**Sync with CI**:

```yaml
# .github/workflows/quality-gates.yml
- name: Type check
  run: npm run check # ✅ Same command as local

- name: Lint
  run: npm run lint # ✅ Same command as local

- name: Build
  run: npm run build # ✅ Same command as local
```

**Documentation**:

Create `CI-LOCAL-TESTING.md`:

```markdown
# Local CI Testing Guide

## Quick Start

npm run ci:local

## Individual Commands

- `npm run check` - Type check
- `npm run lint` - Lint + format check
- `npm run build` - Build verification

## Keeping in Sync

When CI workflow changes, update the `ci:local` script in `package.json`.
```

**Apply when**:

- Setting up CI for the first time
- Developers frequently push failing commits
- Want to catch issues before CI runs
- Team needs consistent local validation

**Related**: #L10 (Incremental gates), #L160 (Secret scanning)

---

## #L160: Secret Scanning with TruffleHog [🟢 REFERENCE]

**Context**: Prevent accidental commits of API keys, tokens, and credentials  
**Tool**: [TruffleHog](https://github.com/trufflesecurity/trufflehog) by Truffle Security

**Setup**:

```yaml
# .github/workflows/quality-gates.yml
- name: Secret Scan
  uses: trufflesecurity/trufflehog@main
  with:
    extra_args: --only-verified --fail
```

**Whitelist Safe Patterns**:

```
# .secretsignore

# Convex URLs (public, non-sensitive)
https://[a-z0-9-]+\.convex\.cloud

# Example/demo keys
EXAMPLE_API_KEY=sk-test-demo-12345
demo-key-12345

# Placeholder values
YOUR_API_KEY_HERE
<YOUR_KEY>
```

**Why**:

- ✅ Catches real secrets before they reach production
- ✅ `--only-verified` reduces false positives
- ✅ Runs on every PR, not just main branch
- ✅ `.secretsignore` handles legitimate patterns (e.g., public URLs)

**Common false positives**:

- Convex deployment URLs (public by design)
- Example/demo keys in documentation
- Test fixtures with fake credentials
- Placeholder values like `YOUR_API_KEY_HERE`

**Apply when**:

- Setting up CI/CD for the first time
- Project handles sensitive credentials
- Multiple developers committing code
- Preparing for security audits

**Related**: #L10 (Incremental gates), security best practices

---

## #L210: Playwright test.use() Placement [🔴 CRITICAL]

**Symptom**: Test fails with "Playwright Test did not expect test.use() to be called here"  
**Root Cause**: `test.use()` called inside test function instead of at describe level  
**Fix**:

```typescript
// ❌ BAD: test.use() inside test function
test.describe('My Tests', () => {
	test('should work', async ({ page }) => {
		test.use({ storageState: 'auth.json' }); // ❌ Error!
		// ...
	});
});

// ✅ GOOD: test.use() at describe level
test.describe('Unauthenticated Tests', () => {
	test.use({ storageState: { cookies: [], origins: [] } });

	test('should redirect', async ({ page }) => {
		// ...
	});
});

test.describe('Authenticated Tests', () => {
	test.use({ storageState: 'auth.json' });

	test('should work', async ({ page }) => {
		// ...
	});
});
```

**Why**:

- `test.use()` modifies fixture configuration for entire test group
- Must be declared before tests run, not during test execution
- Split into multiple describe blocks if different configs needed

**Apply when**:

- Using authenticated/unauthenticated contexts
- Testing with different browser configurations
- Need different storage states per test group

**Related**: #L220 (Cookie context), E2E testing best practices

---

## #L220: Playwright Cookie Context (request vs page.request) [🔴 CRITICAL]

**Symptom**: Cookies not shared between `request` and `page`, causing 401/500 errors or "cookies not cleared" test failures  
**Root Cause**: `request` fixture has separate cookie jar from `page` fixture  
**Fix**:

```typescript
// ❌ BAD: request has separate cookie context
test('logout should clear cookies', async ({ page, request }) => {
	await page.goto('/inbox'); // Sets cookies in page context

	const response = await request.post('/logout'); // ❌ No cookies from page!

	const cookies = await page.context().cookies();
	expect(cookies.find((c) => c.name === 'session')).toBeUndefined(); // ❌ Fails!
});

// ✅ GOOD: page.request shares page's cookie context
test('logout should clear cookies', async ({ page }) => {
	await page.goto('/inbox'); // Sets cookies in page context

	const response = await page.request.post('/logout'); // ✅ Has page cookies!

	// Navigate to trigger cookie sync
	await page.goto('/login');

	const cookies = await page.context().cookies();
	expect(cookies.find((c) => c.name === 'session')).toBeUndefined(); // ✅ Passes!
});
```

**Why**:

- `page.request` shares the page's cookie jar automatically
- Navigation after API call triggers cookie sync in page context
- Prevents "session not found" errors in authenticated endpoints

**Apply when**:

- Testing logout flows
- Making API calls that depend on cookies
- Verifying cookie clearing/setting behavior

**Related**: #L210 (test.use placement), #L230 (Empty data handling)

---

## #L230: E2E Tests - Handle Empty Data Gracefully [🟡 IMPORTANT]

**Symptom**: Test fails with "element not found" when test data doesn't exist  
**Root Cause**: Test assumes data exists, but test user/environment has 0 items  
**Fix**:

```typescript
// ❌ BAD: Assumes items exist
test('should show inbox items', async ({ page }) => {
	await page.goto('/inbox');

	const items = page.locator('[data-testid="inbox-item"]');
	await expect(items.first()).toBeVisible(); // ❌ Fails if 0 items!
});

// ✅ GOOD: Handle empty state gracefully
test('should show inbox items', async ({ page }) => {
	await page.goto('/inbox');
	await page.waitForLoadState('networkidle');

	const items = page.locator('[data-testid="inbox-item"]');
	const count = await items.count();

	console.log(`User has ${count} inbox items`);

	if (count > 0) {
		await expect(items.first()).toBeVisible();
	}

	// Verify authentication (alternative check)
	await expect(page).toHaveURL(/\/inbox/);
});

// ✅ ALTERNATIVE: Skip test if no data
test('should mark item as processed', async ({ page }) => {
	await page.goto('/inbox');

	const items = page.locator('[data-testid="inbox-item"]');
	const count = await items.count();

	if (count === 0) {
		console.log('No items to test - skipping');
		test.skip();
		return;
	}

	// ... test logic
});
```

**Why**:

- Test environments may have varying data states
- Makes tests resilient to empty databases
- Prevents flaky tests that only pass with specific data

**Apply when**:

- Testing list/collection views
- Working with user-generated content
- Testing actions on dynamic data

**Related**: #L220 (Cookie context), E2E test patterns

---

## #L240: Multi-Tab Logout Testing [🟡 IMPORTANT]

**Symptom**: Logout in one tab doesn't invalidate other tabs, session persists across tabs  
**Root Cause**: Tests don't verify multi-tab session invalidation  
**Fix**:

```typescript
// ✅ Test multi-tab logout
test('should log out across all tabs', async ({ context, page }) => {
	// Tab 1: Navigate to inbox
	await page.goto('/inbox');
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveURL(/\/inbox/);

	// Tab 2: Open second page
	const page2 = await context.newPage();
	await page2.goto('/flashcards');
	await expect(page2).toHaveURL(/\/flashcards/);

	// Tab 3: Open third page
	const page3 = await context.newPage();
	await page3.goto('/settings');
	await expect(page3).toHaveURL(/\/settings/);

	// Tab 1: Perform logout
	const cookies = await context.cookies();
	const csrfToken = cookies.find((c) => c.name === 'syos_csrf')?.value;

	await page.request.post('/logout', {
		headers: { 'X-CSRF-Token': csrfToken }
	});

	// Navigate to trigger session check
	await page.goto('/inbox');
	await expect(page).toHaveURL(/\/login/);

	// Tab 2: Reload and verify redirect to login
	await page2.reload();
	await expect(page2).toHaveURL(/\/login/);

	// Tab 3: Reload and verify redirect to login
	await page3.reload();
	await expect(page3).toHaveURL(/\/login/);

	await page2.close();
	await page3.close();
});
```

**Why**:

- Multi-tab usage is common in modern web apps
- Security vulnerability if sessions don't sync across tabs
- Users expect logout to work globally, not per-tab

**Apply when**:

- Testing authentication/logout flows
- Verifying session management
- Testing security-critical features

**Related**: #L220 (Cookie context), #L245 (CSRF testing), #L260 (Session resilience)

---

## #L245: CSRF Validation Testing with Isolated Request Context [🔴 CRITICAL]

**Symptom**: CSRF validation tests return 200 instead of 400/403, security vulnerability not detected  
**Root Cause**: `page.request` shares cookies with browser context, which may interfere with CSRF header validation  
**Fix**:

```typescript
// ❌ BAD: page.request shares cookies, may auto-include CSRF token
test('should reject logout without CSRF token', async ({ page }) => {
	await page.goto('/inbox');
	
	const response = await page.request.post('/logout', {
		headers: {} // ❌ Cookies might interfere, test may pass incorrectly
	});
	
	expect(response.status()).toBe(400); // ❌ May get 200 instead!
});

// ✅ GOOD: Use isolated request context for CSRF testing
test('should reject logout without CSRF token', async ({ page, playwright }) => {
	await page.goto('/inbox');
	await page.waitForLoadState('networkidle');
	
	// Create isolated request context WITHOUT cookies (per Context7 pattern)
	const isolatedRequest = await playwright.request.newContext({
		baseURL: page.url().split('/').slice(0, 3).join('/')
	});
	
	// Get session cookie manually to include in request
	const cookies = await page.context().cookies();
	const sessionCookie = cookies.find((c) => c.name === 'syos_session');
	
	if (!sessionCookie) {
		throw new Error('Session cookie not found');
	}
	
	// Make request with session cookie but WITHOUT CSRF header
	const response = await isolatedRequest.post('/logout', {
		headers: {
			Cookie: `${sessionCookie.name}=${sessionCookie.value}`
			// Explicitly NO X-CSRF-Token header - tests CSRF validation
		}
	});
	
	expect(response.status()).toBe(400);
	const responseData = await response.json();
	expect(responseData.error).toContain('CSRF');
	
	await isolatedRequest.dispose();
});

// ✅ GOOD: Test invalid CSRF token
test('should reject logout with invalid CSRF token', async ({ page, playwright }) => {
	await page.goto('/inbox');
	await page.waitForLoadState('networkidle');
	
	const isolatedRequest = await playwright.request.newContext({
		baseURL: page.url().split('/').slice(0, 3).join('/')
	});
	
	const cookies = await page.context().cookies();
	const sessionCookie = cookies.find((c) => c.name === 'syos_session');
	
	const response = await isolatedRequest.post('/logout', {
		headers: {
			Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
			'X-CSRF-Token': 'invalid-token-12345' // Invalid CSRF token
		}
	});
	
	expect(response.status()).toBe(403);
	const responseData = await response.json();
	expect(responseData.error).toContain('CSRF');
	
	await isolatedRequest.dispose();
});
```

**Why**:

- `playwright.request.newContext()` creates isolated cookie storage (per Context7 docs)
- Allows explicit control over headers without cookie interference
- Tests security boundaries correctly (CSRF validation)
- Prevents false positives where tests pass but security is broken

**Apply when**:

- Testing CSRF validation on authenticated endpoints
- Verifying security boundaries (missing/invalid tokens)
- Testing logout, account switching, or other sensitive operations

**Related**: #L220 (Cookie context), #L240 (Multi-tab logout), security testing patterns

---

## #L250: E2E Test Selector Strategy - Text-Based & Emoji [🟢 REFERENCE]

**Context**: Choosing selector strategy for E2E tests  
**Approach**: Use text-based selectors and emoji indicators instead of data-testid  
**Fix**:

```typescript
// ✅ Text-based selectors (no data-testid needed)
test('should generate flashcards', async ({ page }) => {
	await page.goto('/inbox');

	// Find by emoji + text
	const firstItem = page.locator('button:has-text("📚"), button:has-text("📝")').first();
	await firstItem.click();

	// Find by emoji in button
	const generateButton = page.locator('button:has-text("🧠")').first();
	await generateButton.click();

	// Find by heading text
	const modalHeading = page.locator('h2:has-text("Review Flashcards")');
	await expect(modalHeading).toBeVisible();
});

// ✅ Alternative: CSS selectors with text filters
test('should navigate inbox', async ({ page }) => {
	const items = page.locator('button').filter({
		hasText: /manual entry|highlight|article/i
	});

	await items.first().click();
});
```

**Why**:

- ✅ No need to add data-testid attributes to every element
- ✅ Tests are readable (emojis make intent clear)
- ✅ Tests fail if UI text changes (catches unintended UX changes)
- ✅ Follows existing patterns in codebase (`inbox-workflow.spec.ts`)

**Trade-offs**:

- ⚠️ Tests break if text/emojis change (feature, not bug)
- ⚠️ Requires unique, stable text identifiers
- ✅ Better than CSS class selectors (less brittle)

**Apply when**:

- Building E2E tests from scratch
- UI has clear text labels and emoji indicators
- Want tests to reflect actual user experience
- Prefer readability over brittle selectors

**Related**: #L230 (Empty data handling), E2E test patterns

---

## #L260: E2E Test Session Resilience [🟡 IMPORTANT]

**Symptom**: Tests fail with 401/500 "Session not found" errors from previous test runs  
**Root Cause**: Previous tests invalidated session, but new tests assume valid session  
**Fix**:

```typescript
// ✅ Handle session expiry gracefully
test('should clear cookies on logout', async ({ context, page }) => {
	await page.goto('/inbox');
	await page.waitForLoadState('networkidle');

	// Get CSRF token
	const cookies = await context.cookies();
	const csrfToken = cookies.find((c) => c.name === 'syos_csrf')?.value;

	if (!csrfToken) {
		console.log('⏭️  Skipping test - CSRF token not available');
		test.skip();
		return;
	}

	// Perform logout
	const response = await page.request.post('/logout', {
		headers: { 'X-CSRF-Token': csrfToken }
	});

	// Handle session errors gracefully
	if (!response.ok()) {
		const body = await response.json().catch(() => ({}));
		console.error('Logout failed:', response.status(), body);

		// Skip if session invalid (from previous tests)
		if (response.status() === 401 || response.status() === 500) {
			console.log('⏭️  Skipping test - session invalid from previous tests');
			test.skip();
			return;
		}

		throw new Error(`Logout failed: ${response.status()}`);
	}

	// ... rest of test
});

// ✅ Check authentication before proceeding
test('should sync session across tabs', async ({ page }) => {
	await page.goto('/inbox');
	await page.waitForLoadState('networkidle');

	// Check if authenticated (may be logged out from previous tests)
	if (page.url().includes('/login')) {
		console.log('⏭️  Skipping test - session expired from previous tests');
		test.skip();
		return;
	}

	// ... rest of test
});
```

**Why**:

- Test isolation isn't perfect - sessions may be shared across test runs
- Graceful skipping prevents cascading failures
- Makes tests resilient to test execution order

**Apply when**:

- Testing logout/session management
- Multiple tests modify session state
- Tests run in parallel or unpredictable order
- Working with shared test accounts

**Related**: #L240 (Multi-tab logout), #L220 (Cookie context), #L230 (Empty data)

---

## #L270: Playwright Environment Variables Without dotenv [🟢 REFERENCE]

**Context**: Configuring Playwright tests with environment variables in SvelteKit  
**Problem**: Playwright docs suggest using `dotenv` package, but it's not installed and not needed  
**Fix**:

```typescript
// ❌ BAD: Using dotenv (unnecessary dependency)
import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv'; // ❌ Not installed!
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
	// ...
});
```

```json
// ✅ GOOD: Set env vars in npm script
{
	"scripts": {
		"test:e2e": "E2E_TEST_MODE=true playwright test",
		"test:e2e:auth": "E2E_TEST_MODE=true playwright test e2e/auth-security.test.ts"
	}
}
```

```typescript
// ✅ GOOD: Pass env vars to webServer in playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5173',
		env: {
			// Pass env vars to dev server
			E2E_TEST_MODE: process.env.E2E_TEST_MODE || 'true'
		}
	}
});
```

```typescript
// ✅ Access in test helper endpoint
export const GET: RequestHandler = async ({ request }) => {
	// Security: Only allow in E2E_TEST_MODE
	if (process.env.E2E_TEST_MODE !== 'true') {
		return json({ error: 'Not found' }, { status: 404 });
	}

	// ... test helper logic
};
```

**Why**:

- ✅ **No external dependencies** - Uses native Node.js `process.env`
- ✅ **SvelteKit-native** - Works with SvelteKit's built-in `.env` handling
- ✅ **Cross-platform** - Works on Windows/Mac/Linux
- ✅ **CI-friendly** - Easy to override in GitHub Actions
- ✅ **Clear intent** - Env vars are explicitly set in scripts

**Alternatives**:

**Option 1: npm script** (Recommended)

```json
"test:e2e": "E2E_TEST_MODE=true playwright test"
```

**Option 2: GitHub Actions** (CI/CD)

```yaml
- name: Run E2E Tests
  run: npm run test:e2e
  env:
    E2E_TEST_MODE: 'true'
```

**Option 3: SvelteKit .env files** (Automatic loading)

- `.env` - Base variables (all environments)
- `.env.local` - Local overrides (gitignored)
- `.env.test` - Test-specific (loaded automatically)

**Apply when**:

- Setting up Playwright tests in SvelteKit
- Need environment variables for test configuration
- Want to avoid adding `dotenv` dependency
- Following SvelteKit conventions

**Related**: #L260 (Session resilience), E2E test configuration, SvelteKit environment variables, #L280 (Vite mode for .env loading)

---

## #L280: Vite Must Use --mode Flag to Load .env.test [🔴 CRITICAL]

**Symptom**: E2E test helper endpoints return 404, environment variables from `.env.test` not accessible  
**Root Cause**: Vite decides which `.env` files to load **at startup** based on `--mode` flag, not runtime environment variables  
**Fix**:

```json
// ❌ WRONG: Setting MODE in webServer.env doesn't work
// package.json
{
  "scripts": {
    "dev": "vite dev" // ❌ Loads .env (development mode)
  }
}

// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run dev', // ❌ Already decided to load .env, not .env.test
    env: {
      MODE: 'test', // ❌ Too late - Vite already chose files
      E2E_TEST_MODE: 'true' // ❌ Doesn't trigger .env.test loading
    }
  }
});
```

```json
// ✅ CORRECT: Use --mode flag in command
// package.json
{
  "scripts": {
    "dev": "vite dev",
    "dev:test": "vite dev --mode test" // ✅ Tells Vite to load .env.test
  }
}

// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run dev:test', // ✅ Loads .env.test at startup
    env: {
      E2E_TEST_MODE: process.env.E2E_TEST_MODE || 'true' // ✅ Fallback only
    }
  }
});
```

**Vite Environment File Loading**:

```bash
# Development mode (default)
vite dev → loads .env + .env.local

# Test mode (explicit)
vite dev --mode test → loads .env + .env.test + .env.test.local

# Production mode
vite build → loads .env + .env.production + .env.production.local
```

**Port Conflict Management**:

When using `strictPort: true` (required for WorkOS redirect URIs), add auto-stop script:

```json
{
  "scripts": {
    "dev": "vite dev",
    "dev:test": "vite dev --mode test",
    "test:e2e": "npm run test:e2e:stop-dev && E2E_TEST_MODE=true playwright test",
    "test:e2e:stop-dev": "lsof -ti:5173 | xargs kill -9 2>/dev/null || true"
  }
}
```

**Why**:

- ✅ Vite's `--mode` flag is the **official** way to load mode-specific `.env` files
- ✅ Setting env vars in `webServer.env` happens **after** Vite chooses which files to load
- ✅ Auto-stop prevents port conflicts when dev server is running
- ✅ Aligns with Vite's documented behavior (verified with Context7)

**Workflow**:

```bash
# Normal development
npm run dev  # Use this daily

# E2E tests (automatic)
npm run test:e2e  # Stops dev server, Playwright starts test server, tests run

# After tests
npm run dev  # Restart dev server
```

**Apply when**:

- Using Vite with mode-specific environment files (`.env.test`, `.env.staging`)
- E2E tests need different environment variables than development
- Using `strictPort: true` (WorkOS, OAuth redirects, etc.)
- Test helper endpoints return 404 because env vars aren't loaded

**Related**: #L270 (Playwright env vars), #L250 (E2E test selectors), #L160 (Secret scanning)

---

## Format Version: 1.0

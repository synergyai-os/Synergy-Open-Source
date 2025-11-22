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

## #L90: Creating Custom ESLint Rules in Flat Config [🟡 IMPORTANT]

**Symptom**: Need to enforce architectural boundaries (e.g., module boundaries) but no existing ESLint rule covers it  
**Root Cause**: Standard ESLint rules don't understand project-specific architecture patterns  
**Fix**:

```javascript
// ✅ CORRECT: Create custom rule in eslint-rules/ directory
// eslint-rules/no-cross-module-imports.js
export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Prevent cross-module imports to enforce module boundaries',
			category: 'Architecture',
			recommended: true
		},
		messages: {
			crossModuleImport:
				'Cross-module import detected: "{{sourceModule}}" → "{{targetModule}}". ' +
				'Modules should communicate via API contracts. ' +
				'Use dependency injection via context (getContext) or import from core module instead.'
		},
		schema: []
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				const source = node.source.value;
				const filePath = context.getFilename();
				
				// Extract module names from paths
				const sourceModule = getModuleFromPath(filePath);
				const targetModule = getModuleFromImport(source);
				
				// Check if cross-module import (block if different modules, except core)
				if (sourceModule && targetModule && 
				    sourceModule !== targetModule && 
				    targetModule !== 'core') {
					context.report({
						node: node.source,
						messageId: 'crossModuleImport',
						data: { sourceModule, targetModule }
					});
				}
			}
		};
	}
};

// eslint.config.js
import noCrossModuleImports from './eslint-rules/no-cross-module-imports.js';

export default defineConfig([
	// ... other configs
	{
		plugins: {
			synergyos: {
				rules: {
					'no-cross-module-imports': noCrossModuleImports
				}
			}
		},
		rules: {
			'synergyos/no-cross-module-imports': 'error'
		}
	}
]);
```

**Why**:
- Custom rules catch architectural violations at development time (not production)
- Prevents accidental tight coupling between modules
- Enforces architectural patterns automatically (no manual code review needed)
- Clear error messages guide developers to correct patterns

**Key Points**:
- Use ES module syntax (`export default`) for flat config compatibility
- Rule file location: `eslint-rules/` directory (convention)
- Plugin namespace: Use project name (e.g., `synergyos`) to avoid conflicts
- Rule name format: `plugin-name/rule-name` (e.g., `synergyos/no-cross-module-imports`)
- Severity: Use `'error'` to block CI, `'warn'` for non-blocking

**Apply when**:
- Need to enforce architectural boundaries (module boundaries, layer boundaries)
- Standard ESLint rules don't cover project-specific patterns
- Want to catch violations at development time (not production)
- Architectural violations are common and need automated prevention

**Related**: #L60 (ESLint for tests), #L70 (Disable rules with limitations), dev-docs/2-areas/architecture/module-boundary-enforcement.md

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

## #L290: Playwright Project Separation for Authentication [🔴 CRITICAL]

**Symptom**: Tests fail with "Session record not found" or authentication state conflicts. Unauthenticated tests (registration, rate-limiting) interfere with authenticated test sessions.

**Root Cause**: All tests share a single `storageState` file (`user.json`), causing conflicts when tests reset storage state with `test.use({ storageState: { cookies: [], origins: [] } })`

**Fix**:

```typescript
// playwright.config.ts
// ❌ WRONG - Single project with shared storageState
projects: [
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'e2e/.auth/user.json' // All tests use this
    },
    dependencies: ['setup']
  }
]

// ✅ CORRECT - Separate projects by authentication need
projects: [
  // Setup project - creates authentication state once
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/
  },
  
  // Authenticated tests - use pre-saved session
  {
    name: 'authenticated',
    testMatch: /inbox|settings|multi-tab|flashcard|quick-create/,
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'e2e/.auth/user.json'
    },
    dependencies: ['setup'] // Wait for auth setup
  },
  
  // Unauthenticated tests - start with empty storage
  {
    name: 'unauthenticated',
    testMatch: /auth-registration|rate-limiting|demo/,
    use: {
      ...devices['Desktop Chrome'],
      storageState: { cookies: [], origins: [] }
    }
    // No dependencies - can run independently
  }
]
```

```typescript
// e2e/rate-limiting.test.ts
// ❌ WRONG - Reset storage state in test file
test.use({ storageState: { cookies: [], origins: [] } }); // Conflicts with shared session

// ✅ CORRECT - Let project config handle storage state
// No test.use() needed - project routes test automatically
test.describe('Rate Limiting', () => {
  test('should block excessive login attempts', async ({ request }) => {
    // Automatically uses empty storage state from 'unauthenticated' project
  });
});
```

**Why**:

- ✅ Tests routed to correct project via `testMatch` patterns (no manual `test.use()`)
- ✅ No storage state conflicts between authenticated/unauthenticated tests
- ✅ Clear separation of concerns (each project has specific authentication needs)
- ✅ Foundation for parallel execution (each project can run independently)
- ✅ Follows [Playwright official best practices](https://playwright.dev/docs/test-projects)

**Validation**:

```bash
# Check test routing
npm run test:e2e -- --list

# Should see:
# [authenticated] inbox-workflow.spec.ts
# [authenticated] settings-security.spec.ts
# [unauthenticated] auth-registration.test.ts
# [unauthenticated] rate-limiting.test.ts
```

**Apply when**:

- Tests fail with "Session record not found" errors
- Authenticated tests redirect to login unexpectedly
- Unauthenticated tests (registration, rate-limiting) pollute shared session
- Need to separate test concerns by authentication state

**Related**: #L280 (Vite mode flag), #L270 (Env vars), #L220 (Cookie context)

---

## #L310: WorkOS Test Identity Provider Configuration [🔴 CRITICAL]

**Symptom**: E2E tests fail with WorkOS error `{"error":"sso_required","error_description":"User must authenticate using one of the matching connections"}`

**Root Cause**: Test accounts are configured to require SSO connections, but E2E auth setup tries to use password authentication directly

**Fix**:

**Option 1: Use WorkOS Test Identity Provider** (Recommended)

```typescript
// e2e/auth.setup.ts
import { setup, expect } from '@playwright/test';

// ✅ CORRECT - Use WorkOS Test IdP credentials
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'test-password';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(TEST_USER_EMAIL);
  await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Wait for SSO flow to complete (Test IdP handles automatically)
  await page.waitForURL(/\/(inbox|dashboard)/, { timeout: 15000 });
  
  // Save authenticated state
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});
```

**WorkOS Dashboard Configuration**:

1. Navigate to [Test SSO](https://workos.com/docs/sso/test-sso/testing-with-the-test-identity-provider)
2. Create test organization with `example.com` domain
3. Configure Test Identity Provider connection
4. Use Test IdP credentials in E2E tests

**Option 2: Bypass WorkOS for E2E** (Quick fix, not recommended)

```typescript
// src/lib/server/auth/workos.ts
export async function authenticateWithPassword(email: string, password: string) {
  // ⚠️ ONLY for E2E tests - bypass WorkOS
  if (process.env.E2E_TEST_MODE === 'true') {
    // Mock successful authentication
    return {
      userId: 'test-user-id',
      email: email
    };
  }
  
  // Production - real WorkOS call
  return await workos.auth.authenticateWithPassword({ email, password });
}
```

**Why Option 1 is Better**:

- ✅ Tests real SSO authentication flow (matches production)
- ✅ No code changes needed (only configuration)
- ✅ Validates complete auth integration
- ❌ Option 2 doesn't test real auth (creates maintenance burden)

**Apply when**:

- E2E tests fail with "sso_required" errors
- WorkOS auth works in development but fails in tests
- Test accounts are configured for SSO-only authentication

**Related**: #L290 (Project separation), #L320 (Mock external APIs)

---

## #L320: Mock External APIs in E2E Tests [🟡 IMPORTANT]

**Symptom**: E2E tests fail with rate limit errors like `{"statusCode":429,"name":"rate_limit_exceeded","message":"Too many requests. You can only make 2 requests per second..."}`

**Root Cause**: Tests trigger real external API calls (Resend email, payment providers, etc.), hitting rate limits and consuming API quotas

**Fix**: Use two-layer defense (check at both caller and action levels)

### Layer 1: Caller Check (convex/verification.ts)

```typescript
export const createAndSendVerificationCode = action({
  args: { email: v.string(), type: v.union(...), firstName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // 1. Create verification code
    const { code } = await ctx.runMutation(internal.verification.createVerificationCodeInternal, {
      email: args.email,
      type: args.type
    });

    // 2. Send email - skip in E2E test mode
    const isTestMode = process.env.E2E_TEST_MODE === 'true';
    
    if (!isTestMode) {
      await ctx.runAction(internal.email.sendVerificationEmail, {
        email: args.email,
        code,
        firstName: args.firstName
      });
    } else {
      console.log('🧪 E2E_TEST_MODE: Skipping email send, code:', code);
    }

    return { success: true };
  }
});
```

### Layer 2: Action Check (convex/email.ts)

```typescript
export const sendVerificationEmail = internalAction({
  args: {
    email: v.string(),
    code: v.string(),
    firstName: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // E2E test mode - return mock response (defense in depth)
    if (process.env.E2E_TEST_MODE === 'true') {
      console.log('📧 [E2E Mock] Verification email suppressed:', {
        to: args.email,
        code: args.code,
        firstName: args.firstName || 'User'
      });
      
      return {
        success: true,
        emailId: `mock-verification-${args.email}-${Date.now()}`
      };
    }
    
    // Production - real Resend API call
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: 'SynergyOS <noreply@mail.synergyos.ai>',
      to: args.email,
      subject: 'Verify your email address',
      html: emailTemplate(args.code)
    });
    
    if (result.error) {
      throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
    }
    
    return { success: true, emailId: result.data?.id };
  }
});
```

### Setup: Pass E2E_TEST_MODE as Parameter (Recommended)

**⚠️ IMPORTANT**: Don't set `E2E_TEST_MODE` in Convex environment variables. It will suppress emails in production/dev.

Instead, pass `skipEmail` parameter from SvelteKit server (which reads Vite's `E2E_TEST_MODE`):

```typescript
// src/routes/auth/register/+server.ts
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ event }) => {
  // Check E2E_TEST_MODE from Vite server environment (set by npm script)
  const skipEmail = process.env.E2E_TEST_MODE === 'true' || env.E2E_TEST_MODE === 'true';
  
  await convex.action(api.verification.createAndSendVerificationCode, {
    email,
    type: 'registration',
    skipEmail: skipEmail || undefined // Only pass if true
  });
};
```

```typescript
// convex/verification.ts - Accept skipEmail parameter
export const createAndSendVerificationCode = action({
  args: {
    email: v.string(),
    type: v.union(...),
    skipEmail: v.optional(v.boolean()) // ✅ Passed from SvelteKit server
  },
  handler: async (ctx, args) => {
    const { code } = await ctx.runMutation(...);
    
    // Check skipEmail parameter (from SvelteKit) OR process.env (backwards compat)
    const shouldSkipEmail = args.skipEmail === true || process.env.E2E_TEST_MODE === 'true';
    
    if (!shouldSkipEmail) {
      await ctx.runAction(internal.email.sendVerificationEmail, { email, code });
    }
  }
});
```

**Why this approach**:
- ✅ E2E tests work (emails skipped during tests)
- ✅ Production/dev sends emails normally (no Convex env var needed)
- ✅ No risk of accidentally leaving E2E_TEST_MODE set in Convex
- ✅ Backwards compatible (still checks process.env as fallback)

### Legacy: Convex Environment Variable (Not Recommended)

```bash
# ❌ DON'T DO THIS - Suppresses emails in production/dev
npx convex env set E2E_TEST_MODE true
```

**Why this approach**:

- ✅ **E2E tests work**: Vite server has `E2E_TEST_MODE=true` (from npm script), passes `skipEmail: true` to Convex
- ✅ **Production/dev sends emails**: No `E2E_TEST_MODE` in Vite → passes `skipEmail: undefined` → Convex sends emails
- ✅ **No Convex env var needed**: Don't need to set `E2E_TEST_MODE` in Convex environment
- ✅ **Backwards compatible**: Still checks `process.env.E2E_TEST_MODE` in Convex as fallback
- ✅ **Safer**: Can't accidentally leave `E2E_TEST_MODE` set in Convex (affects all deployments)

**Environment Variable Separation**:

- **SvelteKit/Vite**: Reads from `process.env` (set by npm scripts, `.env` files, or Playwright `webServer.env`)
- **Convex**: Reads from Convex environment variables (set via `npx convex env set`)
- **These are separate**: Setting `E2E_TEST_MODE` in npm script doesn't affect Convex `process.env`

**Apply when**:

- Setting up E2E tests that need to skip external API calls (email, SMS, payment)
- Want to avoid setting test flags in Convex environment variables
- Need to ensure production/dev environments aren't affected by test configuration

**Related**: #L1320 (Pass E2E_TEST_MODE as parameter), #L280 (Vite mode flag), #L310 (WorkOS test config)

---

## #L1320: Pass E2E_TEST_MODE as Parameter, Not Convex Env Var [🔴 CRITICAL]

**Symptom**: Verification emails not sent in production/dev, but password reset emails work. E2E_TEST_MODE was set in Convex environment variables.

**Root Cause**: Convex environment variables (`npx convex env set`) are separate from SvelteKit/Vite environment variables. Setting `E2E_TEST_MODE=true` in Convex suppresses emails globally, affecting production/dev environments.

**Fix**: Pass `skipEmail` parameter from SvelteKit server (which reads Vite's `E2E_TEST_MODE`) instead of checking `process.env.E2E_TEST_MODE` in Convex:

```typescript
// ✅ CORRECT: SvelteKit server checks E2E_TEST_MODE and passes parameter
// src/routes/auth/register/+server.ts
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ event }) => {
  // Check E2E_TEST_MODE from Vite server (set by npm script: E2E_TEST_MODE=true playwright test)
  const skipEmail = process.env.E2E_TEST_MODE === 'true' || env.E2E_TEST_MODE === 'true';
  
  await convex.action(api.verification.createAndSendVerificationCode, {
    email,
    type: 'registration',
    skipEmail: skipEmail || undefined // Only pass if true
  });
};
```

```typescript
// ✅ CORRECT: Convex action accepts skipEmail parameter
// convex/verification.ts
export const createAndSendVerificationCode = action({
  args: {
    email: v.string(),
    type: v.union(v.literal('registration'), v.literal('login'), v.literal('email_change')),
    skipEmail: v.optional(v.boolean()) // ✅ Passed from SvelteKit server
  },
  handler: async (ctx, args) => {
    const { code } = await ctx.runMutation(internal.verification.createVerificationCodeInternal, {
      email: args.email,
      type: args.type
    });

    // Check skipEmail parameter (from SvelteKit) OR process.env (backwards compatibility)
    const shouldSkipEmail = args.skipEmail === true || process.env.E2E_TEST_MODE === 'true';

    if (!shouldSkipEmail) {
      await ctx.runAction(internal.email.sendVerificationEmail, {
        email: args.email,
        code,
        firstName: args.firstName
      });
    } else {
      console.log('🧪 E2E_TEST_MODE: Skipping email send, code:', code);
    }

    return { success: true };
  }
});
```

```typescript
// ❌ WRONG: Checking process.env.E2E_TEST_MODE in Convex (requires Convex env var)
export const createAndSendVerificationCode = action({
  handler: async (ctx, args) => {
    // This checks Convex environment variables, not Vite/SvelteKit env
    const isTestMode = process.env.E2E_TEST_MODE === 'true'; // ❌ Requires npx convex env set
    
    if (!isTestMode) {
      await ctx.runAction(internal.email.sendVerificationEmail, { email, code });
    }
  }
});
```

**Why this approach**:

- ✅ **E2E tests work**: Vite server has `E2E_TEST_MODE=true` (from npm script), passes `skipEmail: true` to Convex
- ✅ **Production/dev sends emails**: No `E2E_TEST_MODE` in Vite → passes `skipEmail: undefined` → Convex sends emails
- ✅ **No Convex env var needed**: Don't need to set `E2E_TEST_MODE` in Convex environment
- ✅ **Backwards compatible**: Still checks `process.env.E2E_TEST_MODE` in Convex as fallback
- ✅ **Safer**: Can't accidentally leave `E2E_TEST_MODE` set in Convex (affects all deployments)

**Environment Variable Separation**:

- **SvelteKit/Vite**: Reads from `process.env` (set by npm scripts, `.env` files, or Playwright `webServer.env`)
- **Convex**: Reads from Convex environment variables (set via `npx convex env set`)
- **These are separate**: Setting `E2E_TEST_MODE` in npm script doesn't affect Convex `process.env`

**Apply when**:

- Setting up E2E tests that need to skip external API calls (email, SMS, payment)
- Want to avoid setting test flags in Convex environment variables
- Need to ensure production/dev environments aren't affected by test configuration
- Verification emails not being sent in production/dev

**Related**: #L320 (Mock external APIs), #L280 (Vite mode flag), #L310 (WorkOS test config)

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  // ...
  webServer: {
    command: 'npm run dev:test',  // Uses vite dev --mode test
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    env: {
      // Fallback only - actual value comes from .env.test via vite --mode test
      E2E_TEST_MODE: process.env.E2E_TEST_MODE || 'true'
    }
  }
});
```

**Why**:

- ✅ Tests run faster (no network latency)
- ✅ No rate limit errors (no external API calls)
- ✅ No API costs during testing
- ✅ Still tests full application flow (just skips external service)
- ✅ Predictable test results (no external service downtime)

**Common APIs to Mock**:

| Service | Rate Limit | Why Mock |
|---------|------------|----------|
| Resend Email | 2 req/sec, 100 emails/day | Hit limits quickly with parallel tests |
| Stripe Payments | N/A | Avoid test charges, token creation |
| Twilio SMS | Variable | Avoid SMS costs |
| S3/Storage | N/A | Avoid storage costs, faster tests |

**Apply when**:

- E2E tests hit external API rate limits
- Tests fail with 429 "Too Many Requests" errors
- Want to avoid API costs during testing
- External service downtime causes test flakiness
- Tests need consistent, predictable behavior

**Related**: #L310 (WorkOS test config), #L280 (Vite mode flag), #L290 (Project separation)

---

## #L330: Rate Limit Test Isolation with X-Test-ID Header [🔴 CRITICAL]

**Symptom**: E2E tests fail with "Too many attempts" errors or rate limit middleware blocks requests before feature logic can execute. Tests that should track 5 verification attempts only register 1-2 attempts.

**Root Cause**: Rate limit middleware uses shared buckets across tests (e.g., `/auth/verify-email` uses `RATE_LIMITS.login` bucket). Multiple test runs or parallel execution exhaust rate limits before feature-level rate limiting (e.g., verification code attempts) can be tested.

**Fix**:

```typescript
// ✅ CORRECT: Intercept requests to add X-Test-ID header for rate limit isolation
test('should rate limit verification attempts', async ({ page }) => {
	const timestamp = Date.now();
	const testEmail = `test+${timestamp}@example.com`;
	const testId = `rate-limit-test-${timestamp}`;

	// Intercept verification requests to add X-Test-ID header
	await page.route('**/auth/verify-email', async (route) => {
		await route.continue({
			headers: {
				...route.request().headers(),
				'X-Test-ID': testId // ✅ Isolates this test run's rate limit bucket
			}
		});
	});

	// Register user
	await page.goto('/register');
	await page.fill('input[type="email"]', testEmail);
	// ... rest of test
});
```

```typescript
// src/lib/server/middleware/rateLimit.ts
// ✅ EXISTING: Middleware already supports X-Test-ID header (from SYOS-200)
export function withRateLimit<T>(
	config: RateLimitConfig,
	handler: (context: { event: RequestEvent }) => Promise<T>
) {
	return async (event: RequestEvent): Promise<T | Response> => {
		const identifier = getClientIdentifier(event.request);
		
		// Create rate limiter instance
		const limiter = new RateLimiter({
			keyPrefix: `${config.keyPrefix}:${identifier}`,
			tokens: config.tokens,
			interval: config.interval
		});
		
		// ... rest of rate limiting logic
	};
}

function getClientIdentifier(request: Request): string {
	// Check for X-Test-ID header FIRST (per SYOS-200 pattern)
	const testId = request.headers.get('X-Test-ID');
	if (testId) {
		return `test-${testId}`; // ✅ Isolated bucket per test
	}
	
	// Fallback to IP/fingerprint
	return getClientIP(request) || 'unknown';
}
```

**Why**:

- ✅ Each test run gets isolated rate limit bucket via `X-Test-ID` header
- ✅ Tests don't interfere with each other (parallel or sequential)
- ✅ Feature-level rate limiting (e.g., verification code attempts) can execute without middleware interference
- ✅ Reuses existing `X-Test-ID` infrastructure from SYOS-200
- ✅ Works for both parallel and serial test execution

**Apply when**:

- E2E tests verify rate limiting behavior (e.g., "should show error after 5 attempts")
- Tests fail with 429 errors from middleware before feature logic executes
- Verification code attempts don't increment correctly (middleware blocks requests)
- Tests need isolated rate limit buckets for parallel execution
- Testing auth flows (login, registration, password reset, verification)

**Common Mistakes**:

```typescript
// ❌ WRONG: Skipping rate limit in E2E_TEST_MODE bypasses security testing
if (process.env.E2E_TEST_MODE === 'true') {
	return handler({ event }); // ❌ Can't test rate limiting
}

// ❌ WRONG: Not intercepting requests - tests share rate limit buckets
test('should rate limit attempts', async ({ page }) => {
	// Missing page.route() interception
	await page.goto('/verify-email');
	// ... test fails with 429 from middleware
});

// ✅ CORRECT: Use X-Test-ID for test isolation, rate limiting still active
await page.route('**/auth/verify-email', async (route) => {
	await route.continue({
		headers: {
			...route.request().headers(),
			'X-Test-ID': `test-${timestamp}` // ✅ Isolated bucket
		}
	});
});
```

**Related**: #L290 (Playwright project separation), #L320 (Mock external APIs), #L260 (Session resilience), SYOS-200 (X-Test-ID implementation), SYOS-201 (Rate limit test fix), #L340 (Global cleanup in parallel tests)

---

## #L340: Avoid Global Cleanup in Parallel Tests [🔴 CRITICAL]

**Symptom**: Tests pass in single-worker mode but fail in parallel with "Expected: 429, Received: 401" errors. Rate limiting tests don't trigger 429 on 6th request.

**Root Cause**: `test.beforeEach` clears ALL rate limits globally (e.g., `/test/reset-rate-limits` endpoint), causing race conditions in parallel execution. When Test A is on request 6/6 (should be rate limited), Test B's `beforeEach` clears the rate limit store, causing Test A's request to get 401 instead of 429.

**Fix**:

```typescript
// ❌ WRONG: Global cleanup in beforeEach interferes with parallel tests
test.describe('Rate Limiting', () => {
	test.beforeEach(async ({ request }) => {
		// Clears ALL rate limits - breaks parallel execution
		await request.post('/test/reset-rate-limits'); // ❌
	});

	test('should block excessive login attempts', async ({ request }) => {
		const testId = getTestId('login-excessive'); // Unique per test
		
		// ... 6 requests
		// Request 6 expects 429, but another test's beforeEach cleared limits!
	});
});

// ✅ CORRECT: Remove global cleanup, rely on unique test IDs for isolation
test.describe('Rate Limiting', () => {
	// No beforeEach - tests use unique IDs for isolation
	// Each test generates: `login-excessive-1763242332194-jj457c` (timestamp + random)
	
	test('should block excessive login attempts', async ({ request }) => {
		const testId = getTestId('login-excessive'); // ✅ Isolated bucket
		
		for (let i = 0; i < 6; i++) {
			const response = await request.post('/auth/login', {
				headers: { 'X-Test-ID': testId } // ✅ Unique bucket per test
			});
			
			if (i < 5) {
				expect([401, 404]).toContain(response.status()); // ✅
			} else {
				expect(response.status()).toBe(429); // ✅ Works in parallel!
			}
		}
	});
});
```

```typescript
// e2e/fixtures.ts
/**
 * Generate unique test ID for rate limit isolation
 * Format: {testName}-{timestamp}-{random}
 */
export function getTestId(testName: string): string {
	return `${testName}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
// Example: "login-excessive-1763242332194-jj457c"
```

**Why This Works**:

- ✅ Each test run gets unique `X-Test-ID` → isolated rate limit bucket (per #L330)
- ✅ No global cleanup → no race conditions in parallel execution
- ✅ Rate limits expire naturally after 60s (sliding window)
- ✅ Tests can run with `--workers=5` without interference

**Parallel Execution Flow**:

```
Worker 1: Test A (testId: login-excessive-...1234)
  Request 1/6 → bucket: test:login-excessive-...1234 (count: 1)
  Request 2/6 → bucket: test:login-excessive-...1234 (count: 2)
  ...
  Request 6/6 → bucket: test:login-excessive-...1234 (count: 6) → 429 ✅

Worker 2: Test B (testId: login-excessive-...5678) [running simultaneously]
  Request 1/6 → bucket: test:login-excessive-...5678 (count: 1)
  ❌ BEFORE: beforeEach cleared ALL buckets → Test A's count reset to 0
  ✅ AFTER: No cleanup → Test A's bucket untouched
```

**When Global Cleanup IS Needed**:

If tests need cleanup (e.g., database state), make it **test-specific**:

```typescript
// ✅ CORRECT: Test-specific cleanup
test.beforeEach(async ({ request }) => {
	const testId = getTestId('my-test');
	
	// Only clear THIS test's data
	await request.post('/test/cleanup', {
		data: { testId } // ✅ Scoped to this test
	});
});
```

**Apply when**:

- Tests pass in single-worker mode (`--workers=1`) but fail in parallel (`--workers=5`)
- Rate limiting tests get unexpected status codes (401 instead of 429)
- `beforeEach`/`afterEach` hooks modify global state (database, cache, rate limits)
- Tests use unique identifiers for isolation (testId, userId, email with timestamp)

**Common Symptoms**:

```bash
# Single worker: PASS
npm run test:e2e -- rate-limiting.test.ts --workers=1
# ✅ 9 passed

# Parallel workers: FAIL
npm run test:e2e -- rate-limiting.test.ts --workers=5
# ❌ 4 failed: Expected 429, Received 401
```

**Related**: #L330 (X-Test-ID header), #L290 (Playwright project separation), #L260 (Session resilience), SYOS-200 (Rate limit fix)

---

## #L1850: Pre-Commit Hook Subshell Exit Bug [🔴 CRITICAL]

**Symptom**: Pre-commit hook reports errors but doesn't block commits. `exit 1` inside a `while` loop doesn't stop the commit.  
**Root Cause**: Piping output into `while read` creates a subshell. `exit 1` inside the subshell only exits that subshell, not the main script.  
**Fix**:

```bash
# ❌ WRONG: exit 1 inside pipe subshell doesn't block commit
git diff --cached --name-only | grep -E '\.(svelte|ts)$' | while read file; do
	if git diff --cached "$file" | grep -E 'pattern' > /dev/null; then
		echo "Error detected in: $file"
		exit 1  # ❌ Only exits subshell, commit proceeds!
	fi
done

# ✅ CORRECT: Use process substitution to run loop in main shell
VIOLATION_FOUND=0
while IFS= read -r file; do
	if git diff --cached "$file" | grep -E 'pattern' > /dev/null; then
		echo "Error detected in: $file"
		VIOLATION_FOUND=1  # ✅ Set flag in main shell
	fi
done < <(git diff --cached --name-only | grep -E '\.(svelte|ts)$')

# Check flag and exit in main shell
if [ "$VIOLATION_FOUND" -eq 1 ]; then
	exit 1  # ✅ Blocks commit correctly
fi
```

**Key Changes**:

1. **Process substitution**: `< <(...)` runs command in subshell but feeds output to `while` loop in main shell
2. **Flag variable**: Set `VIOLATION_FOUND=1` instead of `exit 1` inside loop
3. **Exit after loop**: Check flag and `exit 1` in main shell after loop completes
4. **`read -r`**: Prevents backslash interpretation
5. **`IFS=`**: Handles filenames with spaces correctly
6. **Quote variables**: `"$file"` prevents word-splitting

**Why**:

- ✅ Loop runs in main shell (not subshell) → flag variable persists
- ✅ `exit 1` in main shell → actually blocks commit
- ✅ Processes all files before exiting → comprehensive error report
- ✅ POSIX-compliant (works in `#!/bin/sh`)

**Alternative Pattern** (if process substitution not available):

```bash
# ✅ ALTERNATIVE: Use for loop with command substitution (less robust)
VIOLATION_FOUND=0
for file in $(git diff --cached --name-only | grep -E '\.(svelte|ts)$'); do
	if git diff --cached "$file" | grep -E 'pattern' > /dev/null; then
		echo "Error detected in: $file"
		VIOLATION_FOUND=1
	fi
done

if [ "$VIOLATION_FOUND" -eq 1 ]; then
	exit 1
fi
```

**Note**: `for` loop with command substitution has word-splitting issues with filenames containing spaces. Process substitution (`while read -r`) is preferred.

**Apply when**:

- Writing pre-commit hooks that check staged files
- Using `while read` loops with piped input
- Need to exit script based on loop results

**Related**: #L10 (Incremental CI gates), #L110 (Local CI testing)

---

## #L1900: Pre-Commit Hook (Husky) - Token Build & Validation [🟡 IMPORTANT]

**Context**: Design tokens must be built and validated before commits to prevent invalid token references and manual CSS edits  
**Location**: `.husky/pre-commit`  
**Runs automatically**: Via Husky on every `git commit` (installed via `npm install`)

**Validation Steps** (in order):

1. **Confidentiality check** (`npm run check:confidentiality`) - Blocks confidential information
2. **ESLint** (`npm run lint`) - Blocks hardcoded values
3. **Token build** (`npm run tokens:build`) - Auto-generates CSS from `design-system.json`
4. **Auto-stage CSS** (`git add src/styles/tokens/*.css src/styles/utilities/*.css`) - Stages regenerated files
5. **Semantic validation** (`npm run tokens:validate-semantic`) - Blocks commits with hardcoded semantic tokens
6. **Manual edit detection** (`git diff --quiet`) - Blocks commits with manually edited CSS files
7. **Design system audit** (`npm run audit:quick`) - Warns on violations (non-blocking)
8. **Code formatting** (`npx lint-staged`) - Auto-formats staged files

**Bypass** (use sparingly):

```bash
git commit --no-verify
```

**Why**:

- ✅ Catches token violations before CI (faster feedback)
- ✅ Prevents manual CSS edits (enforces single source of truth)
- ✅ Auto-stages regenerated files (no manual git add needed)
- ✅ Runs automatically (no manual installation required)

**Avoiding Redundant Hooks**:

- ❌ **WRONG**: Create `scripts/git-hooks/pre-commit` AND use Husky (conflicts)
- ✅ **CORRECT**: Use Husky exclusively (`.husky/pre-commit`)
- ✅ **CORRECT**: Update `scripts/install-git-hooks.sh` to skip pre-commit if Husky manages it
- ✅ **CORRECT**: Husky hooks install automatically via `npm install` (see `package.json` "prepare" script)

**Current Status**:

- ⚠️ Semantic validation will fail until Phase 5 completes (98 violations expected)
- ✅ Hook blocks commits correctly when violations exist
- ✅ Manual edit detection working correctly

**See**: SYOS-477 (Phase 3: CI Integration), `dev-docs/2-areas/design/design-tokens.md`

**Related**: #L1850 (Pre-commit hook subshell exit bug), #L1950 (Token usage reports), #L1905 (Avoiding redundant git hooks)

---

## #L1905: Avoiding Redundant Git Hooks [🟡 IMPORTANT]

**Symptom**: Pre-commit hook conflicts or doesn't run, manual hook installation overwrites Husky hooks  
**Root Cause**: Creating both Husky hooks (`.husky/pre-commit`) and custom hooks (`scripts/git-hooks/pre-commit`) causes conflicts. Manual installation scripts overwrite Husky-managed hooks.

**Fix**:

```bash
# ❌ WRONG: Create both Husky and custom hooks
.husky/pre-commit              # Husky-managed
scripts/git-hooks/pre-commit   # Custom hook (conflicts!)

# ❌ WRONG: Install script overwrites Husky hook
cp scripts/git-hooks/pre-commit .git/hooks/pre-commit  # Overwrites Husky!

# ✅ CORRECT: Use Husky exclusively
.husky/pre-commit              # Single source of truth

# ✅ CORRECT: Update install script to skip pre-commit
if [ -f "$SCRIPTS_DIR/pre-commit" ]; then
  echo "⚠️  Note: Pre-commit hook managed by Husky (see .husky/pre-commit)"
  echo "   Skipping installation - Husky hooks install via npm install"
fi
```

**Why**:

- ✅ Husky hooks install automatically via `npm install` (see `package.json` "prepare" script)
- ✅ Single source of truth prevents conflicts
- ✅ No manual installation needed
- ✅ Consistent behavior across team

**Apply when**:

- Setting up git hooks in project using Husky
- Creating custom hook installation scripts
- Avoiding conflicts between Husky and manual hooks

**Related**: #L1900 (Pre-commit hook token validation), #L1850 (Pre-commit hook subshell exit bug)

---

## #L1950: Creating Token Usage Report Scripts [🟡 IMPORTANT]

**Symptom**: Need automated audit of design token coverage and hardcoded value detection  
**Root Cause**: Manual token audits are time-consuming, violations slip through without automated checks  
**Fix**:

```javascript
// scripts/token-usage-report.js
import * as fs from 'fs';
import * as path from 'path';

// 1. Extract tokens from app.css @theme block
function extractTokens() {
  const content = fs.readFileSync('src/app.css', 'utf-8');
  const tokens = new Set();
  const utilities = new Set();
  
  // Extract CSS custom properties
  const themeMatch = content.match(/@theme\s*\{([^}]+)\}/s);
  if (themeMatch) {
    const tokenRegex = /--([a-z0-9-]+):/g;
    let match;
    while ((match = tokenRegex.exec(themeMatch[1])) !== null) {
      if (!match[1].includes('-legacy')) {
        tokens.add(match[1]);
      }
    }
  }
  
  // Extract utility classes from @utility blocks
  const utilityRegex = /@utility\s+([a-z0-9-]+)\s*\{/g;
  while ((match = utilityRegex.exec(content)) !== null) {
    utilities.add(match[1]);
  }
  
  return { tokens: Array.from(tokens), utilities: Array.from(utilities) };
}

// 2. Scan codebase for utility usage
function scanFile(filePath, utilities) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const usedUtilities = new Set();
  
  for (const utility of utilities) {
    const escapedUtility = utility.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const utilityRegex = new RegExp(
      `(class|className)=["'][^"']*\\b${escapedUtility}\\b[^"']*["']|\\b${escapedUtility}\\b`,
      'g'
    );
    if (utilityRegex.test(content)) {
      usedUtilities.add(utility);
    }
  }
  
  return { usedUtilities };
}

// 3. Detect hardcoded values (reuse patterns from existing audit)
const PATTERNS = {
  arbitraryValue: /class=["'][^"']*\[[#0-9]/g,
  rawColor: /\b(bg|text|border)-(blue|gray|red|green|yellow|purple|pink|indigo|orange|teal|cyan|emerald|lime|amber|violet|fuchsia|rose|sky|slate|zinc|neutral|stone)-[0-9]{2,3}\b/g,
  rawSpacing: /\b(p|m|gap|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|space-[xy])-[0-9]{1,2}\b/g,
  rawFontSize: /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/g,
  rawBorderRadius: /\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b/g,
  inlineStyle: /style=["'][^"']+["']/g
};

// 4. Calculate coverage and output report
function main() {
  const { tokens, utilities } = extractTokens();
  const files = findSourceFiles();
  const allUsedUtilities = new Set();
  const allViolations = [];
  
  for (const file of files) {
    const { usedUtilities, violations } = scanFile(file, utilities);
    usedUtilities.forEach(util => allUsedUtilities.add(util));
    allViolations.push(...violations);
  }
  
  const coveragePercent = Math.round((allUsedUtilities.size / utilities.length) * 100);
  
  console.log(`📊 Token Usage Report\n`);
  console.log(`Total Tokens: ${tokens.length}`);
  console.log(`Used Tokens: ${allUsedUtilities.size} (${coveragePercent}%)`);
  console.log(`Unused Tokens: ${utilities.length - allUsedUtilities.size}\n`);
  
  if (allViolations.length > 0) {
    console.log(`❌ Hardcoded Values Found: ${Object.keys(violationsByFile).length} files`);
    for (const [file, fileViolations] of Object.entries(violationsByFile)) {
      for (const violation of fileViolations) {
        console.log(`  - ${file}:${violation.line} (${violation.violation})`);
      }
    }
  }
  
  // CI mode: exit 1 if violations found
  if (process.argv.includes('--ci') && allViolations.length > 0) {
    process.exit(1);
  }
}
```

**Key Components**:

1. **Token Extraction**: Parse `@theme` block for CSS custom properties, `@utility` blocks for utility classes
2. **Usage Detection**: Scan codebase for utility class usage (match in `class` attributes)
3. **Violation Detection**: Reuse hardcoded value patterns from existing audit scripts
4. **Coverage Calculation**: `used / total * 100` percentage
5. **CI Integration**: `--ci` flag exits with code 1 if violations found

**NPM Script**:

```json
{
  "scripts": {
    "tokens:report": "node scripts/token-usage-report.js"
  }
}
```

**CI Integration**:

```yaml
# .github/workflows/quality-gates.yml
- name: Token Usage Report
  run: npm run tokens:report -- --ci
  continue-on-error: true # Non-blocking initially
```

**Why**:

- ✅ Automated compliance monitoring (prevents violations from entering codebase)
- ✅ Token coverage visibility (identifies unused tokens for cleanup)
- ✅ Actionable error messages (file:line format for quick fixes)
- ✅ CI integration (fails builds if violations found)
- ✅ Fast execution (<1 second for 300+ files)

**Apply when**:

- Creating design system audit scripts
- Need token coverage reporting
- Enforcing design token compliance
- Integrating audits into CI/CD pipeline

**Related**: #L10 (Incremental CI gates), #L720 (Adding design tokens), ui-patterns.md#L780 (Using design tokens)
- Shell scripts that validate code before commit

**Related**: #L110 (Local CI testing), shell scripting best practices

---

## #L2050: Validating Token→Utility Mapping [🟡 IMPORTANT]

**Symptom**: Orphaned design tokens accumulate (tokens without corresponding utility classes), design system becomes inconsistent  
**Root Cause**: No automated validation to ensure every token has a utility class, manual checks miss violations  
**Fix**:

```javascript
// scripts/validate-tokens.js
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const CSS_FILE = 'src/app.css';

// 1. Extract tokens from @theme block
function extractTokens(cssContent) {
	const tokens = new Set();
	const themeMatch = cssContent.match(/@theme\s*\{([^}]+)\}/s);
	if (!themeMatch) throw new Error('No @theme block found');
	
	const tokenPattern = /--([a-z0-9-]+):/g;
	let match;
	while ((match = tokenPattern.exec(themeMatch[1])) !== null) {
		tokens.add(match[1]);
	}
	return tokens;
}

// 2. Extract utilities and find referenced tokens
function extractUtilitiesAndTokens(cssContent) {
	const referencedTokens = new Set();
	const utilityPattern = /@utility\s+[^{]+\{([^}]+)\}/g;
	let match;
	
	while ((match = utilityPattern.exec(cssContent)) !== null) {
		const varPattern = /var\(--([a-z0-9-]+)\)/g;
		let varMatch;
		while ((varMatch = varPattern.exec(match[1])) !== null) {
			referencedTokens.add(varMatch[1]);
		}
	}
	return referencedTokens;
}

// 3. Check direct usage in CSS and components
function findDirectUsage(cssContent, tokens) {
	const referencedTokens = new Set();
	const withoutUtilities = cssContent.replace(/@utility\s+[^{]+\{[^}]+\}/g, '');
	const varPattern = /var\(--([a-z0-9-]+)\)/g;
	let match;
	
	while ((match = varPattern.exec(withoutUtilities)) !== null) {
		if (tokens.has(match[1])) {
			referencedTokens.add(match[1]);
		}
	}
	return referencedTokens;
}

// 4. Find orphaned tokens (exclude base/legacy tokens)
function validateTokens() {
	const cssContent = fs.readFileSync(CSS_FILE, 'utf-8');
	const allTokens = extractTokens(cssContent);
	const referencedByUtilities = extractUtilitiesAndTokens(cssContent);
	const directUsage = findDirectUsage(cssContent, allTokens);
	
	const orphanedTokens = [];
	for (const token of allTokens) {
		// Skip base tokens (spacing-0, spacing-1, etc.)
		if (/^spacing-[0-9]+$/.test(token)) continue;
		// Skip legacy tokens
		if (token.includes('-legacy')) continue;
		// Skip if referenced
		if (referencedByUtilities.has(token)) continue;
		if (directUsage.has(token)) continue;
		
		orphanedTokens.push(token);
	}
	
	if (orphanedTokens.length > 0) {
		console.log(`❌ Found ${orphanedTokens.length} orphaned tokens:`);
		orphanedTokens.forEach(t => console.log(`  - --${t}`));
		process.exit(1); // Block CI
	}
}
```

**Key Components**:

1. **Token Extraction**: Parse `@theme` block for CSS custom properties (`--token-name`)
2. **Utility Analysis**: Extract `@utility` blocks and find `var(--token-name)` references
3. **Direct Usage Check**: Scan CSS and components for direct `var(--token-name)` usage
4. **Orphan Detection**: Find tokens not referenced by utilities or direct usage
5. **Exclusions**: Skip base tokens (`spacing-0`, etc.) and legacy tokens (`-legacy` suffix)
6. **CI Blocking**: Exit code 1 if orphaned tokens found

**NPM Script**:

```json
{
  "scripts": {
    "tokens:validate": "node scripts/validate-tokens.js"
  }
}
```

**CI Integration**:

```yaml
# .github/workflows/quality-gates.yml
- name: Token Validation
  run: npm run tokens:validate
  # Blocks build if orphaned tokens found
```

**Why**:

- ✅ Prevents orphaned tokens (ensures every token has a utility or is intentionally unused)
- ✅ Maintains design system consistency (token→utility mapping enforced)
- ✅ Fast execution (<1 second for 241 tokens, 253 utilities)
- ✅ CI blocking (fails builds if violations found)
- ✅ Clear error messages (lists orphaned tokens for quick fixes)

**Apply when**:

- Implementing design system governance
- Need automated token→utility validation
- Preventing orphaned tokens from accumulating
- Integrating token validation into CI/CD pipeline

**Related**: #L1900 (Token usage reports), #L10 (Incremental CI gates), ui-patterns.md#L720 (Adding design tokens)

---

## #L2100: Converting Design Tokens to DTCG Format [🟢 REFERENCE]

**Symptom**: Need to convert CSS custom properties to DTCG (Design Tokens Community Group) standard format for tooling interoperability  
**Root Cause**: Design tokens in CSS format aren't compatible with design tools (Figma, Style Dictionary), need industry-standard format  
**Fix**:

```typescript
// scripts/convert-css-to-dtcg.ts
// Extract tokens from CSS and convert to DTCG format

interface Token {
	name: string;
	value: string;
	description?: string;
	category: 'spacing' | 'color' | 'typography' | 'shadow' | 'borderRadius' | 'transition' | 'zIndex' | 'size';
}

// Map CSS token names to DTCG types
function categorizeToken(name: string): { category: Token['category']; dtcgType: string } {
	if (name.startsWith('--spacing-')) return { category: 'spacing', dtcgType: 'dimension' };
	if (name.startsWith('--color-')) return { category: 'color', dtcgType: 'color' };
	if (name.startsWith('--font-size-') || name.startsWith('--text-')) return { category: 'typography', dtcgType: 'dimension' };
	if (name.startsWith('--font-weight-')) return { category: 'typography', dtcgType: 'fontWeight' };
	if (name.startsWith('--shadow-')) return { category: 'shadow', dtcgType: 'shadow' };
	if (name.startsWith('--border-radius-')) return { category: 'borderRadius', dtcgType: 'dimension' };
	// ... more mappings
}

// Convert to DTCG structure
function convertToDTCG(tokens: Token[]): DTCGStructure {
	const dtcg: DTCGStructure = {
		$schema: 'https://design-tokens.github.io/community-group/format/1.0.0/schema.json'
	};
	
	// Group tokens by category and build nested structure
	// Each group has $type at root, tokens have $value and $description
	dtcg.spacing = { $type: 'dimension', ...tokensObj };
	dtcg.color = { $type: 'color', ...tokensObj };
	// ...
	
	return dtcg;
}
```

**DTCG Format Requirements**:

- ✅ `$schema` reference (DTCG 1.0.0)
- ✅ `$type` at group level (dimension, color, fontWeight, shadow, etc.)
- ✅ `$value` for each token (required)
- ✅ `$description` for each token (optional but recommended)
- ✅ Flattened structure (no wrapper objects)

**Type Mapping**:

- `--spacing-*` → `$type: "dimension"`
- `--color-*` → `$type: "color"`
- `--font-size-*` → `$type: "dimension"`
- `--font-weight-*` → `$type: "fontWeight"`
- `--border-radius-*` → `$type: "dimension"`
- `--shadow-*` → `$type: "shadow"`

**Architecture Decision**:

- **Phase 3 (Current)**: CSS is source of truth, DTCG is export/docs
  - Style Dictionary reads CSS for validation
  - DTCG format (`design-system.json`) serves as documentation/export
  - Conversion script: `npm run tokens:convert` (CSS → DTCG)
- **Phase 4 (Future)**: DTCG becomes source of truth
  - Style Dictionary reads `design-system.json` and generates CSS
  - CSS becomes generated artifact

**Validation Script**:

```typescript
// scripts/validate-dtcg.ts
// Validates DTCG format against schema

function validateDTCG(filePath: string): ValidationResult {
	// Check $schema reference
	// Verify all groups have $type
	// Ensure all tokens have $value
	// Warn on missing $description
}
```

**NPM Scripts**:

```json
{
	"tokens:convert": "npx tsx scripts/convert-css-to-dtcg.ts",
	"tokens:validate-dtcg": "npx tsx scripts/validate-dtcg.ts"
}
```

**CI Integration**:

```yaml
# .github/workflows/quality-gates.yml
- name: DTCG Format Validation
  run: npm run tokens:validate-dtcg
  continue-on-error: true # Non-blocking initially
```

**Apply when**:

- Converting design tokens to industry-standard format
- Enabling tooling interoperability (Figma, Style Dictionary)
- Migrating from CSS-first to DTCG-first architecture
- Setting up design system governance

**Related**: #L2050 (Token→utility validation), #L1900 (Token usage reports), #L2310 (Adding token descriptions), ui-patterns.md#L720 (Adding design tokens)

---

## #L2310: Adding Descriptions to Design Tokens [🟢 REFERENCE]

**Symptom**: DTCG validation warns "Token 'X' missing $description (optional but recommended)"  
**Root Cause**: Design tokens defined in CSS without inline comments, conversion script extracts `$value` but no `$description`  
**Fix**:

```css
/* ❌ WRONG - No description */
--font-weight-h1: 700;
--transition-default: all 0.2s ease;

/* ✅ CORRECT - Inline comment provides description */
--font-weight-h1: 700; /* Bold - Heading 1 font weight */
--transition-default: all 0.2s ease; /* Standard transition for interactive elements */
```

**Workflow**:

1. **Add inline comments to CSS tokens** in source files (`src/app.css`, `src/styles/tokens/*.css`)
2. **Run conversion**: `npm run tokens:convert` (extracts comments → `$description` in DTCG)
3. **Verify validation**: `npm run tokens:validate-dtcg` (expect 0 warnings)

**Description Extraction Logic**:

```typescript
// scripts/convert-css-to-dtcg.ts
// Extracts inline comment as $description

const tokenMatch = line.match(/^\s*--([a-z0-9-]+):\s*(.+?);/);
if (tokenMatch) {
	const [, name, value] = tokenMatch;
	
	// Extract description from inline comment /* ... */
	const inlineCommentMatch = line.match(/\/\*\s*(.+?)\s*\*\//);
	const description = inlineCommentMatch ? inlineCommentMatch[1] : undefined;
	
	tokens.push({
		name: `--${name}`,
		value: value.split('/*')[0].trim(), // Strip inline comment from value
		description, // Optional, extracted from comment
		category
	});
}
```

**DTCG Output**:

```json
{
	"typography": {
		"fontWeight": {
			"$type": "fontWeight",
			"h1": {
				"$value": "700",
				"$description": "Bold - Heading 1 font weight"
			}
		}
	},
	"transition": {
		"$type": "other",
		"default": {
			"$value": "all 0.2s ease",
			"$description": "Standard transition for interactive elements"
		}
	}
}
```

**Why**:

- ✅ Self-documenting design system (descriptions visible in DTCG export)
- ✅ Better team collaboration (non-developers understand token purpose)
- ✅ Tooling interoperability (Figma, Style Dictionary read descriptions)
- ✅ Zero-cost documentation (inline comments don't affect CSS output)

**Apply when**:

- DTCG validation shows missing `$description` warnings
- Adding new design tokens (always include descriptions for clarity)
- Improving design system documentation for team
- Preparing for design tool integration (Figma, Style Dictionary)

**Best Practices**:

- **Concise**: 5-10 words max (e.g., "Bold - Heading 1 font weight")
- **Purpose-focused**: Explain what/when to use (not just value repetition)
- **Consistent format**: "[Style] - [Purpose]" or "[Purpose] for [context]"

**Related**: #L2100 (DTCG conversion), #L2050 (Token validation), ui-patterns.md#L720 (Adding design tokens)

---

## #L2400: Setting Up Style Dictionary Pipeline for DTCG → CSS Generation [🟡 IMPORTANT]

**Symptom**: Need automated CSS generation from DTCG format design tokens, manual CSS maintenance is error-prone and time-consuming  
**Root Cause**: Design tokens in DTCG format (design-system.json) need to be converted to Tailwind CSS 4 compatible CSS (`@theme` and `@utility` blocks), manual conversion is tedious and error-prone  
**Fix**:

**1. Install Style Dictionary**:

```json
// package.json
{
  "devDependencies": {
    "style-dictionary": "^5.1.1"
  }
}
```

**2. Create DTCG Parser** (`scripts/style-dictionary/parse-dtcg.js`):

```javascript
// Recursively flatten DTCG nested structure into Style Dictionary tokens
function flattenDTCG(obj, pathParts = [], type = null, tokens = []) {
	if (!obj || typeof obj !== 'object') return tokens;
	if (obj.$schema) return tokens;
	
	// Leaf node: token with $value
	if (obj.$value !== undefined) {
		tokens.push({
			name: pathParts.join('.'),
			path: pathParts,
			value: obj.$value,
			type: type || inferType(pathParts),
			description: obj.$description || '',
			original: obj
		});
		return tokens;
	}
	
	// Group node: has $type for child tokens
	if (obj.$type !== undefined) {
		type = obj.$type;
	}
	
	// Recursively process nested objects
	for (const [key, value] of Object.entries(obj)) {
		if (key.startsWith('$')) continue;
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			flattenDTCG(value, [...pathParts, key], type, tokens);
		}
	}
	
	return tokens;
}

// Parse DTCG JSON file
function parseDTCG(filePath) {
	const dtcg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	const tokens = [];
	
	// Process each category (spacing, color, typography, etc.)
	for (const [category, categoryObj] of Object.entries(dtcg)) {
		if (category === '$schema') continue;
		flattenDTCG(categoryObj, [category], null, tokens);
	}
	
	return tokens;
}
```

**3. Create Custom Transforms** (`scripts/style-dictionary/transforms.js`):

```javascript
// Transform: Output @theme { } blocks for Tailwind CSS 4
function transformTailwindTheme(token) {
	const pathParts = token.path || token.name.split('.');
	const path = pathParts.join('-');
	const name = `--${path}`;
	const value = String(token.value);
	const description = token.description || 
		(token.original && token.original.$description) || '';
	const comment = description ? ` /* ${description} */` : '';
	
	return `\t${name}: ${value};${comment}`;
}

// Transform: Output @utility { } blocks
function transformTailwindUtility(token) {
	const pathParts = token.path || token.name.split('.');
	const path = pathParts.join('-');
	const cssValue = `var(--${path})`;
	
	// Determine utility name and CSS property based on path patterns
	let utilityName = '';
	let cssProperty = '';
	
	if (path.startsWith('spacing-')) {
		const spacingName = path.replace('spacing-', '');
		if (spacingName.includes('-x')) {
			utilityName = `px-${spacingName.replace('-x', '')}`;
			cssProperty = 'padding-inline';
		} else if (spacingName.includes('-y')) {
			utilityName = `py-${spacingName.replace('-y', '')}`;
			cssProperty = 'padding-block';
		} else if (spacingName.includes('gap')) {
			utilityName = `gap-${spacingName.replace('-gap', '')}`;
			cssProperty = 'gap';
		}
		// ... more patterns
	}
	
	if (!utilityName || !cssProperty) return null;
	
	return `@utility ${utilityName} {\n\t${cssProperty}: ${cssValue};\n}`;
}
```

**4. Configure Style Dictionary** (`style-dictionary.config.js`):

```javascript
import StyleDictionary from 'style-dictionary';
import { convertDTCGToSD } from './scripts/style-dictionary/prepare-tokens.js';

// Pre-process DTCG to Style Dictionary format
convertDTCGToSD('design-system.json', 'tokens.json');

// Register custom transforms
StyleDictionary.registerTransform({
	name: 'tailwind/theme',
	type: 'value',
	transform: transformTailwindTheme
});

StyleDictionary.registerTransform({
	name: 'tailwind/utility',
	type: 'value',
	transform: transformTailwindUtility
});

// Register custom formats
StyleDictionary.registerFormat({
	name: 'tailwind/theme',
	format: ({ dictionary }) => {
		const tokens = dictionary.allTokens
			.map(token => transformTailwindTheme(token))
			.filter(Boolean)
			.join('\n');
		return `@theme {\n${tokens}\n}`;
	}
});

export default {
	source: ['tokens.json'], // Pre-processed from DTCG
	platforms: {
		css: {
			buildPath: 'src/styles/tokens/',
			files: [
				{
					destination: 'spacing.css',
					format: 'tailwind/theme',
					filter: (token) => token.path[0] === 'spacing'
				},
				{
					destination: 'colors.css',
					format: 'tailwind/theme',
					filter: (token) => token.path[0] === 'color'
				}
				// ... more token categories
			]
		},
		utilities: {
			buildPath: 'src/styles/utilities/',
			files: [
				{
					destination: 'spacing-utils.css',
					format: 'tailwind/utility',
					filter: (token) => token.path[0] === 'spacing'
				}
				// ... more utility files
			]
		}
	}
};
```

**5. Add Build Script** (`package.json`):

```json
{
  "scripts": {
    "tokens:build": "node scripts/build-tokens.js"
  }
}
```

**Build Script** (`scripts/build-tokens.js`):

```javascript
import StyleDictionary from 'style-dictionary';
import config from '../style-dictionary.config.js';

const sd = new StyleDictionary(config);
sd.buildAllPlatforms();
```

**Gotchas & Edge Cases**:

1. **tokens.json is intermediate file**: `tokens.json` is generated from `design-system.json` (DTCG) before Style Dictionary runs. It's committed to git because Style Dictionary needs it as source. Don't edit manually - edit `design-system.json` instead.

2. **Pre-processing step required**: Style Dictionary doesn't natively support DTCG format, so we convert DTCG → Style Dictionary format (`tokens.json`) before running Style Dictionary. This happens automatically in `style-dictionary.config.js`.

3. **Generated CSS files must not be edited**: CI checks for manual edits to generated CSS files (`src/styles/tokens/*.css`, `src/styles/utilities/*.css`). Always edit `design-system.json` and run `npm run tokens:build`.

4. **Semantic token validation is blocking**: Semantic tokens must reference base tokens using DTCG reference syntax (`{spacing.2}`) not hardcoded values (`0.5rem`). CI blocks merges if violations found.

5. **Transform order matters**: Custom transforms (`tailwind/theme`, `tailwind/utility`) must be registered before Style Dictionary processes tokens. Order: register transforms → register formats → build platforms.

6. **Filter functions use path array**: Style Dictionary filters use `token.path[0]` to match categories (e.g., `token.path[0] === 'spacing'`). Path is array from DTCG structure, not dot-notation string.

**Apply when**: Setting up Style Dictionary pipeline for DTCG → CSS generation, troubleshooting build failures, understanding token generation workflow

**Related**: #L2100 (DTCG conversion), #L2310 (DTCG validation), #L2550 (Semantic token validation)
```

**Why**:

- ✅ **Automated CSS generation**: DTCG tokens → CSS automatically, no manual conversion
- ✅ **Single source of truth**: Update `design-system.json`, CSS regenerates automatically
- ✅ **Modular output**: Separate files per token category (spacing.css, colors.css, etc.)
- ✅ **Tailwind CSS 4 compatible**: Generates `@theme` and `@utility` blocks correctly
- ✅ **Error reduction**: Eliminates manual CSS editing mistakes
- ✅ **Scalable**: Handles 200+ tokens automatically

**Apply when**:

- Migrating from CSS-first to DTCG-first design token architecture
- Need automated CSS generation from DTCG format
- Want to eliminate manual CSS maintenance for design tokens
- Setting up design system build pipeline

**Architecture Decision**:

- **Phase 3 (Previous)**: CSS is source of truth, DTCG is export/docs
- **Phase 4 (Current)**: DTCG is source of truth, CSS is generated artifact

**Related**: #L2100 (Converting to DTCG), #L2310 (Adding token descriptions), #L2050 (Token validation), ui-patterns.md#L720 (Adding design tokens)

---

## #L2350: Configuring MCP Servers in Cursor [🟢 REFERENCE]

**Symptom**: Need to add MCP (Model Context Protocol) server to Cursor for enhanced AI tooling (e.g., Svelte MCP for code validation)  
**Root Cause**: MCP servers must be configured in Cursor's configuration file to enable tools in chat  
**Fix**:

**Configuration File Location**:
- **macOS**: `~/.cursor/mcp.json` (home directory, NOT `~/Library/Application Support/Cursor/User/`)
- **Format**: JSON with `mcpServers` object

**Local Setup** (recommended for performance/offline):

```json
{
  "mcpServers": {
    "svelte": {
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    }
  }
}
```

**Remote Setup** (alternative):

```json
{
  "mcpServers": {
    "svelte": {
      "url": "https://mcp.svelte.dev/mcp"
    }
  }
}
```

**Adding to Existing Config**:

```json
{
  "mcpServers": {
    "context7": { /* existing */ },
    "convex": { /* existing */ },
    "svelte": {
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    }
  }
}
```

**Verification**:

1. **Restart Cursor** (MCP servers load on startup)
2. **Test tools** in Cursor chat:
   - `svelte-autofixer` - Analyzes Svelte code
   - `get-documentation` - Retrieves Svelte docs
   - `list-sections` - Lists available documentation

**Why**:

- ✅ **Local setup**: Better performance (no network latency), works offline, no external dependency
- ✅ **Remote setup**: No local installation, always up-to-date, managed by service provider
- ✅ **Configuration pattern**: Matches existing MCP servers (Convex, Linear, Context7, etc.)

**Tradeoffs**:

**Local Setup**:
- ✅ No internet dependency, lower latency, works offline, customizable
- ❌ Requires Node.js/npm, uses local resources, manual updates

**Remote Setup**:
- ✅ No local installation, always up-to-date, no local resources
- ❌ Requires internet, network latency, external dependency

**Apply when**:

- Adding new MCP server to Cursor (Svelte, Context7, Convex, Linear, etc.)
- Setting up dev tooling for AI-assisted development
- Configuring code quality validation tools

**Common Mistakes**:

- ❌ **Wrong file location**: Using `~/Library/Application Support/Cursor/User/mcp.json` instead of `~/.cursor/mcp.json`
- ❌ **Missing restart**: MCP servers only load on Cursor startup
- ❌ **Wrong format**: Using `mcpServers` array instead of object

**Related**: #L10 (CI gate enablement), #L110 (Local CI testing)

---

## #L2550: Validating Semantic Token References in DTCG Format [🟡 IMPORTANT]

**Symptom**: Semantic tokens in `design-system.json` have hardcoded values (e.g., `0.5rem`) instead of referencing base tokens (e.g., `{spacing.2}`), causing design system inconsistency  
**Root Cause**: No automated validation to ensure semantic tokens reference base tokens using DTCG reference syntax (`{category.token}`), manual checks miss violations  
**Fix**:

```javascript
// scripts/validate-semantic-references.js
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const DESIGN_SYSTEM_JSON = 'design-system.json';

/**
 * Check if token path represents a base token
 * Base tokens: spacing.0, spacing.2, color.primary (exactly 2 parts)
 */
function isBaseToken(pathParts) {
	return pathParts.length === 2;
}

/**
 * Check if token path represents a semantic token
 * Semantic tokens: spacing.chart.container, spacing.error.page.y (more than 2 parts)
 */
function isSemanticToken(pathParts) {
	return pathParts.length > 2;
}

/**
 * Check if value is DTCG reference format: {spacing.2}
 */
function isDTCGReference(value) {
	if (typeof value !== 'string') return false;
	return /^\{[a-z0-9]+\.[a-z0-9]+(?:\.[a-z0-9]+)*\}$/.test(value.trim());
}

/**
 * Check if value is hardcoded dimension: 0.5rem, 1px, etc.
 */
function isHardcodedDimension(value) {
	if (typeof value !== 'string') return false;
	return /^\d+(\.\d+)?(rem|px|em|%|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax)$/.test(value.trim());
}

/**
 * Check if token has documented exception
 */
function hasDocumentedException(token) {
	const description = token.$description || '';
	const upper = description.toUpperCase();
	return upper.includes('INTENTIONAL EXCEPTION') || 
	       upper.includes('EXCEPTION') || 
	       upper.includes('RATIONALE');
}

/**
 * Recursively extract all tokens from DTCG structure
 */
function extractTokens(obj, pathParts = [], category = null, tokens = []) {
	if (!obj || typeof obj !== 'object') return tokens;
	
	// Leaf node: token with $value
	if (obj.$value !== undefined) {
		tokens.push({
			path: pathParts,
			pathString: pathParts.join('.'),
			value: obj.$value,
			$description: obj.$description || '',
			category: category || pathParts[0]
		});
		return tokens;
	}
	
	// Set category from $type at category level
	if (obj.$type !== undefined && pathParts.length === 1) {
		category = pathParts[0];
	}
	
	// Recursively process nested objects
	for (const [key, value] of Object.entries(obj)) {
		if (key === '$schema') continue;
		if (key === '$type' && pathParts.length === 1) continue;
		
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			const newCategory = category || (pathParts.length === 0 ? key : pathParts[0]);
			extractTokens(value, [...pathParts, key], newCategory, tokens);
		}
	}
	
	return tokens;
}

/**
 * Main validation
 */
function validateSemanticReferences() {
	const designSystem = JSON.parse(fs.readFileSync(DESIGN_SYSTEM_JSON, 'utf-8'));
	const allTokens = extractTokens(designSystem);
	
	const baseTokens = allTokens.filter(t => isBaseToken(t.path));
	const semanticTokens = allTokens.filter(t => isSemanticToken(t.path));
	
	const violations = [];
	const exceptions = [];
	
	for (const token of semanticTokens) {
		// Skip documented exceptions
		if (hasDocumentedException(token)) {
			exceptions.push(token);
			continue;
		}
		
		// ✅ Valid: References base token
		if (isDTCGReference(token.value)) {
			continue;
		}
		
		// ❌ Violation: Hardcoded dimension
		if (isHardcodedDimension(token.value)) {
			violations.push({
				token,
				reason: `Semantic token "${token.pathString}" has hardcoded dimension "${token.value}" but should reference base token using {category.token} format (e.g., {spacing.2})`
			});
		}
	}
	
	if (violations.length > 0) {
		console.log(`❌ Found ${violations.length} violations:`);
		violations.forEach(v => {
			console.log(`   ${v.reason}`);
			console.log(`   Path: ${v.token.pathString}`);
			console.log(`   Value: ${v.token.value}\n`);
		});
		process.exit(1); // Block CI
	}
	
	console.log('✅ All semantic tokens reference base tokens correctly!');
}
```

**Key Components**:

1. **Token Extraction**: Recursively parse DTCG JSON structure, extract tokens with `$value` property
2. **Base vs Semantic**: Identify base tokens (2-part path) vs semantic tokens (3+ part path)
3. **DTCG Reference Validation**: Check if semantic token value uses `{spacing.2}` format
4. **Hardcoded Detection**: Flag semantic tokens with hardcoded dimensions (`0.5rem`, `1px`, etc.)
5. **Exception Handling**: Allow documented exceptions with "INTENTIONAL EXCEPTION" in `$description`

**Rules**:

- ✅ **Base tokens** (`spacing.0`, `spacing.2`) can have hardcoded values (they're the source)
- ✅ **Semantic tokens** (`spacing.chart.container`) must reference base tokens using `{spacing.X}` format
- ✅ **Exceptions** allowed if documented with "INTENTIONAL EXCEPTION: [rationale]" in `$description`
- ❌ **Block CI** if violations found (exit code 1)

**Apply when**:

- Creating validation scripts for DTCG format design tokens
- Ensuring semantic tokens reference base tokens (not hardcoded values)
- Enforcing design system consistency in token definitions
- Preparing for CI integration (Phase 3 of design token automation)

**Common Mistakes**:

- ❌ **Wrong format**: Checking for `var(--spacing-2)` instead of `{spacing.2}` (DTCG uses `{}` syntax, not CSS `var()`)
- ❌ **Base token validation**: Validating base tokens (they're allowed to have hardcoded values)
- ❌ **Missing exceptions**: Not checking for documented exceptions before flagging violations

**Related**: #L2050 (Token→utility mapping), #L2100 (DTCG format conversion), #L2400 (Style Dictionary pipeline), #L2600 (Fixing semantic token violations)

---

## #L2600: Fixing Semantic Token Violations - Converting Hardcoded Values to DTCG References [🟡 IMPORTANT]

**Symptom**: `npm run tokens:validate-semantic` reports violations - semantic tokens have hardcoded values (e.g., `"0.5rem"`) instead of DTCG references (e.g., `"{spacing.2}"`)  
**Root Cause**: Semantic tokens were created with hardcoded values before validation was enforced, or values don't have exact base token matches  
**Fix**:

**Step 1: Map Hardcoded Values to Base Tokens**

Create a mapping of common `rem` values to base spacing tokens:

```javascript
// Common mappings (from base tokens in design-system.json)
const spacingMap = {
	'0': '0',
	'0.25rem': '{spacing.1}',    // 4px
	'0.5rem': '{spacing.2}',     // 8px
	'0.75rem': '{spacing.3}',    // 12px
	'1rem': '{spacing.4}',       // 16px
	'1.25rem': '{spacing.5}',    // 20px
	'1.5rem': '{spacing.6}',     // 24px
	'2rem': '{spacing.8}',       // 32px
	'2.5rem': '{spacing.10}',    // 40px
	'3rem': '{spacing.12}',      // 48px
	'4rem': '{spacing.16}',      // 64px
	'5rem': '{spacing.20}',      // 80px
	'7rem': '{spacing.28}',      // 112px
	'8rem': '{spacing.32}'       // 128px
};
```

**Step 2: Convert Exact Matches**

For values that match base tokens exactly, replace hardcoded value with DTCG reference:

```json
// ❌ WRONG: Hardcoded value
{
	"spacing": {
		"chart": {
			"container": {
				"$value": "1.5rem",
				"$description": "24px - margin-top for chart containers"
			}
		}
	}
}

// ✅ CORRECT: DTCG reference
{
	"spacing": {
		"chart": {
			"container": {
				"$value": "{spacing.6}",
				"$description": "24px - margin-top for chart containers"
			}
		}
	}
}
```

**Step 3: Document Exceptions for Non-Matching Values**

For values without exact base token matches (e.g., `0.375rem`, `0.625rem`, `0.875rem`), add documented exception:

```json
// ✅ CORRECT: Documented exception
{
	"spacing": {
		"chip": {
			"y": {
				"$value": "0.125rem",
				"$description": "2px - INTENTIONAL EXCEPTION: Not multiple of 4px, optimal for chip padding"
			}
		},
		"menu": {
			"item": {
				"x": {
					"$value": "0.625rem",
					"$description": "10px - INTENTIONAL EXCEPTION: No exact base token match (closest: spacing.1=4px, spacing.2=8px)"
				}
			}
		}
	}
}
```

**Step 4: Typography Tokens - Use Exceptions**

Typography font sizes typically don't map to spacing tokens (they have their own scale):

```json
// ✅ CORRECT: Typography exceptions
{
	"typography": {
		"fontSize": {
			"label": {
				"$value": "0.625rem",
				"$description": "10px - INTENTIONAL EXCEPTION: Typography scale independent from spacing scale"
			},
			"button": {
				"$value": "0.875rem",
				"$description": "14px - INTENTIONAL EXCEPTION: Typography scale independent from spacing scale"
			}
		}
	}
}
```

**Exception Format Requirements**:

- Must include `"INTENTIONAL EXCEPTION"` in `$description` (case-insensitive)
- Should explain why exception is needed (e.g., "No exact base token match", "Typography scale independent")
- Validation script checks for this keyword before flagging violations

**Systematic Fix Process**:

1. **Run validation**: `npm run tokens:validate-semantic` to get list of violations
2. **Group by value**: Group violations by hardcoded value (e.g., all `"1.5rem"` tokens)
3. **Check base tokens**: Verify if value matches a base token exactly
4. **Convert or document**: 
   - If exact match → Convert to `{spacing.X}` reference
   - If no match → Add exception with rationale
5. **Rebuild and revalidate**: `npm run tokens:build && npm run tokens:validate-semantic`

**Common Exception Scenarios**:

- **Typography**: Font sizes have their own scale (10px, 14px, 30px, 36px, 120px)
- **Border radius**: Some values don't match spacing (2px, 14px)
- **Special values**: Non-standard dimensions (0.125rem, 0.375rem, 0.625rem, 0.875rem)
- **Large display sizes**: Error status codes, hero text (120px, etc.)

**Why This Matters**:

- ✅ **Design system consistency**: Semantic tokens reference base tokens, creating single source of truth
- ✅ **Easier maintenance**: Change base token once, all semantic tokens update automatically
- ✅ **CI enforcement**: Validation blocks merges until violations are fixed
- ✅ **Documented exceptions**: Clear rationale for values that don't fit standard scale

**Apply when**:

- Fixing semantic token validation violations
- Converting hardcoded values to DTCG references
- Adding new semantic tokens that need base token references
- Handling values without exact base token matches

**Related**: #L2550 (Semantic token validation), #L2100 (DTCG format conversion), #L2400 (Style Dictionary pipeline)

---

## #L2500: Svelte MCP CI/CD Integration [🟡 IMPORTANT]

**Symptom**: Need to integrate Svelte MCP validation into CI/CD pipeline, but MCP tools require MCP client (not available in CI)  
**Root Cause**: Svelte MCP autofixer is an MCP tool that requires MCP client/server communication (stdio transport), which isn't available in CI environments  
**Fix**:

**Current Approach** (Phase 7 - Optional, Non-Blocking):

```json
// package.json
{
  "scripts": {
    "validate:svelte": "npm run check && npm run lint"
  }
}
```

```yaml
# .github/workflows/quality-gates.yml
- name: Svelte Validation
  run: npm run validate:svelte
  continue-on-error: true # Non-blocking initially (SYOS-445)
```

**What it does**:
- ✅ Runs `svelte-check` (type checking)
- ✅ Runs `ESLint` (syntax rules)
- ❌ **Does NOT run MCP autofixer** (requires MCP client - future enhancement)

**Why MCP autofixer isn't included**:
- MCP tools require MCP client/server communication (stdio transport)
- CI environments don't have Cursor/MCP infrastructure
- Would require custom Node.js script using `@modelcontextprotocol/sdk` client

**Future Enhancement** (MCP autofixer in CI):

To add MCP autofixer to CI, create a Node.js script that:
1. Uses `@modelcontextprotocol/sdk` client library
2. Connects to Svelte MCP server via `StdioClientTransport`
3. Calls `svelte-autofixer` tool for each `.svelte` file
4. Reports issues/suggestions

**Example Future Script** (not implemented yet):

```typescript
// scripts/validate-svelte-mcp.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({ name: 'ci-client', version: '1.0.0' });
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@sveltejs/mcp']
});

await client.connect(transport);
// Call svelte-autofixer tool...
```

**Current Status**:
- ✅ `validate:svelte` script added (svelte-check + ESLint)
- ✅ CI step added (optional, non-blocking)
- ⏳ MCP autofixer integration deferred (requires MCP client script)

**Apply when**:
- Adding Svelte validation to CI/CD pipeline
- Integrating code quality checks
- Setting up automated validation workflows

**Related**: #L100 (Svelte Validation Workflow), #L2399 (MCP Setup), ai-development.md#L100 (Svelte MCP validation)

---

## Format Version: 1.0

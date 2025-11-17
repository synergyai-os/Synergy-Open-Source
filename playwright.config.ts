import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for E2E Tests
 *
 * Environment variables (like E2E_TEST_MODE) are set via npm scripts.
 * Test credentials are loaded from .env.test via Playwright's webServer env.
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './e2e',

	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only
	retries: process.env.CI ? 2 : 0,

	// Enable parallel execution with 5 workers (one per worker user)
	workers: 5,

	// Reporter to use
	reporter: 'html',

	// Shared settings for all projects
	use: {
		// Base URL to use in actions like `await page.goto('/')`
		baseURL: process.env.BASE_URL || 'http://localhost:5173',

		// Collect trace when retrying the failed test
		trace: 'on-first-retry',

		// Screenshot on failure
		screenshot: 'only-on-failure'
	},

	// Configure projects for major browsers
	projects: [
		// Authenticated tests - worker-scoped authentication via fixtures
		// NOTE: Only core auth and security tests (SYOS-198)
		// Excludes: API key management, incomplete features
		{
			name: 'authenticated',
			testMatch: /.*\/(multi-tab|auth-security|member-invite).*\.(test|spec)\.ts$/,
			use: {
				...devices['Desktop Chrome']
				// Storage state provided by custom fixture (e2e/fixtures.ts)
				// Each worker (0-4) authenticates if auth file missing, then uses cached state
				// Authentication happens in fixture before tests run (worker-scoped)
			}
			// No dependencies - authentication handled by fixtures.ts
			// Workers use global config (5 workers) for parallel execution
		},

		// Unauthenticated tests - run with clean storage state
		{
			name: 'unauthenticated',
			testMatch: /.*\/(auth-registration|rate-limiting|demo).*\.(test|spec)\.ts$/,
			use: {
				...devices['Desktop Chrome'],
				// Empty storage state - no cookies or authentication
				storageState: { cookies: [], origins: [] }
			}
			// No dependencies on setup - can run independently
		}

		// Uncomment to test on other browsers
		// {
		// 	name: 'firefox-authenticated',
		// 	testMatch: /.*\/(inbox|settings|multi-tab|flashcard|quick-create|auth-security).*\.(test|spec)\.ts$/,
		// 	use: {
		// 		...devices['Desktop Firefox'],
		// 		storageState: 'e2e/.auth/user.json',
		// 	},
		// 	dependencies: ['setup'],
		// },
	],

	// Run your local dev server before starting the tests
	// Note: Test scripts automatically stop dev server before starting test server
	// This prevents port conflicts (strictPort: true) and ensures E2E_TEST_MODE is loaded
	webServer: {
		command: 'npm run dev:test',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI, // CI always starts fresh, local may reuse
		timeout: 120000,
		env: {
			// Pass E2E_TEST_MODE from npm script as fallback
			// The dev:test script runs 'vite dev --mode test' which loads .env.test
			E2E_TEST_MODE: process.env.E2E_TEST_MODE || 'true'
		}
	}
});

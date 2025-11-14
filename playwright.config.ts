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

	// Opt out of parallel tests on CI
	workers: process.env.CI ? 1 : undefined,

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
		// Setup project - runs authentication before other tests
		{
			name: 'setup',
			testMatch: /.*\.setup\.ts/
		},

		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				// Use authenticated state from setup
				storageState: 'e2e/.auth/user.json'
			},
			dependencies: ['setup']
		}

		// Uncomment to test on other browsers
		// {
		// 	name: 'firefox',
		// 	use: {
		// 		...devices['Desktop Firefox'],
		// 		storageState: 'e2e/.auth/user.json',
		// 	},
		// 	dependencies: ['setup'],
		// },
		//
		// {
		// 	name: 'webkit',
		// 	use: {
		// 		...devices['Desktop Safari'],
		// 		storageState: 'e2e/.auth/user.json',
		// 	},
		// 	dependencies: ['setup'],
		// },
	],

	// Run your local dev server before starting the tests
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		env: {
			// Pass E2E_TEST_MODE to the dev server
			E2E_TEST_MODE: process.env.E2E_TEST_MODE || 'true'
		}
	}
});

import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		// Use dev server for E2E tests (faster, no build needed)
		// Change to 'npm run build && npm run preview' if you want to test production builds
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI // Reuse if already running (not in CI)
	},
	testDir: 'e2e',
	projects: [
		// Setup project (runs first, authenticates and saves auth state)
		{
			name: 'setup',
			testMatch: /.*\.setup\.ts/
		},
		// All other tests (use saved auth state)
		{
			name: 'chromium',
			use: {
				storageState: 'playwright/.auth/user.json'
			},
			dependencies: ['setup']
		}
	]
});

/**
 * Custom Playwright Fixtures for Worker-Based Authentication
 *
 * This file extends Playwright's base test to provide worker-specific authentication.
 * Each parallel worker uses a unique user account to prevent session conflicts.
 *
 * Pattern from: https://playwright.dev/docs/auth#authenticate-once-per-worker
 */

import { test as baseTest } from '@playwright/test';
import path from 'path';

// Export everything from @playwright/test so tests can import from this file
export * from '@playwright/test';

/**
 * Custom test fixture that provides worker-specific storage state
 *
 * Each worker (0-4) gets its own authenticated session:
 * - Worker 0 → user-worker-0.json → randy+worker-0@synergyai.nl
 * - Worker 1 → user-worker-1.json → randy+worker-1@synergyai.nl
 * - etc.
 */
export const test = baseTest.extend<{}, { workerStorageState: string }>({
	// Use the worker-specific storage state for all tests
	storageState: ({ workerStorageState }, use) => use(workerStorageState),

	// Provide worker-specific storage state file path
	workerStorageState: [
		async ({}, use, testInfo) => {
			// Get worker index (0-4 for 5 parallel workers)
			const workerIndex = testInfo.parallelIndex;

			// Path to worker-specific auth file (created by auth.setup.ts)
			const fileName = path.resolve(__dirname, `.auth/user-worker-${workerIndex}.json`);

			// Provide this storage state to all tests in this worker
			await use(fileName);
		},
		{ scope: 'worker' }
	]
});

/**
 * Custom Playwright Fixtures for Worker-Based Authentication
 *
 * This file extends Playwright's base test to provide worker-specific authentication.
 * Each parallel worker uses a unique user account to prevent session conflicts.
 *
 * Pattern from: https://playwright.dev/docs/auth#authenticate-once-per-worker
 */

import { test as baseTest, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { access } from 'fs/promises';
import { resolve } from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables from .env.test
const envPath = resolve(__dirname, '../.env.test');
try {
	const envContent = readFileSync(envPath, 'utf-8');
	envContent.split('\n').forEach((line) => {
		const match = line.match(/^([^#=]+)=(.*)$/);
		if (match) {
			const [, key, value] = match;
			process.env[key.trim()] = value.trim();
		}
	});
} catch (_error) {
	console.warn('Warning: Could not load .env.test file');
}

// Export everything from @playwright/test so tests can import from this file
export * from '@playwright/test';

/**
 * Custom test fixture that provides worker-specific storage state
 *
 * Each worker (0-4) gets its own authenticated session:
 * - Worker 0 → user-worker-0.json → randy+worker-0@synergyai.nl
 * - Worker 1 → user-worker-1.json → randy+worker-1@synergyai.nl
 * - etc.
 *
 * This fixture automatically performs login if auth file doesn't exist.
 */
export const test = baseTest.extend<object, { workerStorageState: string }>({
	// Use the worker-specific storage state for all tests
	storageState: ({ workerStorageState }, use) => use(workerStorageState),

	// Provide worker-specific storage state file path
	workerStorageState: [
		async ({ browser }, use, testInfo) => {
			// Get worker index (0-4 for 5 parallel workers)
			const workerIndex = testInfo.parallelIndex;

			// Path to worker-specific auth file
			const fileName = path.resolve(__dirname, `.auth/user-worker-${workerIndex}.json`);

			// Check if auth file exists
			let authFileExists = false;
			try {
				await access(fileName);
				authFileExists = true;
			} catch {
				authFileExists = false;
			}

			if (!authFileExists) {
				// Perform login - auth file doesn't exist yet
				console.log(`🔐 [Worker ${workerIndex}] Auth file not found, performing login...`);

				// Get worker-specific credentials
				const email = process.env[`WORKER_${workerIndex}_EMAIL`] || process.env.TEST_USER_EMAIL;
				const password =
					process.env[`WORKER_${workerIndex}_PASSWORD`] || process.env.TEST_USER_PASSWORD;

				if (!email || !password) {
					throw new Error(
						`Worker ${workerIndex} credentials not found. ` +
							`Set WORKER_${workerIndex}_EMAIL and WORKER_${workerIndex}_PASSWORD in .env.test`
					);
				}

				console.log(`🔐 [Worker ${workerIndex}] Authenticating:`, email);

				// Create a new page for login
				const page = await browser.newPage();

				try {
					// Navigate to login page
					await page.goto('http://localhost:5173/login');
					await page.waitForLoadState('networkidle');

					// Fill in login form
					const emailInput = page.locator('input[type="email"], input[name="email"]').first();
					await emailInput.waitFor({ timeout: 10000 });
					await emailInput.fill(email);

					const passwordInput = page
						.locator('input[type="password"], input[name="password"]')
						.first();
					await passwordInput.fill(password);

					// Submit login form
					const submitButton = page.locator('button[type="submit"]').first();
					await submitButton.click();

					// Wait for redirect to authenticated page (may be onboarding for new users)
					await page.waitForURL(/\/(inbox|dashboard|onboarding)/, { timeout: 15000 });
					await page.waitForLoadState('networkidle');

					// Handle onboarding flow if user has no workspaces
					const currentUrl = page.url();
					if (currentUrl.includes('/onboarding')) {
						console.log(
							`📝 [Worker ${workerIndex}] User redirected to onboarding - creating workspace...`
						);

						// Fill workspace name input
						const orgNameInput = page
							.locator('input[placeholder*="e.g."], input[type="text"]')
							.first();
						await expect(orgNameInput).toBeVisible({ timeout: 5000 });
						const orgName = `Test Org ${workerIndex} ${Date.now()}`;
						await orgNameInput.fill(orgName);

						// Submit form
						const createButton = page
							.locator('button[type="submit"]')
							.filter({ hasText: /Create/i });
						await expect(createButton).toBeVisible();
						await createButton.click();

						// Wait for redirect away from onboarding (to /org/circles or /inbox)
						await page.waitForURL(/\/(inbox|dashboard|org\/circles)/, { timeout: 10000 });
						await page.waitForLoadState('networkidle');
						console.log(
							`✅ [Worker ${workerIndex}] Organization created, redirected to:`,
							page.url()
						);
					}

					// Verify authentication (check for authenticated page elements)
					// For inbox: look for inbox header
					// For other pages: just verify we're not on login/onboarding
					const isOnboarding = page.url().includes('/onboarding');
					const isLogin = page.url().includes('/login');
					if (!isOnboarding && !isLogin) {
						// Try to find inbox header (if on inbox page)
						const inboxHeader = page.locator('h2:has-text("Inbox"), h1:has-text("Inbox")').first();
						const headerVisible = await inboxHeader.isVisible({ timeout: 2000 }).catch(() => false);
						if (!headerVisible) {
							// Not on inbox - verify we're on an authenticated page (has sidebar or topbar)
							const authenticatedIndicator = page
								.locator('button')
								.filter({ hasText: /Select workspace|Owner|Admin|Member/i })
								.first();
							await expect(authenticatedIndicator).toBeVisible({ timeout: 10000 });
						}
					}

					console.log(
						`✅ [Worker ${workerIndex}] Authentication successful - authenticated elements visible`
					);

					// CRITICAL: Verify session exists in Convex BEFORE saving storageState
					// (Don't navigate to /settings yet - race condition with async session write)
					console.log(`🔍 [Worker ${workerIndex}] Verifying session exists in Convex database...`);

					const cookies = await page.context().cookies();
					const sessionCookie = cookies.find((c) => c.name === 'syos_session');

					if (!sessionCookie) {
						throw new Error(
							`[Worker ${workerIndex}] Session cookie not found after authentication`
						);
					}

					// Decode signed session cookie
					const separator = sessionCookie.value.lastIndexOf('.');
					if (separator === -1) {
						throw new Error(
							`[Worker ${workerIndex}] Invalid session cookie format (expected sessionId.signature)`
						);
					}
					const sessionId = sessionCookie.value.slice(0, separator);
					console.log(`📋 [Worker ${workerIndex}] Session ID (decoded):`, sessionId);

					// Query Convex to verify session exists (with retry)
					const convexUrl = process.env.PUBLIC_CONVEX_URL;
					if (!convexUrl) {
						throw new Error('PUBLIC_CONVEX_URL not set in environment');
					}

					const convex = new ConvexHttpClient(convexUrl);
					let session = null;
					let attempts = 0;
					const maxAttempts = 10;
					const retryDelayMs = 200;

					while (!session && attempts < maxAttempts) {
						attempts++;
						try {
							session = await convex.query(api.infrastructure.authSessions.getSessionById, {
								sessionId
							});

							if (session) {
								console.log(
									`✅ [Worker ${workerIndex}] Session verified in Convex (attempt ${attempts}/${maxAttempts})`
								);
								break;
							} else {
								console.log(
									`⏳ [Worker ${workerIndex}] Session not yet in Convex, retrying... (attempt ${attempts}/${maxAttempts})`
								);
								await page.waitForTimeout(retryDelayMs);
							}
						} catch (error) {
							console.error(
								`❌ [Worker ${workerIndex}] Error querying Convex (attempt ${attempts}/${maxAttempts}):`,
								error
							);
							if (attempts === maxAttempts) {
								throw new Error(
									`[Worker ${workerIndex}] Failed to verify session in Convex after ${maxAttempts} attempts`
								);
							}
							await page.waitForTimeout(retryDelayMs);
						}
					}

					if (!session) {
						throw new Error(
							`[Worker ${workerIndex}] Session ${sessionId} not found in Convex after ${maxAttempts} attempts`
						);
					}

					// Save storage state
					await page.context().storageState({ path: fileName });
					console.log(`💾 [Worker ${workerIndex}] Saved auth state to`, fileName);
					console.log(
						`🎉 [Worker ${workerIndex}] Authentication setup complete - session persistent in Convex`
					);
				} finally {
					await page.close();
				}
			} else {
				console.log(`✅ [Worker ${workerIndex}] Using existing auth state:`, fileName);
			}

			// Provide storage state to all tests in this worker
			await use(fileName);
		},
		{ scope: 'worker' }
	]
});

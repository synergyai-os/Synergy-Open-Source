/**
 * Playwright Authentication Setup
 *
 * This script logs in once before all tests and saves the authenticated state.
 * All tests can then reuse this state without re-authenticating.
 *
 * See: https://playwright.dev/docs/auth
 */

import { test as setup, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

setup('authenticate', async ({ page }, testInfo) => {
	// Get worker index (0-4 for 5 parallel workers)
	const workerIndex = testInfo.parallelIndex;

	// Select worker-specific credentials from environment
	// Falls back to shared TEST_USER for single-worker scenarios
	const email = process.env[`WORKER_${workerIndex}_EMAIL`] || process.env.TEST_USER_EMAIL;
	const password = process.env[`WORKER_${workerIndex}_PASSWORD`] || process.env.TEST_USER_PASSWORD;

	if (!email || !password) {
		throw new Error(
			`Worker ${workerIndex} credentials not found. ` +
				`Set WORKER_${workerIndex}_EMAIL and WORKER_${workerIndex}_PASSWORD in .env.test`
		);
	}

	console.log(`🔐 [Worker ${workerIndex}] Authenticating:`, email);

	// Navigate to login page
	await page.goto('/login');

	// Wait for login form to be visible
	await page.waitForLoadState('networkidle');

	// Fill in WorkOS login form
	// Note: Adjust selectors based on your actual WorkOS login page
	const emailInput = page.locator('input[type="email"], input[name="email"]').first();
	await emailInput.waitFor({ timeout: 10000 });
	await emailInput.fill(email);

	const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
	await passwordInput.fill(password);

	// Submit login form
	const submitButton = page.locator('button[type="submit"]').first();
	await submitButton.click();

	// Wait for redirect to authenticated page (inbox or dashboard)
	await page.waitForURL(/\/(inbox|dashboard)/, { timeout: 15000 });

	// Wait for page to fully load (ensures cookies are set)
	await page.waitForLoadState('networkidle');

	// Verify we're authenticated by checking for authenticated page elements
	// Wait for Inbox header to ensure cookies are properly set and page is loaded
	const inboxHeader = page.locator('h2:has-text("Inbox"), h1:has-text("Inbox")').first();
	await expect(inboxHeader).toBeVisible({ timeout: 10000 });

	console.log(
		`✅ [Worker ${workerIndex}] Authentication successful - authenticated elements visible`
	);

	// Verify session is working by navigating to another protected route
	await page.goto('/settings');
	await page.waitForURL('/settings', { timeout: 10000 });
	console.log(`✅ [Worker ${workerIndex}] Session verified - can access protected routes`);

	// Navigate back to inbox before saving state
	await page.goto('/inbox');
	await page.waitForURL('/inbox', { timeout: 10000 });

	// CRITICAL FIX (SYOS-160): Verify session exists in Convex BEFORE saving storageState
	// This prevents race condition where storageState is saved before Convex write completes
	console.log(`🔍 [Worker ${workerIndex}] Verifying session exists in Convex database...`);

	const cookies = await page.context().cookies();
	const sessionCookie = cookies.find((c) => c.name === 'session_id');

	if (!sessionCookie) {
		throw new Error(`[Worker ${workerIndex}] Session cookie not found after authentication`);
	}

	const sessionId = sessionCookie.value;
	console.log(`📋 [Worker ${workerIndex}] Session ID:`, sessionId);

	// Query Convex to verify session exists (with retry logic for race condition)
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
			session = await convex.query(api.authSessions.getSessionById, { sessionId });

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
			`[Worker ${workerIndex}] Session ${sessionId} not found in Convex after ${maxAttempts} attempts. This indicates a race condition in session creation.`
		);
	}

	// Now it's safe to save storageState - session is guaranteed to exist in Convex
	// Save to worker-specific file for parallel execution
	const authFile = `e2e/.auth/user-worker-${workerIndex}.json`;
	await page.context().storageState({ path: authFile });

	console.log(`💾 [Worker ${workerIndex}] Saved auth state to`, authFile);
	console.log(
		`🎉 [Worker ${workerIndex}] Authentication setup complete - session persistent in Convex`
	);
});

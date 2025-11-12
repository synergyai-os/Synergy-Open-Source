/**
 * Playwright Authentication Setup
 * 
 * This script logs in once before all tests and saves the authenticated state.
 * All tests can then reuse this state without re-authenticating.
 * 
 * See: https://playwright.dev/docs/auth
 */

import { test as setup, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
	// Get credentials from environment
	const email = process.env.TEST_USER_EMAIL;
	const password = process.env.TEST_USER_PASSWORD;

	if (!email || !password) {
		throw new Error(
			'Test credentials not found. Please set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.test'
		);
	}

	console.log('🔐 Authenticating test user:', email);

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

	// Verify we're authenticated by checking for user-specific elements
	// Adjust selector based on your app
	await expect(page.locator('body')).toBeVisible();

	console.log('✅ Authentication successful');

	// Save authenticated state
	await page.context().storageState({ path: authFile });

	console.log('💾 Saved auth state to', authFile);
});

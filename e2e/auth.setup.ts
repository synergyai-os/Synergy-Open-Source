/**
 * Authentication Setup for E2E Tests
 * 
 * This runs once to authenticate a test user, then saves the auth state
 * so other tests can reuse it (faster than logging in every time).
 */

import { test as setup, expect } from '@playwright/test';

// This file runs once before all tests
// The auth state is saved to a file that other tests can load

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
	// Go to login page
	await page.goto('/login');

	// Fill in login form
	// NOTE: You'll need to create a test user first, or use environment variables
	const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
	const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';

	await page.fill('input[name="email"]', testEmail);
	await page.fill('input[name="password"]', testPassword);
	
	// Submit form and wait for navigation
	await Promise.all([
		page.waitForNavigation({ waitUntil: 'networkidle' }),
		page.click('button[type="submit"]')
	]);

	// Wait for either redirect OR check if we're on an authenticated page
	// The redirect might go to /inbox or stay on /login with error
	const currentUrl = page.url();
	
	// If we're still on login page, check for error or try again
	if (currentUrl.includes('/login')) {
		// Check if there's an error message
		const errorVisible = await page.locator('text=/error|failed|invalid/i').isVisible({ timeout: 2000 }).catch(() => false);
		
		if (errorVisible) {
			throw new Error('Login failed - check TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables or create test user');
		}
		
		// Wait a bit more for redirect
		await page.waitForURL(/\/(inbox|flashcards|settings|$)/, { timeout: 5000 }).catch(() => {
			throw new Error('Login did not redirect - authentication may have failed');
		});
	}

	// Verify we're authenticated by checking for authenticated-only content
	// Try multiple possible indicators
	const isAuthenticated = await Promise.race([
		page.locator('button:has-text("Sync Readwise Highlights")').isVisible().then(() => true),
		page.locator('a[href="/inbox"]').isVisible().then(() => true),
		page.locator('text=/sign out|logout/i').isVisible().then(() => true),
		new Promise(resolve => setTimeout(() => resolve(false), 3000))
	]).catch(() => false);

	if (!isAuthenticated) {
		throw new Error('Could not verify authentication - test user may not exist or login failed');
	}

	// Save auth state to file
	await page.context().storageState({ path: authFile });
});


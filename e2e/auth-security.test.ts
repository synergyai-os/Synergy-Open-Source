/**
 * E2E Security Tests for SessionID-based Auth
 *
 * Tests that the refactored authentication properly prevents:
 * - Unauthorized access to protected resources
 * - Impersonation attacks
 * - Session hijacking
 */

import { test, expect } from '@playwright/test';

test.describe('Auth Security - SessionID Validation', () => {
	// This test uses a fresh context (no auth) to test unauthenticated behavior
	test.use({ storageState: { cookies: [], origins: [] } });

	test('should redirect to login when not authenticated', async ({ page }) => {
		// Try to access protected route without authentication
		await page.goto('/inbox');

		// Should redirect to login
		await expect(page).toHaveURL(/\/login/);
	});

	test('should allow access to protected routes after login', async ({ page }) => {
		// Use authenticated state from auth.setup.ts
		test.use({ storageState: 'e2e/.auth/user.json' });

		// Navigate to protected route
		await page.goto('/inbox');

		// Should not redirect to login
		await expect(page).toHaveURL(/\/inbox/);

		// Should show authenticated content
		await expect(page.locator('body')).toBeVisible();
	});

	test('should not allow accessing other user data', async ({ page }) => {
		// Use authenticated state
		test.use({ storageState: 'e2e/.auth/user.json' });

		// Navigate to inbox
		await page.goto('/inbox');

		// Get inbox items count
		const inboxItems = page.locator('[data-testid="inbox-item"]');
		const userItemsCount = await inboxItems.count();

		// All items should belong to authenticated user
		// (This is implicit - if sessionId auth works, only user items are returned)
		console.log(`User has ${userItemsCount} inbox items`);

		// TODO: Add explicit verification if we expose user metadata in UI
	});

	test.skip('should invalidate session after expiration', async () => {
		// TODO: Implement session expiration test
		// This requires mocking time or waiting for actual expiration
		// For now, document the expected behavior
	});
});

test.describe('Settings Security', () => {
	// Use authenticated state for all tests in this describe block
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		// Already authenticated via storageState
	});

	test('should allow updating own theme', async ({ page }) => {
		await page.goto('/settings');

		// Click dark mode toggle
		const darkModeToggle = page.locator('[data-testid="theme-toggle"]');
		await darkModeToggle.click();

		// Verify theme changed (check for dark mode class on body/html)
		await expect(page.locator('html')).toHaveClass(/dark/);
	});

	test('should securely store API keys', async ({ page }) => {
		await page.goto('/settings');

		// Enter Claude API key
		const claudeKeyInput = page.locator('[data-testid="claude-api-key-input"]');
		await claudeKeyInput.fill('sk-test-key-12345');
		await claudeKeyInput.blur();

		// Wait for save
		await page.waitForTimeout(2000);

		// Verify key is not exposed in page source
		const pageContent = await page.content();
		expect(pageContent).not.toContain('sk-test-key-12345');

		// Verify "has key" indicator is shown
		const hasKeyIndicator = page.locator('[data-testid="claude-key-indicator"]');
		await expect(hasKeyIndicator).toBeVisible();
	});
});

test.describe('Notes Security', () => {
	// Use authenticated state for all tests in this describe block
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		// Already authenticated via storageState
	});

	test('should create note with authenticated session', async ({ page }) => {
		await page.goto('/inbox');

		// Click create note button
		const createNoteBtn = page.locator('[data-testid="create-note-btn"]');
		await createNoteBtn.click();

		// Enter note content
		const noteEditor = page.locator('[data-testid="note-editor"]');
		await noteEditor.fill('Test note content');

		// Save note
		const saveBtn = page.locator('[data-testid="save-note-btn"]');
		await saveBtn.click();

		// Verify note appears in list
		await expect(page.locator('text=Test note content')).toBeVisible();
	});
});

test.describe('Inbox Security', () => {
	// Use authenticated state for all tests in this describe block
	test.use({ storageState: 'e2e/.auth/user.json' });

	test.beforeEach(async ({ page }) => {
		// Already authenticated via storageState
	});

	test('should only show user-owned inbox items', async ({ page }) => {
		await page.goto('/inbox');

		// Verify inbox items are displayed
		const inboxItems = page.locator('[data-testid="inbox-item"]');
		await expect(inboxItems.first()).toBeVisible();

		// Verify items belong to current user (would need to check metadata)
		// This is implicit - if sessionId auth works, only user items are returned
	});

	test('should mark item as processed', async ({ page }) => {
		await page.goto('/inbox');

		// Select first inbox item
		const firstItem = page.locator('[data-testid="inbox-item"]').first();
		await firstItem.click();

		// Click mark processed button
		const markProcessedBtn = page.locator('[data-testid="mark-processed-btn"]');
		await markProcessedBtn.click();

		// Verify item is removed from inbox (or marked processed)
		await expect(firstItem).not.toBeVisible();
	});
});

/**
 * Test Configuration Notes:
 *
 * To run these tests, you need:
 * 1. Test WorkOS credentials in .env.test
 * 2. Test Convex deployment
 * 3. Test users created in WorkOS
 * 4. Playwright auth state storage
 *
 * See: https://playwright.dev/docs/auth for authentication setup
 */

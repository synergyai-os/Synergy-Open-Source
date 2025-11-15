import { expect, test } from '@playwright/test';

/**
 * Test home page without authentication
 * Note: Storage state is handled by playwright.config.ts (unauthenticated project)
 */
test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});

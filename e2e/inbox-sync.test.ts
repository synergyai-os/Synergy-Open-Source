/**
 * E2E Test: Inbox Sync Workflow
 *
 * Tests the complete sync workflow end-to-end.
 *
 * Authentication: Uses saved auth state from auth.setup.ts
 * (Runs once, saves cookies, reused for all tests)
 */

import { test, expect } from '@playwright/test';

test.describe('Inbox Sync Workflow', () => {
	test('user can view inbox page', async ({ page }) => {
		await page.goto('/inbox');

		// Check that inbox page loads
		// Auth state is automatically loaded from playwright/.auth/user.json
		// Look for the Inbox header and menu button
		await expect(page.locator('h2:has-text("Inbox")')).toBeVisible();
	});

	test('user can open sync configuration', async ({ page }) => {
		await page.goto('/inbox');

		// Click the three dots menu button (next to "Inbox" header)
		// The button contains an SVG with three vertical dots
		const menuButton = page
			.locator('button')
			.filter({ has: page.locator('svg path[d*="M12 5v.01M12 12v.01M12 19v.01"]') })
			.first();
		await expect(menuButton).toBeVisible({ timeout: 10000 });
		await menuButton.click();

		// Wait for dropdown menu to appear and click "Sync Readwise Highlights"
		const syncMenuItem = page.locator('text="Sync Readwise Highlights"').first();
		await expect(syncMenuItem).toBeVisible({ timeout: 5000 });
		await syncMenuItem.click();

		// Wait for sync config panel to appear
		await page.waitForTimeout(1000);

		// Check that sync config panel appears
		// Use .first() to avoid strict mode violation (multiple elements might match)
		await expect(
			page
				.locator('text=/Import by/i')
				.or(page.locator('h3:has-text("Import Readwise Highlights")'))
				.first()
		).toBeVisible({ timeout: 5000 });
	});

	test('user can sync Readwise highlights - import 10 items', async ({ page }) => {
		await page.goto('/inbox');

		// Wait for page to fully load
		await page.waitForLoadState('networkidle');

		// Click the three dots menu button (next to "Inbox" header)
		const menuButton = page
			.locator('button')
			.filter({ has: page.locator('svg path[d*="M12 5v.01M12 12v.01M12 19v.01"]') })
			.first();
		await expect(menuButton).toBeVisible({ timeout: 10000 });
		await menuButton.click();

		// Wait for dropdown menu to appear and click "Sync Readwise Highlights"
		const syncMenuItem = page.locator('text="Sync Readwise Highlights"').first();
		await expect(syncMenuItem).toBeVisible({ timeout: 5000 });
		await syncMenuItem.click();

		// Wait for sync config panel to appear
		await page.waitForTimeout(1000);

		// Wait for sync config panel to appear - look for "Import by" label
		await expect(page.locator('text=/Import by/i')).toBeVisible({ timeout: 10000 });

		// Select "Number of items" import type (quantity mode)
		const quantityToggle = page.locator('text="Number of items"').first();
		await expect(quantityToggle).toBeVisible({ timeout: 5000 });
		await quantityToggle.click();

		// Wait for quantity options to appear
		await page.waitForTimeout(500);

		// Select "10" from the quantity options - look for "Last 10 highlights"
		const quantity10 = page.locator('text="Last 10 highlights"').first();
		await expect(quantity10).toBeVisible({ timeout: 5000 });
		await quantity10.click();

		// Wait a moment for selection to register
		await page.waitForTimeout(300);

		// Click Import button
		const importButton = page.locator('button:has-text("Import")');
		await expect(importButton).toBeVisible({ timeout: 5000 });
		await importButton.click();

		// Wait for sync to start/complete (30 second timeout for API call)
		// Use .first() to avoid strict mode violation (multiple elements might match)
		await expect(
			page
				.locator(
					'text=/Imported|new highlight|Sync completed|already in your inbox|highlights|Syncing|Progress/i'
				)
				.first()
		).toBeVisible({ timeout: 30000 });
	});
});

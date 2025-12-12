/**
 * E2E Smoke Tests for Organization Flows
 *
 * Tests critical user workflows for workspace management:
 * - Organization switching (click switcher → select org → verify URL/UI updates)
 * - Organization creation (open modal → fill name → submit → verify success)
 * - Persistence across reloads (switch org → reload → verify same org active)
 * - URL parameter handling (?org={id} → verify switches automatically)
 *
 * These tests serve as regression tests before refactoring useWorkspaces composable (SYOS-255).
 */

import { test, expect } from './fixtures';

test.describe('Organization Flows - Smoke Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to authenticated page (inbox is a good default)
		await page.goto('/inbox');
		await page.waitForLoadState('networkidle');

		// Wait for page to load and verify we're authenticated
		await expect(page.locator('h1, h2').filter({ hasText: /inbox/i }).first()).toBeVisible({
			timeout: 10000
		});
	});

	test('should switch workspace via dropdown', async ({ page }) => {
		// Get initial workspace name from switcher trigger
		const switcherTrigger = page
			.locator('button')
			.filter({ hasText: /Select workspace|Owner|Admin|Member/i })
			.first();
		await expect(switcherTrigger).toBeVisible({ timeout: 5000 });

		const initialOrgText = await switcherTrigger.textContent();
		expect(initialOrgText).toBeTruthy();

		// Click workspace switcher trigger to open dropdown
		await switcherTrigger.click();
		await page.waitForTimeout(500); // Wait for dropdown animation

		// Find all workspace items in dropdown (they have workspace names)
		// Organizations are listed as DropdownMenu.Item with textValue={workspace.name}
		const orgItems = page.locator('[role="menuitem"]').filter({ hasText: /Owner|Admin|Member/i });
		const orgCount = await orgItems.count();

		if (orgCount < 2) {
			// User only has one workspace, can't test switching
			console.log('User has only one workspace, skipping switch test');
			// Close dropdown
			await page.keyboard.press('Escape');
			return;
		}

		// Get second workspace (different from current)
		const secondOrgItem = orgItems.nth(1);
		const secondOrgName = await secondOrgItem.locator('span').first().textContent();
		expect(secondOrgName).toBeTruthy();

		// Click second workspace to switch
		await secondOrgItem.click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000); // Wait for workspace switch to complete

		// Verify URL doesn't have ?org= param (should be cleaned up)
		const url = page.url();
		expect(url).not.toContain('?org=');

		// Verify switcher shows new workspace name
		// Note: Organization name might be truncated, so we check it's different
		const newSwitcherText = await switcherTrigger.textContent();
		expect(newSwitcherText).toBeTruthy();
		// Organization name should be different (or at least visible)
		if (secondOrgName && initialOrgText) {
			// If names are different, verify change occurred
			if (secondOrgName !== initialOrgText) {
				expect(newSwitcherText).toContain(secondOrgName.slice(0, 10)); // Check first 10 chars
			}
		}

		// Verify localStorage was updated (check via evaluate)
		const activeOrgId = await page.evaluate(() => {
			// Check for account-specific key pattern: activeOrganizationId_{userId}
			const keys = Object.keys(localStorage);
			const orgKey = keys.find((k) => k.startsWith('activeWorkspaceId'));
			return orgKey ? localStorage.getItem(orgKey) : null;
		});
		expect(activeOrgId).toBeTruthy();
	});

	test('should create workspace via modal', async ({ page }) => {
		// Click workspace switcher trigger
		const switcherTrigger = page
			.locator('button')
			.filter({ hasText: /Select workspace|Owner|Admin|Member/i })
			.first();
		await expect(switcherTrigger).toBeVisible({ timeout: 5000 });
		await switcherTrigger.click();
		await page.waitForTimeout(500);

		// Click "Create workspace" menu item (direct item in dropdown, not nested)
		const createOrgButton = page
			.locator('[role="menuitem"]')
			.filter({ hasText: 'Create workspace' });
		await expect(createOrgButton).toBeVisible({ timeout: 5000 });
		await createOrgButton.click();

		// Wait for modal to open (use role selector to target dialog heading, not dropdown item)
		await expect(page.getByRole('heading', { name: 'Create workspace' })).toBeVisible({
			timeout: 5000
		});
		await expect(page.locator('text=Spin up a new workspace')).toBeVisible();

		// Fill workspace name
		const orgName = `Test Org ${Date.now()}`;
		const nameInput = page.locator('input[placeholder*="e.g."], input[type="text"]').first();
		await expect(nameInput).toBeVisible();
		await nameInput.fill(orgName);

		// Submit form
		const submitButton = page
			.locator('button[type="submit"]')
			.filter({ hasText: /Create|Creating/i });
		await expect(submitButton).toBeVisible();
		await submitButton.click();

		// Wait for success toast
		await expect(page.locator(`text=${orgName} created successfully!`)).toBeVisible({
			timeout: 10000
		});

		// Wait for modal to close
		await expect(page.locator('text=Create workspace')).not.toBeVisible({ timeout: 5000 });

		// Verify workspace switch occurred (switcher should show new org)
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000); // Wait for switch to complete

		const switcherText = await switcherTrigger.textContent();
		expect(switcherText).toBeTruthy();
		// New workspace name should appear in switcher (might be truncated)
		if (switcherText) {
			expect(switcherText.toLowerCase()).toContain(orgName.slice(0, 10).toLowerCase());
		}

		// Verify new workspace appears in dropdown list
		await switcherTrigger.click();
		await page.waitForTimeout(500);
		const orgInList = page.locator('[role="menuitem"]').filter({ hasText: orgName.slice(0, 15) });
		await expect(orgInList).toBeVisible({ timeout: 5000 });
	});

	test('should persist workspace selection across page reloads', async ({ page }) => {
		// Get initial workspace
		const switcherTrigger = page
			.locator('button')
			.filter({ hasText: /Select workspace|Owner|Admin|Member/i })
			.first();
		await expect(switcherTrigger).toBeVisible({ timeout: 5000 });

		// Open dropdown to see workspaces
		await switcherTrigger.click();
		await page.waitForTimeout(500);

		const orgItems = page.locator('[role="menuitem"]').filter({ hasText: /Owner|Admin|Member/i });
		const orgCount = await orgItems.count();

		if (orgCount < 1) {
			console.log('User has no workspaces, skipping persistence test');
			await page.keyboard.press('Escape');
			return;
		}

		// Get first workspace name
		const firstOrgItem = orgItems.first();
		const firstOrgName = await firstOrgItem.locator('span').first().textContent();
		expect(firstOrgName).toBeTruthy();

		// Select first workspace (might already be selected, but ensure it's active)
		await firstOrgItem.click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Get active workspace ID from localStorage before reload
		const orgIdBeforeReload = await page.evaluate(() => {
			const keys = Object.keys(localStorage);
			const orgKey = keys.find((k) => k.startsWith('activeWorkspaceId'));
			return orgKey ? localStorage.getItem(orgKey) : null;
		});
		expect(orgIdBeforeReload).toBeTruthy();

		// Reload page
		await page.reload();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Verify same workspace is still active
		const orgIdAfterReload = await page.evaluate(() => {
			const keys = Object.keys(localStorage);
			const orgKey = keys.find((k) => k.startsWith('activeWorkspaceId'));
			return orgKey ? localStorage.getItem(orgKey) : null;
		});
		expect(orgIdAfterReload).toBe(orgIdBeforeReload);

		// Verify switcher shows same workspace
		const switcherAfterReload = page
			.locator('button')
			.filter({ hasText: /Select workspace|Owner|Admin|Member/i })
			.first();
		await expect(switcherAfterReload).toBeVisible({ timeout: 5000 });

		// Organization name should match (might be truncated)
		const switcherTextAfterReload = await switcherAfterReload.textContent();
		if (firstOrgName && switcherTextAfterReload) {
			expect(switcherTextAfterReload.toLowerCase()).toContain(
				firstOrgName.slice(0, 10).toLowerCase()
			);
		}
	});

	test('should switch workspace via URL parameter', async ({ page }) => {
		// First, get an workspace ID from the current state
		// Open dropdown to see workspaces
		const switcherTrigger = page
			.locator('button')
			.filter({ hasText: /Select workspace|Owner|Admin|Member/i })
			.first();
		await expect(switcherTrigger).toBeVisible({ timeout: 5000 });
		await switcherTrigger.click();
		await page.waitForTimeout(500);

		const orgItems = page.locator('[role="menuitem"]').filter({ hasText: /Owner|Admin|Member/i });
		const orgCount = await orgItems.count();

		if (orgCount < 2) {
			console.log('User has less than 2 workspaces, skipping URL param test');
			await page.keyboard.press('Escape');
			return;
		}

		// Get second workspace's ID from data attribute or text
		// Since we can't easily get the ID from UI, we'll use a different approach:
		// Switch to second org first, get its ID from localStorage, then test URL param
		const secondOrgItem = orgItems.nth(1);
		const secondOrgName = await secondOrgItem.locator('span').first().textContent();
		expect(secondOrgName).toBeTruthy();

		// Click second workspace
		await secondOrgItem.click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Get the workspace ID that was set
		const secondOrgId = await page.evaluate(() => {
			const keys = Object.keys(localStorage);
			const orgKey = keys.find((k) => k.startsWith('activeWorkspaceId'));
			return orgKey ? localStorage.getItem(orgKey) : null;
		});
		expect(secondOrgId).toBeTruthy();

		// Switch back to first workspace
		await switcherTrigger.click();
		await page.waitForTimeout(500);
		const firstOrgItem = orgItems.first();
		await firstOrgItem.click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Now navigate with ?org= parameter pointing to second org
		await page.goto(`/inbox?org=${secondOrgId}`);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000); // Wait for workspace switch to process

		// Verify URL parameter was cleaned up (removed)
		const url = page.url();
		expect(url).not.toContain('?org=');

		// Verify workspace switched to second org
		const finalOrgId = await page.evaluate(() => {
			const keys = Object.keys(localStorage);
			const orgKey = keys.find((k) => k.startsWith('activeWorkspaceId'));
			return orgKey ? localStorage.getItem(orgKey) : null;
		});
		expect(finalOrgId).toBe(secondOrgId);

		// Verify switcher shows second workspace
		const finalSwitcher = page
			.locator('button')
			.filter({ hasText: /Select workspace|Owner|Admin|Member/i })
			.first();
		await expect(finalSwitcher).toBeVisible({ timeout: 5000 });
		const finalSwitcherText = await finalSwitcher.textContent();
		if (secondOrgName && finalSwitcherText) {
			expect(finalSwitcherText.toLowerCase()).toContain(secondOrgName.slice(0, 10).toLowerCase());
		}
	});
});

/**
 * E2E Test for Member Invite Modal
 *
 * Tests the critical 20% that covers 80% of functionality:
 * - Modal opens/closes
 * - Email validation
 * - Invite creation
 * - Copy to clipboard
 * - Toast notifications
 */

import { test, expect } from './fixtures';

test.use({ storageState: 'e2e/.auth/user.json' });

test.describe('Member Invite Modal', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to members page
		await page.goto('/org/members');
		await page.waitForLoadState('networkidle');

		// Wait for members page to load
		await expect(page.locator('h1:has-text("Members")')).toBeVisible({ timeout: 10000 });
	});

	test('should open modal and create invite link', async ({ page }) => {
		// Click "Invite Member" button
		const inviteButton = page.locator('button:has-text("Invite Member")');
		await expect(inviteButton).toBeVisible();
		await inviteButton.click();

		// Verify modal opens
		await expect(page.locator('text=Invite Member')).toBeVisible();
		await expect(page.locator('text=Generate an invite link')).toBeVisible();

		// Fill email input
		const emailInput = page.locator('input[type="email"]');
		await emailInput.fill('test@example.com');

		// Submit form
		const generateButton = page.locator('button:has-text("Generate Invite Link")');
		await generateButton.click();

		// Wait for invite link to appear
		await expect(page.locator('text=Invite Link')).toBeVisible({ timeout: 5000 });
		const inviteLinkInput = page.locator('input[readonly]');
		await expect(inviteLinkInput).toBeVisible();

		// Verify invite link format
		const linkValue = await inviteLinkInput.inputValue();
		expect(linkValue).toMatch(/\/invite\?code=/);

		// Verify toast notification
		await expect(page.locator('text=Invite created')).toBeVisible({ timeout: 2000 });
	});

	test('should validate email input', async ({ page }) => {
		// Open modal
		await page.locator('button:has-text("Invite Member")').click();
		await expect(page.locator('text=Invite Member')).toBeVisible();

		// Try to submit without email (should be disabled)
		const generateButton = page.locator('button:has-text("Generate Invite Link")');
		await expect(generateButton).toBeDisabled();

		// Fill invalid email
		const emailInput = page.locator('input[type="email"]');
		await emailInput.fill('invalid-email');

		// Browser validation should prevent submission
		// (HTML5 email validation)
		const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
		expect(validity).toBe(false);
	});

	test('should copy invite link to clipboard', async ({ page, context }) => {
		// Grant clipboard permissions
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);

		// Open modal and create invite
		await page.locator('button:has-text("Invite Member")').click();
		await page.locator('input[type="email"]').fill('test@example.com');
		await page.locator('button:has-text("Generate Invite Link")').click();

		// Wait for invite link
		await expect(page.locator('text=Invite Link')).toBeVisible({ timeout: 5000 });

		// Click copy button
		const copyButton = page.locator('button:has-text("Copy")');
		await copyButton.click();

		// Verify toast
		await expect(page.locator('text=Invite link copied')).toBeVisible({ timeout: 2000 });

		// Verify clipboard content
		const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboardText).toMatch(/\/invite\?code=/);
	});

	test('should close modal after creating invite', async ({ page }) => {
		// Open modal and create invite
		await page.locator('button:has-text("Invite Member")').click();
		await page.locator('input[type="email"]').fill('test@example.com');
		await page.locator('button:has-text("Generate Invite Link")').click();

		// Wait for invite link
		await expect(page.locator('text=Invite Link')).toBeVisible({ timeout: 5000 });

		// Click Done button
		await page.locator('button:has-text("Done")').click();

		// Verify modal closes
		await expect(page.locator('text=Invite Member')).not.toBeVisible({ timeout: 2000 });
	});
});

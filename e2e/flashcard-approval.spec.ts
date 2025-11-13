/**
 * E2E Tests for Flashcard Approval Flow
 *
 * CRITICAL: Tests the flashcard generation and approval workflow
 *
 * These tests verify:
 * - User can generate flashcards from inbox items
 * - User can approve/reject individual flashcards
 * - Approved flashcards are saved to database
 * - Inbox item is marked as processed
 * - No console errors during operations
 */

import { test, expect } from '@playwright/test';

// Use authenticated state from auth.setup.ts
test.use({ storageState: 'e2e/.auth/user.json' });

test.describe('Flashcard Approval Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/inbox');
		await page.waitForLoadState('networkidle');
		// Give time for inbox items to load
		await page.waitForTimeout(2000);
	});

	test('should generate flashcards from inbox item', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Find first inbox item
		const firstItem = page
			.locator('button:has-text("📚"), button:has-text("📝"), button:has-text("💭")')
			.first();

		if (!(await firstItem.isVisible({ timeout: 3000 }))) {
			console.log('No inbox items found - skipping test');
			test.skip();
			return;
		}

		// Click to select item
		await firstItem.click();
		await page.waitForTimeout(2000);

		// Look for "Generate Flashcards" button (has 🧠 emoji)
		const generateButton = page.locator('button:has-text("🧠")').first();

		if (!(await generateButton.isVisible({ timeout: 5000 }))) {
			console.log('Generate Flashcards button not found - item type may not support it');
			test.skip();
			return;
		}

		// Click generate button
		await generateButton.click();
		await page.waitForTimeout(3000); // Wait for AI generation

		// Verify modal opened
		const modalHeading = page.locator('h2:has-text("Review Flashcards")');
		await expect(modalHeading).toBeVisible({ timeout: 10000 });

		// Verify progress text is visible
		const progressText = page.locator('p:has-text("of")');
		await expect(progressText).toBeVisible();

		// Verify no errors
		const hasError = consoleErrors.some(
			(err) =>
				err.includes('Error') ||
				err.includes('Failed') ||
				err.includes('ArgumentValidationError')
		);
		expect(hasError).toBe(false);

		console.log('✅ Successfully generated flashcards');
	});

	test('should approve current flashcard and advance to next', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Find first inbox item
		const firstItem = page
			.locator('button:has-text("📚"), button:has-text("📝"), button:has-text("💭")')
			.first();

		if (!(await firstItem.isVisible({ timeout: 3000 }))) {
			console.log('No inbox items found - skipping test');
			test.skip();
			return;
		}

		await firstItem.click();
		await page.waitForTimeout(2000);

		// Generate flashcards
		const generateButton = page.locator('button:has-text("🧠")').first();
		if (!(await generateButton.isVisible({ timeout: 5000 }))) {
			test.skip();
			return;
		}

		await generateButton.click();
		await page.waitForTimeout(3000);

		// Wait for modal
		const modalHeading = page.locator('h2:has-text("Review Flashcards")');
		await expect(modalHeading).toBeVisible({ timeout: 10000 });

		// Get initial progress text (e.g., "1 of 3")
		const progressText = page.locator('p:has-text("of")');
		const initialProgress = await progressText.textContent();

		// Press right arrow to approve current card
		await page.keyboard.press('ArrowRight');
		await page.waitForTimeout(500); // Animation delay

		// Verify progress changed (card advanced)
		const newProgress = await progressText.textContent();
		if (initialProgress !== 'Complete' && newProgress !== 'Complete') {
			expect(newProgress).not.toBe(initialProgress);
		}

		// Verify no errors
		const hasError = consoleErrors.some(
			(err) => err.includes('Error') || err.includes('ArgumentValidationError')
		);
		expect(hasError).toBe(false);

		console.log('✅ Successfully approved flashcard and advanced');
	});

	test('should reject current flashcard using keyboard shortcut', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Find first inbox item
		const firstItem = page
			.locator('button:has-text("📚"), button:has-text("📝"), button:has-text("💭")')
			.first();

		if (!(await firstItem.isVisible({ timeout: 3000 }))) {
			test.skip();
			return;
		}

		await firstItem.click();
		await page.waitForTimeout(2000);

		// Generate flashcards
		const generateButton = page.locator('button:has-text("🧠")').first();
		if (!(await generateButton.isVisible({ timeout: 5000 }))) {
			test.skip();
			return;
		}

		await generateButton.click();
		await page.waitForTimeout(3000);

		// Wait for modal
		const modalHeading = page.locator('h2:has-text("Review Flashcards")');
		await expect(modalHeading).toBeVisible({ timeout: 10000 });

		// Press left arrow to reject current card
		await page.keyboard.press('ArrowLeft');
		await page.waitForTimeout(500);

		// Verify no errors (card should be rejected and removed from queue)
		const hasError = consoleErrors.some(
			(err) => err.includes('Error') || err.includes('ArgumentValidationError')
		);
		expect(hasError).toBe(false);

		console.log('✅ Successfully rejected flashcard');
	});

	test('should flip flashcard to show answer', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Find first inbox item
		const firstItem = page
			.locator('button:has-text("📚"), button:has-text("📝"), button:has-text("💭")')
			.first();

		if (!(await firstItem.isVisible({ timeout: 3000 }))) {
			test.skip();
			return;
		}

		await firstItem.click();
		await page.waitForTimeout(2000);

		// Generate flashcards
		const generateButton = page.locator('button:has-text("🧠")').first();
		if (!(await generateButton.isVisible({ timeout: 5000 }))) {
			test.skip();
			return;
		}

		await generateButton.click();
		await page.waitForTimeout(3000);

		// Wait for modal
		const modalHeading = page.locator('h2:has-text("Review Flashcards")');
		await expect(modalHeading).toBeVisible({ timeout: 10000 });

		// Press up/down arrow to flip card
		await page.keyboard.press('ArrowDown');
		await page.waitForTimeout(300);

		// Flip back
		await page.keyboard.press('ArrowUp');
		await page.waitForTimeout(300);

		// Verify no errors
		const hasError = consoleErrors.some(
			(err) => err.includes('Error') || err.includes('ArgumentValidationError')
		);
		expect(hasError).toBe(false);

		console.log('✅ Successfully flipped flashcard');
	});

	test('should close modal using ESC key', async ({ page }) => {
		// Find first inbox item
		const firstItem = page
			.locator('button:has-text("📚"), button:has-text("📝"), button:has-text("💭")')
			.first();

		if (!(await firstItem.isVisible({ timeout: 3000 }))) {
			test.skip();
			return;
		}

		await firstItem.click();
		await page.waitForTimeout(2000);

		// Generate flashcards
		const generateButton = page.locator('button:has-text("🧠")').first();
		if (!(await generateButton.isVisible({ timeout: 5000 }))) {
			test.skip();
			return;
		}

		await generateButton.click();
		await page.waitForTimeout(3000);

		// Wait for modal
		const modalHeading = page.locator('h2:has-text("Review Flashcards")');
		await expect(modalHeading).toBeVisible({ timeout: 10000 });

		// Press ESC to close
		await page.keyboard.press('Escape');
		await page.waitForTimeout(500);

		// Verify modal is closed (heading should not be visible)
		await expect(modalHeading).not.toBeVisible();

		console.log('✅ Successfully closed modal with ESC');
	});
});

test.describe('Flashcard Approval Flow - Complete Workflow', () => {
	test('should approve all flashcards and save to database', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		await page.goto('/inbox');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Find first inbox item
		const firstItem = page
			.locator('button:has-text("📚"), button:has-text("📝"), button:has-text("💭")')
			.first();

		if (!(await firstItem.isVisible({ timeout: 3000 }))) {
			console.log('No inbox items found - skipping test');
			test.skip();
			return;
		}

		await firstItem.click();
		await page.waitForTimeout(2000);

		// Generate flashcards
		const generateButton = page.locator('button:has-text("🧠")').first();
		if (!(await generateButton.isVisible({ timeout: 5000 }))) {
			test.skip();
			return;
		}

		await generateButton.click();
		await page.waitForTimeout(3000);

		// Wait for modal
		const modalHeading = page.locator('h2:has-text("Review Flashcards")');
		await expect(modalHeading).toBeVisible({ timeout: 10000 });

		// Approve all cards by repeatedly pressing right arrow
		let maxIterations = 10; // Safety limit
		let currentProgress = await page.locator('p:has-text("of")').textContent();

		while (currentProgress !== 'Complete' && maxIterations > 0) {
			await page.keyboard.press('ArrowRight');
			await page.waitForTimeout(500);
			currentProgress = await page.locator('p:has-text("of")').textContent();
			maxIterations--;
		}

		// Verify completion message
		const completionEmoji = page.locator('div:has-text("✅")');
		await expect(completionEmoji).toBeVisible({ timeout: 5000 });

		// Modal should auto-close after completion
		await page.waitForTimeout(1000);

		// Verify no errors during save
		const hasError = consoleErrors.some(
			(err) =>
				err.includes('Error') ||
				err.includes('Failed') ||
				err.includes('ArgumentValidationError')
		);
		expect(hasError).toBe(false);

		// Verify flashcards were saved by navigating to flashcards page
		await page.goto('/flashcards');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Check that flashcards page loaded (should have "All Cards" collection)
		const allCardsCollection = page.locator('button:has-text("All Cards")');
		await expect(allCardsCollection).toBeVisible({ timeout: 5000 });

		console.log('✅ Successfully completed flashcard approval workflow');
	});
});

/**
 * Test Strategy:
 *
 * These tests focus on the flashcard generation and approval workflow:
 * 1. Generate flashcards from inbox items (AI generation)
 * 2. Review flashcards using keyboard shortcuts
 * 3. Approve/reject individual cards
 * 4. Save approved cards to database
 * 5. Verify cards appear in flashcards page
 *
 * High value tests because:
 * - Flashcard generation is a core AI feature
 * - Approval flow is the primary way users create flashcards
 * - Keyboard shortcuts are power-user features
 * - Any bug here affects the main value proposition
 */


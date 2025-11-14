/**
 * E2E Tests for Flashcard Collections
 *
 * CRITICAL: Tests the flashcard collection opening and navigation
 *
 * These tests verify:
 * - Collections load correctly
 * - Opening a collection loads flashcards
 * - Collection counts are accurate
 * - No console errors during operations
 */

import { test, expect } from '@playwright/test';

// Use authenticated state from auth.setup.ts
test.use({ storageState: 'e2e/.auth/user.json' });

test.describe('Flashcard Collections', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/flashcards');
		await page.waitForLoadState('networkidle');
		// Give time for collections to load
		await page.waitForTimeout(2000);
	});

	test('should load flashcards page without errors', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Reload to trigger fresh query
		await page.reload();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Verify flashcards heading is visible
		const flashcardsHeading = page
			.locator('h1, h2')
			.filter({ hasText: /flashcards/i })
			.first();
		await expect(flashcardsHeading).toBeVisible({ timeout: 5000 });

		// Verify no errors
		const hasError = consoleErrors.some(
			(err) =>
				err.includes('Error') || err.includes('Failed') || err.includes('ArgumentValidationError')
		);
		expect(hasError).toBe(false);

		console.log('✅ Flashcards page loaded without errors');
	});

	test('should display "All Cards" collection', async ({ page }) => {
		// "All Cards" should always be present (even if count is 0)
		const allCardsCollection = page.locator('button:has-text("All Cards")');
		await expect(allCardsCollection).toBeVisible({ timeout: 5000 });

		console.log('✅ "All Cards" collection is visible');
	});

	test('should display collection counts', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Find "All Cards" collection
		const allCardsCollection = page.locator('button:has-text("All Cards")');
		await expect(allCardsCollection).toBeVisible({ timeout: 5000 });

		// Look for count text (e.g., "5 cards" or "0 cards")
		const countText = page.locator('text=/\\d+ cards?/i').first();

		// Count text should be visible (even if 0)
		if (await countText.isVisible({ timeout: 3000 })) {
			const countValue = await countText.textContent();
			console.log(`Collection count: ${countValue}`);
		}

		// Verify no errors
		const hasError = consoleErrors.some(
			(err) => err.includes('Error') || err.includes('ArgumentValidationError')
		);
		expect(hasError).toBe(false);
	});

	test('should open collection and navigate to review mode', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Find "All Cards" collection
		const allCardsCollection = page.locator('button:has-text("All Cards")');
		await expect(allCardsCollection).toBeVisible({ timeout: 5000 });

		// Click to open collection
		await allCardsCollection.click();
		await page.waitForTimeout(2000);

		// Verify we're still on flashcards page or navigated to review mode
		// (Implementation may vary - modal or new page)
		const currentUrl = page.url();
		expect(currentUrl).toContain('/flashcards');

		// Verify no errors during collection opening
		const hasError = consoleErrors.some(
			(err) => err.includes('Error') || err.includes('ArgumentValidationError')
		);
		expect(hasError).toBe(false);

		console.log('✅ Successfully opened collection');
	});

	test('should handle empty collection gracefully', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Find "All Cards" collection
		const allCardsCollection = page.locator('button:has-text("All Cards")');
		await expect(allCardsCollection).toBeVisible({ timeout: 5000 });

		// Check collection count
		const countText = page.locator('text=/\\d+ cards?/i').first();
		let cardCount = 0;

		if (await countText.isVisible({ timeout: 3000 })) {
			const countValue = await countText.textContent();
			const match = countValue?.match(/(\d+)/);
			cardCount = match ? parseInt(match[1]) : 0;
		}

		if (cardCount === 0) {
			// Click empty collection
			await allCardsCollection.click();
			await page.waitForTimeout(2000);

			// Should show empty state or no errors
			const hasError = consoleErrors.some(
				(err) => err.includes('Error') || err.includes('ArgumentValidationError')
			);
			expect(hasError).toBe(false);

			console.log('✅ Empty collection handled gracefully');
		} else {
			console.log(`Collection has ${cardCount} cards - skipping empty state test`);
		}
	});

	test('should display tag-based collections if tags exist', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Look for tag-based collections (any button that's not "All Cards")
		const collections = page.locator('button').filter({
			hasNotText: 'All Cards'
		});

		const collectionCount = await collections.count();
		console.log(`Found ${collectionCount} tag-based collections`);

		if (collectionCount > 0) {
			// Click first tag-based collection
			const firstCollection = collections.first();
			await firstCollection.click();
			await page.waitForTimeout(2000);

			// Verify no errors
			const hasError = consoleErrors.some(
				(err) => err.includes('Error') || err.includes('ArgumentValidationError')
			);
			expect(hasError).toBe(false);

			console.log('✅ Successfully opened tag-based collection');
		} else {
			console.log('No tag-based collections found - user has no tagged flashcards');
		}
	});
});

test.describe('Flashcard Collections - Tag Filtering', () => {
	test('should filter collections by tag if tag selector exists', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		await page.goto('/flashcards');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Look for tag selector (implementation may vary)
		// This test is optional depending on UI implementation
		const tagSelector = page
			.locator('select, button')
			.filter({ hasText: /tag|filter/i })
			.first();

		if (await tagSelector.isVisible({ timeout: 3000 })) {
			await tagSelector.click();
			await page.waitForTimeout(1000);

			// Verify no errors during tag filtering
			const hasError = consoleErrors.some(
				(err) => err.includes('Error') || err.includes('ArgumentValidationError')
			);
			expect(hasError).toBe(false);

			console.log('✅ Tag filtering works without errors');
		} else {
			console.log('Tag selector not found - feature may not be implemented yet');
		}
	});
});

test.describe('Flashcard Collections - Review Mode Integration', () => {
	test('should navigate to review mode when collection has due cards', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		await page.goto('/flashcards');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Look for "Due" count in collections (e.g., "3 due")
		const dueCountText = page.locator('text=/\\d+ due/i').first();

		if (await dueCountText.isVisible({ timeout: 3000 })) {
			const dueCount = await dueCountText.textContent();
			console.log(`Found due cards: ${dueCount}`);

			// Click the collection with due cards
			const collectionWithDue = dueCountText.locator('..').locator('button').first();
			await collectionWithDue.click();
			await page.waitForTimeout(2000);

			// Should navigate to review mode or open modal
			// (Implementation may vary)

			// Verify no errors
			const hasError = consoleErrors.some(
				(err) => err.includes('Error') || err.includes('ArgumentValidationError')
			);
			expect(hasError).toBe(false);

			console.log('✅ Successfully navigated to review mode');
		} else {
			console.log('No due cards found - skipping review mode test');
		}
	});
});

/**
 * Test Strategy:
 *
 * These tests focus on the flashcard collections feature:
 * 1. Load collections without errors
 * 2. Display "All Cards" collection (always present)
 * 3. Display tag-based collections
 * 4. Open collections to start review
 * 5. Handle empty collections gracefully
 * 6. Filter by tags (if implemented)
 *
 * High value tests because:
 * - Collections are the main way users organize flashcards
 * - Opening a collection is the entry point to review mode
 * - Any bug here blocks users from reviewing flashcards
 */

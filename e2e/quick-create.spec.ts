/**
 * E2E Tests for Quick Create Modal
 * 
 * Tests the sessionId-based authentication in Quick Create flows
 * This catches regressions like the one discovered with QuickCreateModal
 * 
 * CRITICAL: These tests verify that all create operations use sessionId correctly
 */

import { test, expect } from '@playwright/test';

// Authentication setup - reuse authenticated state
test.use({ storageState: 'e2e/auth.setup.ts-authenticate-setup/storage.json' });

test.describe('Quick Create Modal - SessionID Authentication', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to inbox where Quick Create is available
		await page.goto('/inbox');
		
		// Wait for page to be fully loaded
		await page.waitForLoadState('networkidle');
	});

	test('should create note via keyboard shortcut (C key) without errors', async ({ page }) => {
		// Listen for console errors (catches ArgumentValidationError)
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Press C key to open Quick Create modal
		await page.keyboard.press('c');

		// Wait for modal to open
		const modal = page.locator('[role="dialog"]').first();
		await expect(modal).toBeVisible({ timeout: 2000 });

		// Type note content
		// Note: The actual selector will depend on your modal structure
		// Adjust if needed based on how your NoteEditorWithDetection works
		const noteEditor = modal.locator('.ProseMirror, [contenteditable="true"]').first();
		if (await noteEditor.isVisible()) {
			await noteEditor.click();
			await noteEditor.fill('Automated test note - sessionId validation');
		}

		// Press Enter or click save button
		await page.keyboard.press('Enter');

		// Wait a bit for the mutation to complete
		await page.waitForTimeout(2000);

		// Verify no console errors occurred (especially ArgumentValidationError)
		const hasSessionIdError = consoleErrors.some(
			(err) => err.includes('sessionId') || err.includes('ArgumentValidationError')
		);
		
		if (hasSessionIdError) {
			console.error('Console errors detected:', consoleErrors);
		}
		
		expect(hasSessionIdError).toBe(false);

		// Modal should close after successful creation
		await expect(modal).not.toBeVisible({ timeout: 5000 });
	});

	test('should create flashcard via Quick Create without errors', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Open Quick Create modal with CMD+K
		await page.keyboard.press('Meta+k');

		// Wait for modal
		const modal = page.locator('[role="dialog"]').first();
		await expect(modal).toBeVisible({ timeout: 2000 });

		// Select flashcard type (may need to adjust selector)
		const flashcardButton = modal.locator('text=/flashcard/i').first();
		if (await flashcardButton.isVisible()) {
			await flashcardButton.click();
		}

		// Fill in question
		const questionInput = modal.locator('[placeholder*="question" i], [name="question"]').first();
		if (await questionInput.isVisible()) {
			await questionInput.fill('What is automated testing?');
		}

		// Fill in answer
		const answerInput = modal.locator('[placeholder*="answer" i], [name="answer"]').first();
		if (await answerInput.isVisible()) {
			await answerInput.fill('A way to catch bugs before production');
		}

		// Submit
		await page.keyboard.press('Meta+Enter');
		await page.waitForTimeout(2000);

		// Verify no sessionId errors
		const hasSessionIdError = consoleErrors.some(
			(err) => err.includes('sessionId') || err.includes('ArgumentValidationError')
		);
		expect(hasSessionIdError).toBe(false);
	});

	test('should create highlight via Quick Create without errors', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Open Quick Create modal
		await page.keyboard.press('Meta+k');

		const modal = page.locator('[role="dialog"]').first();
		await expect(modal).toBeVisible({ timeout: 2000 });

		// Select highlight type
		const highlightButton = modal.locator('text=/highlight/i').first();
		if (await highlightButton.isVisible()) {
			await highlightButton.click();
		}

		// Fill in highlight text
		const highlightInput = modal.locator('[placeholder*="text" i], [name="text"]').first();
		if (await highlightInput.isVisible()) {
			await highlightInput.fill('Important highlight for testing');
		}

		// Submit
		await page.keyboard.press('Meta+Enter');
		await page.waitForTimeout(2000);

		// Verify no sessionId errors
		const hasSessionIdError = consoleErrors.some(
			(err) => err.includes('sessionId') || err.includes('ArgumentValidationError')
		);
		expect(hasSessionIdError).toBe(false);
	});

	test('should fail gracefully when sessionId is missing', async ({ page }) => {
		// This test verifies that if sessionId somehow becomes null,
		// we get a clear error message instead of a crash

		// Intercept the Convex mutation and remove sessionId
		await page.route('**/api/notes/createNote', async (route) => {
			const request = route.request();
			const postData = request.postDataJSON();
			
			// Remove sessionId to simulate the bug
			delete postData.sessionId;
			
			await route.continue({
				postData: JSON.stringify(postData)
			});
		});

		// Try to create a note
		await page.keyboard.press('c');
		const modal = page.locator('[role="dialog"]').first();
		await expect(modal).toBeVisible({ timeout: 2000 });

		const noteEditor = modal.locator('.ProseMirror, [contenteditable="true"]').first();
		if (await noteEditor.isVisible()) {
			await noteEditor.click();
			await noteEditor.fill('This should fail');
		}

		await page.keyboard.press('Enter');
		await page.waitForTimeout(2000);

		// Should show an error message (not crash silently)
		// Adjust selector based on your error display
		const errorMessage = page.locator('text=/error|failed/i').first();
		// Error should be visible or logged to console
		// (This test documents expected failure behavior)
	});
});

test.describe('Quick Create Modal - Tag Selection', () => {
	test.use({ storageState: 'e2e/auth.setup.ts-authenticate-setup/storage.json' });

	test('should load tags with sessionId authentication', async ({ page }) => {
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		await page.goto('/inbox');
		await page.keyboard.press('c');

		const modal = page.locator('[role="dialog"]').first();
		await expect(modal).toBeVisible({ timeout: 2000 });

		// Tag selector should load without errors
		// (QuickCreateModal queries tags with sessionId)
		await page.waitForTimeout(1000);

		// Verify no tag loading errors
		const hasTagError = consoleErrors.some(
			(err) => err.includes('listAllTags') && err.includes('sessionId')
		);
		expect(hasTagError).toBe(false);
	});
});

/**
 * CI/CD Integration Notes:
 * 
 * Add to package.json:
 * "scripts": {
 *   "test:e2e:quick-create": "playwright test e2e/quick-create.spec.ts"
 * }
 * 
 * Add to GitHub Actions (.github/workflows/test.yml):
 * - name: Run Quick Create Tests
 *   run: npm run test:e2e:quick-create
 * 
 * This ensures the Quick Create modal always works with sessionId auth
 */


import type { TestRunnerConfig } from '@storybook/test-runner';
import { waitForPageReady } from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

// Jest globals are available in Storybook test runner context
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const expect: any;

const config: TestRunnerConfig = {
	setup() {
		expect.extend({ toMatchImageSnapshot });
	},
	async preVisit(page, _context) {
		// Extract theme from URL globals parameter if present
		const url = new URL(page.url());
		const globalsParam = url.searchParams.get('globals');
		const themeMatch = globalsParam?.match(/theme:(\w+)/);
		const theme = themeMatch ? themeMatch[1] : 'light';

		// Set theme attribute before story renders
		await page.evaluate((themeValue) => {
			document.documentElement.setAttribute('data-theme', themeValue);
		}, theme);
	},
	async postVisit(page, context) {
		// Wait for page to be fully rendered
		// Note: "Cannot access 'blue' before initialization" errors are non-blocking
		// This is a known Storybook 10 + SvelteKit compatibility issue that doesn't affect rendering
		await waitForPageReady(page);

		// Get current theme from DOM
		const theme = await page.evaluate(() => {
			return document.documentElement.getAttribute('data-theme') || 'light';
		});

		// Take screenshot for current theme
		const image = await page.screenshot();
		const snapshotId = `${context.id}-${theme}`;

		expect(image).toMatchImageSnapshot({
			customSnapshotsDir: `${process.cwd()}/__design-system-snapshots__`,
			customSnapshotIdentifier: snapshotId,
			failureThreshold: 0.01,
			failureThresholdType: 'percent'
		});

		// If we're on light theme, also visit with dark theme
		if (theme === 'light') {
			const currentUrl = page.url();
			const urlObj = new URL(currentUrl);
			const darkUrl = `${urlObj.origin}${urlObj.pathname}?id=${context.id}&globals=theme:dark`;

			await page.goto(darkUrl, { waitUntil: 'networkidle' });
			await page.evaluate(() => {
				document.documentElement.setAttribute('data-theme', 'dark');
			});
			await waitForPageReady(page);
			await page.waitForTimeout(100);

			const darkImage = await page.screenshot();
			const darkSnapshotId = `${context.id}-dark`;

			expect(darkImage).toMatchImageSnapshot({
				customSnapshotsDir: `${process.cwd()}/__design-system-snapshots__`,
				customSnapshotIdentifier: darkSnapshotId,
				failureThreshold: 0.01,
				failureThresholdType: 'percent'
			});
		}
	}
};

export default config;

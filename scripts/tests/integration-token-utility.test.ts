/**
 * Integration Test: Token → Utility Generation
 *
 * Validates end-to-end: design-tokens-base.json → CSS vars → Utilities
 * Ensures every token generates the expected utility class.
 *
 * Run: npm run test:transforms
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

/**
 * Build tokens before running tests
 */
beforeAll(() => {
	try {
		execSync('npm run tokens:build', { cwd: ROOT_DIR, stdio: 'pipe' });
	} catch (error) {
		console.error('Failed to build tokens:', error);
		throw error;
	}
});

/**
 * Extract generated utilities from CSS files
 */
function getGeneratedUtilities(): Map<string, { property: string; value: string }> {
	const utilityRegex = /@utility\s+([\w-]+)\s*{\s*([^}]+)\s*}/g;
	const utilities = new Map<string, { property: string; value: string }>();

	const cssFiles = [
		'src/styles/utilities/spacing-utils.css',
		'src/styles/utilities/color-utils.css',
		'src/styles/utilities/component-utils.css',
		'src/styles/utilities/typography-utils.css',
		'src/styles/utilities/fonts-utils.css'
	];

	for (const file of cssFiles) {
		const filePath = join(ROOT_DIR, file);
		if (!existsSync(filePath)) continue;

		const content = readFileSync(filePath, 'utf-8');
		let match;
		while ((match = utilityRegex.exec(content)) !== null) {
			const utilityName = match[1];
			const utilityBody = match[2];
			// Extract CSS property and value
			const propertyMatch = utilityBody.match(/([\w-]+):\s*([^;]+);/);
			if (propertyMatch) {
				utilities.set(utilityName, {
					property: propertyMatch[1],
					value: propertyMatch[2].trim()
				});
			}
		}
	}

	return utilities;
}

/**
 * Extract CSS custom properties from token files
 */
function getCSSVariables(): Map<string, string> {
	const varRegex = /--([\w-]+):\s*([^;]+);/g;
	const variables = new Map<string, string>();

	const cssFiles = [
		'src/styles/tokens/spacing.css',
		'src/styles/tokens/colors.css',
		'src/styles/tokens/effects.css',
		'src/styles/tokens/typography.css',
		'src/styles/tokens/fonts.css'
	];

	for (const file of cssFiles) {
		const filePath = join(ROOT_DIR, file);
		if (!existsSync(filePath)) continue;

		const content = readFileSync(filePath, 'utf-8');
		let match;
		while ((match = varRegex.exec(content)) !== null) {
			variables.set(match[1], match[2].trim());
		}
	}

	return variables;
}

describe('Token → Utility Integration', () => {
	it('should generate px-button utility from spacing.button.x token', () => {
		const utilities = getGeneratedUtilities();
		const cssVars = getCSSVariables();

		// Verify CSS variable exists
		expect(cssVars.has('spacing-button-x')).toBe(true);

		// Verify utility exists
		expect(utilities.has('px-button')).toBe(true);

		// Verify utility references CSS variable
		const utility = utilities.get('px-button');
		expect(utility).toBeDefined();
		expect(utility?.value).toContain('var(--spacing-button-x)');
		expect(utility?.property).toBe('padding-inline');
	});

	it('should generate py-button utility from spacing.button.y token', () => {
		const utilities = getGeneratedUtilities();
		const cssVars = getCSSVariables();

		expect(cssVars.has('spacing-button-y')).toBe(true);
		expect(utilities.has('py-button')).toBe(true);

		const utility = utilities.get('py-button');
		expect(utility?.value).toContain('var(--spacing-button-y)');
		expect(utility?.property).toBe('padding-block');
	});

	it('should generate rounded-button utility from borderRadius.button token', () => {
		const utilities = getGeneratedUtilities();
		const cssVars = getCSSVariables();

		expect(cssVars.has('borderRadius-button')).toBe(true);
		expect(utilities.has('rounded-button')).toBe(true);

		const utility = utilities.get('rounded-button');
		expect(utility?.value).toContain('var(--borderRadius-button)');
		expect(utility?.property).toBe('border-radius');
	});

	it('should have consistent naming: tokens with -x suffix generate px- utilities', () => {
		const utilities = getGeneratedUtilities();
		const cssVars = getCSSVariables();

		// Find all spacing tokens ending with -x
		const xTokens = Array.from(cssVars.keys()).filter(
			(key) => key.startsWith('spacing-') && key.endsWith('-x')
		);

		for (const tokenName of xTokens) {
			// Expected utility: px-{name without spacing- and -x}
			const baseName = tokenName.replace('spacing-', '').replace('-x', '');
			const expectedUtility = `px-${baseName}`;

			expect(utilities.has(expectedUtility)).toBe(true);
		}
	});

	it('should have consistent naming: tokens with -y suffix generate py- utilities', () => {
		const utilities = getGeneratedUtilities();
		const cssVars = getCSSVariables();

		const yTokens = Array.from(cssVars.keys()).filter(
			(key) => key.startsWith('spacing-') && key.endsWith('-y')
		);

		for (const tokenName of yTokens) {
			const baseName = tokenName.replace('spacing-', '').replace('-y', '');
			const expectedUtility = `py-${baseName}`;

			expect(utilities.has(expectedUtility)).toBe(true);
		}
	});

	it('should reference CSS variables, not hardcoded values', () => {
		const utilities = getGeneratedUtilities();

		// All utilities should reference CSS variables, not hardcoded values
		for (const [utilityName, utility] of utilities.entries()) {
			// Skip base utilities that might have hardcoded values
			if (utilityName.match(/^(px|py|p|m|gap)-\d+$/)) {
				continue;
			}

			// Semantic utilities MUST reference CSS variables
			expect(utility.value).toMatch(/var\(--[\w-]+\)/);
		}
	});
});

/**
 * Transform Logic Unit Tests
 *
 * Tests transform functions to ensure:
 * - Naming conventions are consistent (camelCase → kebab-case)
 * - Suffix handling (-x/-y) works correctly
 * - Edge cases are handled
 * - Transform logic matches actual generation
 *
 * Run: npm run test:transforms
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

// Import transform logic (we'll need to export it from transforms.js)
// For now, we'll test the logic by running the actual transform
import { execSync } from 'child_process';

/**
 * Run token build and extract generated utilities
 */
function getGeneratedUtilities(): Set<string> {
	// Run token build
	execSync('npm run tokens:build', { cwd: ROOT_DIR, stdio: 'pipe' });

	// Extract utilities from generated CSS
	const utilityRegex = /@utility\s+([\w-]+)\s*{/g;
	const utilities = new Set<string>();

	const cssFiles = [
		'src/styles/utilities/spacing-utils.css',
		'src/styles/utilities/color-utils.css',
		'src/styles/utilities/component-utils.css',
		'src/styles/utilities/typography-utils.css',
		'src/styles/utilities/fonts-utils.css'
	];

	for (const file of cssFiles) {
		const filePath = join(ROOT_DIR, file);
		try {
			const content = readFileSync(filePath, 'utf-8');
			let match;
			while ((match = utilityRegex.exec(content)) !== null) {
				utilities.add(match[1]);
			}
		} catch {
			// File doesn't exist, skip
		}
	}

	return utilities;
}

/**
 * Extract tokens from design-tokens-base.json
 */
function getTokens(): Array<{ path: string[]; name: string; type: string }> {
	const tokensPath = join(ROOT_DIR, 'design-tokens-base.json');
	const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));

	const extracted: Array<{ path: string[]; name: string; type: string }> = [];

	function traverse(obj: any, path: string[] = []): void {
		for (const [key, value] of Object.entries(obj)) {
			if (value && typeof value === 'object' && '$value' in value) {
				// This is a token
				const tokenPath = [...path, key];
				extracted.push({
					path: tokenPath,
					name: tokenPath.join('.'),
					type: (value as any).$type || 'unknown'
				});
			} else if (value && typeof value === 'object') {
				// Continue traversing
				traverse(value, [...path, key]);
			}
		}
	}

	traverse(tokens);
	return extracted;
}

describe('Transform Logic Validation', () => {
	describe('Naming Convention Consistency', () => {
		it('should handle camelCase token paths correctly', () => {
			// Test: borderRadius.button → rounded-button utility
			const tokens = getTokens();
			const utilities = getGeneratedUtilities();

			// Find borderRadius tokens
			const borderRadiusTokens = tokens.filter((t) => t.path.join('.').includes('borderRadius'));

			// Each borderRadius token should generate a rounded-* utility
			for (const token of borderRadiusTokens) {
				const expectedUtility = `rounded-${token.path[token.path.length - 1]}`;
				expect(utilities.has(expectedUtility)).toBe(true);
			}
		});

		it('should handle spacing-x/y suffixes correctly', () => {
			const tokens = getTokens();
			const utilities = getGeneratedUtilities();

			// Find spacing tokens with -x suffix
			const spacingXTokens = tokens.filter(
				(t) => t.path.join('-').includes('spacing') && t.path.join('-').includes('x')
			);

			for (const token of spacingXTokens) {
				const path = token.path.join('-');
				const spacingName = path.replace('spacing-', '');
				if (spacingName.includes('-x')) {
					const expectedUtility = `px-${spacingName.replace('-x', '')}`;
					expect(utilities.has(expectedUtility)).toBe(true);
				}
			}
		});

		it('should handle spacing-y suffixes correctly', () => {
			const tokens = getTokens();
			const utilities = getGeneratedUtilities();

			// Find spacing tokens with -y suffix
			const spacingYTokens = tokens.filter(
				(t) => t.path.join('-').includes('spacing') && t.path.join('-').includes('y')
			);

			for (const token of spacingYTokens) {
				const path = token.path.join('-');
				const spacingName = path.replace('spacing-', '');
				if (spacingName.includes('-y')) {
					const expectedUtility = `py-${spacingName.replace('-y', '')}`;
					expect(utilities.has(expectedUtility)).toBe(true);
				}
			}
		});
	});

	describe('Transform Edge Cases', () => {
		it('should handle nested token paths correctly', () => {
			const tokens = getTokens();
			const utilities = getGeneratedUtilities();

			// Test nested paths like spacing.card.padding.x
			const nestedTokens = tokens.filter((t) => t.path.length > 2);

			for (const token of nestedTokens) {
				const path = token.path.join('-');
				// Verify the path generates a valid utility name (no double hyphens, etc.)
				expect(path).not.toMatch(/--/); // No double hyphens
			}
		});

		it('should not generate utilities for base scale tokens', () => {
			const utilities = getGeneratedUtilities();

			// Base spacing tokens (0, 1, 2, etc.) should NOT generate utilities
			const baseSpacingUtilities = Array.from(utilities).filter((u) =>
				/^(px|py|p|m|gap)-\d+$/.test(u)
			);

			expect(baseSpacingUtilities.length).toBe(0);
		});
	});

	describe('Critical Utilities Exist', () => {
		it('should generate px-button utility', () => {
			const utilities = getGeneratedUtilities();
			expect(utilities.has('px-button')).toBe(true);
		});

		it('should generate py-button utility', () => {
			const utilities = getGeneratedUtilities();
			expect(utilities.has('py-button')).toBe(true);
		});

		it('should generate rounded-button utility', () => {
			const utilities = getGeneratedUtilities();
			expect(utilities.has('rounded-button')).toBe(true);
		});
	});
});

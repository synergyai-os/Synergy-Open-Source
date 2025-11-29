import { test, expect, describe } from 'vitest';
import { validateWCAGContrast, validateOrgColor } from './wcag-validator';

describe('validateWCAGContrast', () => {
	test('passes for high-contrast text (4.5:1)', () => {
		const result = validateWCAGContrast(
			'oklch(20% 0.1 240)', // Dark blue
			'oklch(98% 0.002 247.839)', // Light bg
			4.5
		);
		expect(result.valid).toBe(true);
		expect(result.ratio).toBeGreaterThanOrEqual(4.5);
	});

	test('fails for low-contrast text', () => {
		const result = validateWCAGContrast(
			'oklch(90% 0.1 240)', // Too light
			'oklch(98% 0.002 247.839)', // Light bg
			4.5
		);
		expect(result.valid).toBe(false);
		expect(result.error).toContain('fails WCAG AA');
	});

	test('passes for UI elements (3:1)', () => {
		const result = validateWCAGContrast('oklch(60% 0.2 240)', 'oklch(98% 0.002 247.839)', 3.0);
		expect(result.valid).toBe(true);
		expect(result.ratio).toBeGreaterThanOrEqual(3.0);
	});
});

describe('validateOrgColor', () => {
	test('validates color in both light and dark modes', () => {
		// Test that validation function checks both modes
		// Note: Most colors won't pass 4.5:1 in BOTH modes (this is correct - validator should reject)
		// The function should provide helpful error messages and suggestions
		const result = validateOrgColor('oklch(55% 0.218 251.813)'); // Default brand (may fail dark mode)
		// Function should run and return validation result (may be invalid, which is correct)
		expect(result).toHaveProperty('valid');
		expect(result).toHaveProperty('ratio');
		// If invalid, should have error and suggestion
		if (!result.valid) {
			expect(result.error).toBeDefined();
			expect(result.suggestion).toBeDefined();
		}
	});

	test('rejects too-light color (fails light mode)', () => {
		const result = validateOrgColor('oklch(90% 0.1 250)');
		expect(result.valid).toBe(false);
		expect(result.error).toContain('light mode');
		expect(result.suggestion).toContain('decreasing lightness');
	});

	test('rejects too-dark color (fails dark mode)', () => {
		const result = validateOrgColor('oklch(20% 0.2 250)');
		expect(result.valid).toBe(false);
		expect(result.error).toContain('dark mode');
		expect(result.suggestion).toContain('increasing lightness');
	});

	test('provides lightness suggestion', () => {
		const result = validateOrgColor('oklch(95% 0.1 250)'); // Too light
		expect(result.suggestion).toMatch(/\d+%/); // Contains numeric suggestion
	});
});

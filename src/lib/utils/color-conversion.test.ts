import { test, expect, describe } from 'vitest';
import { hexToOKLCH, oklchToHex, isValidOKLCH, generateHoverColor } from './color-conversion';

describe('hexToOKLCH', () => {
	test('converts red (#FF0000)', () => {
		const result = hexToOKLCH('#FF0000');
		expect(result).toMatch(/^oklch\([\d.]+%\s+[\d.]+\s+[\d.]+\)$/);
		expect(result).toContain('62.8'); // Approximate lightness for red
	});

	test('converts blue (#0000FF)', () => {
		const result = hexToOKLCH('#0000FF');
		expect(result).toMatch(/^oklch\([\d.]+%\s+[\d.]+\s+[\d.]+\)$/);
	});

	test('converts white (#FFFFFF)', () => {
		const result = hexToOKLCH('#FFFFFF');
		expect(result).toMatch(/^oklch\([\d.]+%\s+[\d.]+\s+[\d.]+\)$/);
		expect(result).toContain('100.0'); // White should be ~100% lightness
	});

	test('converts black (#000000)', () => {
		const result = hexToOKLCH('#000000');
		expect(result).toMatch(/^oklch\([\d.]+%\s+[\d.]+\s+[\d.]+\)$/);
		expect(result).toContain('0.0'); // Black should be ~0% lightness
	});

	test('throws on invalid hex', () => {
		expect(() => hexToOKLCH('not-a-color')).toThrow('Invalid hex color');
	});
});

describe('oklchToHex', () => {
	test('converts red back to hex', () => {
		const result = oklchToHex('oklch(62.8% 0.258 29.2)');
		expect(result).toMatch(/^#[0-9a-f]{6}$/i);
		expect(result.toLowerCase()).toBe('#ff0000');
	});

	test('converts blue back to hex', () => {
		const result = oklchToHex('oklch(45.2% 0.313 264.1)');
		expect(result).toMatch(/^#[0-9a-f]{6}$/i);
		// Allow slight rounding differences (culori may return #0100ff vs #0000ff)
		expect(result.toLowerCase()).toMatch(/^#0[01]00ff$/);
	});

	test('throws on invalid OKLCH format', () => {
		expect(() => oklchToHex('not-oklch')).toThrow('Invalid OKLCH format');
	});
});

describe('isValidOKLCH', () => {
	test('validates correct format', () => {
		expect(isValidOKLCH('oklch(60% 0.25 240)')).toBe(true);
	});

	test('rejects hex format', () => {
		expect(isValidOKLCH('#FF0000')).toBe(false);
	});

	test('rejects malformed OKLCH', () => {
		expect(isValidOKLCH('oklch(60% 0.25)')).toBe(false); // Missing hue
	});

	test('rejects empty string', () => {
		expect(isValidOKLCH('')).toBe(false);
	});
});

describe('generateHoverColor', () => {
	test('darkens by 10% (lightness - 10)', () => {
		const result = generateHoverColor('oklch(60% 0.25 240)');
		expect(result).toBe('oklch(50.0% 0.25 240)');
	});

	test('does not go below 0% lightness', () => {
		const result = generateHoverColor('oklch(5% 0.25 240)');
		expect(result).toBe('oklch(0.0% 0.25 240)');
	});

	test('throws on invalid OKLCH', () => {
		expect(() => generateHoverColor('#FF0000')).toThrow('Invalid OKLCH format');
	});
});


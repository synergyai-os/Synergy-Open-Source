/**
 * Circle Slug Tests
 *
 * Unit tests for slug generation functions.
 * These tests verify the pure function behavior without database dependencies.
 *
 * SYOS-696: Tests for extracted circle slug utilities
 */

import { describe, test, expect } from 'vitest';
import { slugifyName, ensureUniqueSlug } from './slug';

describe('slugifyName', () => {
	test('converts name to lowercase', () => {
		expect(slugifyName('Engineering Team')).toBe('engineering-team');
		expect(slugifyName('PRODUCT')).toBe('product');
	});

	test('replaces spaces with hyphens', () => {
		expect(slugifyName('Engineering Team')).toBe('engineering-team');
		expect(slugifyName('Product & Design')).toBe('product-design');
	});

	test('replaces special characters with hyphens', () => {
		expect(slugifyName('Product & Design')).toBe('product-design');
		expect(slugifyName('Engineering@Team')).toBe('engineering-team');
		expect(slugifyName('Product (Beta)')).toBe('product-beta');
	});

	test('removes leading and trailing hyphens', () => {
		expect(slugifyName('-Engineering-')).toBe('engineering');
		expect(slugifyName('---Product---')).toBe('product');
	});

	test('limits to 48 characters', () => {
		const longName = 'a'.repeat(100);
		const slug = slugifyName(longName);
		expect(slug.length).toBeLessThanOrEqual(48);
		expect(slug).toBe('a'.repeat(48));
	});

	test('trims whitespace', () => {
		expect(slugifyName('  Engineering  ')).toBe('engineering');
		expect(slugifyName('\tProduct\n')).toBe('product');
	});

	test('defaults to circle if empty after processing', () => {
		expect(slugifyName('')).toBe('circle');
		expect(slugifyName('   ')).toBe('circle');
		expect(slugifyName('---')).toBe('circle');
		expect(slugifyName('!!!')).toBe('circle');
	});

	test('handles multiple consecutive special characters', () => {
		expect(slugifyName('Product & Design & Engineering')).toBe('product-design-engineering');
		expect(slugifyName('Team---Name')).toBe('team-name');
	});

	test('preserves alphanumeric characters', () => {
		expect(slugifyName('Team123')).toBe('team123');
		expect(slugifyName('Product-v2')).toBe('product-v2');
	});

	test('handles unicode characters', () => {
		// Unicode characters should be removed/replaced
		expect(slugifyName('Product Café')).toBe('product-caf');
		expect(slugifyName('Team 团队')).toBe('team');
	});
});

describe('ensureUniqueSlug', () => {
	test('returns base slug if not in existing set', () => {
		const existing = new Set<string>(['other-slug']);
		expect(ensureUniqueSlug('engineering', existing)).toBe('engineering');
	});

	test('appends -1 if base slug exists', () => {
		const existing = new Set<string>(['engineering']);
		expect(ensureUniqueSlug('engineering', existing)).toBe('engineering-1');
	});

	test('appends -2 if base and -1 exist', () => {
		const existing = new Set<string>(['engineering', 'engineering-1']);
		expect(ensureUniqueSlug('engineering', existing)).toBe('engineering-2');
	});

	test('finds next available suffix', () => {
		const existing = new Set<string>(['engineering', 'engineering-1', 'engineering-3']);
		expect(ensureUniqueSlug('engineering', existing)).toBe('engineering-2');
	});

	test('handles gaps in numbering', () => {
		const existing = new Set<string>(['engineering', 'engineering-1', 'engineering-5']);
		expect(ensureUniqueSlug('engineering', existing)).toBe('engineering-2');
	});

	test('handles empty existing set', () => {
		const existing = new Set<string>();
		expect(ensureUniqueSlug('engineering', existing)).toBe('engineering');
	});

	test('handles large suffix numbers', () => {
		const existing = new Set<string>(['engineering', 'engineering-1', 'engineering-2']);
		expect(ensureUniqueSlug('engineering', existing)).toBe('engineering-3');
	});

	test('works with different base slugs', () => {
		const existing = new Set<string>(['product', 'product-1']);
		expect(ensureUniqueSlug('engineering', existing)).toBe('engineering');
		expect(ensureUniqueSlug('product', existing)).toBe('product-2');
	});
});

describe('Slug Edge Cases', () => {
	test('slugifyName handles edge cases correctly', () => {
		expect(slugifyName('a')).toBe('a');
		expect(slugifyName('A')).toBe('a');
		expect(slugifyName('123')).toBe('123');
		expect(slugifyName('a'.repeat(50))).toBe('a'.repeat(48));
	});

	test('ensureUniqueSlug handles edge cases correctly', () => {
		const existing = new Set<string>(['a', 'a-1', 'a-2']);
		expect(ensureUniqueSlug('a', existing)).toBe('a-3');
	});
});

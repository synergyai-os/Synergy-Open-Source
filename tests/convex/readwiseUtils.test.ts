/**
 * Test: parseAuthorString
 *
 * WHY THIS TEST MATTERS:
 * - This function is CRITICAL to Readwise sync - if it breaks, highlights won't match sources correctly
 * - Handles complex author string formats from Readwise API
 * - If broken, causes duplicate sources or missing metadata in inbox
 * - Pure function = easy to test, fast to run
 *
 * This is the ONE test that gives confidence the sync workflow won't break.
 */

import { describe, it, expect } from 'vitest';
import { parseAuthorString } from '../../convex/features/readwise/utils';

describe('parseAuthorString', () => {
	it('handles single author', () => {
		const result = parseAuthorString('John Doe');
		expect(result).toEqual(['John Doe']);
	});

	it('handles comma-separated authors', () => {
		const result = parseAuthorString('John Doe, Jane Smith');
		expect(result).toEqual(['John Doe', 'Jane Smith']);
	});

	it('handles "and" separator', () => {
		const result = parseAuthorString('John Doe and Jane Smith');
		expect(result).toEqual(['John Doe', 'Jane Smith']);
	});

	it('handles comma with "and"', () => {
		const result = parseAuthorString('John Doe, Jane Smith, and Bob Jones');
		expect(result).toEqual(['John Doe', 'Jane Smith', 'Bob Jones']);
	});

	it('handles comma followed by "and"', () => {
		const result = parseAuthorString('John Doe, and Jane Smith');
		expect(result).toEqual(['John Doe', 'Jane Smith']);
	});

	it('handles multiple authors with commas', () => {
		const result = parseAuthorString('John Doe, Jane Smith, Bob Jones, Alice Brown');
		expect(result).toEqual(['John Doe', 'Jane Smith', 'Bob Jones', 'Alice Brown']);
	});

	it('handles empty string', () => {
		const result = parseAuthorString('');
		expect(result).toEqual([]);
	});

	it('handles whitespace-only string', () => {
		const result = parseAuthorString('   ');
		expect(result).toEqual([]);
	});

	it('handles null/undefined (edge case)', () => {
		// @ts-expect-error - testing edge case
		expect(parseAuthorString(null)).toEqual([]);
		// @ts-expect-error - testing edge case
		expect(parseAuthorString(undefined)).toEqual([]);
	});

	it('trims whitespace from author names', () => {
		const result = parseAuthorString('  John Doe  ,  Jane Smith  ');
		expect(result).toEqual(['John Doe', 'Jane Smith']);
	});

	it('handles single author with trailing comma (edge case)', () => {
		const result = parseAuthorString('John Doe,');
		expect(result).toEqual(['John Doe']);
	});

	it('handles real-world Readwise format: "Author Name"', () => {
		// Common format from Readwise API
		const result = parseAuthorString('Cal Newport');
		expect(result).toEqual(['Cal Newport']);
	});

	it('handles real-world Readwise format: "Author 1, Author 2"', () => {
		// Common format from Readwise API
		const result = parseAuthorString('Tim Ferriss, James Clear');
		expect(result).toEqual(['Tim Ferriss', 'James Clear']);
	});

	it('handles real-world Readwise format: "Author 1 and Author 2"', () => {
		// Common format from Readwise API
		const result = parseAuthorString('Ryan Holiday and Stephen Hanselman');
		expect(result).toEqual(['Ryan Holiday', 'Stephen Hanselman']);
	});
});

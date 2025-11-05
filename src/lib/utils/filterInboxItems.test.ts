/**
 * Example Test: Filtering Inbox Items
 * 
 * This demonstrates the testing strategy from dev-docs/testing-strategy.md
 * 
 * What we're testing: Business logic (filtering by type)
 * Why: This logic is critical - if filtering breaks, users can't find items
 * How: Pure function test (simple, fast, reliable)
 */

import { describe, it, expect } from 'vitest';

// Simple utility function to filter inbox items by type
// This is the kind of logic you SHOULD test
export function filterByType<T extends { type: string }>(
	items: T[],
	type: string
): T[] {
	return items.filter((item) => item.type === type);
}

// Example inbox item type (simplified for testing)
interface InboxItem {
	id: string;
	type: 'readwise_highlight' | 'photo_note' | 'manual_text';
	title: string;
}

describe('filterByType', () => {
	it('filters items by type correctly', () => {
		// ARRANGE: Set up test data
		const items: InboxItem[] = [
			{ id: '1', type: 'readwise_highlight', title: 'Highlight 1' },
			{ id: '2', type: 'photo_note', title: 'Photo 1' },
			{ id: '3', type: 'readwise_highlight', title: 'Highlight 2' }
		];

		// ACT: Do the thing
		const result = filterByType(items, 'readwise_highlight');

		// ASSERT: Check the result
		expect(result).toHaveLength(2);
		expect(result[0].id).toBe('1');
		expect(result[1].id).toBe('3');
	});

	it('returns empty array when no matches', () => {
		const items: InboxItem[] = [
			{ id: '1', type: 'readwise_highlight', title: 'Highlight 1' }
		];

		const result = filterByType(items, 'photo_note');

		expect(result).toHaveLength(0);
	});

	it('returns all items when type matches all', () => {
		const items: InboxItem[] = [
			{ id: '1', type: 'readwise_highlight', title: 'Highlight 1' },
			{ id: '2', type: 'readwise_highlight', title: 'Highlight 2' }
		];

		const result = filterByType(items, 'readwise_highlight');

		expect(result).toHaveLength(2);
		expect(result).toEqual(items);
	});

	it('handles empty array', () => {
		const items: InboxItem[] = [];

		const result = filterByType(items, 'readwise_highlight');

		expect(result).toHaveLength(0);
	});
});


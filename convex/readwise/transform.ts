import { parseAuthorString } from '../readwiseUtils';
import type { ReadwiseHighlight } from '../../src/lib/types/readwise';

export function reorderHighlightsByUpdated(results: ReadwiseHighlight[]): ReadwiseHighlight[] {
	return [...results].sort((a, b) => {
		const dateA = new Date(a.updated || a.highlighted_at || 0).getTime();
		const dateB = new Date(b.updated || b.highlighted_at || 0).getTime();
		return dateB - dateA;
	});
}

export function parseAuthorNames(authorField: string): string[] {
	return parseAuthorString(authorField);
}

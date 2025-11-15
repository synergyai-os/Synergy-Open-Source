/**
 * Readwise API Types
 *
 * Type definitions for Readwise API responses.
 * Documentation: https://readwise.io/api_deets
 */

/**
 * Readwise tag structure (from highlights)
 */
export type ReadwiseHighlightTag = {
	id: number;
	name: string;
};

/**
 * Readwise tag structure (from sources/books)
 */
export type ReadwiseSourceTag = {
	id: number;
	name: string;
	user_book: number;
};

/**
 * Readwise highlight response
 */
export type ReadwiseHighlight = {
	id: number;
	book_id: number;
	text: string;
	location?: number;
	location_type?: string;
	highlighted_at?: string; // ISO 8601
	updated: string; // ISO 8601
	url: string;
	note: string;
	color: string;
	tags: ReadwiseHighlightTag[];
};

/**
 * Readwise source/book response
 */
export type ReadwiseSource = {
	id: number;
	title: string;
	author: string;
	category: string; // "books", "articles", "tweets", etc.
	source: string; // "kindle", "reader", etc.
	source_url: string | null;
	cover_image_url: string;
	highlights_url: string;
	num_highlights: number;
	last_highlight_at: string | null; // ISO 8601
	asin: string | null;
	tags: ReadwiseSourceTag[];
	document_note: string;
	updated: string; // ISO 8601
};

/**
 * Readwise paginated response wrapper
 */
export type ReadwisePaginatedResponse<T> = {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
};

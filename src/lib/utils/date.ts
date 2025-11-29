/**
 * Date formatting utilities
 * Shared date formatting functions used across components
 *
 * Uses global locale defaults: day/month/year format, Monday-first week
 * See: src/lib/utils/locale.ts
 */

import { DEFAULT_LOCALE, DEFAULT_DATETIME_FORMAT, DEFAULT_SHORT_DATE_FORMAT } from './locale';

/**
 * Format a timestamp as a relative date string (e.g., "4d", "1w", "1mo")
 * Compact format for inbox cards and list views
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative date string (e.g., "Today", "1d", "4d", "1w", "1mo", "1y")
 */
export function formatRelativeDate(timestamp?: number): string {
	if (!timestamp) return '';
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return '1d';
	if (diffDays < 7) return `${diffDays}d`;
	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7);
		return `${weeks}w`;
	}
	if (diffDays < 365) {
		const months = Math.floor(diffDays / 30);
		return `${months}mo`;
	}
	const years = Math.floor(diffDays / 365);
	return `${years}y`;
}

/**
 * Format a timestamp as a human-readable relative date string
 * Full format for detail views (e.g., "Today", "Yesterday", "4 days ago")
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Human-readable relative date string
 */
export function formatRelativeDateLong(timestamp?: number): string {
	if (!timestamp) return '';
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return `${diffDays} days ago`;
	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7);
		return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
	}
	if (diffDays < 365) {
		const months = Math.floor(diffDays / 30);
		return `${months} ${months === 1 ? 'month' : 'months'} ago`;
	}
	const years = Math.floor(diffDays / 365);
	return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format a timestamp as a locale-aware date string
 * Full date format for detail views (e.g., "15 January 2024 at 2:30 PM")
 * Uses day/month/year format (en-GB locale)
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param locale - Locale string (default: 'en-GB' for day/month/year format)
 * @returns Formatted date string
 */
export function formatDate(timestamp?: number, locale = DEFAULT_LOCALE): string {
	if (!timestamp) return '';
	const date = new Date(timestamp);
	return date.toLocaleDateString(locale, DEFAULT_DATETIME_FORMAT);
}

/**
 * Format a timestamp as a short date string (e.g., "15 Jan 2024")
 * Uses day/month/year format (en-GB locale)
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param locale - Locale string (default: 'en-GB' for day/month/year format)
 * @returns Formatted short date string
 */
export function formatShortDate(timestamp?: number, locale = DEFAULT_LOCALE): string {
	if (!timestamp) return '';
	const date = new Date(timestamp);
	return date.toLocaleDateString(locale, DEFAULT_SHORT_DATE_FORMAT);
}

/**
 * Readwise Data Normalization Utilities
 * 
 * Helper functions for normalizing data from Readwise API
 * (author names, tag names, dates, etc.)
 */

/**
 * Normalize an author name for consistent matching
 * - Trim whitespace
 * - Convert to lowercase
 * - Remove extra spaces
 */
export function normalizeAuthorName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Parse a comma-separated author string into an array of normalized author names
 * Handles formats like:
 * - "John Doe"
 * - "John Doe, Jane Smith"
 * - "John Doe, Jane Smith, and Bob Jones"
 * - "John Doe and Jane Smith"
 */
export function parseAuthorString(authors: string): string[] {
  if (!authors || !authors.trim()) {
    return [];
  }

  // Split by comma and "and"
  const authorList = authors
    .split(/,\s*(?:and\s+)?/i) // Split on comma, optionally followed by "and"
    .map((author) => author.trim())
    .filter((author) => author.length > 0);

  // If no commas, try splitting on "and"
  if (authorList.length === 1) {
    const parts = authors.split(/\s+and\s+/i);
    if (parts.length > 1) {
      return parts.map((part) => part.trim()).filter((part) => part.length > 0);
    }
  }

  return authorList;
}

/**
 * Parse an ISO 8601 date string to a timestamp (milliseconds since epoch)
 * Returns undefined if date is null/undefined/empty
 */
export function parseISODate(dateStr: string | null | undefined): number | undefined {
  if (!dateStr) {
    return undefined;
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date.getTime();
  } catch {
    return undefined;
  }
}

/**
 * Normalize a tag name for consistent matching
 * - Trim whitespace
 * - Convert to lowercase
 * - Remove extra spaces
 */
export function normalizeTagName(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, " ");
}


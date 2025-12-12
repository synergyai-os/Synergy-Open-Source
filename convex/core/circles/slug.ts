/**
 * Circle Slug Utilities
 *
 * Pure functions for generating and managing circle slugs.
 * These functions have no side effects and are easily testable in isolation.
 *
 * SYOS-696: Extracted from circles.ts to enable isolated testing
 * and clear separation of concerns.
 */

/**
 * Convert a circle name to a URL-friendly slug
 *
 * Rules:
 * - Trim whitespace
 * - Convert to lowercase
 * - Replace non-alphanumeric characters with hyphens
 * - Remove leading/trailing hyphens
 * - Limit to 48 characters
 * - Default to 'circle' if result is empty
 *
 * @param name - The circle name to slugify
 * @returns URL-friendly slug
 *
 * @example
 * slugifyName('Engineering Team') // 'engineering-team'
 * slugifyName('Product & Design') // 'product-design'
 * slugifyName('   ') // 'circle'
 */
export function slugifyName(name: string): string {
	return (
		name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '')
			.slice(0, 48) || 'circle'
	);
}

/**
 * Generate a unique slug from a base slug and existing slugs
 *
 * Pure function that determines the next available slug by appending
 * a numeric suffix if the base slug already exists.
 *
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Set of existing slugs to check against
 * @returns Unique slug (baseSlug or baseSlug-N)
 *
 * @example
 * ensureUniqueSlug('engineering', new Set(['engineering', 'engineering-1']))
 * // Returns 'engineering-2'
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: Set<string>): string {
	let slug = baseSlug;
	let suffix = 1;

	while (existingSlugs.has(slug)) {
		slug = `${baseSlug}-${suffix++}`;
	}

	return slug;
}

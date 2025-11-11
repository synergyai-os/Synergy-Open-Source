/**
 * Tag System Constants
 *
 * Centralized constants for tag colors, validation, and configuration
 */

export interface TagColor {
	name: string;
	hex: string;
}

/**
 * Predefined color palette for tags (inspired by Linear's label system)
 * Colors are chosen for good contrast in both light and dark modes
 */
export const TAG_COLORS: TagColor[] = [
	{ name: 'Grey', hex: '#94a3b8' }, // slate-400
	{ name: 'Dark Grey', hex: '#64748b' }, // slate-500
	{ name: 'Purple', hex: '#a78bfa' }, // violet-400
	{ name: 'Teal', hex: '#2dd4bf' }, // teal-400
	{ name: 'Green', hex: '#4ade80' }, // green-400
	{ name: 'Yellow', hex: '#facc15' }, // yellow-400
	{ name: 'Orange', hex: '#fb923c' }, // orange-400
	{ name: 'Pink', hex: '#f472b6' }, // pink-400
	{ name: 'Red', hex: '#f87171' } // red-400
];

/**
 * Default tag color (first color in palette)
 */
export const DEFAULT_TAG_COLOR = TAG_COLORS[0].hex;

/**
 * Maximum length for tag names (in characters)
 */
export const MAX_TAG_NAME_LENGTH = 50;

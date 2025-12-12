/**
 * DTCG Format Parser for Style Dictionary
 *
 * Parses DTCG 1.0.0 format JSON and converts to Style Dictionary token format.
 * Handles nested structures and flattens them into token paths.
 */

import fs from 'fs';

/**
 * Recursively flatten DTCG nested structure into Style Dictionary tokens
 *
 * @param {object} obj - DTCG token object
 * @param {string[]} pathParts - Current path parts (e.g., ['spacing', 'chart', 'container'])
 * @param {string} type - Token type from $type property
 * @param {StyleDictionary.Token[]} tokens - Accumulated tokens array
 */
function flattenDTCG(obj, pathParts = [], type = null, tokens = []) {
	// Skip null/undefined
	if (!obj || typeof obj !== 'object') {
		return tokens;
	}

	// Skip schema property
	if (obj.$schema) {
		return tokens;
	}

	// Check if this is a token object (has $value) - this is a leaf node
	if (obj.$value !== undefined) {
		const token = {
			name: pathParts.join('.'),
			path: pathParts,
			value: obj.$value,
			type: type || inferType(pathParts),
			description: obj.$description || '',
			$description: obj.$description,
			original: obj
		};
		tokens.push(token);
		return tokens;
	}

	// Check if this object has a $type property (type definition for group)
	// This sets the type for all child tokens
	if (obj.$type !== undefined) {
		type = obj.$type;
	}

	// Recursively process nested objects
	for (const [key, value] of Object.entries(obj)) {
		// Skip special properties (already handled $schema and $type above)
		if (key.startsWith('$')) {
			continue;
		}

		// Recursively process nested structure
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			flattenDTCG(value, [...pathParts, key], type, tokens);
		}
	}

	return tokens;
}

/**
 * Infer token type from path
 */
function inferType(pathParts) {
	const firstPart = pathParts[0];

	if (firstPart === 'spacing') return 'dimension';
	if (firstPart === 'color') return 'color';
	if (firstPart === 'typography') {
		if (pathParts.includes('fontSize')) return 'dimension';
		if (pathParts.includes('fontWeight')) return 'fontWeight';
		if (pathParts.includes('lineHeight')) return 'number';
		if (pathParts.includes('letterSpacing')) return 'dimension';
		return 'dimension';
	}
	if (firstPart === 'fonts') return 'fontFamily';
	if (firstPart === 'shadow') return 'shadow';
	if (firstPart === 'borderRadius') return 'dimension';
	if (firstPart === 'size') return 'dimension';
	if (firstPart === 'transition') return 'other';
	if (firstPart === 'zIndex') return 'number';

	return 'other';
}

/**
 * Parse DTCG JSON file and return Style Dictionary tokens
 */
function parseDTCG(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	const dtcg = JSON.parse(content);

	const tokens = [];

	// Process each category (spacing, color, typography, etc.)
	for (const [category, categoryObj] of Object.entries(dtcg)) {
		// Skip schema
		if (category === '$schema') {
			continue;
		}

		// Flatten this category
		flattenDTCG(categoryObj, [category], null, tokens);
	}

	return tokens;
}

export { parseDTCG, flattenDTCG };

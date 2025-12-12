/**
 * Pre-process DTCG format to Style Dictionary format
 *
 * Converts design-tokens-base.json and design-tokens-semantic.json (DTCG) to Style Dictionary-compatible JSON
 * that can be used as source.
 *
 * Style Dictionary expects nested objects matching the token path structure.
 * Multiple DTCG files are merged into a single SD format file.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseDTCG } from './parse-dtcg.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert DTCG tokens to Style Dictionary format
 * Style Dictionary expects: { category: { nested: { path: { value: "...", type: "..." } } } }
 *
 * Can handle multiple DTCG files - merges them into single SD format
 */
function convertDTCGToSD(dtcgPaths, outputPath) {
	// Handle single file (backward compatibility) or array of files
	const paths = Array.isArray(dtcgPaths) ? dtcgPaths : [dtcgPaths];

	// Parse all DTCG files and merge tokens
	const allTokens = [];
	for (const dtcgPath of paths) {
		if (fs.existsSync(dtcgPath)) {
			const tokens = parseDTCG(dtcgPath);
			allTokens.push(...tokens);
		}
	}

	// Build nested structure matching Style Dictionary's expected format
	const sdTokens = {};

	for (const token of allTokens) {
		const category = token.path[0];
		if (!sdTokens[category]) {
			sdTokens[category] = {};
		}

		// Build nested structure matching token path (skip category, start from index 1)
		let current = sdTokens[category];
		for (let i = 1; i < token.path.length; i++) {
			const part = token.path[i];

			if (i === token.path.length - 1) {
				// Last part - set value object
				// Check if this would overwrite an existing nested structure
				if (current[part] && typeof current[part] === 'object' && !('value' in current[part])) {
					// Existing nested structure exists (e.g., base tokens created color.syntax.keyword.light/dark)
					// Check if this token has conditional values - if so, add them to the parent without overwriting
					if (
						token.original &&
						token.original.$value &&
						typeof token.original.$value === 'object' &&
						!Array.isArray(token.original.$value) &&
						('light' in token.original.$value || 'dark' in token.original.$value)
					) {
						// Check if these are DTCG references that need conversion (syntax tokens)
						const hasDTCGRefs =
							typeof token.original.$value.light === 'string' &&
							token.original.$value.light.startsWith('{') &&
							token.original.$value.light.endsWith('}') &&
							typeof token.original.$value.dark === 'string' &&
							token.original.$value.dark.startsWith('{') &&
							token.original.$value.dark.endsWith('}');

						if (hasDTCGRefs) {
							// Convert DTCG references to CSS var() format BEFORE Style Dictionary processes them
							// CRITICAL: Don't store dtcgRefConditional - Style Dictionary scans ALL properties
							// and will try to resolve {color.syntax.keyword.light} even in custom properties
							const lightRefPath = token.original.$value.light.slice(1, -1);
							const lightRefParts = lightRefPath.split('.');
							const lightRefName = lightRefParts.join('-');

							const darkRefPath = token.original.$value.dark.slice(1, -1);
							const darkRefParts = darkRefPath.split('.');
							const darkRefName = darkRefParts.join('-');

							// Set value to var() format - Style Dictionary won't try to resolve var() references
							current[part].value = {
								light: `var(--${lightRefName})`,
								dark: `var(--${darkRefName})`
							};
						} else {
							// Not DTCG references, preserve as-is with dtcgRefConditional for transforms
							current[part].dtcgRefConditional = {
								light: token.original.$value.light,
								dark: token.original.$value.dark
							};
							current[part].value = token.original.$value;
						}
						current[part].type = token.type;
						if (token.description) {
							current[part].description = token.description;
						}
					} else {
						// Would overwrite nested structure without conditional values - skip
						console.warn(
							`Skipping token ${token.name} - would overwrite nested structure at ${part}`
						);
					}
					continue;
				}
				current[part] = {
					value: token.value,
					type: token.type
				};
				if (token.description) {
					current[part].description = token.description;
				}
				// Preserve original DTCG reference for transforms (use custom property to avoid SD resolution)
				// This allows transforms to detect DTCG references like {opacity.50} before Style Dictionary resolves them
				if (
					token.original &&
					token.original.$value &&
					typeof token.original.$value === 'string' &&
					token.original.$value.startsWith('{')
				) {
					current[part].dtcgRef = token.original.$value;
				}
				// Preserve DTCG references for conditional tokens (light/dark mode)
				// CRITICAL: Style Dictionary resolves {references} BEFORE transforms run.
				// For syntax tokens with nested references like {color.syntax.keyword.light},
				// Style Dictionary fails because it can't resolve them. Solution: Convert
				// to var() format BEFORE Style Dictionary sees them.
				if (
					token.original &&
					token.original.$value &&
					typeof token.original.$value === 'object' &&
					!Array.isArray(token.original.$value) &&
					('light' in token.original.$value || 'dark' in token.original.$value)
				) {
					// Check if these are DTCG references that need conversion
					const hasDTCGRefs =
						typeof token.original.$value.light === 'string' &&
						token.original.$value.light.startsWith('{') &&
						token.original.$value.light.endsWith('}') &&
						typeof token.original.$value.dark === 'string' &&
						token.original.$value.dark.startsWith('{') &&
						token.original.$value.dark.endsWith('}');

					if (hasDTCGRefs) {
						// Convert DTCG references to CSS var() format BEFORE Style Dictionary processes them
						// This prevents Style Dictionary from trying to resolve {color.syntax.keyword.light}
						const lightRefPath = token.original.$value.light.slice(1, -1);
						const lightRefParts = lightRefPath.split('.');
						const lightRefName = lightRefParts.join('-');

						const darkRefPath = token.original.$value.dark.slice(1, -1);
						const darkRefParts = darkRefPath.split('.');
						const darkRefName = darkRefParts.join('-');

						// Set value to var() format - Style Dictionary won't try to resolve var() references
						// Don't store dtcgRefConditional for syntax tokens - Style Dictionary scans ALL properties
						// and will try to resolve {color.syntax.keyword.light} even if it's in a custom property
						current[part].value = {
							light: `var(--${lightRefName})`,
							dark: `var(--${darkRefName})`
						};
					} else {
						// Not DTCG references, preserve as-is
						current[part].dtcgRefConditional = {
							light: token.original.$value.light,
							dark: token.original.$value.dark
						};
						current[part].value = token.original.$value;
					}
				}
			} else {
				// Intermediate part - create nested object if it doesn't exist
				if (!current[part]) {
					current[part] = {};
				}
				current = current[part];
			}
		}
	}

	// Write output
	fs.writeFileSync(outputPath, JSON.stringify(sdTokens, null, 2));

	return sdTokens;
}

export { convertDTCGToSD };

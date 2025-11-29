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
 * Deep merge two objects
 */
function deepMerge(target, source) {
	for (const key in source) {
		if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
			if (!target[key]) target[key] = {};
			deepMerge(target[key], source[key]);
		} else {
			target[key] = source[key];
		}
	}
	return target;
}

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
				// Style Dictionary resolves these before transforms run, so we need to preserve the original structure
				if (
					token.original &&
					token.original.$value &&
					typeof token.original.$value === 'object' &&
					!Array.isArray(token.original.$value) &&
					('light' in token.original.$value || 'dark' in token.original.$value)
				) {
					current[part].dtcgRefConditional = {
						light: token.original.$value.light,
						dark: token.original.$value.dark
					};
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

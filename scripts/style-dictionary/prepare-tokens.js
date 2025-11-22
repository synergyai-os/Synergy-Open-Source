/**
 * Pre-process DTCG format to Style Dictionary format
 *
 * Converts design-system.json (DTCG) to Style Dictionary-compatible JSON
 * that can be used as source.
 *
 * Style Dictionary expects nested objects matching the token path structure.
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
 */
function convertDTCGToSD(dtcgPath, outputPath) {
	const tokens = parseDTCG(dtcgPath);

	// Build nested structure matching Style Dictionary's expected format
	const sdTokens = {};

	for (const token of tokens) {
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

/**
 * Split Base and Semantic Tokens
 *
 * Purpose: Split design-tokens-base.json into:
 * - design-tokens-base.json (only base tokens - hardcoded values)
 * - design-tokens-semantic.json (semantic + conditional tokens - references)
 *
 * Usage:
 *   node scripts/split-base-semantic.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '..', 'design-tokens-base.json');
const BASE_OUTPUT = path.join(__dirname, '..', 'design-tokens-base.json');
const SEMANTIC_OUTPUT = path.join(__dirname, '..', 'design-tokens-semantic.json');

/**
 * Check if token value is a base token (hardcoded, not reference)
 */
function isBaseToken(value) {
	if (!value || typeof value !== 'object') return false;
	if (!value.$value) return false;
	const val = value.$value;
	// Base token: direct value (not reference, not conditional)
	return typeof val === 'string' && !val.startsWith('{') && typeof val !== 'object';
}

/**
 * Check if token value is a reference token
 */
function isReferenceToken(value) {
	if (!value || typeof value !== 'object') return false;
	if (!value.$value) return false;
	const val = value.$value;
	return typeof val === 'string' && val.startsWith('{');
}

/**
 * Check if token value is a conditional token
 */
function isConditionalToken(value) {
	if (!value || typeof value !== 'object') return false;
	if (!value.$value) return false;
	const val = value.$value;
	return typeof val === 'object' && !Array.isArray(val) && ('light' in val || 'dark' in val);
}

/**
 * Extract tokens into base and semantic
 */
function extractTokens(obj, path = [], base = {}, semantic = {}) {
	for (const key in obj) {
		// Preserve schema and type at root level
		if (key === '$schema' || key === '$type' || key === '$description') {
			if (path.length === 0) {
				base[key] = obj[key];
				semantic[key] = obj[key];
			}
			continue;
		}

		const value = obj[key];
		const currentPath = [...path, key];

		if (value && typeof value === 'object' && value.$value !== undefined) {
			// This is a token
			if (isBaseToken(value)) {
				// Base token - add to base
				let current = base;
				for (let i = 0; i < currentPath.length - 1; i++) {
					if (!current[currentPath[i]]) current[currentPath[i]] = {};
					current = current[currentPath[i]];
				}
				current[currentPath[currentPath.length - 1]] = value;
			} else {
				// Semantic or conditional - add to semantic
				let current = semantic;
				for (let i = 0; i < currentPath.length - 1; i++) {
					if (!current[currentPath[i]]) current[currentPath[i]] = {};
					current = current[currentPath[i]];
				}
				current[currentPath[currentPath.length - 1]] = value;
			}
		} else if (typeof value === 'object' && value !== null) {
			// Nested object - recurse
			extractTokens(value, currentPath, base, semantic);
		}
	}

	return { base, semantic };
}

/**
 * Main function
 */
function main() {
	console.log('🔍 Splitting base and semantic tokens...\n');

	// Step 1: Read input file
	console.log(`📖 Reading ${INPUT_FILE}...`);
	const tokens = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
	console.log('   ✅ File read successfully');

	// Step 2: Extract tokens
	console.log('\n📝 Extracting base and semantic tokens...');
	const { base, semantic } = extractTokens(tokens);
	console.log('   ✅ Tokens extracted');

	// Step 3: Write base file
	console.log(`\n💾 Writing ${BASE_OUTPUT}...`);
	fs.writeFileSync(BASE_OUTPUT, JSON.stringify(base, null, '\t'), 'utf-8');
	const baseLines = JSON.stringify(base, null, '\t').split('\n').length;
	console.log(`   ✅ Base file written (${baseLines} lines)`);

	// Step 4: Write semantic file
	console.log(`\n💾 Writing ${SEMANTIC_OUTPUT}...`);
	fs.writeFileSync(SEMANTIC_OUTPUT, JSON.stringify(semantic, null, '\t'), 'utf-8');
	const semanticLines = JSON.stringify(semantic, null, '\t').split('\n').length;
	console.log(`   ✅ Semantic file written (${semanticLines} lines)`);

	console.log('\n🎉 Token split completed!');
	console.log('\n📋 Summary:');
	console.log(`   - Base tokens: ${BASE_OUTPUT} (${baseLines} lines)`);
	console.log(`   - Semantic tokens: ${SEMANTIC_OUTPUT} (${semanticLines} lines)`);
	console.log('\n⚠️  Next steps:');
	console.log('   1. Update style-dictionary.config.js to read both files');
	console.log('   2. Update prepare-tokens.js to handle multiple files');
	console.log('   3. Test build process');
}

// Run script
try {
	main();
} catch (error) {
	console.error('\n❌ Error:', error.message);
	process.exit(1);
}

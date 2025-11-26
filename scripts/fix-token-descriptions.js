/**
 * Fix Token Descriptions Script
 *
 * Purpose: Remove hardcoded pixel values from semantic token descriptions
 * Semantic tokens that reference base tokens should describe WHAT they're for,
 * not hardcoded pixel values that become stale.
 *
 * Rules:
 * - Base tokens: Keep pixel values (they're the source of truth)
 * - Semantic tokens (references): Remove pixel values, focus on semantic meaning + reference
 *
 * Usage:
 *   node scripts/fix-token-descriptions.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '..', 'design-tokens-base.json');

/**
 * Check if a token value is a reference (starts with {)
 */
function isReference(value) {
	return typeof value === 'string' && value.startsWith('{');
}

/**
 * Check if a token value is conditional (has light/dark)
 */
function isConditional(value) {
	return typeof value === 'object' && value !== null && ('light' in value || 'dark' in value);
}

/**
 * Clean description - remove hardcoded pixel values and utility class references
 * Focus on semantic meaning only
 */
function cleanDescription(description, tokenValue, tokenPath) {
	if (!description) return '';

	// If this is a reference token, clean up description
	if (isReference(tokenValue) || isConditional(tokenValue)) {
		// Remove patterns:
		// - "20px - " or "12px - " (leading pixel values)
		// - " (20px)" or " (12px)" (trailing pixel values)
		// - " = 20px" (equals pixel values)
		// - "px-card equivalent" or "py-card equivalent" (utility class references - redundant)
		// - "p-3 equivalent" or "gap-4 equivalent" (utility class references)
		let cleaned = description
			.replace(/^\d+px\s*-\s*/i, '') // Remove leading "20px - "
			.replace(/\s*\(\d+px\)/gi, '') // Remove trailing " (20px)"
			.replace(/\s*=\s*\d+px/gi, '') // Remove " = 20px"
			.replace(/\b(px-|py-|p-|gap-|text-|rounded-|min-h-|w-|h-|pl-|pr-|pt-|pb-)[^\s]*\s+equivalent/gi, '') // Remove utility class + "equivalent"
			.replace(/\s*-\s*(px-|py-|p-|gap-|text-|rounded-|min-h-|w-|h-|pl-|pr-|pt-|pb-)[^\s]*\s+equivalent/gi, '') // Remove " - px-card equivalent"
			.replace(/\s*\([^)]*(px-|py-|p-|gap-|text-|rounded-|min-h-|w-|h-|pl-|pr-|pt-|pb-)[^)]*\)/gi, '') // Remove utility class in parentheses
			.replace(/\s*-\s*-\s*/g, ' - ') // Fix double dashes
			.replace(/^\s*-\s*/, '') // Remove leading dash
			.replace(/\s+/g, ' ') // Normalize whitespace
			.trim();

		// Extract semantic meaning (what it's used for)
		// Keep meaningful parts like "card horizontal padding", "vertical padding for buttons"
		// Remove redundant parts like utility class names
		
		return cleaned;
	}

	// Base tokens keep their descriptions as-is (they're the source of truth)
	return description;
}

/**
 * Update description to include reference information
 */
function enhanceDescription(description, tokenValue, tokenPath) {
	if (!description) return '';

	// For reference tokens, add reference info if not already present
	if (isReference(tokenValue)) {
		const refMatch = tokenValue.match(/\{([^}]+)\}/);
		if (refMatch && !description.includes('references')) {
			// Add reference info at the end
			return `${description} - references {${refMatch[1]}}`;
		}
	}

	return description;
}

/**
 * Recursively process tokens
 */
function processTokens(tokens, path = []) {
	const result = {};

	for (const key in tokens) {
		if (key === '$schema') {
			result[key] = tokens[key];
			continue;
		}

		const value = tokens[key];
		const currentPath = [...path, key];

		if (value && typeof value === 'object' && value.$value !== undefined) {
			// This is a token
			const tokenValue = value.$value;
			let description = value.$description || '';

			// Clean description for semantic tokens
			if (isReference(tokenValue) || isConditional(tokenValue)) {
				description = cleanDescription(description, tokenValue, currentPath.join('.'));
				description = enhanceDescription(description, tokenValue, currentPath.join('.'));
			}

			result[key] = {
				...value,
				$description: description
			};
		} else if (typeof value === 'object' && value !== null) {
			// Nested object, recurse
			result[key] = processTokens(value, currentPath);
		} else {
			// Primitive value
			result[key] = value;
		}
	}

	return result;
}

/**
 * Main function
 */
function main() {
	console.log('🔍 Fixing token descriptions...\n');

	// Step 1: Read input file
	console.log(`📖 Reading ${INPUT_FILE}...`);
	const tokens = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
	console.log('   ✅ File read successfully');

	// Step 2: Process tokens
	console.log('\n📝 Processing token descriptions...');
	const cleaned = processTokens(tokens);
	console.log('   ✅ Descriptions processed');

	// Step 3: Write output file
	console.log(`\n💾 Writing ${INPUT_FILE}...`);
	fs.writeFileSync(INPUT_FILE, JSON.stringify(cleaned, null, '\t'), 'utf-8');
	console.log('   ✅ File written successfully');

	console.log('\n🎉 Token description cleanup completed!');
	console.log('\n📋 Summary:');
	console.log('   - Removed hardcoded pixel values from semantic token descriptions');
	console.log('   - Added reference information where missing');
	console.log('   - Base tokens keep their pixel values (source of truth)');
}

// Run script
try {
	main();
} catch (error) {
	console.error('\n❌ Error:', error.message);
	process.exit(1);
}


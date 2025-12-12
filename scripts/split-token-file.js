/**
 * Split Token File Script - Phase 1 (SYOS-586)
 *
 * Purpose: Create design-tokens-base.json by removing exception tokens from design-system.json
 *
 * Algorithm:
 * 1. Read design-system.json
 * 2. Identify exception tokens (contain "INTENTIONAL EXCEPTION" in description)
 * 3. Remove exception tokens from JSON structure
 * 4. Write cleaned version to design-tokens-base.json
 * 5. Validate base file (valid JSON, no exceptions)
 *
 * Usage:
 *   node scripts/split-token-file.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '..', 'design-system.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'design-tokens-base.json');

/**
 * Find all exception tokens in the token structure
 * Returns array of token paths (e.g., ['spacing', 'badge', 'x'])
 */
function findExceptionTokens(tokens, path = []) {
	const exceptions = [];

	for (const key in tokens) {
		// Skip metadata keys
		if (key === '$schema' || key === '$type' || key === '$description') {
			continue;
		}

		const currentPath = [...path, key];
		const value = tokens[key];

		// Check if this is an exception token
		if (value && typeof value === 'object') {
			// Check if it has a description with "INTENTIONAL EXCEPTION"
			if (
				value.$description &&
				typeof value.$description === 'string' &&
				value.$description.includes('INTENTIONAL EXCEPTION')
			) {
				exceptions.push(currentPath.join('.'));
			}

			// Recursively check nested objects
			if (!value.$value && typeof value === 'object') {
				exceptions.push(...findExceptionTokens(value, currentPath));
			}
		}
	}

	return exceptions;
}

/**
 * Remove exception tokens from token structure
 * Returns cleaned token object without exceptions
 */
function removeExceptions(tokens, exceptionPaths) {
	// Deep clone to avoid mutating original
	const result = JSON.parse(JSON.stringify(tokens));

	for (const path of exceptionPaths) {
		const parts = path.split('.');
		let current = result;

		// Navigate to parent object
		for (let i = 0; i < parts.length - 1; i++) {
			if (current[parts[i]]) {
				current = current[parts[i]];
			} else {
				// Path doesn't exist, skip
				break;
			}
		}

		// Remove exception token
		const lastPart = parts[parts.length - 1];
		if (current[lastPart]) {
			delete current[lastPart];
		}
	}

	// Clean up empty objects
	return cleanEmptyObjects(result);
}

/**
 * Remove empty objects from token structure
 * Recursively removes objects that have no properties (except metadata)
 */
function cleanEmptyObjects(obj) {
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}

	const result = {};
	let hasProperties = false;

	for (const key in obj) {
		// Keep metadata keys
		if (key === '$schema' || key === '$type' || key === '$description') {
			result[key] = obj[key];
			hasProperties = true;
			continue;
		}

		const value = obj[key];
		if (typeof value === 'object' && value !== null) {
			const cleaned = cleanEmptyObjects(value);
			// Only include if cleaned object has properties
			if (Object.keys(cleaned).length > 0) {
				result[key] = cleaned;
				hasProperties = true;
			}
		} else {
			result[key] = value;
			hasProperties = true;
		}
	}

	return hasProperties ? result : {};
}

/**
 * Validate base file
 * Checks: valid JSON, no exceptions
 */
function validateBaseFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const tokens = JSON.parse(content);

	// Check for exceptions
	const exceptions = findExceptionTokens(tokens);
	if (exceptions.length > 0) {
		throw new Error(
			`Base file still contains ${exceptions.length} exception tokens: ${exceptions.join(', ')}`
		);
	}

	console.log('✅ Base file validation passed:');
	console.log(`   - Valid JSON`);
	console.log(`   - No exception tokens found`);
	console.log(`   - Total tokens: ${countTokens(tokens)}`);

	return true;
}

/**
 * Count total tokens in structure
 */
function countTokens(tokens) {
	let count = 0;

	function traverse(obj) {
		if (typeof obj !== 'object' || obj === null) {
			return;
		}

		for (const key in obj) {
			if (key === '$schema' || key === '$type' || key === '$description') {
				continue;
			}

			const value = obj[key];
			if (value && typeof value === 'object' && value.$value) {
				count++;
			} else if (typeof value === 'object') {
				traverse(value);
			}
		}
	}

	traverse(tokens);
	return count;
}

/**
 * Main function
 */
function main() {
	console.log('🔍 Starting token file split...\n');

	// Step 1: Read input file
	console.log(`📖 Reading ${INPUT_FILE}...`);
	if (!fs.existsSync(INPUT_FILE)) {
		throw new Error(`Input file not found: ${INPUT_FILE}`);
	}

	const tokens = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
	console.log(`   ✅ File read successfully (${countTokens(tokens)} tokens)`);

	// Step 2: Identify exceptions
	console.log('\n🔍 Identifying exception tokens...');
	const exceptions = findExceptionTokens(tokens);
	console.log(`   ✅ Found ${exceptions.length} exception tokens:`);
	exceptions.forEach((path) => {
		console.log(`      - ${path}`);
	});

	// Step 3: Remove exceptions
	console.log('\n🧹 Removing exception tokens...');
	const baseTokens = removeExceptions(tokens, exceptions);
	console.log(`   ✅ Exceptions removed (${countTokens(baseTokens)} tokens remaining)`);

	// Step 4: Write base file
	console.log(`\n💾 Writing ${OUTPUT_FILE}...`);
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(baseTokens, null, '\t'), 'utf-8');
	console.log('   ✅ Base file written successfully');

	// Step 5: Validate base file
	console.log('\n✅ Validating base file...');
	validateBaseFile(OUTPUT_FILE);

	console.log('\n🎉 Token file split completed successfully!');
	console.log(`\n📋 Summary:`);
	console.log(`   - Input: ${INPUT_FILE}`);
	console.log(`   - Output: ${OUTPUT_FILE}`);
	console.log(`   - Exceptions removed: ${exceptions.length}`);
	console.log(`   - Tokens remaining: ${countTokens(baseTokens)}`);
	console.log(`\n⚠️  Next steps:`);
	console.log(`   1. Update style-dictionary.config.js to read design-tokens-base.json`);
	console.log(`   2. Run: npm run tokens:build`);
	console.log(`   3. Verify CSS generation works`);
}

// Run script
try {
	main();
} catch (error) {
	console.error('\n❌ Error:', error.message);
	process.exit(1);
}

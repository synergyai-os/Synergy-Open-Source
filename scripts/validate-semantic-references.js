#!/usr/bin/env node
/**
 * Semantic Token Reference Validation Script
 *
 * Validates that semantic tokens reference base tokens using DTCG reference syntax
 * (e.g., {spacing.2}) instead of hardcoded values (e.g., 0.5rem).
 *
 * Rules:
 * - Base tokens (spacing.0, spacing.1, etc.) can have hardcoded values ✅
 * - Semantic tokens (spacing.chart.container, etc.) must reference base tokens using {spacing.X} format ✅
 * - Exceptions allowed if documented with rationale in $description
 *
 * Usage:
 *   node scripts/validate-semantic-references.js
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const DESIGN_SYSTEM_JSON = path.join(PROJECT_ROOT, 'design-system.json');

/**
 * Check if a token path represents a base token
 * Base tokens are direct children of category (e.g., spacing.0, spacing.1, color.primary)
 */
function isBaseToken(pathParts) {
	// Base tokens have exactly 2 parts: category and token name (e.g., ['spacing', '0'])
	return pathParts.length === 2;
}

/**
 * Check if a token path represents a semantic token
 * Semantic tokens are nested deeper (e.g., spacing.chart.container)
 */
function isSemanticToken(pathParts) {
	// Semantic tokens have more than 2 parts (e.g., ['spacing', 'chart', 'container'])
	return pathParts.length > 2;
}

/**
 * Check if a value is a DTCG reference (e.g., {spacing.2})
 */
function isDTCGReference(value) {
	if (typeof value !== 'string') {
		return false;
	}
	// DTCG reference format: {category.token} or {category.token.subtoken}
	return /^\{[a-z0-9]+\.[a-z0-9]+(?:\.[a-z0-9]+)*\}$/.test(value.trim());
}

/**
 * Check if a value is a hardcoded dimension (e.g., 0.5rem, 1px, 2em)
 */
function isHardcodedDimension(value) {
	if (typeof value !== 'string') {
		return false;
	}
	// Match dimension values: number + unit (rem, px, em, %, etc.)
	return /^\d+(\.\d+)?(rem|px|em|%|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax)$/.test(value.trim());
}

/**
 * Check if a value is a hardcoded color (e.g., oklch(...), #fff, rgb(...))
 */
function isHardcodedColor(value) {
	if (typeof value !== 'string') {
		return false;
	}
	const trimmed = value.trim();
	// Allow oklch colors (design system uses oklch)
	if (trimmed.startsWith('oklch')) {
		return true;
	}
	// Block other hardcoded color formats
	return /^(#|rgb|rgba|hsl|hsla)/.test(trimmed);
}

/**
 * Check if token has documented exception
 * Exception must include "INTENTIONAL EXCEPTION" or "EXCEPTION" in description
 */
function hasDocumentedException(token) {
	const description = token.$description || token.description || '';
	const upperDescription = description.toUpperCase();
	return (
		upperDescription.includes('INTENTIONAL EXCEPTION') ||
		upperDescription.includes('EXCEPTION') ||
		upperDescription.includes('RATIONALE')
	);
}

/**
 * Recursively extract all tokens from DTCG structure
 * Returns array of { path: string[], value: string, $description: string, category: string }
 */
function extractTokens(obj, pathParts = [], category = null, tokens = []) {
	if (!obj || typeof obj !== 'object') {
		return tokens;
	}

	// Check if this is a token object (has $value) - leaf node
	if (obj.$value !== undefined) {
		tokens.push({
			path: pathParts,
			pathString: pathParts.join('.'),
			value: obj.$value,
			$description: obj.$description || '',
			category: category || (pathParts.length > 0 ? pathParts[0] : null)
		});
		return tokens;
	}

	// Check if this object has a $type property (type definition for group)
	// This sets the type for all child tokens in this category
	if (obj.$type !== undefined && pathParts.length === 1) {
		category = pathParts[0];
	}

	// Recursively process nested objects
	for (const [key, value] of Object.entries(obj)) {
		// Skip special properties ($schema, $type - already handled)
		if (key === '$schema') {
			continue;
		}
		if (key === '$type' && pathParts.length === 1) {
			// $type at category level - category already set above
			continue;
		}

		// Recursively process nested structure
		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			// Determine category from first path part
			const newCategory = category || (pathParts.length === 0 ? key : pathParts[0]);
			extractTokens(value, [...pathParts, key], newCategory, tokens);
		}
	}

	return tokens;
}

/**
 * Main validation function
 */
function validateSemanticReferences() {
	console.log('🔍 Validating semantic token references...\n');

	// Read design-system.json
	if (!fs.existsSync(DESIGN_SYSTEM_JSON)) {
		console.error(`❌ Error: ${DESIGN_SYSTEM_JSON} not found`);
		process.exit(1);
	}

	const designSystem = JSON.parse(fs.readFileSync(DESIGN_SYSTEM_JSON, 'utf-8'));

	// Extract all tokens
	const allTokens = extractTokens(designSystem);
	console.log(`📦 Found ${allTokens.length} tokens total`);

	// Separate base tokens and semantic tokens
	const baseTokens = allTokens.filter((token) => isBaseToken(token.path));
	const semanticTokens = allTokens.filter((token) => isSemanticToken(token.path));

	console.log(`📊 Base tokens: ${baseTokens.length}`);
	console.log(`🎨 Semantic tokens: ${semanticTokens.length}\n`);

	// Validate semantic tokens
	const violations = [];
	const exceptions = [];

	for (const token of semanticTokens) {
		const { pathString, value, $description } = token;

		// Skip if has documented exception
		if (hasDocumentedException(token)) {
			exceptions.push(token);
			continue;
		}

		// Check if value is a DTCG reference
		if (isDTCGReference(value)) {
			// ✅ Valid: Semantic token references base token
			continue;
		}

		// Check if value is hardcoded dimension
		if (isHardcodedDimension(value)) {
			violations.push({
				token,
				reason: `Semantic token "${pathString}" has hardcoded dimension "${value}" but should reference base token using {category.token} format (e.g., {spacing.2})`
			});
			continue;
		}

		// Check if value is hardcoded color (for color tokens)
		if (token.category === 'color' && isHardcodedColor(value) && !isDTCGReference(value)) {
			// Allow oklch colors (design system standard)
			if (value.trim().startsWith('oklch')) {
				continue;
			}
			violations.push({
				token,
				reason: `Semantic token "${pathString}" has hardcoded color "${value}" but should reference base token using {color.token} format`
			});
			continue;
		}

		// Other values (strings, numbers, etc.) - check if they should be references
		// For now, only flag dimensions and colors
		// Other types (like strings for font families) are allowed
	}

	// Report results
	if (exceptions.length > 0) {
		console.log(
			`⚠️  Found ${exceptions.length} documented exception${exceptions.length !== 1 ? 's' : ''}:`
		);
		for (const token of exceptions) {
			console.log(`   - ${token.pathString} (${token.$description.substring(0, 60)}...)`);
		}
		console.log('');
	}

	if (violations.length > 0) {
		console.log(`❌ Found ${violations.length} violation${violations.length !== 1 ? 's' : ''}:\n`);

		for (const violation of violations) {
			const { token, reason } = violation;
			console.log(`   ${reason}`);
			console.log(`   Path: ${token.pathString}`);
			console.log(`   Value: ${token.value}`);
			if (token.$description) {
				console.log(`   Description: ${token.$description}`);
			}
			console.log('');
		}

		console.log('💡 Fix: Replace hardcoded values with base token references:');
		console.log('   Example: "0.5rem" → "{spacing.2}"');
		console.log('   Example: "1.5rem" → "{spacing.6}"');
		console.log('');
		console.log(
			'💡 Exception: Add "INTENTIONAL EXCEPTION: [rationale]" to $description if hardcoded value is required.\n'
		);

		process.exit(1);
	} else {
		console.log('✅ All semantic tokens reference base tokens correctly!\n');
		process.exit(0);
	}
}

// Run validation
try {
	validateSemanticReferences();
} catch (error) {
	console.error('❌ Validation failed:', error.message);
	console.error(error.stack);
	process.exit(1);
}

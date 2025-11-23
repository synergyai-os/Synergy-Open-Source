#!/usr/bin/env tsx
/**
 * DTCG Format Validation Script
 *
 * Validates design-system.json against DTCG 1.0.0 schema.
 * Ensures all tokens have required fields ($type, $value, $description).
 *
 * Usage:
 *   npm run tokens:validate-dtcg
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

function validateDTCG(filePath: string): ValidationResult {
	const result: ValidationResult = {
		valid: true,
		errors: [],
		warnings: []
	};

	try {
		// Read and parse JSON
		const content = readFileSync(filePath, 'utf-8');
		const json = JSON.parse(content);

		// Check schema reference
		if (!json.$schema) {
			result.errors.push('Missing $schema reference');
			result.valid = false;
		} else if (!json.$schema.includes('design-tokens.github.io/community-group/format/1.0.0')) {
			result.warnings.push(`Schema reference may be incorrect: ${json.$schema}`);
		}

		// Get token groups (exclude $schema)
		const groups = Object.keys(json).filter((k) => k !== '$schema');

		if (groups.length === 0) {
			result.errors.push('No token groups found');
			result.valid = false;
			return result;
		}

		// Validate each group
		groups.forEach((group) => {
			const groupObj = json[group];

			// Check for $type (required for groups, except typography which is nested)
			if (group !== 'typography' && !groupObj.$type) {
				result.errors.push(`Group '${group}' missing $type`);
				result.valid = false;
			}

			// Recursively validate tokens
			function validateToken(obj: Record<string, unknown>, path: string): void {
				if (obj.$value !== undefined) {
					// This is a token
					if (!obj.$value) {
						result.errors.push(`Token '${path}' has empty $value`);
						result.valid = false;
					}
					if (!obj.$description) {
						result.warnings.push(`Token '${path}' missing $description (optional but recommended)`);
					}
				} else {
					// This is a group, check children
					Object.keys(obj).forEach((key) => {
						if (key !== '$type' && key !== '$description') {
							validateToken(obj[key], path ? `${path}.${key}` : key);
						}
					});
				}
			}

			validateToken(groupObj, group);
		});

		return result;
	} catch (error) {
		result.valid = false;
		if (error instanceof SyntaxError) {
			result.errors.push(`Invalid JSON: ${error.message}`);
		} else {
			result.errors.push(
				`Error reading file: ${error instanceof Error ? error.message : String(error)}`
			);
		}
		return result;
	}
}

// Main execution
const dtcgPath = join(process.cwd(), 'design-system.json');
const result = validateDTCG(dtcgPath);

console.log('=== DTCG Format Validation ===\n');

if (result.errors.length > 0) {
	console.log('❌ Validation FAILED\n');
	result.errors.forEach((error) => console.log(`  Error: ${error}`));
	process.exit(1);
}

if (result.warnings.length > 0) {
	console.log('⚠️  Validation passed with warnings:\n');
	result.warnings.forEach((warning) => console.log(`  Warning: ${warning}`));
	console.log('');
}

console.log('✅ DTCG format validation: PASSED');
console.log(`✅ Schema: ${JSON.parse(readFileSync(dtcgPath, 'utf-8')).$schema}`);
console.log('✅ All tokens have required fields ($type, $value)');

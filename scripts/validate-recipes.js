#!/usr/bin/env node

/**
 * Recipe Validation Script
 *
 * Validates that CVA recipes only use utility classes that actually exist
 * in the design system. Prevents typos and incorrect class names.
 *
 * Usage: npm run recipes:validate
 * Exit code: 0 if valid, 1 if errors found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	gray: '\x1b[90m'
};

/**
 * Extract all @utility class names from CSS files
 * @returns {Set<string>} Set of utility class names
 */
function extractUtilityClasses() {
	const utilityClasses = new Set();
	const cssFiles = [
		...glob.sync('src/styles/**/*.css', { cwd: ROOT_DIR }),
		...glob.sync('src/app.css', { cwd: ROOT_DIR })
	];

	const utilityRegex = /@utility\s+([\w-]+)\s*{/g;

	for (const file of cssFiles) {
		const filePath = path.join(ROOT_DIR, file);
		const content = fs.readFileSync(filePath, 'utf-8');

		let match;
		while ((match = utilityRegex.exec(content)) !== null) {
			utilityClasses.add(match[1]);
		}
	}

	return utilityClasses;
}

/**
 * Extract all classes used in CVA recipes
 * @param {string} recipeContent - Recipe file content
 * @returns {Array<{class: string, line: number}>} Array of classes with line numbers
 */
function extractRecipeClasses(recipeContent) {
	const classes = [];
	const lines = recipeContent.split('\n');

	// Match class strings in variants (e.g., 'icon-sm', 'size-iconsm', 'animate-spin text-accent')
	const classRegex = /['"`]([\w\s-]+)['"`]/g;

	lines.forEach((line, index) => {
		// Skip import lines and type definitions
		if (line.includes('import') || line.includes('type') || line.includes('export type')) {
			return;
		}

		let match;
		while ((match = classRegex.exec(line)) !== null) {
			const classString = match[1].trim();

			// Split multiple classes (e.g., 'animate-spin text-accent' -> ['animate-spin', 'text-accent'])
			const individualClasses = classString.split(/\s+/).filter(Boolean);

			individualClasses.forEach((cls) => {
				classes.push({
					class: cls,
					line: index + 1,
					fullString: classString
				});
			});
		}
	});

	return classes;
}

/**
 * Find similar utility classes (for suggestions)
 * @param {string} invalidClass - The invalid class name
 * @param {Set<string>} utilityClasses - Set of valid utility classes
 * @returns {string[]} Array of similar class names
 */
function findSimilarClasses(invalidClass, utilityClasses) {
	const suggestions = [];

	// Exact match (case-insensitive)
	for (const util of utilityClasses) {
		if (util.toLowerCase() === invalidClass.toLowerCase()) {
			suggestions.push(util);
		}
	}

	// Contains match (e.g., 'icon-sm' might suggest 'size-iconsm')
	if (suggestions.length === 0) {
		for (const util of utilityClasses) {
			// Remove prefixes and compare
			const invalidParts = invalidClass.replace(/^(size-|w-|h-|text-|bg-)/, '');

			// Check if utility contains the invalid class parts
			if (util.includes(invalidParts)) {
				suggestions.push(util);
			}

			// Also check if invalid class is contained in utility (e.g., 'icon-sm' in 'size-iconsm')
			const utilParts = util.replace(/^(size-|w-|h-|text-|bg-)/, '');
			if (utilParts.includes(invalidClass.replace(/-/g, ''))) {
				suggestions.push(util);
			}
		}
	}

	// Levenshtein distance match (fuzzy)
	if (suggestions.length === 0) {
		const distances = [];
		for (const util of utilityClasses) {
			const distance = levenshteinDistance(invalidClass, util);
			if (distance <= 3) {
				distances.push({ class: util, distance });
			}
		}
		distances.sort((a, b) => a.distance - b.distance);
		suggestions.push(...distances.slice(0, 3).map((d) => d.class));
	}

	return suggestions.slice(0, 3);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
	const matrix = [];

	for (let i = 0; i <= str2.length; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= str1.length; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= str2.length; i++) {
		for (let j = 1; j <= str1.length; j++) {
			if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j] + 1
				);
			}
		}
	}

	return matrix[str2.length][str1.length];
}

/**
 * Check if a class is a standard Tailwind class (allowed in recipes)
 * @param {string} className - Class to check
 * @returns {boolean} True if standard Tailwind class
 */
function isStandardTailwindClass(className) {
	const standardPrefixes = [
		'flex',
		'grid',
		'block',
		'inline',
		'hidden',
		'absolute',
		'relative',
		'fixed',
		'sticky',
		'animate-',
		'transition-',
		'duration-',
		'ease-',
		'cursor-',
		'pointer-events-',
		'overflow-',
		'truncate',
		'whitespace-',
		'border-solid',
		'border-dashed',
		'border-none',
		'items-',
		'justify-',
		'self-',
		'content-',
		'col-',
		'row-',
		'gap-x-',
		'gap-y-',
		'min-',
		'max-',
		'space-',
		// Tailwind color utilities (reference theme colors)
		'text-',
		'bg-',
		'border-',
		'fill-',
		'stroke-',
		'ring-',
		'shadow-',
		'outline-',
		'from-',
		'via-',
		'to-' // Gradient colors
	];

	return standardPrefixes.some((prefix) => className.startsWith(prefix));
}

/**
 * Validate a single recipe file
 * @param {string} filePath - Path to recipe file
 * @param {Set<string>} utilityClasses - Set of valid utility classes
 * @returns {Object} Validation result
 */
function validateRecipe(filePath, utilityClasses) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const recipeClasses = extractRecipeClasses(content);
	const errors = [];

	for (const { class: className, line, fullString } of recipeClasses) {
		// Skip if it's a standard Tailwind class
		if (isStandardTailwindClass(className)) {
			continue;
		}

		// Skip if it's a valid utility class
		if (utilityClasses.has(className)) {
			continue;
		}

		// Invalid class found
		const suggestions = findSimilarClasses(className, utilityClasses);
		errors.push({
			class: className,
			line,
			fullString,
			suggestions
		});
	}

	return {
		filePath,
		errors,
		valid: errors.length === 0
	};
}

/**
 * Main validation function
 */
function main() {
	console.log(`${colors.blue}🔍 Validating CVA recipes...${colors.reset}\n`);

	// Step 1: Extract utility classes from CSS
	console.log(`${colors.gray}Extracting utility classes from CSS files...${colors.reset}`);
	const utilityClasses = extractUtilityClasses();
	console.log(`${colors.green}✓${colors.reset} Found ${utilityClasses.size} utility classes\n`);

	// Step 2: Find all recipe files
	const recipeFiles = glob.sync('src/lib/design-system/recipes/**/*.recipe.ts', { cwd: ROOT_DIR });

	if (recipeFiles.length === 0) {
		console.log(`${colors.yellow}⚠ No recipe files found${colors.reset}`);
		process.exit(0);
	}

	console.log(`${colors.gray}Found ${recipeFiles.length} recipe file(s)${colors.reset}\n`);

	// Step 3: Validate each recipe
	const results = [];
	for (const file of recipeFiles) {
		const filePath = path.join(ROOT_DIR, file);
		const result = validateRecipe(filePath, utilityClasses);
		results.push(result);
	}

	// Step 4: Report results
	let hasErrors = false;

	for (const result of results) {
		if (result.valid) {
			console.log(`${colors.green}✓${colors.reset} ${path.relative(ROOT_DIR, result.filePath)}`);
		} else {
			hasErrors = true;
			console.log(`${colors.red}✗${colors.reset} ${path.relative(ROOT_DIR, result.filePath)}`);

			for (const error of result.errors) {
				console.log(
					`  ${colors.gray}Line ${error.line}:${colors.reset} Class ${colors.red}'${error.class}'${colors.reset} not found`
				);

				if (error.suggestions.length > 0) {
					console.log(
						`  ${colors.yellow}→ Did you mean:${colors.reset} ${error.suggestions.map((s) => `'${s}'`).join(', ')}`
					);
				} else {
					console.log(`  ${colors.yellow}→ No similar classes found${colors.reset}`);
				}
				console.log('');
			}
		}
	}

	// Step 5: Summary
	console.log('');
	const validCount = results.filter((r) => r.valid).length;
	const invalidCount = results.filter((r) => !r.valid).length;

	if (hasErrors) {
		console.log(`${colors.red}✗ ${invalidCount} recipe(s) failed validation${colors.reset}`);
		console.log(`${colors.gray}Fix the errors above and run again${colors.reset}\n`);
		process.exit(1);
	} else {
		console.log(
			`${colors.green}✓ All ${validCount} recipe(s) validated successfully${colors.reset}\n`
		);
		process.exit(0);
	}
}

// Run validation
main();

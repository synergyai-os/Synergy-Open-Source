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
const SEMANTIC_TOKENS_FILE = path.join(ROOT_DIR, 'design-tokens-semantic.json');

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
	// Check both src/styles/**/*.css and src/app.css
	const cssFiles = [...glob.sync('src/styles/**/*.css', { cwd: ROOT_DIR }), 'src/app.css'];

	const utilityRegex = /@utility\s+([\w-]+)\s*{/g;

	for (const file of cssFiles) {
		const filePath = path.join(ROOT_DIR, file);
		// Skip if file doesn't exist
		if (!fs.existsSync(filePath)) {
			continue;
		}
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
	// But skip variant keys/values in defaultVariants (e.g., 'md' in defaultVariants: { size: 'md' })
	const classRegex = /['"`]([\w\s-]+)['"`]/g;

	lines.forEach((line, index) => {
		// Skip import lines and type definitions
		if (line.includes('import') || line.includes('type') || line.includes('export type')) {
			return;
		}

		// Skip defaultVariants lines (they contain variant keys, not class names)
		// e.g., "size: 'md'" - 'md' is a variant key, not a class
		if (
			line.includes('defaultVariants:') ||
			line.match(/^\s*(size|variant|padding|fullHeight|disabled|etc):\s*['"`]/)
		) {
			return;
		}

		let match;
		while ((match = classRegex.exec(line)) !== null) {
			const classString = match[1].trim();

			// Skip single-word variant keys (e.g., 'sm', 'md', 'lg' when they appear as variant keys)
			// These are variant values, not class names
			// Class names typically have hyphens or multiple words (e.g., 'icon-sm', 'animate-spin text-accent')
			if (classString.match(/^(sm|md|lg|xl|xs|true|false)$/) && !line.includes(':')) {
				continue;
			}

			// Split multiple classes (e.g., 'animate-spin text-accent' -> ['animate-spin', 'text-accent'])
			const individualClasses = classString.split(/\s+/).filter(Boolean);

			individualClasses.forEach((cls) => {
				// Extract base class name from modifier prefixes (e.g., 'disabled:opacity-50' -> 'opacity-50')
				const baseClass = cls.includes(':') ? cls.split(':').pop() : cls;

				classes.push({
					class: baseClass, // Store base class for validation
					fullClass: cls, // Store full class (with modifiers) for context
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
		'border', // Tailwind base class for border-width: 1px
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

	// Check exact matches first (e.g., 'border', 'flex')
	if (standardPrefixes.includes(className)) {
		return true;
	}
	// Then check prefixes (e.g., 'border-', 'flex-')
	return standardPrefixes.some((prefix) => className.startsWith(prefix));
}

/**
 * Extract component-specific semantic tokens from design-tokens-semantic.json
 * Returns map of component name -> array of semantic token paths
 *
 * NOTE: We only check semantic tokens, not base tokens, because:
 * - Base tokens (spacing.2, spacing.3, etc.) from design-tokens-base.json do NOT generate utilities
 * - Only semantic tokens (spacing.button.gap, color.interactive.primary) generate utilities
 * - Recipes should use semantic token utilities (gap-button) not base token values (gap-2)
 * - Base tokens are the foundation that semantic tokens reference
 * - See scripts/style-dictionary/transforms.js line 141: base spacing tokens are skipped
 *
 * @returns {Map<string, Array<{path: string, utility: string}>>}
 */
function extractComponentSemanticTokens() {
	const componentTokens = new Map();

	if (!fs.existsSync(SEMANTIC_TOKENS_FILE)) {
		return componentTokens;
	}

	const semanticTokens = JSON.parse(fs.readFileSync(SEMANTIC_TOKENS_FILE, 'utf-8'));

	// Map component names to their semantic token paths
	const componentMappings = {
		button: {
			spacing: ['spacing', 'button'],
			color: ['color', 'interactive'],
			borderRadius: ['borderRadius', 'button']
		},
		input: {
			spacing: ['spacing', 'input'],
			color: ['color', 'component', 'input'],
			borderRadius: ['borderRadius', 'input']
		},
		card: {
			spacing: ['spacing', 'card'],
			borderRadius: ['borderRadius', 'card']
		}
	};

	// Helper to get nested value from object
	function getNestedValue(obj, path) {
		let current = obj;
		for (const key of path) {
			if (current && typeof current === 'object' && key in current) {
				current = current[key];
			} else {
				return null;
			}
		}
		return current;
	}

	// Extract tokens for each component
	for (const [component, mappings] of Object.entries(componentMappings)) {
		const tokens = [];

		// Extract spacing tokens (e.g., spacing.button.gap -> gap-button)
		if (mappings.spacing) {
			const spacingObj = getNestedValue(semanticTokens, mappings.spacing);
			if (spacingObj) {
				for (const [key, value] of Object.entries(spacingObj)) {
					if (value && value.$value) {
						// Convert token path to utility name
						// spacing.button.gap -> gap-button
						// spacing.button.x -> px-button
						// spacing.button.y -> py-button
						let utilityName;
						if (key === 'gap') {
							utilityName = `gap-${component}`;
						} else if (key === 'x') {
							utilityName = `px-${component}`;
						} else if (key === 'y') {
							utilityName = `py-${component}`;
						} else if (key === 'padding') {
							utilityName = `p-${component}`;
						} else {
							utilityName = `${key}-${component}`;
						}
						tokens.push({
							path: [...mappings.spacing, key].join('.'),
							utility: utilityName,
							category: 'spacing'
						});
					}
				}
			}
		}

		// Extract color tokens (e.g., color.interactive.primary -> bg-interactive-primary)
		if (mappings.color) {
			const colorObj = getNestedValue(semanticTokens, mappings.color);
			if (colorObj) {
				for (const [key, value] of Object.entries(colorObj)) {
					if (value && value.$value) {
						// Convert to utility name
						// color.interactive.primary -> bg-interactive-primary
						// color.interactive.primaryHover -> bg-interactive-primaryHover
						const utilityName = `bg-interactive-${key}`;
						tokens.push({
							path: [...mappings.color, key].join('.'),
							utility: utilityName,
							category: 'color'
						});
					}
				}
			}
		}

		// Extract borderRadius tokens
		if (mappings.borderRadius) {
			const borderRadiusValue = getNestedValue(semanticTokens, mappings.borderRadius);
			if (borderRadiusValue && borderRadiusValue.$value) {
				tokens.push({
					path: mappings.borderRadius.join('.'),
					utility: `rounded-${component}`,
					category: 'borderRadius'
				});
			}
		}

		if (tokens.length > 0) {
			componentTokens.set(component, tokens);
		}
	}

	return componentTokens;
}

/**
 * Check if recipe uses hardcoded Tailwind instead of semantic token
 * @param {string} recipeFileName - Recipe file name (e.g., 'button.recipe.ts')
 * @param {string} className - Class name to check
 * @param {string} fullString - Full class string (for context)
 * @param {Set<string>} utilityClasses - Set of valid utility classes
 * @param {Map<string, Array>} componentTokens - Map of component semantic tokens
 * @returns {Object|null} Warning object if semantic token should be used, null otherwise
 */
function checkComponentSemanticToken(
	recipeFileName,
	className,
	fullString,
	utilityClasses,
	componentTokens
) {
	// Extract component name from recipe file (e.g., 'button.recipe.ts' -> 'button')
	const componentMatch = recipeFileName.match(/(\w+)\.recipe\.ts$/);
	if (!componentMatch) {
		return null;
	}
	const component = componentMatch[1];
	const tokens = componentTokens.get(component);
	if (!tokens || tokens.length === 0) {
		return null;
	}

	// Check for common hardcoded Tailwind patterns that should use semantic tokens
	const hardcodedPatterns = {
		// Gap patterns: gap-2, gap-3, gap-4 should use gap-button, gap-input, etc.
		gap: {
			pattern: /^gap-[0-9]+$/,
			findToken: (tokens) =>
				tokens.find((t) => t.category === 'spacing' && t.utility.startsWith('gap-'))
		},
		// Padding patterns: px-2, py-2 should use px-button, py-button, etc.
		px: {
			pattern: /^px-[0-9]+$/,
			findToken: (tokens) =>
				tokens.find((t) => t.category === 'spacing' && t.utility.startsWith('px-'))
		},
		py: {
			pattern: /^py-[0-9]+$/,
			findToken: (tokens) =>
				tokens.find((t) => t.category === 'spacing' && t.utility.startsWith('py-'))
		},
		// Color patterns: bg-accent-primary should use bg-interactive-primary
		bgAccent: {
			pattern: /^bg-accent-(primary|hover|secondary)$/,
			findToken: (tokens) => {
				const match = className.match(/^bg-accent-(.+)$/);
				if (match) {
					const suffix = match[1];
					// Map accent-primary -> interactive-primary, accent-hover -> interactive-primaryHover
					const mappedSuffix = suffix === 'hover' ? 'primaryHover' : suffix;
					return tokens.find(
						(t) => t.category === 'color' && t.utility === `bg-interactive-${mappedSuffix}`
					);
				}
				return null;
			}
		}
	};

	// Check each pattern
	for (const [_patternName, { pattern, findToken }] of Object.entries(hardcodedPatterns)) {
		if (pattern.test(className)) {
			const semanticToken = findToken(tokens);
			if (semanticToken && utilityClasses.has(semanticToken.utility)) {
				return {
					type: 'component-semantic-token',
					class: className,
					semanticToken: semanticToken.utility,
					tokenPath: semanticToken.path,
					component,
					recommendation: `Use '${semanticToken.utility}' (from ${semanticToken.path}) instead of hardcoded '${className}'`
				};
			}
		}
	}

	return null;
}

/**
 * Check if a Tailwind built-in opacity class should be replaced with semantic token
 * @param {string} className - Class name to check
 * @param {string} fullString - Full class string (for context)
 * @param {Set<string>} utilityClasses - Set of valid utility classes
 * @returns {Object|null} Warning object if semantic token should be used, null otherwise
 */
function checkSemanticTokenPreference(className, fullString, utilityClasses) {
	// Map Tailwind built-in opacity classes to semantic tokens
	const semanticTokenMap = {
		'opacity-50': 'opacity-disabled', // Common for disabled states
		'opacity-80': 'opacity-hover', // Common for hover states
		'opacity-75': 'opacity-backdrop', // Common for backdrop overlays
		'opacity-60': 'opacity-loading' // Common for loading states
	};

	// Check if this is a Tailwind built-in opacity class
	if (!semanticTokenMap[className]) {
		return null;
	}

	const semanticToken = semanticTokenMap[className];

	// Check if semantic token exists in design system
	if (!utilityClasses.has(semanticToken)) {
		return null; // Semantic token doesn't exist, can't suggest it
	}

	// Check context to determine if semantic token is appropriate
	const context = fullString.toLowerCase();

	// For opacity-50, check if used with disabled:
	if (className === 'opacity-50' && context.includes('disabled:')) {
		return {
			type: 'semantic-token-preference',
			class: className,
			semanticToken: semanticToken,
			context: 'disabled state',
			recommendation: `Use 'disabled:${semanticToken}' instead of 'disabled:${className}' for consistency with design system`
		};
	}

	// For opacity-80, check if used with hover:
	if (className === 'opacity-80' && context.includes('hover:')) {
		return {
			type: 'semantic-token-preference',
			class: className,
			semanticToken: semanticToken,
			context: 'hover state',
			recommendation: `Consider using 'hover:${semanticToken}' instead of 'hover:${className}' for consistency with design system`
		};
	}

	// For opacity-75, check if used in backdrop context
	if (className === 'opacity-75' && (context.includes('backdrop') || context.includes('overlay'))) {
		return {
			type: 'semantic-token-preference',
			class: className,
			semanticToken: semanticToken,
			context: 'backdrop/overlay',
			recommendation: `Consider using '${semanticToken}' instead of '${className}' for consistency with design system`
		};
	}

	// For opacity-60, check if used in loading context
	if (className === 'opacity-60' && (context.includes('loading') || context.includes('spinner'))) {
		return {
			type: 'semantic-token-preference',
			class: className,
			semanticToken: semanticToken,
			context: 'loading state',
			recommendation: `Consider using '${semanticToken}' instead of '${className}' for consistency with design system`
		};
	}

	// General warning for opacity-50 (most common case - disabled states)
	if (className === 'opacity-50') {
		return {
			type: 'semantic-token-preference',
			class: className,
			semanticToken: semanticToken,
			context: 'general',
			recommendation: `Consider using '${semanticToken}' instead of '${className}' for consistency with design system (see design-system.md Section 4.6)`
		};
	}

	return null;
}

/**
 * Validate a single recipe file
 * @param {string} filePath - Path to recipe file
 * @param {Set<string>} utilityClasses - Set of valid utility classes
 * @param {Map<string, Array>} componentTokens - Map of component semantic tokens
 * @returns {Object} Validation result
 */
function validateRecipe(filePath, utilityClasses, componentTokens) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const recipeClasses = extractRecipeClasses(content);
	const errors = [];
	const warnings = [];
	const fileName = path.basename(filePath);

	for (const { class: className, fullClass, line, fullString } of recipeClasses) {
		// Check for component-specific semantic token usage FIRST
		const componentWarning = checkComponentSemanticToken(
			fileName,
			className,
			fullClass || fullString,
			utilityClasses,
			componentTokens
		);
		if (componentWarning) {
			warnings.push({
				...componentWarning,
				line,
				fullClass: fullClass || className,
				fullString
			});
		}

		// Check for semantic token preference (opacity, etc.)
		// Use fullClass (with modifiers) for context checking
		const semanticWarning = checkSemanticTokenPreference(
			className,
			fullClass || fullString,
			utilityClasses
		);
		if (semanticWarning) {
			warnings.push({
				...semanticWarning,
				line,
				fullClass: fullClass || className,
				fullString
			});
			// Continue checking (warnings don't stop validation)
		}

		// Skip if it's a standard Tailwind class (but opacity-* needs special handling)
		// Don't skip opacity classes - they need semantic token preference check
		if (isStandardTailwindClass(className) && !className.startsWith('opacity-')) {
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
		warnings,
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

	// Step 1.5: Extract component-specific semantic tokens
	console.log(`${colors.gray}Extracting component semantic tokens...${colors.reset}`);
	const componentTokens = extractComponentSemanticTokens();
	console.log(
		`${colors.green}✓${colors.reset} Found semantic tokens for ${componentTokens.size} component(s)\n`
	);

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
		const result = validateRecipe(filePath, utilityClasses, componentTokens);
		results.push(result);
	}

	// Step 4: Report results
	let hasErrors = false;
	let hasWarnings = false;

	for (const result of results) {
		const relativePath = path.relative(ROOT_DIR, result.filePath);

		if (result.valid && result.warnings.length === 0) {
			console.log(`${colors.green}✓${colors.reset} ${relativePath}`);
		} else {
			if (!result.valid) {
				hasErrors = true;
				console.log(`${colors.red}✗${colors.reset} ${relativePath}`);
			} else {
				console.log(`${colors.yellow}⚠${colors.reset} ${relativePath}`);
			}

			// Report errors first
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

			// Report warnings (semantic token preferences)
			for (const warning of result.warnings) {
				hasWarnings = true;
				if (warning.type === 'component-semantic-token') {
					console.log(
						`  ${colors.gray}Line ${warning.line}:${colors.reset} ${colors.yellow}⚠${colors.reset} Component semantic token`
					);
					console.log(
						`    Using hardcoded ${colors.yellow}'${warning.class}'${colors.reset} instead of semantic token ${colors.green}'${warning.semanticToken}'${colors.reset}`
					);
					console.log(`    Token path: ${colors.blue}${warning.tokenPath}${colors.reset}`);
					console.log(`    ${colors.gray}${warning.recommendation}${colors.reset}`);
				} else {
					console.log(
						`  ${colors.gray}Line ${warning.line}:${colors.reset} ${colors.yellow}⚠${colors.reset} Semantic token preference`
					);
					console.log(
						`    Using ${colors.yellow}'${warning.class}'${colors.reset} instead of semantic token ${colors.green}'${warning.semanticToken}'${colors.reset}`
					);
					console.log(`    ${colors.gray}${warning.recommendation}${colors.reset}`);
				}
				console.log('');
			}
		}
	}

	// Step 5: Summary
	console.log('');
	const validCount = results.filter((r) => r.valid).length;
	const invalidCount = results.filter((r) => !r.valid).length;
	const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);

	if (hasErrors) {
		console.log(`${colors.red}✗ ${invalidCount} recipe(s) failed validation${colors.reset}`);
		if (hasWarnings) {
			console.log(
				`${colors.yellow}⚠ ${warningCount} warning(s) found (semantic token preferences)${colors.reset}`
			);
		}
		console.log(`${colors.gray}Fix the errors above and run again${colors.reset}\n`);
		process.exit(1);
	} else if (hasWarnings) {
		console.log(
			`${colors.green}✓ All ${validCount} recipe(s) validated successfully${colors.reset}`
		);
		console.log(
			`${colors.yellow}⚠ ${warningCount} warning(s): Consider using semantic tokens for consistency (see design-system.md Section 4.6)${colors.reset}\n`
		);
		process.exit(0); // Warnings don't fail validation
	} else {
		console.log(
			`${colors.green}✓ All ${validCount} recipe(s) validated successfully${colors.reset}\n`
		);
		process.exit(0);
	}
}

// Run validation
main();

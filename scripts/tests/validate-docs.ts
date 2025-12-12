#!/usr/bin/env node

/**
 * Documentation Validation Script (Improved)
 *
 * Validates that documentation matches actual generated code:
 * - Extracts utility names from documentation
 * - Filters base Tailwind utilities (allowed)
 * - Handles archived docs (skip or warn)
 * - Provides better error messages with suggestions
 * - Compares against generated utilities
 *
 * Usage: npm run validate:docs
 * Exit code: 0 if valid, 1 if errors found
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..');

// ANSI color codes
const colors = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m',
	gray: '\x1b[90m'
};

/**
 * Base Tailwind utilities that are valid (not design system utilities)
 * REMOVED: Filtering hides violations. Docs should use semantic tokens, not base utilities.
 * Violations will be flagged and must be fixed.
 */
const BASE_TAILWIND_UTILITIES = new Set([
	// Spacing (base scale)
	'px-0',
	'px-1',
	'px-2',
	'px-3',
	'px-4',
	'px-5',
	'px-6',
	'px-8',
	'px-10',
	'px-12',
	'px-16',
	'px-20',
	'px-24',
	'px-32',
	'py-0',
	'py-1',
	'py-2',
	'py-3',
	'py-4',
	'py-5',
	'py-6',
	'py-8',
	'py-10',
	'py-12',
	'py-16',
	'py-20',
	'py-24',
	'py-32',
	'p-0',
	'p-1',
	'p-2',
	'p-3',
	'p-4',
	'p-5',
	'p-6',
	'p-8',
	'p-10',
	'p-12',
	'p-16',
	'p-20',
	'p-24',
	'p-32',
	'm-0',
	'm-1',
	'm-2',
	'm-3',
	'm-4',
	'm-5',
	'm-6',
	'm-8',
	'm-10',
	'm-12',
	'm-16',
	'm-20',
	'm-24',
	'm-32',
	'gap-0',
	'gap-1',
	'gap-2',
	'gap-3',
	'gap-4',
	'gap-5',
	'gap-6',
	'gap-8',
	'gap-10',
	'gap-12',
	'gap-16',
	'gap-20',
	'gap-24',
	'gap-32',
	// Typography (base scale)
	'text-xs',
	'text-sm',
	'text-base',
	'text-lg',
	'text-xl',
	'text-2xl',
	'text-3xl',
	'text-4xl',
	'text-5xl',
	'text-6xl',
	'font-thin',
	'font-extralight',
	'font-light',
	'font-normal',
	'font-medium',
	'font-semibold',
	'font-bold',
	'font-extrabold',
	'font-black',
	// Border radius (base scale)
	'rounded-none',
	'rounded-sm',
	'rounded',
	'rounded-md',
	'rounded-lg',
	'rounded-xl',
	'rounded-2xl',
	'rounded-3xl',
	'rounded-full',
	// Opacity (base scale)
	'opacity-0',
	'opacity-5',
	'opacity-10',
	'opacity-20',
	'opacity-25',
	'opacity-30',
	'opacity-40',
	'opacity-50',
	'opacity-60',
	'opacity-70',
	'opacity-75',
	'opacity-80',
	'opacity-90',
	'opacity-95',
	'opacity-100',
	// Common Tailwind utilities
	'inline-flex',
	'items-center',
	'justify-center',
	'transition-colors-token'
]);

/**
 * Utility name mapping (old → new)
 * Loaded from utility-mapping.json for maintainability
 */
let UTILITY_MAPPING: Record<string, string> = {};
try {
	const mappingPath = join(__dirname, 'utility-mapping.json');
	if (existsSync(mappingPath)) {
		const mappingContent = readFileSync(mappingPath, 'utf-8');
		const mappingData = JSON.parse(mappingContent);
		UTILITY_MAPPING = mappingData.mappings || {};
	}
} catch {
	// Fallback to hardcoded mapping if file doesn't exist
	UTILITY_MAPPING = {
		'px-button-x': 'px-button',
		'py-button-y': 'py-button'
	};
}

/**
 * Extract utility class names from generated CSS files
 */
function getGeneratedUtilities(): Set<string> {
	const utilityRegex = /@utility\s+([\w-]+)\s*{/g;
	const utilities = new Set<string>();

	const cssFiles = [
		'src/styles/utilities/spacing-utils.css',
		'src/styles/utilities/color-utils.css',
		'src/styles/utilities/component-utils.css',
		'src/styles/utilities/typography-utils.css',
		'src/styles/utilities/fonts-utils.css',
		'src/styles/utilities/opacity-utils.css'
	];

	for (const file of cssFiles) {
		const filePath = join(ROOT_DIR, file);
		if (!existsSync(filePath)) continue;

		const content = readFileSync(filePath, 'utf-8');
		let match;
		while ((match = utilityRegex.exec(content)) !== null) {
			utilities.add(match[1]);
		}
	}

	return utilities;
}

/**
 * Check if a utility is a base Tailwind utility (allowed)
 */
function isBaseTailwindUtility(utility: string): boolean {
	// Check exact match
	if (BASE_TAILWIND_UTILITIES.has(utility)) {
		return true;
	}

	// Check patterns (e.g., px-2, py-3, gap-4)
	if (/^(px|py|p|m|gap|text|font|rounded|opacity)-\d+$/.test(utility)) {
		return true;
	}

	// Check common Tailwind utilities
	if (
		['inline-flex', 'items-center', 'justify-center', 'transition-colors-token'].includes(utility)
	) {
		return true;
	}

	return false;
}

/**
 * Find similar utilities (for suggestions)
 */
function findSimilarUtilities(utility: string, generatedUtilities: Set<string>): string[] {
	const suggestions: string[] = [];

	// Check mapping first
	if (UTILITY_MAPPING[utility]) {
		const mapped = UTILITY_MAPPING[utility];
		if (generatedUtilities.has(mapped)) {
			suggestions.push(mapped);
		}
	}

	// Find utilities that start with same prefix
	const prefix = utility.split('-')[0];
	for (const genUtil of generatedUtilities) {
		if (genUtil.startsWith(prefix + '-') && genUtil !== utility) {
			suggestions.push(genUtil);
			if (suggestions.length >= 3) break;
		}
	}

	return suggestions.slice(0, 3);
}

/**
 * Extract utility names from documentation
 * Improved to handle edge cases
 */
function extractUtilitiesFromDocs(filePath: string): Set<string> {
	const content = readFileSync(filePath, 'utf-8');
	const utilities = new Set<string>();

	// Match utility class names in code blocks and inline code
	// Pattern: class="px-button-x" or 'px-button-x' or `px-button-x`
	const utilityPatterns = [
		/class=["'`]([\w\s-]+)["'`]/g, // class="px-button py-button"
		/`([\w-]+)`/g, // `px-button-x` (but be careful with code blocks)
		/['"](px|py|rounded|bg|text|font|gap|border|opacity|transition)-[\w-]+['"]/g // 'px-button-x'
	];

	for (const pattern of utilityPatterns) {
		let match;
		while ((match = pattern.exec(content)) !== null) {
			const matchText = match[1] || match[0];
			// Extract individual utility classes
			const classes = matchText.split(/\s+/);
			for (const cls of classes) {
				// Only add if it looks like a utility class (starts with px-, py-, etc.)
				if (
					/^(px|py|rounded|bg|text|font|gap|border|opacity|transition|p|m|inline-flex|items-center|justify-center)-/.test(
						cls
					)
				) {
					// Filter out partial matches (e.g., "px-" without a name)
					if (cls.length > 3 && !cls.endsWith('-')) {
						utilities.add(cls);
					}
				}
			}
		}
	}

	return utilities;
}

/**
 * Check if file is in archived docs (should be handled differently)
 */
function isArchivedDoc(filePath: string): boolean {
	return filePath.includes('4-archive') || filePath.includes('archive');
}

/**
 * Validate documentation files
 */
function validateDocs(): {
	valid: boolean;
	errors: Array<{ file: string; utility: string; suggestions: string[]; isBaseUtility?: boolean }>;
	archivedErrors: Array<{
		file: string;
		utility: string;
		suggestions: string[];
		isBaseUtility?: boolean;
	}>;
} {
	const generatedUtilities = getGeneratedUtilities();
	const errors: Array<{ file: string; utility: string; suggestions: string[] }> = [];
	const archivedErrors: Array<{ file: string; utility: string; suggestions: string[] }> = [];

	// Find all markdown documentation files
	const docFiles = glob.sync('dev-docs/**/*.md', { cwd: ROOT_DIR });

	for (const docFile of docFiles) {
		const filePath = join(ROOT_DIR, docFile);
		const docUtilities = extractUtilitiesFromDocs(filePath);
		const isArchived = isArchivedDoc(docFile);

		for (const utility of docUtilities) {
			// Check if utility exists
			if (!generatedUtilities.has(utility)) {
				// Check if it's a base Tailwind utility (violation - should use semantic tokens)
				const isBaseUtility = isBaseTailwindUtility(utility);
				const suggestions = isBaseUtility ? [] : findSimilarUtilities(utility, generatedUtilities);
				const error = { file: docFile, utility, suggestions, isBaseUtility };

				if (isArchived) {
					archivedErrors.push(error);
				} else {
					errors.push(error);
				}
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors,
		archivedErrors
	};
}

// Main execution
const result = validateDocs();

if (!result.valid || result.archivedErrors.length > 0) {
	if (result.errors.length > 0) {
		console.error(`${colors.red}❌ Documentation validation failed${colors.reset}`);
		console.error(`\nFound ${result.errors.length} utility name mismatches in active docs:\n`);

		const errorsByFile = new Map<string, Array<{ utility: string; suggestions: string[] }>>();
		for (const error of result.errors) {
			if (!errorsByFile.has(error.file)) {
				errorsByFile.set(error.file, []);
			}
			errorsByFile
				.get(error.file)!
				.push({ utility: error.utility, suggestions: error.suggestions });
		}

		for (const [file, utilities] of errorsByFile.entries()) {
			console.error(`${colors.yellow}${file}${colors.reset}:`);
			for (const { utility, suggestions, isBaseUtility } of utilities) {
				if (isBaseUtility) {
					console.error(
						`  - ${colors.red}${utility}${colors.reset} ${colors.yellow}[VIOLATION: Base Tailwind utility - use semantic token instead]${colors.reset}`
					);
					console.error(
						`    ${colors.cyan}→ Replace with semantic utility (e.g., px-button, py-button, gap-icon)${colors.reset}`
					);
				} else {
					console.error(
						`  - ${colors.red}${utility}${colors.reset} (not found in generated utilities)`
					);
					if (suggestions.length > 0) {
						console.error(
							`    ${colors.cyan}→ Suggested: ${suggestions.join(', ')}${colors.reset}`
						);
					} else if (UTILITY_MAPPING[utility]) {
						console.error(
							`    ${colors.cyan}→ Mapping suggests: ${UTILITY_MAPPING[utility]}${colors.reset}`
						);
					}
				}
			}
		}
	}

	if (result.archivedErrors.length > 0) {
		console.error(
			`\n${colors.gray}⚠️  Found ${result.archivedErrors.length} utility name mismatches in archived docs (may be historical):${colors.reset}\n`
		);

		const archivedByFile = new Map<string, string[]>();
		for (const error of result.archivedErrors) {
			if (!archivedByFile.has(error.file)) {
				archivedByFile.set(error.file, []);
			}
			archivedByFile.get(error.file)!.push(error.utility);
		}

		for (const [file, utilities] of archivedByFile.entries()) {
			console.error(`${colors.gray}${file}${colors.reset}:`);
			for (const utility of utilities.slice(0, 5)) {
				// Show only first 5 per file
				console.error(`  - ${colors.gray}${utility}${colors.reset}`);
			}
			if (utilities.length > 5) {
				console.error(`  ${colors.gray}... and ${utilities.length - 5} more${colors.reset}`);
			}
		}
	}

	if (result.errors.length > 0) {
		console.error(
			`\n${colors.blue}Tip:${colors.reset} Update documentation to use correct utility names.`
		);
		console.error("Run 'npm run tokens:build' to see all generated utilities.");
		process.exit(1);
	} else {
		// Only archived errors, warn but don't fail
		console.log(`${colors.yellow}⚠️  Only archived docs have errors (non-blocking)${colors.reset}`);
		process.exit(0);
	}
} else {
	console.log(`${colors.green}✅ Documentation validation passed${colors.reset}`);
	process.exit(0);
}

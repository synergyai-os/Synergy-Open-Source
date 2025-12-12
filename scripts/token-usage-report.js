#!/usr/bin/env node
/**
 * Token Usage Report Script
 *
 * Audits token coverage by extracting token definitions from app.css,
 * scanning codebase for usage, and detecting hardcoded values.
 *
 * Usage:
 *   node scripts/token-usage-report.js              # Full report
 *   node scripts/token-usage-report.js --ci         # CI mode (exit 1 if violations)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// Scan directories
const SCAN_DIRS = ['src/lib/components', 'src/routes', 'src/lib/modules'];
const FILE_EXTENSIONS = ['.svelte', '.ts'];

// Hardcoded value patterns (reused from audit-design-system.js)
const PATTERNS = {
	// Arbitrary values: bg-[#abc], p-[12px], text-[18px], w-[247px]
	arbitraryValue: /class=["'][^"']*\[[#0-9]/g,

	// Raw Tailwind color scale: bg-blue-500, text-gray-700
	rawColor:
		/\b(bg|text|border)-(blue|gray|red|green|yellow|purple|pink|indigo|orange|teal|cyan|emerald|lime|amber|violet|fuchsia|rose|sky|slate|zinc|neutral|stone)-[0-9]{2,3}\b/g,

	// Raw spacing scale: p-4, m-8, gap-2, px-6, py-3
	rawSpacing: /\b(p|m|gap|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|space-[xy])-[0-9]{1,2}\b/g,

	// Raw font sizes: text-xs, text-sm, text-base, text-lg, text-xl, etc.
	rawFontSize: /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/g,

	// Raw border radius: rounded-none, rounded-sm, rounded-md, rounded-lg, etc.
	rawBorderRadius: /\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b/g,

	// Inline styles: style="padding: 16px"
	inlineStyle: /style=["'][^"']+["']/g
};

// Exceptions (functional classes, not design violations)
const EXCEPTIONS = [
	/top-\[50%\]/, // Dialog positioning
	/left-\[50%\]/, // Dialog positioning
	/translate-/, // Transform positioning
	/data-\[state=/, // Bits UI state classes
	/animate-/, // Animation classes
	/transition-/, // Transition classes
	/duration-/, // Animation duration
	/delay-/, // Animation delay
	/ease-/, // Animation easing
	/backdrop-/, // Backdrop filters
	/blur-/, // Blur effects
	/opacity-/, // Opacity (functional)
	/z-\[/, // Z-index arbitrary values
	/aspect-/, // Aspect ratio
	/object-/, // Object fit/position
	/overflow-/, // Overflow handling
	/pointer-events-/, // Pointer events
	/cursor-/, // Cursor types
	/select-/, // Text selection
	/resize-/, // Resize behavior
	/whitespace-/, // Whitespace handling
	/break-/, // Word break
	/line-clamp-/, // Line clamping
	/grid-cols-\[/, // Grid columns (arbitrary OK for layout)
	/grid-rows-\[/, // Grid rows (arbitrary OK for layout)
	/min-w-\[/, // Min width (arbitrary OK for layout)
	/max-w-\[/, // Max width (arbitrary OK for layout)
	/min-h-\[/, // Min height (arbitrary OK for layout)
	/max-h-\[/, // Max height (arbitrary OK for layout)
	/w-\[/, // Width (arbitrary OK for layout)
	/h-\[/ // Height (arbitrary OK for layout)
];

/**
 * Extract token definitions from app.css
 */
function extractTokens() {
	const appCssPath = path.join(PROJECT_ROOT, 'src/app.css');
	const content = fs.readFileSync(appCssPath, 'utf-8');

	const tokens = new Set();
	const utilities = new Set();

	// Extract CSS custom properties from @theme block
	const themeMatch = content.match(/@theme\s*\{([^}]+)\}/s);
	if (themeMatch) {
		const themeContent = themeMatch[1];
		// Match --token-name: value;
		const tokenRegex = /--([a-z0-9-]+):/g;
		let match;
		while ((match = tokenRegex.exec(themeContent)) !== null) {
			const tokenName = match[1];
			// Skip deprecated tokens
			if (!tokenName.includes('-legacy')) {
				tokens.add(tokenName);
			}
		}
	}

	// Extract utility classes from @utility blocks
	const utilityRegex = /@utility\s+([a-z0-9-]+)\s*\{/g;
	let utilityMatch;
	while ((utilityMatch = utilityRegex.exec(content)) !== null) {
		utilities.add(utilityMatch[1]);
	}

	return { tokens: Array.from(tokens), utilities: Array.from(utilities) };
}

/**
 * Find all source files to scan
 */
function findSourceFiles() {
	const files = [];

	function scanDirectory(dir) {
		if (!fs.existsSync(dir)) return;

		const entries = fs.readdirSync(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);

			// Skip node_modules, .git, and other ignored directories
			if (
				entry.name.startsWith('.') ||
				entry.name === 'node_modules' ||
				entry.name === 'dist' ||
				entry.name === 'build' ||
				entry.name === '.svelte-kit'
			) {
				continue;
			}

			if (entry.isDirectory()) {
				scanDirectory(fullPath);
			} else if (FILE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
				files.push(fullPath);
			}
		}
	}

	for (const dir of SCAN_DIRS) {
		const dirPath = path.join(PROJECT_ROOT, dir);
		scanDirectory(dirPath);
	}

	return files;
}

/**
 * Check if violation matches exception patterns
 */
function isException(violation) {
	return EXCEPTIONS.some((pattern) => pattern.test(violation));
}

/**
 * Detect violation type
 */
function detectViolationType(match) {
	const violation = match[0];

	if (isException(violation)) {
		return null; // Skip exceptions
	}

	if (PATTERNS.arbitraryValue.test(violation)) {
		return 'arbitrary-value';
	}
	if (PATTERNS.rawColor.test(violation)) {
		return 'raw-color';
	}
	if (PATTERNS.rawSpacing.test(violation)) {
		return 'raw-spacing';
	}
	if (PATTERNS.rawFontSize.test(violation)) {
		return 'raw-font-size';
	}
	if (PATTERNS.rawBorderRadius.test(violation)) {
		return 'raw-border-radius';
	}
	if (PATTERNS.inlineStyle.test(violation)) {
		return 'inline-style';
	}

	return 'unknown';
}

/**
 * Scan file for utility class usage and hardcoded values
 */
function scanFile(filePath, utilities) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');
	const usedUtilities = new Set();
	const violations = [];

	// Scan for utility class usage
	// Match complete utility class names in class attributes
	// Pattern: class="... utility-name ..." or class='... utility-name ...'
	for (const utility of utilities) {
		// Escape special regex characters and match as complete word
		const escapedUtility = utility.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		// Match utility in class="..." or class='...' or className="..." or in template literals
		const utilityRegex = new RegExp(
			`(class|className)=["'][^"']*\\b${escapedUtility}\\b[^"']*["']|\\b${escapedUtility}\\b`,
			'g'
		);
		if (utilityRegex.test(content)) {
			usedUtilities.add(utility);
		}
	}

	// Scan for hardcoded values
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Skip test files (they're allowed to use hardcoded values)
		if (filePath.includes('.test.') || filePath.includes('.spec.')) {
			continue;
		}

		// Check all patterns
		for (const [_patternName, pattern] of Object.entries(PATTERNS)) {
			const matches = [...line.matchAll(pattern)];

			for (const match of matches) {
				const type = detectViolationType(match);

				if (type) {
					// Skip dynamic inline styles (e.g., style="color: {variable}" or style={`color: ${variable}`})
					// These are intentional dynamic values, not hardcoded violations
					const matchedString = match[0];
					if (
						type === 'inline-style' &&
						(/\{[^}]+\}/.test(matchedString) ||
							/\$\{[^}]+\}/.test(matchedString) ||
							/\{[^}]*%/.test(matchedString))
					) {
						continue;
					}

					violations.push({
						file: path.relative(PROJECT_ROOT, filePath),
						line: i + 1,
						violation: match[0],
						type,
						content: line.trim()
					});
				}
			}
		}
	}

	return { usedUtilities, violations };
}

/**
 * Main execution
 */
function main() {
	const args = process.argv.slice(2);
	const ciMode = args.includes('--ci');

	if (!ciMode) {
		console.log('📊 Token Usage Report\n');
	}

	// Extract tokens and utilities from app.css
	const { tokens, utilities } = extractTokens();

	if (!ciMode) {
		console.log(
			`Extracted ${tokens.length} tokens and ${utilities.length} utility classes from app.css\n`
		);
	}

	// Scan codebase
	const files = findSourceFiles();

	if (files.length === 0) {
		if (!ciMode) {
			console.log('⚠️  No files to scan');
		}
		process.exit(0);
	}

	if (!ciMode) {
		console.log(`Scanning ${files.length} file${files.length !== 1 ? 's' : ''}...\n`);
	}

	const allUsedUtilities = new Set();
	const allViolations = [];

	for (const file of files) {
		const { usedUtilities, violations } = scanFile(file, utilities);
		usedUtilities.forEach((util) => allUsedUtilities.add(util));
		allViolations.push(...violations);
	}

	// Calculate coverage
	const usedCount = allUsedUtilities.size;
	const totalCount = utilities.length;
	const coveragePercent = totalCount > 0 ? Math.round((usedCount / totalCount) * 100) : 100;
	const unusedUtilities = utilities.filter((util) => !allUsedUtilities.has(util));

	// Group violations by file
	const violationsByFile = {};
	for (const violation of allViolations) {
		if (!violationsByFile[violation.file]) {
			violationsByFile[violation.file] = [];
		}
		violationsByFile[violation.file].push(violation);
	}

	// Output report (matching ticket spec format)
	if (!ciMode) {
		console.log('📊 Token Usage Report\n');
		console.log(`Total Tokens: ${tokens.length}`);
		console.log(`Used Tokens: ${usedCount} (${coveragePercent}%)`);
		console.log(`Unused Tokens: ${unusedUtilities.length}\n`);

		if (allViolations.length > 0) {
			console.log(`❌ Hardcoded Values Found: ${Object.keys(violationsByFile).length} files`);
			for (const [file, fileViolations] of Object.entries(violationsByFile)) {
				for (const violation of fileViolations) {
					// Format: file-line (violation) - matching ticket spec
					console.log(`  - ${file}-${violation.line} (${violation.violation})`);
				}
			}
			console.log('');
		} else {
			console.log('✅ No hardcoded values found!\n');
		}
	} else {
		// CI mode: concise output
		console.log(`Token Coverage: ${coveragePercent}% (${usedCount}/${totalCount})`);
		if (allViolations.length > 0) {
			console.log(`Hardcoded Values: ${allViolations.length} violations`);
			for (const violation of allViolations.slice(0, 10)) {
				console.log(`  ${violation.file}:${violation.line} - ${violation.violation}`);
			}
			if (allViolations.length > 10) {
				console.log(`  ... and ${allViolations.length - 10} more`);
			}
		}
	}

	// Exit with error code if violations found (for CI)
	if (allViolations.length > 0) {
		process.exit(1);
	}

	process.exit(0);
}

main();

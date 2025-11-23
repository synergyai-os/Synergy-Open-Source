#!/usr/bin/env node
/**
 * Token Audit Script
 *
 * Lists orphaned tokens (tokens with 0 usages).
 * Used to identify tokens that can be safely removed.
 *
 * Usage:
 *   node scripts/audit-tokens.js              # List orphaned tokens
 *   node scripts/audit-tokens.js --ci        # CI mode (exit 1 if orphaned tokens found)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// File extensions to scan
const FILE_EXTENSIONS = ['.svelte', '.css', '.ts'];

// Directories to scan
const SCAN_DIRS = ['src'];

// Directories to ignore
const IGNORE_DIRS = [
	'node_modules',
	'.git',
	'dist',
	'build',
	'.svelte-kit',
	'www',
	'playwright-report',
	'test-results',
	'storybook-static'
];

/**
 * Flatten nested token structure from design-system.json
 * Converts: { spacing: { nav: { item: { x: {...} } } } }
 * To: ['spacing-nav-item-x']
 */
function flattenTokens(obj, prefix = '', tokens = []) {
	for (const [key, value] of Object.entries(obj)) {
		// Skip $type, $value, $description, $deprecated metadata
		if (key.startsWith('$')) {
			continue;
		}

		const tokenName = prefix ? `${prefix}-${key}` : key;

		// If value has $value, it's a token definition
		if (value && typeof value === 'object' && '$value' in value) {
			tokens.push(tokenName);
		} else if (value && typeof value === 'object') {
			// Recursively flatten nested objects
			flattenTokens(value, tokenName, tokens);
		}
	}

	return tokens;
}

/**
 * Extract all tokens from design-system.json
 */
function extractTokensFromDesignSystem() {
	const designSystemPath = path.join(PROJECT_ROOT, 'design-system.json');
	const content = JSON.parse(fs.readFileSync(designSystemPath, 'utf-8'));

	const tokens = flattenTokens(content);
	return tokens.map((token) => `--${token}`);
}

/**
 * Extract tokens from app.css @theme block
 * Returns all CSS custom properties defined in @theme
 */
function extractTokensFromAppCss() {
	const appCssPath = path.join(PROJECT_ROOT, 'src/app.css');
	const content = fs.readFileSync(appCssPath, 'utf-8');

	const tokens = new Set();

	// Find @theme block
	const themeMatch = content.match(/@theme\s*\{([^}]+)\}/s);
	if (themeMatch) {
		const themeContent = themeMatch[1];
		// Match --token-name: value;
		const tokenRegex = /--([a-z0-9-]+):/g;
		let match;
		while ((match = tokenRegex.exec(themeContent)) !== null) {
			const tokenName = `--${match[1]}`;
			// Skip deprecated tokens
			if (!tokenName.includes('-legacy')) {
				tokens.add(tokenName);
			}
		}
	}

	return Array.from(tokens);
}

/**
 * Extract utility class → token mappings from app.css
 * Returns: { 'px-nav-item': '--spacing-nav-item-x', ... }
 */
function extractUtilityMappings() {
	const appCssPath = path.join(PROJECT_ROOT, 'src/app.css');
	const content = fs.readFileSync(appCssPath, 'utf-8');

	const mappings = {};

	// Match @utility blocks: @utility utility-name { ... var(--token-name) ... }
	const utilityRegex = /@utility\s+([a-z0-9-]+)\s*\{([^}]+)\}/g;
	let match;

	while ((match = utilityRegex.exec(content)) !== null) {
		const utilityName = match[1];
		const utilityBody = match[2];

		// Find var(--token-name) references in utility body
		const varRegex = /var\(--([a-z0-9-]+)\)/g;
		let varMatch;

		while ((varMatch = varRegex.exec(utilityBody)) !== null) {
			const tokenName = `--${varMatch[1]}`;
			// Map utility to token (a utility can reference multiple tokens, we'll track all)
			if (!mappings[utilityName]) {
				mappings[utilityName] = [];
			}
			if (!mappings[utilityName].includes(tokenName)) {
				mappings[utilityName].push(tokenName);
			}
		}
	}

	return mappings;
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

			// Skip ignored directories
			if (IGNORE_DIRS.includes(entry.name)) {
				continue;
			}

			// Skip dot-files and dot-directories
			if (entry.name.startsWith('.')) {
				continue;
			}

			if (entry.isDirectory()) {
				scanDirectory(fullPath);
			} else if (FILE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
				// Skip test files (they're allowed to use hardcoded values)
				if (
					entry.name.includes('.test.') ||
					entry.name.includes('.spec.') ||
					entry.name.includes('.stories.')
				) {
					continue;
				}
				files.push(fullPath);
			}
		}
	}

	for (const dir of SCAN_DIRS) {
		const dirPath = path.join(PROJECT_ROOT, dir);
		if (fs.existsSync(dirPath)) {
			scanDirectory(dirPath);
		}
	}

	return files;
}

/**
 * Scan file for token usage
 * Returns: { tokens: Set of tokens used, utilities: Set of utilities used }
 */
function scanFile(filePath, utilityMappings, allTokens) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const usedTokens = new Set();
	const usedUtilities = new Set();

	// 1. Scan for utility class usage (e.g., class="px-nav-item")
	for (const [utilityName, tokens] of Object.entries(utilityMappings)) {
		// Escape special regex characters
		const escapedUtility = utilityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		// Match utility in class="..." or class='...' or className="..."
		const utilityRegex = new RegExp(
			`(class|className)=["'][^"']*\\b${escapedUtility}\\b[^"']*["']|\\b${escapedUtility}\\b`,
			'g'
		);

		if (utilityRegex.test(content)) {
			usedUtilities.add(utilityName);
			// Add all tokens referenced by this utility
			for (const token of tokens) {
				usedTokens.add(token);
			}
		}
	}

	// 2. Scan for direct CSS variable usage (e.g., var(--spacing-button-x))
	const varRegex = /var\(--([a-z0-9-]+)\)/g;
	let varMatch;

	while ((varMatch = varRegex.exec(content)) !== null) {
		const tokenName = `--${varMatch[1]}`;
		// Only track if it's a known token
		if (allTokens.has(tokenName)) {
			usedTokens.add(tokenName);
		}
	}

	return { usedTokens, usedUtilities };
}

/**
 * Check if token is a base token (intentionally unused)
 */
function isBaseToken(tokenName) {
	// Base spacing scale tokens (0-32)
	if (/^--spacing-[0-9]+$/.test(tokenName)) {
		return true;
	}

	// Base tokens that are intentionally unused
	const baseTokens = [
		'--spacing-0',
		'--spacing-1',
		'--spacing-2',
		'--spacing-3',
		'--spacing-4',
		'--spacing-5',
		'--spacing-6',
		'--spacing-8',
		'--spacing-10',
		'--spacing-12',
		'--spacing-16',
		'--spacing-20',
		'--spacing-24',
		'--spacing-28',
		'--spacing-32'
	];

	return baseTokens.includes(tokenName);
}

/**
 * Check if token is a legacy token (intentionally unused, deprecated)
 */
function isLegacyToken(tokenName) {
	return tokenName.includes('-legacy');
}

/**
 * Main execution
 */
function main() {
	const args = process.argv.slice(2);
	const ciMode = args.includes('--ci');

	if (!ciMode) {
		console.log('🔍 Auditing token usage...\n');
	}

	// Extract tokens from design-system.json and app.css
	const designSystemTokens = extractTokensFromDesignSystem();
	const appCssTokens = extractTokensFromAppCss();
	const allTokens = new Set([...designSystemTokens, ...appCssTokens]);

	if (!ciMode) {
		console.log(
			`📦 Found ${allTokens.size} design tokens (${designSystemTokens.length} from design-system.json, ${appCssTokens.length} from app.css)`
		);
	}

	// Extract utility → token mappings
	const utilityMappings = extractUtilityMappings();

	if (!ciMode) {
		console.log(`🔧 Found ${Object.keys(utilityMappings).length} utility classes`);
	}

	// Find source files
	const files = findSourceFiles();

	if (!ciMode) {
		console.log(`📁 Scanning ${files.length} file${files.length !== 1 ? 's' : ''}...\n`);
	}

	// Track token usage across all files
	const tokenUsage = {}; // { '--token-name': ['file1', 'file2'], ... }

	// Initialize token usage map
	for (const token of allTokens) {
		tokenUsage[token] = [];
	}

	// Scan each file
	for (const file of files) {
		const relativePath = path.relative(PROJECT_ROOT, file);
		const { usedTokens } = scanFile(file, utilityMappings, allTokens);

		// Record token usage
		for (const token of usedTokens) {
			// Initialize if token not in map (might be from app.css but not design-system.json)
			if (!tokenUsage[token]) {
				tokenUsage[token] = [];
			}
			if (!tokenUsage[token].includes(relativePath)) {
				tokenUsage[token].push(relativePath);
			}
		}
	}

	// Find orphaned tokens (0 usages, excluding base/legacy tokens)
	const orphanedTokens = [];
	for (const [token, files] of Object.entries(tokenUsage)) {
		// Skip base tokens (intentionally unused)
		if (isBaseToken(token)) {
			continue;
		}

		// Skip legacy tokens (deprecated, intentionally unused)
		if (isLegacyToken(token)) {
			continue;
		}

		// If token has 0 usages, it's orphaned
		if (files.length === 0) {
			orphanedTokens.push(token);
		}
	}

	// Output results
	if (orphanedTokens.length > 0) {
		if (!ciMode) {
			console.log(
				`⚠️  Found ${orphanedTokens.length} orphaned token${orphanedTokens.length !== 1 ? 's' : ''}:\n`
			);

			for (const token of orphanedTokens.sort()) {
				console.log(`  - ${token}`);
			}

			console.log('\n💡 Orphaned tokens have no usages in the codebase.');
			console.log('   Consider removing them or adding utility classes.\n');
		} else {
			// CI mode: concise output
			console.log(`Orphaned Tokens: ${orphanedTokens.length}`);
			for (const token of orphanedTokens.sort().slice(0, 10)) {
				console.log(`  - ${token}`);
			}
			if (orphanedTokens.length > 10) {
				console.log(`  ... and ${orphanedTokens.length - 10} more`);
			}
		}

		// Exit with error code if orphaned tokens found (for CI)
		process.exit(1);
	} else {
		if (!ciMode) {
			console.log('✅ No orphaned tokens found!\n');
		} else {
			console.log('Orphaned Tokens: 0');
		}

		process.exit(0);
	}
}

main();

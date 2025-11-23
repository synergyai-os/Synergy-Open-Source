#!/usr/bin/env node
/**
 * Token Validation Script
 *
 * Validates that all design tokens have corresponding utility classes.
 * Blocks builds if orphaned tokens are found.
 *
 * Usage:
 *   node scripts/validate-tokens.js
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const CSS_FILE = path.join(PROJECT_ROOT, 'src/app.css');

/**
 * Extract all tokens from @theme block
 */
function extractTokens(cssContent) {
	const tokens = new Set();

	// Find @theme block
	const themeMatch = cssContent.match(/@theme\s*\{([^}]+)\}/s);
	if (!themeMatch) {
		throw new Error('No @theme block found in app.css');
	}

	const themeContent = themeMatch[1];

	// Extract all CSS custom properties (--token-name: value)
	const tokenPattern = /--([a-z0-9-]+):/g;
	let match;
	while ((match = tokenPattern.exec(themeContent)) !== null) {
		const tokenName = match[1];
		tokens.add(tokenName);
	}

	return tokens;
}

/**
 * Extract all utilities and find which tokens they reference
 */
function extractUtilitiesAndTokens(cssContent) {
	const utilities = [];
	const referencedTokens = new Set();

	// Find all @utility blocks
	const utilityPattern = /@utility\s+([a-z0-9-]+)\s*\{([^}]+)\}/g;
	let match;

	while ((match = utilityPattern.exec(cssContent)) !== null) {
		const utilityName = match[1];
		const utilityBody = match[2];

		utilities.push(utilityName);

		// Find all var(--token-name) references in utility body
		const varPattern = /var\(--([a-z0-9-]+)\)/g;
		let varMatch;
		while ((varMatch = varPattern.exec(utilityBody)) !== null) {
			const tokenName = varMatch[1];
			referencedTokens.add(tokenName);
		}
	}

	return { utilities, referencedTokens };
}

/**
 * Find tokens that are referenced by other tokens (not utilities)
 */
function findTokenReferences(cssContent, tokens) {
	const referencedByTokens = new Set();

	// Find all var(--token-name) references in @theme block
	const themeMatch = cssContent.match(/@theme\s*\{([^}]+)\}/s);
	if (!themeMatch) return referencedByTokens;

	const themeContent = themeMatch[1];
	const varPattern = /var\(--([a-z0-9-]+)\)/g;
	let match;

	while ((match = varPattern.exec(themeContent)) !== null) {
		const tokenName = match[1];
		if (tokens.has(tokenName)) {
			referencedByTokens.add(tokenName);
		}
	}

	return referencedByTokens;
}

/**
 * Check if token is a base token (intentionally unused)
 */
function isBaseToken(tokenName) {
	// Base spacing scale tokens (0-32)
	if (/^spacing-[0-9]+$/.test(tokenName)) {
		return true;
	}

	// Base tokens that are intentionally unused
	const baseTokens = [
		'spacing-0',
		'spacing-1',
		'spacing-2',
		'spacing-3',
		'spacing-4',
		'spacing-5',
		'spacing-6',
		'spacing-8',
		'spacing-10',
		'spacing-12',
		'spacing-16',
		'spacing-20',
		'spacing-24',
		'spacing-28',
		'spacing-32'
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
 * Find tokens used directly in CSS files (not just utilities)
 */
function findDirectUsageInCSS(cssContent, tokens) {
	const referencedTokens = new Set();

	// Find all var(--token-name) references in CSS (outside @utility blocks)
	// Remove @utility blocks first to avoid double-counting
	const withoutUtilities = cssContent.replace(/@utility\s+[^{]+\{[^}]+\}/g, '');
	const varPattern = /var\(--([a-z0-9-]+)\)/g;
	let match;

	while ((match = varPattern.exec(withoutUtilities)) !== null) {
		const tokenName = match[1];
		if (tokens.has(tokenName)) {
			referencedTokens.add(tokenName);
		}
	}

	return referencedTokens;
}

/**
 * Find tokens used directly in component files (Svelte, TS, etc.)
 */
function findDirectUsageInComponents(tokens) {
	const referencedTokens = new Set();

	try {
		// Search for var(--token-name) in component files
		const componentFiles = execSync(
			'find src -type f \\( -name "*.svelte" -o -name "*.ts" -o -name "*.css" \\) -not -path "*/node_modules/*"',
			{ cwd: PROJECT_ROOT, encoding: 'utf-8' }
		)
			.trim()
			.split('\n')
			.filter(Boolean);

		for (const file of componentFiles) {
			const filePath = path.join(PROJECT_ROOT, file);
			if (!fs.existsSync(filePath)) continue;

			const content = fs.readFileSync(filePath, 'utf-8');
			const varPattern = /var\(--([a-z0-9-]+)\)/g;
			let match;

			while ((match = varPattern.exec(content)) !== null) {
				const tokenName = match[1];
				if (tokens.has(tokenName)) {
					referencedTokens.add(tokenName);
				}
			}
		}
	} catch (_error) {
		// If find command fails (e.g., Windows), fall back to scanning common directories
		const commonDirs = ['src/lib/components', 'src/lib/modules', 'src/routes', 'src/styles'];

		for (const dir of commonDirs) {
			const dirPath = path.join(PROJECT_ROOT, dir);
			if (!fs.existsSync(dirPath)) continue;

			scanDirectoryForTokens(dirPath, tokens, referencedTokens);
		}
	}

	return referencedTokens;
}

/**
 * Recursively scan directory for token usage
 */
function scanDirectoryForTokens(dirPath, tokens, referencedTokens) {
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			scanDirectoryForTokens(fullPath, tokens, referencedTokens);
		} else if (/\.(svelte|ts|css)$/.test(entry.name)) {
			const content = fs.readFileSync(fullPath, 'utf-8');
			const varPattern = /var\(--([a-z0-9-]+)\)/g;
			let match;

			while ((match = varPattern.exec(content)) !== null) {
				const tokenName = match[1];
				if (tokens.has(tokenName)) {
					referencedTokens.add(tokenName);
				}
			}
		}
	}
}

/**
 * Main validation function
 */
function validateTokens() {
	console.log('🔍 Validating token→utility mapping...\n');

	// Read CSS file
	const cssContent = fs.readFileSync(CSS_FILE, 'utf-8');

	// Extract tokens
	const allTokens = extractTokens(cssContent);
	console.log(`📦 Found ${allTokens.size} design tokens`);

	// Extract utilities and referenced tokens
	const { utilities, referencedTokens } = extractUtilitiesAndTokens(cssContent);
	console.log(`🔧 Found ${utilities.length} utility classes`);
	console.log(`✅ ${referencedTokens.size} tokens referenced by utilities`);

	// Find tokens referenced by other tokens
	const referencedByTokens = findTokenReferences(cssContent, allTokens);

	// Find tokens used directly in CSS (not just utilities)
	const directUsageCSS = findDirectUsageInCSS(cssContent, allTokens);
	console.log(`📝 ${directUsageCSS.size} tokens used directly in CSS`);

	// Find tokens used directly in components
	const directUsageComponents = findDirectUsageInComponents(allTokens);
	console.log(`🎨 ${directUsageComponents.size} tokens used directly in components`);

	// Combine all direct usage
	const directUsage = new Set([...directUsageCSS, ...directUsageComponents]);

	// Find orphaned tokens (not referenced by utilities, other tokens, or direct CSS usage, and not base/legacy tokens)
	const orphanedTokens = [];

	for (const token of allTokens) {
		// Skip base tokens (intentionally unused)
		if (isBaseToken(token)) {
			continue;
		}

		// Skip legacy tokens (deprecated, intentionally unused)
		if (isLegacyToken(token)) {
			continue;
		}

		// Skip if referenced by utility
		if (referencedTokens.has(token)) {
			continue;
		}

		// Skip if referenced by another token
		if (referencedByTokens.has(token)) {
			continue;
		}

		// Skip if used directly in CSS
		if (directUsage.has(token)) {
			continue;
		}

		// Orphaned token found
		orphanedTokens.push(token);
	}

	// Report results
	if (orphanedTokens.length > 0) {
		console.log(
			`\n❌ Found ${orphanedTokens.length} orphaned token${orphanedTokens.length !== 1 ? 's' : ''}:\n`
		);

		for (const token of orphanedTokens.sort()) {
			console.log(`  - --${token}`);
		}

		console.log('\n💡 Orphaned tokens have no corresponding utility classes.');
		console.log('   Add a utility class or remove the token if unused.\n');

		process.exit(1);
	} else {
		console.log('\n✅ All tokens have corresponding utilities or are base tokens!\n');
		process.exit(0);
	}
}

// Run validation
try {
	validateTokens();
} catch (error) {
	console.error('❌ Validation failed:', error.message);
	process.exit(1);
}

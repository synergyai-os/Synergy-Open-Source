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
const TOKENS_DIR = path.join(PROJECT_ROOT, 'src/styles/tokens');
const UTILITIES_DIR = path.join(PROJECT_ROOT, 'src/styles/utilities');
const DESIGN_SYSTEM_FILE = path.join(PROJECT_ROOT, 'design-tokens-base.json');

/**
 * Read all token CSS files and extract tokens from @theme blocks
 */
function extractTokens() {
	const tokens = new Set();

	if (!fs.existsSync(TOKENS_DIR)) {
		throw new Error(`Tokens directory not found: ${TOKENS_DIR}`);
	}

	// Read all CSS files in tokens directory
	const tokenFiles = fs.readdirSync(TOKENS_DIR).filter((file) => file.endsWith('.css'));

	for (const file of tokenFiles) {
		const filePath = path.join(TOKENS_DIR, file);
		const cssContent = fs.readFileSync(filePath, 'utf-8');

		// Find @theme block
		const themeMatch = cssContent.match(/@theme\s*\{([^}]+)\}/s);
		if (themeMatch) {
			const themeContent = themeMatch[1];

			// Extract all CSS custom properties (--token-name: value)
			const tokenPattern = /--([a-z0-9-]+):/g;
			let match;
			while ((match = tokenPattern.exec(themeContent)) !== null) {
				const tokenName = match[1];
				tokens.add(tokenName);
			}
		}
	}

	return tokens;
}

/**
 * Read all utility CSS files and extract utilities
 */
function readAllUtilityFiles() {
	let combinedContent = '';

	if (!fs.existsSync(UTILITIES_DIR)) {
		throw new Error(`Utilities directory not found: ${UTILITIES_DIR}`);
	}

	// Read all CSS files in utilities directory
	const utilityFiles = fs.readdirSync(UTILITIES_DIR).filter((file) => file.endsWith('.css'));

	for (const file of utilityFiles) {
		const filePath = path.join(UTILITIES_DIR, file);
		const cssContent = fs.readFileSync(filePath, 'utf-8');
		combinedContent += cssContent + '\n';
	}

	return combinedContent;
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
 * Returns: { tokens: Set, usageMap: { tokenName: [file1, file2] } }
 */
function findDirectUsageInComponents(tokens) {
	const referencedTokens = new Set();
	const usageMap = {}; // Track which files use which tokens

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
					if (!usageMap[tokenName]) {
						usageMap[tokenName] = [];
					}
					if (!usageMap[tokenName].includes(file)) {
						usageMap[tokenName].push(file);
					}
				}
			}
		}
	} catch (_error) {
		// If find command fails (e.g., Windows), fall back to scanning common directories
		const commonDirs = ['src/lib/components', 'src/lib/modules', 'src/routes', 'src/styles'];

		for (const dir of commonDirs) {
			const dirPath = path.join(PROJECT_ROOT, dir);
			if (!fs.existsSync(dirPath)) continue;

			scanDirectoryForTokens(dirPath, tokens, referencedTokens, usageMap);
		}
	}

	return { tokens: referencedTokens, usageMap };
}

/**
 * Recursively scan directory for token usage
 */
function scanDirectoryForTokens(dirPath, tokens, referencedTokens, usageMap = {}) {
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			scanDirectoryForTokens(fullPath, tokens, referencedTokens, usageMap);
		} else if (/\.(svelte|ts|css)$/.test(entry.name)) {
			const content = fs.readFileSync(fullPath, 'utf-8');
			const relativePath = path.relative(PROJECT_ROOT, fullPath);
			const varPattern = /var\(--([a-z0-9-]+)\)/g;
			let match;

			while ((match = varPattern.exec(content)) !== null) {
				const tokenName = match[1];
				if (tokens.has(tokenName)) {
					referencedTokens.add(tokenName);
					if (!usageMap[tokenName]) {
						usageMap[tokenName] = [];
					}
					if (!usageMap[tokenName].includes(relativePath)) {
						usageMap[tokenName].push(relativePath);
					}
				}
			}
		}
	}
}

/**
 * Extract deprecated tokens from design-system.json
 * Returns: { '--token-name': { replacement: '...', reason: '...', since: '...', removed: '...' } }
 */
function extractDeprecatedTokens() {
	if (!fs.existsSync(DESIGN_SYSTEM_FILE)) {
		return {};
	}

	const designSystem = JSON.parse(fs.readFileSync(DESIGN_SYSTEM_FILE, 'utf-8'));
	const deprecated = {};

	/**
	 * Recursively find tokens with $deprecated metadata
	 */
	function findDeprecated(obj, prefix = '') {
		for (const [key, value] of Object.entries(obj)) {
			// Skip metadata keys
			if (key.startsWith('$')) {
				continue;
			}

			const tokenName = prefix ? `${prefix}-${key}` : key;

			if (value && typeof value === 'object') {
				// If this object has $deprecated, it's a deprecated token
				if ('$deprecated' in value) {
					const tokenKey = `--${tokenName}`;
					deprecated[tokenKey] = value.$deprecated;
				} else {
					// Recursively search nested objects
					findDeprecated(value, tokenName);
				}
			}
		}
	}

	findDeprecated(designSystem);
	return deprecated;
}

/**
 * Main validation function
 */
function validateTokens() {
	console.log('🔍 Validating token→utility mapping...\n');

	// Extract tokens from all token CSS files
	const allTokens = extractTokens();
	console.log(`📦 Found ${allTokens.size} design tokens`);

	// Read all utility files
	const utilitiesContent = readAllUtilityFiles();

	// Extract utilities and referenced tokens
	const { utilities, referencedTokens } = extractUtilitiesAndTokens(utilitiesContent);
	console.log(`🔧 Found ${utilities.length} utility classes`);
	console.log(`✅ ${referencedTokens.size} tokens referenced by utilities`);

	// Build utility → token mapping for deprecated token detection
	const utilityToTokenMap = {};
	const utilityRegex = /@utility\s+([a-z0-9-]+)\s*\{([^}]+)\}/g;
	let utilityMatch;
	while ((utilityMatch = utilityRegex.exec(utilitiesContent)) !== null) {
		const utilityName = utilityMatch[1];
		const utilityBody = utilityMatch[2];
		const varPattern = /var\(--([a-z0-9-]+)\)/g;
		let varMatch;
		while ((varMatch = varPattern.exec(utilityBody)) !== null) {
			const tokenName = `--${varMatch[1]}`;
			if (!utilityToTokenMap[utilityName]) {
				utilityToTokenMap[utilityName] = [];
			}
			if (!utilityToTokenMap[utilityName].includes(tokenName)) {
				utilityToTokenMap[utilityName].push(tokenName);
			}
		}
	}

	// Read all token files to find token references
	let allTokenFilesContent = '';
	const tokenFiles = fs.readdirSync(TOKENS_DIR).filter((file) => file.endsWith('.css'));
	for (const file of tokenFiles) {
		const filePath = path.join(TOKENS_DIR, file);
		allTokenFilesContent += fs.readFileSync(filePath, 'utf-8') + '\n';
	}

	// Find tokens referenced by other tokens
	const referencedByTokens = findTokenReferences(allTokenFilesContent, allTokens);

	// Find tokens used directly in CSS (not just utilities)
	const directUsageCSS = findDirectUsageInCSS(allTokenFilesContent + utilitiesContent, allTokens);
	console.log(`📝 ${directUsageCSS.size} tokens used directly in CSS`);

	// Find tokens used directly in components
	const { tokens: directUsageComponentsTokens, usageMap } = findDirectUsageInComponents(allTokens);
	console.log(`🎨 ${directUsageComponentsTokens.size} tokens used directly in components`);

	// Combine all direct usage
	const directUsage = new Set([...directUsageCSS, ...directUsageComponentsTokens]);

	// Extract deprecated tokens from design-system.json
	const deprecatedTokens = extractDeprecatedTokens();
	if (Object.keys(deprecatedTokens).length > 0) {
		console.log(
			`⚠️  Found ${Object.keys(deprecatedTokens).length} deprecated token${Object.keys(deprecatedTokens).length !== 1 ? 's' : ''} in design-system.json`
		);
	}

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

	// Check for deprecated token usage
	const deprecatedUsage = [];
	for (const [tokenName, deprecationInfo] of Object.entries(deprecatedTokens)) {
		// Remove -- prefix for matching
		const tokenKey = tokenName.replace(/^--/, '');

		// Check if deprecated token is used via utilities
		const usedViaUtilities = referencedTokens.has(tokenKey);

		// Check if deprecated token is used directly
		const usedDirectly = referencedByTokens.has(tokenKey) || directUsage.has(tokenKey);

		// Find files using this token
		const files = usageMap[tokenKey] || [];

		// Also check for utility class usage that references this token
		if (usedViaUtilities) {
			// Find which utilities reference this token
			const utilitiesUsingToken = [];
			for (const [utilityName, tokens] of Object.entries(utilityToTokenMap)) {
				if (tokens.includes(tokenName)) {
					utilitiesUsingToken.push(utilityName);
				}
			}

			// Scan for utility class usage in components
			if (utilitiesUsingToken.length > 0) {
				try {
					const componentFiles = execSync(
						'find src -type f \\( -name "*.svelte" -o -name "*.ts" \\) -not -path "*/node_modules/*"',
						{ cwd: PROJECT_ROOT, encoding: 'utf-8' }
					)
						.trim()
						.split('\n')
						.filter(Boolean);

					for (const file of componentFiles) {
						const filePath = path.join(PROJECT_ROOT, file);
						if (!fs.existsSync(filePath)) continue;

						const content = fs.readFileSync(filePath, 'utf-8');
						for (const utilityName of utilitiesUsingToken) {
							const escapedUtility = utilityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
							const utilityRegex = new RegExp(
								`(class|className)=["'][^"']*\\b${escapedUtility}\\b[^"']*["']|\\b${escapedUtility}\\b`,
								'g'
							);
							if (utilityRegex.test(content)) {
								if (!files.includes(file)) {
									files.push(file);
								}
							}
						}
					}
				} catch (_error) {
					// If find command fails, skip utility usage detection
				}
			}
		}

		// If token is used in any way, add to deprecated usage list
		if (usedViaUtilities || usedDirectly || files.length > 0) {
			deprecatedUsage.push({
				token: tokenName,
				files,
				deprecationInfo
			});
		}
	}

	// Report deprecated token usage
	if (deprecatedUsage.length > 0) {
		console.log(
			`\n⚠️  Found ${deprecatedUsage.length} deprecated token${deprecatedUsage.length !== 1 ? 's' : ''} in use:\n`
		);

		for (const { token, files, deprecationInfo } of deprecatedUsage) {
			console.log(`  - ${token}`);
			console.log(`    Deprecated since: ${deprecationInfo.since || 'unknown'}`);
			if (deprecationInfo.removed) {
				console.log(`    Will be removed in: ${deprecationInfo.removed}`);
			}
			if (deprecationInfo.replacement) {
				console.log(`    Replacement: ${deprecationInfo.replacement}`);
			}
			if (deprecationInfo.reason) {
				console.log(`    Reason: ${deprecationInfo.reason}`);
			}
			if (files.length > 0) {
				console.log(`    Used in:`);
				for (const file of files.slice(0, 5)) {
					console.log(`      - ${file}`);
				}
				if (files.length > 5) {
					console.log(
						`      ... and ${files.length - 5} more file${files.length - 5 !== 1 ? 's' : ''}`
					);
				}
			}
			console.log('');
		}

		console.log('💡 Please migrate to replacement tokens before the removal version.\n');
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
		if (deprecatedUsage.length === 0) {
			console.log('\n✅ All tokens have corresponding utilities or are base tokens!\n');
		} else {
			console.log(
				'\n✅ No orphaned tokens found (but deprecated tokens are in use - see warnings above).\n'
			);
		}
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

#!/usr/bin/env tsx
/**
 * Design System Token Validator
 *
 * This script validates that:
 * 1. All semantic tokens reference existing base tokens
 * 2. All generated CSS variables have documented consumers
 *
 * CRITICAL: If this script fails, the FIX is in the tokens or consuming code,
 * NOT in this script. See design-system.md Section 2.4 for consumption patterns.
 *
 * Modifying this script to pass tests is an ARCHITECTURE VIOLATION.
 *
 * Usage:
 *   npm run tokens:validate
 *   npm run tokens:validate -- --fail-on-deprecated
 *
 * @see dev-docs/master-docs/design-system.md Section 2.4 (Token Consumption Patterns)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { VALIDATION_CONFIG } from './design-system/validation-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const TOKENS_DIR = path.join(PROJECT_ROOT, 'src/styles/tokens');
const UTILITIES_DIR = path.join(PROJECT_ROOT, 'src/styles/utilities');
const DESIGN_SYSTEM_FILE = path.join(PROJECT_ROOT, 'design-tokens-base.json');
const DESIGN_SYSTEM_DOCS = 'dev-docs/master-docs/design-system.md';

// Check for --fail-on-deprecated flag
const FAIL_ON_DEPRECATED = process.argv.includes('--fail-on-deprecated');

/**
 * Check if token is consumed via direct var() (not utility class)
 *
 * Uses VALIDATION_CONFIG.directVarConsumed as the source of truth.
 * See design-system.md Section 2.4 for rationale.
 */
function isDirectVarToken(tokenName: string): boolean {
	const config = VALIDATION_CONFIG.directVarConsumed;

	// Check breakpoints
	if (tokenName.startsWith('breakpoint-')) {
		const breakpointName = tokenName.replace('breakpoint-', '');
		return config.breakpoints.includes(breakpointName as any);
	}

	// Check opacity
	if (tokenName.startsWith('opacity-')) {
		const opacityName = tokenName.replace('opacity-', '');
		return config.opacity.includes(opacityName as any);
	}

	// Check syntax colors (handle both --color-syntax-keyword and --color-syntax-keyword-light/dark)
	if (tokenName.startsWith('color-syntax-')) {
		const syntaxName = tokenName
			.replace('color-syntax-', '')
			.replace(/-light$/, '')
			.replace(/-dark$/, '');
		return config.syntax.includes(syntaxName as any);
	}

	return false;
}

/**
 * Generate error message for orphaned token
 */
function reportOrphanedToken(token: string): string {
	return `
ORPHANED TOKEN: --${token}

This token has no documented consumer. To fix:

1. If it should be a utility: Add @utility definition to the appropriate utils file
   Example: Add to src/styles/utilities/color-utils.css:
   @utility bg-${token} {
     background-color: var(--${token});
   }

2. If it's direct var() consumed: Add to VALIDATION_CONFIG.directVarConsumed in
   scripts/design-system/validation-config.ts

3. If it's unused: Remove from token files (design-tokens-base.json or design-tokens-semantic.json)

See: ${DESIGN_SYSTEM_DOCS} Section 2.4 (Token Consumption Patterns)
DO NOT modify this validation script to "fix" this error.
`;
}

/**
 * Read all token CSS files and extract tokens from @theme blocks
 */
function extractTokens(): Set<string> {
	const tokens = new Set<string>();

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
function readAllUtilityFiles(): string {
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
function extractUtilitiesAndTokens(cssContent: string): {
	utilities: string[];
	referencedTokens: Set<string>;
} {
	const utilities: string[] = [];
	const referencedTokens = new Set<string>();

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
function findTokenReferences(cssContent: string, tokens: Set<string>): Set<string> {
	const referencedByTokens = new Set<string>();

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
function isBaseToken(tokenName: string): boolean {
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
function isLegacyToken(tokenName: string): boolean {
	return tokenName.includes('-legacy');
}

/**
 * Find tokens used directly in CSS files (not just utilities)
 */
function findDirectUsageInCSS(cssContent: string, tokens: Set<string>): Set<string> {
	const referencedTokens = new Set<string>();

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
function findDirectUsageInComponents(tokens: Set<string>): {
	tokens: Set<string>;
	usageMap: Record<string, string[]>;
} {
	const referencedTokens = new Set<string>();
	const usageMap: Record<string, string[]> = {}; // Track which files use which tokens

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
function scanDirectoryForTokens(
	dirPath: string,
	tokens: Set<string>,
	referencedTokens: Set<string>,
	usageMap: Record<string, string[]> = {}
): void {
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
function extractDeprecatedTokens(): Record<
	string,
	{ replacement?: string; reason?: string; since?: string; removed?: string }
> {
	if (!fs.existsSync(DESIGN_SYSTEM_FILE)) {
		return {};
	}

	const designSystem = JSON.parse(fs.readFileSync(DESIGN_SYSTEM_FILE, 'utf-8'));
	const deprecated: Record<
		string,
		{ replacement?: string; reason?: string; since?: string; removed?: string }
	> = {};

	/**
	 * Recursively find tokens with $deprecated metadata
	 */
	function findDeprecated(obj: any, prefix = ''): void {
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
					deprecated[tokenKey] = (value as any).$deprecated;
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
function validateTokens(): void {
	console.log('🔍 Validating token→utility mapping...\n');
	console.log(`📚 Using validation config from: scripts/design-system/validation-config.ts`);
	console.log(`📖 See documentation: ${DESIGN_SYSTEM_DOCS} Section 2.4\n`);

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
	const utilityToTokenMap: Record<string, string[]> = {};
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
	const orphanedTokens: string[] = [];

	for (const token of allTokens) {
		// Skip base tokens (intentionally unused)
		if (isBaseToken(token)) {
			continue;
		}

		// Skip legacy tokens (deprecated, intentionally unused)
		if (isLegacyToken(token)) {
			continue;
		}

		// Skip tokens consumed via direct var() (breakpoints, opacity, syntax colors)
		if (isDirectVarToken(token)) {
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
	const deprecatedUsage: Array<{
		token: string;
		files: string[];
		deprecationInfo: { replacement?: string; reason?: string; since?: string; removed?: string };
	}> = [];
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
			const utilitiesUsingToken: string[] = [];
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

	// Exit with error if deprecated tokens found and flag is set
	if (deprecatedUsage.length > 0 && FAIL_ON_DEPRECATED) {
		console.log('\n❌ Deprecated tokens detected. Commit blocked.\n');
		process.exit(1);
	}

	// Report results
	if (orphanedTokens.length > 0) {
		console.log(
			`\n❌ Found ${orphanedTokens.length} orphaned token${orphanedTokens.length !== 1 ? 's' : ''}:\n`
		);

		for (const token of orphanedTokens.sort()) {
			console.log(reportOrphanedToken(token));
		}

		console.log(`\n💡 See ${DESIGN_SYSTEM_DOCS} Section 2.4 for token consumption patterns.\n`);
		console.log('DO NOT modify this validation script to "fix" these errors.\n');

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
	console.error('❌ Validation failed:', (error as Error).message);
	console.error(`\nSee ${DESIGN_SYSTEM_DOCS} Section 2.4 for token consumption patterns.`);
	process.exit(1);
}

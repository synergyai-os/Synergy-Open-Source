#!/usr/bin/env node
/**
 * CSS Conflict Validation Script
 *
 * Validates CSS files for conflicts between handwritten and generated CSS.
 * Detects hardcoded values, conditional token conflicts, org branding conflicts,
 * CSS load order issues, and missing token references.
 *
 * Usage:
 *   npm run validate:css-conflicts
 *   npm run validate:css-conflicts -- --ci
 *   npm run validate:css-conflicts -- --verbose
 *   npm run validate:css-conflicts -- --fix
 *
 * Exit codes:
 *   0: Success, no violations
 *   1: Violations found (CI mode)
 *   2: Script error (fatal)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import postcss from 'postcss';
import { parse } from 'svelte/compiler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

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
 * Find all handwritten CSS files (base.css, components/)
 */
function findHandwrittenCSSFiles() {
	const handwrittenFiles = [];
	const excludePatterns = [/node_modules/, /\.storybook/, /dist/, /build/, /\.git/];

	// Scan base.css (single file, not directory)
	const baseCssPath = path.join(PROJECT_ROOT, 'src/styles/base.css');
	if (fs.existsSync(baseCssPath)) {
		handwrittenFiles.push(baseCssPath);
	}

	// Scan components/ directory (if exists)
	const componentsDir = path.join(PROJECT_ROOT, 'src/styles/components');
	if (fs.existsSync(componentsDir)) {
		const componentFiles = glob.sync('**/*.css', { cwd: componentsDir });
		for (const file of componentFiles) {
			const fullPath = path.join(componentsDir, file);
			// Skip excluded files
			if (!excludePatterns.some((pattern) => pattern.test(fullPath))) {
				handwrittenFiles.push(fullPath);
			}
		}
	}

	return handwrittenFiles;
}

/**
 * Helper: Extract {@html} injections from Svelte content
 */
function extractHtmlInjections(content) {
	const injections = [];
	// Pattern: {@html `...`}
	const htmlPattern = /\{@html\s+`([^`]|\\`)*`\}/gs;
	const matches = Array.from(content.matchAll(htmlPattern));

	for (const match of matches) {
		injections.push({
			full: match[0],
			content: match[1] || '',
			index: match.index || 0
		});
	}

	return injections;
}

/**
 * Helper: Get line number from character index
 */
function getLineNumber(content, index) {
	return content.substring(0, index).split('\n').length;
}

/**
 * Check 8: Org Branding Pattern Validation
 * Validates org branding CSS follows cascade pattern (used by Checks 6 & 7)
 */
function checkOrgBrandingPattern(cssAst, filePath) {
	const violations = [];

	cssAst.walkRules((rule) => {
		// Check if selector matches org branding pattern
		// Pattern: :root.org-{id} or .org-{id}
		if (!rule.selector.match(/(:root\.org-|\.org-)[a-zA-Z0-9]+/)) {
			return; // Not org branding, skip
		}

		// Check declarations
		rule.walkDecls((decl) => {
			const prop = decl.prop;

			if (prop === '--color-accent-primary' || prop === '--color-accent-hover') {
				violations.push({
					file: filePath,
					line: decl.source.start.line,
					type: 'org-branding-pattern-violation',
					token: prop,
					message: `Org branding should only set --color-brand-primary, not ${prop}`,
					suggestion: `Remove ${prop} from org branding CSS. It cascades automatically from --color-brand-primary.`
				});
			}
		});
	});

	return violations;
}

/**
 * Find all generated CSS files (tokens/, utilities/)
 */
function findGeneratedCSSFiles() {
	const generatedFiles = [];

	// Scan tokens/ directory
	const tokensDir = path.join(PROJECT_ROOT, 'src/styles/tokens');
	if (fs.existsSync(tokensDir)) {
		const tokenFiles = glob.sync('**/*.css', { cwd: tokensDir });
		for (const file of tokenFiles) {
			generatedFiles.push(path.join(tokensDir, file));
		}
	}

	// Scan utilities/ directory
	const utilitiesDir = path.join(PROJECT_ROOT, 'src/styles/utilities');
	if (fs.existsSync(utilitiesDir)) {
		const utilityFiles = glob.sync('**/*.css', { cwd: utilitiesDir });
		for (const file of utilityFiles) {
			generatedFiles.push(path.join(utilitiesDir, file));
		}
	}

	return generatedFiles;
}

/**
 * Extract tokens and conditional tokens from generated CSS files
 */
function extractGeneratedTokens(generatedFiles) {
	const tokens = new Set();
	const conditionalTokens = new Set();

	for (const file of generatedFiles) {
		try {
			const content = fs.readFileSync(file, 'utf-8');
			const ast = postcss.parse(content);

			// Extract all CSS variables
			ast.walkDecls((decl) => {
				if (decl.prop.startsWith('--')) {
					const tokenName = decl.prop.slice(2); // Remove '--' prefix
					tokens.add(tokenName);

					// Check if conditional (in media query or .light/.dark selector)
					// Walk up parent chain to find media query or selector
					let parent = decl.parent;
					while (parent) {
						// Check if in media query with prefers-color-scheme
						if (parent.type === 'atrule' && parent.name === 'media') {
							if (parent.params.includes('prefers-color-scheme')) {
								conditionalTokens.add(tokenName);
								break;
							}
						}

						// Check if in .light/.dark selector
						if (parent.type === 'rule') {
							const selector = parent.selector.trim();
							if (
								selector === '.light' ||
								selector === '.dark' ||
								selector === ':root.light' ||
								selector === ':root.dark'
							) {
								conditionalTokens.add(tokenName);
								break;
							}
						}

						parent = parent.parent;
					}
				}
			});
		} catch (error) {
			console.warn(`${colors.yellow}⚠️  Failed to parse ${file}: ${error.message}${colors.reset}`);
		}
	}

	return { tokens, conditionalTokens };
}

/**
 * Check 1: Hardcoded Values in Handwritten CSS
 */
function checkHardcodedValues(ast, filePath) {
	const violations = [];
	const safePatterns = ['transparent', 'currentColor', 'inherit', 'initial', 'unset'];

	ast.walkDecls((decl) => {
		const value = decl.value.trim();

		// Skip safe patterns
		if (safePatterns.includes(value)) return;

		// Skip if value is a CSS variable reference
		if (value.startsWith('var(')) return;

		// Check for hardcoded color formats
		const hardcodedPatterns = [
			/oklch\([^)]+\)/i, // oklch(55.4% 0.218 251.813)
			/#[0-9a-fA-F]{3,8}/, // #fff, #ffffff, #ffffffff
			/rgb\([^)]+\)/i, // rgb(255, 0, 0)
			/rgba\([^)]+\)/i, // rgba(255, 0, 0, 0.5)
			/hsl\([^)]+\)/i, // hsl(0, 100%, 50%)
			/hsla\([^)]+\)/i // hsla(0, 100%, 50%, 0.5)
		];

		for (const pattern of hardcodedPatterns) {
			if (pattern.test(value)) {
				violations.push({
					file: filePath,
					line: decl.source.start.line,
					column: decl.source.start.column,
					type: 'hardcoded-color',
					property: decl.prop,
					value: value,
					suggestion: `Replace with design token (e.g., var(--color-accent-primary))`
				});
				break; // Only report once per declaration
			}
		}
	});

	return violations;
}

/**
 * Check 2: Conditional Token Conflicts
 */
function checkConditionalTokenConflicts(ast, filePath, conditionalTokenNames) {
	const violations = [];

	// Check for media queries in handwritten CSS
	ast.walkAtRules('media', (atRule) => {
		const params = atRule.params;
		if (params.includes('prefers-color-scheme')) {
			// Check if this media query defines conditional tokens
			atRule.walkDecls((decl) => {
				const tokenName = decl.prop;
				if (tokenName.startsWith('--') && conditionalTokenNames.has(tokenName.slice(2))) {
					violations.push({
						file: filePath,
						line: atRule.source.start.line,
						type: 'conditional-conflict',
						token: tokenName,
						conflict: 'media-query',
						suggestion: `Remove media query, use generated token: var(${tokenName})`
					});
				}
			});
		}
	});

	// Check for .light/.dark class selectors in handwritten CSS
	ast.walkRules((rule) => {
		const selector = rule.selector.trim();

		// Match .light, .dark, :root.light, :root.dark, html.light, html.dark
		// Also handle multiple selectors: .light, .dark
		// But NOT .light .sidebar (descendant selector - ignore)
		// Pattern: Start of selector or after comma, followed by .light/.dark/:root.light/etc, then space/comma/end
		const lightDarkPattern =
			/(^|,)\s*(\.light|\.dark|:root\.light|:root\.dark|html\.light|html\.dark)(\s|,|$)/;
		const lightDarkMatch = selector.match(lightDarkPattern);

		// Only flag if match found AND not a descendant selector (e.g., .light .sidebar)
		if (lightDarkMatch && !selector.includes(' ')) {
			rule.walkDecls((decl) => {
				const tokenName = decl.prop;
				if (tokenName.startsWith('--') && conditionalTokenNames.has(tokenName.slice(2))) {
					violations.push({
						file: filePath,
						line: rule.source.start.line,
						type: 'conditional-conflict',
						token: tokenName,
						conflict: 'class-selector',
						selector: selector,
						suggestion: `Remove .light/.dark selector, use generated token: var(${tokenName})`
					});
				}
			});
		}
	});

	return violations;
}

/**
 * Check 3: Org Branding Conflicts
 */
function checkOrgBrandingConflicts(ast, filePath) {
	const violations = [];

	// Check for .org-* class selectors in handwritten CSS
	ast.walkRules((rule) => {
		const selector = rule.selector.trim();
		const orgClassMatch = selector.match(/\.org-[a-zA-Z0-9]+/);

		if (orgClassMatch) {
			violations.push({
				file: filePath,
				line: rule.source.start.line,
				type: 'org-branding-conflict',
				selector: selector,
				suggestion:
					'Org branding should only be injected via inline <style> tags, not handwritten CSS'
			});
		}
	});

	// Check for --color-brand-primary/--color-brand-secondary overrides
	ast.walkDecls((decl) => {
		if (decl.prop === '--color-brand-primary' || decl.prop === '--color-brand-secondary') {
			// Only flag if NOT in an .org-* selector (org branding is allowed in inline styles)
			const parent = decl.parent;
			if (parent && parent.type === 'rule') {
				const selector = parent.selector;
				if (!selector.match(/\.org-[a-zA-Z0-9]+/)) {
					violations.push({
						file: filePath,
						line: decl.source.start.line,
						type: 'org-branding-conflict',
						token: decl.prop,
						suggestion:
							'Brand tokens should only be overridden via org branding (inline <style> tags), not handwritten CSS'
					});
				}
			}
		}
	});

	return violations;
}

/**
 * Check 4: CSS Load Order
 */
function checkCSSLoadOrder(appCssPath) {
	const violations = [];

	if (!fs.existsSync(appCssPath)) {
		return violations;
	}

	try {
		const content = fs.readFileSync(appCssPath, 'utf-8');
		const ast = postcss.parse(content);

		const imports = [];
		ast.walkAtRules('import', (atRule) => {
			imports.push({
				line: atRule.source.start.line,
				path: atRule.params.replace(/['"]/g, '')
			});
		});

		// Find first token import and first non-token import
		let firstTokenImportIndex = -1;
		let firstNonTokenImportIndex = -1;

		for (let i = 0; i < imports.length; i++) {
			const importPath = imports[i].path;

			// Skip tailwindcss import (special case, allowed before tokens)
			if (importPath === 'tailwindcss' || importPath.includes('tailwindcss')) {
				continue;
			}

			if (importPath.includes('/tokens/') && firstTokenImportIndex === -1) {
				firstTokenImportIndex = i;
			}

			if (
				!importPath.includes('/tokens/') &&
				!importPath.includes('/utilities/') &&
				firstNonTokenImportIndex === -1
			) {
				firstNonTokenImportIndex = i;
			}
		}

		// Verify tokens imported before base/components
		if (
			firstNonTokenImportIndex !== -1 &&
			firstTokenImportIndex !== -1 &&
			firstNonTokenImportIndex < firstTokenImportIndex
		) {
			violations.push({
				file: appCssPath,
				line: imports[firstNonTokenImportIndex].line,
				type: 'load-order',
				message: 'Tokens not imported first',
				suggestion: 'Move token imports to top of file (before base/component imports)'
			});
		}
	} catch (error) {
		console.warn(
			`${colors.yellow}⚠️  Failed to parse ${appCssPath}: ${error.message}${colors.reset}`
		);
	}

	return violations;
}

/**
 * Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1, str2) {
	const matrix = [];
	const len1 = str1.length;
	const len2 = str2.length;

	// Initialize matrix
	for (let i = 0; i <= len1; i++) {
		matrix[i] = [i];
	}
	for (let j = 0; j <= len2; j++) {
		matrix[0][j] = j;
	}

	// Fill matrix
	for (let i = 1; i <= len1; i++) {
		for (let j = 1; j <= len2; j++) {
			const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1, // deletion
				matrix[i][j - 1] + 1, // insertion
				matrix[i - 1][j - 1] + cost // substitution
			);
		}
	}

	return matrix[len1][len2];
}

/**
 * Find similar tokens (fuzzy matching)
 */
function findSimilarTokens(tokenName, allTokens, maxDistance = 3) {
	const scores = [];
	for (const token of allTokens) {
		const distance = levenshteinDistance(tokenName, token);
		if (distance <= maxDistance) {
			scores.push({ token, distance });
		}
	}

	return scores
		.sort((a, b) => a.distance - b.distance)
		.slice(0, 5)
		.map((s) => `--${s.token}`);
}

/**
 * Check 5: Token Existence
 */
function checkTokenExistence(ast, filePath, generatedTokens, generatedUtilities) {
	const violations = [];
	const allTokens = new Set([...generatedTokens, ...generatedUtilities]);

	// Extract all var() references
	ast.walkDecls((decl) => {
		const value = decl.value;
		const varPattern = /var\(--([a-zA-Z0-9-]+)\)/g;
		let match;

		while ((match = varPattern.exec(value)) !== null) {
			const tokenName = match[1];

			// Skip if token exists
			if (allTokens.has(tokenName)) continue;

			// Find similar tokens (fuzzy match for suggestions)
			const suggestions = findSimilarTokens(tokenName, allTokens);

			violations.push({
				file: filePath,
				line: decl.source.start.line,
				type: 'missing-token',
				token: `--${tokenName}`,
				suggestions: suggestions.slice(0, 3) // Top 3 suggestions
			});
		}
	});

	return violations;
}

/**
 * Check 6: Svelte Inline Styles
 * Detects CSS in Svelte <style> tags and {@html} injections
 */
function checkSvelteInlineStyles(
	svelteFilePath,
	conditionalTokenNames,
	generatedTokens,
	generatedUtilities
) {
	const violations = [];
	const content = fs.readFileSync(svelteFilePath, 'utf-8');

	try {
		// Parse Svelte AST
		const ast = parse(content, { modern: true });

		// Check <style> blocks (if any)
		// Note: ast.css is null if no <style> blocks exist
		if (ast.css && ast.css.content) {
			try {
				const cssAst = postcss.parse(ast.css.content);
				violations.push(...checkOrgBrandingPattern(cssAst, svelteFilePath));
			} catch (error) {
				// Invalid CSS - skip
			}
		}

		// Check {@html} CSS injection (template literals)
		// Pattern: {@html `<style>${cssString}</style>`}
		const htmlInjections = extractHtmlInjections(content);
		for (const injection of htmlInjections) {
			// Check if injection contains style tag and org branding
			if (injection.content.includes('style') || injection.full.includes('style')) {
				// Extract CSS from <style> tag (may contain template variables)
				const cssMatch = injection.full.match(/<style>(.*?)<\/style>/s);
				if (cssMatch) {
					const cssContent = cssMatch[1];
					// Check for org branding violations in template literal
					// Pattern: :root.org-${...} { ... --color-accent-primary ... }
					if (cssContent.includes(':root.org-') || cssContent.includes('.org-')) {
						// Check for violations (accent tokens)
						if (
							cssContent.includes('--color-accent-primary') ||
							cssContent.includes('--color-accent-hover')
						) {
							const lineNum = getLineNumber(content, injection.index);
							if (cssContent.includes('--color-accent-primary')) {
								violations.push({
									file: svelteFilePath,
									line: lineNum,
									type: 'org-branding-pattern-violation',
									token: 'accent-primary',
									message:
										'Org branding should only set --color-brand-primary, not --color-accent-primary',
									suggestion:
										'Remove --color-accent-primary from org branding CSS. It cascades automatically from --color-brand-primary.'
								});
							}
							if (cssContent.includes('--color-accent-hover')) {
								violations.push({
									file: svelteFilePath,
									line: lineNum,
									type: 'org-branding-pattern-violation',
									token: 'accent-hover',
									message:
										'Org branding should only set --color-brand-primaryHover, not --color-accent-hover',
									suggestion:
										'Remove --color-accent-hover from org branding CSS. It cascades automatically from --color-brand-primaryHover.'
								});
							}
						}
					}
				}
			}
		}
	} catch (error) {
		// Svelte parse error - skip file
		console.warn(
			`${colors.yellow}⚠️  Failed to parse Svelte file ${svelteFilePath}: ${error.message}${colors.reset}`
		);
	}

	return violations;
}

/**
 * Check 7: CSS Template Literals
 * Detects CSS in JavaScript/TypeScript template literals
 */
function checkCSSTemplateLiterals(tsFilePath) {
	const violations = [];
	const content = fs.readFileSync(tsFilePath, 'utf-8');

	// Pattern: Match template literal with org branding selector
	// Pattern: `:root.org-${orgId} { ... }`
	// Note: We match the entire template literal, then check for violations inside
	const orgBrandingPattern = /`:root\.org-\$\{[^}]+\}\s*\{[^`]+\}`/gs;

	const matches = Array.from(content.matchAll(orgBrandingPattern));

	for (const match of matches) {
		const templateContent = match[0];
		const lineNumber = getLineNumber(content, match.index);

		// Check for accent-primary violation
		if (templateContent.includes('--color-accent-primary')) {
			violations.push({
				file: tsFilePath,
				line: lineNumber,
				type: 'org-branding-pattern-violation',
				token: 'accent-primary',
				message: 'Org branding should only set --color-brand-primary, not --color-accent-primary',
				suggestion:
					'Remove --color-accent-primary from org branding CSS. It cascades automatically from --color-brand-primary.'
			});
		}

		// Check for accent-hover violation
		if (templateContent.includes('--color-accent-hover')) {
			violations.push({
				file: tsFilePath,
				line: lineNumber,
				type: 'org-branding-pattern-violation',
				token: 'accent-hover',
				message:
					'Org branding should only set --color-brand-primaryHover, not --color-accent-hover',
				suggestion:
					'Remove --color-accent-hover from org branding CSS. It cascades automatically from --color-brand-primaryHover.'
			});
		}
	}

	return violations;
}

/**
 * Find all Svelte files for Check 6
 */
function findSvelteFiles() {
	const svelteFiles = [];
	const excludePatterns = [/node_modules/, /\.storybook/, /dist/, /build/, /\.git/];

	const srcDir = path.join(PROJECT_ROOT, 'src');
	if (fs.existsSync(srcDir)) {
		const files = glob.sync('**/*.svelte', { cwd: srcDir });
		for (const file of files) {
			const fullPath = path.join(srcDir, file);
			if (!excludePatterns.some((pattern) => pattern.test(fullPath))) {
				svelteFiles.push(fullPath);
			}
		}
	}

	return svelteFiles;
}

/**
 * Find all TypeScript/JavaScript files for Check 7
 */
function findTSJSFiles() {
	const tsjsFiles = [];
	const excludePatterns = [/node_modules/, /\.storybook/, /dist/, /build/, /\.git/, /_generated/];

	const srcDir = path.join(PROJECT_ROOT, 'src');
	if (fs.existsSync(srcDir)) {
		const files = glob.sync('**/*.{ts,js}', { cwd: srcDir });
		for (const file of files) {
			const fullPath = path.join(srcDir, file);
			if (!excludePatterns.some((pattern) => pattern.test(fullPath))) {
				tsjsFiles.push(fullPath);
			}
		}
	}

	return tsjsFiles;
}

/**
 * Scan a CSS file for violations
 */
function scanCSSFile(filePath, conditionalTokenNames, generatedTokens, generatedUtilities) {
	const violations = [];

	try {
		if (!fs.existsSync(filePath)) {
			console.warn(`${colors.yellow}⚠️  File not found: ${filePath}${colors.reset}`);
			return violations;
		}

		const content = fs.readFileSync(filePath, 'utf-8');
		if (!content.trim()) {
			return violations; // Empty file, no violations
		}

		const ast = postcss.parse(content);

		// Run all checks
		violations.push(...checkHardcodedValues(ast, filePath));
		violations.push(...checkConditionalTokenConflicts(ast, filePath, conditionalTokenNames));
		violations.push(...checkOrgBrandingConflicts(ast, filePath));
		violations.push(...checkTokenExistence(ast, filePath, generatedTokens, generatedUtilities));
	} catch (error) {
		if (error.name === 'CssSyntaxError') {
			console.warn(
				`${colors.yellow}⚠️  Invalid CSS syntax in ${filePath}: ${error.message}${colors.reset}`
			);
			return violations; // Skip file, continue
		}
		throw error; // Re-throw other errors
	}

	return violations;
}

/**
 * Format violation for output
 */
function formatViolation(violation, verbose = false) {
	const relativePath = path.relative(PROJECT_ROOT, violation.file);
	const lineInfo = `${relativePath}:${violation.line}`;

	switch (violation.type) {
		case 'hardcoded-color':
			return `${lineInfo}\n  ${colors.red}❌ Hardcoded color: ${violation.value}${colors.reset}\n  Property: ${violation.property}\n  → ${violation.suggestion}`;

		case 'conditional-conflict':
			return `${lineInfo}\n  ${colors.red}❌ Conditional token conflict: ${violation.token}${colors.reset}\n  Conflict: ${violation.conflict === 'media-query' ? '@media (prefers-color-scheme: light/dark)' : `.light/.dark selector`}\n  → ${violation.suggestion}`;

		case 'org-branding-conflict':
			return `${lineInfo}\n  ${colors.red}❌ Org branding conflict: ${violation.selector || violation.token}${colors.reset}\n  → ${violation.suggestion}`;

		case 'org-branding-pattern-violation':
			return `${lineInfo}\n  ${colors.red}❌ Org branding pattern violation: ${violation.token}${colors.reset}\n  → ${violation.message}\n  → ${violation.suggestion}`;

		case 'load-order':
			return `${lineInfo}\n  ${colors.yellow}⚠️  Load order issue: ${violation.message}${colors.reset}\n  → ${violation.suggestion}`;

		case 'missing-token':
			const suggestions =
				violation.suggestions && violation.suggestions.length > 0
					? `\n  → Available: ${violation.suggestions.join(', ')}`
					: '';
			return `${lineInfo}\n  ${colors.red}❌ Missing token: ${violation.token}${colors.reset}${suggestions}`;

		default:
			return `${lineInfo}\n  ${colors.red}❌ Unknown violation type${colors.reset}`;
	}
}

/**
 * Main validation function
 */
function validateCSSConflicts(options = {}) {
	const { ci = false, verbose = false, fix = false } = options;

	console.log(`${colors.blue}🔍 Validating CSS conflicts...${colors.reset}\n`);

	// Find files
	const handwrittenFiles = findHandwrittenCSSFiles();
	const generatedFiles = findGeneratedCSSFiles();

	if (verbose) {
		console.log(`${colors.gray}Files to scan:${colors.reset}`);
		handwrittenFiles.forEach((file) => {
			console.log(`  ${colors.gray}🔍 ${path.relative(PROJECT_ROOT, file)}${colors.reset}`);
		});
		console.log(`${colors.gray}Generated files (skipped):${colors.reset}`);
		generatedFiles.forEach((file) => {
			console.log(`  ${colors.gray}✅ ${path.relative(PROJECT_ROOT, file)}${colors.reset}`);
		});
		console.log('');
	}

	// Extract tokens from generated files
	const { tokens, conditionalTokens } = extractGeneratedTokens(generatedFiles);

	if (verbose) {
		console.log(
			`${colors.gray}Found ${tokens.size} tokens, ${conditionalTokens.size} conditional tokens${colors.reset}\n`
		);
	}

	// Scan handwritten files (Checks 1-5)
	const allViolations = [];
	for (const file of handwrittenFiles) {
		const violations = scanCSSFile(file, conditionalTokens, tokens, new Set());
		allViolations.push(...violations);
	}

	// Check CSS load order (only for app.css)
	const appCssPath = path.join(PROJECT_ROOT, 'src/styles/app.css');
	const loadOrderViolations = checkCSSLoadOrder(appCssPath);
	allViolations.push(...loadOrderViolations);

	// Check 6: Svelte inline styles
	if (verbose) {
		console.log(
			`${colors.gray}📄 Scanning Svelte files... org branding pattern validation${colors.reset}`
		);
	}
	const svelteFiles = findSvelteFiles();
	for (const file of svelteFiles) {
		const violations = checkSvelteInlineStyles(file, conditionalTokens, tokens, new Set());
		allViolations.push(...violations);
		if (verbose && violations.length > 0) {
			console.log(`${colors.gray}  ✓ Scanned ${path.relative(PROJECT_ROOT, file)}${colors.reset}`);
		}
	}

	// Check 7: CSS template literals in TS/JS files
	if (verbose) {
		console.log(
			`${colors.gray}📄 Scanning TS/JS files... CSS template literal validation${colors.reset}`
		);
	}
	const tsjsFiles = findTSJSFiles();
	for (const file of tsjsFiles) {
		const violations = checkCSSTemplateLiterals(file);
		allViolations.push(...violations);
		if (verbose && violations.length > 0) {
			console.log(`${colors.gray}  ✓ Scanned ${path.relative(PROJECT_ROOT, file)}${colors.reset}`);
		}
	}

	// Group violations by type
	const violationsByType = {
		'hardcoded-color': [],
		'conditional-conflict': [],
		'org-branding-conflict': [],
		'org-branding-pattern-violation': [],
		'load-order': [],
		'missing-token': []
	};

	for (const violation of allViolations) {
		if (violationsByType[violation.type]) {
			violationsByType[violation.type].push(violation);
		}
	}

	// Report violations
	if (allViolations.length > 0) {
		if (ci) {
			// CI mode: concise output
			console.error(
				`${colors.red}❌ CSS Conflict Validation Failed (${allViolations.length} violations)${colors.reset}`
			);
			for (const violation of allViolations) {
				const relativePath = path.relative(PROJECT_ROOT, violation.file);
				console.error(`${relativePath}:${violation.line}: ${violation.type}`);
			}
		} else {
			// Default mode: detailed output
			console.error(`${colors.red}❌ CSS Conflict Validation Failed${colors.reset}\n`);

			const checkNames = {
				'hardcoded-color': 'Check 1: Hardcoded Values',
				'conditional-conflict': 'Check 2: Conditional Token Conflicts',
				'org-branding-conflict': 'Check 3: Org Branding Conflicts',
				'load-order': 'Check 4: CSS Load Order',
				'missing-token': 'Check 5: Token Existence',
				'org-branding-pattern-violation': 'Check 6-8: Org Branding Pattern (Svelte/TS/JS)'
			};

			for (const [type, violations] of Object.entries(violationsByType)) {
				if (violations.length > 0) {
					console.error(`[${checkNames[type] || type}]`);
					for (const violation of violations) {
						console.error(formatViolation(violation, verbose));
					}
					console.error('');
				}
			}

			console.error(`[Summary]`);
			console.error(
				`Found ${allViolations.length} violation${allViolations.length !== 1 ? 's' : ''}`
			);
			console.error(`Run 'npm run validate:css-conflicts' to check again`);
		}

		return { violations: allViolations, success: false };
	} else {
		console.log(`${colors.green}✅ No CSS conflicts found${colors.reset}\n`);
		return { violations: [], success: true };
	}
}

/**
 * Parse CLI arguments
 */
function parseArgs() {
	const args = process.argv.slice(2);
	return {
		ci: args.includes('--ci'),
		verbose: args.includes('--verbose'),
		fix: args.includes('--fix')
	};
}

// Main execution
try {
	const options = parseArgs();
	const result = validateCSSConflicts(options);

	if (!result.success) {
		process.exit(options.ci ? 1 : 1); // Exit 1 on violations
	} else {
		process.exit(0); // Exit 0 on success
	}
} catch (error) {
	console.error(`${colors.red}❌ Validation failed: ${error.message}${colors.reset}`);
	if (error.stack) {
		console.error(error.stack);
	}
	process.exit(2); // Exit 2 on script error
}

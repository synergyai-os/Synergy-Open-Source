#!/usr/bin/env node
/**
 * CSS Conflict Audit Script
 *
 * Scans src/app.css for hardcoded color values (OKLCH, hex, RGB, HSL)
 * and cross-references with generated tokens to identify conflicts.
 *
 * Part of SYOS-552: Audit src/app.css for Hardcoded Values
 *
 * Usage:
 *   node scripts/audit-css-conflicts.js
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const OLD_CSS_FILE = path.join(PROJECT_ROOT, 'src/app.css');
const GENERATED_TOKENS_FILE = path.join(PROJECT_ROOT, 'src/styles/tokens/colors.css');

/**
 * Extract hardcoded color values from CSS content
 * Returns: Array of { line, value, type, tokenName (if found) }
 */
function extractHardcodedColors(cssContent) {
	const findings = [];
	const lines = cssContent.split('\n');

	// Patterns for different color formats
	const patterns = [
		{
			name: 'OKLCH',
			regex: /oklch\([^)]+\)/gi,
			example: 'oklch(55.4% 0.218 251.813)'
		},
		{
			name: 'Hex',
			regex: /#[0-9a-fA-F]{3,6}\b/g,
			// eslint-disable-next-line synergyos/no-hardcoded-design-values
			example: '#000000' // Example hex color (not a design token violation - this is documentation)
		},
		{
			name: 'RGB',
			regex: /rgb\([^)]+\)/gi,
			example: 'rgb(59, 130, 246)'
		},
		{
			name: 'RGBA',
			regex: /rgba\([^)]+\)/gi,
			example: 'rgba(59, 130, 246, 0.5)'
		},
		{
			name: 'HSL',
			regex: /hsl\([^)]+\)/gi,
			example: 'hsl(217, 91%, 60%)'
		},
		{
			name: 'HSLA',
			regex: /hsla\([^)]+\)/gi,
			example: 'hsla(217, 91%, 60%, 0.5)'
		}
	];

	for (let lineNum = 0; lineNum < lines.length; lineNum++) {
		const line = lines[lineNum];
		const lineNumber = lineNum + 1; // 1-indexed

		// Skip comments-only lines
		if (/^\s*\/\//.test(line)) {
			continue;
		}

		// Extract CSS custom property name if present
		const tokenMatch = line.match(/--([a-z0-9-]+)\s*:/);
		const tokenName = tokenMatch ? tokenMatch[1] : null;

		// Check each color pattern
		for (const pattern of patterns) {
			const matches = line.matchAll(pattern.regex);
			for (const match of matches) {
				const value = match[0];
				const column = match.index + 1; // 1-indexed

				// Skip if it's inside a var() reference (token reference, not hardcoded)
				if (line.substring(0, match.index).includes('var(')) {
					continue;
				}

				// Skip if it's inside a comment
				const beforeMatch = line.substring(0, match.index);
				const commentStart = beforeMatch.lastIndexOf('/*');
				const commentEnd = beforeMatch.lastIndexOf('*/');
				if (commentStart > commentEnd) {
					continue; // Inside comment
				}

				findings.push({
					line: lineNumber,
					column,
					value,
					type: pattern.name,
					tokenName,
					fullLine: line.trim()
				});
			}
		}
	}

	return findings;
}

/**
 * Extract generated tokens from colors.css
 * Returns: Map of tokenName -> { value, line }
 */
function extractGeneratedTokens(cssContent) {
	const tokens = new Map();
	const lines = cssContent.split('\n');

	for (let lineNum = 0; lineNum < lines.length; lineNum++) {
		const line = lines[lineNum];
		const lineNumber = lineNum + 1;

		// Match: --token-name: value;
		const tokenMatch = line.match(/^\s*--([a-z0-9-]+)\s*:\s*(.+?);/);
		if (tokenMatch) {
			const tokenName = tokenMatch[1];
			const value = tokenMatch[2].trim();

			// Extract actual color value (handle var() references)
			let actualValue = value;
			if (value.startsWith('var(')) {
				// Follow the reference chain (simplified - just note it's a reference)
				actualValue = `var(${value.match(/var\(([^)]+)\)/)?.[1] || 'unknown'})`;
			}

			tokens.set(tokenName, {
				value: actualValue,
				originalValue: value,
				line: lineNumber
			});
		}
	}

	return tokens;
}

/**
 * Normalize color values for comparison
 * Converts all formats to a comparable string
 */
function normalizeColorValue(value) {
	// Remove whitespace
	value = value.trim();

	// Normalize OKLCH (remove spaces, lowercase)
	if (value.toLowerCase().startsWith('oklch')) {
		return value
			.toLowerCase()
			.replace(/\s+/g, ' ')
			.replace(/,\s*/g, ',')
			.replace(/\s*,\s*/g, ',');
	}

	// Normalize hex (lowercase, expand shorthand)
	if (value.startsWith('#')) {
		const hex = value.toLowerCase();
		if (hex.length === 4) {
			// Expand #abc to #aabbcc
			return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
		}
		return hex;
	}

	// Normalize RGB/RGBA (remove spaces, lowercase)
	if (value.toLowerCase().startsWith('rgb')) {
		return value.toLowerCase().replace(/\s+/g, '');
	}

	// Normalize HSL/HSLA (remove spaces, lowercase)
	if (value.toLowerCase().startsWith('hsl')) {
		return value.toLowerCase().replace(/\s+/g, '');
	}

	return value.toLowerCase();
}

/**
 * Compare two color values to see if they're the same
 */
function colorsMatch(value1, value2) {
	const normalized1 = normalizeColorValue(value1);
	const normalized2 = normalizeColorValue(value2);

	// Direct match
	if (normalized1 === normalized2) {
		return true;
	}

	// Try to parse and compare (simplified - for exact matches)
	// This is a basic comparison - may need enhancement for production
	return normalized1 === normalized2;
}

/**
 * Categorize findings
 */
function categorizeFindings(findings, generatedTokens) {
	const conflicts = [];
	const legacy = [];
	const safe = [];

	for (const finding of findings) {
		// If finding has a token name, check if it conflicts with generated token
		if (finding.tokenName) {
			const generatedToken = generatedTokens.get(finding.tokenName);

			if (generatedToken) {
				// Token exists in generated file - check if values match
				const generatedValue = generatedToken.originalValue;

				// Check if generated token uses var() reference (not hardcoded)
				if (generatedValue.startsWith('var(')) {
					// Generated token references another token - this is a conflict
					conflicts.push({
						...finding,
						category: 'conflict',
						generatedValue,
						reason: `Generated token uses var() reference, but old CSS has hardcoded value`
					});
				} else if (!colorsMatch(finding.value, generatedValue)) {
					// Values don't match - conflict
					conflicts.push({
						...finding,
						category: 'conflict',
						generatedValue,
						reason: `Hardcoded value differs from generated token`
					});
				} else {
					// Values match - safe (but should still migrate to token reference)
					safe.push({
						...finding,
						category: 'safe',
						generatedValue,
						reason: `Values match, but should use token reference instead`
					});
				}
			} else {
				// Token name exists in old CSS but not in generated tokens - legacy
				legacy.push({
					...finding,
					category: 'legacy',
					reason: `Token name exists in old CSS but not in generated tokens`
				});
			}
		} else {
			// No token name - check if value matches any generated token
			let matched = false;
			for (const [tokenName, tokenData] of generatedTokens.entries()) {
				if (colorsMatch(finding.value, tokenData.originalValue)) {
					matched = true;
					legacy.push({
						...finding,
						category: 'legacy',
						reason: `Hardcoded value matches generated token '--${tokenName}' but no token name in old CSS`,
						suggestedToken: `--${tokenName}`
					});
					break;
				}
			}

			if (!matched) {
				// No match found - legacy value
				legacy.push({
					...finding,
					category: 'legacy',
					reason: `Hardcoded value with no token equivalent found`
				});
			}
		}
	}

	return { conflicts, legacy, safe };
}

/**
 * Generate audit report
 */
function generateReport({ conflicts, legacy, safe }, outputPath) {
	const report = {
		generatedAt: new Date().toISOString(),
		summary: {
			total: conflicts.length + legacy.length + safe.length,
			conflicts: conflicts.length,
			legacy: legacy.length,
			safe: safe.length
		},
		conflicts,
		legacy,
		safe,
		recommendations: {
			migrationEffort: estimateMigrationEffort(conflicts.length, legacy.length, safe.length),
			priority: conflicts.length > 0 ? 'HIGH' : legacy.length > 0 ? 'MEDIUM' : 'LOW'
		}
	};

	// Write JSON report
	fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');

	// Also generate markdown report
	const markdownPath = outputPath.replace('.json', '.md');
	const markdown = generateMarkdownReport(report);
	fs.writeFileSync(markdownPath, markdown, 'utf-8');

	return report;
}

/**
 * Estimate migration effort in hours
 */
function estimateMigrationEffort(conflicts, legacy, safe) {
	// Conflicts: Critical - need immediate fix (0.5h each)
	// Legacy: Need token creation + migration (1h each)
	// Safe: Simple replacement (0.25h each)
	const conflictHours = conflicts * 0.5;
	const legacyHours = legacy * 1.0;
	const safeHours = safe * 0.25;

	const totalHours = conflictHours + legacyHours + safeHours;

	return {
		conflicts: conflictHours,
		legacy: legacyHours,
		safe: safeHours,
		total: totalHours,
		estimate: `${Math.ceil(totalHours)} hours`
	};
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report) {
	const { summary, conflicts, legacy, safe, recommendations } = report;

	let md = `# CSS Conflict Audit Report\n\n`;
	md += `**Generated**: ${new Date(report.generatedAt).toLocaleString()}\n\n`;
	md += `## Summary\n\n`;
	md += `- **Total hardcoded values**: ${summary.total}\n`;
	md += `- **Conflicts** (CRITICAL): ${summary.conflicts}\n`;
	md += `- **Legacy** (needs tokens): ${summary.legacy}\n`;
	md += `- **Safe** (values match): ${summary.safe}\n\n`;
	md += `**Migration Estimate**: ${recommendations.migrationEffort.estimate}\n`;
	md += `**Priority**: ${recommendations.priority}\n\n`;

	if (conflicts.length > 0) {
		md += `## 🔴 Conflicts (CRITICAL)\n\n`;
		md += `These hardcoded values override generated tokens, breaking the cascade:\n\n`;
		for (const conflict of conflicts) {
			md += `### Line ${conflict.line}:${conflict.column} - \`${conflict.tokenName}\`\n\n`;
			md += `- **Type**: ${conflict.type}\n`;
			md += `- **Hardcoded value**: \`${conflict.value}\`\n`;
			md += `- **Generated value**: \`${conflict.generatedValue}\`\n`;
			md += `- **Reason**: ${conflict.reason}\n`;
			md += `- **Line**: \`${conflict.fullLine}\`\n\n`;
		}
	}

	if (legacy.length > 0) {
		md += `## 🟡 Legacy Values (Need Token Creation)\n\n`;
		md += `These hardcoded values don't have token equivalents:\n\n`;
		for (const item of legacy) {
			md += `### Line ${item.line}:${item.column}\n\n`;
			md += `- **Type**: ${item.type}\n`;
			md += `- **Value**: \`${item.value}\`\n`;
			if (item.tokenName) {
				md += `- **Token name**: \`--${item.tokenName}\`\n`;
			}
			if (item.suggestedToken) {
				md += `- **Suggested token**: \`${item.suggestedToken}\`\n`;
			}
			md += `- **Reason**: ${item.reason}\n`;
			md += `- **Line**: \`${item.fullLine}\`\n\n`;
		}
	}

	if (safe.length > 0) {
		md += `## 🟢 Safe Values (Values Match)\n\n`;
		md += `These values match generated tokens but should still use token references:\n\n`;
		for (const item of safe) {
			md += `### Line ${item.line}:${item.column} - \`${item.tokenName}\`\n\n`;
			md += `- **Type**: ${item.type}\n`;
			md += `- **Value**: \`${item.value}\`\n`;
			md += `- **Generated value**: \`${item.generatedValue}\`\n`;
			md += `- **Reason**: ${item.reason}\n`;
			md += `- **Line**: \`${item.fullLine}\`\n\n`;
		}
	}

	md += `## Recommendations\n\n`;
	md += `1. **Fix conflicts first** (${conflicts.length} items) - These break the cascade\n`;
	md += `2. **Create tokens for legacy values** (${legacy.length} items) - Add to design-tokens-base.json\n`;
	md += `3. **Replace safe values** (${safe.length} items) - Use token references instead\n\n`;
	md += `**Total estimated effort**: ${recommendations.migrationEffort.estimate}\n\n`;

	return md;
}

/**
 * Main audit function
 */
function auditCSSConflicts() {
	console.log('🔍 Auditing src/app.css for hardcoded color values...\n');

	// Read files
	if (!fs.existsSync(OLD_CSS_FILE)) {
		console.log('✅ Old CSS file not found - migration complete!\n');
		console.log(`   Expected location: ${OLD_CSS_FILE}\n`);
		console.log('   This means src/app.css has been successfully migrated to modular architecture.\n');
		console.log('   All styles are now in src/styles/ with generated tokens.\n');
		process.exit(0);
	}

	if (!fs.existsSync(GENERATED_TOKENS_FILE)) {
		throw new Error(`Generated tokens file not found: ${GENERATED_TOKENS_FILE}`);
	}

	const oldCssContent = fs.readFileSync(OLD_CSS_FILE, 'utf-8');
	const generatedTokensContent = fs.readFileSync(GENERATED_TOKENS_FILE, 'utf-8');

	console.log(`📄 Reading ${OLD_CSS_FILE}...`);
	console.log(`📄 Reading ${GENERATED_TOKENS_FILE}...\n`);

	// Extract hardcoded colors
	const findings = extractHardcodedColors(oldCssContent);
	console.log(`🎨 Found ${findings.length} hardcoded color values\n`);

	// Extract generated tokens
	const generatedTokens = extractGeneratedTokens(generatedTokensContent);
	console.log(`📦 Found ${generatedTokens.size} generated tokens\n`);

	// Categorize findings
	const { conflicts, legacy, safe } = categorizeFindings(findings, generatedTokens);

	console.log(`📊 Categorization:\n`);
	console.log(`  🔴 Conflicts: ${conflicts.length}`);
	console.log(`  🟡 Legacy: ${legacy.length}`);
	console.log(`  🟢 Safe: ${safe.length}\n`);

	// Generate report
	const reportDir = path.join(PROJECT_ROOT, 'ai-docs', 'audits');
	if (!fs.existsSync(reportDir)) {
		fs.mkdirSync(reportDir, { recursive: true });
	}

	const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
	const reportPath = path.join(reportDir, `css-conflict-audit-${timestamp}.json`);

	const report = generateReport({ conflicts, legacy, safe }, reportPath);

	console.log(`📝 Report generated:\n`);
	console.log(`  - ${reportPath}`);
	console.log(`  - ${reportPath.replace('.json', '.md')}\n`);

	// Print summary
	console.log(`\n✅ Audit complete!\n`);
	console.log(`Summary:`);
	console.log(`  Total: ${report.summary.total}`);
	console.log(`  Conflicts: ${report.summary.conflicts} (CRITICAL)`);
	console.log(`  Legacy: ${report.summary.legacy} (needs tokens)`);
	console.log(`  Safe: ${report.summary.safe} (values match)\n`);
	console.log(`Migration estimate: ${report.recommendations.migrationEffort.estimate}\n`);

	if (conflicts.length > 0) {
		console.log(`⚠️  WARNING: ${conflicts.length} conflict(s) found - these break the cascade!\n`);
		process.exit(1);
	} else {
		process.exit(0);
	}
}

// Run audit
try {
	auditCSSConflicts();
} catch (error) {
	console.error('❌ Audit failed:', error.message);
	console.error(error.stack);
	process.exit(1);
}


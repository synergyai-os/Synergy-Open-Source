#!/usr/bin/env node
/**
 * Design System Audit Script
 *
 * Scans codebase for hardcoded Tailwind values and calculates token coverage.
 * Supports full scan, quick scan (changed files), and CI mode.
 *
 * Usage:
 *   node scripts/audit-design-system.js              # Full scan
 *   node scripts/audit-design-system.js --quick      # Changed files only
 *   node scripts/audit-design-system.js --ci         # CI mode (no colors, exit on violations)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// Scan directories
const SCAN_DIRS = ['src/lib/components', 'src/routes', 'src/lib/modules'];
const FILE_EXTENSIONS = ['.svelte', '.ts'];

// Violation patterns
const PATTERNS = {
	// Arbitrary values: bg-[#abc], p-[12px], text-[18px], w-[247px]
	arbitraryValue: /class=["'][^"']*\[[#0-9]/g,

	// Raw Tailwind color scale: bg-blue-500, text-gray-700
	rawColor:
		/\b(bg|text|border)-(blue|gray|red|green|yellow|purple|pink|indigo|orange|teal|cyan|emerald|lime|amber|violet|fuchsia|rose|sky|slate|zinc|neutral|stone)-[0-9]{2,3}\b/g,

	// Raw spacing scale: p-4, m-8, gap-2, px-6, py-3
	rawSpacing: /\b(p|m|gap|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|space-[xy])-[0-9]{1,2}\b/g,

	// Raw font sizes: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, etc.
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

// Token usage patterns (components using design tokens)
const TOKEN_PATTERNS = [
	/\bpx-(nav-item|button|card|badge|header|section|menu-item)\b/,
	/\bpy-(nav-item|button|card|badge|header|section|menu-item)\b/,
	/\bgap-(icon|icon-wide)\b/,
	/\btext-(label|small|body|h1|h2|h3|h4|h5|h6)\b/,
	/\bbg-(primary|secondary|surface|sidebar|card|badge)\b/,
	/\btext-(primary|secondary|tertiary|sidebar-primary|sidebar-secondary)\b/,
	/\brounded-(button|card|badge|dialog)\b/,
	/\bmin-h-(button|input)\b/,
	/\bborder-(button|card|input|dialog)\b/
];

/**
 * Get changed files from git (for --quick mode)
 */
function getChangedFiles() {
	try {
		const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
			cwd: PROJECT_ROOT,
			encoding: 'utf-8'
		});
		const staged = output.trim().split('\n').filter(Boolean);

		const outputUnstaged = execSync('git diff --name-only --diff-filter=ACMR', {
			cwd: PROJECT_ROOT,
			encoding: 'utf-8'
		});
		const unstaged = outputUnstaged.trim().split('\n').filter(Boolean);

		return [...new Set([...staged, ...unstaged])].filter((file) =>
			FILE_EXTENSIONS.some((ext) => file.endsWith(ext))
		);
	} catch (error) {
		return [];
	}
}

/**
 * Find all source files to scan
 */
function findSourceFiles(quickMode = false) {
	const files = [];

	if (quickMode) {
		// Only scan changed files
		const changedFiles = getChangedFiles();
		for (const file of changedFiles) {
			const fullPath = path.join(PROJECT_ROOT, file);
			if (fs.existsSync(fullPath)) {
				files.push(fullPath);
			}
		}
		return files;
	}

	// Full scan
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
function detectViolationType(match, line) {
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
 * Get suggestion for violation
 */
function getSuggestion(violation, type) {
	if (type === 'raw-spacing') {
		if (violation.match(/p-[0-9]+/)) return 'Use semantic spacing token (e.g., px-button, py-card)';
		if (violation.match(/m-[0-9]+/))
			return 'Use semantic spacing token (e.g., mx-section, my-card)';
		if (violation.match(/gap-[0-9]+/)) return 'Use gap-icon or gap-icon-wide';
	}
	if (type === 'raw-font-size') {
		if (violation.includes('text-xs')) return 'Use text-label or text-small';
		if (violation.includes('text-sm')) return 'Use text-small';
		if (violation.includes('text-base')) return 'Use text-body';
		if (violation.includes('text-lg')) return 'Use text-h3 or text-h4';
		if (violation.includes('text-xl')) return 'Use text-h2 or text-h3';
		if (violation.includes('text-2xl')) return 'Use text-h1 or text-h2';
	}
	if (type === 'raw-color') {
		return 'Use semantic color token (e.g., bg-primary, text-primary, bg-surface)';
	}
	if (type === 'raw-border-radius') {
		return 'Use semantic border radius token (e.g., rounded-button, rounded-card)';
	}
	if (type === 'arbitrary-value') {
		return 'Replace with design token utility class';
	}
	if (type === 'inline-style') {
		return 'Move to Tailwind utility classes using design tokens';
	}
	return 'Replace with design token utility class';
}

/**
 * Extract module name from file path
 */
function getModuleName(filePath) {
	const relativePath = path.relative(PROJECT_ROOT, filePath);

	if (relativePath.includes('modules/meetings')) return 'meetings';
	if (relativePath.includes('modules/inbox')) return 'inbox';
	if (relativePath.includes('modules/flashcards')) return 'flashcards';
	if (relativePath.includes('modules/settings')) return 'settings';
	if (relativePath.includes('modules/orgChart')) return 'orgChart';
	if (relativePath.includes('components/ui') || relativePath.includes('components/atoms'))
		return 'atomic';
	if (relativePath.includes('routes/(authenticated)/meetings')) return 'meetings';
	if (relativePath.includes('routes/(authenticated)/inbox')) return 'inbox';
	if (relativePath.includes('routes/(authenticated)/flashcards')) return 'flashcards';
	if (relativePath.includes('routes/(authenticated)/settings')) return 'settings';
	if (relativePath.includes('routes/(authenticated)/org-chart')) return 'orgChart';

	return 'other';
}

/**
 * Check if component uses tokens
 */
function usesTokens(content) {
	return TOKEN_PATTERNS.some((pattern) => pattern.test(content));
}

/**
 * Scan file for violations
 */
function scanFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');
	const violations = [];
	const usesDesignTokens = usesTokens(content);

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Check all patterns
		for (const [patternName, pattern] of Object.entries(PATTERNS)) {
			const matches = [...line.matchAll(pattern)];

			for (const match of matches) {
				const violation = match[0];
				const type = detectViolationType(match, line);

				if (type) {
					violations.push({
						file: path.relative(PROJECT_ROOT, filePath),
						line: i + 1,
						violation,
						type,
						suggestion: getSuggestion(violation, type),
						content: line.trim()
					});
				}
			}
		}
	}

	return {
		violations,
		usesDesignTokens
	};
}

/**
 * Generate JSON report
 */
function generateJSONReport(report) {
	const jsonPath = path.join(PROJECT_ROOT, 'audit-report.json');
	fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
	return jsonPath;
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(report) {
	const mdPath = path.join(PROJECT_ROOT, 'AUDIT-REPORT.md');

	let md = `# Design System Audit Report\n\n`;
	md += `**Date**: ${new Date().toISOString().split('T')[0]}\n\n`;

	md += `## Summary\n\n`;
	md += `- **Token Coverage**: ${report.summary.tokenCoverage} (${report.summary.componentsCovered})\n`;
	md += `- **Hardcoded Values**: ${report.summary.totalViolations} violations\n`;
	md += `- **Arbitrary Values**: ${report.summary.arbitraryValues} violations\n`;
	md += `- **Raw Scale Values**: ${report.summary.rawScaleValues} violations\n`;
	md += `- **Inline Styles**: ${report.summary.inlineStyles} violations\n`;
	md += `- **Total Files Scanned**: ${report.summary.filesScanned}\n\n`;

	if (report.summary.totalViolations > 0) {
		md += `## Violations by Module\n\n`;

		const modules = Object.entries(report.violationsByModule).sort((a, b) => b[1] - a[1]);

		for (const [module, count] of modules) {
			md += `### ${module.charAt(0).toUpperCase() + module.slice(1)} Module (${count} violation${count !== 1 ? 's' : ''})\n\n`;

			const moduleViolations = report.violations.filter((v) => getModuleName(v.file) === module);

			for (const violation of moduleViolations.slice(0, 10)) {
				md += `${violation.line}. \`${violation.file}:${violation.line}\` - \`${violation.violation}\` → ${violation.suggestion}\n`;
			}

			if (moduleViolations.length > 10) {
				md += `\n... and ${moduleViolations.length - 10} more violations\n`;
			}

			md += `\n`;
		}

		md += `## All Violations\n\n`;
		md += `| File | Line | Violation | Type | Suggestion |\n`;
		md += `|------|------|-----------|------|------------|\n`;

		for (const violation of report.violations) {
			md += `| \`${violation.file}\` | ${violation.line} | \`${violation.violation}\` | ${violation.type} | ${violation.suggestion} |\n`;
		}
	} else {
		md += `## ✅ No Violations Found\n\n`;
		md += `All components are using design tokens correctly!\n`;
	}

	md += `\n## Token Coverage\n\n`;
	md += `- **Atomic Components**: ${report.summary.atomicComponentsCovered}/${report.summary.atomicComponentsTotal} (${Math.round((report.summary.atomicComponentsCovered / report.summary.atomicComponentsTotal) * 100)}%)\n`;
	md += `- **Module Pages**: ${report.summary.modulePagesCovered}/${report.summary.modulePagesTotal} (${Math.round((report.summary.modulePagesCovered / report.summary.modulePagesTotal) * 100)}%)\n`;

	if (report.summary.totalViolations > 0) {
		md += `\n## Recommendations\n\n`;
		md += `1. Fix violations starting with highest priority modules\n`;
		md += `2. Replace hardcoded values with design token utilities\n`;
		md += `3. Re-run audit after fixes: \`npm run audit:design-system\`\n`;
	}

	fs.writeFileSync(mdPath, md, 'utf-8');
	return mdPath;
}

/**
 * Main execution
 */
function main() {
	const args = process.argv.slice(2);
	const quickMode = args.includes('--quick');
	const ciMode = args.includes('--ci');

	if (!ciMode) {
		console.log('🔍 Design System Audit\n');
	}

	const files = findSourceFiles(quickMode);

	if (files.length === 0) {
		if (!ciMode) {
			console.log('⚠️  No files to scan');
		}
		process.exit(0);
	}

	if (!ciMode) {
		console.log(`Scanning ${files.length} file${files.length !== 1 ? 's' : ''}...\n`);
	}

	const allViolations = [];
	const componentStats = {
		total: 0,
		withTokens: 0,
		atomic: { total: 0, withTokens: 0 },
		modulePages: { total: 0, withTokens: 0 }
	};

	for (const file of files) {
		const result = scanFile(file);
		allViolations.push(...result.violations);

		componentStats.total++;
		if (result.usesDesignTokens) {
			componentStats.withTokens++;
		}

		// Categorize component
		const relativePath = path.relative(PROJECT_ROOT, file);
		if (relativePath.includes('components/ui') || relativePath.includes('components/atoms')) {
			componentStats.atomic.total++;
			if (result.usesDesignTokens) {
				componentStats.atomic.withTokens++;
			}
		} else {
			componentStats.modulePages.total++;
			if (result.usesDesignTokens) {
				componentStats.modulePages.withTokens++;
			}
		}
	}

	// Group violations by module
	const violationsByModule = {};
	for (const violation of allViolations) {
		const module = getModuleName(violation.file);
		violationsByModule[module] = (violationsByModule[module] || 0) + 1;
	}

	// Count violation types
	const arbitraryValues = allViolations.filter((v) => v.type === 'arbitrary-value').length;
	const rawScaleValues = allViolations.filter((v) =>
		['raw-spacing', 'raw-color', 'raw-font-size', 'raw-border-radius'].includes(v.type)
	).length;
	const inlineStyles = allViolations.filter((v) => v.type === 'inline-style').length;

	// Calculate coverage
	const coveragePercent =
		componentStats.total > 0
			? Math.round((componentStats.withTokens / componentStats.total) * 100)
			: 100;

	const report = {
		date: new Date().toISOString().split('T')[0],
		summary: {
			tokenCoverage: `${coveragePercent}%`,
			totalViolations: allViolations.length,
			filesScanned: files.length,
			componentsCovered: `${componentStats.withTokens}/${componentStats.total}`,
			arbitraryValues,
			rawScaleValues,
			inlineStyles,
			atomicComponentsCovered: componentStats.atomic.withTokens,
			atomicComponentsTotal: componentStats.atomic.total,
			modulePagesCovered: componentStats.modulePages.withTokens,
			modulePagesTotal: componentStats.modulePages.total
		},
		violations: allViolations,
		violationsByModule
	};

	// Generate reports
	const jsonPath = generateJSONReport(report);
	const mdPath = generateMarkdownReport(report);

	// Output summary
	if (!ciMode) {
		console.log(
			`✅ Token Coverage: ${coveragePercent}% (${componentStats.withTokens}/${componentStats.total} components)`
		);
		console.log(
			`⚠️  Hardcoded Values: ${allViolations.length} violation${allViolations.length !== 1 ? 's' : ''} found\n`
		);

		if (allViolations.length > 0) {
			console.log(`📂 Violations by Module:`);
			const modules = Object.entries(violationsByModule).sort((a, b) => b[1] - a[1]);
			for (const [module, count] of modules) {
				console.log(
					`  - ${module.charAt(0).toUpperCase() + module.slice(1)}: ${count} violation${count !== 1 ? 's' : ''}`
				);
			}
			console.log('');
		}

		console.log(`📊 Summary:`);
		console.log(`  - Total files scanned: ${files.length}`);
		console.log(
			`  - Components using tokens: ${componentStats.withTokens}/${componentStats.total} (${coveragePercent}%)`
		);
		console.log(`  - Hardcoded Tailwind values: ${allViolations.length}`);
		console.log(`  - Arbitrary values (bg-[#abc]): ${arbitraryValues}`);
		console.log(`  - Raw scale values (px-4, text-2xl): ${rawScaleValues}`);
		console.log(`  - Inline styles: ${inlineStyles}\n`);

		console.log(`💾 Full report saved to: ${mdPath}\n`);

		if (allViolations.length > 0) {
			console.log(
				`❌ Audit failed with ${allViolations.length} violation${allViolations.length !== 1 ? 's' : ''}\n`
			);
		} else {
			console.log(`✅ No violations found! All components are using design tokens correctly.\n`);
		}
	}

	// Exit with error code if violations found (for CI)
	if (allViolations.length > 0) {
		process.exit(1);
	}

	process.exit(0);
}

main();

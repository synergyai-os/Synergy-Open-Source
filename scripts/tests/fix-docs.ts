#!/usr/bin/env node

/**
 * Automated Documentation Fix Script
 *
 * Fixes utility name mismatches in documentation using utility-mapping.json
 * - Reads mapping from utility-mapping.json
 * - Updates documentation files systematically
 * - Preserves context and formatting
 *
 * Usage: npm run fix:docs
 *        npm run fix:docs -- --dry-run (preview changes)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
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
	cyan: '\x1b[36m'
};

// Check for dry-run flag
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Load utility mapping
 */
function loadMapping(): Record<string, string> {
	const mappingPath = join(__dirname, 'utility-mapping.json');
	if (!existsSync(mappingPath)) {
		console.error(`${colors.red}Error:${colors.reset} utility-mapping.json not found`);
		process.exit(1);
	}

	const mappingContent = readFileSync(mappingPath, 'utf-8');
	const mappingData = JSON.parse(mappingContent);
	return mappingData.mappings || {};
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Fix utilities in a file
 */
function fixUtilitiesInFile(
	filePath: string,
	mapping: Record<string, string>
): { changed: boolean; replacements: number; newContent: string } {
	const content = readFileSync(filePath, 'utf-8');
	let newContent = content;
	let replacements = 0;

	// Replace utilities in order (longest first to avoid partial matches)
	const sortedMappings = Object.entries(mapping).sort((a, b) => b[0].length - a[0].length);

	for (const [oldUtil, newUtil] of sortedMappings) {
		const escapedOld = escapeRegex(oldUtil);

		// Replace in class attributes: class="old-util" → class="new-util"
		// Fixed: Match entire class attribute and replace utility within it
		const quotePattern = '["\'`]';
		// Match: class="...", class='...', or class=`...`
		// Strategy: Match entire class attribute, then replace utility within content
		const classPattern = `(class=${quotePattern})([^${quotePattern}]+?)(${quotePattern})`;
		const classRegex = new RegExp(classPattern, 'g');
		newContent = newContent.replace(classRegex, (match, prefix, content, suffix) => {
			// Replace utility within the class content using word boundaries
			// Only replace if it's an exact match (not already replaced)
			const utilRegex = new RegExp(`\\b${escapedOld}\\b`, 'g');
			if (utilRegex.test(content) && !content.includes(newUtil)) {
				replacements++;
				const replaced = content.replace(utilRegex, newUtil);
				return `${prefix}${replaced}${suffix}`;
			}
			return match;
		});

		// Replace in code blocks: ```...``` (triple backticks)
		// Fixed: Match utilities WITHIN code blocks (fenced code blocks)
		// Pattern: ```language\ncontent``` or ```\ncontent```
		const codeBlockPattern = '(```[^\\n]*\\n)([\\s\\S]*?)(```)';
		const codeBlockRegex = new RegExp(codeBlockPattern, 'g');
		newContent = newContent.replace(codeBlockRegex, (match, prefix, content, suffix) => {
			// Replace utility within the code block content using word boundaries
			const utilRegex = new RegExp(`\\b${escapedOld}\\b`, 'g');
			if (utilRegex.test(content) && !content.includes(newUtil)) {
				replacements++;
				const replaced = content.replace(utilRegex, newUtil);
				return `${prefix}${replaced}${suffix}`;
			}
			return match;
		});

		// Replace in inline code: `old-util` → `new-util`
		// Fixed: Match utilities WITHIN inline code (not just standalone)
		// Strategy: Match entire inline code block, then replace utility within content
		const inlinePattern = '(`)([^`]+?)(`)';
		const inlineRegex = new RegExp(inlinePattern, 'g');
		newContent = newContent.replace(inlineRegex, (match, prefix, content, suffix) => {
			// Replace utility within the inline code content using word boundaries
			const utilRegex = new RegExp(`\\b${escapedOld}\\b`, 'g');
			if (utilRegex.test(content) && !content.includes(newUtil)) {
				replacements++;
				const replaced = content.replace(utilRegex, newUtil);
				return `${prefix}${replaced}${suffix}`;
			}
			return match;
		});

		// Replace in string literals: 'old-util' or "old-util" → 'new-util' or "new-util"
		// Fixed: Match utilities WITHIN string literals (not just standalone)
		// Strategy: Match entire string literal, then replace utility within content
		const stringPattern = `(['"])([^'"]+?)(['"])`;
		const stringRegex = new RegExp(stringPattern, 'g');
		newContent = newContent.replace(stringRegex, (match, prefix, content, suffix) => {
			// Replace utility within the string content using word boundaries
			const utilRegex = new RegExp(`\\b${escapedOld}\\b`, 'g');
			if (utilRegex.test(content) && !content.includes(newUtil)) {
				replacements++;
				const replaced = content.replace(utilRegex, newUtil);
				return `${prefix}${replaced}${suffix}`;
			}
			return match;
		});

		// Replace standalone: old-util → new-util (when not in quotes/backticks)
		// Only if not already replaced
		const standaloneRegex = new RegExp(`\\b${escapedOld}\\b`, 'g');
		const beforeStandalone = newContent;
		newContent = newContent.replace(standaloneRegex, (match, offset) => {
			// Check if we're inside quotes or backticks
			const before = newContent.substring(0, offset);
			const after = newContent.substring(offset + match.length);
			const lastQuote = Math.max(
				before.lastIndexOf('"'),
				before.lastIndexOf("'"),
				before.lastIndexOf('`')
			);
			const nextQuote = Math.min(after.indexOf('"'), after.indexOf("'"), after.indexOf('`'));

			// If we're inside quotes, skip (already handled above)
			if (lastQuote > -1 && (nextQuote === -1 || nextQuote > 0)) {
				return match;
			}

			// Check if already replaced
			const context = before + match + after;
			if (!context.includes(newUtil)) {
				replacements++;
				return newUtil;
			}
			return match;
		});
	}

	return {
		changed: newContent !== content,
		replacements,
		newContent
	};
}

/**
 * Main execution
 */
function main() {
	const mapping = loadMapping();
	console.log(
		`${colors.blue}Loaded ${Object.keys(mapping).length} utility mappings${colors.reset}\n`
	);

	if (DRY_RUN) {
		console.log(`${colors.yellow}DRY RUN MODE - No files will be modified${colors.reset}\n`);
	}

	// Priority order: master docs → active docs → archived docs
	const docFiles = [
		...glob.sync('dev-docs/master-docs/**/*.md', { cwd: ROOT_DIR }),
		...glob.sync('dev-docs/2-areas/**/*.md', { cwd: ROOT_DIR }),
		...glob.sync('dev-docs/4-archive/**/*.md', { cwd: ROOT_DIR })
	];

	let totalFiles = 0;
	let totalReplacements = 0;

	for (const docFile of docFiles) {
		const filePath = join(ROOT_DIR, docFile);
		const { changed, replacements } = fixUtilitiesInFile(filePath, mapping);

		if (changed && replacements > 0) {
			totalFiles++;
			totalReplacements += replacements;

			if (DRY_RUN) {
				console.log(
					`${colors.cyan}Would fix${colors.reset} ${docFile} (${replacements} replacements)`
				);
			} else {
				// File already fixed by fixUtilitiesInFile, just write it
				const filePath = join(ROOT_DIR, docFile);
				const { newContent } = fixUtilitiesInFile(filePath, mapping);
				writeFileSync(filePath, newContent, 'utf-8');
				console.log(
					`${colors.green}Fixed${colors.reset} ${docFile} (${replacements} replacements)`
				);
			}
		}
	}

	console.log(`\n${colors.blue}Summary:${colors.reset}`);
	console.log(`  Files ${DRY_RUN ? 'would be' : ''} modified: ${totalFiles}`);
	console.log(`  Total replacements: ${totalReplacements}`);

	if (DRY_RUN) {
		console.log(`\n${colors.yellow}Run without --dry-run to apply changes${colors.reset}`);
	} else {
		console.log(`\n${colors.green}✅ Documentation fixed${colors.reset}`);
		console.log(`Run 'npm run validate:docs' to verify`);
	}
}

main();

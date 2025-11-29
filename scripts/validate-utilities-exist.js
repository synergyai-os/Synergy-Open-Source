#!/usr/bin/env node
/**
 * Utility Existence Validation
 *
 * Checks that all utility classes used in components actually exist in generated utilities.
 *
 * What happens now: validate:tokens only checks for hardcoded Tailwind patterns,
 * allowing classes like bg-accent-primary even if they don't exist.
 *
 * What happens after: This script reads all @utility declarations and reports
 * any classes used in components that don't have corresponding utilities.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract all utility names from utility files
function extractUtilities() {
	const utilities = new Set();
	const utilityFiles = [
		'src/styles/utilities/color-utils.css',
		'src/styles/utilities/spacing-utils.css',
		'src/styles/utilities/typography-utils.css',
		'src/styles/utilities/component-utils.css',
		'src/styles/utilities/opacity-utils.css'
	];

	for (const file of utilityFiles) {
		const filePath = path.join(__dirname, '..', file);
		if (!fs.existsSync(filePath)) continue;

		const content = fs.readFileSync(filePath, 'utf-8');
		const matches = content.matchAll(/@utility\s+(\S+)/g);
		for (const match of matches) {
			utilities.add(match[1]);
		}
	}

	return utilities;
}

// Extract class names from component files
function extractClassesFromFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const classes = new Set();

	// Match class="..." and class={...}
	const patterns = [/class="([^"]+)"/g, /class='([^']+)'/g, /class=\{([^}]+)\}/g];

	for (const pattern of patterns) {
		let match;
		while ((match = pattern.exec(content)) !== null) {
			const classString = match[1];
			// Split by whitespace and filter out empty strings
			classString.split(/\s+/).forEach((cls) => {
				if (cls && !cls.includes('${') && !cls.includes('{')) {
					classes.add(cls.trim());
				}
			});
		}
	}

	return classes;
}

// Check if class is a utility (starts with bg-, text-, etc.)
function isUtilityClass(className) {
	return /^(bg|text|border|rounded|shadow|gap|px|py|p|m|mt|mb|ml|mr|mx|my|size|leading|tracking|font|opacity|z)-/.test(
		className
	);
}

// Allowed patterns that don't need utilities (layout primitives, etc.)
function isAllowedPattern(className) {
	const allowed = [
		// Layout primitives
		/^(flex|grid|block|inline|hidden|relative|absolute|fixed|sticky|static)$/,
		/^(flex-row|flex-col|flex-wrap|items-center|justify-center|text-center|overflow-hidden|w-full|h-full)$/,
		// State modifiers
		/^(truncate|animate-pulse|transition-|hover:|focus:|disabled:|data-\[|group-hover:)/,
		// Exceptions
		/^rounded-full$/, // Exception for avatars (SYOS-585)
		// Hardcoded Tailwind that validate:tokens should catch (don't check here)
		/^(mx-auto|px-\d+|py-\d+|gap-\d+|m-\d+|p-\d+)$/,
		/^(bg-gradient-|from-|via-|to-|bg-radial-|bg-linear-)/ // Gradient utilities
	];

	return allowed.some((pattern) => pattern.test(className));
}

// Only check semantic token patterns (bg-*, text-*, etc. that should exist)
function isSemanticToken(className) {
	// Semantic tokens that should exist in utilities
	return /^(bg|text|border|rounded|shadow|gap|px|py|p|m|mt|mb|ml|mr|mx|my|size|leading|tracking|font|opacity|z)-(primary|secondary|tertiary|muted|disabled|inverse|brand|link|success|warning|error|info|base|subtle|surface|elevated|hover|active|focus|interactive|status|component|button|input|page|card|header|alert|form|section|content|fieldGroup|icon|input|button|card|modal|badge|avatar|sidebar|accent)/.test(
		className
	);
}

async function validateUtilitiesExist() {
	const utilities = extractUtilities();
	console.log(`✅ Found ${utilities.size} utility declarations\n`);

	const componentFiles = await glob('src/**/*.{svelte,ts}', {
		ignore: [
			'**/node_modules/**',
			'**/.svelte-kit/**',
			'**/build/**',
			'**/dist/**',
			'**/*.stories.*',
			'**/*.test.*'
		]
	});

	const violations = [];

	for (const file of componentFiles) {
		const classes = extractClassesFromFile(file);

		for (const cls of classes) {
			// Only check semantic tokens (skip layout primitives and hardcoded Tailwind)
			if (!isSemanticToken(cls) || isAllowedPattern(cls)) continue;

			// Check if utility exists
			if (!utilities.has(cls)) {
				const content = fs.readFileSync(file, 'utf-8');
				const lines = content.split('\n');
				const lineNumber = lines.findIndex((line) => line.includes(cls)) + 1;

				violations.push({
					file,
					line: lineNumber,
					class: cls
				});
			}
		}
	}

	if (violations.length === 0) {
		console.log('✅ All utility classes exist!\n');
		return 0;
	}

	console.log(`❌ Found ${violations.length} missing utility class(es):\n`);

	const grouped = {};
	for (const v of violations) {
		if (!grouped[v.class]) grouped[v.class] = [];
		grouped[v.class].push(v);
	}

	for (const [className, files] of Object.entries(grouped)) {
		console.log(`  ${className} (used in ${files.length} file(s)):`);
		for (const v of files.slice(0, 5)) {
			// Show first 5
			console.log(`    - ${v.file}:${v.line}`);
		}
		if (files.length > 5) {
			console.log(`    ... and ${files.length - 5} more`);
		}
		console.log();
	}

	return 1;
}

validateUtilitiesExist().then((code) => process.exit(code));

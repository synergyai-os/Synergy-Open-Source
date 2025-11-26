#!/usr/bin/env node
/**
 * Test regex patterns against actual violations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

function getLineNumber(content, index) {
	return content.substring(0, index).split('\n').length;
}

// Test pattern against both violation files
const files = [
	'src/routes/(authenticated)/org/settings/branding/+page.svelte',
	'src/routes/(authenticated)/+layout.svelte'
];

console.log('=== Testing Regex Patterns ===\n');

files.forEach(filePath => {
	const fullPath = path.join(PROJECT_ROOT, filePath);
	const content = fs.readFileSync(fullPath, 'utf-8');
	
	console.log(`\nFile: ${filePath}`);
	
	// Pattern 1: Template literal with backticks
	const pattern1 = /`:root\.org-\$\{[^}]+\}\s*\{[^`]*--color-(accent-primary|accent-hover)[^`]*\}`/gs;
	const matches1 = Array.from(content.matchAll(pattern1));
	
	// Pattern 2: Regular string template (no backticks in source, but template literal in code)
	// This is trickier - we need to find the pattern in the source code itself
	const pattern2 = /:root\.org-\$\{[^}]+\}\s*\{[^}]*--color-(accent-primary|accent-hover)[^}]*\}/gs;
	const matches2 = Array.from(content.matchAll(pattern2));
	
	console.log(`  Pattern 1 (backtick template): ${matches1.length} matches`);
	matches1.forEach((m, i) => {
		const line = getLineNumber(content, m.index);
		console.log(`    Match ${i + 1} at line ${line}: token=${m[1]}`);
	});
	
	console.log(`  Pattern 2 (string template): ${matches2.length} matches`);
	matches2.forEach((m, i) => {
		const line = getLineNumber(content, m.index);
		console.log(`    Match ${i + 1} at line ${line}: token=${m[1]}`);
	});
	
	// Also check for both tokens in the same line
	const line99 = content.split('\n')[98];
	if (line99) {
		const hasAccentPrimary = line99.includes('--color-accent-primary');
		const hasAccentHover = line99.includes('--color-accent-hover');
		console.log(`  Line 99 contains accent-primary: ${hasAccentPrimary}`);
		console.log(`  Line 99 contains accent-hover: ${hasAccentHover}`);
	}
});


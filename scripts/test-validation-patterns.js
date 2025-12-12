#!/usr/bin/env node
/**
 * Test validation patterns against actual violations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'svelte/compiler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// Helper: Get line number from index
function getLineNumber(content, index) {
	return content.substring(0, index).split('\n').length;
}

// Helper: Extract {@html} injections from Svelte content
function extractHtmlInjections(content) {
	const injections = [];
	// Pattern: {@html `...`}
	const htmlPattern = /\{@html\s+`([^`]|\\`)*`\}/gs;
	const matches = Array.from(content.matchAll(htmlPattern));

	for (const match of matches) {
		const fullMatch = match[0];
		const innerContent = match[1] || '';
		injections.push({
			full: fullMatch,
			content: innerContent,
			index: match.index || 0
		});
	}

	return injections;
}

// Test 1: Test regex pattern against actual violation
function testRegexPattern() {
	console.log('=== Test 1: Regex Pattern ===');

	const violationFile = path.join(
		PROJECT_ROOT,
		'src/routes/(authenticated)/org/settings/branding/+page.svelte'
	);
	const content = fs.readFileSync(violationFile, 'utf-8');

	// Pattern for template literals with org branding
	// Match: `:root.org-${...} { ... --color-accent-primary ... }`
	const pattern =
		/`:root\.org-\$\{[^}]+\}\s*\{[^`]*--color-(accent-primary|accent-hover)[^`]*\}`/gs;
	const matches = Array.from(content.matchAll(pattern));

	console.log(`Found ${matches.length} matches`);

	if (matches.length > 0) {
		matches.forEach((match, i) => {
			const lineNum = getLineNumber(content, match.index);
			console.log(`  Match ${i + 1}:`);
			console.log(`    Line: ${lineNum}`);
			console.log(`    Token: ${match[1]}`);
			console.log(`    Preview: ${match[0].substring(0, 80)}...`);
		});
		return true;
	} else {
		console.log('  No matches found - pattern needs adjustment');
		return false;
	}
}

// Test 2: Test Svelte AST parsing
function testSvelteAST() {
	console.log('\n=== Test 2: Svelte AST Structure ===');

	const svelteFile = path.join(
		PROJECT_ROOT,
		'src/routes/(authenticated)/org/settings/branding/+page.svelte'
	);
	const content = fs.readFileSync(svelteFile, 'utf-8');

	try {
		const ast = parse(content, { modern: true });
		console.log('AST keys:', Object.keys(ast));

		// Check for style blocks
		if (ast.css) {
			console.log('ast.css exists:', typeof ast.css);
		} else {
			console.log('ast.css: null (no <style> blocks in this file)');
		}

		// Check for HTML/template
		if (ast.fragment) {
			console.log('ast.fragment exists:', typeof ast.fragment);
			console.log('ast.fragment.type:', ast.fragment.type);
		}

		// Check instance (script)
		if (ast.instance) {
			console.log('ast.instance exists:', typeof ast.instance);
		}

		// Try to find {@html} in content using regex
		const htmlInjections = extractHtmlInjections(content);
		console.log(`Found ${htmlInjections.length} {@html} injections`);

		if (htmlInjections.length > 0) {
			htmlInjections.forEach((inj, i) => {
				const lineNum = getLineNumber(content, inj.index);
				console.log(`  Injection ${i + 1} at line ${lineNum}:`);
				console.log(`    Contains 'org-': ${inj.content.includes('org-')}`);
				console.log(`    Contains 'accent-primary': ${inj.content.includes('accent-primary')}`);
			});
		}

		return true;
	} catch (error) {
		console.error('AST parse error:', error.message);
		return false;
	}
}

// Test 3: Performance estimate
function estimatePerformance() {
	console.log('\n=== Test 3: Performance Estimate ===');

	const svelteFiles = [];
	const tsjsFiles = [];

	function findFiles(dir, extensions, files) {
		try {
			const entries = fs.readdirSync(dir, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name);
				if (entry.isDirectory()) {
					if (
						!entry.name.startsWith('.') &&
						entry.name !== 'node_modules' &&
						entry.name !== 'dist' &&
						entry.name !== 'build' &&
						entry.name !== '.storybook'
					) {
						findFiles(fullPath, extensions, files);
					}
				} else if (extensions.some((ext) => entry.name.endsWith(ext))) {
					files.push(fullPath);
				}
			}
		} catch {
			// Skip directories we can't read
		}
	}

	const srcDir = path.join(PROJECT_ROOT, 'src');
	findFiles(srcDir, ['.svelte'], svelteFiles);
	findFiles(srcDir, ['.ts', '.js'], tsjsFiles);

	// Filter out generated files
	const filteredSvelte = svelteFiles.filter(
		(f) => !f.includes('_generated') && !f.includes('node_modules')
	);
	const filteredTsjs = tsjsFiles.filter(
		(f) => !f.includes('_generated') && !f.includes('node_modules') && !f.includes('.storybook')
	);

	console.log(`Svelte files: ${filteredSvelte.length}`);
	console.log(`TS/JS files: ${filteredTsjs.length}`);

	// Estimate parsing time (conservative)
	const svelteParseTime = 50; // ms per file (AST parsing)
	const tsjsScanTime = 10; // ms per file (regex scanning)

	const totalSvelteTime = (filteredSvelte.length * svelteParseTime) / 1000;
	const totalTsjsTime = (filteredTsjs.length * tsjsScanTime) / 1000;
	const totalTime = totalSvelteTime + totalTsjsTime;

	console.log(`Estimated Svelte parse time: ${totalSvelteTime.toFixed(1)}s`);
	console.log(`Estimated TS/JS scan time: ${totalTsjsTime.toFixed(1)}s`);
	console.log(`Total estimated time: ${totalTime.toFixed(1)}s`);

	return totalTime;
}

// Run all tests
console.log('=== Validation Pattern Tests ===\n');

const test1 = testRegexPattern();
const test2 = testSvelteAST();
const test3 = estimatePerformance();

console.log('\n=== Test Results Summary ===');
console.log(`Regex pattern test: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Svelte AST test: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
console.log(
	`Performance estimate: ${test3.toFixed(1)}s ${test3 < 15 ? '✅' : '⚠️  (exceeds 10s target)'}`
);

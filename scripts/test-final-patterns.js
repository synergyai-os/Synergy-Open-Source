#!/usr/bin/env node
/**
 * Final validation of regex patterns - test both tokens
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

// Improved pattern: Match template literal, then check for both tokens
function findOrgBrandingViolations(content, filePath) {
	const violations = [];
	
	// Pattern: Match template literal with org branding selector
	const orgBrandingPattern = /`:root\.org-\$\{[^}]+\}\s*\{[^`]+\}`/gs;
	const matches = Array.from(content.matchAll(orgBrandingPattern));
	
	for (const match of matches) {
		const templateContent = match[0];
		const lineNum = getLineNumber(content, match.index);
		
		// Check for accent-primary violation
		if (templateContent.includes('--color-accent-primary')) {
			violations.push({
				file: filePath,
				line: lineNum,
				token: 'accent-primary',
				type: 'org-branding-pattern-violation'
			});
		}
		
		// Check for accent-hover violation
		if (templateContent.includes('--color-accent-hover')) {
			violations.push({
				file: filePath,
				line: lineNum,
				token: 'accent-hover',
				type: 'org-branding-pattern-violation'
			});
		}
	}
	
	return violations;
}

// Test against actual violations
const files = [
	'src/routes/(authenticated)/org/settings/branding/+page.svelte',
	'src/routes/(authenticated)/+layout.svelte'
];

console.log('=== Final Pattern Validation ===\n');

let totalViolations = 0;

files.forEach(filePath => {
	const fullPath = path.join(PROJECT_ROOT, filePath);
	const content = fs.readFileSync(fullPath, 'utf-8');
	
	const violations = findOrgBrandingViolations(content, filePath);
	
	console.log(`\n${filePath}:`);
	console.log(`  Found ${violations.length} violations`);
	
	violations.forEach((v, i) => {
		console.log(`    ${i + 1}. Line ${v.line}: --color-${v.token}`);
		totalViolations += 1;
	});
});

console.log(`\n=== Summary ===`);
console.log(`Total violations found: ${totalViolations}`);
console.log(`Expected: 4 (2 files × 2 tokens each)`);
console.log(`Test: ${totalViolations === 4 ? '✅ PASS' : '❌ FAIL'}`);


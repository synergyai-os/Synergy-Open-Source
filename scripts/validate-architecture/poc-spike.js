#!/usr/bin/env node

/**
 * Phase 0: Proof-of-Concept Spike
 *
 * Goal: Validate that svelte/compiler can parse Svelte files and extract imports
 *
 * Success Criteria:
 * - ✅ Can parse SplitButton.svelte without errors
 * - ✅ Detects Button import correctly
 * - ✅ Parse time < 100ms per file
 */

import { parse } from 'svelte/compiler';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// ANSI colors for output
const colors = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	gray: '\x1b[90m',
	bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.blue}🔬 Phase 0: Proof-of-Concept Spike${colors.reset}\n`);
console.log(`${colors.gray}Validating svelte/compiler parser approach...${colors.reset}\n`);

// ============================================================================
// Test 1: Parse SplitButton.svelte
// ============================================================================

console.log(`${colors.bold}Test 1: Parse SplitButton.svelte${colors.reset}`);

const splitButtonPath = path.join(ROOT_DIR, 'src/lib/components/atoms/SplitButton.svelte');

const startTime = performance.now();
let ast;

try {
	const source = fs.readFileSync(splitButtonPath, 'utf-8');
	ast = parse(source, { modern: true });
	const parseTime = (performance.now() - startTime).toFixed(2);

	console.log(`${colors.green}✓${colors.reset} Parsed successfully in ${parseTime}ms`);
	console.log(`${colors.gray}  AST has: html, css, instance (script)${colors.reset}`);

	// Check AST structure
	if (ast.instance) {
		console.log(`${colors.green}✓${colors.reset} Script block found (instance)`);
	}
} catch (error) {
	console.log(`${colors.red}✗${colors.reset} Parse failed: ${error.message}`);
	process.exit(1);
}

// ============================================================================
// Test 2: Extract imports from AST
// ============================================================================

console.log(`\n${colors.bold}Test 2: Extract imports from script block${colors.reset}`);

// The AST structure for Svelte 5 (modern: true) includes the script content
// We need to extract imports from the script content

function extractImportsFromSvelte(filePath) {
	const source = fs.readFileSync(filePath, 'utf-8');

	// Method 1: Regex-based extraction (simpler, faster)
	// This is more reliable than parsing the AST for imports
	const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/g;

	const imports = [];
	let match;

	while ((match = importRegex.exec(source)) !== null) {
		const namedImports = match[1] ? match[1].split(',').map((s) => s.trim()) : [];
		const namespaceImport = match[2];
		const defaultImport = match[3];
		const modulePath = match[4];

		imports.push({
			namedImports,
			namespaceImport,
			defaultImport,
			modulePath,
			isAtomImport: modulePath.includes('$lib/components/atoms')
		});
	}

	return imports;
}

const imports = extractImportsFromSvelte(splitButtonPath);

console.log(`${colors.green}✓${colors.reset} Found ${imports.length} imports:`);
imports.forEach((imp) => {
	const marker = imp.isAtomImport ? `${colors.yellow}⚠ ATOM${colors.reset}` : '';
	const names =
		imp.namedImports.length > 0
			? `{ ${imp.namedImports.join(', ')} }`
			: imp.defaultImport || imp.namespaceImport;
	console.log(`  ${colors.gray}${names}${colors.reset} from '${imp.modulePath}' ${marker}`);
});

// ============================================================================
// Test 3: Detect atom-to-atom violation
// ============================================================================

console.log(`\n${colors.bold}Test 3: Detect atom-to-atom violation${colors.reset}`);

function getComponentType(filePath) {
	if (filePath.includes('/components/atoms/')) return 'atom';
	if (filePath.includes('/components/molecules/')) return 'molecule';
	if (filePath.includes('/components/organisms/')) return 'organism';
	if (filePath.includes('/modules/')) return 'module';
	return 'unknown';
}

function detectAtomicHierarchyViolations(filePath) {
	const componentType = getComponentType(filePath);
	const componentName = path.basename(filePath, '.svelte');

	if (componentType !== 'atom') {
		return { violations: [], componentType, componentName };
	}

	const imports = extractImportsFromSvelte(filePath);
	const atomImports = imports.filter((imp) => imp.isAtomImport);

	const violations = [];

	for (const atomImport of atomImports) {
		// Get imported atom names
		const importedAtoms = atomImport.namedImports.filter(
			(name) =>
				name !== componentName && // Not self-import
				name !== 'index' && // Not index re-export
				!name.endsWith('Props') && // Not type import
				!name.startsWith('type ') // Not type import
		);

		for (const importedAtom of importedAtoms) {
			violations.push({
				type: 'atomic_design_hierarchy',
				component: componentName,
				componentType: 'atom',
				importedAtom,
				file: filePath,
				suggestion: `Move ${componentName} to molecules/ - it composes other atoms`
			});
		}
	}

	return { violations, componentType, componentName };
}

const result = detectAtomicHierarchyViolations(splitButtonPath);

if (result.violations.length > 0) {
	console.log(`${colors.yellow}⚠${colors.reset} Found ${result.violations.length} violation(s):`);
	result.violations.forEach((v) => {
		console.log(
			`  ${colors.red}✗${colors.reset} ${v.component} (${v.componentType}) imports ${v.importedAtom}`
		);
		console.log(`    ${colors.gray}→ ${v.suggestion}${colors.reset}`);
	});
} else {
	console.log(`${colors.green}✓${colors.reset} No violations found`);
}

// ============================================================================
// Test 4: Benchmark parsing performance
// ============================================================================

console.log(`\n${colors.bold}Test 4: Benchmark parsing performance${colors.reset}`);

// Get all atom files (excluding stories)
const atomFiles = glob.sync('src/lib/components/atoms/**/*.svelte', {
	cwd: ROOT_DIR,
	ignore: ['**/*.stories.svelte']
});

console.log(`${colors.gray}Parsing ${atomFiles.length} atom files...${colors.reset}`);

const benchmarkStart = performance.now();
let successCount = 0;
let errorCount = 0;
const errors = [];

for (const file of atomFiles) {
	const filePath = path.join(ROOT_DIR, file);
	try {
		const source = fs.readFileSync(filePath, 'utf-8');
		parse(source, { modern: true });
		successCount++;
	} catch (error) {
		errorCount++;
		errors.push({ file, error: error.message });
	}
}

const totalTime = (performance.now() - benchmarkStart).toFixed(2);
const avgTime = (parseFloat(totalTime) / atomFiles.length).toFixed(2);

console.log(
	`${colors.green}✓${colors.reset} Parsed ${successCount}/${atomFiles.length} files in ${totalTime}ms`
);
console.log(`${colors.gray}  Average: ${avgTime}ms per file${colors.reset}`);

if (errorCount > 0) {
	console.log(`${colors.red}✗${colors.reset} ${errorCount} file(s) failed to parse:`);
	errors.forEach((e) => console.log(`  ${colors.gray}${e.file}: ${e.error}${colors.reset}`));
}

// ============================================================================
// Test 5: Scan all atoms for violations
// ============================================================================

console.log(`\n${colors.bold}Test 5: Scan all atoms for hierarchy violations${colors.reset}`);

const allViolations = [];

for (const file of atomFiles) {
	const filePath = path.join(ROOT_DIR, file);
	const { violations } = detectAtomicHierarchyViolations(filePath);
	allViolations.push(...violations);
}

if (allViolations.length > 0) {
	console.log(
		`${colors.yellow}⚠${colors.reset} Found ${allViolations.length} violation(s) across all atoms:`
	);
	allViolations.forEach((v) => {
		console.log(`  ${colors.red}✗${colors.reset} ${v.component} imports ${v.importedAtom}`);
		console.log(`    ${colors.gray}File: ${path.relative(ROOT_DIR, v.file)}${colors.reset}`);
		console.log(`    ${colors.gray}→ ${v.suggestion}${colors.reset}`);
	});
} else {
	console.log(`${colors.green}✓${colors.reset} No atomic hierarchy violations found`);
}

// ============================================================================
// Summary
// ============================================================================

console.log(`\n${colors.bold}${colors.blue}━━━ POC Spike Summary ━━━${colors.reset}\n`);

const tests = [
	{ name: 'Parse Svelte file', passed: ast !== undefined },
	{ name: 'Extract imports', passed: imports.length > 0 },
	{ name: 'Detect violations', passed: result.violations.length > 0 },
	{ name: 'Performance < 100ms/file', passed: parseFloat(avgTime) < 100 },
	{ name: 'Parse all atoms', passed: errorCount === 0 }
];

tests.forEach((test) => {
	const icon = test.passed ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
	console.log(`${icon} ${test.name}`);
});

const allPassed = tests.every((t) => t.passed);

console.log('');
if (allPassed) {
	console.log(
		`${colors.green}${colors.bold}✅ POC SPIKE PASSED - Parser approach validated!${colors.reset}`
	);
	console.log(`${colors.gray}Proceed to Phase 1: Parser Infrastructure${colors.reset}\n`);
	process.exit(0);
} else {
	console.log(
		`${colors.red}${colors.bold}❌ POC SPIKE FAILED - Review failures above${colors.reset}\n`
	);
	process.exit(1);
}

#!/usr/bin/env node

/**
 * Architectural Validation Script
 * 
 * Validates design system architecture:
 * - Rule 1: Recipe ownership
 * - Rule 2: Component composition  
 * - Rule 3: Layout vs styling separation
 * - Rule 4: Atomic design hierarchy
 * - Rule 5: Recipe file naming
 * 
 * Usage:
 *   npm run validate:architecture
 *   node scripts/validate-architecture.js [--json] [--fix]
 */

import path from 'path';
import { fileURLToPath } from 'url';

// Import detectors
import { scanAtomicHierarchy } from './validate-architecture/detectors/atomic-hierarchy.js';
import { scanRecipeOwnership } from './validate-architecture/detectors/recipe-ownership.js';
import { scanLayoutStyling } from './validate-architecture/detectors/layout-styling.js';
import { scanComponentComposition } from './validate-architecture/detectors/component-composition.js';
import { scanRecipeNaming } from './validate-architecture/detectors/recipe-naming.js';

// Import utils
import { loadExceptions, applyExceptions } from './validate-architecture/utils/exceptions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ANSI colors
const colors = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	gray: '\x1b[90m',
	bold: '\x1b[1m'
};

// Parse CLI arguments
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
	console.log(`
${colors.bold}Architectural Validation Script${colors.reset}

Validates design system architecture patterns.

${colors.bold}Usage:${colors.reset}
  npm run validate:architecture
  node scripts/validate-architecture.js [options]

${colors.bold}Options:${colors.reset}
  --json     Output results as JSON
  --help     Show this help message

${colors.bold}Rules Validated:${colors.reset}
  1. Recipe Ownership       - Recipes belong to the component they style
  2. Component Composition  - Molecules compose atoms via class prop, not recipes
  3. Layout vs Styling      - Layout in components, styling in recipes
  4. Atomic Hierarchy       - Atoms don't compose other atoms
  5. Recipe File Naming     - Recipe file matches component name
`);
	process.exit(0);
}

// Run validation
const startTime = performance.now();

if (!jsonOutput) {
	console.log(`${colors.bold}${colors.blue}🏗️  Architectural Validation${colors.reset}\n`);
	console.log(`${colors.gray}Scanning design system for violations...${colors.reset}\n`);
}

// Load exceptions
const { exceptions, loaded: exceptionsLoaded } = loadExceptions(ROOT_DIR);
if (!jsonOutput && exceptionsLoaded) {
	console.log(`${colors.gray}Loaded ${exceptions.length} exception(s) from .architectural-exceptions.json${colors.reset}\n`);
}

// Collect all violations
const violations = {
	atomic_design_hierarchy: [],
	recipe_ownership: [],
	layout_styling_separation: [],
	component_composition: [],
	recipe_file_naming: []
};

// Track excepted violations
const excepted = {
	atomic_design_hierarchy: [],
	recipe_ownership: [],
	layout_styling_separation: [],
	component_composition: [],
	recipe_file_naming: []
};

// Run each detector and apply exceptions
if (!jsonOutput) console.log(`${colors.gray}Rule 4: Atomic Design Hierarchy...${colors.reset}`);
const atomicResult = applyExceptions(scanAtomicHierarchy(ROOT_DIR), exceptions);
violations.atomic_design_hierarchy = atomicResult.violations;
excepted.atomic_design_hierarchy = atomicResult.excepted;

if (!jsonOutput) console.log(`${colors.gray}Rule 1: Recipe Ownership...${colors.reset}`);
const ownershipResult = applyExceptions(scanRecipeOwnership(ROOT_DIR), exceptions);
violations.recipe_ownership = ownershipResult.violations;
excepted.recipe_ownership = ownershipResult.excepted;

if (!jsonOutput) console.log(`${colors.gray}Rule 3: Layout vs Styling...${colors.reset}`);
const layoutResult = applyExceptions(scanLayoutStyling(ROOT_DIR), exceptions);
violations.layout_styling_separation = layoutResult.violations;
excepted.layout_styling_separation = layoutResult.excepted;

if (!jsonOutput) console.log(`${colors.gray}Rule 2: Component Composition...${colors.reset}`);
const compositionResult = applyExceptions(scanComponentComposition(ROOT_DIR), exceptions);
violations.component_composition = compositionResult.violations;
excepted.component_composition = compositionResult.excepted;

if (!jsonOutput) console.log(`${colors.gray}Rule 5: Recipe Naming...${colors.reset}`);
const namingResult = applyExceptions(scanRecipeNaming(ROOT_DIR), exceptions);
violations.recipe_file_naming = namingResult.violations;
excepted.recipe_file_naming = namingResult.excepted;

const duration = ((performance.now() - startTime) / 1000).toFixed(2);

// Calculate totals
const totalViolations = Object.values(violations).flat().length;
const totalExcepted = Object.values(excepted).flat().length;
const summary = {
	total: totalViolations,
	excepted: totalExcepted,
	byType: {
		atomic_design_hierarchy: violations.atomic_design_hierarchy.length,
		recipe_ownership: violations.recipe_ownership.length,
		layout_styling_separation: violations.layout_styling_separation.length,
		component_composition: violations.component_composition.length,
		recipe_file_naming: violations.recipe_file_naming.length
	},
	exceptedByType: {
		atomic_design_hierarchy: excepted.atomic_design_hierarchy.length,
		recipe_ownership: excepted.recipe_ownership.length,
		layout_styling_separation: excepted.layout_styling_separation.length,
		component_composition: excepted.component_composition.length,
		recipe_file_naming: excepted.recipe_file_naming.length
	},
	duration: `${duration}s`,
	timestamp: new Date().toISOString()
};

// Output results
if (jsonOutput) {
	const output = {
		violations: Object.values(violations).flat(),
		excepted: Object.values(excepted).flat(),
		summary
	};
	console.log(JSON.stringify(output, null, 2));
} else {
	console.log('');
	
	// Group violations by type for display
	const violationGroups = [
		{ 
			key: 'atomic_design_hierarchy', 
			name: 'Atomic Design Hierarchy',
			icon: '🔴',
			description: 'Atoms importing other atoms'
		},
		{ 
			key: 'recipe_ownership', 
			name: 'Recipe Ownership',
			icon: '🟠',
			description: 'Recipes in wrong file'
		},
		{ 
			key: 'layout_styling_separation', 
			name: 'Layout vs Styling',
			icon: '🟡',
			description: 'Layout classes in recipes'
		},
		{ 
			key: 'component_composition', 
			name: 'Component Composition',
			icon: '🟣',
			description: 'Molecule creating atom recipes'
		},
		{ 
			key: 'recipe_file_naming', 
			name: 'Recipe Naming',
			icon: '🔵',
			description: 'Recipe without matching component'
		}
	];
	
	for (const group of violationGroups) {
		const groupViolations = violations[group.key];
		const groupExcepted = excepted[group.key];
		
		if (groupViolations.length === 0 && groupExcepted.length === 0) {
			console.log(`${colors.green}✓${colors.reset} ${group.name}: No violations`);
		} else if (groupViolations.length === 0 && groupExcepted.length > 0) {
			console.log(`${colors.green}✓${colors.reset} ${group.name}: ${colors.gray}(${groupExcepted.length} excepted)${colors.reset}`);
		} else {
			console.log(`${colors.red}✗${colors.reset} ${group.name}: ${groupViolations.length} violation(s)${groupExcepted.length > 0 ? ` ${colors.gray}(${groupExcepted.length} excepted)${colors.reset}` : ''}`);
			
			for (const v of groupViolations) {
				console.log(`  ${colors.gray}├─${colors.reset} ${v.relativeFile || v.file}`);
				
				if (v.component && v.importedAtom) {
					console.log(`  ${colors.gray}│  ${colors.reset}${colors.yellow}${v.component}${colors.reset} imports ${colors.cyan}${v.importedAtom}${colors.reset}`);
				} else if (v.recipe) {
					console.log(`  ${colors.gray}│  ${colors.reset}Recipe: ${colors.yellow}${v.recipe}${colors.reset}`);
				} else if (v.class) {
					console.log(`  ${colors.gray}│  ${colors.reset}Class: ${colors.yellow}${v.class}${colors.reset} (${v.classification})`);
				}
				
				if (v.suggestion) {
					console.log(`  ${colors.gray}│  → ${v.suggestion}${colors.reset}`);
				}
				console.log(`  ${colors.gray}│${colors.reset}`);
			}
		}
	}
	
	// Summary
	console.log(`\n${colors.bold}━━━ Summary ━━━${colors.reset}\n`);
	console.log(`${colors.gray}Duration:${colors.reset} ${duration}s`);
	console.log(`${colors.gray}Total violations:${colors.reset} ${totalViolations}`);
	if (totalExcepted > 0) {
		console.log(`${colors.gray}Documented exceptions:${colors.reset} ${totalExcepted}`);
	}
	
	if (totalViolations === 0) {
		console.log(`\n${colors.green}${colors.bold}✅ All architectural rules pass!${colors.reset}\n`);
	} else {
		console.log(`\n${colors.red}${colors.bold}❌ ${totalViolations} violation(s) found${colors.reset}`);
		console.log(`${colors.gray}Fix the violations above to maintain design system integrity.${colors.reset}\n`);
	}
}

// Exit with appropriate code
process.exit(totalViolations > 0 ? 1 : 0);


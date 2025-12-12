/**
 * Algorithm 4: Atomic Design Hierarchy Violation Detection
 *
 * Rule: Atoms don't compose other atoms (they're smallest building blocks)
 * Violation: Atom importing another atom (should be molecule)
 */

import {
	extractImports,
	getComponentType,
	getComponentName,
	isStoryFile
} from '../parsers/svelte-parser.js';
import { findComponentFiles, relativePath } from '../utils/file-finder.js';

/**
 * Detect atomic hierarchy violations in a single file
 * @param {string} filePath - Path to Svelte component
 * @param {string} rootDir - Project root directory
 * @returns {Array<{
 *   type: 'atomic_design_hierarchy',
 *   component: string,
 *   componentType: string,
 *   importedAtom: string,
 *   file: string,
 *   relativeFile: string,
 *   line: number,
 *   suggestion: string
 * }>}
 */
export function detectAtomicHierarchyViolations(filePath, rootDir) {
	const componentType = getComponentType(filePath);
	const componentName = getComponentName(filePath);

	// Only check atoms
	if (componentType !== 'atom') {
		return [];
	}

	// Skip story files
	if (isStoryFile(filePath)) {
		return [];
	}

	const imports = extractImports(filePath);
	const atomImports = imports.filter((imp) => imp.isAtomImport);

	const violations = [];

	for (const atomImport of atomImports) {
		// Get imported atom names (filter out self-imports, types, etc.)
		const importedAtoms = atomImport.namedImports.filter(
			(name) =>
				name !== componentName && // Not self-import
				name !== 'index' && // Not index re-export
				!name.endsWith('Props') && // Not type import
				!name.endsWith('Variants') && // Not type import
				!name.startsWith('type ') && // Not type-only import
				name[0] === name[0].toUpperCase() // Component names are PascalCase
		);

		for (const importedAtom of importedAtoms) {
			violations.push({
				type: 'atomic_design_hierarchy',
				component: componentName,
				componentType: 'atom',
				importedAtom,
				file: filePath,
				relativeFile: relativePath(rootDir, filePath),
				line: atomImport.line,
				suggestion: `Move ${componentName} to molecules/ - it composes other atoms (imports ${importedAtom})`
			});
		}
	}

	return violations;
}

/**
 * Scan all atom files for hierarchy violations
 * @param {string} rootDir - Project root directory
 * @returns {Array} Array of violations
 */
export function scanAtomicHierarchy(rootDir) {
	const atomFiles = findComponentFiles(rootDir, {
		atoms: true,
		molecules: false,
		organisms: false
	});
	const allViolations = [];

	for (const filePath of atomFiles) {
		const violations = detectAtomicHierarchyViolations(filePath, rootDir);
		allViolations.push(...violations);
	}

	return allViolations;
}

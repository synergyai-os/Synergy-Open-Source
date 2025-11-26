/**
 * File Finder Utilities
 * 
 * Finds components, recipes, and validates file existence.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Convert camelCase to PascalCase
 * @param {string} str - camelCase string
 * @returns {string} PascalCase string
 */
export function pascalCase(str) {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert PascalCase to camelCase
 * @param {string} str - PascalCase string
 * @returns {string} camelCase string
 */
export function camelCase(str) {
	if (!str) return str;
	return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Find all recipe files
 * @param {string} rootDir - Project root directory
 * @returns {string[]} Array of absolute file paths
 */
export function findRecipeFiles(rootDir) {
	const pattern = 'src/lib/design-system/recipes/**/*.recipe.ts';
	const files = glob.sync(pattern, { cwd: rootDir });
	return files.map(f => path.join(rootDir, f));
}

/**
 * Find all Svelte component files (excluding stories)
 * @param {string} rootDir - Project root directory
 * @param {Object} options - Filter options
 * @param {boolean} options.atoms - Include atoms
 * @param {boolean} options.molecules - Include molecules
 * @param {boolean} options.organisms - Include organisms
 * @returns {string[]} Array of absolute file paths
 */
export function findComponentFiles(rootDir, options = { atoms: true, molecules: true, organisms: true }) {
	const patterns = [];
	
	if (options.atoms) {
		patterns.push('src/lib/components/atoms/**/*.svelte');
	}
	if (options.molecules) {
		patterns.push('src/lib/components/molecules/**/*.svelte');
	}
	if (options.organisms) {
		patterns.push('src/lib/components/organisms/**/*.svelte');
	}
	
	const files = [];
	for (const pattern of patterns) {
		const matches = glob.sync(pattern, { 
			cwd: rootDir,
			ignore: ['**/*.stories.svelte']
		});
		files.push(...matches.map(f => path.join(rootDir, f)));
	}
	
	return files;
}

/**
 * Find a component file by name
 * @param {string} rootDir - Project root directory
 * @param {string} componentName - Component name (PascalCase or camelCase)
 * @returns {{ path: string, type: 'atom' | 'molecule' | 'organism' } | null}
 */
export function findComponentByName(rootDir, componentName) {
	const pascalName = pascalCase(componentName);
	
	const searchPaths = [
		{ path: `src/lib/components/atoms/${pascalName}.svelte`, type: 'atom' },
		{ path: `src/lib/components/molecules/${pascalName}.svelte`, type: 'molecule' },
		{ path: `src/lib/components/organisms/${pascalName}.svelte`, type: 'organism' },
	];
	
	for (const { path: relPath, type } of searchPaths) {
		const fullPath = path.join(rootDir, relPath);
		if (fs.existsSync(fullPath)) {
			return { path: fullPath, type };
		}
	}
	
	// Also check subdirectories (e.g., Card/Root.svelte)
	const subPatterns = [
		`src/lib/components/atoms/${pascalName}/*.svelte`,
		`src/lib/components/molecules/${pascalName}/*.svelte`,
		`src/lib/components/organisms/${pascalName}/*.svelte`,
	];
	
	for (const pattern of subPatterns) {
		const matches = glob.sync(pattern, { cwd: rootDir });
		if (matches.length > 0) {
			const type = pattern.includes('/atoms/') ? 'atom' 
				: pattern.includes('/molecules/') ? 'molecule' 
				: 'organism';
			return { path: path.join(rootDir, matches[0]), type };
		}
	}
	
	return null;
}

/**
 * Find recipe file for a component
 * @param {string} rootDir - Project root directory
 * @param {string} componentName - Component name
 * @returns {string | null} Recipe file path or null
 */
export function findRecipeForComponent(rootDir, componentName) {
	const camelName = camelCase(componentName);
	const recipePath = path.join(rootDir, `src/lib/design-system/recipes/${camelName}.recipe.ts`);
	
	return fs.existsSync(recipePath) ? recipePath : null;
}

/**
 * Get component type from recipe file
 * @param {string} rootDir - Project root directory
 * @param {string} recipeFileName - Recipe file name (without .recipe.ts)
 * @returns {'atom' | 'molecule' | 'organism' | 'unknown'}
 */
export function getComponentTypeFromRecipe(rootDir, recipeFileName) {
	const component = findComponentByName(rootDir, recipeFileName);
	return component ? component.type : 'unknown';
}

/**
 * Get relative path from root
 * @param {string} rootDir - Project root directory
 * @param {string} filePath - Absolute file path
 * @returns {string} Relative path
 */
export function relativePath(rootDir, filePath) {
	return path.relative(rootDir, filePath);
}

/**
 * Check if a path exists
 * @param {string} filePath - Path to check
 * @returns {boolean}
 */
export function fileExists(filePath) {
	return fs.existsSync(filePath);
}


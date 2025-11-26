/**
 * Algorithm 5: Recipe File Naming Violation Detection
 * 
 * Rule: Recipe file name must match component name
 * Violation: workspace.recipe.ts for WorkspaceSelector.svelte
 */

import { getRecipeFileName } from '../parsers/recipe-parser.js';
import { findRecipeFiles, findComponentByName, relativePath, pascalCase } from '../utils/file-finder.js';

/**
 * Detect recipe naming violations in a single recipe file
 * @param {string} filePath - Path to recipe file
 * @param {string} rootDir - Project root directory
 * @returns {Array<{
 *   type: 'recipe_file_naming',
 *   recipeFile: string,
 *   file: string,
 *   relativeFile: string,
 *   suggestion: string
 * }>}
 */
export function detectRecipeNamingViolations(filePath, rootDir) {
	const recipeFileName = getRecipeFileName(filePath);
	
	// Skip index.ts
	if (recipeFileName === 'index') {
		return [];
	}
	
	// Find matching component
	const component = findComponentByName(rootDir, recipeFileName);
	
	if (!component) {
		return [{
			type: 'recipe_file_naming',
			recipeFile: recipeFileName,
			file: filePath,
			relativeFile: relativePath(rootDir, filePath),
			suggestion: `No component found for recipe '${recipeFileName}' - expected ${pascalCase(recipeFileName)}.svelte in atoms/, molecules/, or organisms/`
		}];
	}
	
	return [];
}

/**
 * Scan all recipe files for naming violations
 * @param {string} rootDir - Project root directory
 * @returns {Array} Array of violations
 */
export function scanRecipeNaming(rootDir) {
	const recipeFiles = findRecipeFiles(rootDir);
	const allViolations = [];
	
	for (const filePath of recipeFiles) {
		const violations = detectRecipeNamingViolations(filePath, rootDir);
		allViolations.push(...violations);
	}
	
	return allViolations;
}


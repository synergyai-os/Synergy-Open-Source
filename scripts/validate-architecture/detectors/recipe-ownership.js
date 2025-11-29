/**
 * Algorithm 1: Recipe Ownership Violation Detection
 *
 * Rule: Recipes must belong to the component they style
 * Violation: Recipe for component X in component Y's recipe file
 */

import {
	extractRecipeExports,
	getRecipeFileName,
	extractComponentFromRecipe
} from '../parsers/recipe-parser.js';
import {
	findRecipeFiles,
	findComponentByName,
	relativePath,
	pascalCase
} from '../utils/file-finder.js';

/**
 * Detect recipe ownership violations in a single recipe file
 * @param {string} filePath - Path to recipe file
 * @param {string} rootDir - Project root directory
 * @returns {Array<{
 *   type: 'recipe_ownership',
 *   recipe: string,
 *   expectedOwner: string,
 *   actualOwner: string,
 *   file: string,
 *   relativeFile: string,
 *   line: number,
 *   suggestion: string
 * }>}
 */
export function detectRecipeOwnershipViolations(filePath, rootDir) {
	const recipeFileName = getRecipeFileName(filePath);
	const recipes = extractRecipeExports(filePath);

	const violations = [];

	for (const { name: recipeName, line } of recipes) {
		const { componentName, isSubComponent, isEmbeddedComponent } = extractComponentFromRecipe(
			recipeName,
			recipeFileName
		);

		// Primary recipe or sub-component recipe - no violation
		if (componentName === recipeFileName || isSubComponent) {
			continue;
		}

		// Embedded component recipe (e.g., workspaceSelectorAvatarRecipe) - VIOLATION
		if (isEmbeddedComponent) {
			violations.push({
				type: 'recipe_ownership',
				recipe: recipeName,
				expectedOwner: componentName,
				actualOwner: recipeFileName,
				file: filePath,
				relativeFile: relativePath(rootDir, filePath),
				line,
				suggestion: `Move '${recipeName}' to ${componentName}.recipe.ts, or pass styling to ${pascalCase(componentName)} via class prop`
			});
			continue;
		}

		// Check if this recipe name suggests a different component
		// e.g., buttonRecipe in workspaceSelector.recipe.ts
		if (componentName !== recipeFileName) {
			const targetComponent = findComponentByName(rootDir, componentName);

			if (targetComponent) {
				violations.push({
					type: 'recipe_ownership',
					recipe: recipeName,
					expectedOwner: componentName,
					actualOwner: recipeFileName,
					file: filePath,
					relativeFile: relativePath(rootDir, filePath),
					line,
					suggestion: `Recipe '${recipeName}' should be in ${componentName}.recipe.ts (found ${pascalCase(componentName)}.svelte)`
				});
			}
		}
	}

	return violations;
}

/**
 * Scan all recipe files for ownership violations
 * @param {string} rootDir - Project root directory
 * @returns {Array} Array of violations
 */
export function scanRecipeOwnership(rootDir) {
	const recipeFiles = findRecipeFiles(rootDir);
	const allViolations = [];

	for (const filePath of recipeFiles) {
		const violations = detectRecipeOwnershipViolations(filePath, rootDir);
		allViolations.push(...violations);
	}

	return allViolations;
}

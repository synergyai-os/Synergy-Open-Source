/**
 * Algorithm 2: Component Composition Violation Detection
 * 
 * Rule: Molecules compose atoms by passing classes via class prop, not creating atom recipes
 * Violation: Creating avatarRecipe in molecule's recipe file
 */

import { extractImports, getComponentType, getComponentName, isStoryFile } from '../parsers/svelte-parser.js';
import { extractRecipeExports, getRecipeFileName } from '../parsers/recipe-parser.js';
import { findComponentFiles, findRecipeForComponent, relativePath, camelCase } from '../utils/file-finder.js';
import fs from 'fs';

/**
 * Detect component composition violations in a single component
 * @param {string} filePath - Path to Svelte component
 * @param {string} rootDir - Project root directory
 * @returns {Array<{
 *   type: 'component_composition',
 *   component: string,
 *   componentType: string,
 *   atom: string,
 *   recipe: string,
 *   file: string,
 *   relativeFile: string,
 *   suggestion: string
 * }>}
 */
export function detectComponentCompositionViolations(filePath, rootDir) {
	const componentType = getComponentType(filePath);
	const componentName = getComponentName(filePath);
	
	// Only check molecules and organisms
	if (!['molecule', 'organism'].includes(componentType)) {
		return [];
	}
	
	// Skip story files
	if (isStoryFile(filePath)) {
		return [];
	}
	
	// Find recipe file for this component
	const recipeFilePath = findRecipeForComponent(rootDir, componentName);
	if (!recipeFilePath) {
		return []; // No recipe file, no violation possible
	}
	
	// Get atom imports from component
	const imports = extractImports(filePath);
	const atomImports = imports
		.filter(imp => imp.isAtomImport)
		.flatMap(imp => imp.namedImports)
		.filter(name => 
			!name.endsWith('Props') && 
			!name.endsWith('Variants') &&
			name[0] === name[0].toUpperCase()
		);
	
	if (atomImports.length === 0) {
		return []; // No atom imports, no violation possible
	}
	
	// Get recipe exports
	const recipes = extractRecipeExports(recipeFilePath);
	const recipeNames = recipes.map(r => r.name.toLowerCase());
	
	const violations = [];
	const componentNameLower = componentName.toLowerCase();
	
	for (const atom of atomImports) {
		// Check for pattern: componentNameAtomRecipe
		// e.g., workspaceSelectorAvatarRecipe for Avatar in WorkspaceSelector
		const atomRecipePattern = `${componentNameLower}${atom.toLowerCase()}recipe`;
		
		if (recipeNames.includes(atomRecipePattern)) {
			const matchingRecipe = recipes.find(r => r.name.toLowerCase() === atomRecipePattern);
			
			violations.push({
				type: 'component_composition',
				component: componentName,
				componentType,
				atom,
				recipe: matchingRecipe?.name || atomRecipePattern,
				file: filePath,
				relativeFile: relativePath(rootDir, filePath),
				recipeFile: relativePath(rootDir, recipeFilePath),
				suggestion: `Remove '${matchingRecipe?.name}' from ${camelCase(componentName)}.recipe.ts - pass styling to ${atom} via class prop instead`
			});
		}
	}
	
	return violations;
}

/**
 * Scan all molecule/organism files for composition violations
 * @param {string} rootDir - Project root directory
 * @returns {Array} Array of violations
 */
export function scanComponentComposition(rootDir) {
	const componentFiles = findComponentFiles(rootDir, { atoms: false, molecules: true, organisms: true });
	const allViolations = [];
	
	for (const filePath of componentFiles) {
		const violations = detectComponentCompositionViolations(filePath, rootDir);
		allViolations.push(...violations);
	}
	
	return allViolations;
}

